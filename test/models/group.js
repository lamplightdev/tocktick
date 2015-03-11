require("babel/register");

var assert = require("assert");
var exec = require('child_process').exec;

var Job = require('../../lib/models/job');
var Timer = require('../../lib/models/timer');
var Group = require('../../lib/models/group');
var User = require('../../lib/models/user');

var db = require('../../lib/redis-db');
db.select(10);  //our test db

/*global describe, it, before, beforeEach, after, afterEach */


describe('Group Model', function () {
  var g, u;

  beforeEach(function (done) {
    db.flushdb();

    exec('cat test/redis-fixture-db10.txt | redis-cli', function() {
      var userPromise = User.findByProvider('google', '102963707462051819067').then(function (user) {
        u = user;
        return u;
      }).then(function (user) {
        return Group.fromDB(user.getID()).then(function (group) {
          g = group;
        });
      });

      Promise.all([userPromise]).then(function () {
        done();
      }, done);
    });
  });

  it("can load jobs and timers from JSON", function () {
    var json = JSON.parse(JSON.stringify(g));

    g = Group.fromJSON(json._jobs.all, json._timers.all);

    assert.equal(Object.keys(g._jobs.all).length, 5);
    assert.equal(Object.keys(g._timers.all).length, 8);

    g._jobs.ids.forEach(function (jobID) {
      assert(g._jobs.all[jobID] instanceof Job);
    });
    g._timers.ids.forEach(function (timerID) {
      assert(g._timers.all[timerID] instanceof Timer);
    });
  });

  it("can load jobs and timers from DB", function () {
    assert.equal(Object.keys(g._jobs.all).length, 5);
    assert.equal(Object.keys(g._timers.all).length, 8);

    g._jobs.ids.forEach(function (jobID) {
      assert(g._jobs.all[jobID] instanceof Job);
    });
    g._timers.ids.forEach(function (timerID) {
      assert(g._timers.all[timerID] instanceof Timer);
    });
  });

  it("can get all timers in descending start timer order", function () {
    var ordered = g.getOrderedTimers();
    assert.equal(ordered.length, 8);

    var lastDate = 10000000000000000000000000000;
    ordered.forEach(function (timer) {
      assert(timer.getStartTime() < lastDate);
      lastDate = timer.getStartTime();
    });

    ordered = g.getOrderedTimers(4);
    assert.equal(ordered.length, 4);
  });

  it("can get all jobs in descending added time order", function () {
    var ordered = g.getOrderedJobs();
    assert.equal(ordered.length, 5);

    var lastDate = 10000000000000000000000000000;
    ordered.forEach(function (job) {
      assert(job.getDateAdded() < lastDate);
      lastDate = job.getDateAdded();
    });

    ordered = g.getOrderedJobs(2);
    assert.equal(ordered.length, 2);
  });

  it("can get all timers for a specific job in descending start timer order", function () {
    var jobID = 'QkUGVXgF';
    var timers = g.getOrderedJobTimers(jobID);
    assert.equal(timers.length, 3);

    timers.forEach(function (timer) {
      assert.equal(timer.getJobID(), jobID);
    });
  });

  it("can get all running timers", function () {
      var timers = g.getCurrentTimers();
      assert.equal(timers.length, 3);

      timers.forEach(function (timer) {
        assert(timer.isRunning());
      });

      timers = g.getCurrentTimers(2);
      assert.equal(timers.length, 2);
  });

  it("can check for an existing timer", function () {
    var timerID = 'X1-REQgK';

    assert.equal(g.timerExists(timerID), true);
    assert.equal(g.timerExists('blah'), false);
  });

  it("can find an existing timer", function () {
    var timerID = 'X1-REQgK';
    var timer = g.findTimer(timerID);

    assert(timer instanceof Timer);
    assert.equal(timer.getID(), timerID);

    timer = g.findTimer('blah');
    assert.equal(timer, false);
  });

  it("can check for an existing job", function () {
    var jobID = 'QkUGVXgF';

    assert.equal(g.jobExists(jobID), true);
    assert.equal(g.jobExists('blah'), false);
  });

  it("can find an existing job", function () {
    var jobID = 'QkUGVXgF';
    var job = g.findJob(jobID);

    assert(job instanceof Job);
    assert.equal(job.getID(), jobID);

    job = g.findJob('blah');
    assert.equal(job, false);
  });

  it("can add a timer", function () {
    assert.equal(Object.keys(g.getTimers()).length, 8);
    assert.equal(g.getTimerIDs().length, 8);

    var t = new Timer({
      jobID: 'QkUGVXgF'
    });

    g.addTimer(t);

    assert.equal(Object.keys(g.getTimers()).length, 9);
    assert.equal(g.getTimerIDs().length, 9);
    assert.equal(g.getTimers()[t.getID()], t);
    assert.equal(g.getTimerIDs()[0], t.getID());
  });

  it('can remove a timer');

  it("can add a job", function () {
    assert.equal(Object.keys(g.getJobs()).length, 5);
    assert.equal(g.getJobIDs().length, 5);

    var j = new Job({
      name: 'newjob'
    });

    g.addJob(j);

    assert.equal(Object.keys(g.getJobs()).length, 6);
    assert.equal(g.getJobIDs().length, 6);
    assert.equal(g.getJobs()[j.getID()], j);
    assert.equal(g.getJobIDs()[0], j.getID());
  });

  it('can remove a job');

  it("can start a new timer - with previous jobs and timers existing", function () {
    assert.equal(Object.keys(g.getJobs()).length, 5);
    assert.equal(Object.keys(g.getTimers()).length, 8);

    var recentTimer = g.getMostRecentTimer();
    var newTimer = g.startNewTimer({
      name: 'newtimer'
    });

    assert.equal(Object.keys(g.getJobs()).length, 5);
    assert.equal(Object.keys(g.getTimers()).length, 9);

    assert.equal(recentTimer.getJobID(), newTimer.getJobID());
    assert(newTimer.isRunning());
  });

  it("can start a new timer - with no previous jobs/timers existing", function () {
    db.flushdb();

    var group = new Group();
    var timer = group.startNewTimer({
      name: 'newtimer'
    });

    assert.equal(Object.keys(group.getJobs()).length, 1);
    assert.equal(Object.keys(group.getTimers()).length, 1);

    var job = group.findJob(group.getJobIDs()[0]);
    assert.equal(job.getName(), 'New Job');
    assert.equal(job.getTimerIDs()[0], timer.getID());
    assert.equal(timer.getJobID(), job.getID());
    assert(timer.isRunning());
  });

  it("can start a new timer - with no previous timers existing", function () {
    db.flushdb();

    var group = new Group();
    var job = new Job({
      name: 'Existing job'
    });
    group.addJob(job);

    var timer = group.startNewTimer({
      name: 'newtimer'
    });

    assert.equal(Object.keys(group.getJobs()).length, 1);
    assert.equal(Object.keys(group.getTimers()).length, 1);

    assert.equal(job.getName(), 'Existing job');
    assert.equal(job.getTimerIDs()[0], timer.getID());
    assert.equal(timer.getJobID(), job.getID());
    assert(timer.isRunning());
  });

  it("can stop a timer", function () {
    assert.equal(g.getNumCurrentTimers(), 3);

    var timer = g.getCurrentTimers(1)[0];
    assert(timer.isRunning());

    g.stopTimer(timer);
    assert.equal(g.getNumCurrentTimers(), 2);
    assert(timer.isStopped());
  });

});
