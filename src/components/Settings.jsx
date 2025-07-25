import React, { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

const Settings = () => {
    const [theme, setTheme] = useState('light')

    // Load theme from localStorage on component mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light'
        setTheme(savedTheme)
        applyTheme(savedTheme)
    }, [])

    // Apply theme changes to the document
    const applyTheme = (newTheme) => {
        const root = document.documentElement

        if (newTheme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
    }

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
        applyTheme(newTheme)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400">Customize your ESG Co-Pilot experience</p>
            </div>

            {/* Theme Settings */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Theme</h2>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleThemeChange('light')}
                        className={`flex items-center justify-center p-4 rounded-lg border-2 transition-colors ${theme === 'light'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        <Sun className="h-6 w-6 mr-3 text-yellow-500" />
                        <span className="text-lg font-medium text-gray-900 dark:text-white">Light</span>
                    </button>

                    <button
                        onClick={() => handleThemeChange('dark')}
                        className={`flex items-center justify-center p-4 rounded-lg border-2 transition-colors ${theme === 'dark'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        <Moon className="h-6 w-6 mr-3 text-blue-400" />
                        <span className="text-lg font-medium text-gray-900 dark:text-white">Dark</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Settings