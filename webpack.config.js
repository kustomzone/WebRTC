var webpack = require('webpack');
var path = require('path');

var publicPath = 'http://localhost:3000/';
var hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true';

var devConfig = {
    entry: {
        home: ['./client/page/home', hotMiddlewareScript],
        user: ['./client/page/user', hotMiddlewareScript],
        anchor: ['./client/page/anchor', hotMiddlewareScript]
    },
    output: {
        filename: './[name]/bundle.js',
        path: path.resolve(__dirname, './public'),
        publicPath: publicPath
    },
    devtool: 'eval-source-map',
    module: {
        rules: [{
            test: /\.(png|jpg)$/,
            use: 'url-loader?limit=8192&context=client&name=[path][name].[ext]'
        }, {
            test: /\.scss$/,
            use: [
                'style-loader',
                'css-loader?sourceMap',
                'resolve-url-loader',
                'sass-loader?sourceMap'
            ]
        }, {
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader?sourceMap',
                'resolve-url-loader'
            ]
        }, {
            test: /\.(js|jsx)$/,
            use: [ 'babel-loader']
        }, {
            test: /\.(woff|ttf|eot|svg)(\?[\w\d#]+)?$/,
            loader: 'url-loader?limit=8192'
        }]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ],
    resolve: {
        alias: {
            '@containers': `${__dirname}/client/containers`,
            '@src': `${__dirname}`,
            '@styles': `${__dirname}/client/styles`,
            '@resources': `${__dirname}/client/resources`
        }
    }
};

module.exports = devConfig;
