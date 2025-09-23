import React, { useState } from 'react';
import type { OSINTResult, GroundingChunk } from '../types';
import { UserIcon } from './icons/UserIcon';
import { MailIcon } from './icons/MailIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { LinkIcon } from './icons/LinkIcon';
import { CodeIcon } from './icons/CodeIcon';
import { BreachIcon } from './icons/BreachIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { ForumIcon } from './icons/ForumIcon';
import { PasteIcon } from './icons/PasteIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CopyButton } from './CopyButton';
import { SearchPlusIcon } from './icons/SearchPlusIcon';


interface ResultsDisplayProps {
  results: OSINTResult;
  sources: GroundingChunk[];
  activeFilter: string;
  onDeepSearch: (query: string) => void;
}

const CollapsibleCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode, count?: number, startOpen?: boolean }> = ({ title, icon, children, count, startOpen = true }) => {
    const [isOpen, setIsOpen] = useState(startOpen);
  
    return (
      <div className="glass-card rounded-lg flex flex-col h-full transition-all duration-300">
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full p-4 text-left"
            aria-expanded={isOpen}
        >
            <div className="flex items-center gap-3">
                {icon}
                <h3 className="text-xl font-orbitron text-cyan-300">{title}</h3>
            </div>
            <div className="flex items-center gap-3">
                {count !== undefined && <span className="text-sm font-bold bg-cyan-500/20 text-cyan-300 rounded-full px-3 py-1">{count}</span>}
                <ChevronDownIcon className={`w-6 h-6 text-cyan-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 pt-0 text-cyan-100/90 space-y-3">
                {children}
            </div>
        </div>
      </div>
    );
};


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, sources, activeFilter, onDeepSearch }) => {
  const isFiltered = activeFilter !== 'all';
  const cardContainerClass = isFiltered ? 'lg:col-span-3' : '';
  
  const ActionableItem: React.FC<{text: string; url?: string; onDeepSearch: (text: string) => void}> = ({ text, url, onDeepSearch }) => {
    const content = url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline flex-grow truncate">{text}</a>
    ) : (
        <span className="truncate">{text}</span>
    );

    return (
        <div className="flex items-center justify-between p-3 bg-black/20 rounded-md">
            {content}
            <div className="flex items-center flex-shrink-0 ml-2">
                <CopyButton textToCopy={text} />
                <button
                    onClick={() => onDeepSearch(text)}
                    className="p-1.5 rounded-md hover:bg-cyan-500/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    aria-label={`Deep search ${text}`}
                    title={`Дослідити ${text}`}
                >
                    <SearchPlusIcon className="w-5 h-5 text-cyan-300/70" />
                </button>
            </div>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in mt-6">
        
      {/* Summary */}
      <div className="lg:col-span-3">
        <div className="glass-card rounded-lg p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
                <CodeIcon className="w-6 h-6 text-cyan-400"/>
                <h3 className="text-xl font-orbitron text-cyan-300">Загальний звіт</h3>
            </div>
            <div className="flex-grow text-cyan-100/90 space-y-3">
                 <p className="text-base leading-relaxed">{results.summary}</p>
                {results.full_name && <p className="mt-4"><strong className="text-cyan-300">Можливе повне ім'я:</strong> {results.full_name}</p>}
            </div>
        </div>
      </div>

      {/* Social Profiles */}
      {(activeFilter === 'all' || activeFilter === 'social_profiles') && results.social_profiles?.length > 0 && (
        <div className={cardContainerClass}>
            <CollapsibleCard title="Соціальні мережі" icon={<UserIcon className="w-6 h-6 text-cyan-400"/>} count={results.social_profiles.length}>
                {results.social_profiles.map((profile, index) => (
                    <div key={index} className="p-3 bg-black/20 rounded-md">
                        <div className="flex justify-between items-start">
                             <a href={profile.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex-grow min-w-0">
                                <p className="font-bold text-cyan-200">{profile.platform}</p>
                                <p className="text-sm text-cyan-100/70 truncate">@{profile.username}</p>
                            </a>
                            <div className="flex items-center flex-shrink-0 ml-2">
                                <CopyButton textToCopy={profile.username} />
                                <button
                                    onClick={() => onDeepSearch(profile.username)}
                                    className="p-1.5 rounded-md hover:bg-cyan-500/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                    aria-label={`Deep search ${profile.username}`}
                                    title={`Дослідити ${profile.username}`}
                                >
                                    <SearchPlusIcon className="w-5 h-5 text-cyan-300/70" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </CollapsibleCard>
        </div>
      )}

      {/* Emails */}
      {(activeFilter === 'all' || activeFilter === 'emails') && results.emails?.length > 0 && (
         <div className={cardContainerClass}>
            <CollapsibleCard title="Адреси електронної пошти" icon={<MailIcon className="w-6 h-6 text-cyan-400"/>} count={results.emails.length}>
                {results.emails.map((email, index) => (
                    <ActionableItem key={index} text={email} onDeepSearch={onDeepSearch}/>
                ))}
            </CollapsibleCard>
        </div>
      )}

      {/* Associated Domains */}
      {(activeFilter === 'all' || activeFilter === 'associated_domains') && results.associated_domains?.length > 0 && (
        <div className={cardContainerClass}>
            <CollapsibleCard title="Пов'язані домени" icon={<GlobeIcon className="w-6 h-6 text-cyan-400"/>} count={results.associated_domains.length}>
                {results.associated_domains.map((domain, index) => (
                     <ActionableItem key={index} text={domain} url={`http://${domain}`} onDeepSearch={onDeepSearch}/>
                ))}
            </CollapsibleCard>
        </div>
      )}

      {/* Data Breaches */}
      {(activeFilter === 'all' || activeFilter === 'data_breaches') && results.data_breaches?.length > 0 && (
        <div className={cardContainerClass}>
            <CollapsibleCard title="Витоки даних" icon={<BreachIcon className="w-6 h-6 text-cyan-400"/>} count={results.data_breaches.length}>
                {results.data_breaches.map((breach, index) => (
                    <div key={index} className="p-3 bg-black/20 rounded-md">
                        <p className="font-bold text-cyan-200">{breach.name} <span className="text-xs font-normal text-cyan-100/60 ml-2">{breach.date}</span></p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {breach.compromised_data.map((item, i) => (
                                <span key={i} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">{item}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </CollapsibleCard>
        </div>
      )}

      {/* Phone Info */}
      {(activeFilter === 'all' || activeFilter === 'phone_info') && results.phone_info?.length > 0 && (
        <div className={cardContainerClass}>
            <CollapsibleCard title="Інформація про телефон" icon={<PhoneIcon className="w-6 h-6 text-cyan-400"/>} count={results.phone_info.length}>
                {results.phone_info.map((info, index) => (
                    <div key={index} className="p-3 bg-black/20 rounded-md">
                        <ActionableItem text={info.number} onDeepSearch={onDeepSearch}/>
                        <p className="text-sm text-cyan-100/70 mt-1 pl-1">Пов'язані імена: {info.associated_names.join(', ')}</p>
                    </div>
                ))}
            </CollapsibleCard>
        </div>
      )}

      {/* Forum Mentions */}
      {(activeFilter === 'all' || activeFilter === 'forum_mentions') && results.forum_mentions?.length > 0 && (
        <div className={cardContainerClass}>
            <CollapsibleCard title="Згадки на форумах" icon={<ForumIcon className="w-6 h-6 text-cyan-400"/>} count={results.forum_mentions.length}>
                {results.forum_mentions.map((mention, index) => (
                    <a href={mention.url} target="_blank" rel="noopener noreferrer" key={index} className="block p-3 bg-black/20 rounded-md hover:bg-cyan-500/20 transition-colors">
                        <p className="font-bold text-cyan-200">{mention.forum_name}</p>
                        <p className="text-sm text-cyan-100/70 mt-1 italic">"{mention.post_snippet}"</p>
                    </a>
                ))}
            </CollapsibleCard>
        </div>
      )}

      {/* Leaked Documents */}
      {(activeFilter === 'all' || activeFilter === 'leaked_documents') && results.leaked_documents?.length > 0 && (
         <div className="lg:col-span-3">
            <CollapsibleCard title="Злиті документи / Вставки" icon={<PasteIcon className="w-6 h-6 text-cyan-400"/>} count={results.leaked_documents.length}>
                {results.leaked_documents.map((doc, index) => (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" key={index} className="block p-3 bg-black/20 rounded-md hover:bg-cyan-500/20 transition-colors">
                        <p className="font-bold text-cyan-200">{doc.source}</p>
                        <p className="text-sm text-cyan-100/70 mt-1 font-mono bg-black/30 p-2 rounded"><code>{doc.snippet}</code></p>
                    </a>
                ))}
            </CollapsibleCard>
        </div>
      )}

      {/* Web Mentions */}
      {(activeFilter === 'all' || activeFilter === 'web_mentions') && results.web_mentions?.length > 0 && (
        <div className="lg:col-span-3">
            <CollapsibleCard title="Згадки в мережі" icon={<LinkIcon className="w-6 h-6 text-cyan-400"/>} count={results.web_mentions.length}>
                {results.web_mentions.map((mention, index) => (
                    <a href={mention.url} target="_blank" rel="noopener noreferrer" key={index} className="block p-3 bg-black/20 rounded-md hover:bg-cyan-500/20 transition-colors">
                        <p className="font-bold text-cyan-200">{mention.title}</p>
                        <p className="text-sm text-cyan-100/70 mt-1">{mention.snippet}</p>
                    </a>
                ))}
            </CollapsibleCard>
        </div>
      )}
      
      {/* Sources */}
      {sources.length > 0 && (
          <div className="lg:col-span-3">
            <CollapsibleCard title="Джерела розслідування" icon={<GlobeIcon className="w-6 h-6 text-cyan-400"/>} count={sources.length} startOpen={false}>
                <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
                    {sources.map((source, index) => (
                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" key={index} className="block mb-2 p-2 bg-black/20 rounded-md hover:bg-cyan-500/20 transition-colors break-inside-avoid">
                            <p className="text-sm text-cyan-200 truncate">{source.web.title || new URL(source.web.uri).hostname}</p>
                        </a>
                    ))}
                </div>
            </CollapsibleCard>
          </div>
      )}

    </div>
  );
};