// src/services/backupService.ts
import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export interface BackupRecord {
  id: string;
  fileName: string;
  size: string;
  createdAt: string;
  type: "manual" | "automatic";
  status: "completed" | "in-progress" | "failed";
}

export interface BackupOptions {
  type?: "sql" | "json" | "csv";
  databaseName?: string;
  schemaName?: string;
}

const backupService = {
  // Get all backups - using the single available endpoint
  async getBackups(): Promise<BackupRecord[]> {
    const response = await axiosInstance.get(API_ENDPOINTS.DB.BACKUP);
    return response.data.data || response.data || [];
  },

  // Create backup with options using query parameters
  async createBackup(options: BackupOptions = {}): Promise<any> {
    try {
      const params = new URLSearchParams();
      
      // Add type parameter (defaults to 'sql' on backend)
      if (options.type) {
        params.append('type', options.type);
      }
      
      // Add optional database name
      if (options.databaseName) {
        params.append('db', options.databaseName);
      }
      
      // Add optional schema name
      if (options.schemaName) {
        params.append('schema', options.schemaName);
      }

      const url = `${API_ENDPOINTS.DB.BACKUP}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error("Error creating backup:", error);
      throw error;
    }
  },
};

export default backupService;