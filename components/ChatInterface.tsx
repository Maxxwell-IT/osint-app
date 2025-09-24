
import React, { useEffect, useRef } from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { UserIcon } from './icons/UserIcon';
import type { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSelectMessage: (message: ChatMessage) => void;
  selectedMessageId: number | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSelectMessage, selectedMessageId }) => {
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
        const isBot = message.sender === 'bot';
        const hasAnalysis = !!message.analysisData;
        const isSelected = message.id === selectedMessageId;

        const messageClasses = [
            'max-w-2xl',
            'w-full',
            'p-4',
            'rounded-lg',
            'transition-all',
            'duration-200',
        ];

        if (isBot) {
            messageClasses.push('bg-slate-800/60 backdrop-blur-xl border');
            if (hasAnalysis) {
                messageClasses.push('cursor-pointer hover:bg-slate-700/60');
                if (isSelected) {
                    messageClasses.push('border-blue-500 ring-2 ring-blue-500/50 bg-slate-700/80');
                } else {
                    messageClasses.push('border-slate-700/50');
                }
            } else {
                 messageClasses.push('border-slate-700/50');
            }
        } else {
            messageClasses.push('bg-blue-500/10 text-slate-100');
        }

        return (
            <div className={`flex items-start gap-4 ${isBot ? '' : 'justify-end'}`} onClick={() => hasAnalysis && onSelectMessage(message)}>
                 {isBot && (
                    <div className="w-10 h-10 flex-shrink-0 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                        <LogoIcon className="w-6 h-6 text-blue-500" />
                    </div>
                )}
                <div className={messageClasses.join(' ')}>
                    {typeof message.content === 'string' ? <p>{message.content}</p> : message.content}
                </div>
                {!isBot && (
                     <div className="w-10 h-10 flex-shrink-0 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                        <UserIcon className="w-6 h-6 text-slate-400" />
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((msg) => (
                <div key={msg.id} className="animate-fade-in-up">
                    <Message message={msg} />
                </div>
            ))}
            <div ref={endOfMessagesRef} />
        </div>
    );
};
