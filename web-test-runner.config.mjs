import { playwrightLauncher } from '@web/test-runner-playwright';
import { rollupAdapter } from '@web/dev-server-rollup';
import alias from '@rollup/plugin-alias';

const filteredLogs = [
  'Running in dev mode',
  'lit-html is in dev mode',
  'Lit is in dev mode',
  'scheduled an update (generally because a property was set) after an update completed',
];

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  /** Test files to run */
  files: 'out-tsc/test/**/*.test.js',

  /** Resolve bare module imports */
  nodeResolve: {
    exportConditions: ['browser', 'development'],
  },

  plugins: [
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
  ],

  /** Filter out lit dev mode logs */
  filterBrowserLogs(log) {
    for (const arg of log.args) {
      if (typeof arg === 'string' && filteredLogs.some(l => arg.includes(l))) {
        return false;
      }
    }
    return true;
  },

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  esbuildTarget: 'auto',

  /** Amount of browsers to run concurrently */
  concurrentBrowsers: 2,

  /** Amount of test files per browser to test concurrently */
  concurrency: 1,

  /** Browsers to run tests on */
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' }),
  ],
});
