
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  MEMORY_ANALYZER = 'MEMORY_ANALYZER',
  BLESSING_GENERATOR = 'BLESSING_GENERATOR'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface BlessingResult {
  imageUrl: string;
  caption: string;
}
