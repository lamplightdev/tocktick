'use strict';

var View = require("./view");


class ViewFront extends View {
  constructor(container, templates, callbacks) {

    super(container, {
      'all': {
        name: 'front',
        template: templates.front,
        postRender: data => {
          this.enableJSVersion();
          this.initStartTimer();
          this.initTimerJobEdit();
          this.initTimerTagsEdit(data);
          this.initTouchTest();
        },
      },
    }, callbacks);
  }

  initStartTimer() {
    console.log('initStartTimer front');

    this.registerContainerEventListener('submit', (event) => {
      if (event.target.classList.contains('front-form-start')) {
        event.preventDefault();

        const form = event.target;
        const vars = this.serializeForm(form.elements);

        let timer = this._callbacks.onTimerStartSubmit({
          description: vars.description,
          jobID: vars.jobid,
        }, vars['tags[]']);

        form.elements.actiontime.value = timer.getStartTime();
        form.dataset.apiAction += '/' + timer.getID();

        this.submitForm(form).then((timerData) => {
          this._callbacks.onTimerStartResponse(timerData);
        });
      }
    });
  }

  initTimerJobEdit() {
    console.log('initTimerJob front');

    this.registerContainerEventListener('click', (event) => {
      if (event.target.classList.contains('selectme')) {
        event.preventDefault();

        const button = event.target;

        if (this._callbacks.onTimerJobClick) {
          this._callbacks.onTimerJobClick(button.dataset.timerId, this._container.querySelector('.front-timer-job'));
        }
      }
    });
  }

  initTimerTagsEdit(data) {
    console.log('initTimerTagsEdit front');

    this.registerContainerEventListener('click', event => {
      if (event.target.classList.contains('edittags')) {
        event.preventDefault();

        const timerID = event.target.dataset.timerId;
        if (this._callbacks.onTimerTagsClick) {
          this._callbacks.onTimerTagsClick(timerID, this._container.querySelector('.front-timer-tags'));
        }
      }
    });
  }

  initTouchTest() {

        var input = {touchStartAngle:0};
        var plateContainer, touchValue = 0, touchValueText;
        var prefixedTransform;
        var currentRotation = 0;
        var posX = 0;
        var posY = 0;
        var containerWidth;
        var containerHeight;
        var lastAngleChange = 0;
        var rotations = 0;

        plateContainer = document.querySelector('.touchtest');
        touchValueText = document.querySelector('.touchtest-start');
        containerHeight = plateContainer.offsetHeight;
        containerWidth = plateContainer.offsetWidth;

        if('transform' in document.body.style){
          prefixedTransform='transform';
        }else if('webkitTransform' in document.body.style){
          prefixedTransform='webkitTransform';
        }
        // listeners
        plateContainer.addEventListener('touchstart', onPlateMouseDown);
        plateContainer.addEventListener('mousedown', onPlateMouseDown);

        var rect = plateContainer.getBoundingClientRect();
        posX=rect.left + containerWidth/2;
        posY=rect.top + containerHeight/2;

        touchValueText.textContent = 'waiting...';

        onAnimationFrame();

        function onAnimationFrame() {

          requestAnimationFrame(onAnimationFrame);
          plateContainer.style[prefixedTransform]= 'rotate('+currentRotation+'deg) translateZ(0)';
        }

        function onPlateMouseDown(event) {
          event.preventDefault();

          document.addEventListener('mouseup', onDocumentMouseUp);
          document.addEventListener('mousemove', onDocumentMouseMove);
          document.addEventListener('touchmove', onDocumentMouseMove);
          document.addEventListener('touchend', onDocumentMouseUp);
          document.addEventListener('touchcancel', onDocumentMouseUp);

          handleGestureStart(
            posX,
            posY,
            event.touches ? event.touches[0].clientX : event.clientX,
            event.touches ? event.touches[0].clientY : event.clientY
          );
        }

        function onDocumentMouseMove(event) {
          handleGesture(
            posX,
            posY,
            event.touches ? event.touches[0].clientX : event.clientX,
            event.touches ? event.touches[0].clientY : event.clientY
          );
        }

        function onDocumentMouseUp(event) {
          event.preventDefault();

          document.removeEventListener('mouseup', onDocumentMouseUp);
          document.removeEventListener('mousemove', onDocumentMouseMove);
          document.removeEventListener('touchmove', onDocumentMouseMove);
          document.removeEventListener('touchend', onDocumentMouseUp);
          document.removeEventListener('touchcancel', onDocumentMouseUp);

          handleGestureStop();
        }

        function handleGestureStart(x1, y1, x2, y2){
          rotations = 0;
          lastAngleChange = 0;

          var dx = x2 - x1;
          var dy = y2 - y1;
          input.touchStartAngle = Math.atan2(dy,dx);
          input.startAngle = currentRotation;
        }

        function handleGesture(x1, y1, x2, y2){
          var dx = x2 - x1;
          var dy = y2 - y1;
          var touchAngle=Math.atan2(dy,dx);
          var angleChange = touchAngle - input.touchStartAngle;
          currentRotation=input.startAngle+(angleChange*180/Math.PI);

          if (lastAngleChange >= 0 && angleChange < 0 && lastAngleChange < 0.5) {
            rotations--;
          } else if (lastAngleChange < 0 && angleChange > 0 && angleChange < 0.5) {
            rotations++;
          }
          lastAngleChange = angleChange;

          var val = angleChange;
          if (val < 0) {
            val = 2*Math.PI + angleChange;
          }

          let decimal = rotations + val/(2*Math.PI);
          let hours = decimal | 0;
          let minutes = ((decimal - hours) * 60) | 0;

          touchValueText.textContent = hours + 'h ' + minutes + 'm';
        }

        function handleGestureStop(){
        }
  }

}

module.exports = ViewFront;
