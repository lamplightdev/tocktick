var Model = require('./model');

class Job extends Model {

  getName() {
    return this.getMember('name');
  }

}

module.exports = Job;
