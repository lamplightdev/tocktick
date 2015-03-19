"use strict";

var RouterMain = require("../../lib/router-main");

var Handlebars = require("../../node_modules/handlebars/dist/handlebars.runtime");
var helpers = require("../../lib/helpers");

var Offline = require('../../lib/offline');
var request = require('then-request');



/*
// Make sure we are accessing over https, if not redirect
if ((!location.port || location.port === "80") && location.protocol !== "https:" && location.host !== "localhost") {
  location.protocol = "https:";
}
*/

/*
// Register our ServiceWorker
if (navigator.serviceWorker) {
  navigator.serviceWorker.register("/worker.js", {
    scope: "/"
  }).then(function (reg) {
    console.log("SW register success", reg);
  }, function (err) {
    console.log("SW register fail", err);
  });
}
*/

for (let key in App.templates) {
  if(App.templates.hasOwnProperty(key)) {
    Handlebars.registerPartial(key, Handlebars.template(App.templates[key]));
  }
}

for (let helper in helpers) {
  Handlebars.registerHelper(helper, helpers[helper]);
}

window.router = new RouterMain(
  App.Data.user,
  App.templates
);

window.router.init().then(() => {
  if (!App.Data.status404) {
    window.router.router.check(true);
  }
}).then(null, err => {
  Promise.reject(new Error(err));
});


if (Offline.isOnline()) {
  let queue = localStorage.getItem('api-queue');
  if (queue) {
    queue = JSON.parse(queue);

    let promises = [];

    queue.forEach(q => {
      promises.push(request(q.method, q.action, {
            json: q.data,
            qs: q.qs
        }).then((res) => {
          if (res.statusCode !== 0) {
            return true;
          }
          return false;
        }, (err) => {
          return false;
        }));
    });

    Promise.all(promises).then(results => {
      let index = 0;
      results.forEach(result => {
        if (result) {
          queue.splice(index, 1);
        }
        index++;
      });
      localStorage.setItem('api-queue', JSON.stringify(queue));
    });
  }
}
