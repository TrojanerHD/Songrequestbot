const path = require('path');
const webpack = require('webpack');
const node_externals = require('webpack-node-externals')

module.exports = function(env, argv) {
////////////////////////////////////////////////////
//  BACKEND CONFIGURATION

    backendConfig = {
        mode: 'development',
        
        entry: {
            main:  ['@babel/polyfill','./src/index.js']
        },

        target: 'node',
        externals: [node_externals()],
      devtool: 'source-map',
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist')
        },

        node: {
            __dirname: false
        },

        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: 
                    [
                        'babel-loader',
                        'ts-loader'
                    ],
                    exclude: [/node_modules/]
                },
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: [/node_modules/]
                }
            ]
        },

        plugins: [new webpack.ProgressPlugin()],

        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendors: {
                        priority: -10,
                        test: /[\\/]node_modules[\\/]/
                    }
                },

                chunks: 'async',
                minChunks: 1,
                minSize: 30000,
                name: true
            }
        },
        resolve: {
            extensions: ['.js', '.ts', '.json']
        }
    }

    return [backendConfig]
};
