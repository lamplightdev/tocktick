'use strict';

var OverlayView = require("./overlay-view");

class ViewTimerTags extends OverlayView {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'timer-tags',
        template: templates['timer-tags'],
        postRender: (data) => {
          this.initTagSelect();
          this.initDone();
        },
      },
    }, callbacks);
  }

  initTagSelect() {
    const tags = this._container.querySelectorAll('.timer-tags__tag');

    for(let i=0; i<tags.length; i++) {
      tags[i].addEventListener('click', () => {
        tags[i].classList.toggle('timer-tags__tag--selected');
      });
    }
  }

  initDone() {
    const done = this._container.querySelector('.timer-tags-done');

    done.addEventListener('click', () => {
      const tags = this._container.querySelectorAll('.timer-tags__tag--selected');
      const tagIDs = [];
      for (let i=0; i<tags.length; i++) {
        tagIDs.push(tags[i].dataset.value);
      }

      this._callbacks.onDone(tagIDs);

      this.close();
    });
  }

}

module.exports = ViewTimerTags;
