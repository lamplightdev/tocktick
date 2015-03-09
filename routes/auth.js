module.exports = (function() {
  'use strict';
  var router = require('express').Router();
  var passport = require('passport');


  router.get('/google', function(req, res, next) {
    passport.authenticate('google', {
      scope: [
        'openid email',
        'openid profile',
      ],
      //loginHint: req.user ? req.user.getEmail() : null
    })(req, res, next);
  });

  router.get('/callback/google', function(req, res, next) {
    passport.authenticate('google', function(err, user) {
      if (err) { return next(err); }
      if (!user) { return res.redirect('/account'); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/account');
      });
    })(req, res, next);
  });


  router.get('/signout', function (req, res) {
    req.logOut();
    res.redirect('/account');
  });


  return router;
})();
