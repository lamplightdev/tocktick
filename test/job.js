require("babel/register");

var assert = require("assert");
var exec = require('child_process').exec;

var Job = require('../lib/models/job');
var Timer = require('../lib/models/timer');

var db = require('../lib/redis-db');
db.select(10);  //our test db

/*global describe, it, before, beforeEach, after, afterEach */

describe('Job Model', function () {

  var ts, j;

  beforeEach(function (done) {
    db.flushdb();

    exec('cat test/redis-fixture.txt | redis-cli', function(err, data) {
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

  });

  it("can find a job's Timers", function (done) {

    j.findTimers().then(function (timers) {
      assert.equal(timers.length, 10);
      done();
    }).then(null, done);

  });


  it('can find running Timers', function (done) {
    ts[0].start(0).stop(100).save();
    ts[1].start(0).stop(100).save();
    ts[2].start(0).save();
    ts[3].start(0).save();
    ts[4].start(0).save();
    ts[5].start(0).save();

    j.findRunningTimers()
      .then(function(timers) {
        assert.equal(timers.length, 4);
        done();
      });
  });

  it('can find stopped Timers', function (done) {
    ts[0].start(0).stop(100).save();
    ts[1].start(0).stop(100).save();
    ts[2].start(0).save();
    ts[3].start(0).save();
    ts[4].start(0).save();
    ts[5].start(0).save();

    j.findStoppedTimers()
      .then(function(timers) {
        assert.equal(timers.length, 2);
        done();
      });
  });

  it('can remove a job with associated timers', function (done) {
    j.findTimers()
      .then(function (timers) {
        assert.equal(timers.length, 10);
      })
      .then(function () {
        return j.remove();
      })
      .then(function () {
        return j.findTimers();
      })
      .then(function (timers) {
        assert.equal(timers.length, 0);
        done();
      });
  });

  it('can add a timer id', function () {
    assert.equal(j.getTimerIDs().length, 0);
    j.addTimerID(ts[0].getID());
    assert.equal(j.getTimerIDs().length, 1);
  });

  it('can add set timer ids', function () {
    assert.equal(j.getTimerIDs().length, 0);
    j.setTimerIDs(ts.map(function (t) {
      return t.getID();
    }));
    assert.equal(j.getTimerIDs().length, 10);
  });

  it('can save with a parent User');

  it('can get other associated Users');
});
