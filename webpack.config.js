const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const htmlPlugin = new HtmlWebpackPlugin({
    template: './client/src/index.html',
    filename: 'index.html'
});

module.exports = {
    entry: './client/src/index.js',
    output: {
        path: path.resolve('./client/build'),
        publicPath: "/static"
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    plugins: [htmlPlugin]
};