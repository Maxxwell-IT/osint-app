import React, { useState, useEffect } from 'react';
import { SearchInput } from './components/SearchInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingIndicator } from './components/LoadingIndicator';
import { LogoIcon } from './components/icons/LogoIcon';
import { investigateTarget } from './services/geminiService';
import type { OSINTResult, GroundingChunk, HistoryEntry } from './types';
import { FilterControls, FilterOption } from './components/FilterControls';
import { ErrorDisplay } from './components/ErrorDisplay';
import { RelationshipGraph } from './components/RelationshipGraph';
import { ExportButton } from './components/ExportButton';
import { HistorySidebar } from './components/HistorySidebar';
import { HistoryIcon } from './components/icons/HistoryIcon';

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<OSINTResult | null>(null);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [investigationPath, setInvestigationPath] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('osint-history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
      localStorage.removeItem('osint-history');
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      setActiveFilter(hash || 'all');
    };

    handleHashChange(); // Set initial filter based on the current hash
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleSearch = async (searchTerm: string, isNewInvestigation: boolean = true) => {
    if (!searchTerm.trim()) {
      setError('Будь ласка, введіть ціль для розслідування.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults(null);
    setSources([]);
    setQuery(searchTerm);
    
    const newPath = isNewInvestigation 
        ? [searchTerm] 
        : [...investigationPath.filter(p => p !== searchTerm), searchTerm];
    setInvestigationPath(newPath);

    try {
      const response = await investigateTarget(searchTerm);
      if (response) {
        setResults(response.data);
        setSources(response.sources);

        // Save to history
        const rootTarget = newPath[0];
        const newHistoryEntry: HistoryEntry = {
            id: rootTarget, // Use the root target as a stable ID
            timestamp: Date.now(),
            target: rootTarget,
            investigationPath: newPath,
            results: response.data,
            sources: response.sources,
        };

        setHistory(prevHistory => {
            const otherHistory = prevHistory.filter(h => h.target !== rootTarget);
            const updatedHistory = [newHistoryEntry, ...otherHistory];
            localStorage.setItem('osint-history', JSON.stringify(updatedHistory));
            return updatedHistory;
        });

      } else {
        setError('Не вдалося отримати дійсну відповідь від служби розслідувань. Спробуйте ще раз.');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Сталася невідома помилка.';
  
      let userFriendlyMessage = `Сталася непередбачувана помилка. Якщо проблема не зникає, спробуйте оновити сторінку. Деталі: ${errorMessage}`;
  
      if (errorMessage.includes("malformed response") || errorMessage.includes("No valid JSON")) {
          userFriendlyMessage = "ШІ повернув відповідь у неочікуваному форматі. Це може бути тимчасовою проблемою. Будь ласка, спробуйте виконати запит ще раз або трохи змінити його.";
      } else if (errorMessage.includes("Failed to communicate")) {
          userFriendlyMessage = "Не вдалося зв'язатися зі службою розслідувань. Перевірте ваше інтернет-з'єднання та спробуйте знову.";
      }
      
      setError(userFriendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFromHistory = (entry: HistoryEntry) => {
    setQuery(entry.investigationPath[entry.investigationPath.length - 1]);
    setResults(entry.results);
    setSources(entry.sources);
    setInvestigationPath(entry.investigationPath);
    setError(null);
    setIsHistoryOpen(false); // Close sidebar on selection
    window.location.hash = '#all';
  };

  const handleClearHistory = () => {
    if (window.confirm("Ви впевнені, що хочете видалити всю історію розслідувань? Цю дію неможливо скасувати.")) {
      setHistory([]);
      localStorage.removeItem('osint-history');
    }
  };

  const generateFilters = (data: OSINTResult): FilterOption[] => {
    const filters: FilterOption[] = [];
    if (data.associated_entities?.length) filters.push({ key: 'associated_entities', label: 'Пов\'язані особи', count: data.associated_entities.length });
    if (data.social_profiles?.length) filters.push({ key: 'social_profiles', label: 'Соціальні мережі', count: data.social_profiles.length });
    if (data.emails?.length) filters.push({ key: 'emails', label: 'Email', count: data.emails.length });
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
    <div className="min-h-screen bg-grid-cyan-500/10">
       <HistorySidebar 
        history={history} 
        onLoad={handleLoadFromHistory} 
        onClear={handleClearHistory} 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      <div className="lg:ml-72 transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              <header className="text-center mb-8">
                <div className="flex items-center justify-center gap-4">
                  <button 
                      onClick={() => setIsHistoryOpen(true)} 
                      className="lg:hidden p-2 -ml-2 rounded-md text-cyan-400 hover:bg-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      aria-label="Відкрити історію"
                    >
                        <HistoryIcon className="w-7 h-7"/>
                  </button>
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
                {error && <ErrorDisplay message={error} onClose={() => setError(null)} />}

                {!isLoading && (
                  <>
                    {investigationPath.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mb-4 animate-fade-in">
                          {investigationPath.map((item, index) => (
                              <React.Fragment key={index}>
                                  {index > 0 && <span className="text-cyan-400 text-lg">/</span>}
                                  <div className={`px-3 py-1 rounded-md text-sm transition-colors ${index === investigationPath.length - 1 ? 'bg-cyan-400 text-black font-bold' : 'bg-cyan-500/10 text-cyan-300'}`}>
                                      <span className="font-bold mr-1">{index === 0 ? 'Ціль:' : 'Лід:'}</span>
                                      <span>{item}</span>
                                  </div>
                              </React.Fragment>
                          ))}
                      </div>
                    )}
                    <SearchInput onSearch={(newQuery) => handleSearch(newQuery, true)} isLoading={isLoading} query={query} setQuery={setQuery} />
                  </>
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
                    <RelationshipGraph target={investigationPath[investigationPath.length - 1]} results={results} />
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <FilterControls 
                        filters={generateFilters(results)}
                        activeFilter={activeFilter}
                      />
                      <ExportButton 
                        results={results} 
                        sources={sources} 
                        target={investigationPath[investigationPath.length - 1]}
                      />
                    </div>
                    <ResultsDisplay results={results} sources={sources} activeFilter={activeFilter} onSearch={handleSearch} />
                  </div>
                )}
              </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
