const webpack = require('webpack')
const config = require('./webpack.config.js')
webpack(config, (err, stats) => {
    if (err || stats.hasErrors()) {
        console.log('has error')
    }

});