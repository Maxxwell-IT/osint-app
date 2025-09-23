import React, { useLayoutEffect, useRef, useState, useMemo } from 'react';
import type { OSINTResult } from '../types';
import { UserIcon } from './icons/UserIcon';
import { MailIcon } from './icons/MailIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { BreachIcon } from './icons/BreachIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { ForumIcon } from './icons/ForumIcon';
import { PasteIcon } from './icons/PasteIcon';
import { LinkIcon } from './icons/LinkIcon';
import { RegistryIcon } from './icons/RegistryIcon';


interface RelationshipGraphProps {
  target: string;
  results: OSINTResult;
}

const Node: React.FC<{ id: string; children: React.ReactNode; className?: string }> = ({ id, children, className }) => (
  <div id={id} className={`flex items-center gap-2 p-2 rounded-lg bg-black/30 border border-cyan-500/30 text-sm ${className}`}>
    {children}
  </div>
);

const CategoryNode: React.FC<{ id: string; title: string, icon: React.ReactNode }> = ({ id, title, icon }) => (
    <div id={id} className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 glass-card rounded-full flex items-center justify-center border-2 border-cyan-400">
            {icon}
        </div>
        <span className="font-bold text-cyan-300 text-base">{title}</span>
    </div>
);


export const RelationshipGraph: React.FC<RelationshipGraphProps> = ({ target, results }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [lines, setLines] = useState<React.ReactElement[]>([]);

    const dataCategories = useMemo(() => [
        { key: 'social_profiles', title: 'Соц. мережі', icon: <UserIcon className="w-6 h-6 text-cyan-400" />, data: results.social_profiles?.map(p => p.username) },
        { key: 'emails', title: 'Emails', icon: <MailIcon className="w-6 h-6 text-cyan-400" />, data: results.emails },
        { key: 'associated_domains', title: 'Домени', icon: <GlobeIcon className="w-6 h-6 text-cyan-400" />, data: results.associated_domains },
        { key: 'data_breaches', title: 'Витоки', icon: <BreachIcon className="w-6 h-6 text-cyan-400" />, data: results.data_breaches?.map(b => b.name) },
        { key: 'registry_mentions', title: 'Реєстри', icon: <RegistryIcon className="w-6 h-6 text-cyan-400" />, data: results.registry_mentions?.map(r => r.registry_name) },
        { key: 'phone_info', title: 'Телефони', icon: <PhoneIcon className="w-6 h-6 text-cyan-400" />, data: results.phone_info?.map(p => p.number) },
        { key: 'forum_mentions', title: 'Форуми', icon: <ForumIcon className="w-6 h-6 text-cyan-400" />, data: results.forum_mentions?.map(f => f.forum_name) },
        { key: 'leaked_documents', title: 'Документи', icon: <PasteIcon className="w-6 h-6 text-cyan-400" />, data: results.leaked_documents?.map(d => d.source) },
        { key: 'web_mentions', title: 'Згадки', icon: <LinkIcon className="w-6 h-6 text-cyan-400" />, data: results.web_mentions?.map(m => {
            if (!m.url) return null;
            try {
                const fullUrl = m.url.startsWith('http') ? m.url : `https://${m.url}`;
                return new URL(fullUrl).hostname;
            } catch (e) {
                console.error(`Invalid URL in web_mentions: ${m.url}`);
                return null;
            }
        }).filter(Boolean) as string[] },
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
                    <line key={`line-target-${cat.key}`} x1={targetX} y1={targetY} x2={catX} y2={catY} stroke="rgba(0, 192, 255, 0.3)" strokeWidth="2" />
                );

                cat.data?.forEach((_, index) => {
                    const dataEl = document.getElementById(`data-node-${cat.key}-${index}`);
                    if(dataEl) {
                        const dataRect = dataEl.getBoundingClientRect();
                        const dataX = dataRect.left + dataRect.width / 2 - containerRect.left;
                        const dataY = dataRect.top + dataRect.height / 2 - containerRect.top;
                        newLines.push(
                            <line key={`line-${cat.key}-${index}`} x1={catX} y1={catY} x2={dataX} y2={dataY} stroke="rgba(0, 192, 255, 0.2)" strokeWidth="1.5" />
                        );
                    }
                });
            }
        });
        setLines(newLines);

  }, [results, dataCategories]);


  return (
    <div className="glass-card rounded-lg p-6 mb-6 animate-fade-in">
        <h3 className="text-xl font-orbitron text-cyan-300 text-center mb-6">Граф зв'язків</h3>
        <div ref={containerRef} className="relative w-full">
            <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 0 }}>{lines}</svg>

            <div className="relative z-10 flex flex-col items-center">
                {/* Target Node */}
                <Node id="target-node" className="bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold text-lg px-4 py-3 mb-16">
                    <UserIcon className="w-6 h-6" />
                    <span className="truncate">{target}</span>
                </Node>
                
                {/* Categories and Data Nodes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-12 w-full">
                    {dataCategories.map((cat) => (
                        <div key={cat.key} className="flex flex-col items-center gap-4">
                            <CategoryNode id={`cat-node-${cat.key}`} title={cat.title} icon={cat.icon} />
                            <div className="flex flex-col items-center gap-2 mt-4">
                                {cat.data?.slice(0, 3).map((item, index) => ( // Show up to 3 items
                                    <Node id={`data-node-${cat.key}-${index}`} key={index}>
                                        <span className="truncate max-w-32">{item}</span>
                                    </Node>
                                ))}
                                {cat.data && cat.data.length > 3 && (
                                    <div className="text-cyan-400/70 text-xs mt-1">
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