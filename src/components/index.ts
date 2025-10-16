// src/components/index.ts

// Routing components
export * from './routing';

// Form components  
export * from './forms';

// UI components
export * from './ui';

// Common components - Calendar moved to user/dashboard/calendar

// Platform components
export { default as PlatformHome } from './platform/home/PlatformHome';
export { default as PlatformLogin } from './platform/login/PlatformLogin';
export { default as PlatformSignup } from './platform/signup/PlatformSignup';
export { default as PlatformDashboard } from './platform/dashboard/PlatformDashboard';

// Super Admin components
export * from './super-admin';