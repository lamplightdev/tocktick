module.exports = (function() {
    'use strict';
    var router = require('express').Router();

    router.post('/timer/start/:job/:item', function (req, res) {
      res.statusCode = 200;
      res.json(true);
    });

    router.put('/timer/stop/:job/:item', function (req, res) {
      res.statusCode = 200;
      res.json(true);
    });

    return router;
})();
