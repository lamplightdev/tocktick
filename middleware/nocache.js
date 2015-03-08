'use strict';


module.exports = function noCache() {

  return function (req, res, next) {

    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();

  };
};
