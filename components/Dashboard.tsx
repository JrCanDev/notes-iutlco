'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Loader2, ChevronDown, Calendar } from 'lucide-react';
import Sidebar from './Sidebar';

interface Evaluation {
    name: string;
    grade: string;
    coefficient: number;
    date: string;
}

interface Module {
    code: string;
    name: string;
    grade: string; // Can be "~" for missing grades
    coefficient: number;
    evaluations: Evaluation[];
    isExpanded?: boolean; // For UI state
}

interface UE {
    name: string;
    average: string;
    modules: Module[];
    isExpanded: boolean; // For UI state
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

interface DashboardProps {
    ine: string;
    studentName: string;
    semesters: Array<{ id: string; label: string }>;
    onLogout: () => void;
}

export default function Dashboard({ ine, studentName, semesters, onLogout }: DashboardProps) {
    // Select the most recent semester (last in the list) by default
    const [selectedSemester, setSelectedSemester] = useState(semesters[semesters.length - 1]?.id || '');
    const [ues, setUes] = useState<UE[]>([]);
    const [recentGrades, setRecentGrades] = useState<RecentGrade[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (selectedSemester) {
            fetchGrades();
        }
    }, [selectedSemester]);

    const fetchGrades = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/grades', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ine, semesterId: selectedSemester }),
            });

            if (!response.ok) {
                throw new Error(`Erreur: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Set UEs collapsed by default
            const uesWithState = (data.ues || []).map((ue: UE) => ({
                ...ue,
                isExpanded: false,
                modules: ue.modules.map(mod => ({
                    ...mod,
                    isExpanded: false
                }))
            }));

            setUes(uesWithState);
            setRecentGrades(data.recentGrades || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const calculateGPA = () => {
        let totalPoints = 0;
        let totalCoefs = 0;

        ues.forEach(ue => {
            ue.modules.forEach(module => {
                if (module.grade !== '~') {
                    const grade = parseFloat(module.grade.replace(',', '.'));
                    if (!isNaN(grade)) {
                        totalPoints += grade * module.coefficient;
                        totalCoefs += module.coefficient;
                    }
                }
            });
        });

        return totalCoefs > 0 ? totalPoints / totalCoefs : 0;
    };

    const toggleUE = (index: number) => {
        setUes(prev => prev.map((ue, i) =>
            i === index ? { ...ue, isExpanded: !ue.isExpanded } : ue
        ));
    };

    const toggleModule = (ueIndex: number, moduleIndex: number) => {
        setUes(prev => prev.map((ue, uIdx) =>
            uIdx === ueIndex ? {
                ...ue,
                modules: ue.modules.map((mod, mIdx) =>
                    mIdx === moduleIndex ? { ...mod, isExpanded: !mod.isExpanded } : mod
                )
            } : ue
        ));
    };

    const formatDate = (isoDate: string) => {
        if (!isoDate) return '';
        try {
            const date = new Date(isoDate);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return '';
        }
    };

    const gpa = calculateGPA();
    const isPassingGPA = gpa >= 10;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar
                studentName={studentName}
                initials={getInitials(studentName)}
                onLogout={onLogout}
            />

            <div className="flex-1 overflow-y-auto ml-64">
                <div className="max-w-7xl mx-auto p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Bonjour {studentName} 👋
                        </h1>
                        <p className="text-gray-600">Bienvenue sur votre tableau de bord</p>
                    </div>

                    {/* Semester Selector */}
                    <div className="mb-6">
                        <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                            Sélectionner un semestre
                        </label>
                        <select
                            id="semester"
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {semesters.map(sem => (
                                <option key={sem.id} value={sem.id}>
                                    {sem.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {loading && (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="animate-spin text-blue-600" size={48} />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {!loading && !error && ues.length > 0 && (
                        <>
                            {/* GPA Card */}
                            <div className={`${isPassingGPA ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200' : 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200'} rounded-2xl p-8 shadow-lg border mb-8`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">MOYENNE GÉNÉRALE</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-6xl font-bold ${isPassingGPA ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {gpa.toFixed(2)}
                                            </span>
                                            <span className="text-2xl text-gray-500">/20</span>
                                        </div>
                                        <div className="mt-4">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Progression</span>
                                                <span className="text-gray-600">{Math.round((gpa / 20) * 100)}%</span>
                                            </div>
                                            <div className="w-64 h-2 bg-white/50 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${isPassingGPA ? 'bg-emerald-600' : 'bg-rose-600'} transition-all duration-500`}
                                                    style={{ width: `${(gpa / 20) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`p-4 rounded-full ${isPassingGPA ? 'bg-emerald-200' : 'bg-rose-200'}`}>
                                        {isPassingGPA ? (
                                            <TrendingUp className="text-emerald-700" size={48} />
                                        ) : (
                                            <TrendingDown className="text-rose-700" size={48} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Grades Section */}
                            {recentGrades.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Calendar size={28} className="text-blue-600" />
                                        Notes récentes
                                    </h2>
                                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300">
                                        {recentGrades.map((grade, idx) => {
                                            const gradeValue = parseFloat(grade.grade.replace(',', '.'));
                                            const isPassing = gradeValue >= 10;

                                            return (
                                                <div
                                                    key={idx}
                                                    className="min-w-[300px] bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                        <Calendar size={14} />
                                                        {formatDate(grade.date)}
                                                    </div>
                                                    <div className="font-bold text-gray-900 mb-1 line-clamp-1">
                                                        {grade.evaluationName}
                                                    </div>
                                                    <div className="text-xs text-gray-600 mb-1">
                                                        <span className="text-blue-600 font-semibold">{grade.moduleCode}</span>
                                                        {' '}-{' '}
                                                        <span className="line-clamp-1">{grade.moduleName}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mb-3">{grade.ueName}</div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                            Coef {grade.coefficient}
                                                        </span>
                                                        <span className={`text-3xl font-bold ${isPassing ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            {grade.grade}/20
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* UE Cards */}
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Unités d'Enseignement</h2>
                                {ues.map((ue, index) => {
                                    const ueAvg = parseFloat(ue.average.replace(',', '.'));
                                    const isUEPassing = !isNaN(ueAvg) && ueAvg >= 10;

                                    return (
                                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                            {/* UE Header */}
                                            <div
                                                onClick={() => toggleUE(index)}
                                                className="p-6 cursor-pointer hover:bg-gray-50 transition-all flex justify-between items-center"
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    <ChevronDown
                                                        className={`${ue.isExpanded ? 'rotate-180' : ''} transition-transform text-gray-400`}
                                                        size={20}
                                                    />
                                                    <div>
                                                        <h3 className="font-bold text-lg text-gray-900">{ue.name}</h3>
                                                        <p className="text-sm text-gray-500">{ue.modules.length} modules</p>
                                                    </div>
                                                </div>
                                                <div className={`text-3xl font-bold ${isUEPassing ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {ue.average}/20
                                                </div>
                                            </div>

                                            {/* Modules List */}
                                            {ue.isExpanded && (
                                                <div className="px-6 pb-6 space-y-3 border-t border-gray-100 pt-4">
                                                    {ue.modules.map((module, modIndex) => {
                                                        const modGrade = parseFloat(module.grade.replace(',', '.'));
                                                        const isModulePassing = !isNaN(modGrade) && modGrade >= 10;

                                                        return (
                                                            <div key={modIndex} className="bg-gray-50 rounded-lg overflow-hidden">
                                                                {/* Module Header */}
                                                                <div
                                                                    onClick={() => toggleModule(index, modIndex)}
                                                                    className="flex justify-between items-center p-4 hover:bg-gray-100 transition-all cursor-pointer"
                                                                >
                                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                                        <ChevronDown
                                                                            className={`${module.isExpanded ? 'rotate-180' : ''} transition-transform text-gray-400 flex-shrink-0`}
                                                                            size={16}
                                                                        />
                                                                        <span className="text-blue-600 font-semibold text-sm whitespace-nowrap">{module.code}</span>
                                                                        <span className="text-gray-700 truncate">{module.name}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                                                                        {module.evaluations && module.evaluations.length > 0 && (
                                                                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                                                                {module.evaluations.length} note{module.evaluations.length > 1 ? 's' : ''}
                                                                            </span>
                                                                        )}
                                                                        <span className="text-gray-500 text-sm bg-gray-200 px-2 py-1 rounded whitespace-nowrap">
                                                                            Coef {module.coefficient}
                                                                        </span>
                                                                        <span className={`text-2xl font-bold ${module.grade === '~' ? 'text-gray-400' : isModulePassing ? 'text-emerald-600' : 'text-rose-600'} whitespace-nowrap`}>
                                                                            {module.grade}/20
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Evaluations List */}
                                                                {module.isExpanded && module.evaluations && module.evaluations.length > 0 && (
                                                                    <div className="px-4 pb-4 pl-12 space-y-2">
                                                                        {module.evaluations.map((evaluation, evalIdx) => {
                                                                            const evalGrade = parseFloat(evaluation.grade.replace(',', '.'));
                                                                            const isEvalPassing = !isNaN(evalGrade) && evalGrade >= 10;

                                                                            return (
                                                                                <div
                                                                                    key={evalIdx}
                                                                                    className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
                                                                                >
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="font-medium text-sm text-gray-900 truncate">
                                                                                            {evaluation.name}
                                                                                        </div>
                                                                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                                                            <Calendar size={12} />
                                                                                            {formatDate(evaluation.date)}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                                                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                                                            Coef {evaluation.coefficient}
                                                                                        </span>
                                                                                        <span className={`text-xl font-bold ${evaluation.grade === '~' ? 'text-gray-400' : isEvalPassing ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                                                            {evaluation.grade}/20
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {!loading && !error && ues.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            Aucune note disponible pour ce semestre
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
