# digitransit-ui-nightwatch

Install ```npm install```

Run tests: ```npm test```

When running locally, you either need a local selenium running, or a ssh tunnel to k8sm

Tunnel: ```ssh -N -L4443:10.2.67.6:4444  k8sm```

Add a selenium-hub to localhost mapping in /etc/hosts if you dont want to change nightwatch.json for local testing.
