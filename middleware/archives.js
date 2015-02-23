'use strict';


module.exports = function exposeArchives() {

  return function (req, res, next) {
    var db = res.locals.db;

    db.smembers('jobs:1:items')
        .then( (itemIDs) => {
            var gets = [];

            itemIDs.forEach( itemID => {
                gets.push(db.hgetall('item:' + itemID));
            });

            return Promise.all(gets);
        }).then( items => {
            items.forEach(item => {
                item.elapsed = (item.stop - item.start) / 1000 + 's';
            });

            res.locals.archives = items;
            res.expose(items, 'Data.archives');

            next();
        });
  };
};
