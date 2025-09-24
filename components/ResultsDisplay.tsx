import React, { useState, useMemo } from 'react';
import type { OSINTResult, GroundingChunk, SocialProfile, AssociatedEntity, DataBreach, ForumMention, LeakedDocument, RegistryMention, PhoneInfo, WebMention } from '../types';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


interface ResultsDisplayProps {
  results: OSINTResult;
  sources: GroundingChunk[];
  activeFilter: string;
  onSearch: (query: string, isNewInvestigation: boolean) => void;
}

const ActionButtons: React.FC<{ text: string; onSearch: (text: string, isNew: boolean) => void; className?: string }> = ({ text, onSearch, className }) => (
    <div className={`flex items-center flex-shrink-0 ${className ?? ''}`}>
        <CopyButton textToCopy={text} />
        <button
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onSearch(text, false);
            }}
            className="p-1.5 rounded-md hover:bg-cyan-500/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label={`Deep search ${text}`}
            title={`Дослідити ${text}`}
        >
            <SearchPlusIcon className="w-5 h-5 text-cyan-300/70 transition-transform duration-200 ease-in-out group-hover:scale-125" />
        </button>
    </div>
);

const ActionableItem: React.FC<{text: string; url?: string; onSearch: (text: string, isNew: boolean) => void}> = ({ text, url, onSearch }) => {
    const content = url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline flex-grow truncate">{text}</a>
    ) : (
        <span className="truncate">{text}</span>
    );

    return (
        <div className="group flex items-center justify-between p-3 bg-black/20 rounded-md transition-colors hover:bg-black/30">
            {content}
            <ActionButtons text={text} onSearch={onSearch} className="ml-2" />
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
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 pt-0 text-cyan-100/90 space-y-3">
                {children}
            </div>
        </div>
      </div>
    );
};

const getPlatformIcon = (platform: string) => {
    const lowerPlatform = platform.toLowerCase();
    const iconClass = "w-8 h-8 mr-3 text-cyan-200 flex-shrink-0";
    if (lowerPlatform.includes('twitter') || lowerPlatform.includes('x.com')) return <TwitterIcon className={iconClass} />;
    if (lowerPlatform.includes('linkedin')) return <LinkedInIcon className={iconClass} />;
    if (lowerPlatform.includes('instagram')) return <InstagramIcon className={iconClass} />;
    return <UserIcon className="w-6 h-6 mr-3 text-cyan-400 flex-shrink-0" />;
}

const SmartSourceText: React.FC<{ text: string, sources: GroundingChunk[] }> = ({ text, sources }) => {
    const sourceDomains = useMemo(() => sources.map(s => {
        try {
            return { domain: new URL(s.web.uri).hostname.replace(/^www\./, ''), uri: s.web.uri };
        } catch {
            return null;
        }
    }).filter(Boolean), [sources]);

    const parts = useMemo(() => {
        if (!sourceDomains.length) {
            return [text];
        }
        
        // Create a regex to find all source domains in the text
        const regex = new RegExp(`(${sourceDomains.map(s => s!.domain.replace('.', '\\.')).join('|')})`, 'gi');
        
        return text.split(regex).map((part, index) => {
            const matchedSource = sourceDomains.find(s => s!.domain.toLowerCase() === part.toLowerCase());
            if (matchedSource) {
                return <a href={matchedSource.uri} key={index} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300 transition-colors">{part}</a>;
            }
            return part;
        });
    }, [text, sourceDomains]);

    return <>{parts}</>;
};


