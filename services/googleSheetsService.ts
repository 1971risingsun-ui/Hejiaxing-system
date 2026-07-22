import { User, AuditLog, SystemRules, Project, TaskSchedule, Employee } from '../types';

const DATABASE_FILE_NAME = '合家興管理系統資料庫';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';

export interface AppState {
  users: User[];
  auditLogs: AuditLog[];
  systemRules: SystemRules;
  projects: Project[];
  taskSchedules: Record<string, TaskSchedule>;
  employees: Employee[];
  lastSaved: string;
}

class GoogleSheetsService {
  private get accessToken(): string | null {
    return (import.meta as any).env.VITE_GOOGLE_OAUTH_TOKEN || null;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = this.accessToken;
    if (!token) {
      throw new Error('未取得 Google 授權標記 (OAuth Token)，請重新點擊「連結 Google 試算表」並確保已授權。');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      throw new Error('授權已過期，請重新整理頁面或重新登入');
    }
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(error.error?.message || 'API 請求失敗');
    }
    return response.json();
  }

  async findOrCreateDatabaseFile(): Promise<string> {
    // 1. Search for existing file
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(DATABASE_FILE_NAME)}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id,name)`;
    const searchResult = await this.fetchWithAuth(searchUrl);

    if (searchResult.files && searchResult.files.length > 0) {
      return searchResult.files[0].id;
    }

    // 2. Create if not found
    const createUrl = 'https://www.googleapis.com/drive/v3/files';
    const createResult = await this.fetchWithAuth(createUrl, {
      method: 'POST',
      body: JSON.stringify({
        name: DATABASE_FILE_NAME,
        mimeType: 'application/vnd.google-apps.spreadsheet',
      }),
    });

    // Initialize with a hidden sheet for JSON data
    const spreadsheetId = createResult.id;
    await this.fetchWithAuth(`https://www.googleapis.com/sheets/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [
          {
            updateSpreadsheetProperties: {
              properties: { title: DATABASE_FILE_NAME },
              fields: 'title',
            },
          },
          {
            addSheet: {
              properties: { title: 'SYSTEM_DATA', hidden: true },
            },
          },
        ],
      }),
    });

    return spreadsheetId;
  }

  async loadData(spreadsheetId: string): Promise<AppState | null> {
    try {
      const url = `https://www.googleapis.com/sheets/v4/spreadsheets/${spreadsheetId}/values/SYSTEM_DATA!A1`;
      const result = await this.fetchWithAuth(url);
      if (result.values && result.values[0] && result.values[0][0]) {
        return JSON.parse(result.values[0][0]);
      }
      return null;
    } catch (e) {
      console.error('載入資料失敗', e);
      return null;
    }
  }

  async saveData(spreadsheetId: string, data: AppState): Promise<void> {
    const url = `https://www.googleapis.com/sheets/v4/spreadsheets/${spreadsheetId}/values/SYSTEM_DATA!A1?valueInputOption=RAW`;
    await this.fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify({
        values: [[JSON.stringify(data)]],
      }),
    });
  }
}

export const googleSheetsService = new GoogleSheetsService();
