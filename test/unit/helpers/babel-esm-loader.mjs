import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformAsync } from '@babel/core';

// THIS IS A HACK TO MAKE MOCHA WORK WITH ESM 'import' SYNTAX.

const NODE_MODULES_SEGMENT = `${path.sep}node_modules${path.sep}`;

function shouldTransform(url, format) {
  if (format !== 'module' || !url.startsWith('file://')) {
    return false;
  }

  const filePath = fileURLToPath(url);
  return (
    (filePath.endsWith('.js') || filePath.endsWith('.jsx')) &&
    !filePath.includes(NODE_MODULES_SEGMENT)
  );
}

export async function load(url, context, defaultLoad) {
  const loaded = await defaultLoad(url, context, defaultLoad);

  if (!shouldTransform(url, loaded.format)) {
    return loaded;
  }

  const source =
    typeof loaded.source === 'string'
      ? loaded.source
      : Buffer.from(loaded.source).toString('utf8');

  const transformed = await transformAsync(source, {
    filename: fileURLToPath(url),
    caller: {
      name: 'babel-esm-loader',
      supportsStaticESM: true,
    },
    sourceMaps: 'inline',
  });

  return {
    format: loaded.format,
    source: transformed?.code ?? source,
    shortCircuit: true,
  };
}
