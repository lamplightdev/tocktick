'use strict';

var request = require('then-request');
var shortId = require('shortid');

var View = require("./view");

class ViewFront extends View {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'front',
        template: templates.front,
        postRender: (data) => {

          var timer = this._container.querySelector('.timer');
          var time = this._container.querySelector('.timer-time');
          var jobs = {
            1: data.timers
          };

          var currentJobID = 1;

          timer.addEventListener('click', function() {
            if (!jobs[currentJobID].current) {
              start();
            } else {
              stop();
            }
          });

          if (jobs[currentJobID].current) {
            start(true);
          }

          function start(exists) {
            timer.classList.remove('timer--init');
            timer.classList.remove('timer--stopped');
            timer.classList.add('timer--running');


            if (!exists) {
              var newID = shortId.generate();
              jobs[currentJobID].current = {
                id: newID,
                start: new Date().getTime()
              };

              if (!exists) {
                request('POST', '/api/timer/start/' + currentJobID, {
                  json: {
                    timer: jobs[currentJobID].current
                  }
                }).then(function(response) {
                  console.log(response);
                });
              }
            }

            animate();
          }

          function stop(stopTime) {
            timer.classList.remove('timer--init');
            timer.classList.remove('timer--running');
            timer.classList.add('timer--stopped');

            jobs[currentJobID].current.stop = stopTime || new Date().getTime();

            request('PUT', '/api/timer/stop/' + jobs[currentJobID].current.id, {
              json: {
                timer: jobs[currentJobID].current
              }
            }).then(function(response) {
              console.log(response);
            });
            jobs[currentJobID].current = false;
          }

          function animate() {
            if (jobs[currentJobID].current) {

              var now = new Date().getTime();
              var elapsed = now - jobs[currentJobID].current.start;

              time.innerHTML = (elapsed / 1000).toFixed(1) + 's';

              window.requestAnimationFrame(function () {
                animate();
              });
            }
          }
        },
      },
    }, callbacks);
  }

}

module.exports = ViewFront;
