/**
 * Klinik Pratama Cikidang Medika - Asset Registry
 * Centralized registry for application logos, emblems, and static assets.
 */

// Relative static path constants (accessible from public/ in browser)
export const ASSET_PATHS = {
  logoFull: '/assets/images/logo-full.png',
  logoEmblem: '/assets/images/logo-emblem.png',
  logoSquare: '/assets/images/logo-square.png',
  logoOriginal: '/assets/images/cikidang-medika-transparant.png',
  favicon: '/favicon.ico',
  appIcon: '/icon.png',
} as const;

// Direct image imports for Next.js Image component with automatic optimization
export { default as LogoFullImg } from './images/logo-full.png';
export { default as LogoEmblemImg } from './images/logo-emblem.png';
export { default as LogoSquareImg } from './images/logo-square.png';
export { default as LogoOriginalImg } from './images/cikidang-medika-transparant.png';
