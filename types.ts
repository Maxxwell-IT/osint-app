export interface SocialProfile {
  platform: string;
  url: string;
  username: string;
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

export interface OSINTResult {
  summary: string;
  full_name?: string;
  social_profiles: SocialProfile[];
  emails: string[];
  web_mentions: WebMention[];
  associated_domains: string[];
  data_breaches: DataBreach[];
  forum_mentions: ForumMention[];
  leaked_documents: LeakedDocument[];
  registry_mentions: RegistryMention[];
  phone_info: PhoneInfo[];
}

export interface GroundingChunk {
    web: {
        uri: string;
        title: string;
    }
}