import 'mock-local-storage';

global.window = {};
window.localStorage = global.localStorage;
