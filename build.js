const path = require('path');
const rollup = require('rollup');
const watch = require('rollup-watch');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const builtins = require('rollup-plugin-node-builtins');
const globals = require('rollup-plugin-node-globals');
const alias = require('rollup-plugin-alias');

function watchEventHandler(event, filename) {
  switch (event.code) {
    case 'STARTING':
      console.error('checking rollup-watch version...');
      break
    case 'BUILD_START':
      console.error(`bundling ${filename}...`);
      break;
    case 'BUILD_END':
      console.error(`${filename} bundled in ${event.duration}ms. Watching for changes...`);
      break;
    case 'ERROR':
      console.error(`error: ${event.error}`);
      break;
    default:
      console.error(`unknown event: ${event}`);
  }
}

function bundleAndMaybeWatch(baseFilename) {
  const config = {
    // TODO: Typescript in rollup rather than separately?
    entry: `lib/${baseFilename}.js`,
    dest: `dist/${baseFilename}.js`,
    format: 'es',
    plugins: [
      resolve({
        main: true,
        browser: true
      }),
      commonjs({
        namedExports: {
          'preact-compat': [ 'Component', 'PureComponent', 'render', 'createElement' ]
        }
      }),
      globals(),
      builtins(),
      alias({
        'react': path.resolve(__dirname, 'node_modules/preact-compat/dist/preact-compat'),
        'react-dom': path.resolve(__dirname, 'node_modules/preact-compat/dist/preact-compat')
      })
    ]
  };

  if (process.argv.indexOf('-w') !== -1) {
    console.error(`will watch for changes and rebundle ${config.entry}`);
    watch(rollup, config)
      .on('event', e => watchEventHandler(e, config.entry));
  } else {
    console.error(`building ${config.entry}`);
    rollup.rollup(config)
      .then(bundle => {
        bundle.write(config);
      });
  }
}

bundleAndMaybeWatch('settings/settings');
bundleAndMaybeWatch('background/background');
