
import React, { useState, useEffect } from 'react';
import { ChatInput } from './components/ChatInput';
import { LoadingIndicator } from './components/LoadingIndicator';
import { LogoIcon } from './components/icons/LogoIcon';
import { getConversationalAnalysis } from './services/geminiService';
import type { OSINTResult, GroundingChunk, HistoryEntry, GeminiContent, ChatMessage, AnalysisData } from './types';
import { ErrorDisplay } from './components/ErrorDisplay';
import { HistorySidebar } from './components/HistorySidebar';
import { HistoryIcon } from './components/icons/HistoryIcon';
import { BotResponse } from './components/BotResponse';
import { ChatInterface } from './components/ChatInterface';
import { PlusCircleIcon } from './components/icons/PlusCircleIcon';
import { AdvancedSearchModal } from './components/AdvancedSearchModal';

const WelcomeScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <LogoIcon className="w-24 h-24 text-blue-500/30 mb-6" />
        <h2 className="text-3xl font-bold text-slate-200 font-['Inter']">Вітаю в DeepSerch</h2>
        <p className="mt-2 text-slate-400 max-w-md">
            Введіть ціль для аналізу в полі нижче, щоб розпочати дослідження. Ваш діалог з'явиться ліворуч, а детальні результати — тут.
        </p>
    </div>
);


