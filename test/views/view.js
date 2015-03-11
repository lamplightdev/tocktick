require("babel/register");

var View = require('../../lib/views/view');

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

});
