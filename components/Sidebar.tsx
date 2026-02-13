'use client';

import { GraduationCap, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
    studentName: string;
    onLogout: () => void;
}

export default function Sidebar({ studentName, onLogout }: SidebarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Get student initials
    const getInitials = (name: string) => {
        const parts = name.split(' ').filter(Boolean);
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return parts[0]?.substring(0, 2).toUpperCase() || 'ME';
    };

    const initials = getInitials(studentName);

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white z-50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg">Mes Notes</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    {isMobileMenuOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 pt-14"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div
                        className="bg-slate-900 w-64 h-full p-6 space-y-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Student Avatar */}
                        <div className="flex flex-col items-center gap-3 pb-6 border-b border-slate-700">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xl">{initials}</span>
                            </div>
                            <div className="text-center">
                                <p className="text-white font-semibold">{studentName}</p>
                                <p className="text-slate-400 text-sm">Étudiant</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="space-y-2">
                            <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800 text-white rounded-lg">
                                <LayoutDashboard className="w-5 h-5" />
                                <span className="font-medium">Notes</span>
                            </button>
                        </nav>

                        {/* Logout */}
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex-col p-6 space-y-6">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-xl">Mes Notes</span>
                </div>

                {/* Student Avatar */}
                <div className="flex flex-col items-center gap-3 py-6 border-b border-slate-700">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">{initials}</span>
                    </div>
                    <div className="text-center">
                        <p className="text-white font-semibold">{studentName}</p>
                        <p className="text-slate-400 text-sm">Étudiant</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800 text-white rounded-lg">
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-medium">Notes</span>
                    </button>
                </nav>

                {/* Logout */}
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Déconnexion</span>
                </button>
            </aside>
        </>
    );
}
