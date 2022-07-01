import { hmrPlugin, presets } from '@open-wc/dev-server-hmr';
import { rollupAdapter } from '@web/dev-server-rollup';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';

const hmr = process.argv.includes('--hmr');

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  watch: !hmr,
  nodeResolve: {
    exportConditions: ['browser', 'development'],
  },

  middleware: [
    (context, next) => {
      // match urls with no file extension or `.html` and serve those from `src/pages`
      if (
        context.url.match(/^(\/(\w+))*\/?(\.\w{5,})?\??([^.]+)?$/) ||
        context.url.match(/.*\.html$/)
      ) {
        context.url = `src/pages${context.url}`;
      }

      return next();
    },
  ],

  esbuildTarget: 'auto',

  plugins: [
    rollupAdapter(commonjs()),
    rollupAdapter(
      alias({
        entries: [
          {
            find: '_vendors',
            replacement: `${process.cwd()}/out-vendors/vendors.bundle.js`,
          },
        ],
      })
    ),
    hmr &&
      hmrPlugin({
        exclude: ['**/*/node_modules/**/*'],
        presets: [presets.litElement],
      }),
  ],
});
