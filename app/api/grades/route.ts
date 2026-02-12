import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';
import qs from 'qs';

// Force dynamic mode - no caching
export const dynamic = 'force-dynamic';

interface Evaluation {
    name: string;
    grade: string; // Can be "~" for missing grades
    coefficient: number;
    date: string; // ISO format timestamp
}

interface Module {
    code: string;
    name: string;
    grade: string; // Can be "~" for missing grades
    coefficient: number;
    evaluations: Evaluation[];
}

interface UE {
    name: string;
    average: string;
    modules: Module[];
}

interface RecentGrade {
    evaluationName: string;
    moduleName: string;
    moduleCode: string;
    ueName: string;
    grade: string;
    coefficient: number;
    date: string;
}

interface GradesResponse {
    ues: UE[];
    recentGrades: RecentGrade[];
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { ine, semesterId } = body;

        if (!ine || typeof ine !== 'string') {
            return NextResponse.json(
                { error: 'INE is required' },
                { status: 400 }
            );
        }

        if (!semesterId || typeof semesterId !== 'string') {
            return NextResponse.json(
                { error: 'Semester ID is required' },
                { status: 400 }
            );
        }

        // POST to IUT server
        const postData = qs.stringify({
            code_ine: ine,
            sem: semesterId,
            ok: 'Valider'
        });

        const response = await axios.post(
            'http://194.57.179.42/abs/pt.php',
            postData,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                responseType: 'arraybuffer', // Get raw bytes
            }
        );

        // Decode ISO-8859-1 to UTF-8
        const html = iconv.decode(Buffer.from(response.data), 'ISO-8859-1');

        // Parse with Cheerio
        const $ = cheerio.load(html);

        // Parse rows sequentially to correctly group evaluations under modules under UEs
        const ues: UE[] = [];
        const allEvaluations: RecentGrade[] = [];
        let currentUE: UE | null = null;
        let currentModule: Module | null = null;

        // IMPORTANT: Parse all table rows in document order
        // This ensures evaluations are assigned to the correct module
        $('table.notes_bulletin tr').each((_, row) => {
            const $row = $(row);

            // Check if this is a UE row
            if ($row.hasClass('notes_bulletin_row_ue')) {
                const tds = $row.find('td');
                if (tds.length < 6) return;

                // Extract UE name from first column
                const ueName = $(tds[0]).text().trim().replace(/\[-\]/g, '').trim();

                // Extract UE average from 6th column (index 5)
                const ueAverage = $(tds[5]).text().trim();

                // Create new UE and set as current
                currentUE = {
                    name: ueName,
                    average: ueAverage,
                    modules: []
                };
                ues.push(currentUE);
                currentModule = null; // Reset module when entering new UE
            }
            // Check if this is a module row
            else if ($row.hasClass('notes_bulletin_row_mod')) {
                // Only add module if we have a current UE
                if (!currentUE) return;

                const tds = $row.find('td');
                if (tds.length < 7) return;

                // Extract module data
                // td[1] = Module code
                const moduleCode = $(tds[1]).text().trim().replace(/\[\+\]/g, '').trim();

                // td[2] = Module name
                const moduleName = $(tds[2]).text().trim();

                // td[5] = Grade (can be "~" for missing)
                let gradeText = $(tds[5]).text().trim();
                if (!gradeText) {
                    gradeText = '~';
                }

                // td[6] = Coefficient
                const coefText = $(tds[6]).text().trim();
                const coefficient = coefText ? parseFloat(coefText.replace(',', '.')) : 0;

                // Create new Module and set as current
                if (moduleCode && moduleName) {
                    currentModule = {
                        code: moduleCode,
                        name: moduleName,
                        grade: gradeText,
                        coefficient: isNaN(coefficient) ? 0 : coefficient,
                        evaluations: []
                    };
                    currentUE.modules.push(currentModule);
                }
            }
            // Check if this is an evaluation row
            else if ($row.hasClass('notes_bulletin_row_eval')) {
                // Only add evaluation if we have a current module and UE
                if (!currentModule || !currentUE) return;

                const tds = $row.find('td');
                if (tds.length < 7) return;

                // Extract evaluation data
                // td[3] = Evaluation name
                const evalName = $(tds[3]).text().trim();

                // td[4] = Date (ISO format)
                const evalDate = $(tds[4]).text().trim();

                // td[5] = Grade
                let evalGrade = $(tds[5]).text().trim();
                if (!evalGrade) {
                    evalGrade = '~';
                }

                // td[6] = Coefficient (often in parentheses like "(01.00)")
                const evalCoefText = $(tds[6]).text().trim().replace(/[()]/g, '');
                const evalCoef = evalCoefText ? parseFloat(evalCoefText.replace(',', '.')) : 0;

                // Add evaluation to current module
                if (evalName) {
                    const evaluation: Evaluation = {
                        name: evalName,
                        grade: evalGrade,
                        coefficient: isNaN(evalCoef) ? 0 : evalCoef,
                        date: evalDate
                    };
                    currentModule.evaluations.push(evaluation);

                    // Also add to global recent grades list (only if grade is not missing)
                    if (evalGrade !== '~' && evalDate) {
                        allEvaluations.push({
                            evaluationName: evalName,
                            moduleName: currentModule.name,
                            moduleCode: currentModule.code,
                            ueName: currentUE.name,
                            grade: evalGrade,
                            coefficient: evaluation.coefficient,
                            date: evalDate
                        });
                    }
                }
            }
        });

        // Sort recent grades by date (most recent first) and limit to 10
        const recentGrades = allEvaluations
            .sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return dateB - dateA; // Descending order (newest first)
            })
            .slice(0, 10);

        const result: GradesResponse = {
            ues,
            recentGrades
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('Grades fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch grades' },
            { status: 500 }
        );
    }
}
