const path = require('path')
module.exports = {
    mode: 'development',
    devServer: {
        contentBase: path.resolve(__dirname, 'dist')
    },
    entry: './index.js',
    module: {
        rules: [{
            test: /\.scss$/,
            loader: ['style-loader', 'css-loader', 'sass-loader']
        }, {
            test: /\.js$/,
            include: [
                path.resolve(__dirname, 'js')
            ],
            loader: 'babel-loader'
        }]
    }
}