# Deployment of *bbnavi* `digitransit-ui` instances

For [bbnavi](https://bbnavi.de/), we run several instances of `digitransit-ui`, one per `*.bbnavi.de` subdomain.

Even though `digitransit-ui` is mainly a client-side front-end application, it also has [a server side (which serves its configuration and proxies some requests)](server). As our continuous integration (CI) and continuous deployment (CD) process, we lint & test the code, build a [Docker image](https://docs.docker.com/storage/storagedriver/#images-and-layers) from it and deploy that to [TPWD](https://tpwd.de)'s infrastructure, which is a [Docker Swarm cluster](https://docs.docker.com/engine/swarm/) provided and managed by [*Planetary Quantum*](https://www.planetary-quantum.com).

We develop using *one* development branch (`release/int/development`) and *one* main branch (`bbnavi`). We deploy an instance by pushing an accordingly named [Git tag](https://git-scm.com/docs/git-tag) – e.g. `release_angermuende_2022_04_13` to deploy `angermuende.bbnavi.de`. Thus, the deployed `digitransit-ui` instances only differ in two possible ways:
- different states of development – `angermuende.bbnavi.de` might have been deployed via a tag on a more recent commit of the `bbnavi` branch than e.g. `herzberg-elster.bbnavi.de`
- configured environment variables, which in turn might toggle [feature flags](https://en.wikipedia.org/wiki/Feature_toggle) in the code

A `CONFIG` environment variable is used to determine which instance-specific configuration to use; For example, `CONFIG=bbnavi-angermuende` will make it load `app/configurations/config.bbnavi-angermuende.js`. Because we develop from *one* main branch, almost all differences between the instances lead back to a different `config.bbnavi-*.js` file being used because of a different `$CONFIG` value.

[`.gitlab-ci.yml`](.gitlab-ci.yml) defines all steps to be run by the [Gitlab CI service](https://docs.gitlab.com/ee/ci/) in all possible scenarios. Currently, the scenarious relevant to the deployment process are these:
- on a push to the `bbnavi` (main) branch, the CI system will
	1. lint & test the code
	2. build a Docker image tagged with the [Git commit](https://git-scm.com/docs/gitglossary#Documentation/gitglossary.txt-aiddefcommitacommit)'s hash, e.g. `digitransit-ui:157f0ec…`
	3. push this Docker image to [the repo's *Container Registry*](https://gitlab.tpwd.de/tpwd/bb-navi/digitransit-ui/container_registry), a place to store Docker images
- when Git tag named `release_<instance>_<date>` or `release_<instance>_<date>_<count>` is pushed, the CI system will
	1. check if there is a Docker image tagged with the respective commit's hash available in the *Container Registry*
	2. deploy that Docker image to our infrastructure, using
		- [*Docker Compose*](https://docs.docker.com/compose/) to compile the environment variables & configuration of the instance from several files
		- [Quantum CLI](https://cli.planetary-quantum.com), a command-line interface to *Planetary Quantum*

With this process,
- we ensure that **only code can be deployed that has been linted and tested** on the `bbnavi` (main) branch;
- when deploying many instances at once, we **avoid running the time-consuming Docker image build mulitple times**, siginificantly reducing the total deployment time;
- we achieve reasonable transparency over what has been deployed where and when.

*Note:* Currently, [there is a bug in Gitlab](https://gitlab.com/gitlab-org/gitlab/-/issues/358729) that, in the [tags list](https://gitlab.tpwd.de/tpwd/bb-navi/digitransit-ui/-/tags), links the wrong CI pipelines. Be attentive when navigating Gitlab in this direction!

*Note:* Currently, there is a bug in Gitlab that, when pushing too many Git tags at once (it happened to me with 6), it won't start CI pipelines for all of them. Therefore, when deploying many `*.bbnavi.de` instances, make sure to push the tags in badges of 3-4; Pushing another badge before the previous set of CI pipelines has finished is fine, Gitlab will queue them as pending.

## How to deploy a new `*.bbnavi` instance

Assuming an instance name `bbnavi-foo` available at `bar.bbnavi.de`, follow these steps:

1. Create a new configuration `app/configurations/config.bbnavi-foo.js` and customize e.g. the UI color or available transport modes. Let this file partially override/extend `app/configurations/config.bbnavi.js` using the `configMerger` helper. For an example, have a look at `app/configurations/config.bbnavi-bad-belzig.js`.
2. Test your customizations locally but running the local dev environment with `CONFIG=bbnavi-foo`.
3. Create a new deployment file `deployments/stack.bar.yml` by adapting e.g. `deployments/stack.bad-belzig.yml`. Make sure to set `CONFIG=bbnavi-foo`. This file partially overrides/extends `deployments/stack.yml`.
4. Make sure your changes are pushed to `bbnavi`, and wait for the CI pipeline to build and push a Docker image `digitransit-ui:<git-commit-sha>`.
5. Push a Git tag `release_foo_<year>-<month>-<date>` pointing to the (exact) same commit. The CI pipeline should now deploy the instance by creating a new service in the Docker Swarm cluster.
6. Soon after, your instance should be available at `https://bar.bbnavi.de`.
