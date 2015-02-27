var RouterSharedFront = require('../lib/routers/shared-front');


module.exports = (function() {
    'use strict';
    var router = require('express').Router();

    router.post('/timer/start/:id?', function (req, res) {
      var sharedRouter = new RouterSharedFront({
          user: req.user
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
          user: req.user
      });

      sharedRouter.getController().stopTimer(
          req.params.id,
          req.body.actiontime
      ).then(timer => {
        res.statusCode = 200;
        res.json(timer);
      });
    });

    return router;
})();
