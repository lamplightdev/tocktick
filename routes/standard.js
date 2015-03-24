var RouterAccount = require('../lib/routers/account');
var RouterFront = require('../lib/routers/front');
var RouterTimers = require('../lib/routers/timers');

var AppController = require('../lib/controllers/app');
var FrontController = require('../lib/controllers/front');
var AccountController = require('../lib/controllers/account');
var TimersController = require('../lib/controllers/timers');
var NavController = require('../lib/controllers/nav');

var Timer = require('../lib/models/timer');


module.exports = (function() {
    'use strict';
    var router = require('express').Router();

    router.post('/account/job/add', (req, res, next) => {
        var accountController = new AccountController({
            user: req.user,
            grouped: res.locals.grouped
        });

        accountController.addJob({
            name: req.body.name
        }).then(() => {
            res.redirect('/account');
        }).then(null, next);
    });

    router.post('/account/job/delete/:id', function (req, res, next) {
        var appController = new AppController({
            user: req.user,
            grouped: res.locals.grouped,
        });

        appController.deleteJob(req.params.id).then(() => {
            res.redirect('/account');
        }).then(null, next);
    });

    router.post('/account/tag/delete/:id', function (req, res, next) {
        var appController = new AppController({
            user: req.user,
            grouped: res.locals.grouped,
        });

        appController.deleteTag(req.params.id).then(() => {
            res.redirect('/account');
        }).then(null, next);
    });

    router.post('/account/tag/add', (req, res, next) => {
        var accountController = new AccountController({
            user: req.user,
            grouped: res.locals.grouped
        });

        accountController.addTag({
            name: req.body.name
        }).then(() => {
            res.redirect('/account');
        }).then(null, next);
    });

    // catch all for /account/...
    router.get(/account(?:$|\/(.*))/i, (req, res, next) => {

        RouterAccount.match(req.params[0], req.query, (matched) => {

            var accountController = new AccountController({
                user: req.user,
                grouped: res.locals.grouped
            });
            var navController = new NavController({
                user: req.user,
                grouped: res.locals.grouped,
                current: 'account'
            });
            var appController = new AppController({
                user: req.user,
                grouped: res.locals.grouped
            });

            appController.addExtraData({
                view: accountController.getViewData(),
                nav: navController.getViewData()
            });

            res.render("app", appController.getViewData());

        }, (err) => {
            console.log('account route error: ', err);
            next();
        });
    });

    router.post('/timer/start/:id?', (req, res, next) => {
        var frontController = new FrontController({
            user: req.user,
            grouped: res.locals.grouped,
        });

        frontController.startTimer(
            req.params.id,
            req.body.jobid,
            req.body.description
        ).then(() => {
            res.redirect('/');
        }).then(null, next);
    });

    router.post('/timer/stop/:id', (req, res, next) => {
        var frontController = new FrontController({
            user: req.user,
            grouped: res.locals.grouped,
        });

        frontController.stopTimer(
            req.params.id
        ).then(() => {
            res.redirect('/');
        }).then(null, next);
    });

    // catch all for /timers...
    router.get(/timers(?:$|\/(.*))/i, (req, res, next) => {
        RouterTimers.match(req.params[0], req.query, (matched) => {
            var timersController = new TimersController({
                user: req.user,
                grouped: res.locals.grouped
            });
            var navController = new NavController({
                user: req.user,
                grouped: res.locals.grouped,
                current: 'timers'
            });
            var appController = new AppController({
                user: req.user,
                grouped: res.locals.grouped
            });

            if (matched.name === 'timer' || matched.name === 'timer-edit') {
                if (!res.locals.grouped.timerExists(matched.id)) {
                    console.log('timer non-existent');
                    return next();
                }
            }

            if (matched.name === 'timer-edit') {
                timersController.addExtraData({
                    timerEditID: matched.id
                });
            }

            appController.addExtraData({
                view: timersController.getViewData(),
                nav: navController.getViewData()
            });
            res.render("app", appController.getViewData());

        }, (err) => {
            console.log('timers route error: ', err);
            next();
        });
    });

    // catch all for /...
    router.get(/(?:$|\/(.*))/i, (req, res, next) => {
        RouterFront.match(req.params[0], req.query, (matched) => {
            var frontController = new FrontController({
                user: req.user,
                grouped: res.locals.grouped,
                timer: new Timer()
            });
            var navController = new NavController({
                user: req.user,
                grouped: res.locals.grouped,
                current: 'front'
            });
            var appController = new AppController({
                user: req.user,
                grouped: res.locals.grouped
            });

            appController.addExtraData({
                view: frontController.getViewData(),
                nav: navController.getViewData()
            });

            res.render("app", appController.getViewData());

        }, (err) => {
            console.log('front route error: ', err);
            next();
        });
    });

    router.post('/timer/update/:id', function (req, res, next) {
        var frontController = new FrontController({
            user: req.user,
            grouped: res.locals.grouped,
        });

        frontController.updateTimer(
            req.params.id, {
                description: req.body.description,
                jobID: req.body.jobid,
                start: req.body.start,
                stop: req.body.stop,
            }, req.body['tags[]']
        ).then(timer => {
            res.redirect('/timers/' + timer.getID());
        }).then(null, next);
    });

    router.post('/timer/delete/:id', function (req, res, next) {
        var frontController = new FrontController({
            user: req.user,
            grouped: res.locals.grouped,
        });

        frontController.deleteTimer(req.params.id).then(() => {
            res.redirect('/timers');
        }).then(null, next);
    });

    return router;
})();
