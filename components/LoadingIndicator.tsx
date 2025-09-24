import React, { useState, useEffect } from 'react';
import { CheckIcon } from './icons/CheckIcon';

const analysisSteps = [
  "Ініціалізація аналітичного ядра...",
  "Доступ до публічних потоків даних...",
  "Пошук у соціальних мережах...",
  "Сканування витоків даних та баз...",
  "Перевірка державних реєстрів...",
  "Аналіз активності в Telegram...",
  "Перехресна перевірка знайдених даних...",
  "Побудова графу зв'язків...",
  "Формування фінального звіту..."
];

const SpinnerIcon: React.FC = () => (
    <div className="w-5 h-5 border-2 border-slate-500/50 border-t-slate-300 rounded-full animate-spin"></div>
);

export const LoadingIndicator: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentStep(prevStep => {
                if (prevStep < analysisSteps.length - 1) {
                    return prevStep + 1;
                }
                // Stay on the last step until the actual loading is finished
                return prevStep; 
            });
        }, 1500); 

        return () => clearInterval(intervalId);
    }, []);


  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center py-8 px-4 w-full max-w-md mx-auto">
        <div className="w-full bg-slate-800/50 p-6 rounded-lg border border-slate-700/50">
            <h3 className="text-lg font-bold text-slate-200 mb-4 text-center">Триває аналіз...</h3>
            <ul className="space-y-3 text-left">
                {analysisSteps.map((step, index) => (
                    <li key={index} className="flex items-center gap-3 transition-opacity duration-500"
                        style={{ opacity: index <= currentStep ? 1 : 0.4 }}>
                        <div className="w-5 h-5 flex-shrink-0">
                             {index < currentStep ? (
                                <CheckIcon className="w-5 h-5 text-green-400" />
                            ) : index === currentStep ? (
                                <SpinnerIcon />
                            ) : (
                                <div className="w-5 h-5 border-2 border-slate-600 rounded-full"></div>
                            )}
                        </div>
                        <span className={`transition-colors duration-500 ${
                            index < currentStep ? 'text-slate-400 line-through' : 
                            index === currentStep ? 'text-slate-200 font-semibold' : 'text-slate-500'
                        }`}>
                            {step}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );
};
