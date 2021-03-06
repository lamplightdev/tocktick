require("babel/register");

var rewire = require('rewire');

var View = rewire('../../lib/views/view');

var Handlebars = require("handlebars");

var assert = require("assert");
var sinon = require("sinon");
var jsdom = require("jsdom");

/*global describe, it, before, beforeEach, after, afterEach */


describe('Base View', function () {

  var container;
  var parts;
  var callbacks;

  var partHTML = '<div class="subpart">subparttemplate</div>';
  var allHTML = '<div class="all"><h1>alltemplate</h1>' + partHTML + '</div>';

  beforeEach(function (done) {
    jsdom.env('<div id="view"></div>', function (errors, window) {
      window.Element.prototype.__defineSetter__("outerHTML", function(html) {
        var parentNode = this.parentNode, el;
        var all = this.ownerDocument.createElement("div"); all.innerHTML = html;
        while (el = all.firstChild) parentNode.insertBefore(el, this);
        parentNode.removeChild(this);
      });

      container = window.document.getElementById('view');
      parts = {
        'all': {
          name: 'all',
          template: null,
          postRender: sinon.spy(),
        },
        'subpart': {
          name: 'subpart',
          template: null,
          postRender: sinon.spy(),
        },
      };
      eval('parts.all.template = ' + Handlebars.precompile(allHTML));
      eval('parts.subpart.template = ' + Handlebars.precompile(partHTML));

      callbacks = {
        onAction: sinon.spy()
      };

      done();
    });
  });


  it("should initialise on construction", function () {

    var v = new View(container, parts, callbacks);

    assert.equal(v.getContainer(), container);
    assert.equal(v.getParts(), parts);
    assert.equal(v.getCallbacks(), callbacks);

    assert.deepEqual(v.getDirty(), {
      all: true,
      subpart: true
    });

  });

  it("should render everything when all is dirty", function () {

    var v = new View(container, parts, callbacks);
    var data = {};

    v.render(data, false);

    assert(parts.all.postRender.calledWith(data));
    assert(!parts.subpart.postRender.called);
    assert.deepEqual(v.getDirty(), {
      all: false,
      subpart: false
    });
  });

  it("should only render parts that are dirty", function () {
    var v = new View(container, parts, callbacks);
    var data = {};

    v.render(data, false);
    v.setDirty('subpart');
    parts.subpart.postRender.reset();
    parts.all.postRender.reset();

    v.render(data, false);

    assert(parts.subpart.postRender.calledWith(data));
    assert(!parts.all.postRender.called);
    assert.deepEqual(v.getDirty(), {
      all: false,
      subpart: false
    });
  });

  it("should not generate HTML if pre-rendered", function () {
    var v = new View(container, parts, callbacks);
    var data = {};

    v.render(data, true);

    assert.equal(v.getContainer().innerHTML, '');
  });

  it("should generate HTML if pre-rendered", function () {
    var v = new View(container, parts, callbacks);
    var data = {};

    v.render(data, false);
    assert.equal(v.getContainer().innerHTML, allHTML);
  });


  describe("form submission", function () {
    var doc = jsdom.jsdom(
      '<form id="test-form" action="http://testaction" method="post">' +
      '<input type="text" name="name" value="testname">' +
      '<input type="hidden" name="id" value="testid">' +
      '<form>'
    ).defaultView.document;
    var form = doc.getElementById('test-form');
    form.dataset = {};  //jsdom doesn't support dataset

    var requestSpy = sinon.stub().returns(
      Promise.resolve({
        getBody: function () {
          return JSON.stringify({});
        }
      })
    );

    var localStorageFill = {
      vals: {},
      setItem: function (key, value) {
        this.vals[key] = value;
        return this;
      },
      getItem: function (key) {
        return this.vals[key];
      },
      clear: function () {
        this.vals = {};
      }
    };

    it("should submit a form over ajax with form method and action", function (done) {
      form.dataset = {};
      requestSpy.reset();

      View.__with__({
        request: requestSpy
      })(function () {

        var v = new View(container, parts, callbacks);

        v.submitForm(form).then(function () {
          assert(requestSpy.calledWith('post', 'http://testaction', {
            json: {
              name: 'testname',
              id: 'testid'
            },
            qs: {}
          }));
          done();
        }).then(null, done);

      });

    });

    it("should submit a form over ajax with api method and api action", function (done) {

      form.dataset = {
        apiMethod: 'put',
        apiAction: 'http://apiaction'
      };
      requestSpy.reset();

      View.__with__({
        request: requestSpy
      })(function () {

        var v = new View(container, parts, callbacks);

        v.submitForm(form).then(function () {
          assert(requestSpy.calledWith('put', 'http://apiaction', {
            json: {
              name: 'testname',
              id: 'testid'
            },
            qs: {}
          }));
          done();
        }).then(null, done);

      });

    });

    it("should submit a form over ajax with given method and action", function (done) {

      form.dataset = {
      };
      requestSpy.reset();

      View.__with__({
        request: requestSpy
      })(function () {

        var v = new View(container, parts, callbacks);

        v.submitForm(form, 'get', 'http://givenaction').then(function () {
          assert(requestSpy.calledWith('get', 'http://givenaction', {
            json: {},
            qs: {
              name: 'testname',
              id: 'testid'
            }
          }));
          done();
        }).then(null, done);

      });

    });

    it("should submit a form with query string with get method", function (done) {

      form.dataset = {
        apiMethod: 'get',
      };
      requestSpy.reset();

      View.__with__({
        request: requestSpy
      })(function () {

        var v = new View(container, parts, callbacks);

        v.submitForm(form).then(function () {
          assert(requestSpy.calledWith('get', 'http://testaction', {
            json: {},
            qs: {
              name: 'testname',
              id: 'testid'
            }
          }));
          done();
        }).then(null, done);

      });

    });

    it("should submit a form with json with anything but get method", function (done) {
      form.dataset = {};
      requestSpy.reset();

      View.__with__({
        request: requestSpy
      })(function () {

        var v = new View(container, parts, callbacks);

        v.submitForm(form).then(function () {
          assert(requestSpy.calledWith('post', 'http://testaction', {
            json: {
              name: 'testname',
              id: 'testid'
            },
            qs: {}
          }));
          done();
        }).then(null, done);

      });

    });

    it("should queue unfulfilled requests", function (done) {
      form.dataset = {
      };
      requestSpy.reset();

      requestSpy = sinon.stub().returns(
        Promise.resolve({
          statusCode: 200,
          getBody: function () {
            return JSON.stringify({});
          }
        })
      );


      View.__with__({
        request: requestSpy,
        localStorage: localStorageFill
      })(function () {

        var v = new View(container, parts, callbacks);
        localStorageFill.clear();

        assert(typeof localStorageFill.getItem('api-queue') === 'undefined');

        return v.submitForm(form).then(function () {
          assert(typeof localStorageFill.getItem('api-queue') === 'undefined');
          View.__set__('request', sinon.stub().returns(
            Promise.resolve({
              statusCode: 0,
              getBody: function () {
                return JSON.stringify({});
              }
            })
          ));
          return v.submitForm(form);
        }).then(function () {
          var q = JSON.parse(localStorageFill.getItem('api-queue'));
          assert.equal(q.length, 1);
          assert.deepEqual(q[0], {
            method: 'post',
            action: 'http://testaction',
            data: {
              name: 'testname',
              id: 'testid'
            },
            qs: {},
          });
          return v.submitForm(form);
        }).then(function () {
          assert.equal(JSON.parse(localStorageFill.getItem('api-queue')).length, 2);
        });


      }).then(function() {
        done();
      }).then(null, done);

    });

  });

});
