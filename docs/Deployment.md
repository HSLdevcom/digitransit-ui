# Deployment of *bbnavi* `digitransit-ui` instances

For [bbnavi](https://bbnavi.de/), we run several instances of `digitransit-ui`, one per `*.bbnavi.de` subdomain.

Even though `digitransit-ui` is mainly a client-side front-end application, it also has [a server side (which serves its configuration and proxies some requests)](server). As our continuous integration (CI) and continuous deployment (CD) process, we lint & test the code, build a [Docker image](https://docs.docker.com/storage/storagedriver/#images-and-layers) from it and deploy that to [TPWD](https://tpwd.de)'s infrastructure, which is a [Docker Swarm cluster](https://docs.docker.com/engine/swarm/) provided and managed by [*Planetary Quantum*](https://www.planetary-quantum.com).

We develop using *one* development branch (`release/int/development`) and *one* main branch (`bbnavi`). We deploy an instance by pushing an accordingly named [Git tag](https://git-scm.com/docs/git-tag) – e.g. `release_angermuende_2022_04_13` to deploy `angermuende.bbnavi.de`. Thus, the deployed `digitransit-ui` instances only differ in two possible ways:
- different states of development – `angermuende.bbnavi.de` might have been deployed via a tag on a more recent commit of the `bbnavi` branch than e.g. `herzberg-elster.bbnavi.de`
- configured environment variables, which in turn might toggle [feature flags](https://en.wikipedia.org/wiki/Feature_toggle) in the code

A `CONFIG` environment variable is used to determine which instance-specific configuration to use; For example, `CONFIG=bbnavi-angermuende` will make it load `app/configurations/config.bbnavi-angermuende.js`. Because we develop from *one* main branch, almost all differences between the instances lead back to a different `config.bbnavi-*.js` file being used because of a different `$CONFIG` value.

[`lint-test-deploy.yml`](../.github/workflows/lint-test-deploy.yml) defines all steps to be run by the [*GitHub Actions* CI service](https://docs.github.com/en/actions):
1. On a push to any branch, the CI system will lint, build & test the code by running the respective `yarn run …` commands.
2. When Git tag named `release_<instance>_<date>` or `release_<instance>_<date>_<i>` is pushed, the CI system will
	1. lint, build & test the code, as described above
	2. build a Docker image tagged with
		- the Git tag, e.g. `release_frankfurt-oder_2023-02-06_2`
		- a "stable" tag used to permanently identify one deployment, consisting of the date+time and the [Git commit](https://git-scm.com/docs/gitglossary#Documentation/gitglossary.txt-aiddefcommitacommit)'s hash, e.g. `2023-02-06T09.10.12-abcdefgh`
	3. push this Docker image [to the *Container Registry*](https://github.com/bbnavi/digitransit-ui/pkgs/container/digitransit-ui)
	4. deploy that Docker image to our infrastructure, using
		- [*Docker Compose*](https://docs.docker.com/compose/) to compile both general as well as instance-specific configuration parameters & secrets into a "flat" Docker Swarm stack
		- [Quantum CLI](https://cli.planetary-quantum.com), a command-line interface to *Planetary Quantum*

Because artifacts (e.g. `node_modules`, intermediate Docker image layers) needed for the CI process are being cached, deploying the same Git commiut to many instances avoids re-doing the time-consuming (full) Docker image build.

Also, because all deployments has a corresponding Git tag, we have transparency over what has been deployed where and when.

## How to deploy a new `*.bbnavi.de` instance

Assuming an instance name `bbnavi-foo` available at `bar.bbnavi.de`, follow these steps:

1. Create a new configuration `app/configurations/config.bbnavi-foo.js` and customize e.g. the UI color or available transport modes. Let this file partially override/extend `app/configurations/config.bbnavi.js` using the `configMerger` helper. For an example, have a look at `app/configurations/config.bbnavi-bad-belzig.js`.
2. Test your customizations locally by running the local dev environment with `CONFIG=bbnavi-foo`.
3. Create a new deployment file `deployments/stack.bar.yml` by adapting e.g. `deployments/stack.bad-belzig.yml`. Make sure to set `CONFIG=bbnavi-foo`. This file partially overrides/extends `deployments/stack.yml`.
5. Push your changes to GitHub, either into a separate branch, or into `bbnavi`. Wait for the CI to lint and test your code.
6. Push a Git tag `release_foo_<year>-<month>-<date>` pointing to the (exact) same commit. The CI pipeline should now deploy the instance by creating a new service in the Docker Swarm cluster.
6. Soon after, your instance should be available at `https://bar.bbnavi.de`.
