import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';
import qs from 'qs';

// Force dynamic mode - no caching
export const dynamic = 'force-dynamic';

interface LoginResponse {
    studentName: string;
    semesters: Array<{
        id: string;
        label: string;
    }>;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { ine } = body;

        if (!ine || typeof ine !== 'string') {
            return NextResponse.json(
                { error: 'INE is required' },
                { status: 400 }
            );
        }

        // POST to IUT server
        const postData = qs.stringify({
            code_ine: ine,
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

        // Extract student name from second h2 (first h2 is page description)
        // Page structure: h2[0] = "Consultation des notes...", h2[1] = "STUDENT NAME", h2[2] = "Semester"
        const studentName = $('h2').eq(1).text().trim();

        if (!studentName) {
            return NextResponse.json(
                { error: 'Invalid INE or student not found' },
                { status: 404 }
            );
        }

        // Extract semesters from select[name="sem"] option
        const semesters: Array<{ id: string; label: string }> = [];
        $('select[name="sem"] option').each((_, element) => {
            const $option = $(element);
            const value = $option.attr('value');
            const text = $option.text().trim();

            // Exclude empty options
            if (value && text) {
                semesters.push({
                    id: value,
                    label: text,
                });
            }
        });

        const result: LoginResponse = {
            studentName,
            semesters,
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch student data' },
            { status: 500 }
        );
    }
}
