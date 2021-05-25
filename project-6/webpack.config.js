const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require("webpack");

module.exports = {
    mode: 'production',
    entry: {
       app: './src/js/app.js'

    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: 'window'
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.(css)$/,
                use: ['style-loader', 'css-loader']
            }
        ]

    },
    resolve: {
        extensions: ['*', '.js'],
        alias: {
            process: "process/browser",
            stream: "stream-browserify",
            crypto: "crypto-browserify",
            http: "stream-http",
            https: "https-browserify",
            os: "os-browserify/browser",
            buffer: "buffer"
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
            stream: 'stream-browserify',
            crypto: "crypto-browserify",
            http: "stream-http",
            https: "https-browserify",
            os: "os-browserify/browser",
            buffer: 'buffer'
        }),
        new MiniCssExtractPlugin(),
        new CopyWebpackPlugin(
            {
                patterns: [
                    { from: "./index.html", to: "index.html" }
                ]
            }
        ),
    ],
    devServer: { contentBase: path.join(__dirname, "dist"), compress: true },
};