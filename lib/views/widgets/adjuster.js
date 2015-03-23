class Adjuster {
  constructor(container, initValue) {
    this._elements ={
      container: container,
      dial: null
    };

    this._posX = 0;
    this._posY = 0,
    this._startAngle = 0,
    this._touchStartAngle = 0,
    this._lastAngle = 0,
    this._rotations = 0,
    this._currentRotation = 0,
    this._initValue = initValue;
    this._newValue = initValue;

    this._prefixedTransform;
    if('transform' in document.body.style) {
      this._prefixedTransform = 'transform';
    } else if('webkitTransform' in document.body.style) {
      this._prefixedTransform = 'webkitTransform';
    }

    this.init();
  }

  init() {
    this._elements.dial = this._elements.container.querySelector('.timer-adjustment__dial');

    var rect = this._elements.dial.getBoundingClientRect();
    this._posX = rect.left + this._elements.dial.offsetWidth/2;
    this._posY = rect.top + this._elements.dial.offsetHeight/2;

    this._elements.dial.addEventListener('touchstart', (this.onMouseDown).bind(this));
    this._elements.dial.addEventListener('mousedown', (this.onMouseDown).bind(this));
  }

  getCurrentValue() {
    return this._newValue;
  }

  rotate() {
    this._elements.dial.style[this._prefixedTransform] =
      'rotate(' + this._currentRotation + 'deg) translateZ(0)';
  }

  onMouseDown(event) {
    event.preventDefault();

    this.mouseUp = (this.onDocumentMouseUp).bind(this);
    this.mouseMove = (this.onDocumentMouseMove).bind(this);

    document.addEventListener('mouseup', this.mouseUp);
    document.addEventListener('mousemove', this.mouseMove);
    document.addEventListener('touchmove', this.mouseMove);
    document.addEventListener('touchend', this.mouseUp);
    document.addEventListener('touchcancel', this.mouseUp);

    this.handleGestureStart(
      this._posX,
      this._posY,
      event.touches ? event.touches[0].clientX : event.clientX,
      event.touches ? event.touches[0].clientY : event.clientY
    );
  }

  onDocumentMouseMove(event) {
    this.handleGesture(
      this._posX,
      this._posY,
      event.touches ? event.touches[0].clientX : event.clientX,
      event.touches ? event.touches[0].clientY : event.clientY
    );
  }

  onDocumentMouseUp(event) {
    event.preventDefault();

    document.removeEventListener('mouseup', this.mouseUp);
    document.removeEventListener('mousemove', this.mouseMove);
    document.removeEventListener('touchmove', this.mouseMove);
    document.removeEventListener('touchend', this.mouseUp);
    document.removeEventListener('touchcancel', this.mouseUp);

    this.handleGestureStop();
  }

  handleGestureStart(x1, y1, x2, y2){
    this._rotations = 0;
    this._lastAngleChange = 0;

    var dx = x2 - x1;
    var dy = y2 - y1;
    this._touchStartAngle = Math.atan2(dy,dx);
    this._startAngle = this._currentRotation;
  }

  handleGesture(x1, y1, x2, y2){
    var dx = x2 - x1;
    var dy = y2 - y1;
    var touchAngle = Math.atan2(dy,dx);
    var angleChange = touchAngle - this._touchStartAngle;
    this._currentRotation = this._startAngle + (angleChange*180/Math.PI);
    console.log(this._currentRotation);

    if (this._lastAngleChange >= 0 && angleChange < 0 && this._lastAngleChange < 0.5) {
      this._rotations--;
    } else if (this._lastAngleChange < 0 && angleChange > 0 && angleChange < 0.5) {
      this._rotations++;
    }
    this._lastAngleChange = angleChange;

    var val = angleChange;
    if (val < 0) {
      val = 2*Math.PI + angleChange;
    }

    let decimal = this._rotations + val/(2*Math.PI);
    let hours = decimal | 0;
    let minutes = ((decimal - hours) * 60);

    this._newValue = this._initValue + 60*60*1000*hours + 60*1000*minutes;
  }

  handleGestureStop(){
  }
}

module.exports = Adjuster;
