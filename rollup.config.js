import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import html from '@web/rollup-plugin-html';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import url from '@rollup/plugin-url';
import postcssUrl from 'postcss-url';
import postcss from 'postcss';
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
    output: {
      entryFileNames: '[name]-[hash].js',
      chunkFileNames: '[name]-[hash].js',
      assetFileNames: '[name]-[hash][extname]',
      format: 'es',
      dir: 'dist',
    },

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
        transformHtml: (htmlContent, file) => {
          if (file.htmlFileName.includes('imprint')) {
            return htmlContent.replace(
              '__IMPRINT_CONTENT__',
              process.env.LWV_IMPRINT_CONTENT || 'TESTEST'
            );
          }

          if (file.htmlFileName.includes('privacy')) {
            return htmlContent.replace(
              '__PRIVACY_CONTENT__',
              process.env.LWV_PRIVACY_CONTENT || 'TESTEST'
            );
          }

          return htmlContent;
        },
        transformAsset: async (content, filePath) => {
          if (filePath.endsWith('.css')) {
            const result = await postcss()
              .use(
                postcssUrl({
                  url: 'copy',
                  assetsPath: 'dist',
                  useHash: true,
                })
              )
              .process(content, {
                from: filePath,
                to: 'dist/',
              });

            // TODO: this replace is a workaround. postcss-url should be configured
            //       to not have the `assetsPath` as prefix in the `url()`
            return result.css.replaceAll('url(dist/', 'url(');
          }

          return content;
        },
      }),
      url(),
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
