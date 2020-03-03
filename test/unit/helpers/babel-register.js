require('@babel/register')({
  // This will override `node_modules` ignoring - you can alternatively pass
  // an array of strings to be explicitly matched or a regex / glob
  ignore: [
    /node_modules\/(?!react-leaflet|@babel\/runtime\/helpers\/esm|lodash-es|@digitransit-util)/,
  ],
});
