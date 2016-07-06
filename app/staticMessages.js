import config from './config'
/* eslint-disable max-len */
// Static messages can be defined here and in the config file.
const staticMessages = [
].concat(config.staticMessages || []);
console.log(staticMessages);
export default staticMessages;
