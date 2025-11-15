import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  // Key is used to force-remount ChatWindow on "New Chat"
  const [chatSessionId, setChatSessionId] = useState(Date.now());

  const handleNewChat = () => {
    setChatSessionId(Date.now());
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-200 font-sans transition-colors duration-300">
      <Sidebar onNewChat={handleNewChat} />
      <main className="flex-1 flex flex-col">
        <ChatWindow key={chatSessionId} />
      </main>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
};


export default App;