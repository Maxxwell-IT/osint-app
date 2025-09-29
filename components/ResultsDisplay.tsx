
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { OSINTResult, GroundingChunk, SocialProfile, AssociatedEntity, DataBreach, ForumMention, LeakedDocument, RegistryMention, PhoneInfo, WebMention, TelegramActivity } from '../types';
import { UserIcon } from './icons/UserIcon';
import { UsersIcon } from './icons/UsersIcon';
import { MailIcon } from './icons/MailIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { LinkIcon } from './icons/LinkIcon';
import { CodeIcon } from './icons/CodeIcon';
import { BreachIcon } from './icons/BreachIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { ForumIcon } from './icons/ForumIcon';
import { PasteIcon } from './icons/PasteIcon';
import { RegistryIcon } from './icons/RegistryIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CopyButton } from './CopyButton';
import { SearchPlusIcon } from './icons/SearchPlusIcon';
import { SearchIcon } from './icons/SearchIcon';
import { TwitterIcon } from './icons/TwitterIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { TelegramIcon } from './icons/TelegramIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


interface ResultsDisplayProps {
  results: OSINTResult;
  sources: GroundingChunk[];
  activeFilter: string;
  onSearch: (query: string) => void;
  highlightedItem: { key: string; text: string } | null;
}

const ActionButtons: React.FC<{ text: string; onSearch: (text: string) => void; className?: string }> = ({ text, onSearch, className }) => (
    <div className={`flex items-center flex-shrink-0 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 ease-in-out ${className ?? ''}`}>
        <CopyButton textToCopy={text} />
        <button
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onSearch(text);
            }}
            className="p-1.5 rounded-md hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={`Deep search ${text}`}
            title={`Глибокий пошук: ${text}`}
        >
            <SearchPlusIcon className="w-5 h-5 text-slate-400 hover:text-blue-400" />
        </button>
    </div>
);

const ActionableItem: React.FC<{
    text: string;
    url?: string;
    onSearch: (text: string) => void;
    children?: React.ReactNode;
    isHighlighted?: boolean;
    itemRef?: (el: HTMLLIElement | null) => void;
}> = ({ text, url, onSearch, children, isHighlighted, itemRef }) => {
    const content = url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline flex-grow truncate text-blue-400">{text}</a>
    ) : (
        <span className="truncate flex-grow">{text}</span>
    );

    return (
        <li ref={itemRef} className={`group flex items-center justify-between gap-4 p-3 bg-slate-800/50 rounded-md transition-all duration-300 hover:bg-slate-700/50 ${isHighlighted ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-500/20 scale-[1.02]' : ''}`}>
            <div className="flex-grow flex flex-col min-w-0">
                <div className="flex items-center">
                   {content}
                </div>
                {children && <div className="text-sm text-slate-400 mt-1 truncate">{children}</div>}
            </div>
            <ActionButtons text={url || text} onSearch={onSearch} />
        </li>
    );
};

const CollapsibleCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    count: number;
    children: React.ReactNode;
}> = ({ title, icon, count, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (count === 0) return null;

    return (
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-700/40 transition-colors"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="font-bold text-lg text-slate-200">{title}</h3>
                    <span className="text-sm bg-slate-700 text-slate-300 rounded-full px-2.5 py-0.5">{count}</span>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
            </button>
            {isOpen && (
                <div className="p-4">
                    {children}
                </div>
            )}
        </div>
    );
};

const getPlatformIcon = (platform: string) => {
    const lowerPlatform = platform.toLowerCase();
    if (lowerPlatform.includes('twitter') || lowerPlatform.includes('x.com')) {
        return <TwitterIcon className="w-6 h-6 text-slate-400" />;
    }
    if (lowerPlatform.includes('linkedin')) {
        return <LinkedInIcon className="w-6 h-6 text-slate-400" />;
    }
    if (lowerPlatform.includes('instagram')) {
        return <InstagramIcon className="w-6 h-6 text-slate-400" />;
    }
    if (lowerPlatform.includes('telegram')) {
        return <TelegramIcon className="w-6 h-6 text-slate-400" />;
    }
    return <UserIcon className="w-6 h-6 text-slate-400" />;
};


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, sources, activeFilter, onSearch, highlightedItem }) => {
    const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

    useEffect(() => {
        if (highlightedItem) {
            const refKey = `${highlightedItem.key}-${highlightedItem.text}`;
            const element = itemRefs.current[refKey];
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }
    }, [highlightedItem]);

    const sections = useMemo(() => [
        { key: 'summary', title: 'Зведення', icon: <SearchIcon className="w-6 h-6 text-slate-400" />, data: results.summary ? [results.summary] : []},
        { key: 'associated_entities', title: "Пов'язані особи", icon: <UsersIcon className="w-6 h-6 text-slate-400" />, data: results.associated_entities },
        { key: 'social_profiles', title: 'Соціальні мережі', icon: <UserIcon className="w-6 h-6 text-slate-400" />, data: results.social_profiles },
        { key: 'emails', title: 'Email', icon: <MailIcon className="w-6 h-6 text-slate-400" />, data: results.emails },
        { key: 'telegram_activity', title: 'Telegram', icon: <TelegramIcon className="w-6 h-6 text-slate-400" />, data: results.telegram_activity },
        { key: 'associated_domains', title: 'Домени', icon: <GlobeIcon className="w-6 h-6 text-slate-400" />, data: results.associated_domains },
        { key: 'data_breaches', title: 'Витоки даних', icon: <BreachIcon className="w-6 h-6 text-slate-400" />, data: results.data_breaches },
        { key: 'registry_mentions', title: 'Реєстри', icon: <RegistryIcon className="w-6 h-6 text-slate-400" />, data: results.registry_mentions },
        { key: 'phone_info', title: 'Телефон', icon: <PhoneIcon className="w-6 h-6 text-slate-400" />, data: results.phone_info },
        { key: 'forum_mentions', title: 'Форуми', icon: <ForumIcon className="w-6 h-6 text-slate-400" />, data: results.forum_mentions },
        { key: 'leaked_documents', title: 'Документи', icon: <PasteIcon className="w-6 h-6 text-slate-400" />, data: results.leaked_documents },
        { key: 'web_mentions', title: 'Згадки в мережі', icon: <LinkIcon className="w-6 h-6 text-slate-400" />, data: results.web_mentions },
        { key: 'sources', title: 'Джерела', icon: <CodeIcon className="w-6 h-6 text-slate-400" />, data: sources },
    ], [results, sources]);
    
    const breachDataByYear = useMemo(() => {
        const counts: { [year: string]: number } = {};
        results.data_breaches?.forEach(breach => {
            const year = breach.date ? new Date(breach.date).getFullYear().toString() : 'Unknown';
            if (!isNaN(parseInt(year))) {
                counts[year] = (counts[year] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .map(([year, count]) => ({ year, count }))
            .sort((a, b) => parseInt(a.year) - parseInt(b.year));
    }, [results.data_breaches]);


    return (
        <div className="space-y-4">
            {sections.map(({ key, title, icon, data }) => {
                 if (!data || data.length === 0 || (activeFilter !== 'all' && activeFilter !== key)) {
                    return null;
                }
                
                let content;

                switch (key) {
                    case 'summary':
                         content = <p className="text-slate-300 leading-relaxed">{results.summary}</p>;
                         break;
                    case 'associated_entities':
                        content = <ul className="space-y-2">{ (data as AssociatedEntity[]).map((entity, index) => {
                            const isHighlighted = highlightedItem?.key === key && highlightedItem?.text === entity.name;
                            const refKey = `${key}-${entity.name}`;
                            return <ActionableItem key={index} text={entity.name} onSearch={onSearch} isHighlighted={isHighlighted} itemRef={(el) => { itemRefs.current[refKey] = el; }}>{entity.sources?.join('; ')}</ActionableItem>
                        }) }</ul>;
                        break;
                    case 'social_profiles':
                         content = <ul className="space-y-2">{ (data as SocialProfile[]).map((profile, index) => {
                            const isHighlighted = highlightedItem?.key === key && highlightedItem?.text === profile.username;
                            const refKey = `${key}-${profile.username}`;
                            return (
                             <li key={index} ref={(el) => { itemRefs.current[refKey] = el; }} className={`group flex items-center justify-between gap-4 p-3 bg-slate-800/50 rounded-md transition-all duration-300 hover:bg-slate-700/50 ${isHighlighted ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-500/20 scale-[1.02]' : ''}`}>
                                <div className="flex items-center gap-3 min-w-0">
                                    {getPlatformIcon(profile.platform)}
                                    <div className="flex-grow min-w-0">
                                       <a href={profile.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex-grow truncate text-blue-400 font-bold">{profile.username}</a>
                                       <p className="text-sm text-slate-400 truncate">{profile.bio}</p>
                                    </div>
                                </div>
                                <ActionButtons text={profile.username} onSearch={onSearch} />
                            </li>
                         )}) }</ul>;
                        break;
                    case 'data_breaches':
                        content = (
                            <div>
                                {breachDataByYear.length > 1 && (
                                    <div className="mb-4 h-48">
                                       <ResponsiveContainer width="100%" height="100%">
                                          <BarChart data={breachDataByYear}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                                            <XAxis dataKey="year" stroke="#94a3b8" />
                                            <YAxis allowDecimals={false} stroke="#94a3b8" />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                                            <Bar dataKey="count" fill="#38bdf8" />
                                          </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                <ul className="space-y-2">
                                    { (data as DataBreach[]).map((breach, index) => {
                                        const isHighlighted = highlightedItem?.key === key && highlightedItem?.text === breach.name;
                                        const refKey = `${key}-${breach.name}`;
                                        return <ActionableItem key={index} text={breach.name} onSearch={onSearch} isHighlighted={isHighlighted} itemRef={(el) => { itemRefs.current[refKey] = el; }}>{breach.compromised_data.join(', ')}</ActionableItem>
                                    }) }
                                </ul>
                            </div>
                        );
                        break;
                    case 'forum_mentions':
                        content = <ul className="space-y-2">{ (data as ForumMention[]).map((mention, index) => {
                             const isHighlighted = highlightedItem?.key === key && highlightedItem?.text === mention.forum_name;
                             const refKey = `${key}-${mention.forum_name}`;
                             return <ActionableItem key={index} text={mention.forum_name} url={mention.url} onSearch={onSearch} isHighlighted={isHighlighted} itemRef={(el) => { itemRefs.current[refKey] = el; }}>{mention.post_snippet}</ActionableItem>
                        }) }</ul>;
                        break;
                    case 'leaked_documents':
                        content = <ul className="space-y-2">{ (data as LeakedDocument[]).map((doc, index) => {
                             const isHighlighted = highlightedItem?.key === key && highlightedItem?.text === doc.source;
                             const refKey = `${key}-${doc.source}`;
                            return <ActionableItem key={index} text={doc.source} url={doc.url} onSearch={onSearch} isHighlighted={isHighlighted} itemRef={(el) => { itemRefs.current[refKey] = el; }}>{doc.snippet}</ActionableItem>
                        }) }</ul>;
                        break;
                    case 'registry_mentions':
                        content = <ul className="space-y-2">{ (data as RegistryMention[]).map((mention, index) => {
                            const isHighlighted = highlightedItem?.key === key && highlightedItem?.text === mention.registry_name;
                            const refKey = `${key}-${mention.registry_name}`;
                            return <ActionableItem key={index} text={mention.registry_name} url={mention.url} onSearch={onSearch} isHighlighted={isHighlighted} itemRef={(el) => { itemRefs.current[refKey] = el; }}>{mention.record_details}</ActionableItem>
                        }) }</ul>;
                        break;
                    case 'phone_info':
                        content = <ul className="space-y-2">{ (data as PhoneInfo[]).map((info, index) => {
                            const isHighlighted = highlightedItem?.key === key && highlightedItem?.text === info.number;
                            const refKey = `${key}-${info.number}`;
                            return <ActionableItem key={index} text={info.number} onSearch={onSearch} isHighlighted={isHighlighted} itemRef={(el) => { itemRefs.current[refKey] = el; }}>{info.associated_names.join(', ')}</ActionableItem>
                        }) }</ul>;
                        break;
                    case 'web_mentions':
                        content = <ul className="space-y-2">{ (data as WebMention[]).map((mention, index) => {
                            const isHighlighted = highlightedItem?.key === key && highlightedItem?.text === mention.title;
                            const refKey = `${key}-${mention.title}`;
                            return <ActionableItem key={index} text={mention.title} url={mention.url} onSearch={onSearch} isHighlighted={isHighlighted} itemRef={(el) => { itemRefs.current[refKey] = el; }}>{mention.snippet}</ActionableItem>
                        }) }</ul>;
                        break;
                    case 'telegram_activity':
                        content = <ul className="space-y-2">{ (data as TelegramActivity[]).map((activity, index) => {
                            const isHighlighted = highlightedItem?.key === key && highlightedItem?.text === activity.username;
                            const refKey = `${key}-${activity.username}`;
                            return <ActionableItem key={index} text={activity.username} url={activity.url} onSearch={onSearch} isHighlighted={isHighlighted} itemRef={(el) => { itemRefs.current[refKey] = el; }}>{activity.description}</ActionableItem>
                        }) }</ul>;
                        break;
                    case 'sources':
                        content = <ul className="space-y-2">{ (data as GroundingChunk[]).map((source, index) => (
                           <li key={index}> <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate block">{source.web.title}</a> </li>
                        )) }</ul>;
                        break;
                    default: // For simple string arrays like emails, domains
                        content = <ul className="space-y-2">{ (data as string[]).map((item, index) => {
                            const isHighlighted = highlightedItem?.key === key && highlightedItem?.text === item;
                            const refKey = `${key}-${item}`;
                            return <ActionableItem key={index} text={item} onSearch={onSearch} isHighlighted={isHighlighted} itemRef={(el) => { itemRefs.current[refKey] = el; }} />
                        }) }</ul>;
                        break;
                }
                
                return (
                     <CollapsibleCard key={key} title={title} icon={icon} count={data.length}>
                        {content}
                    </CollapsibleCard>
                )
            })}
        </div>
    );
};
