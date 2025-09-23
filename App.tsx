import React, { useState } from 'react';
import { SearchInput } from './components/SearchInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingIndicator } from './components/LoadingIndicator';
import { LogoIcon } from './components/icons/LogoIcon';
import { investigateTarget } from './services/geminiService';
import type { OSINTResult, GroundingChunk } from './types';
import { FilterControls, FilterOption } from './components/FilterControls';

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<OSINTResult | null>(null);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setError('Будь ласка, введіть ціль для розслідування.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults(null);
    setSources([]);
    setActiveFilter('all');

    try {
      const response = await investigateTarget(searchTerm);
      if (response) {
        setResults(response.data);
        setSources(response.sources);
      } else {
        setError('Не вдалося отримати дійсну відповідь від служби розслідувань.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? `Сталася помилка: ${err.message}` : 'Сталася невідома помилка.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateFilters = (data: OSINTResult): FilterOption[] => {
    const filters: FilterOption[] = [];
    if (data.social_profiles?.length) filters.push({ key: 'social_profiles', label: 'Соціальні мережі', count: data.social_profiles.length });
    if (data.emails?.length) filters.push({ key: 'emails', label: 'Email', count: data.emails.length });
    if (data.associated_domains?.length) filters.push({ key: 'associated_domains', label: 'Домени', count: data.associated_domains.length });
    if (data.data_breaches?.length) filters.push({ key: 'data_breaches', label: 'Витоки даних', count: data.data_breaches.length });
    if (data.phone_info?.length) filters.push({ key: 'phone_info', label: 'Телефон', count: data.phone_info.length });
    if (data.forum_mentions?.length) filters.push({ key: 'forum_mentions', label: 'Форуми', count: data.forum_mentions.length });
    if (data.leaked_documents?.length) filters.push({ key: 'leaked_documents', label: 'Документи', count: data.leaked_documents.length });
    if (data.web_mentions?.length) filters.push({ key: 'web_mentions', label: 'Згадки в мережі', count: data.web_mentions.length });
    return filters;
  };

  return (
    <div className="min-h-screen bg-grid-cyan-500/10 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4">
            <LogoIcon className="w-12 h-12 text-cyan-400" />
            <h1 className="text-4xl md:text-5xl font-orbitron font-bold glowing-text text-cyan-300">
              OSINT-слідчий
            </h1>
          </div>
          <p className="mt-2 text-cyan-100/70">
            Збір розвідданих з відкритих джерел за допомогою ШІ.
          </p>
        </header>

        <main>
          <SearchInput onSearch={handleSearch} isLoading={isLoading} />
          
          {error && (
            <div className="mt-8 text-center glass-card p-4 rounded-lg border-red-500/50">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {isLoading && <LoadingIndicator />}

          {!isLoading && !results && !error && (
             <div className="mt-12 text-center text-gray-500">
                <p>Введіть ціль (наприклад, ім'я користувача, email, домен), щоб почати розслідування.</p>
                <p className="text-sm mt-2">Результати будуть відображені тут.</p>
             </div>
          )}

          {!isLoading && results && (
            <div className="mt-8">
              <FilterControls 
                filters={generateFilters(results)}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
              <ResultsDisplay results={results} sources={sources} activeFilter={activeFilter} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;