var HasTimersModel = require('./hastimersmodel');


class Job extends HasTimersModel {

  getName() {
    return this.getMember('name');
  }

}

module.exports = Job;
