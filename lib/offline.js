var request = require('then-request');


class Offline {


  static saveLocal(jobs, timers) {
    localStorage.setItem('groupedData', JSON.stringify({
      jobs: jobs,
      timers: timers
    }));
  }

  static loadLocal() {
    const saved = localStorage.getItem('groupedData');

    if (saved) {
      return JSON.parse(saved);
    }

    return false;
  }

  static isOnline() {
    return navigator.onLine;
  }

  static isOffline() {
    return !navigator.onLine;
  }

  static getGrouped() {
    return request('get', '/api/group', {
    }).then((res) => {
      return JSON.parse(res.getBody());
    }, (err) => {
      Error(err);
      console.log('get group api error: ', err);
    });
  }

}

module.exports = Offline;
