require("babel/register");

var assert = require("assert");
var rewire = require('rewire');

var Job = require('../lib/models/job');
var Timer = rewire('../lib/models/timer');

Timer.__set__("Timer.getCurrentTime", function() {
  return 1000;
});


var db = require('../lib/redis-db');
db.select(10);  //our test db

/*global describe, it, before, beforeEach, after, afterEach */

describe('Timer Model', function () {

  var t, j;

  beforeEach(function (done) {
    db.flushdb();

    j = new Job({
      name: 'fixsite'
    });

    t = new Timer({
      description: 'readdocs'
    });

    Promise.all([j.save(), t.save()]).then(function () {
      done();
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
    t.stop();
    assert(t.getStopTime() === 1000);
  });

  it('can stop a timer at specific time', function () {
    t.stop('200');
    assert(t.getStopTime() === 200);
  });

  it('can see if a timer is started', function () {
    assert(!t.isStarted());
    t.start();
    assert(t.isStarted());
  });

  it('can see if a timer is stopped', function () {
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

  it('can get Timer description', function () {
    assert.equal(t.getDescription(), 'readdocs');
  });

  it('can get Time duration', function () {
    assert.equal(t.getDuration(), 0);
    t.start(100);
    assert(t.getDuration() > 100);
    t.stop(500);
    assert.equal(t.getDuration(), 400);
  });

  it('can adjust duration based on start time', function () {

    t.start(100);
    t.stop(500);
    assert.equal(t.getDuration(), 400);

    t.adjustDurationFromStart(300);
    assert.equal(t.getStopTime(), 400);

    t.unstop();
    t.adjustDurationFromStart(300);
    assert.equal(t.getStartTime(), 700);
  });


  it('can adjust duration based on stop time', function () {
    t.start(100);
    t.stop(500);
    assert.equal(t.getDuration(), 400);

    t.adjustDurationFromStop(100);
    assert.equal(t.getStartTime(), 400);
  });

  it('can save with a parent Job', function (done) {
    t.save(j.getID())
      .then(function () {
        return t.getJob();
      }).then(function(job) {
        assert.equal(job.getID(), j.getID());
        done();
      });
  });

  it('remove a timer from Job', function (done) {
    t.save(j.getID())
      .then(function () {
        return j.loadTimers();
      }).then(function (timers) {
        assert.equal(timers.length, 1);
        return t.save(null);
      }).then(function() {
        return t.getJob();
      }).then(function(job) {
        assert(!job);
        return j.loadTimers();
      }).then(function (timers) {
        assert.equal(timers.length, 0);
        done();
      });
  });

  it("removes itself from job's timer list when removed", function (done) {
    t.save(j.getID())
      .then(function () {
        return j.loadTimers();
      }).then(function (timers) {
        assert.equal(timers.length, 1);
        return t.remove();
      }).then(() => {
        return j.loadTimers();
      }).then(function (timers) {
        assert.equal(timers.length, 0);
        done();
      }).then(null, done);
  });

  it('can save with a parent User');
});
