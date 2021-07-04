var fs = require('fs');
var path = require('path');

var load = function(path, name) {
    if (name) {
        return require(path + name);
    }
    return require(path)
};

exports.SkynetLoadModule = function (dir) {
    patcher = {}

    // fs.readdirSync(__dirname + '/' + dir).forEach(function (filename) {
    //     if (!/\.js$/.test(filename)) {
    //         return;
    //     }
    //     var name = path.basename(filename, '.js');
    //     console.log(name)
        
    // });
    // var _load = load.bind(null, './' + dir + '/', dir);

    // patcher.__defineGetter__(dir, _load);
    patcher=require(dir)
    return patcher;
}