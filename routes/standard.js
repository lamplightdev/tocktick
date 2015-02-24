var RouterSharedAccount = require('../lib/routers/shared-account');
var RouterSharedFront = require('../lib/routers/shared-front');


module.exports = (function() {
    'use strict';
    var router = require('express').Router();

    // catch all for /account/...
    router.get(/account(?:$|\/(.*))/i, (req, res, next) => {
        var sharedRouter = new RouterSharedAccount({
            user: req.user,
        });

        sharedRouter.match(req.params[0], req.query, (routeParts, queryString) => {

            if (routeParts[0] === 'placeholder') {
                res.redirect('/auth/signin/google/import');
            } else {
                res.render("view-account", sharedRouter.getController()._getViewData());
            }
        }, (err) => {
            console.log('account route error: ', err);
            next();
        });
    });

    // catch all for /...
    router.get(/(?:$|\/(.*))/i, (req, res, next) => {
        var sharedRouter = new RouterSharedFront({
            user: req.user,
            timers: res.locals.timers
        });

        sharedRouter.match(req.params[0], req.query, (routeParts, queryString) => {

            if (routeParts[0] === 'placeholder') {
            } else {
                res.render("view-front", sharedRouter.getController()._getViewData());
            }
        }, (err) => {
            console.log('front route error: ', err);
            next();
        });
    });

    return router;
})();
