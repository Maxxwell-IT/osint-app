import { GoogleGenAI } from "@google/genai";
import type { OSINTResult, GroundingChunk } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function investigateTarget(target: string): Promise<{ data: OSINTResult; sources: GroundingChunk[] } | null> {
    const prompt = `
        ВАЖЛИВО: Весь ваш аналіз та весь текстовий вміст у значеннях JSON (наприклад, 'summary', 'compromised_data', 'snippet' тощо) ПОВИНЕН бути українською мовою. Ключі JSON повинні залишатися англійською мовою, як зазначено в структурі.

        Ви — експерт з OSINT (розвідки на основі відкритих джерел) з доступом до широкого спектра публічних джерел даних, включаючи бази даних витоків, соціальні мережі, форуми, публічні реєстри та злиті документи.
        Ваше завдання — провести всебічне розслідування щодо вказаної цілі: "${target}". Зосередьтеся на глибокому пошуку в компіляціях баз даних витоків, злитих документах та публічних реєстрах. Якщо ціль виглядає як конкретний елемент даних з попереднього розслідування (наприклад, email або ім'я користувача), зосередьтеся на пошуку нових зв'язків та інформації, що випливають *саме з цього елемента*, щоб розкрити приховані закономірності.
        
        Зберіть та узагальніть загальнодоступну інформацію та структуруйте її в єдиний, валідний JSON-об'єкт.
        
        Дослідіть наступні категорії:
        - Summary: Короткий огляд онлайн-присутності та цифрового сліду цілі.
        - Full Name: Будь-які можливі повні імена, пов'язані з ціллю.
        - Social Profiles: Акаунти в соціальних мережах (напр., Twitter, LinkedIn, Instagram). Включіть платформу, ім'я користувача та URL.
        - Email Addresses: Будь-які пов'язані адреси електронної пошти.
        - Associated Domains: Веб-сайти або домени, пов'язані з ціллю.
        - Data Breaches: Перевірте, чи з'являлася ціль (особливо якщо це email або ім'я користувача) у відомих витоках даних. Вкажіть назву витоку, типи скомпрометованих даних та дату витоку.
        - Forum Mentions: Знайдіть згадки про ціль на форумах. Надайте назву форуму, пряме посилання на пост/профіль та уривок повідомлення.
        - Leaked Documents: Шукайте згадки в злитих документах на сайтах типу Pastebin. Включіть джерело, URL та уривок.
        - Registry Mentions: Знайдіть згадки в офіційних або публічних реєстрах (наприклад, бізнес-реєстри, записи WHOIS доменів, професійні ліцензії). Включіть назву реєстру, деталі запису та URL, якщо є.
        - Phone Information: Якщо ціль — номер телефону, знайдіть будь-які пов'язані імена (наприклад, з додатків для обміну контактами).
        - Web Mentions: Загальні згадки на веб-сайтах, у блогах або новинних статтях. Включіть заголовок, URL та короткий уривок.

        Відформатуйте всю свою відповідь як єдиний, валідний JSON-об'єкт. Не додавайте жодного тексту, приміток або пояснень до або після JSON.
        The JSON object must strictly adhere to the following structure:
        {
          "summary": "string",
          "full_name": "string",
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

        Якщо ви не можете знайти інформацію для певного поля, поверніть порожній рядок (""), порожній масив ([]), або null для цього поля. Не пропускайте жодних ключів з остаточного JSON-об'єкта.
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