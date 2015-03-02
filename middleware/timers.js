'use strict';

var Group = require('../lib/models/group');

module.exports = function exposeTimers() {

  return function (req, res, next) {

    Group.fromDB().then((grouped) => {
        res.locals.jobs = grouped.getJobInfo();
        res.locals.timers = grouped.getTimerInfo();
        res.expose(grouped.getJobs(), 'Data.jobs');
        res.expose(grouped.getTimers(), 'Data.timers');

        next();
    })
    .then(null, next);

  };
};
