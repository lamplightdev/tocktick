"use strict";

var RouterMain = require("../../lib/router-main");

var Handlebars = require("../../node_modules/handlebars/dist/handlebars.runtime");
var helpers = require("../../lib/helpers");
var urlparse = require('url').parse;

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

var router = new RouterMain(
  App.Data.user,
  App.templates
);
router.init().then(() => {
  if (!App.Data.status404) {
    router.router.check(true);
  }
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


let overlay = document.querySelector('.overlay');
let overlayContent = overlay.querySelector('.overlay__content__body');
let overlayTitle = overlay.querySelector('.overlay__title');


function overlayOpen(title) {
  overlayTitle.textContent = title;
  overlay.classList.add('overlay--show');
}

function overlayClose() {
  overlay.classList.remove('overlay--show');
}

overlay.addEventListener('click', event => {
  if (event.target.classList.contains('overlay__close') ||
      event.target.parentNode.classList.contains('overlay__close') ) {
      overlayClose();
  }
});

function chooseSelectMe(el, select, value, text) {
  el.textContent = text;
  select.value = value;
  overlayClose();
}

function openSelectMe(el) {
  let form = el.form;
  let connect = el.dataset.connect;
  let select = form.querySelector('select[name=' + connect + ']');
  let currentValue = select.value;
  let numOptions = select.options.length;

  let optionText = '';

  optionText += `<div class='selectmebox'><ul class='selectmebox__inner'>`;
  for(let i=0; i<numOptions; i++) {
    let selected = '';
    if (select.options[i].value === currentValue) {
      selected = 'selectmebox__inner__option--selected';
    }
    optionText += `
      <li class='selectmebox__inner__option ${selected} btn' data-value='${select.options[i].value}' data-name='${select.options[i].text}'>${select.options[i].text}</li>
    `;
  }
  optionText += `</ul></div>`;

  overlayContent.innerHTML = optionText;

  let options = overlayContent.querySelectorAll('.selectmebox__inner__option');
  for (let i=0; i<options.length; i++) {
    options[i].addEventListener('click', event => {
      chooseSelectMe(el, select, event.target.dataset.value, event.target.dataset.name);
    });
  }

  overlayOpen('Select job');
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
  } else if (event.target.classList.contains('selectme')) {
    openSelectMe(event.target);
  }
});
