import React, { useState } from 'react';
import { PlusIcon, SettingsIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import SettingsModal from './SettingsModal';

interface SidebarProps {
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewChat }) => {
  const { t } = useLanguage();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <div className="w-64 bg-slate-100 dark:bg-slate-950 p-4 border-r border-slate-200 dark:border-slate-800 flex-col hidden md:flex transition-colors duration-300">
        <div className="flex-1">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            {t('newChat')}
          </button>
          <div className="mt-8">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">{t('chatHistory')}</h2>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center p-4 bg-slate-200 dark:bg-slate-800/50 rounded-lg">
                  {t('historyInfo')}
              </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 bg-slate-200 dark:bg-slate-800 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
                <SettingsIcon className="w-5 h-5" />
                {t('settings')}
            </button>
        </div>
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

export default Sidebar;