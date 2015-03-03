var RouterSharedFront = require('../lib/routers/shared-front');


module.exports = (function() {
    'use strict';
    var router = require('express').Router();

    router.post('/timer/start/:id?', function (req, res) {
      var sharedRouter = new RouterSharedFront({
          user: req.user,
          grouped: res.locals.grouped,
      });

      sharedRouter.getController().startTimer(
          req.params.id,
          req.body.jobid,
          req.body.description,
          req.body.actiontime
      ).then(timer => {
        res.statusCode = 200;
        res.json(timer);
      });
    });

    router.put('/timer/stop/:id', function (req, res) {
      var sharedRouter = new RouterSharedFront({
          user: req.user,
          grouped: res.locals.grouped,
      });

      sharedRouter.getController().stopTimer(
          req.params.id,
          req.body.actiontime
      ).then(timer => {
        res.statusCode = 200;
        res.json(timer);
      });
    });


    router.put('/timer/update/:id', function (req, res) {
      var sharedRouter = new RouterSharedFront({
          user: req.user,
          grouped: res.locals.grouped,
      });

      sharedRouter.getController().updateTimer(
          req.params.id,
          {
            description: req.body.description,
            jobID: req.body.jobid
          }
      ).then(timer => {
        res.statusCode = 200;
        res.json(timer);
      });
    });

    return router;
})();
