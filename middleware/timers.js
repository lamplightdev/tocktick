'use strict';

var Group = require('../lib/models/group');

module.exports = function exposeTimers() {

  return function (req, res, next) {

    if (req.user) {
      Group.fromDB(req.user._id).then((grouped) => {
          res.locals.grouped = grouped;
          //res.expose(grouped.getJobs(), 'Data.jobs');
          //res.expose(grouped.getTimers(), 'Data.timers');

          next();
      }, next)
      .then(null, next);
    } else {
      res.locals.grouped = new Group();
      next();
    }

  };
};
