export const isBrowser = typeof window !== 'undefined' && window !== null;
export const isIOSApp = isBrowser && navigator.standalone;

export const isWindowsPhone = isBrowser && navigator.userAgent.match(/Windows Phone/) != null;
export const isLangMockEn = isBrowser && window.location.search.indexOf('en') !== -1;
export const isMobile = isBrowser && navigator.userAgent.match(/Mobile/) != null;
export const isFirefox = isBrowser && navigator.userAgent.match(/Firefox/) != null;
