'use strict';

var View = require("./view");


class OverlayView extends View {

  render(data, preRendered) {
    super.render(data, preRendered);

    this._overlay = this._container.querySelector('.overlay');

    this._overlay.addEventListener('click', event => {
      if (event.target.classList.contains('overlay__close') ||
          event.target.parentNode.classList.contains('overlay__close') ) {
          this.close();
      }
    });

    this.open();
  }

  open() {
    this._overlay.classList.add('overlay--show');
  }

  close() {
    this._overlay.classList.remove('overlay--show');
  }
}

module.exports = OverlayView;
