'use strict';

var Job = require('../lib/models/job');

module.exports = function exposeTimers() {

  return function (req, res, next) {
    let allJobs = [];

    Job.getAllForUser()
        .then(jobs => {
            allJobs = jobs;

            let promises = [];
            jobs.forEach(job => {
                promises.push(job.loadTimers());
            });

            return Promise.all(promises);
        })
        .then(jobTimers => {
            let allTimers= [];
            jobTimers.forEach(timers => {
                timers.forEach(timer => {
                    allTimers.push(timer);
                });
            });

            res.locals.timers = allTimers;
            res.expose(res.locals.timers, 'Data.timers');

            res.locals.jobs = allJobs;
            res.expose(res.locals.jobs, 'Data.jobs');

            next();
        })
        .then(null, next);
  };
};
