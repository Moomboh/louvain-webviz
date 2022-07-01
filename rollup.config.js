import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import html from '@web/rollup-plugin-html';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import copy from 'rollup-plugin-copy';
import path from 'path';

export default [
  {
    input: 'src/vendors.js',
    treeshake: false,
    output: [
      {
        file: 'out-vendors/vendors.bundle.js',
        format: 'esm',
      },
    ],
    plugins: [nodeResolve(), commonjs({ transformMixedEsModules: true })],
  },
  {
    input: '**/*.html',
    output: { dir: 'dist' },

    plugins: [
      alias({
        entries: [
          {
            find: '_vendors',
            replacement: `${process.cwd()}/out-vendors/vendors.bundle.js`,
          },
        ],
      }),
      /** Enable using HTML as rollup entrypoint */
      html({
        minify: true,
        rootDir: path.join(process.cwd(), 'src/pages'),
        flattenOutput: false,
        // TODO: find a way to dedupe or even better completely generate HTML files for
        //       all pages in src/pages
      }),
      copy({
        targets: [
          {
            src: 'assets/fonts/material-icons/MaterialIcons-Regular.woff2',
            dest: 'dist/assets',
          },
        ],
      }),
      /** Resolve bare module imports */
      nodeResolve(),
      /** Minify JS */
      terser(),
      /** Bundle assets references via import.meta.url */
      importMetaAssets(),
      /** Compile JS to a lower language target */
      babel({
        babelHelpers: 'bundled',
        presets: [
          [
            require.resolve('@babel/preset-env'),
            {
              targets: [
                'last 3 Chrome major versions',
                'last 3 Firefox major versions',
                'last 3 Edge major versions',
                'last 3 Safari major versions',
              ],
              modules: false,
              bugfixes: true,
            },
          ],
        ],
        plugins: [
          [
            require.resolve('babel-plugin-template-html-minifier'),
            {
              modules: {
                lit: ['html', { name: 'css', encapsulation: 'style' }],
              },
              failOnError: false,
              strictCSS: true,
              htmlMinifier: {
                collapseWhitespace: true,
                conservativeCollapse: true,
                removeComments: true,
                caseSensitive: true,
                minifyCSS: true,
              },
            },
          ],
        ],
      }),
    ],
  },
];
