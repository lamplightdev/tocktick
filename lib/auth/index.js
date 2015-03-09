'use strict';

var passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,

    User = require('../models/user');


function serialization() {
  passport.serializeUser(function(user, done) {
    done(null, user.getID());
  });

  passport.deserializeUser(function(userID, done) {
    User.find(userID).then(user => {
      done(null, user);
    }, error => {
      done(error);
    });
  });
}

function Google() {
    try {
    passport.use(new GoogleStrategy({
        clientID: process.env.TOCKTICK_GOOGLE_ID,
        clientSecret: process.env.TOCKTICK_GOOGLE_SECRET,
        callbackURL: process.env.TOCKTICK_HOST_PROTOCOL +
         "://" +
         process.env.TOCKTICK_HOST_NAME +
         "/signin/callback/google",
      },
      function(accessToken, refreshToken, profile, done) {
        User.forProvider('google', profile.id, {
          name: profile.displayName,
          email: profile.emails[0].value,
          provider: profile.provider,
          providerID: profile.id
        })
          .then((user) => {
            done(null, user);
          }).then(null, (error) => {
            done(error);
          });
      }
    ));
  } catch (e) {
    console.log(e);
  }
}


module.exports.serialization = serialization;
module.exports.Google = Google;
