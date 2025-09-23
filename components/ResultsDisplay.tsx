import React, { useState, useMemo } from 'react';
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
import { RegistryIcon } from './icons/RegistryIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CopyButton } from './CopyButton';
import { SearchPlusIcon } from './icons/SearchPlusIcon';
import { TwitterIcon } from './icons/TwitterIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


interface ResultsDisplayProps {
  results: OSINTResult;
  sources: GroundingChunk[];
  activeFilter: string;
  onDeepSearch: (query: string) => void;
}

const ActionButtons: React.FC<{ text: string; onDeepSearch: (text: string) => void; className?: string }> = ({ text, onDeepSearch, className }) => (
    <div className={`flex items-center flex-shrink-0 ${className ?? ''}`}>
        <CopyButton textToCopy={text} />
        <button
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDeepSearch(text);
            }}
            className="p-1.5 rounded-md hover:bg-cyan-500/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label={`Deep search ${text}`}
            title={`Дослідити ${text}`}
        >
            <SearchPlusIcon className="w-5 h-5 text-cyan-300/70" />
        </button>
    </div>
);

const ActionableItem: React.FC<{text: string; url?: string; onDeepSearch: (text: string) => void}> = ({ text, url, onDeepSearch }) => {
    const content = url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline flex-grow truncate">{text}</a>
    ) : (
        <span className="truncate">{text}</span>
    );

    return (
        <div className="flex items-center justify-between p-3 bg-black/20 rounded-md">
            {content}
            <ActionButtons text={text} onDeepSearch={onDeepSearch} className="ml-2" />
        </div>
    );
};

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

