# digitransit-ui-nightwatch

Install ```npm install```

Run tests: ```npm test```

When running locally, you either need a local selenium running, or a ssh tunnel to *helium* for instance

Tunnel: ```ssh -N -L4443:10.2.67.6:4444  helium```

Add a selenium-hub to localhost mapping in /etc/hosts if you dont want to change nightwatch.json for local testing.

## To run with local selenium
+ Download `selenium-server-standalone-x.yz.0.jar` from  http://www.seleniumhq.org/download/
+ Start it: `java -jar selenium-server-standalone-2.53.0.jar`
+ Change `selenium_host` to `localhost` in `nightwatch.json`