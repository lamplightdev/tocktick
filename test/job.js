require("babel/register");

var assert = require("assert");

var Job = require('../lib/models/job');
var Timer = require('../lib/models/timer');

var db = require('../lib/redis-db');
db.select(10);  //our test db

/*global describe, it, before, beforeEach, after, afterEach */

describe('Job Model', function () {

  var ts, j;

  beforeEach(function (done) {
    db.flushdb();

    j = new Job({
      name: 'fixsite'
    });

    ts = [];

    for (var i=0; i<10; i++) {
      ts.push(new Timer({
        description: 'readdocs-' + i
      }));
    }

    j.save()
      .then(function () {
        var promises = [];
        ts.forEach(function (t) {
          promises.push(t.save(j.getID()));
        });

        return Promise.all(promises);
      })
      .then(function () {
        done();
      }).then(null, done);

  });

  it("can load a job's Timers", function (done) {

    j.loadTimers().then(function (timers) {
      assert.equal(timers.length, 10);
      done();
    }).then(null, done);

  });

  it('can get Job name');
  it('can update Job name');

  it('can get number of related Timers');
  it('can get number of active Timers');
  it('can get number of inactive Timers');

  it('can return an existing Timer');
  it('can add a new Timer');
  it('can remove an existing Timer');

  it('can set parent User by id');
  it('can get parent User id');
  it('can get parent User');

  it('can get other associated User ids');
  it('can get other associated Users');
});
