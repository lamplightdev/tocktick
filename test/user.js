require("babel/register");

var assert = require("assert");

var User = require('../lib/models/user');

var db = require('../lib/redis-db');
db.select(10);  //our test db

/*global describe, it, before, beforeEach, after, afterEach */


describe('User Model', function () {

  beforeEach(function () {

    db.flushdb();

  });

  it("should throw an error if no provider info given", function () {

      var u = new User();
      assert.throws(u.save, Error);

  });

  describe("can create a user and provider info, then find it (or not)", function () {

    var u;

    before(function () {
      u = new User({
        name: 'test',
        provider: 'authprovider',
        providerID: 'authproviderID',
      });
    });

    it("can create user", function (done) {
      u.save().then(function () {
        return db.hget(User.getProviderKey('authprovider'), 'authproviderID');
      }).then(function (id) {
        assert.equal(id, u.getID());

        done();
      });
    });

    it("can find the user by provider info", function (done) {
      User.findByProvider('authprovider', 'authproviderID').then(function (user) {
        assert.equal(u.getID(), user.getID());

        done();
      });
    });

    it("can't find it with non-existent provider info", function (done) {
      User.findByProvider('authproviderother', 'authproviderIDother').then(function (user) {
        assert.equal(user, false);

        done();
      });
    });

  });


  it("can find or create a model with supplied provider information");

});
