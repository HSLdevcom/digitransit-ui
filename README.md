# digitransit-ui-nightwatch

Install ```npm install```

Run tests: ```npm test```

When running locally, you need a local selenium running or use selenium from one of our environments.

## Run only smoke tests
```npm run test-smoke```

## Run against beta environment
```npm run beta```

## Run against beta environment, smoke tests only
```npm run beta-smoke```

## To run with local selenium
+ Download `selenium-server-standalone-x.yz.0.jar` from  http://www.seleniumhq.org/download/
+ Start it: `java -jar selenium-server-standalone-2.53.0.jar`
+ Change `selenium_host` to `localhost` in `nightwatch.json`

# Run with helium's selenium through a tunnel
Example with *helium*
Tunnel: ```ssh -N -L4443:10.2.67.6:4444  helium```

Add a selenium-hub to localhost mapping in /etc/hosts if you dont want to change nightwatch.json for local testing.

## Install nightwatch as command
```npm install nightwatch -g```

## Run certain tags
```nightwatch --tag smoke```

```nightwatch --tag citybike```

## Run certain test files
```nightwatch --test tests/itinerary-search/itinerary-search.js```
