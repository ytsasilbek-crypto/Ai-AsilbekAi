import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CloseIcon } from './Icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { language, setLanguage, t } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-gray-200 rounded-lg shadow-xl w-full max-w-sm p-5 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{t('settings')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Language Settings */}
                <div>
                    <label htmlFor="language-select" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('language')}</label>
                    <select
                        id="language-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'en' | 'uz')}
                        className="w-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="en">English</option>
                        <option value="uz">O'zbekcha</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;