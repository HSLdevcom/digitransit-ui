module.exports = ({ env }) => ({
  plugins: {
    'postcss-flexbugs-fixes': env === 'production' ? {} : false,
    autoprefixer: env === 'production' ? {} : false,
  },
});
