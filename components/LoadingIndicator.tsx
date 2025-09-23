import React from 'react';

const messages = [
  "Ініціалізація ядра ШІ...",
  "Доступ до публічних потоків даних...",
  "Перехресна перевірка даних...",
  "Складання звіту розвідки...",
  "Аналіз цифрового сліду...",
  "Пошук у вебархівах...",
  "Завершення аналізу..."
];

export const LoadingIndicator: React.FC = () => {
    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        let index = 0;
        const intervalId = setInterval(() => {
            index = (index + 1) % messages.length;
            setMessage(messages[index]);
        }, 2500);

        return () => clearInterval(intervalId);
    }, []);


  return (
    <div className="mt-12 flex flex-col items-center justify-center gap-6 text-center">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30"></div>
        <div className="absolute inset-0 rounded-full border-t-4 border-cyan-400 animate-spin"></div>
      </div>
      <p className="text-lg text-cyan-300 font-orbitron tracking-wider">{message}</p>
    </div>
  );
};