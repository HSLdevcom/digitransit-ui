import fs from 'node:fs';
import path from 'node:path';
import { mergeConfig } from 'vite';
import defineLibraryConfig from '@digitransit-ui/vite-config';

const schema = path.join(
  import.meta.dirname,
  '../../private/schema/schema.graphql',
);

// Ships the GraphQL schema the queries were compiled against.
export default () =>
  mergeConfig(defineLibraryConfig(), {
    plugins: [
      {
        name: 'query-utils:schema',
        buildStart() {
          this.addWatchFile(schema);
        },
        generateBundle() {
          this.emitFile({
            type: 'asset',
            fileName: 'schema/schema.graphql',
            source: fs.readFileSync(schema),
          });
        },
      },
    ],
  });
