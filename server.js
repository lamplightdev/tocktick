'use strict';

require("babel/register");

var express  = require('express'),
    bodyParser   = require('body-parser'),
    cookieParser = require('cookie-parser'),
    csrf         = require('csurf'),
    session      = require('express-session'),
    state        = require('express-state'),
    compression  = require('compression'),

    hbs          = require('./lib/exphbs'),
    middleware   = require('./middleware'),
    config       = require('./config'),

    routesStandard = require('./routes/standard'),
    routesApi = require('./routes/api'),

    port         = (process.env.PORT || 8000);



var redis = require('then-redis');
var db = redis.createClient();

db.on('connect', function() {
    console.log('redis connected');
    setupServer();
});

function setupServer () {
    var app = express(),
        server = app.listen(port, function () {
            console.log("TockTick is now listening on port " + server.address().port);
        });


    state.extend(app);
    app.set('state namespace', 'App');


    app.engine(hbs.extname, hbs.engine);
    app.set('view engine', hbs.extname);
    app.set('views', config.dirs.views);
    app.enable('view cache');


    if (app.get('env') === 'development') {
      app.use(middleware.logger('tiny'));
    }


    app.use(compression());
    app.use(express.static(config.dirs.pub));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 60000,
        }
    }));

    //app.use(csrf());
    app.use(function (req, res, next) {
        //var token = req.csrfToken();
        //res.cookie('XSRF-TOKEN', token);
        //res.locals._csrf = token;
        // app.expose(token, 'Data._csrf');
        res.locals.db = db;
        app.expose(req.user, 'Data.user');
        next();
    });

    app.use(middleware.exposeTemplates());

    app.use(express.Router());

    app.use('/', routesStandard);
    app.use('/api', routesApi);

    // Error handling middleware
    app.use(function (req, res) {
        res.status(404);

        app.expose(true, 'Data.status404');

        if (req.accepts('html')) {
            res.render('404', { url: req.url });
        } else if (req.accepts('json')) {
            res.send({ error: 'Not found' });
        } else {
          res.type('txt').send('Not found');
        }
    });

    return server;
}

