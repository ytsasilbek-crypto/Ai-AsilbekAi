import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chat } from '@google/genai';
import { GenerateContentResponse } from '@google/genai';
import { startChat, generateImage } from '../services/geminiService';
import { Message, GroundingChunk } from '../types';
import { ChatMessage } from './ChatMessage';
import { SendIcon, AsilbekAiIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

const ChatWindow: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatSession = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

    useEffect(() => {
        chatSession.current = startChat();
        setMessages([
            {
                id: 'initial',
                role: 'model',
                parts: [{ text: t('initialMessage') }],
            }
        ]);
    }, [t]); // Add 't' as a dependency to update initial message on language change

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleSend = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            parts: [{ text: input }],
        };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        const drawRegexEn = /^(?:draw|create|generate)\s+(.*)/i;
        const drawRegexUz = /^(?:chiz|yarating)\s+(.*)/i;
        const isDrawCommand = drawRegexEn.test(currentInput) || drawRegexUz.test(currentInput);

        if (isDrawCommand) {
            const match = currentInput.match(drawRegexEn) || currentInput.match(drawRegexUz);
            const prompt = match![1];
            try {
                const imageUrl = await generateImage(prompt);
                const modelMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'model',
                    parts: [{ text: t('imageResponse').replace('{prompt}', prompt), image: imageUrl }],
                };
                setMessages(prev => [...prev, modelMessage]);
            } catch (error) {
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'model',
                    parts: [{ text: error instanceof Error ? error.message : "An unknown error occurred." }],
                };
                setMessages(prev => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        if (!chatSession.current) {
            console.error("Chat session not initialized");
            setIsLoading(false);
            return;
        }

        try {
            const stream = await chatSession.current.sendMessageStream({ message: currentInput });
            
            let modelResponseText = '';
            let modelMessageId = (Date.now() + 1).toString();
            let groundingChunks: GroundingChunk[] = [];

            setMessages(prev => [
                ...prev, 
                { id: modelMessageId, role: 'model', parts: [{ text: '' }] }
            ]);

            for await (const chunk of stream) {
                const c = chunk as GenerateContentResponse;
                modelResponseText += c.text;
                setMessages(prev => prev.map(msg => 
                    msg.id === modelMessageId ? { ...msg, parts: [{ text: modelResponseText }] } : msg
                ));

                if (c.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                     groundingChunks = c.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[];
                }
            }

             setMessages(prev => prev.map(msg => 
                msg.id === modelMessageId 
                    ? { ...msg, parts: [{ text: modelResponseText, searchResults: groundingChunks }] } 
                    : msg
            ));

        } catch (error) {
            console.error(error);
             const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                parts: [{ text: t('error') }],
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, t]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 transition-colors duration-300">
            <header className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <AsilbekAiIcon className="w-8 h-8" />
                <div>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">AsilbekAi</h1>
                    <p className="text-xs text-green-500 dark:text-green-400">{t('online')}</p>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto">
                    {messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
                    {isLoading && (
                       <div className="flex items-start gap-4 my-6">
                            <AsilbekAiIcon className="w-8 h-8 flex-shrink-0" />
                            <div className="flex-grow p-4 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse">
                                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto">
                    <div className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={t('inputPlaceholder')}
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-4 pr-12 text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-colors duration-300"
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                                isLoading || !input.trim()
                                    ? 'bg-slate-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                            }`}
                            disabled={isLoading || !input.trim()}
                        >
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">{t('disclaimer')}</p>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;