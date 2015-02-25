require("babel/register");

var assert = require("assert");

var Model = require('../lib/models/model');

var db = require('../lib/redis-db');
db.select(10);  //our test db

/*global describe, it, before, beforeEach, after, afterEach */

describe('Base Model', function () {

  describe('save', function () {
    var m;

    beforeEach(function (done) {
      db.flushdb();

      m = new Model({
        name: 'test',
        title: 'titletest'
      });

      m.save().then(function () {
        done();
      });
    });

    it('creates id and save models to db', function (done) {

      Model.find(m.getID()).then(function (m2) {
        assert.equal(m.getID(), m2.getID());
        assert.deepEqual(m.getMembers(), m2.getMembers());
        done();
      });

    });

    it('can update a model', function (done) {

      m.setMember('name', 'newname');
      m.save().then(function () {
        Model.find(m.getID()).then(function (m2) {
          assert.equal(m2.getMember('name'), 'newname');
          done();
        });
      });

    });

    it('can find an existing model id', function (done) {

      Model.exists(m.getID()).then(function (exists) {
        assert(exists);
        done();
      });

    });

    it('can\'t find a non-existent model id', function (done) {

      Model.exists('blah').then(function (exists) {
        assert(!exists);
        done();
      });

    });

    it('can find and return model by existing id', function (done) {

      Model.find(m.getID()).then(function (m2) {
        assert.deepEqual(m.getMembers(), m2.getMembers());
        done();
      });

    });

    it('can\'t find and return model by non-existent id', function (done) {

      Model.find('blah').then(function (m2) {
        assert.equal(m2, false);
        done();
      });

    });

    it('can remove a model', function (done) {

      m.remove().then(function () {
        Model.exists(m.getID()).then(function (exists) {
          assert(!exists);
          done();
        });
      });

    });

  });

});
