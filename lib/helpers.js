//var Handlebars = require('handlebars');

exports.ifnotfalse = ifnotfalse;
exports.arrindexprop = arrindexprop;

function ifnotfalse(conditional, options) {
  if (conditional !== false) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}


function arrindexprop(arr, index, prop) {
  var item = arr[index];
  if (typeof item[prop] === 'function') {
    return item[prop]();
  } else {
    return item[prop];
  }
}
/*
exports.iffn = iffn;
exports.unlessfn = unlessfn;

// if for a object function that is true/falsey

function iffn(conditional, options) {
  if (conditional.bind(this)()) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}


function unlessfn(conditional, options) {
  if (!conditional.bind(this)()) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}
*/
