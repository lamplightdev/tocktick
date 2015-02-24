var Router = require("./router");

var qsParse = require('qs').parse;

var RouterSharedAccount = require('./routers/shared-account');
var RouterSharedFront = require('./routers/shared-front');

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

    this.sharedRouter = null;

    this.router = Router
      .add(/account(?:$|\/(.+))/i, (preRendered, match) => {

        if (!(this.sharedRouter instanceof RouterSharedAccount)) {
          this.sharedRouter = new RouterSharedAccount(Data);
        }

        this.sharedRouter.match(match, this.getQueryParams(), (routeParts, queryString) => {
            this.sharedRouter.getController().renderView(preRendered);
        }, (err) => {
          Error(err);
          console.log('account route error: ', err);
        });
      })

      .add(/(?:$|\/(.*))/i, (preRendered, match) => {

        if (!(this.sharedRouter instanceof RouterSharedFront)) {
          this.sharedRouter = new RouterSharedFront(Data);
        }

        this.sharedRouter.match(match, this.getQueryParams(), (routeParts, queryString) => {
            this.sharedRouter.getController().renderView(preRendered);
        }, (err) => {
          Error(err);
          console.log('account route error: ', err);
        });
      })

      .add(() => {
        console.log('default');
      })

      .listen();
  }
}

module.exports = RouterMain.getInstance;

