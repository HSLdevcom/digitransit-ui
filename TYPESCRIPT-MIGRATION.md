# Typescript migration

## Proven approaches

Typescript migration projects has been completed and documented. One approach
to follow: https://www.sitepoint.com/how-to-migrate-a-react-app-to-typescript/

## Migrate files

1. Rename file extension `.js` to `.ts`.
2. Run migration tool in project root (where tsconfig.json is):

```sh
yarn ts-migrate migrate --sources app/**/*.ts
```

## Strategies

Tool `ts-migrate` adds `@ts-expect-error` annotation to postpone resolution.

### Packages

**Example case:**

```js
// @ts-expect-error TS(7016): Could not find a declaration file for module 'clas... Remove this comment to see the full error message
import cx from 'classnames';
```

**Resolution:**

For widely used packages, add type definition package to project (note: as devDependency):

```sh
yarn add --dev @types/classsnames
```

After package is added, annotation line (`// @ts-expect-error ...`) should be removed.

### Little used and inhouse-maintained packages:

Use a tool to infer module types with an external tool, eg. `dts-gen` by Microsoft [https://github.com/microsoft/dts-gen](https://github.com/microsoft/dts-gen).

If module can be imported by node (>=10 <11) from command line, create types by running:

```sh
# creates a file "package-name.d.ts"
npx dts-gen -m <package-name>
```
