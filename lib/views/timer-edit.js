'use strict';

var OverlayView = require("./overlay-view");

class ViewTimerEdit extends OverlayView {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'timer-edit',
        template: templates['timer-edit'],
        postRender: (data) => {
        },
      },
    }, callbacks);
  }

}

module.exports = ViewTimerEdit;
