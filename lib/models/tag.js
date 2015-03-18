var HasTimersModel = require('./hastimersmodel');


class Tag extends HasTimersModel {

  getName() {
    return this.getMember('name');
  }

}

module.exports = Tag;
