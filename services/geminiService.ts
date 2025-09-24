import { GoogleGenAI } from "@google/genai";
import type { OSINTResult, GroundingChunk, GeminiContent } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getConversationalAnalysis(
    newQuery: string,
    history: GeminiContent[]
): Promise<{ data: OSINTResult; sources: GroundingChunk[], fullResponse: string } | null> {
    const systemInstruction = `
        ВАЖЛИВО: Весь ваш аналіз та весь текстовий вміст у значеннях JSON (наприклад, 'summary', 'compromised_data', 'snippet' тощо) ПОВИНЕН бути українською мовою. Ключі JSON повинні залишатися англійською мовою, як зазначено в структурі.

        Ви — потужний аналітичний інструмент DeepSerch. Ваше завдання — провести глибокий, багатогранний аналіз цілі, враховуючи історію нашого діалогу для контексту.

        КРОК 1: ЗБІР ДАНИХ
        Проведіть ретельний пошук у всіх доступних вам джерелах: соціальні мережі, **державні та комерційні реєстри**, **бази даних**, витоки даних, форуми, злиті документи, кеш пошукових систем та **публічну активність в Telegram**. Зберіть всю можливу інформацію за категоріями, вказаними в JSON-структурі нижче.
        - Для 'telegram_activity': шукайте пов'язані з ціллю профілі, канали або групи. Вкажіть тип ('user', 'channel', 'group', 'unknown'), username, URL та опис, якщо є.

        КРОК 2: АНАЛІЗ ТА СИНТЕЗ (НАЙВАЖЛИВІШИЙ)
        Проаналізуйте ВСІ дані (нові та з попередніх повідомлень) на наявність зв'язків. Ваша мета — ідентифікувати ймовірних осіб або "цифрові персони" і збагатити їхній профіль.
        - Оновіть та доповніть масив 'associated_entities' на основі нових знахідок.
        - Будьте максимально конкретними у своїх обґрунтуваннях в полі 'sources' кожного 'associated_entity'.

        КРОК 3: ФОРМАТУВАННЯ
        Відформатуйте всю свою відповідь як єдиний, валідний JSON-об'єкт. Не додавайте жодного тексту до або після JSON. Якщо попередній аналіз вже існує в історії, ви повинні повернути ОНОВЛЕНИЙ та ПОВНИЙ JSON-об'єкт, що містить як стару, так і нову інформацію.
        JSON-об'єкт повинен суворо відповідати такій структурі:
        {
          "summary": "string",
          "full_name": "string",
          "associated_entities": [{
              "name": "string",
              "emails": ["string"],
              "phone_numbers": ["string"],
              "social_profiles": [{ "platform": "string", "username": "string", "url": "string", "followers": "number", "bio": "string" }],
              "domains": ["string"],
              "sources": ["string"]
          }],
          "social_profiles": [{ "platform": "string", "username": "string", "url": "string", "followers": "number", "bio": "string" }],
          "emails": ["string"],
          "associated_domains": ["string"],
          "data_breaches": [{ "name": "string", "compromised_data": ["string"], "date": "string" }],
          "forum_mentions": [{ "forum_name": "string", "url": "string", "post_snippet": "string" }],
          "leaked_documents": [{ "source": "string", "url": "string", "snippet": "string" }],
          "registry_mentions": [{ "registry_name": "string", "record_details": "string", "url": "string" }],
          "phone_info": [{ "number": "string", "associated_names": ["string"] }],
          "web_mentions": [{ "title": "string", "url": "string", "snippet": "string" }],
          "telegram_activity": [{ "type": "channel' | 'group' | 'user' | 'unknown", "username": "string", "url": "string", "description": "string" }]
        }

        Якщо ви не можете знайти інформацію для певного поля, поверніть порожній рядок (""), порожній масив ([]), або null. Не пропускайте жодних ключів.
    `;

    const contents = [...history, { role: 'user', parts: [{ text: newQuery }] }];

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                tools: [{ googleSearch: {} }],
                temperature: 0.1,
            },
        });

        const textResponse = response.text.trim();
        let jsonData: OSINTResult;

        const firstBrace = textResponse.indexOf('{');
        const lastBrace = textResponse.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1) {
            throw new Error("No valid JSON object found in the response.");
        }
        
        const jsonString = textResponse.substring(firstBrace, lastBrace + 1);

        try {
            jsonData = JSON.parse(jsonString) as OSINTResult;
        } catch (e) {
            console.error("Failed to parse JSON response:", jsonString);
            throw new Error("The AI returned a malformed response. Please try again.");
        }
        
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];

        return { data: jsonData, sources, fullResponse: jsonString };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to communicate with the analysis service.");
    }
}