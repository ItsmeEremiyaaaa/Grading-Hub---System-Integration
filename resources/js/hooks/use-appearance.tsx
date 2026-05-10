import { useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyTheme = (appearance: Appearance) => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());
    document.documentElement.classList.toggle('dark', isDark);
};

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'light');
};

export function initializeTheme() {
    const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'light';

    applyTheme(savedAppearance);

    mediaQuery.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('light');

    const updateAppearance = (mode: Appearance) => {
        setAppearance(mode);
        localStorage.setItem('appearance', mode);
        applyTheme(mode);
    };

    useEffect(() => {
        const savedAppearance = localStorage.getItem('appearance') as Appearance | null;
        updateAppearance(savedAppearance || 'light');

        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }, []);

    return { appearance, updateAppearance };
}