const AssociatedEntityCard: React.FC<{ entity: AssociatedEntity, onSearch: (query: string, isNew: boolean) => void, allSources: GroundingChunk[] }> = ({ entity, onSearch, allSources }) => {
    const renderItem = (item: string, type: 'email' | 'phone' | 'domain') => (
        <div key={item} className="group flex items-center gap-2 p-2 bg-black/20 rounded-md transition-colors hover:bg-black/30">
            {type === 'email' && <MailIcon className="w-4 h-4 text-cyan-300/70 flex-shrink-0" />}
            {type === 'phone' && <PhoneIcon className="w-4 h-4 text-cyan-300/70 flex-shrink-0" />}
            {type === 'domain' && <GlobeIcon className="w-4 h-4 text-cyan-300/70 flex-shrink-0" />}
            <span className="truncate flex-grow">{item}</span>
            <ActionButtons text={item} onSearch={onSearch} />
        </div>
    );

    const renderProfile = (profile: SocialProfile) => (
        <div key={profile.url} className="group flex items-start gap-3 p-2 bg-black/20 rounded-md transition-colors hover:bg-black/30">
            {getPlatformIcon(profile.platform)}
            <div className="flex-grow min-w-0">
                <a href={profile.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    <p className="font-bold text-cyan-200 text-sm">{profile.platform}</p>
                    <p className="text-xs text-cyan-100/70 truncate">@{profile.username}</p>
                </a>
                {profile.followers != null && (
                    <div className="flex items-center gap-1.5 text-xs text-cyan-300/80 mt-1">
                        <UsersIcon className="w-3.5 h-3.5" />
                        <span>{profile.followers.toLocaleString()}</span>
                    </div>
                )}
                 {profile.bio && <p className="text-xs text-cyan-100/60 mt-1 italic line-clamp-2">"{profile.bio}"</p>}
            </div>
            <div className="flex-shrink-0">
                <ActionButtons text={profile.username} onSearch={onSearch} />
            </div>
        </div>
    );

    return (
        <div className="glass-card rounded-lg p-4 border-2 border-cyan-500/30">
            <h4 className="text-lg font-orbitron text-cyan-200 mb-3 glowing-text">{entity.name}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {entity.emails.map(e => renderItem(e, 'email'))}
                {entity.phone_numbers.map(p => renderItem(p, 'phone'))}
                {entity.domains.map(d => renderItem(d, 'domain'))}
                {entity.social_profiles.map(p => renderProfile(p))}
            </div>

            {entity.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-cyan-500/20">
                    <h5 className="text-sm font-bold text-cyan-300/80 mb-2">Обґрунтування зв'язку:</h5>
                    <ul className="space-y-1.5 pl-1">
                        {entity.sources.map((source, i) => (
                            <li key={i} className="flex items-start text-sm">
                                <LinkIcon className="w-4 h-4 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-cyan-100/80"><SmartSourceText text={source} sources={allSources} /></span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

interface ContextualSearchProps {
    items: any[];
    dataExtractor: (item: any) => string;
    categoryLabel: string;
    onSearch: (query: string, isNewInvestigation: boolean) => void;
  }
  
const ContextualSearch: React.FC<ContextualSearchProps> = ({ items, dataExtractor, categoryLabel, onSearch }) => {
    if (!items || items.length === 0) return null;

    const handleContextualSearch = () => {
        const query = items.map(dataExtractor).filter(Boolean).join(', ');
        if (query) {
            onSearch(query, true);
        }
    };

    return (
        <div className="mb-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30 flex items-center justify-between gap-4">
            <p className="text-sm text-cyan-200">
                Створити нове розслідування на основі всіх знайдених <span className="font-bold">{categoryLabel}</span>.
            </p>
            <button
                onClick={handleContextualSearch}
                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 text-sm flex-shrink-0"
            >
                <SearchIcon className="w-4 h-4" />
                <span>Дослідити всі</span>
            </button>
        </div>
    );
}

const NoDataMessage: React.FC = () => (
    <div className="text-center text-cyan-100/60 p-4">
        Для цієї категорії не знайдено конкретних даних.
    </div>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, sources, activeFilter, onSearch }) => {
  const isFiltered = activeFilter !== 'all';
  const cardContainerClass = isFiltered ? 'lg:col-span-3' : '';

  const sourceDomainData = useMemo(() => {
    if (!sources || sources.length === 0) return [];

    // FIX: The accumulator `acc` in `reduce` was inferred as `{}`, causing TypeScript errors. By explicitly typing `acc` as `Record<string, number>`, we ensure type safety for the arithmetic operation.
    const domainCounts = sources.reduce((acc: Record<string, number>, source: GroundingChunk) => {
        try {
            const domain = new URL(source.web.uri).hostname.replace('www.', '');
            acc[domain] = (acc[domain] || 0) + 1;
        } catch (e) {
            console.error("Invalid URL in sources:", source.web.uri);
        }
        return acc;
    }, {});

    return Object.entries(domainCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);
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
                        <ActionableItem text={results.full_name} onSearch={onSearch} />
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Associated Entities */}
      {((activeFilter === 'all' && results.associated_entities?.length > 0) || activeFilter === 'associated_entities') && (
        <div className="lg:col-span-3">
            <CollapsibleCard title="Пов'язані особи" icon={<UsersIcon className="w-6 h-6 text-cyan-400"/>} count={results.associated_entities?.length || 0}>
                {results.associated_entities?.length > 0 ? (
                    <>
                        {activeFilter === 'associated_entities' && (
                            <ContextualSearch items={results.associated_entities} dataExtractor={(item: AssociatedEntity) => item.name} categoryLabel="осіб" onSearch={onSearch} />
                        )}
                        <div className="space-y-4">
                            {results.associated_entities.map((entity, index) => (
                                <AssociatedEntityCard key={index} entity={entity} onSearch={onSearch} allSources={sources} />
                            ))}
                        </div>
                    </>
                ) : (
                    <NoDataMessage />
                )}
            </CollapsibleCard>
        </div>
      )}

      {/* Social Profiles */}
      {((activeFilter === 'all' && results.social_profiles?.length > 0) || activeFilter === 'social_profiles') && (
        <div className={cardContainerClass}>
            <CollapsibleCard title="Соціальні мережі" icon={<UserIcon className="w-6 h-6 text-cyan-400"/>} count={results.social_profiles?.length || 0}>
                {results.social_profiles?.length > 0 ? (
                    <>
                        {activeFilter === 'social_profiles' && (
                            <ContextualSearch items={results.social_profiles} dataExtractor={(item: SocialProfile) => item.username} categoryLabel="соц. профілів" onSearch={onSearch} />
                        )}
                        {results.social_profiles.map((profile, index) => (
                            <div key={index} className="group p-3 bg-black/20 rounded-md transition-colors hover:bg-black/30">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start flex-grow min-w-0">
                                        {getPlatformIcon(profile.platform)}
                                        <div className="flex-grow min-w-0">
                                            <a href={profile.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                <p className="font-bold text-cyan-200">{profile.platform}</p>
                                                <p className="text-sm text-cyan-100/70 truncate">@{profile.username}</p>
                                            </a>
                                            {profile.followers != null && (
                                                <div className="flex items-center gap-1.5 text-xs text-cyan-300/80 mt-2">
                                                    <UsersIcon className="w-4 h-4" />
                                                    <span className="font-semibold">{profile.followers.toLocaleString()} підписників</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <ActionButtons text={profile.username} onSearch={onSearch} className="ml-2 flex-shrink-0" />
                                </div>
                                {profile.bio && <p className="text-sm text-cyan-100/80 mt-2 pt-2 border-t border-cyan-500/10 italic">"{profile.bio}"</p>}
                            </div>
                        ))}
                    </>
                ) : (
                    <NoDataMessage />
                )}
            </CollapsibleCard>
        </div>
      )}

      {/* Emails */}
      {((activeFilter === 'all' && results.emails?.length > 0) || activeFilter === 'emails') && (
         <div className={cardContainerClass}>
            <CollapsibleCard title="Адреси електронної пошти" icon={<MailIcon className="w-6 h-6 text-cyan-400"/>} count={results.emails?.length || 0}>
                {results.emails?.length > 0 ? (
                    <>
                        {activeFilter === 'emails' && (
                            <ContextualSearch items={results.emails} dataExtractor={(item: string) => item} categoryLabel="Email-адрес" onSearch={onSearch} />
                        )}
                        {results.emails.map((email, index) => (
                            <ActionableItem key={index} text={email} onSearch={onSearch}/>
                        ))}
                    </>
                ) : (
                    <NoDataMessage />
                )}
            </CollapsibleCard>
        </div>
      )}

      {/* Associated Domains */}
      {((activeFilter === 'all' && results.associated_domains?.length > 0) || activeFilter === 'associated_domains') && (
        <div className={cardContainerClass}>
            <CollapsibleCard title="Пов'язані домени" icon={<GlobeIcon className="w-6 h-6 text-cyan-400"/>} count={results.associated_domains?.length || 0}>
                {results.associated_domains?.length > 0 ? (
                    <>
                        {activeFilter === 'associated_domains' && (
                            <ContextualSearch items={results.associated_domains} dataExtractor={(item: string) => item} categoryLabel="доменів" onSearch={onSearch} />
                        )}
                        {results.associated_domains.map((domain, index) => (
                            <ActionableItem key={index} text={domain} url={`http://${domain}`} onSearch={onSearch}/>
                        ))}
                    </>
                ) : (
                    <NoDataMessage />
                )}
            </CollapsibleCard>
        </div>
      )}

      {/* Data Breaches */}
      {((activeFilter === 'all' && results.data_breaches?.length > 0) || activeFilter === 'data_breaches') && (
        <div className={cardContainerClass}>
            <CollapsibleCard title="Витоки даних" icon={<BreachIcon className="w-6 h-6 text-cyan-400"/>} count={results.data_breaches?.length || 0}>
                {results.data_breaches?.length > 0 ? (
                    <>
                        {activeFilter === 'data_breaches' && (
                            <ContextualSearch items={results.data_breaches} dataExtractor={(item: DataBreach) => item.name} categoryLabel="витоків даних" onSearch={onSearch} />
                        )}
                        {results.data_breaches.map((breach, index) => (
                            <div key={index} className="group p-3 bg-black/20 rounded-md transition-colors hover:bg-black/30">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-cyan-200 truncate">{breach.name} <span className="text-xs font-normal text-cyan-100/60 ml-2">{breach.date}</span></p>
                                    <ActionButtons text={breach.name} onSearch={onSearch} className="ml-2" />
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
                    </>
                ) : (
                    <NoDataMessage />
                )}
            </CollapsibleCard>
        </div>
      )}
      
      {/* Registry Mentions */}
      {((activeFilter === 'all' && results.registry_mentions?.length > 0) || activeFilter === 'registry_mentions') && (
        <div className={cardContainerClass}>
            <CollapsibleCard title="Згадки в реєстрах" icon={<RegistryIcon className="w-6 h-6 text-cyan-400"/>} count={results.registry_mentions?.length || 0}>
                {results.registry_mentions?.length > 0 ? (
                    <>
                        {activeFilter === 'registry_mentions' && (
                            <ContextualSearch items={results.registry_mentions} dataExtractor={(item: RegistryMention) => item.registry_name} categoryLabel="згадок в реєстрах" onSearch={onSearch} />
                        )}
                        {results.registry_mentions.map((mention, index) => {
                            const Wrapper = mention.url ? 'a' : 'div';
                            const wrapperProps = mention.url 
                                ? { href: mention.url, target: "_blank", rel: "noopener noreferrer" } 
                                : {};

                            return (
                                <Wrapper 
                                    key={index}
                                    {...wrapperProps} 
                                    className="group block p-3 bg-black/20 rounded-md hover:bg-cyan-500/20 transition-colors"
                                >
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold text-cyan-200 truncate">{mention.registry_name}</p>
                                        <ActionButtons text={mention.registry_name} onSearch={onSearch} className="ml-2" />
                                    </div>
                                    <p className="text-sm text-cyan-100/70 mt-1 whitespace-pre-wrap">{mention.record_details}</p>
                                </Wrapper>
                            );
                        })}
                    </>
                ) : (
                    <NoDataMessage />
                )}
            </CollapsibleCard>
        </div>
      )}

      {/* Phone Info */}
      {((activeFilter === 'all' && results.phone_info?.length > 0) || activeFilter === 'phone_info') && (
        <div className={cardContainerClass}>
            <CollapsibleCard title="Інформація про телефон" icon={<PhoneIcon className="w-6 h-6 text-cyan-400"/>} count={results.phone_info?.length || 0}>
                {results.phone_info?.length > 0 ? (
                    <>
                        {activeFilter === 'phone_info' && (
                            <ContextualSearch items={results.phone_info} dataExtractor={(item: PhoneInfo) => item.number} categoryLabel="номерів телефону" onSearch={onSearch} />
                        )}
                        {results.phone_info.map((info, index) => (
                            <div key={index} className="p-3 bg-black/20 rounded-md space-y-2">
                                <ActionableItem text={info.number} onSearch={onSearch}/>
                                {info.associated_names?.length > 0 && (
                                    <div>
                                        <p className="text-sm text-cyan-100/70 mb-2 pl-1">Пов'язані імена:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {info.associated_names.map((name, i) => (
                                                <div key={i} className="group flex items-center gap-1 text-sm bg-black/30 rounded-full px-3 py-1 transition-colors hover:bg-black/40">
                                                    <span className="truncate max-w-40">{name}</span>
                                                    <ActionButtons text={name} onSearch={onSearch} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                ) : (
                    <NoDataMessage />
                )}
            </CollapsibleCard>
        </div>
      )}

      {/* Forum Mentions */}
      {((activeFilter === 'all' && results.forum_mentions?.length > 0) || activeFilter === 'forum_mentions') && (
        <div className={cardContainerClass}>
            <CollapsibleCard title="Згадки на форумах" icon={<ForumIcon className="w-6 h-6 text-cyan-400"/>} count={results.forum_mentions?.length || 0}>
                {results.forum_mentions?.length > 0 ? (
                    <>
                        {activeFilter === 'forum_mentions' && (
                            <ContextualSearch items={results.forum_mentions} dataExtractor={(item: ForumMention) => item.forum_name} categoryLabel="згадок на форумах" onSearch={onSearch} />
                        )}
                        {results.forum_mentions.map((mention, index) => (
                            <a href={mention.url} target="_blank" rel="noopener noreferrer" key={index} className="group block p-3 bg-black/20 rounded-md hover:bg-cyan-500/20 transition-colors">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-cyan-200 truncate">{mention.forum_name}</p>
                                    <ActionButtons text={mention.forum_name} onSearch={onSearch} className="ml-2" />
                                </div>
                                <p className="text-sm text-cyan-100/70 mt-1 italic">"{mention.post_snippet}"</p>
                            </a>
                        ))}
                    </>
                ) : (
                    <NoDataMessage />
                )}
            </CollapsibleCard>
        </div>
      )}

      {/* Leaked Documents */}
      {((activeFilter === 'all' && results.leaked_documents?.length > 0) || activeFilter === 'leaked_documents') && (
         <div className="lg:col-span-3">
            <CollapsibleCard title="Злиті документи / Вставки" icon={<PasteIcon className="w-6 h-6 text-cyan-400"/>} count={results.leaked_documents?.length || 0}>
                {results.leaked_documents?.length > 0 ? (
                    <>
                        {activeFilter === 'leaked_documents' && (
                            <ContextualSearch items={results.leaked_documents} dataExtractor={(item: LeakedDocument) => item.source} categoryLabel="злитих документів" onSearch={onSearch} />
                        )}
                        {results.leaked_documents.map((doc, index) => (
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" key={index} className="group block p-3 bg-black/20 rounded-md hover:bg-cyan-500/20 transition-colors">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-cyan-200 truncate">{doc.source}</p>
                                    <ActionButtons text={doc.source} onSearch={onSearch} className="ml-2" />
                                </div>
                                <p className="text-sm text-cyan-100/70 mt-1 font-mono bg-black/30 p-2 rounded"><code>{doc.snippet}</code></p>
                            </a>
                        ))}
                    </>
                ) : (
                    <NoDataMessage />
                )}
            </CollapsibleCard>
        </div>
      )}

      {/* Web Mentions */}
      {((activeFilter === 'all' && results.web_mentions?.length > 0) || activeFilter === 'web_mentions') && (
        <div className="lg:col-span-3">
            <CollapsibleCard title="Згадки в мережі" icon={<LinkIcon className="w-6 h-6 text-cyan-400"/>} count={results.web_mentions?.length || 0}>
                {results.web_mentions?.length > 0 ? (
                    <>
                        {activeFilter === 'web_mentions' && (
                            <ContextualSearch items={results.web_mentions} dataExtractor={(item: WebMention) => item.title} categoryLabel="згадок в мережі" onSearch={onSearch} />
                        )}
                        {results.web_mentions.map((mention, index) => (
                            <a href={mention.url} target="_blank" rel="noopener noreferrer" key={index} className="block p-3 bg-black/20 rounded-md hover:bg-cyan-500/20 transition-colors">
                                <p className="font-bold text-cyan-200">{mention.title}</p>
                                <p className="text-sm text-cyan-100/70 mt-1">{mention.snippet}</p>
                            </a>
                        ))}
                    </>
                ) : (
                    <NoDataMessage />
                )}
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