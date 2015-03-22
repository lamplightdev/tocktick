'use strict';

var OverlayView = require("./overlay-view");

class ViewTimerJob extends OverlayView {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'timer-job',
        template: templates['timer-job'],
        postRender: (data) => {
          this.initJobSelect();
        },
      },
    }, callbacks);
  }

  initJobSelect() {
    const items = this._container.querySelectorAll('.selectmebox__inner__option');

    for(let i=0; i<items.length; i++) {
      items[i].addEventListener('click', () => {
        if (this._callbacks.onJobSelected) {
          this._callbacks.onJobSelected(items[i].dataset.value);
        }
        this.close();
      });
    }
  }

}

module.exports = ViewTimerJob;
