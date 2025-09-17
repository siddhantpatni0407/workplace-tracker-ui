/**
 * Version constants for the application
 * This file provides a central location for managing version information
 * that can be imported throughout the application.
 */

import packageJson from '../../package.json';

/**
 * Application version information
 */
export const APP_VERSION = {
  /** Full version string (from package.json) */
  full: packageJson.version,
  
  /** Major version number */
  major: parseInt(packageJson.version.split('.')[0], 10),
  
  /** Minor version number */
  minor: parseInt(packageJson.version.split('.')[1], 10),
  
  /** Patch version number */
  patch: parseInt(packageJson.version.split('.')[2], 10),
  
  /** Build metadata - typically set at build time */
  buildDate: new Date().toISOString(),
  
  /** Formatted version for display (vX.Y.Z) */
  formatted: `v${packageJson.version}`,
};

/**
 * Checks if the current version is newer than the provided version
 * @param version Version string to compare against (e.g. "1.2.3")
 * @returns true if current version is newer than provided version
 */
export const isNewerVersion = (version: string): boolean => {
  const current = packageJson.version.split('.').map(v => parseInt(v, 10));
  const compare = version.split('.').map(v => parseInt(v, 10));
  
  // Compare major version
  if (current[0] !== compare[0]) return current[0] > compare[0];
  
  // Compare minor version
  if (current[1] !== compare[1]) return current[1] > compare[1];
  
  // Compare patch version
  return current[2] > compare[2];
};

/**
 * Returns a version string suitable for API requests
 * Format: vX.Y.Z
 */
export const getApiVersionHeader = (): string => `v${packageJson.version}`;

export default APP_VERSION;