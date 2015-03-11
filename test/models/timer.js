require("babel/register");

var assert = require("assert");
var rewire = require('rewire');
var exec = require('child_process').exec;

var Job = require('../../lib/models/job');
var Timer = rewire('../../lib/models/timer');
var User = require('../../lib/models/user');

Timer.__set__("Timer.getCurrentTime", function() {
  return 1000;
});


var db = require('../../lib/redis-db');
db.select(10);  //our test db

/*global describe, it, before, beforeEach, after, afterEach */

describe('Timer Model', function () {

  var t, j, u;

  beforeEach(function (done) {
    db.flushdb();

    exec('cat test/redis-fixture-db10.txt | redis-cli', function() {

      j = new Job({
        name: 'fixsite'
      });

      t = new Timer({
        description: 'readdocs'
      });

      User.findByProvider('google', '102963707462051819067').then(function (user) {
        u = user;
      }).then(function () {
        return j.save(u.getID());
      }).then(function () {
        return t.save(u.getID(), j.getID());
      }).then(function () {
        done();
      }, done);

    });
  });

  it('can start a timer', function () {
    t.start();
    assert(t.getStartTime() === 1000);
  });

  it('can start a timer at specific time', function () {
    t.start('100');
    assert(t.getStartTime() === 100);
  });

  it('can stop a timer', function () {
    t.start(0);
    t.stop();
    assert(t.getStopTime() === 1000);
  });

  it('can stop a timer at specific time', function () {
    t.start(0);
    t.stop('200');
    assert(t.getStopTime() === 200);
  });

  it('can see if a timer is started', function () {
    assert(!t.isStarted());
    t.start();
    assert(t.isStarted());
  });

  it('can see if a timer is stopped', function () {
    t.start();
    assert(!t.isStopped());
    t.stop();
    assert(t.isStopped());
  });

  it('can see if a timer is running', function () {
    assert(!t.isRunning());
    t.start();
    assert(t.isRunning());
    t.stop();
    assert(!t.isRunning());
  });

  it('can unstop a timer', function () {

    t.start(100);
    t.stop(900);
    assert(t.isStopped());
    t.unstop();
    assert(t.isRunning());
  });

  it('can restart a timer', function () {
    t.start(100);
    t.stop(1500);
    assert.equal(t.getDuration(), 1400);
    t.restart();
    assert.equal(t.getDuration(), 500);
  });

  it('can get Timer description', function () {
    assert.equal(t.getDescription(), 'readdocs');
  });

  it('can get Time duration', function () {
    assert.equal(t.getDuration(), 0);
    t.start(100);
    assert.equal(t.getDuration(), 900);
    t.stop(500);
    assert.equal(t.getDuration(), 400);
  });

  it('can adjust duration based on start time', function () {

    t.start(100);
    t.stop(500);
    assert.equal(t.getDuration(), 400);

    t.adjustDurationFromStart(300);
    assert.equal(t.getStopTime(), 400);
  });


  it('can adjust duration based on stop time', function () {
    t.start(100);
    t.stop(500);
    assert.equal(t.getDuration(), 400);

    t.adjustDurationFromStop(100);
    assert.equal(t.getStartTime(), 400);
  });

  it('can get a formatted time', function () {
    t.start(0);
    t.stop(55783069357);
    assert.equal(t.getFormattedDuration(), '1 year 9 months 1 week 10 days 15 hours 17 minutes 48 seconds');
    assert.equal(t.getFormattedDuration(true), '1y 9m 1w 10d 15h 17m 48s');
  });

  it('can save with a parent Job', function (done) {
    t.save(u.getID(), j.getID())
      .then(function () {
        return t.getJob();
      }).then(function(job) {
        assert.equal(job.getID(), j.getID());
        done();
      });
  });

  it('can only save a timer once to a job');

  it('remove a timer from Job', function (done) {
    t.save(u.getID(), j.getID())
      .then(function () {
        return j.findTimers();
      }).then(function (timers) {
        assert.equal(timers.length, 1);
        return t.save(u.getID(), false);
      }).then(function() {
        return t.getJob();
      }).then(function(job) {
        assert(!job);
        return j.findTimers();
      }).then(function (timers) {
        assert.equal(timers.length, 0);
        done();
      });
  });

  it("removes itself from job's timer list when removed", function (done) {
    t.save(u.getID(), j.getID())
      .then(function () {
        return j.findTimers();
      }).then(function (timers) {
        assert.equal(timers.length, 1);
        return t.remove();
      }).then(() => {
        return j.findTimers();
      }).then(function (timers) {
        assert.equal(timers.length, 0);
        done();
      }).then(null, done);
  });

  it("can get the most recent timer", function (done) {
    Timer.getMostRecent(u.getID()).then(function (timer) {
      assert.equal(timer.getID(), t.getID());
      done();
    });
  });

  it('can save with a parent User');
});
