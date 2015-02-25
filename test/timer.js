require("babel/register");

var assert = require("assert");

var Job = require('../lib/models/job');
var Timer = require('../lib/models/timer');

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
    assert(t.getStartTime() > 0);
  });

  it('can start a timer at specific time', function () {
    t.start('100');
    assert(t.getStartTime() === 100);
  });

  it('can stop a timer', function () {
    t.stop();
    assert(t.getStopTime() > 0);
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
  })

  it('can get Timer description', function () {
    assert.equal(t.getDescription(), 'readdocs');
  });

  it('can get Time duration', function () {
    assert.equal(t.getDuration(), 0);
    t.start(100);
    console.log(t.getDuration());
    assert(t.getDuration() > 100);
    t.stop(500);
    assert.equal(t.getDuration(), 400);
  });

  it('can adjust start time');
  it('can adjust stop time');
  it('can adjust duration based on start time');
  it('can adjust duration based on stop time');

  it('can set parent Job by id');
  it('can get parent Job id');
  it('can get parent Job');

  it('can set parent User by id');
  it('can get parent User id');
  it('can get parent User');
});