const getPlatformIcon = (platform: string) => {
    const lowerPlatform = platform.toLowerCase();
    const iconClass = "w-8 h-8 mr-3 text-cyan-200";
    if (lowerPlatform.includes('twitter') || lowerPlatform.includes('x.com')) return <TwitterIcon className={iconClass} />;
    if (lowerPlatform.includes('linkedin')) return <LinkedInIcon className={iconClass} />;
    if (lowerPlatform.includes('instagram')) return <InstagramIcon className={iconClass} />;
    return <UserIcon className="w-6 h-6 mr-3 text-cyan-400" />;
}


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, sources, activeFilter, onDeepSearch }) => {
  const isFiltered = activeFilter !== 'all';
  const cardContainerClass = isFiltered ? 'lg:col-span-3' : '';

  const sourceDomainData = useMemo(() => {
    if (!sources || sources.length === 0) return [];

    // FIX: The initial value of the reduce function is explicitly typed as `Record<string, number>`.
    // This ensures TypeScript correctly infers the type of `domainCounts`, allowing the `count`
    // property to be used in arithmetic operations within the subsequent `.sort()` method.
    const domainCounts = sources.reduce((acc, source) => {
        try {
            const domain = new URL(source.web.uri).hostname.replace('www.', '');
            acc[domain] = (acc[domain] || 0) + 1;
        } catch (e) {
            console.error("Invalid URL in sources:", source.web.uri);
        }
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(domainCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15); // Show top 15 domains for clarity
  }, [sources]);

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
                {results.full_name && (
                    <div className="mt-2">
                        <p className="text-cyan-300 font-bold mb-1">Можливе повне ім'я:</p>
                        <ActionableItem text={results.full_name} onDeepSearch={onDeepSearch} />
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Social Profiles */}
      {(activeFilter === 'all' || activeFilter === 'social_profiles') && results.social_profiles?.length > 0 && (
        <div className={cardContainerClass}>
            <CollapsibleCard title="Соціальні мережі" icon={<UserIcon className="w-6 h-6 text-cyan-400"/>} count={results.social_profiles.length}>
                {results.social_profiles.map((profile, index) => (
                    <div key={index} className="p-3 bg-black/20 rounded-md">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center flex-grow min-w-0">
                                {getPlatformIcon(profile.platform)}
                                <a href={profile.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex-grow min-w-0">
                                    <p className="font-bold text-cyan-200">{profile.platform}</p>
                                    <p className="text-sm text-cyan-100/70 truncate">@{profile.username}</p>
                                </a>
                            </div>
                            <ActionButtons text={profile.username} onDeepSearch={onDeepSearch} className="ml-2" />
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
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-cyan-200 truncate">{breach.name} <span className="text-xs font-normal text-cyan-100/60 ml-2">{breach.date}</span></p>
                            <ActionButtons text={breach.name} onDeepSearch={onDeepSearch} className="ml-2" />
                        </div>
                        {breach.compromised_data?.length > 0 && (
                            <div className="mt-3 border-t border-cyan-500/20 pt-3">
                                <h4 className="text-sm font-bold text-cyan-200/80 mb-2">Скомпрометовані дані:</h4>
                                <ul className="space-y-1.5 pl-1">
                                    {breach.compromised_data.map((item, i) => (
                                        <li key={i} className="flex items-center text-sm">
                                            <BreachIcon className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
                                            <span className="text-red-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </CollapsibleCard>
        </div>
      )}
      
      {/* Registry Mentions */}
      {(activeFilter === 'all' || activeFilter === 'registry_mentions') && results.registry_mentions?.length > 0 && (
        <div className={cardContainerClass}>
            <CollapsibleCard title="Згадки в реєстрах" icon={<RegistryIcon className="w-6 h-6 text-cyan-400"/>} count={results.registry_mentions.length}>
                {results.registry_mentions.map((mention, index) => {
                    const Wrapper = mention.url ? 'a' : 'div';
                    return (
                        <Wrapper 
                            key={index} 
                            href={mention.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="block p-3 bg-black/20 rounded-md hover:bg-cyan-500/20 transition-colors"
                        >
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-cyan-200 truncate">{mention.registry_name}</p>
                                <ActionButtons text={mention.registry_name} onDeepSearch={onDeepSearch} className="ml-2" />
                            </div>
                            <p className="text-sm text-cyan-100/70 mt-1 whitespace-pre-wrap">{mention.record_details}</p>
                        </Wrapper>
                    );
                })}
            </CollapsibleCard>
        </div>
      )}

      {/* Phone Info */}
      {(activeFilter === 'all' || activeFilter === 'phone_info') && results.phone_info?.length > 0 && (
        <div className={cardContainerClass}>
            <CollapsibleCard title="Інформація про телефон" icon={<PhoneIcon className="w-6 h-6 text-cyan-400"/>} count={results.phone_info.length}>
                {results.phone_info.map((info, index) => (
                    <div key={index} className="p-3 bg-black/20 rounded-md space-y-2">
                        <ActionableItem text={info.number} onDeepSearch={onDeepSearch}/>
                        {info.associated_names?.length > 0 && (
                            <div>
                                <p className="text-sm text-cyan-100/70 mb-2 pl-1">Пов'язані імена:</p>
                                <div className="flex flex-wrap gap-2">
                                    {info.associated_names.map((name, i) => (
                                        <div key={i} className="flex items-center gap-1 text-sm bg-black/30 rounded-full px-3 py-1">
                                            <span className="truncate max-w-40">{name}</span>
                                            <ActionButtons text={name} onDeepSearch={onDeepSearch} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-cyan-200 truncate">{mention.forum_name}</p>
                            <ActionButtons text={mention.forum_name} onDeepSearch={onDeepSearch} className="ml-2" />
                        </div>
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
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-cyan-200 truncate">{doc.source}</p>
                            <ActionButtons text={doc.source} onDeepSearch={onDeepSearch} className="ml-2" />
                        </div>
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
                {sourceDomainData.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-base font-bold text-cyan-200/80 mb-4 text-center">Розподіл джерел за доменами</h4>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sourceDomainData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="1 1" stroke="rgba(0, 192, 255, 0.1)" />
                                    <XAxis dataKey="name" tick={{ fill: '#e0e0e0', fontSize: 10 }} interval={0} angle={-45} textAnchor="end" />
                                    <YAxis allowDecimals={false} tick={{ fill: '#e0e0e0', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0, 192, 255, 0.1)' }}
                                        contentStyle={{
                                            backgroundColor: 'rgba(10, 10, 15, 0.9)',
                                            borderColor: 'rgba(0, 192, 255, 0.3)',
                                            color: '#e0e0e0',
                                            borderRadius: '0.5rem',
                                            boxShadow: '0 0 10px rgba(0, 192, 255, 0.3)'
                                        }}
                                        labelStyle={{ fontWeight: 'bold', color: '#00c0ff' }}
                                    />
                                    <Bar dataKey="count" fill="#00c0ff" name="К-ть джерел" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
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