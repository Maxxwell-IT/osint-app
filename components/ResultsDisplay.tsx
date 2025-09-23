import React from 'react';
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


interface ResultsDisplayProps {
  results: OSINTResult;
  sources: GroundingChunk[];
  activeFilter: string;
}

const ResultCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode, count?: number }> = ({ title, icon, children, count }) => (
  <div className="glass-card rounded-lg p-6 flex flex-col h-full">
    <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
            {icon}
            <h3 className="text-xl font-orbitron text-cyan-300">{title}</h3>
        </div>
        {count !== undefined && <span className="text-sm font-bold bg-cyan-500/20 text-cyan-300 rounded-full px-3 py-1">{count}</span>}
    </div>
    <div className="flex-grow overflow-y-auto text-cyan-100/90 space-y-3 max-h-96">
        {children}
    </div>
  </div>
);


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, sources, activeFilter }) => {
  const isFiltered = activeFilter !== 'all';
  const cardContainerClass = isFiltered ? 'lg:col-span-3' : '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in mt-6">
        
      {/* Summary */}
      <div className="lg:col-span-3">
        <ResultCard title="Загальний звіт" icon={<CodeIcon className="w-6 h-6 text-cyan-400"/>}>
            <p className="text-base leading-relaxed">{results.summary}</p>
            {results.full_name && <p className="mt-4"><strong className="text-cyan-300">Можливе повне ім'я:</strong> {results.full_name}</p>}
        </ResultCard>
      </div>

      {/* Social Profiles */}
      {(activeFilter === 'all' || activeFilter === 'social_profiles') && results.social_profiles?.length > 0 && (
        <div className={cardContainerClass}>
            <ResultCard title="Соціальні мережі" icon={<UserIcon className="w-6 h-6 text-cyan-400"/>} count={results.social_profiles.length}>
                {results.social_profiles.map((profile, index) => (
                    <a href={profile.url} target="_blank" rel="noopener noreferrer" key={index} className="block p-3 bg-black/20 rounded-md hover:bg-cyan-500/20 transition-colors">
                    <p className="font-bold text-cyan-200">{profile.platform}</p>
                    <p className="text-sm text-cyan-100/70 truncate">@{profile.username}</p>
                    </a>
                ))}
            </ResultCard>
        </div>
      )}

      {/* Emails */}
      {(activeFilter === 'all' || activeFilter === 'emails') && results.emails?.length > 0 && (
         <div className={cardContainerClass}>
            <ResultCard title="Адреси електронної пошти" icon={<MailIcon className="w-6 h-6 text-cyan-400"/>} count={results.emails.length}>
                {results.emails.map((email, index) => (
                    <p key={index} className="p-3 bg-black/20 rounded-md select-all">{email}</p>
                ))}
            </ResultCard>
        </div>
      )}

      {/* Associated Domains */}
      {(activeFilter === 'all' || activeFilter === 'associated_domains') && results.associated_domains?.length > 0 && (
        <div className={cardContainerClass}>
            <ResultCard title="Пов'язані домени" icon={<GlobeIcon className="w-6 h-6 text-cyan-400"/>} count={results.associated_domains.length}>
                {results.associated_domains.map((domain, index) => (
                    <a href={`http://${domain}`} target="_blank" rel="noopener noreferrer" key={index} className="block p-3 bg-black/20 rounded-md hover:bg-cyan-500/20 transition-colors">
                    <p>{domain}</p>
                    </a>
                ))}
            </ResultCard>
        </div>
      )}

      {/* Data Breaches */}
      {(activeFilter === 'all' || activeFilter === 'data_breaches') && results.data_breaches?.length > 0 && (
        <div className={cardContainerClass}>
            <ResultCard title="Витоки даних" icon={<BreachIcon className="w-6 h-6 text-cyan-400"/>} count={results.data_breaches.length}>
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
            </ResultCard>
        </div>
      )}

      {/* Phone Info */}
      {(activeFilter === 'all' || activeFilter === 'phone_info') && results.phone_info?.length > 0 && (
        <div className={cardContainerClass}>
            <ResultCard title="Інформація про телефон" icon={<PhoneIcon className="w-6 h-6 text-cyan-400"/>} count={results.phone_info.length}>
                {results.phone_info.map((info, index) => (
                    <div key={index} className="p-3 bg-black/20 rounded-md">
                        <p className="font-bold text-cyan-200 select-all">{info.number}</p>
                        <p className="text-sm text-cyan-100/70 mt-1">Пов'язані імена: {info.associated_names.join(', ')}</p>
                    </div>
                ))}
            </ResultCard>
        </div>
      )}

      {/* Forum Mentions */}
      {(activeFilter === 'all' || activeFilter === 'forum_mentions') && results.forum_mentions?.length > 0 && (
        <div className={cardContainerClass}>
            <ResultCard title="Згадки на форумах" icon={<ForumIcon className="w-6 h-6 text-cyan-400"/>} count={results.forum_mentions.length}>
                {results.forum_mentions.map((mention, index) => (
                    <a href={mention.url} target="_blank" rel="noopener noreferrer" key={index} className="block p-3 bg-black/20 rounded-md hover:bg-cyan-500/20 transition-colors">
                        <p className="font-bold text-cyan-200">{mention.forum_name}</p>
                        <p className="text-sm text-cyan-100/70 mt-1 italic">"{mention.post_snippet}"</p>
                    </a>
                ))}
            </ResultCard>
        </div>
      )}

      {/* Leaked Documents */}
      {(activeFilter === 'all' || activeFilter === 'leaked_documents') && results.leaked_documents?.length > 0 && (
         <div className="lg:col-span-3">
            <ResultCard title="Злиті документи / Вставки" icon={<PasteIcon className="w-6 h-6 text-cyan-400"/>} count={results.leaked_documents.length}>
                {results.leaked_documents.map((doc, index) => (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" key={index} className="block p-3 bg-black/20 rounded-md hover:bg-cyan-500/20 transition-colors">
                        <p className="font-bold text-cyan-200">{doc.source}</p>
                        <p className="text-sm text-cyan-100/70 mt-1 font-mono bg-black/30 p-2 rounded"><code>{doc.snippet}</code></p>
                    </a>
                ))}
            </ResultCard>
        </div>
      )}

      {/* Web Mentions */}
      {(activeFilter === 'all' || activeFilter === 'web_mentions') && results.web_mentions?.length > 0 && (
        <div className="lg:col-span-3">
            <ResultCard title="Згадки в мережі" icon={<LinkIcon className="w-6 h-6 text-cyan-400"/>} count={results.web_mentions.length}>
                {results.web_mentions.map((mention, index) => (
                    <a href={mention.url} target="_blank" rel="noopener noreferrer" key={index} className="block p-3 bg-black/20 rounded-md hover:bg-cyan-500/20 transition-colors">
                        <p className="font-bold text-cyan-200">{mention.title}</p>
                        <p className="text-sm text-cyan-100/70 mt-1">{mention.snippet}</p>
                    </a>
                ))}
            </ResultCard>
        </div>
      )}
      
      {/* Sources */}
      {sources.length > 0 && (
          <div className="lg:col-span-3">
            <ResultCard title="Джерела розслідування" icon={<GlobeIcon className="w-6 h-6 text-cyan-400"/>} count={sources.length}>
                <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
                    {sources.map((source, index) => (
                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" key={index} className="block mb-2 p-2 bg-black/20 rounded-md hover:bg-cyan-500/20 transition-colors break-inside-avoid">
                            <p className="text-sm text-cyan-200 truncate">{source.web.title || new URL(source.web.uri).hostname}</p>
                        </a>
                    ))}
                </div>
            </ResultCard>
          </div>
      )}

    </div>
  );
};