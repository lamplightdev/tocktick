'use strict';


module.exports = function exposeTimers() {

  return function (req, res, next) {
    var db = res.locals.db;

    db.smembers('jobs:1:timers')
        .then( timerIDs => {
            var gets = [];

            timerIDs.forEach( timerID => {
                var promise = db.hgetall('timer:' + timerID)
                .then(timer => {
                    timer.id = timerID;
                    return timer;
                });

                return gets.push(promise);
            });

            return Promise.all(gets);
        }).then( timers => {
            let current = false;

            timers.forEach(timer => {
                if (timer.stop) {
                    timer.active = false;
                    timer.elapsed = (timer.stop - timer.start) / 1000 + 's';
                } else {
                    timer.active = true;
                    current = timer;
                }
            });

            res.locals.timers = {
                all: timers,
                current: current
            };
            res.expose(res.locals.timers, 'Data.timers');

            next();
        });
  };
};
