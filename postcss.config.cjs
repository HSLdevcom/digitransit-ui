module.exports = ({ env }) => ({
  plugins:
    env === 'production' ? ['postcss-flexbugs-fixes', 'autoprefixer'] : [],
});
