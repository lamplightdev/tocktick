"use strict";

require("babel/polyfill");

var RouterMain = require("../../lib/router-main");

var Handlebars = require("../../node_modules/handlebars/dist/handlebars.runtime");
var helpers = require("../../lib/helpers");
var urlparse = require('url').parse;


for (let key in App.templates) {
  if(App.templates.hasOwnProperty(key)) {
    Handlebars.registerPartial(key, Handlebars.template(App.templates[key]));
  }
}

for (let helper in helpers) {
  Handlebars.registerHelper(helper, helpers[helper]);
}

var router = new RouterMain(Object.assign(
  App.Data,
  {
    templates: App.templates,
    container: document.getElementById('view')
  }));

if (!App.Data.status404) {
  router.router.check(true);
}

document.body.addEventListener('click', (event) => {
  if (typeof event.target.dataset.nav !== 'undefined') {
    event.preventDefault();
    event.stopPropagation();
    router.router.navigate(urlparse(event.target.href).pathname);
  } else if (typeof event.target.parentNode.dataset.nav !== 'undefined') {
    event.preventDefault();
    event.stopPropagation();
    router.router.navigate(urlparse(event.target.parentNode.href).pathname);
  } else if (event.target.classList.contains('overlay')) {
    console.log('overlay click');
    router.router.navigate('/contacts');
  }
});

