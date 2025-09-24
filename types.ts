
import type React from 'react';

export interface SocialProfile {
  platform: string;
  url: string;
  username: string;
  followers?: number;
  bio?: string;
}

export interface WebMention {
  title: string;
  url:string;
  snippet: string;
}

export interface DataBreach {
  name: string;
  compromised_data: string[];
  date: string;
}

export interface ForumMention {
    forum_name: string;
    url: string;
    post_snippet: string;
}

export interface LeakedDocument {
    source: string; // e.g., Pastebin
    url: string;
    snippet: string;
}

export interface RegistryMention {
    registry_name: string;
    record_details: string;
    url?: string;
}

export interface PhoneInfo {
    number: string;
    associated_names: string[];
}

export interface AssociatedEntity {
    name: string;
    emails: string[];
    phone_numbers: string[];
    social_profiles: SocialProfile[];
    domains: string[];
    sources: string[]; // Textual explanations from AI on why data is linked
}

export interface TelegramActivity {
    type: 'channel' | 'group' | 'user' | 'unknown';
    username: string;
    url: string;
    description?: string;
}

export interface OSINTResult {
  summary: string;
  full_name?: string;
  associated_entities: AssociatedEntity[];
  social_profiles: SocialProfile[];
  emails: string[];
  web_mentions: WebMention[];
  associated_domains: string[];
  data_breaches: DataBreach[];
  forum_mentions: ForumMention[];
  leaked_documents: LeakedDocument[];
  registry_mentions: RegistryMention[];
  phone_info: PhoneInfo[];
  telegram_activity: TelegramActivity[];
}

export interface GroundingChunk {
    web: {
        uri: string;
        title: string;
    }
}

export interface HistoryEntry {
  id: string; // Unique ID, using the root target string
  timestamp: number;
  target: string; // The root target of the investigation
  investigationPath: string[];
  results: OSINTResult;
  sources: GroundingChunk[];
}

export type GeminiContent = {
    role: "user" | "model";
    parts: { text: string }[];
};

export interface AnalysisData {
    results: OSINTResult;
    sources: GroundingChunk[];
    target: string;
    investigationPath: string[];
}

export interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  content: React.ReactNode;
  analysisData?: AnalysisData;
}