const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [conversationHistory, setConversationHistory] = useState<GeminiContent[]>([]);
  const [currentTarget, setCurrentTarget] = useState<string>('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [highlightedItem, setHighlightedItem] = useState<{ key: string; text: string } | null>(null);
  const [isAnalysisVisible, setIsAnalysisVisible] = useState<boolean>(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState<boolean>(false);


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
    startNewAnalysis();
  }, []);

  const startNewAnalysis = () => {
    setConversationHistory([]);
    setCurrentTarget('');
    setSelectedAnalysis(null);
    setSelectedMessageId(null);
    setHighlightedItem(null);
    setIsAnalysisVisible(false);
    setMessages([
        { 
            id: Date.now(), 
            sender: 'bot', 
            content: (
                <div className="text-slate-300">
                    <p className="font-bold">Вітаю! Я — DeepSerch аналітик.</p>
                    <p>Введіть ціль (наприклад, ім'я користувача, email, домен), щоб почати аналіз.</p>
                </div>
            )
        }
    ]);
  }

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setError('Будь ласка, введіть ціль для аналізу.');
      return;
    }
    
    const isNewAnalysis = conversationHistory.length === 0;
    if (isNewAnalysis) {
        setCurrentTarget(searchTerm);
    }

    setIsLoading(true);
    setError(null);
    setHighlightedItem(null);
    
    const userMessage: ChatMessage = { id: Date.now(), sender: 'user', content: searchTerm };
    const loadingMessage: ChatMessage = { id: Date.now() + 1, sender: 'bot', content: <LoadingIndicator /> };
    setMessages(prev => [...prev, userMessage, loadingMessage]);

    try {
      const response = await getConversationalAnalysis(searchTerm, conversationHistory);
      if (response) {
        const newConversation: GeminiContent[] = [
            ...conversationHistory,
            { role: 'user', parts: [{ text: searchTerm }] },
            { role: 'model', parts: [{ text: response.fullResponse }] },
        ];
        const newPath = newConversation.filter(m => m.role === 'user').map(m => m.parts[0].text);

        const analysisData: AnalysisData = {
            results: response.data,
            sources: response.sources,
            target: newPath[newPath.length - 1],
            investigationPath: newPath,
        };

        const resultsMessage: ChatMessage = { 
            id: Date.now() + 1, 
            sender: 'bot', 
            content: (
                 <div>
                    <p className="font-bold mb-1">Аналіз завершено.</p>
                    <p className="text-sm text-slate-400">Натисніть, щоб переглянути повний звіт.</p>
                </div>
            ),
            analysisData
        };
        setMessages(prev => [...prev.slice(0, -1), resultsMessage]);
        setSelectedAnalysis(analysisData);
        setSelectedMessageId(resultsMessage.id);
        setIsAnalysisVisible(true);

        setConversationHistory(newConversation);

        const rootTarget = isNewAnalysis ? searchTerm : currentTarget;
        const newHistoryEntry: HistoryEntry = {
            id: rootTarget,
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
        throw new Error('Не вдалося отримати дійсну відповідь від аналітичної служби. Спробуйте ще раз.');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Сталася невідома помилка.';
  
      let userFriendlyMessage = `Сталася непередбачувана помилка. Якщо проблема не зникає, спробуйте оновити сторінку. Деталі: ${errorMessage}`;
  
      if (errorMessage.includes("malformed response") || errorMessage.includes("No valid JSON")) {
          userFriendlyMessage = "ШІ повернув відповідь у неочікуваному форматі. Це може бути тимчасовою проблемою. Будь ласка, спробуйте виконати запит ще раз або трохи змінити його.";
      } else if (errorMessage.includes("Failed to communicate")) {
          userFriendlyMessage = "Не вдалося зв'язатися з аналітичною службою. Перевірте ваше інтернет-з'єднання та спробуйте знову.";
      }
      
      const errorMessageContent = <p className="text-red-300">{userFriendlyMessage}</p>
      const errorMessageObject: ChatMessage = { id: Date.now() + 1, sender: 'bot', content: errorMessageContent };
      setMessages(prev => [...prev.slice(0, -1), errorMessageObject]);
      setError(userFriendlyMessage); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFromHistory = (entry: HistoryEntry) => {
    startNewAnalysis();
    setError(null);
    setHighlightedItem(null);

     const analysisData: AnalysisData = {
        results: entry.results,
        sources: entry.sources,
        target: entry.investigationPath[entry.investigationPath.length - 1],
        investigationPath: entry.investigationPath,
    };
    
    const userMessage: ChatMessage = { id: Date.now(), sender: 'user', content: `Завантажити аналіз для: ${entry.target}`};
    const botMessage: ChatMessage = { 
        id: Date.now() + 1, 
        sender: 'bot', 
        content: (
            <div>
                <p className="font-bold mb-1">Аналіз завантажено з історії.</p>
                <p className="text-sm text-slate-400">Натисніть, щоб переглянути звіт.</p>
            </div>
        ),
        analysisData
    };
    
    setMessages([userMessage, botMessage]);
    setSelectedAnalysis(analysisData);
    setSelectedMessageId(botMessage.id);
    setIsHistoryOpen(false);
    setIsAnalysisVisible(true);
  };
  
  const handleSelectMessage = (message: ChatMessage) => {
    if (message.analysisData) {
        setSelectedAnalysis(message.analysisData);
        setSelectedMessageId(message.id);
        setHighlightedItem(null);
        setIsAnalysisVisible(true);
    }
  }

  const handleNodeClick = (key: string, text: string) => {
      setHighlightedItem({ key, text });
  };

  const handleClearHistory = () => {
    if (window.confirm("Ви впевнені, що хочете видалити всю історію пошуків? Цю дію неможливо скасувати.")) {
      setHistory([]);
      localStorage.removeItem('osint-history');
    }
  };

  const handleAdvancedSearch = (query: string) => {
    handleSearch(query);
    setIsAdvancedSearchOpen(false);
  };

  return (
    <div className="min-h-screen bg-transparent flex">
       <HistorySidebar 
        history={history} 
        onLoad={handleLoadFromHistory} 
        onClear={handleClearHistory} 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

       {isAdvancedSearchOpen && (
        <AdvancedSearchModal
          onClose={() => setIsAdvancedSearchOpen(false)}
          onSearch={handleAdvancedSearch}
        />
      )}

      <div className="flex-1 lg:ml-72 transition-all duration-200 flex flex-col h-screen">
          <header className="text-center p-4 bg-slate-900/70 backdrop-blur-xl border-b border-slate-700/50 z-20 flex-shrink-0">
            <div className="flex items-center justify-between gap-4 max-w-full mx-auto px-4 sm:px-6 lg:px-8">
              <button 
                  onClick={() => setIsHistoryOpen(true)} 
                  className="p-2 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-700/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
                  aria-label="Відкрити історію"
                >
                    <HistoryIcon className="w-7 h-7"/>
              </button>
              <div className='flex items-center justify-center gap-4'>
                <LogoIcon className="w-9 h-9 text-blue-500" />
                <h1 className="text-3xl md:text-4xl font-['Inter'] font-bold text-slate-100 bg-clip-text text-transparent bg-gradient-to-br from-slate-100 to-slate-400">
                  DeepSerch
                </h1>
              </div>
               <button 
                  onClick={startNewAnalysis}
                  className="p-2 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-700/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Почати новий аналіз"
                  title="Почати новий аналіз"
                >
                    <PlusCircleIcon className="w-7 h-7"/>
              </button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {/* Chat Column */}
            <main className={`w-full lg:w-1/2 overflow-y-auto p-4 sm:p-6 lg:border-r border-slate-700/50 ${isAnalysisVisible && selectedAnalysis ? 'hidden lg:block' : 'block'}`}>
              <ChatInterface messages={messages} onSelectMessage={handleSelectMessage} selectedMessageId={selectedMessageId} />
            </main>
            
            {/* Analysis Column */}
            <aside className={`w-full lg:w-1/2 h-full overflow-y-auto p-4 sm:p-6 bg-slate-900/30 ${isAnalysisVisible && selectedAnalysis ? 'block' : 'hidden lg:block'}`}>
                {selectedAnalysis ? (
                    <BotResponse
                        results={selectedAnalysis.results}
                        sources={selectedAnalysis.sources}
                        target={selectedAnalysis.target}
                        investigationPath={selectedAnalysis.investigationPath}
                        onSearch={handleSearch}
                        onNodeClick={handleNodeClick}
                        highlightedItem={highlightedItem}
                        onBack={() => setIsAnalysisVisible(false)}
                    />
                ) : (
                    <WelcomeScreen />
                )}
            </aside>
          </div>
          
          <footer className="p-4 sm:p-6 pt-0 flex-shrink-0 border-t border-slate-700/50 bg-slate-900/70 backdrop-blur-xl z-10">
            <div className="max-w-full mx-auto">
                <ChatInput 
                    onSearch={handleSearch} 
                    isLoading={isLoading} 
                    onAdvancedSearchClick={() => setIsAdvancedSearchOpen(true)}
                />
                 {error && <ErrorDisplay message={error} onClose={() => setError(null)} />}
            </div>
          </footer>
      </div>
    </div>
  );
};

export default App;
