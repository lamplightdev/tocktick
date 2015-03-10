var Router = require("./router");

var qsParse = require('qs').parse;

var RouterSharedAccount = require('./routers/shared-account');
var RouterSharedFront = require('./routers/shared-front');
var RouterSharedTimers = require('./routers/shared-timers');
var RouterSharedNav = require('./routers/shared-nav');

var Group = require('./models/group');

var Offline = require('./offline');


class RouterMain {
  static getInstance(user, templates) {
    if (!RouterMain.instance) {
      RouterMain.instance = new RouterMain(user, templates);
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

  offlineSave() {
    Offline.saveLocal(this._data.grouped.getJobs(), this._data.grouped.getTimers());
  }

  checkOfflineStatus() {

    if (Offline.isOnline()) {

      return Offline.getGrouped().then((grouped) => {
        Offline.saveLocal(grouped._jobs.all, grouped._timers.all);

        return {
          jobs: grouped._jobs.all,
          timers: grouped._timers.all,
        };
      }, (err) => {
        throw new Error(err);
      });

    } else {

      let savedData = Offline.loadLocal();
      let result = {
        jobs: [],
        timers: [],
      };
      if (savedData) {
        result.jobs = savedData.jobs;
        result.timers = savedData.timers;
      }

      return Promise.resolve(result);

    }
  }

  constructor(user, templates) {
    this._data = {
      user: user,
      templates: templates,
      jobs: {},
      timers: {}
    };
  }

  init() {
    return this.checkOfflineStatus().then((data) => {
      this._currentRoute = null;

      this._data.grouped = Group.fromJSON(data.jobs, data.timers);

      this.sharedRouters = {};

      this.sharedRouters.nav = new RouterSharedNav(this._data, this._data.templates, document.getElementById('view-nav'), {
        onTimerStartSubmit: () => {
          console.log('timer started from nav');
          this.offlineSave();
          this.router.navigate('/timers');
        },
      });

      this.sharedRouters.front = new RouterSharedFront(this._data, this._data.templates, document.getElementById('view'), {
        onTimerStartSubmit: (timer) => {
          console.log('timer started', timer);
          this.sharedRouters.nav.getController().getView().setDirty('nav-timer');
          this.sharedRouters.nav.getController().renderView();
          this.offlineSave();
        },
      });

      if(this._data.user) {
        var port = location.port ? ':' + location.port : '';
        var socket = io(port + '/user');
        socket.emit('userID', this._data.user._id);

        socket.on('timerUpdated', timer => {
          this.sharedRouters.front.getController().addOrUpdateTimer(timer);

          this._currentRoute.getController().getView().setDirty('all');
          this._currentRoute.getController().renderView();

          this.sharedRouters.nav.getController().getView().setDirty('nav-timer');
          this.sharedRouters.nav.getController().renderView();

          this.offlineSave();
        });

        socket.on('timerDeleted', timer => {
          this.sharedRouters.front.getController().removeTimer(timer);

          this._currentRoute.getController().getView().setDirty('all');
          this._currentRoute.getController().renderView();

          this.sharedRouters.nav.getController().getView().setDirty('nav-timer');
          this.sharedRouters.nav.getController().renderView();

          this.offlineSave();
        });
      }

      this.router = Router
        .add(/account(?:$|\/(.+))/i, (preRendered, match) => {

          if (!this.sharedRouters.account) {
            this.sharedRouters.account = new RouterSharedAccount(this._data, this._data.templates, document.getElementById('view'));
          }

          this._data.currentPage = 'account';
          this._currentRoute = this.sharedRouters.account;

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
            this.sharedRouters.timers = new RouterSharedTimers(this._data, this._data.templates, document.getElementById('view'), {
              onTimerStopSubmit: (timer) => {
                this.sharedRouters.nav.getController().getView().setDirty('nav-timer');
                this.sharedRouters.nav.getController().renderView();
                this.offlineSave();
              },
              onTimerDeleteSubmit: (timer) => {
                this.sharedRouters.nav.getController().getView().setDirty('nav-timer');
                this.sharedRouters.nav.getController().renderView();
                this.offlineSave();
                this.router.update('/timers');
              },

              onTimerUpdateSubmit: () => {
                this.offlineSave();
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

          this._data.currentPage = 'timers';
          this._currentRoute = this.sharedRouters.timers;

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
            this.sharedRouters.front = new RouterSharedFront(this._data, this._data.templates, document.getElementById('view'), {
              onTimerStartSubmit: (timer) => {
                console.log('timer started', timer);
                this.sharedRouters.nav.getController().getView().setDirty('nav-timer');
                this.sharedRouters.nav.getController().renderView();
                this.offlineSave();
              },
            });
          }

          this._data.currentPage = 'front';
          this._currentRoute = this.sharedRouters.front;

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

    });

  }
}

module.exports = RouterMain.getInstance;

