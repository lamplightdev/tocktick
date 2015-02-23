'use strict';

var exphbs     = require('express-handlebars'),
    Handlebars = require('handlebars'),
    helpers    = require('./helpers'),
    config     = require('../config');

module.exports = exphbs.create({
    defaultLayout: 'main',
    handlebars   : Handlebars,
    helpers      : helpers,
    layoutsDir   : config.dirs.layouts,
    partialsDir  : [config.dirs.partials, config.dirs.shared]
});
