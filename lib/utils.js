'use strict';

var fs      = require('fs'),
    path    = require('path');


// -----------------------------------------------------------------------------

function requireDir(dir) {
    return fs.readdirSync(dir).reduce(function (modules, filename) {
        if (filename === 'index.js' || path.extname(filename) !== '.js') {
            return modules;
        }

        var moduleName = path.basename(filename, '.js'),
            module     = require(path.join(dir, moduleName));

        if (typeof module === 'function' && module.name) {
            moduleName = module.name;
        }

        modules[moduleName] = module;
        return modules;
    }, {});
}

exports.requireDir = requireDir;
