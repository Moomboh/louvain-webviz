import { hmrPlugin, presets } from '@open-wc/dev-server-hmr';
import { rollupAdapter } from '@web/dev-server-rollup';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';

const hmr = process.argv.includes('--hmr');

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  open: '/',
  watch: !hmr,
  nodeResolve: {
    exportConditions: ['browser', 'development'],
  },

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
