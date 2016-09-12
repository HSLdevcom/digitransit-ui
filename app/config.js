// This is server render. Return correct config file.
export default require(`./config.${process.env.CONFIG || 'default'}`);
