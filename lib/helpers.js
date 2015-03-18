//var Handlebars = require('handlebars');

exports.ifnotfalse = ifnotfalse;
exports.ifequal = ifequal;
exports.objcall = objcall;
exports.ifobjcall = ifobjcall;
exports.eachobjcall = eachobjcall;
exports.arrindexprop = arrindexprop;
exports.ifIn = ifIn;


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

function objcall(obj, call, options) {
  var params = [];
  for(var key in options.hash) {
    params.push(options.hash[key]);
  }
  if (typeof obj[call] === 'function') {
    return obj[call].apply(obj, params);
  } else {
    return obj[call];
  }
}

function ifobjcall(obj, call, options) {
  var params = [];
  for(var key in options.hash) {
    params.push(options.hash[key]);
  }

  var result;
  if (typeof obj[call] === 'function') {
    result = obj[call].apply(obj, params);
  } else {
    result = obj[call];
  }

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}

function eachobjcall(obj, call, options) {
  var params = [];
  for(var key in options.hash) {
    params.push(options.hash[key]);
  }
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

function ifIn(elem, arr, options) {
  console.log(arr);
  if(arr.indexOf(elem) > -1) {
    return options.fn(this);
  }
  return options.inverse(this);
}
