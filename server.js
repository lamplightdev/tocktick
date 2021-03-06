'use strict';

require("babel/register");

var express  = require('express'),
    bodyParser   = require('body-parser'),
    cookieParser = require('cookie-parser'),
    csrf         = require('csurf'),
    session      = require('express-session'),
    state        = require('express-state'),
    compression  = require('compression'),

    httpServer   = require('http').Server,
    socketio     = require('socket.io'),

    hbs          = require('./lib/exphbs'),
    middleware   = require('./middleware'),
    config       = require('./config'),

    passport     = require('passport'),
    auth         = require('./lib/auth'),
    connectRedis = require('connect-redis'),

    routesApi = require('./routes/api'),
    routesAuth = require('./routes/auth'),
    routesStandard = require('./routes/standard'),

    port         = (process.env.PORT || 8000);



var db = require('./lib/redis-db');

db.on('connect', function() {
    db.select(process.env.TOCKTICK_REDIS_DB);

    console.log('redis connected!');
    setupServer();
});

function setupServer () {
    var app = express();
    var server = httpServer(app);

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

    var RedisStore = connectRedis(session);
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1209600,    //two weeks
        },
        store: new RedisStore({
            client: require('./lib/redis-db')._redisClient,
            pass: process.env.TOCKTICK_REDIS_PASSWORD,
        })
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    auth.serialization(app);
    auth.Google();

    //app.use(csrf());
    app.use(function (req, res, next) {
        //var token = req.csrfToken();
        //res.cookie('XSRF-TOKEN', token);
        //res.locals._csrf = token;
        // app.expose(token, 'Data._csrf');
        app.expose(req.user, 'Data.user');
        next();
    });

    app.use(middleware.exposeTemplates());
    app.use(middleware.exposeTimers());

    app.use(express.Router());

    app.use('/api', routesApi);
    app.use('/signin', routesAuth);
    app.use('/', routesStandard);

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

    var io = socketio(server);
    var userSocket = io.of('/user');
    app.set('socket', userSocket);

    userSocket.on('connection', function (socket) {
      socket.on('userID', function (userID) {
        socket.join(userID);
      });

      socket.on('disconnect', function () {
      });
    });


    server.listen(port, function () {
        console.log("TockTick is now listening on port " + server.address().port);
    });

    return server;
}

