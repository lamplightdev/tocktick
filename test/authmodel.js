require("babel/register");

var assert = require("assert");

var AuthModel = require('../lib/models/authmodel');

var db = require('../lib/redis-db');
db.select(10);  //our test db

/*global describe, it, before, beforeEach, after, afterEach */


describe('Base Auth Model', function () {

  var m;
  var members = {
    name: 'test',
  };
  var storageKey = 'user:' + 'fakeuserid' + ':' + 'authmodels';

  beforeEach(function () {
    db.flushdb();

    m = new AuthModel(members, 'fakeid', 'fakeuserid');

  });

  it("can create a model with user id", function () {

    assert.equal(m.getMembers(), members);
    assert.equal(m.getID(), 'fakeid');
    assert.equal(m.getUserID(), 'fakeuserid');

  });

  it("can save a new model", function (done) {

    m.save().then(function (model) {
      assert.equal(model.getID(), 'fakeid');
      assert.equal(model.getUserID(), 'fakeuserid');

      return db.sismember(
        storageKey,
        m.getID()
      );
    }).then(function (isMember) {
      assert.equal(isMember, true);

      return db.smembers(
        storageKey
      );
    }).then(function (values) {
      assert.equal(values.length, 1);

      return AuthModel.find(m.getID());
    }).then(function (model) {
      assert.deepEqual(m, model);

      done();
    }).then(null, done);

  });

  it("should throw an error if saved with no user id", function () {

    var m2 = new AuthModel();
    assert.throws(m2.save, Error);

  });

  it("can update an existing model", function (done) {

    m.setMember('name', 'updatedname');
    m.save().then(function (model) {
      assert.equal(model.getMember('name'), 'updatedname');

      return AuthModel.find(model.getID());
    }).then(function (model) {
      assert.equal(model.getMember('name'), 'updatedname');
      assert.equal(model.getID(), 'fakeid');
      assert.equal(model.getUserID(), 'fakeuserid');

      return db.smembers(
        storageKey
      );
    }).then(function (values) {
      assert.equal(values.length, 1);

      done();
    });

  });

  it("should throw an error if updating a model with a different user id", function () {

    m.setUserID('newuserid');
    assert.throws(m.save, Error);

  });

  it("can remove a model", function (done) {

    m.remove().then(function () {
      return AuthModel.find('fakeid');
    }).then(function (model) {
      assert.equal(model, false);

      return db.sismember(
        storageKey,
        'fakeid'
      );
    }).then(function (isMember) {
      assert.equal(isMember, false);

      return db.smembers(
        storageKey
      );
    }).then(function (values) {
      assert.equal(values.length, 0);

      done();
    }).then(null, done);

  });

});
