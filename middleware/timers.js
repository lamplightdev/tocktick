'use strict';


module.exports = function exposeTimers() {

  return function (req, res, next) {
    var db = res.locals.db;

    db.lrange('jobs:2:timers', 0, -1)
        .then( timerIDs => {
            console.log(timerIDs);
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
                    timer.elapsed = ((timer.stop - timer.start) / 1000).toFixed(0);
                } else {
                    timer.active = true;
                    current = timer;
                }
            });

            console.log(timers, current);

            res.locals.timers = {
                all: timers,
                current: current
            };
            res.expose(res.locals.timers, 'Data.timers');

            next();
        });
  };
};
