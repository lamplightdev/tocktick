var noCache = require('../middleware/nocache');

var ControllerFront = require('../lib/controllers/front');
var ControllerAccount = require('../lib/controllers/account');


module.exports = (function() {
    'use strict';
    var router = require('express').Router();

    router.post('/job/add/:id?', function (req, res) {
      var accountController = new ControllerAccount({
          user: req.user,
          grouped: res.locals.grouped
      });

      accountController.addJob({
        name: req.body.name
      }, req.params.id).then(job => {
        res.statusCode = 200;
        res.json(job);
      }, err => {
        res.statusCode = 500;
        res.json({
          error: err.message
        });
      });
    });


    router.post('/tag/add/:id?', function (req, res) {
      var accountController = new ControllerAccount({
          user: req.user,
          grouped: res.locals.grouped
      });

      accountController.addTag({
        name: req.body.name
      }, req.params.id).then(tag => {
        res.statusCode = 200;
        res.json(tag);
      }, err => {
        res.statusCode = 500;
        res.json({
          error: err.message
        });
      });
    });

    router.post('/timer/start/:id?', function (req, res) {
      var controller = new ControllerFront({
          user: req.user,
          grouped: res.locals.grouped,
      });

      controller.startTimer(
          req.params.id,
          req.body.jobid,
          req.body.description,
          req.body.actiontime
      ).then(timer => {
        let socket = req.app.get('socket');
        if (socket) {
          socket.to(req.user.getID()).emit('timerUpdated', timer);
        }
        res.statusCode = 200;
        res.json(timer);
      }, err => {
        res.statusCode = 500;
        res.json({
          error: err.message
        });
      });
    });

    router.put('/timer/stop/:id', function (req, res) {
      var controller = new ControllerFront({
          user: req.user,
          grouped: res.locals.grouped,
      });

      controller.stopTimer(
          req.params.id,
          req.body.actiontime
      ).then(timer => {
        let socket = req.app.get('socket');
        if (socket) {
          socket.to(req.user.getID()).emit('timerUpdated', timer);
        }
        res.statusCode = 200;
        res.json(timer);
      });
    });

    router.put('/timer/update/:id', function (req, res) {
      var controller = new ControllerFront({
          user: req.user,
          grouped: res.locals.grouped,
      });

      controller.updateTimer(
          req.params.id,
          {
            description: req.body.description,
            jobID: req.body.jobid
          }, req.body['tags[]']
      ).then(timer => {
        let socket = req.app.get('socket');
        if (socket) {
          socket.to(req.user.getID()).emit('timerUpdated', timer);
        }
        res.statusCode = 200;
        res.json(timer);
      });
    });

    router.delete('/timer/delete/:id', function (req, res) {
      var controller = new ControllerFront({
          user: req.user,
          grouped: res.locals.grouped,
      });

      controller.deleteTimer(req.params.id).then(timer => {
        let socket = req.app.get('socket');
        if (socket) {
          socket.to(req.user.getID()).emit('timerDeleted', timer);
        }
        res.statusCode = 200;
        res.json(timer);
      });
    });

    router.get('/group', noCache(), function (req, res) {
      res.statusCode = 200;
      res.json(res.locals.grouped);
    });

    return router;
})();
