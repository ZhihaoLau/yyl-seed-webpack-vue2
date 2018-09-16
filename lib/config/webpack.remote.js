const webpackMerge = require('webpack-merge');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const path = require('path');
const px2rem = require('postcss-px2rem');

const webpackBase = require('./webpack.base.js');
const util = require('yyl-util');

const init = (config) => {
  // + 生成 空白 css 插件
  class BuildBlankCssPlugin {
    apply(compiler) {
      compiler.hooks.emit.tapAsync(
        'buildBlankCss',
        (compilation, done) => {
          const files = [];
          for (let filename in compilation.assets) {
            let iPath = util.joinFormat(filename);
            if (
              !/^\.\.\//.test(iPath) &&
              path.extname(iPath) === '.js' &&
              iPath.split('/').length === 1
            ) {
              files.push(iPath.replace(/\.js/, ''));
            }
          }

          files.forEach((name) => {
            const rPath = path.relative(
              config.alias.jsDest,
              path.join(config.alias.cssDest, `${name}.css`)
            );
            compilation.assets[rPath] = {
              source() {
                return '';
              },
              size() {
                return 0;
              }
            };
          });
          done();
        }
      );
    }
  }
  // - 生成 空白 css 插件

  const webpackConfig = {
    mode: 'development',
    output: {
      publicPath: util.joinFormat(
        config.commit.hostname,
        config.dest.basePath,
        path.relative(
          config.alias.root,
          config.alias.jsDest
        ),
        '/'
      )
    },
    module: {
      rules: [{
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => config.platform == 'pc'? [
                autoprefixer({
                  browsers: ['> 1%', 'last 2 versions']
                })
              ] : [
                autoprefixer({
                  browsers: ['iOS >= 7', 'Android >= 4']
                }),
                px2rem({remUnit: 75})

              ]
            }
          }
        ]
      }, {
        test: /\.(scss|sass)$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => config.platform == 'pc'? [
                autoprefixer({
                  browsers: ['> 1%', 'last 2 versions']
                })
              ] : [
                autoprefixer({
                  browsers: ['iOS >= 7', 'Android >= 4']
                }),
                px2rem({remUnit: 75})

              ]
            }
          },
          'sass-loader'
        ]
      }, {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 0,
            name: util.joinFormat(
              path.relative(
                config.alias.jsDest,
                path.join(config.alias.imagesDest, '[name].[ext]')
              )
            )
          }
        }
      }]
    },
    plugins: [
      // 环境变量 (全局替换 含有这 变量的 js)
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development')
      }),
      new BuildBlankCssPlugin()
    ]
  };
  return webpackMerge(webpackBase(config), webpackConfig);
};

module.exports = init;