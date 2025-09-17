// src/services/userSettingsService.ts
import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { ApiResponse } from '../models';
import { getI18nCode } from '../utils/languageMapping';
import i18n from '../i18n';

interface UserSettingsData {
  userSettingId?: number | null;
  userId?: number | null;
  timezone?: string | null;
  workWeekStart?: number | null;
  language?: string | null;
  dateFormat?: string | null;
}

export class UserSettingsService {
  /**
   * Load user settings and apply language preference automatically
   */
  static async loadAndApplyUserSettings(userId: number): Promise<UserSettingsData | null> {
    try {
      const url = API_ENDPOINTS.USER_SETTINGS.GET(userId);
      const response = await axiosInstance.get<ApiResponse<UserSettingsData>>(url);
      
      if (response?.data?.status === "SUCCESS" && response.data.data) {
        const settings = response.data.data;
        
        // Apply the user's saved language preference
        if (settings.language) {
          // Handle both enum and string values
          let languageEnum: any = settings.language;
          
          // If it's a string, try to match it to the enum
          if (typeof settings.language === 'string') {
            const languageEnumValues = ['English', 'Spanish', 'French', 'Hindi'];
            if (languageEnumValues.includes(settings.language)) {
              languageEnum = settings.language;
            } else {
              console.warn(`Unknown language string: ${settings.language}`);
              languageEnum = 'English'; // Default fallback
            }
          }
          
          const i18nCode = getI18nCode(languageEnum);
          i18n.changeLanguage(i18nCode);
        }
        
        return settings;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to load user settings:', error);
      // Don't throw error - just return null and let app continue with defaults
      return null;
    }
  }

  /**
   * Load user settings without applying language (for UserSettings component)
   */
  static async loadUserSettings(userId: number): Promise<UserSettingsData | null> {
    try {
      const url = API_ENDPOINTS.USER_SETTINGS.GET(userId);
      const response = await axiosInstance.get<ApiResponse<UserSettingsData>>(url);
      
      if (response?.data?.status === "SUCCESS" && response.data.data) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to load user settings:', error);
      return null;
    }
  }
}

export default UserSettingsService;