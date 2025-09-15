// src/utils/storage.ts

/**
 * Storage utility functions for localStorage and sessionStorage
 */
export class StorageUtils {
  /**
   * Set item in localStorage with JSON serialization
   */
  static setLocal<T>(key: string, value: T): boolean {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Error setting localStorage item:', error);
      return false;
    }
  }

  /**
   * Get item from localStorage with JSON deserialization
   */
  static getLocal<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return defaultValue;
    }
  }

  /**
   * Remove item from localStorage
   */
  static removeLocal(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing localStorage item:', error);
      return false;
    }
  }

  /**
   * Clear all localStorage
   */
  static clearLocal(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Set item in sessionStorage with JSON serialization
   */
  static setSession<T>(key: string, value: T): boolean {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Error setting sessionStorage item:', error);
      return false;
    }
  }

  /**
   * Get item from sessionStorage with JSON deserialization
   */
  static getSession<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = sessionStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error getting sessionStorage item:', error);
      return defaultValue;
    }
  }

  /**
   * Remove item from sessionStorage
   */
  static removeSession(key: string): boolean {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing sessionStorage item:', error);
      return false;
    }
  }

  /**
   * Clear all sessionStorage
   */
  static clearSession(): boolean {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
      return false;
    }
  }

  /**
   * Check if localStorage is available
   */
  static isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if sessionStorage is available
   */
  static isSessionStorageAvailable(): boolean {
    try {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all keys from localStorage
   */
  static getLocalKeys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }

  /**
   * Get all keys from sessionStorage
   */
  static getSessionKeys(): string[] {
    try {
      return Object.keys(sessionStorage);
    } catch (error) {
      console.error('Error getting sessionStorage keys:', error);
      return [];
    }
  }

  /**
   * Get storage size in bytes
   */
  static getStorageSize(storageType: 'local' | 'session' = 'local'): number {
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      let total = 0;
      
      for (const key in storage) {
        if (storage.hasOwnProperty(key)) {
          total += storage[key].length + key.length;
        }
      }
      
      return total;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }

  /**
   * Export storage data
   */
  static exportStorage(storageType: 'local' | 'session' = 'local'): Record<string, any> {
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      const data: Record<string, any> = {};
      
      for (const key in storage) {
        if (storage.hasOwnProperty(key)) {
          try {
            data[key] = JSON.parse(storage[key]);
          } catch {
            data[key] = storage[key]; // Keep as string if not JSON
          }
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error exporting storage:', error);
      return {};
    }
  }

  /**
   * Import storage data
   */
  static importStorage(
    data: Record<string, any>, 
    storageType: 'local' | 'session' = 'local',
    overwrite: boolean = false
  ): boolean {
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      
      if (overwrite) {
        storage.clear();
      }
      
      for (const [key, value] of Object.entries(data)) {
        const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
        storage.setItem(key, serializedValue);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing storage:', error);
      return false;
    }
  }

  /**
   * Set item with expiration
   */
  static setWithExpiry<T>(
    key: string, 
    value: T, 
    expiryMs: number, 
    storageType: 'local' | 'session' = 'local'
  ): boolean {
    try {
      const now = new Date().getTime();
      const item = {
        value,
        expiry: now + expiryMs
      };
      
      const serializedItem = JSON.stringify(item);
      
      if (storageType === 'local') {
        localStorage.setItem(key, serializedItem);
      } else {
        sessionStorage.setItem(key, serializedItem);
      }
      
      return true;
    } catch (error) {
      console.error('Error setting item with expiry:', error);
      return false;
    }
  }

  /**
   * Get item with expiration check
   */
  static getWithExpiry<T>(
    key: string, 
    defaultValue: T | null = null,
    storageType: 'local' | 'session' = 'local'
  ): T | null {
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      const itemStr = storage.getItem(key);
      
      if (!itemStr) return defaultValue;
      
      const item = JSON.parse(itemStr);
      const now = new Date().getTime();
      
      if (now > item.expiry) {
        storage.removeItem(key);
        return defaultValue;
      }
      
      return item.value as T;
    } catch (error) {
      console.error('Error getting item with expiry:', error);
      return defaultValue;
    }
  }

  /**
   * Clean expired items
   */
  static cleanExpired(storageType: 'local' | 'session' = 'local'): number {
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      const now = new Date().getTime();
      let cleanedCount = 0;
      
      const keys = Object.keys(storage);
      
      for (const key of keys) {
        try {
          const itemStr = storage.getItem(key);
          if (itemStr) {
            const item = JSON.parse(itemStr);
            if (item.expiry && now > item.expiry) {
              storage.removeItem(key);
              cleanedCount++;
            }
          }
        } catch {
          // Skip items that aren't in expiry format
        }
      }
      
      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning expired items:', error);
      return 0;
    }
  }
}