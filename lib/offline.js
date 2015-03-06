

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

}

module.exports = Offline;
