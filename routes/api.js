module.exports = (function() {
    'use strict';
    var router = require('express').Router();

    router.post('/timer/start/:jobID', function (req, res) {
      var db = res.locals.db;

      var itemID = req.body.item.id;
      db.hmset('item:' + itemID, {
        start: req.body.item.start
      });
      db.sadd('jobs:' + req.params.jobID + ':items', itemID);

      res.statusCode = 200;
      res.json({id: itemID});
    });

    router.put('/timer/stop/:clientID', function (req, res) {
      var db = res.locals.db;

      db.hmset('item:' + req.params.clientID, {
        start: req.body.item.start,
        stop: req.body.item.stop
      });
      res.statusCode = 200;
      res.json(true);
    });

    return router;
})();
