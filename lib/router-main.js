var Router = require("./router");

var qsParse = require('qs').parse;

var RouterAccount = require('./routers/account');
var RouterFront = require('./routers/front');
var RouterTimers = require('./routers/timers');

var ControllerApp = require('./controllers/app');
var ControllerNav = require('./controllers/nav');
var ControllerFront = require('./controllers/front');
var ControllerTimers = require('./controllers/timers');
var ControllerAccount = require('./controllers/account');

var Group = require('./models/group');
var Timer = require('./models/timer');

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
    Offline.saveLocal(this._data.grouped.getJobs(), this._data.grouped.getTimers(), this._data.grouped.getTags());
  }

  checkOfflineStatus() {

    if (Offline.isOnline()) {

      return Offline.getGrouped().then((grouped) => {
        Offline.saveLocal(grouped._jobs.all, grouped._timers.all, grouped._tags.all);

        return {
          jobs: grouped._jobs.all,
          timers: grouped._timers.all,
          tags: grouped._tags.all
        };
      });

    } else {

      let savedData = Offline.loadLocal();
      let result = {
        jobs: [],
        timers: [],
        tags: [],
      };
      if (savedData) {
        result.jobs = savedData.jobs;
        result.timers = savedData.timers;
        result.tags = savedData.tags;
      }

      return Promise.resolve(result);

    }
  }

  constructor(user, templates) {
    this._data = {
      user: user,
      templates: templates,
      jobs: {},
      timers: {},
      tags: {}
    };
  }

  init() {
    return this.checkOfflineStatus().then((data) => {

      this._currentController = null;

      this._data.grouped = Group.fromJSON(data.jobs, data.timers, data.tags);
      this.controllers = {};

      this.controllers.nav = new ControllerNav(this._data, this._data.templates, document.getElementById('view-nav'), {
        onTimerStartSubmit: () => {
          console.log('timer started from nav');
          this.offlineSave();
          this.router.navigate('/timers');
        },
        onLinkClicked: (path) => {
          this.router.navigate(path);
        }
      });

      this.controllers.app = new ControllerApp(this._data, this._data.templates, null, {
        onTimerStartSubmit: (timer) => {
          console.log('timer started', timer);
          this.controllers.nav.getView().setDirty('all');
          this.controllers.nav.renderView();
          this.offlineSave();
        },
      });

      /*
      if(this._data.user) {
        var port = location.port ? ':' + location.port : '';
        var socket = io(port + '/user');
        socket.emit('userID', this._data.user._id);

        socket.on('timerUpdated', timer => {
          this.controllers.app.addOrUpdateTimer(timer);

          this._currentController.getView().setDirty('all');
          this._currentController.renderView();

          this.controllers.nav.getView().setDirty('all');
          this.controllers.nav.renderView();

          this.offlineSave();
        });

        socket.on('timerDeleted', timer => {
          this.controllers.app.removeTimer(timer);

          this._currentController.getView().setDirty('all');
          this._currentController.renderView();

          this.controllers.nav.getView().setDirty('all');
          this.controllers.nav.renderView();

          this.offlineSave();
        });
      }
      */

      this.router = Router
        .add(/account(?:$|\/(.+))/i, (preRendered, match) => {

          this.controllers.nav.setData({
            current: 'account'
          });

          if (!this.controllers.account) {
            this.controllers.account = new ControllerAccount(this._data, this._data.templates, document.getElementById('view'));
          }

          this._currentController = this.controllers.account;

          this.controllers.app.addExtraData({
              view: this.controllers.account.getViewData(),
              nav: this.controllers.nav.getViewData()
          });

          RouterAccount.match(match, this.getQueryParams(), (matched) => {
            this.controllers.account.getView().setDirty('all');
            this.controllers.account.renderView(preRendered);

            this.controllers.nav.getView().setDirty('all');
            this.controllers.nav.renderView(preRendered);
          }, (err) => {
            Error(err);
            console.log('account route error: ', err);
          });
        })

        .add(/timers(?:$|\/(.+))/i, (preRendered, match) => {

          this.controllers.nav.setData({
            current: 'timers'
          });

          if (!this.controllers.timers) {
            this.controllers.timers = new ControllerTimers(this._data, this._data.templates, document.getElementById('view'), {
              onTimerStopSubmit: (timer) => {
                this.controllers.nav.getView().setDirty('all');
                this.controllers.nav.renderView();
                this.offlineSave();
              },
              onTimerDeleteSubmit: (timer) => {
                this.controllers.nav.getView().setDirty('all');
                this.controllers.nav.renderView();
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

          this._currentController = this.controllers.timers;

          this.controllers.app.addExtraData({
              view: this.controllers.timers.getViewData(),
              nav: this.controllers.nav.getViewData()
          });

          RouterTimers.match(match, this.getQueryParams(), (matched) => {
            this.controllers.nav.getView().setDirty('all');
            this.controllers.nav.renderView(preRendered);

            this.controllers.timers.getView().setDirty('all');
            this.controllers.timers.renderView(preRendered);

          }, (err) => {
            Error(err);
            console.log('timers route error: ', err);
          });
        })

        .add(/(?:$|\/(.*))/i, (preRendered, match) => {

          this.controllers.nav.setData({
            current: 'front'
          });

          if (!this.controllers.front) {
            this.controllers.front = new ControllerFront({
              user: this._data.user,
              grouped: this._data.grouped,
              timer: new Timer()
            }, this._data.templates, document.getElementById('view'), {
              onTimerStartSubmit: (timer) => {
                console.log('timer started', timer);
                this.controllers.nav.getView().setDirty('all');
                this.controllers.nav.renderView();
                this.offlineSave();
              },
            });
          }

          this._currentController = this.controllers.front;

          this.controllers.app.addExtraData({
              view: this.controllers.front.getViewData(),
              nav: this.controllers.nav.getViewData()
          });

          RouterFront.match(match, this.getQueryParams(), (matched) => {
            this.controllers.front.getView().setDirty('all');
            this.controllers.front.renderView(preRendered);

            this.controllers.nav.getView().setDirty('all');
            this.controllers.nav.renderView(preRendered);
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

