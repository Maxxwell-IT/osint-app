import { GoogleGenAI } from "@google/genai";
import type { OSINTResult, GroundingChunk } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function investigateTarget(target: string): Promise<{ data: OSINTResult; sources: GroundingChunk[] } | null> {
    const prompt = `
        ВАЖЛИВО: Весь ваш аналіз та весь текстовий вміст у значеннях JSON (наприклад, 'summary', 'compromised_data', 'snippet' тощо) ПОВИНЕН бути українською мовою. Ключі JSON повинні залишатися англійською мовою, як зазначено в структурі.

        Ви — елітний OSINT-аналітик. Ваше завдання — провести глибоке, багатогранне розслідування щодо цілі: "${target}".

        КРОК 1: ЗБІР ДАНИХ
        Проведіть ретельний пошук у всіх доступних вам джерелах: соціальні мережі, витоки даних, форуми, реєстри, злиті документи, кеш пошукових систем. Зберіть всю можливу інформацію за категоріями, вказаними в JSON-структурі нижче.
        - Для 'Data Breaches': надайте вичерпний список ВСІХ типів скомпрометованих даних. Наприклад: ["email", "password (hashed)", "IP address"].
        - Для 'Forum Mentions': надайте максимально інформативний та контекстуально багатий уривок з повідомлення.

        КРОК 2: АНАЛІЗ ТА СИНТЕЗ (НАЙВАЖЛИВІШИЙ)
        Після збору даних, проаналізуйте їх на наявність зв'язків. Ваша мета — ідентифікувати ймовірних осіб або "цифрові персони".
        - Створіть об'єкти в масиві 'associated_entities'. Кожен об'єкт — це одна особа.
        - Згрупуйте в об'єкті всі дані, що належать цій особі: email, телефони, профілі в соцмережах, домени.
        - Для кожного об'єкта в 'associated_entities', заповніть масив 'sources'. Це КЛЮЧОВИЙ елемент. Кожен рядок у цьому масиві має бути чітким обґрунтуванням, ЧОМУ ви вважаєте, що ці дані пов'язані.
        - Приклад хорошого обґрунтування в 'sources':
            - "Email 'user@example.com' та нікнейм 'user123' були знайдені разом у витоці даних 'BigBreach 2021'."
            - "Профіль LinkedIn 'linkedin.com/in/username' містить посилання на особистий сайт 'user-domain.com'."
            - "Номер телефону '+1234567890' був вказаний у публічному повідомленні на форумі 'ForumName' користувачем 'user123'."
        - Будьте максимально конкретними у своїх обґрунтуваннях.

        КРОК 3: ФОРМАТУВАННЯ
        Відформатуйте всю свою відповідь як єдиний, валідний JSON-об'єкт. Не додавайте жодного тексту до або після JSON.
        JSON-об'єкт повинен суворо відповідати такій структурі:
        {
          "summary": "string",
          "full_name": "string",
          "associated_entities": [{
              "name": "string",
              "emails": ["string"],
              "phone_numbers": ["string"],
              "social_profiles": [{ "platform": "string", "username": "string", "url": "string" }],
              "domains": ["string"],
              "sources": ["string"]
          }],
          "social_profiles": [{ "platform": "string", "username": "string", "url": "string" }],
          "emails": ["string"],
          "associated_domains": ["string"],
          "data_breaches": [{ "name": "string", "compromised_data": ["string"], "date": "string" }],
          "forum_mentions": [{ "forum_name": "string", "url": "string", "post_snippet": "string" }],
          "leaked_documents": [{ "source": "string", "url": "string", "snippet": "string" }],
          "registry_mentions": [{ "registry_name": "string", "record_details": "string", "url": "string" }],
          "phone_info": [{ "number": "string", "associated_names": ["string"] }],
          "web_mentions": [{ "title": "string", "url": "string", "snippet": "string" }]
        }

        Якщо ви не можете знайти інформацію для певного поля, поверніть порожній рядок (""), порожній масив ([]), або null. Не пропускайте жодних ключів.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
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

        return { data: jsonData, sources };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to communicate with the investigation service.");
    }
}