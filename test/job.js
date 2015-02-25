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


  it('can get running Timers', function (done) {
    ts[0].start(0).stop(100).save();
    ts[1].start(0).stop(100).save();
    ts[2].start(0).save();
    ts[3].start(0).save();
    ts[4].start(0).save();
    ts[5].start(0).save();

    j.loadRunningTimers()
      .then(function(timers) {
        assert.equal(timers.length, 4);
        done();
      });
  });

  it('can get stopped Timers', function (done) {
    ts[0].start(0).stop(100).save();
    ts[1].start(0).stop(100).save();
    ts[2].start(0).save();
    ts[3].start(0).save();
    ts[4].start(0).save();
    ts[5].start(0).save();

    j.loadStoppedTimers()
      .then(function(timers) {
        assert.equal(timers.length, 2);
        done();
      });
  });


  it('can save with a parent User');

  it('can get other associated Users');
});
