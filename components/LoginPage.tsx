'use client';

import { useState } from 'react';
import { LogIn, Loader2 } from 'lucide-react';

interface LoginPageProps {
    onLogin: (ine: string, studentName: string, semesters: Array<{ id: string; label: string }>) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
    const [ine, setIne] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ine }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to login');
            }

            onLogin(ine, data.studentName, data.semesters);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                            <LogIn className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes Notes</h1>
                        <p className="text-gray-600 font-medium">Consultez vos notes IUT</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="ine" className="block text-sm font-semibold text-gray-700 mb-2">
                                Numéro INE
                            </label>
                            <input
                                id="ine"
                                type="text"
                                value={ine}
                                onChange={(e) => setIne(e.target.value)}
                                placeholder="Entrez votre INE"
                                className="w-full px-4 py-3 bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                                required
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !ine}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-md"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Connexion...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Se connecter
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                        <p className="text-xs text-gray-500">
                            Crée par <a href="https://www.linkedin.com/in/sofiane-zemrani" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium">Sofiane Zemrani</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
