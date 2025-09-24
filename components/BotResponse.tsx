
import React, { useState } from 'react';
import type { OSINTResult, GroundingChunk } from '../types';
import { FilterControls, FilterOption } from './FilterControls';
import { RelationshipGraph } from './RelationshipGraph';
import { ExportButton } from './ExportButton';
import { ResultsDisplay } from './ResultsDisplay';
import { TelegramShareButton } from './TelegramShareButton';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface BotResponseProps {
    results: OSINTResult;
    sources: GroundingChunk[];
    target: string;
    investigationPath: string[];
    onSearch: (query: string) => void;
    onNodeClick: (key: string, text: string) => void;
    highlightedItem: { key: string; text: string } | null;
}

export const BotResponse: React.FC<BotResponseProps> = ({ results, sources, target, investigationPath, onSearch, onNodeClick, highlightedItem }) => {
    const [activeFilter, setActiveFilter] = useState('all');

    const generateFilters = (data: OSINTResult): FilterOption[] => {
        const filters: FilterOption[] = [];
        if (data.associated_entities?.length) filters.push({ key: 'associated_entities', label: 'Пов\'язані особи', count: data.associated_entities.length });
        if (data.social_profiles?.length) filters.push({ key: 'social_profiles', label: 'Соціальні мережі', count: data.social_profiles.length });
        if (data.emails?.length) filters.push({ key: 'emails', label: 'Email', count: data.emails.length });
        if (data.telegram_activity?.length) filters.push({ key: 'telegram_activity', label: 'Telegram', count: data.telegram_activity.length });
        if (data.associated_domains?.length) filters.push({ key: 'associated_domains', label: 'Домени', count: data.associated_domains.length });
        if (data.data_breaches?.length) filters.push({ key: 'data_breaches', label: 'Витоки даних', count: data.data_breaches.length });
        if (data.registry_mentions?.length) filters.push({ key: 'registry_mentions', label: 'Реєстри', count: data.registry_mentions.length });
        if (data.phone_info?.length) filters.push({ key: 'phone_info', label: 'Телефон', count: data.phone_info.length });
        if (data.forum_mentions?.length) filters.push({ key: 'forum_mentions', label: 'Форуми', count: data.forum_mentions.length });
        if (data.leaked_documents?.length) filters.push({ key: 'leaked_documents', label: 'Документи', count: data.leaked_documents.length });
        if (data.web_mentions?.length) filters.push({ key: 'web_mentions', label: 'Згадки в мережі', count: data.web_mentions.length });
        return filters;
    };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                {investigationPath.map((item, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <ChevronRightIcon className="w-5 h-5 text-slate-500" />}
                        <div className={`px-3 py-1 rounded-md text-sm transition-colors ${index === investigationPath.length - 1 ? 'bg-blue-500 text-white font-bold' : 'bg-slate-700 text-slate-300'}`}>
                           <span>{item}</span>
                        </div>
                    </React.Fragment>
                ))}
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <RelationshipGraph target={target} results={results} onNodeClick={onNodeClick} />
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <FilterControls
                    filters={generateFilters(results)}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                />
                 <div className="flex items-center gap-2">
                    <TelegramShareButton results={results} target={target} />
                    <ExportButton
                        results={results}
                        sources={sources}
                        target={target}
                    />
                 </div>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <ResultsDisplay results={results} sources={sources} activeFilter={activeFilter} onSearch={onSearch} highlightedItem={highlightedItem} />
            </div>
        </div>
    );
};
