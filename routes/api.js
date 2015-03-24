var noCache = require('../middleware/nocache');

var ControllerFront = require('../lib/controllers/front');
var ControllerApp = require('../lib/controllers/app');


module.exports = (function() {
    'use strict';
    var router = require('express').Router();

    router.post('/job/add/:id?', function (req, res) {
      var appController = new ControllerApp({
          user: req.user,
          grouped: res.locals.grouped
      });

      appController.addJob({
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

    router.delete('/job/delete/:id', function (req, res) {
      var appController = new ControllerApp({
          user: req.user,
          grouped: res.locals.grouped,
      });

      appController.deleteJob(req.params.id).then(job => {
        let socket = req.app.get('socket');
        if (socket) {
          socket.to(req.user.getID()).emit('jobDeleted', job);
        }
        res.statusCode = 200;
        res.json(job);
      });
    });

    router.post('/tag/add/:id?', function (req, res) {
      var appController = new ControllerApp({
          user: req.user,
          grouped: res.locals.grouped
      });

      appController.addTag({
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

    router.delete('/tag/delete/:id', function (req, res) {
      var appController = new ControllerApp({
          user: req.user,
          grouped: res.locals.grouped,
      });

      appController.deleteTag(req.params.id).then(tag => {
        let socket = req.app.get('socket');
        if (socket) {
          socket.to(req.user.getID()).emit('tagDeleted', tag);
        }
        res.statusCode = 200;
        res.json(tag);
      });
    });

    router.post('/timer/start/:id?', function (req, res) {
      var controller = new ControllerFront({
          user: req.user,
          grouped: res.locals.grouped,
      });

      controller.startTimer(
        req.params.id,
        {
          description: req.body.description,
          jobID: req.body.jobid,

        }, req.body['tags[]']
      ).then(timer => {
        let socket = req.app.get('socket');
        if (socket) {
          socket.to(req.user.getID()).emit('timerStarted', timer);
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
          socket.to(req.user.getID()).emit('timerStopped', timer);
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
            jobID: req.body.jobid,
            start: req.body.start,
            stop: req.body.stop,
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
