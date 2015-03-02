//var Handlebars = require('handlebars');

exports.ifnotfalse = ifnotfalse;
exports.ifequal = ifequal;
exports.objcall = objcall;
exports.eachobjcall = eachobjcall;
exports.arrindexprop = arrindexprop;

function ifnotfalse(conditional, options) {
  if (conditional !== false) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}

function ifequal(conditional, equalTo, options) {
  if (conditional === equalTo) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}

function objcall(obj, call) {
  console.log(obj, call);
  if (typeof obj[call] === 'function') {
    return obj[call]();
  } else {
    return obj[call];
  }
}

function eachobjcall(obj, call, options) {
  var params = [];
  for(var key in options.hash) {
    params.push(options.hash[key]);
  }
  console.log(obj, call, params);
  var items = obj[call].apply(obj, params);
  var ret = "";

  for(var i=0, j=items.length; i<j; i++) {
    ret = ret + options.fn(items[i]);
  }

  return ret;
}

function arrindexprop(arr, index, params) {
  params = params.split('.');
  var item = arr[index];
  for(var i=0; i<params.length; i++) {
    item = item[params[i]];
  }
  if (typeof item === 'function') {
    return item();
   } else {
    return item;
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
