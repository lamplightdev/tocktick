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

let overlay = document.querySelector('.overlay');
let overlayContent = overlay.querySelector('.overlay__content__body');

function overlayClose() {
  overlay.classList.remove('overlay--show');
}

overlay.addEventListener('click', event => {
  if (event.target.classList.contains('overlay__close')) {
      overlayClose();
  }
});

function chooseSelectMe(select, value) {
  select.value = value;
  overlayClose();
}

function openSelectMe(connect) {
  let select = document.querySelector('[name=' + connect + ']');
  let numOptions = select.options.length;

  let optionText = '';

  optionText += `<div class='selectmebox'></div>`;
  for(let i=0; i<numOptions; i++) {
    optionText += `
      <button class='selectmebox__option' data-value='${select.options[i].value}'>${select.options[i].text}</button>
    `;
  }
  optionText += `</div>`;

  overlayContent.innerHTML = optionText;

  let options = overlayContent.querySelectorAll('.selectmebox__option');
  for (let i=0; i<options.length; i++) {
    options[i].addEventListener('click', event => {
      chooseSelectMe(select, event.target.dataset.value);
    });
  }


  overlay.classList.add('overlay--show');
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
    openSelectMe(event.target.dataset.connect);
  }
});

