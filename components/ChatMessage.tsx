import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { AsilbekAiIcon, UserIcon, CopyIcon, CheckIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

declare const hljs: any;

interface CodeBlockProps {
    code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
    const [copied, setCopied] = useState(false);
    const { t } = useLanguage();
    const codeRef = useRef<HTMLElement>(null);

    const languageMatch = code.match(/^[a-zA-Z]+\n/);
    const language = languageMatch ? languageMatch[0].trim() : '';
    const codeToDisplay = languageMatch ? code.substring(languageMatch[0].length) : code;

    useEffect(() => {
        if (codeRef.current && typeof hljs !== 'undefined') {
            hljs.highlightElement(codeRef.current);
        }
    }, [codeToDisplay]);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeToDisplay);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-slate-950 rounded-lg my-2 overflow-hidden shadow-md">
            <div className="flex justify-between items-center px-4 py-1.5 bg-slate-800">
                <span className="text-xs font-sans text-gray-400 capitalize">{language || t('code')}</span>
                <button onClick={handleCopy} className="flex items-center text-xs text-gray-400 hover:text-white transition-colors">
                    {copied ? (
                        <>
                            <CheckIcon className="w-4 h-4 mr-1" />
                            {t('copied')}
                        </>
                    ) : (
                        <>
                            <CopyIcon className="w-4 h-4 mr-1" />
                            {t('copyCode')}
                        </>
                    )}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm">
                <code ref={codeRef} className={`hljs ${language && `language-${language}`}`}>
                    {codeToDisplay}
                </code>
            </pre>
        </div>
    );
};


const renderTextWithCodeBlocks = (text: string) => {
    if (!text) return null;

    const parts = text.split(/(\`\`\`[\s\S]*?\`\`\`)/g);
    return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
            const code = part.slice(3, -3).trim();
            return <CodeBlock key={index} code={code} />;
        }
        // Basic markdown for bold text **text**
        const boldParts = part.split(/(\*\*[\s\S]*?\*\*)/g);
        return <span key={index}>{
            boldParts.map((boldPart, boldIndex) => {
                if(boldPart.startsWith('**') && boldPart.endsWith('**')) {
                    return <strong key={boldIndex}>{boldPart.slice(2, -2)}</strong>
                }
                return boldPart;
            })
        }</span>;
    });
};


export const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const { role, parts } = message;
  const { t } = useLanguage();
  const isModel = role === 'model';

  return (
    <div className={`flex items-start gap-4 my-6 ${isModel ? '' : 'flex-row-reverse'}`}>
      <div className="flex-shrink-0">
        {isModel ? (
          <AsilbekAiIcon className="w-8 h-8" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
        )}
      </div>
      <div className={`flex-grow p-4 rounded-lg ${isModel ? 'bg-slate-100 dark:bg-slate-800' : 'bg-indigo-600'}`}>
        <div className={`prose prose-invert max-w-none leading-relaxed ${isModel ? 'text-slate-800 dark:text-gray-200' : 'text-white'}`}>
            {parts.map((part, index) => (
                <div key={index}>
                    {part.text && <div style={{ whiteSpace: 'pre-wrap' }}>{renderTextWithCodeBlocks(part.text)}</div>}
                    {part.image && <img src={part.image} alt="Generated content" className="mt-2 rounded-lg max-w-sm" />}
                    {part.searchResults && part.searchResults.length > 0 && (
                        <div className="mt-4 border-t border-slate-300 dark:border-slate-700 pt-2">
                            <h4 className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2">{t('sources')}:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {part.searchResults.map((result, i) => result.web && (
                                    <a
                                        key={i}
                                        href={result.web.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-slate-200/50 dark:bg-slate-700/50 p-2 rounded-md truncate block"
                                        title={result.web.title}
                                    >
                                        {result.web.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};