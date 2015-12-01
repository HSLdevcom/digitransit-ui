var fs = require('fs');
var introspectionQuery = require('graphql/utilities/introspectionQuery').introspectionQuery;
var fetch = require('node-fetch')
var outputFilename = 'schema.json';

fetch((process.env.SERVER_ROOT || 'http://matka.hsl.fi') + '/otp/routers/default/index/graphql', {
  method: 'post',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: introspectionQuery,
  }),
}).then(function(response) {
  return response.json()
}).then(function(json) {
  fs.writeFile(outputFilename, JSON.stringify(json.data, null, 4), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved to " + outputFilename);
    }
  });
});
