var Router = require("./router");

var qsParse = require('qs').parse;

var RouterSharedAccount = require('./routers/shared-account');
var RouterSharedFront = require('./routers/shared-front');
var RouterSharedNav = require('./routers/shared-nav');

var Job = require('./models/job');
var Timer = require('./models/timer');

class RouterMain {

  static getInstance(Data) {
    if (!RouterMain.instance) {
      RouterMain.instance = new RouterMain(Data);
    }

    return RouterMain.instance;
  }

  getQueryParams() {
    var query = location.search;
    if (query) {
      query = qsParse(query.substring(1));
    } else {
      query = {};
    }

    return query;
  }

  constructor(Data) {
    var jobs = [];

    Data.jobs.forEach((job) => {
      let j = new Job(job._members);
      j.setID(job._id);
      j._timers = [];

      job._timers.forEach((timer) => {
        let t = new Timer(timer._members);
        t._job = job;
        t.setID(timer._id);
        j._timers.push(t);
      });

      jobs.push(j);
    });

    Data.jobs = jobs;


    var timers = [];

    Data.timers.forEach((timer) => {
      let t = new Timer(timer._members);
      t.setID(timer._id);
      t._job = timer._job;
      timers.push(t);
    });

    Data.timers = timers;



    this.sharedRouters = {};

    this.sharedRouters.nav = new RouterSharedNav(Data, document.getElementById('view-nav'), {
      onTimerStarted: () => {
        console.log('timer started from nav');
        this.sharedRouters.front.getController().getView().setDirty('all');
        this.sharedRouters.front.getController().renderView(false);
      },
    });

    this.router = Router
      .add(/account(?:$|\/(.+))/i, (preRendered, match) => {

        if (!this.sharedRouters.account) {
          this.sharedRouters.account = new RouterSharedAccount(Data, document.getElementById('view'));
        }

        Data.currentPage = 'account';

        this.sharedRouters.account.match(match, this.getQueryParams(), (routeParts, queryString) => {
          this.sharedRouters.account.getController().getView().setDirty('all');
          this.sharedRouters.account.getController().renderView(preRendered);

          this.sharedRouters.nav.getController().getView().setDirty('nav');
          this.sharedRouters.nav.getController().renderView(preRendered);
        }, (err) => {
          Error(err);
          console.log('account route error: ', err);
        });
      })

      .add(/(?:$|\/(.*))/i, (preRendered, match) => {

        if (!this.sharedRouters.front) {
          this.sharedRouters.front = new RouterSharedFront(Data, document.getElementById('view'),{
            onTimerStarted: () => {
              console.log('timer started');
              this.sharedRouters.nav.getController().getView().setDirty('nav-timer');
              this.sharedRouters.nav.getController().renderView(preRendered);
            },
            onTimerStopped: () => {
              console.log('timer stopped');
              this.sharedRouters.nav.getController().getView().setDirty('nav-timer');
              this.sharedRouters.nav.getController().renderView(preRendered);
            },
          });
        }

        Data.currentPage = 'front';

        this.sharedRouters.front.match(match, this.getQueryParams(), (routeParts, queryString) => {
          this.sharedRouters.front.getController().getView().setDirty('all');
          this.sharedRouters.front.getController().renderView(preRendered);

          this.sharedRouters.nav.getController().getView().setDirty('nav');
          this.sharedRouters.nav.getController().renderView(preRendered);
        }, (err) => {
          Error(err);
          console.log('front route error: ', err);
        });
      })

      .add(() => {
        console.log('default');
      })

      .listen();
  }
}

module.exports = RouterMain.getInstance;

