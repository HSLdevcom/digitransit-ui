# Deployment of *bbnavi* `digitransit-ui` instances

For [bbnavi](https://bbnavi.de/), we run several instances of `digitransit-ui`, one per `*.bbnavi.de` subdomain.

Even though `digitransit-ui` is mainly a client-side front-end application, it also has [a server side (which serves its configuration and proxies some requests)](server). As our continuous integration (CI) and continuous deployment (CD) process, we lint & test the code, build a [Docker image](https://docs.docker.com/storage/storagedriver/#images-and-layers) from it and deploy that to [TPWD](https://tpwd.de)'s infrastructure, which is a [Docker Swarm cluster](https://docs.docker.com/engine/swarm/) provided and managed by [*Planetary Quantum*](https://www.planetary-quantum.com).

We develop using *one* development branch (`release/int/development`) and *one* main branch (`bbnavi`). We deploy an instance by pushing an accordingly named [Git tag](https://git-scm.com/docs/git-tag) – e.g. `release_angermuende_2022_04_13` to deploy `angermuende.bbnavi.de`. Thus, the deployed `digitransit-ui` instances only differ in two possible ways:
- different states of development – `angermuende.bbnavi.de` might have been deployed via a tag on a more recent commit of the `bbnavi` branch than e.g. `herzberg-elster.bbnavi.de`
- configured environment variables, which in turn might toggle [feature flags](https://en.wikipedia.org/wiki/Feature_toggle) in the code

A `CONFIG` environment variable is used to determine which instance-specific configuration to use; For example, `CONFIG=bbnavi-angermuende` will make it load `app/configurations/config.bbnavi-angermuende.js`. Because we develop from *one* main branch, almost all differences between the instances lead back to a different `config.bbnavi-*.js` file being used because of a different `$CONFIG` value.

[`lint-test-deploy.yml`](../.github/workflows/lint-test-deploy.yml) defines all steps to be run by the [*GitHub Actions* CI service](https://docs.github.com/en/actions):
1. On a push to any branch, the CI system will 
	a. lint, build & test the code by running the respective `yarn run …` commands
	b. build a Docker image, but only cache the image's layers (to speed up subsequent builds) without pushing it
2. When Git tag named `release_<instance>_<date>` or `release_<instance>_<date>_<i>` is pushed, the CI system will
	1. lint, build & test the code, as described above
	2. build a Docker image tagged with
		- the Git tag, e.g. `release_frankfurt-oder_2023-02-06_2`
		- a "stable" tag used to permanently identify one deployment, consisting of the date+time and the [Git commit](https://git-scm.com/docs/gitglossary#Documentation/gitglossary.txt-aiddefcommitacommit)'s hash, e.g. `2023-02-06T09.10.12-abcdefgh`
	3. push this Docker image [to the *Container Registry*](https://github.com/bbnavi/digitransit-ui/pkgs/container/digitransit-ui)
	4. deploy that Docker image to our infrastructure, using
		- [*Docker Compose*](https://docs.docker.com/compose/) to compile both general as well as instance-specific configuration parameters & secrets into a "flat" Docker Swarm stack
		- [Quantum CLI](https://cli.planetary-quantum.com), a command-line interface to *Planetary Quantum*

Because artifacts (e.g. `node_modules`, intermediate Docker image layers) needed for the CI process are being cached, deploying the same Git commiut to many instances avoids re-doing the time-consuming (full) Docker image build (with [some notable exceptions](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows#restrictions-for-accessing-a-cache)).

Also, because each deployment is represented as a Git tag, we have transparency over what has been deployed where and when.

## How to deploy a new `*.bbnavi.de` instance

Assuming an instance name `bbnavi-foo` available at `bar.bbnavi.de`, and an already existing MATOMO-Container for the new instance, follow these steps below. Note: in most cases, `bar.bbnavi.de` will be equal to `foo.bbnavi.de`, but other domain names (e.g. `mitfahrenbb.de`) may be chosen also. 

1. Create a new configuration `app/configurations/config.bbnavi-foo.js`, e.g. by copying `app/configurations/config.bbnavi-bad-belzig.js`, and customize it: 
	* Adapt the `CONFIG`, `APP_TITLE`, `HEADER_TITLE` variables
	* For MATOMO_URL, specify the URL of the monitoring container, e.g. 'https://nutzung.bbnavi.de/js/container_XXXXXX.js', where XXXX is instance specific. If no tracking is intended, remove all references to MATOMO.
	* for `searchParams` and `defaultEndpoint`, choose the center location of the choosen regions, e.g. figured out via https://osm.org
2. Copy the styles customizations from an existing instance, e.g. via `cp -r sass/themes/bbnavi-{bad-belzig,foo}`
3. Test your customizations locally by running the local dev environment with `CONFIG=bbnavi-foo`. For more information, see the [installation documentation](https://github.com/bbnavi/digitransit-ui/blob/c8c5d7eeaa1303c2c81d4000131dbddbb1fea2b4/docs/Installation.md#start-development-version)
4. Create a new deployment file `deployments/stack.foo.yml` by copying and adapting e.g. `deployments/stack.bad-belzig.yml`. Make sure to set `CONFIG=bbnavi-foo` and to configure `traefik.frontend.rule: Host:bar.bbnavi.de`. This file partially overrides/extends `deployments/stack.yml`.
5. Optional: if the instance should be accessible only with [basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication), configure `traefik.frontend.auth.basic.users` in `deployments/stack.foo.yml` like e.g. for the [Bernau instance]( https://github.com/bbnavi/digitransit-ui/blob/c8c5d7eeaa1303c2c81d4000131dbddbb1fea2b4/deployment/stack.bernau-bei-berlin.yml#L10-L11). The password can be encrypted via [`htpasswd`](https://httpd.apache.org/docs/2.4/programs/htpasswd.html) (see [traefik docs](https://doc.traefik.io/traefik/v1.7/configuration/entrypoints/#basic-authentication) for details)
6. Push your changes to GitHub, either into a separate branch, or into `bbnavi`. Wait for the CI to lint and test your code. After an initial test deployment, we usually merge the changes into `bbnavi`.
7. Create a Git tag `release_foo_<year>-<month>-<date>`, e.g. by running `git tag release_foo_2023-04-05`, and push it via `git push --no-verify origin release_foo_2023-04-05`. A resulting CI workflow run (see [the workflows list](https://github.com/bbnavi/digitransit-ui/actions)) should now lint and test the code, and then deploy the instance by creating a new service in the Docker Swarm cluster.
8. Soon after, your instance should be available at `https://bar.bbnavi.de`.
