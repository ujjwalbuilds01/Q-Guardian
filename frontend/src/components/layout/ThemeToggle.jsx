import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check local storage or system preference on load
        const storedTheme = localStorage.getItem('pnb-theme');
        if (storedTheme === 'dark') {
            setIsDark(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        } else if (storedTheme === 'light') {
            setIsDark(false);
            document.documentElement.removeAttribute('data-theme');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // Optional: fallback to system pref, but light is default
            // setIsDark(true);
            // document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

    const toggleTheme = () => {
        setIsDark(prev => {
            const nextMode = !prev;
            if (nextMode) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('pnb-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('pnb-theme', 'light');
            }
            return nextMode;
        });
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black/10 transition-colors text-white"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
};

export default ThemeToggle;
