module.exports = (function() {
    'use strict';
    var router = require('express').Router();

    router.post('/timer/start/:jobID', function (req, res) {
      var db = res.locals.db;

      var timerID = req.body.timer.id;
      db.hmset('timer:' + timerID, {
        start: req.body.timer.start
      });
      db.sadd('jobs:' + req.params.jobID + ':timers', timerID);

      res.statusCode = 200;
      res.json({id: timerID});
    });

    router.put('/timer/stop/:clientID', function (req, res) {
      var db = res.locals.db;

      db.hmset('timer:' + req.params.clientID, {
        start: req.body.timer.start,
        stop: req.body.timer.stop
      });
      res.statusCode = 200;
      res.json(true);
    });

    return router;
})();
