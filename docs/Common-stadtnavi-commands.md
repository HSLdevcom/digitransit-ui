I tend to only run the entire digitransit-stack on my own machine for exceptional cases. For the
most part test the backend and fronted separately.

## Testing OTP

OTP has a fairly usable debug view which is available on localhost:8080. There you can test your changes to the
routing algorithm.

## Digitransit

Generally, it's enough to run digitransit and use the dev backend, like this

```
CONFIG=hbnext API_URL=https://api.dev.stadtnavi.eu yarn run de
```

In some special cases you might want to run a local OTP and run queries against that:

```
CONFIG=hbnext \
  PORT=9090 \
  API_URL=http://localhost:8080 \
  OTP_URL=http://localhost:8080/otp/routers/default/ \
    yarn run dev
```

## Changing the submodules

Digitransit is split up into several submodules. They live in 

- `digitransit-component`
- `digitransit-search-util`
- `digitransit-store`
- `digitransit-util`
- `digtransit-search-util`

If you change the code in any of these modules, you will have to rebuild with this:

```
yarn setup
```

This takes quite a long time (~2 minutes).

If you want to keep a watch on the subcomponents you can run the following command in addition to your normal
digitransit invocation (see above):

```
yarn run digitransit-watch-components
```

This watches if any of the submodules has been changed and compiles it on-the-fly.
