var Model = require('./model');

class Timer extends Model {

  getDescription() {
    return this.getMember('description');
  }

  getStartTime() {
    return parseInt(this.getMember('start'), 0);
  }

  getStopTime() {
    return parseInt(this.getMember('stop'), 0);
  }

  getDuration() {
    let start = this.getStartTime();
    if (start) {
      let stop = this.getStopTime();
      if (stop) {
        return stop - start;
      } else {
        return new Date().getTime() - start;
      }
    } else {
      return 0;
    }
  }

  start(startTime) {
    this.setMember('start', startTime || new Date().getTime());
  }

  stop(stopTime) {
    this.setMember('stop', stopTime || new Date().getTime());
  }

  isStarted() {
    return !!this.getStartTime();
  }

  isStopped() {
    return !!this.getStopTime();
  }

  isRunning() {
    return this.isStarted() && !this.isStopped();
  }

}

module.exports = Timer;
