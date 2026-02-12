'use client';

import { useState } from 'react';
import LoginPage from '@/components/LoginPage';
import Dashboard from '@/components/Dashboard';

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [ine, setIne] = useState('');
    const [studentName, setStudentName] = useState('');
    const [semesters, setSemesters] = useState<Array<{ id: string; label: string }>>([]);

    const handleLogin = (
        userIne: string,
        name: string,
        userSemesters: Array<{ id: string; label: string }>
    ) => {
        setIne(userIne);
        setStudentName(name);
        setSemesters(userSemesters);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setIne('');
        setStudentName('');
        setSemesters([]);
    };

    return (
        <>
            {!isLoggedIn ? (
                <LoginPage onLogin={handleLogin} />
            ) : (
                <Dashboard
                    ine={ine}
                    studentName={studentName}
                    semesters={semesters}
                    onLogout={handleLogout}
                />
            )}
        </>
    );
}
