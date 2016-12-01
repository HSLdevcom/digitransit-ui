export const isBrowser = typeof window !== 'undefined' && window !== null;
export const isIOSApp = isBrowser && window.navigator.standalone;
