
import React, { useLayoutEffect, useRef, useState, useMemo } from 'react';
import type { OSINTResult } from '../types';
import { UserIcon } from './icons/UserIcon';
import { UsersIcon } from './icons/UsersIcon';
import { MailIcon } from './icons/MailIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { BreachIcon } from './icons/BreachIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { ForumIcon } from './icons/ForumIcon';
import { PasteIcon } from './icons/PasteIcon';
import { LinkIcon } from './icons/LinkIcon';
import { RegistryIcon } from './icons/RegistryIcon';
import { TelegramIcon } from './icons/TelegramIcon';


interface RelationshipGraphProps {
  target: string;
  results: OSINTResult;
  onNodeClick: (key: string, text: string) => void;
}

const Node: React.FC<{ 
    id: string; 
    children: React.ReactNode; 
    className?: string;
    onClick?: () => void;
}> = ({ id, children, className, onClick }) => {
    const commonClasses = "flex items-center gap-2 p-2 rounded-lg bg-slate-900/70 border border-slate-700 text-sm";
    const interactiveClasses = "w-full text-left transition-colors cursor-pointer hover:bg-slate-800/80 hover:border-blue-500";

    if (onClick) {
        return (
            <button id={id} onClick={onClick} className={`${commonClasses} ${interactiveClasses} ${className}`}>
                {children}
            </button>
        )
    }

    return (
        <div id={id} className={`${commonClasses} ${className}`}>
            {children}
        </div>
    )
};


const CategoryNode: React.FC<{ id: string; title: string, icon: React.ReactNode }> = ({ id, title, icon }) => (
    <div id={id} className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-full flex items-center justify-center border-2 border-blue-500/50">
            {icon}
        </div>
        <span className="font-bold text-slate-300 text-base">{title}</span>
    </div>
);


export const RelationshipGraph: React.FC<RelationshipGraphProps> = ({ target, results, onNodeClick }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [lines, setLines] = useState<React.ReactElement[]>([]);

    const dataCategories = useMemo(() => [
        { key: 'associated_entities', title: 'Особи', icon: <UsersIcon className="w-6 h-6 text-blue-400" />, data: results.associated_entities?.map(e => e.name) },
        { key: 'social_profiles', title: 'Соц. мережі', icon: <UserIcon className="w-6 h-6 text-blue-400" />, data: results.social_profiles?.map(p => p.username) },
        { key: 'emails', title: 'Emails', icon: <MailIcon className="w-6 h-6 text-blue-400" />, data: results.emails },
        { key: 'telegram_activity', title: 'Telegram', icon: <TelegramIcon className="w-6 h-6 text-blue-400" />, data: results.telegram_activity?.map(t => t.username) },
        { key: 'associated_domains', title: 'Домени', icon: <GlobeIcon className="w-6 h-6 text-blue-400" />, data: results.associated_domains },
        { key: 'data_breaches', title: 'Витоки', icon: <BreachIcon className="w-6 h-6 text-blue-400" />, data: results.data_breaches?.map(b => b.name) },
        { key: 'registry_mentions', title: 'Реєстри', icon: <RegistryIcon className="w-6 h-6 text-blue-400" />, data: results.registry_mentions?.map(r => r.registry_name) },
        { key: 'phone_info', title: 'Телефони', icon: <PhoneIcon className="w-6 h-6 text-blue-400" />, data: results.phone_info?.map(p => p.number) },
        { key: 'forum_mentions', title: 'Форуми', icon: <ForumIcon className="w-6 h-6 text-blue-400" />, data: results.forum_mentions?.map(f => f.forum_name) },
        { key: 'leaked_documents', title: 'Документи', icon: <PasteIcon className="w-6 h-6 text-blue-400" />, data: results.leaked_documents?.map(d => d.source) },
        { key: 'web_mentions', title: 'Згадки', icon: <LinkIcon className="w-6 h-6 text-blue-400" />, data: results.web_mentions?.map(m => m.title)},
    ].filter(cat => cat.data && cat.data.length > 0), [results]);

    useLayoutEffect(() => {
        if (!containerRef.current) return;
        const newLines: React.ReactElement[] = [];
        const containerRect = containerRef.current.getBoundingClientRect();

        const targetEl = document.getElementById('target-node');
        if (!targetEl) return;
        const targetRect = targetEl.getBoundingClientRect();
        const targetX = targetRect.left + targetRect.width / 2 - containerRect.left;
        const targetY = targetRect.top + targetRect.height / 2 - containerRect.top;
        
        dataCategories.forEach(cat => {
            const categoryEl = document.getElementById(`cat-node-${cat.key}`);
            if(categoryEl) {
                const catRect = categoryEl.getBoundingClientRect();
                const catX = catRect.left + catRect.width / 2 - containerRect.left;
                const catY = catRect.top + catRect.height / 2 - containerRect.top;

                newLines.push(
                    <line key={`line-target-${cat.key}`} x1={targetX} y1={targetY} x2={catX} y2={catY} stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" />
                );

                cat.data?.forEach((item, index) => {
                    const dataEl = document.getElementById(`data-node-${cat.key}-${index}`);
                    if(dataEl) {
                        const dataRect = dataEl.getBoundingClientRect();
                        const dataX = dataRect.left + dataRect.width / 2 - containerRect.left;
                        const dataY = dataRect.top + dataRect.height / 2 - containerRect.top;
                        newLines.push(
                            <line key={`line-${cat.key}-${index}`} x1={catX} y1={catY} x2={dataX} y2={dataY} stroke="rgba(71, 85, 105, 0.3)" strokeWidth="1.5" />
                        );
                    }
                });
            }
        });
        setLines(newLines);

  }, [results, dataCategories]);


  return (
    <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-['Inter'] text-slate-200 text-center mb-6">Граф зв'язків</h3>
        <div ref={containerRef} className="relative w-full">
            <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 0 }}>{lines}</svg>

            <div className="relative z-10 flex flex-col items-center">
                {/* Target Node */}
                <Node id="target-node" className="bg-blue-600 border-blue-400 text-white font-bold text-lg px-4 py-3 mb-16">
                    <UserIcon className="w-6 h-6" />
                    <span className="truncate">{target}</span>
                </Node>
                
                {/* Categories and Data Nodes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12 w-full">
                    {dataCategories.map((cat) => (
                        <div key={cat.key} className="flex flex-col items-center gap-4">
                            <CategoryNode id={`cat-node-${cat.key}`} title={cat.title} icon={cat.icon} />
                            <div className="flex flex-col items-center gap-2 mt-4 w-full">
                                {cat.data?.slice(0, 3).map((item, index) => ( // Show up to 3 items
                                    <Node 
                                        id={`data-node-${cat.key}-${index}`} 
                                        key={index}
                                        onClick={() => onNodeClick(cat.key, item)}
                                    >
                                        <span className="truncate max-w-32">{cat.key === 'telegram_activity' ? `@${item}` : item}</span>
                                    </Node>
                                ))}
                                {cat.data && cat.data.length > 3 && (
                                    <div className="text-slate-500 text-xs mt-1">
                                        + {cat.data.length - 3} ще...
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};
