var Router = require("./router");

var qsParse = require('qs').parse;

var RouterSharedAccount = require('./routers/shared-account');
var RouterSharedFront = require('./routers/shared-front');
var RouterSharedTimers = require('./routers/shared-timers');
var RouterSharedNav = require('./routers/shared-nav');

var Group = require('./models/group');

var Offline = require('./offline');


class RouterMain {

  static getInstance(Data) {
    if (!RouterMain.instance) {
      RouterMain.instance = new RouterMain(Data);
    }

    return RouterMain.instance;
  }

  getQueryParams() {
    let query = location.search;
    if (query) {
      query = qsParse(query.substring(1));
    } else {
      query = {};
    }

    return query;
  }

  constructor(Data) {

    if (Offline.isOffline()) {
      let savedData = Offline.loadLocal();
      Data.jobs = savedData.jobs;
      Data.timers = savedData.timers;
    } else {
      Offline.saveLocal(Data.jobs, Data.timers);
    }

    Data.grouped = Group.fromJSON(Data.jobs, Data.timers);

    this.sharedRouters = {};

    this.sharedRouters.nav = new RouterSharedNav(Data, Data.templates, document.getElementById('view-nav'), {
      onTimerStartSubmit: () => {
        console.log('timer started from nav');
        this.router.navigate('/timers');
      },
    });

    this.router = Router
      .add(/account(?:$|\/(.+))/i, (preRendered, match) => {

        if (!this.sharedRouters.account) {
          this.sharedRouters.account = new RouterSharedAccount(Data, Data.templates, document.getElementById('view'));
        }

        Data.currentPage = 'account';

        this.sharedRouters.account.match(match, this.getQueryParams(), (matched) => {
          this.sharedRouters.account.getController().getView().setDirty('all');
          this.sharedRouters.account.getController().renderView(preRendered);

          this.sharedRouters.nav.getController().getView().setDirty('nav');
          this.sharedRouters.nav.getController().renderView(preRendered);
        }, (err) => {
          Error(err);
          console.log('account route error: ', err);
        });
      })

      .add(/timers(?:$|\/(.+))/i, (preRendered, match) => {

        if (!this.sharedRouters.timers) {
          this.sharedRouters.timers = new RouterSharedTimers(Data, Data.templates, document.getElementById('view'), {
            onTimerStopSubmit: (timer) => {
              this.sharedRouters.nav.getController().getView().setDirty('nav-timer');
              this.sharedRouters.nav.getController().renderView(preRendered);
            },
            onTimerDeleteSubmit: (timer) => {
              this.sharedRouters.nav.getController().getView().setDirty('nav-timer');
              this.sharedRouters.nav.getController().renderView(preRendered);
              this.router.update('/timers');
            },

            onTimerUpdateSubmit: () => {
              this.router.update('/timers');
            },

            onTimerEditOpen: (id) => {
              this.router.update('/timers/edit/' + id);
            },
            onTimerEditClose: (id) => {
              this.router.update('/timers');
            }
          });
        }

        Data.currentPage = 'timers';

        this.sharedRouters.timers.match(match, this.getQueryParams(), (matched) => {
          this.sharedRouters.timers.getController().getView().setDirty('all');
          this.sharedRouters.timers.getController().renderView(preRendered);

          this.sharedRouters.nav.getController().getView().setDirty('nav');
          this.sharedRouters.nav.getController().renderView(preRendered);
        }, (err) => {
          Error(err);
          console.log('timers route error: ', err);
        });
      })

      .add(/(?:$|\/(.*))/i, (preRendered, match) => {

        if (!this.sharedRouters.front) {
          this.sharedRouters.front = new RouterSharedFront(Data, Data.templates, document.getElementById('view'), {
            onTimerStartSubmit: (timer) => {
              console.log('timer started', timer);
              this.sharedRouters.nav.getController().getView().setDirty('nav-timer');
              this.sharedRouters.nav.getController().renderView(preRendered);
            },
          });
        }

        Data.currentPage = 'front';

        this.sharedRouters.front.match(match, this.getQueryParams(), (matched) => {
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

