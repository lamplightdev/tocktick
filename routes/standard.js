var RouterSharedAccount = require('../lib/routers/shared-account');
var RouterSharedFront = require('../lib/routers/shared-front');
var RouterSharedTimers = require('../lib/routers/shared-timers');


module.exports = (function() {
    'use strict';
    var router = require('express').Router();

    router.post('/account/job/add', (req, res, next) => {
        var sharedRouter = new RouterSharedAccount({
            user: req.user,
            grouped: res.locals.grouped,
        });

        sharedRouter.getController().addJob({
            name: req.body.name
        }).then(job => {
            res.redirect('/account');
        }).then(null, next);
    });

    router.post('/account/timer/add', (req, res, next) => {
        var sharedRouter = new RouterSharedAccount({
            user: req.user,
            grouped: res.locals.grouped,
        });

        console.log(req.body);

        sharedRouter.getController().addTimer({
            jobID: req.body.jobid,
            description: req.body.description
        }).then(timer => {
            res.redirect('/account');
        }).then(null, next);
    });

    // catch all for /account/...
    router.get(/account(?:$|\/(.*))/i, (req, res, next) => {
        var sharedRouter = new RouterSharedAccount({
            user: req.user,
            grouped: res.locals.grouped,
            currentPage: 'account',
        });

        sharedRouter.match(req.params[0], req.query, (matched) => {

            res.render("view-account", sharedRouter.getController()._getViewData());

        }, (err) => {
            console.log('account route error: ', err);
            next();
        });
    });

    router.post('/timer/start/:id?', (req, res, next) => {
        var sharedRouter = new RouterSharedFront({
            user: req.user,
            grouped: res.locals.grouped,
        });

        sharedRouter.getController().startTimer(
            req.params.id,
            req.body.jobid,
            req.body.description
        ).then(timer => {
            res.redirect('/');
        }).then(null, next);
    });

    router.post('/timer/stop/:id', (req, res, next) => {
        var sharedRouter = new RouterSharedFront({
            user: req.user,
            grouped: res.locals.grouped,
        });

        sharedRouter.getController().stopTimer(req.params.id).then(timer => {
            res.redirect('/');
        }).then(null, next);
    });

    // catch all for /timers...
    router.get(/timers(?:$|\/(.*))/i, (req, res, next) => {
        var sharedRouter = new RouterSharedTimers({
            user: req.user,
            grouped: res.locals.grouped,
            currentPage: 'timers',
        });

        sharedRouter.match(req.params[0], req.query, (matched) => {

            if (matched.name === 'timer-edit') {
                sharedRouter.getController().setExtraData({
                    timerEdit: matched.id
                });
            }
            res.render("view-timers", sharedRouter.getController()._getViewData());

        }, (err) => {
            console.log('timers route error: ', err);
            next();
        });
    });

    // catch all for /...
    router.get(/(?:$|\/(.*))/i, (req, res, next) => {
        var sharedRouter = new RouterSharedFront({
            user: req.user,
            grouped: res.locals.grouped,
            currentPage: 'front',
        });

        sharedRouter.match(req.params[0], req.query, (matched) => {

            res.render("view-front", sharedRouter.getController()._getViewData());

        }, (err) => {
            console.log('front route error: ', err);
            next();
        });
    });

    router.post('/timer/update/:id', function (req, res, next) {
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
        res.redirect('/timers/' + timer.getID());
      }).then(null, next);
    });

    router.post('/timer/delete/:id', function (req, res, next) {
      var sharedRouter = new RouterSharedFront({
          user: req.user,
          grouped: res.locals.grouped,
      });

      sharedRouter.getController().deleteTimer(req.params.id).then(() => {
        res.redirect('/timers');
      }).then(null, next);
    });

    return router;
})();
