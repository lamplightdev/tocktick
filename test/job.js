require("babel/register");

var assert = require("assert");

var Job = require('../lib/models/job');

var db = require('../lib/redis-db');
db.select(10);  //our test db

/*global describe, it, before, beforeEach, after, afterEach */

describe('Job Model', function () {

  it('can get Job with related Timers');

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
