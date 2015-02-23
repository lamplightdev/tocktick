//var Handlebars = require('handlebars');

exports.isnotnull = isnotnull;

function isnotnull(conditional, options) {
  if (conditional !== 'null') {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}
