// src/utils/versionCheck.ts
import { APP_VERSION, isNewerVersion } from '../constants';

interface VersionCheckOptions {
  /** 
   * How frequently to check for new versions (in milliseconds)
   * Default: 24 hours
   */
  checkInterval?: number;
  
  /** 
   * Storage key to use for last check time
   * Default: 'last_version_check' 
   */
  storageKey?: string;
  
  /** 
   * URL to fetch version information from
   * This endpoint should return a JSON object with a 'version' field
   */
  versionUrl: string;
  
  /** 
   * Callback to execute when a new version is found
   * @param newVersion The new version string
   * @param currentVersion The current app version
   */
  onNewVersion: (newVersion: string, currentVersion: string) => void;
}

const defaultOptions: Partial<VersionCheckOptions> = {
  checkInterval: 24 * 60 * 60 * 1000, // 24 hours
  storageKey: 'last_version_check'
};

/**
 * Creates a version checker that periodically checks for new app versions
 * @param options Configuration options
 * @returns Object with check and stop methods
 */
export const createVersionChecker = (options: VersionCheckOptions) => {
  const config = { ...defaultOptions, ...options };
  let checkInterval: NodeJS.Timeout | null = null;
  
  const shouldCheck = (): boolean => {
    const lastCheck = localStorage.getItem(config.storageKey as string);
    if (!lastCheck) return true;
    
    const lastCheckTime = parseInt(lastCheck, 10);
    const now = Date.now();
    return (now - lastCheckTime) > (config.checkInterval as number);
  };
  
  const saveLastCheck = (): void => {
    localStorage.setItem(config.storageKey as string, Date.now().toString());
  };
  
  const checkVersion = async (): Promise<void> => {
    if (!shouldCheck()) return;
    
    try {
      const response = await fetch(config.versionUrl);
      const data = await response.json();
      
      if (data.version && isNewerVersion(data.version)) {
        config.onNewVersion(data.version, APP_VERSION.full);
      }
      
      saveLastCheck();
    } catch (error) {
      console.error('Version check failed:', error);
    }
  };
  
  const startChecking = (): void => {
    // Initial check
    checkVersion();
    
    // Set up periodic checks
    checkInterval = setInterval(checkVersion, config.checkInterval);
  };
  
  const stopChecking = (): void => {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  };
  
  return {
    check: checkVersion,
    start: startChecking,
    stop: stopChecking
  };
};

export default createVersionChecker;