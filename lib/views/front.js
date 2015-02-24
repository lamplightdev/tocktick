'use strict';

var View = require("./view");

class ViewFront extends View {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'front',
        template: templates.front,
        postRender: (data) => {
          console.log(data);

          var request = require('then-request');
          var shortId = require('shortid');

          var timer = document.querySelector('.timer');
          var time = document.querySelector('.time');


           var context = timer.getContext('2d');
           var x = timer.width / 2;
           var y = timer.height / 2;

           var curPerc = 0;
           var lastPerc = 0;
           var radius = 200;
           var circ = Math.PI * 2;
           var quart = Math.PI / 2;
           var everyOther = false;

           context.lineWidth = 10;
           context.lineCap = 'round';
           var strokeStyles = ['#ad2323', '#333'];

          var jobs = {
            1: {
              active: false,
              timers: {}, //each element has key: 'id', values: 'id', 'start', 'stop'
            }
          };

          var currentJobID = 1;
          var currentTimerID = shortId.generate();

          timer.addEventListener('click', function() {
            if (jobs[currentJobID].active) {

              jobs[currentJobID].timers[currentTimerID].stop = new Date().getTime();
              jobs[currentJobID].active = false;

              var id = currentTimerID;
              request('PUT', '/api/timer/stop/' + id, {
                json: {
                  timer: jobs[currentJobID].timers[id]
                }
              }).then(function(response) {
                console.log(response);
              });
              currentTimerID = shortId.generate();

            } else {
              jobs[currentJobID].timers[currentTimerID] = {
                id: currentTimerID,
                start: new Date().getTime()
              };

              jobs[currentJobID].active = true;
              animate();

              request('POST', '/api/timer/start/' + currentJobID, {
                json: {
                  timer: jobs[currentJobID].timers[currentTimerID]
                }
              }).then(function(response) {
              });
            }

            console.log(jobs);
          });

          function animate(current) {
            if (jobs[currentJobID].active) {

              var now = new Date().getTime();
              var elapsed = now - jobs[currentJobID].timers[currentTimerID].start;

              time.innerHTML = (elapsed / 1000).toFixed(1) + 's';

              context.clearRect(0, 0, timer.width, timer.height);
              context.strokeStyle = strokeStyles[everyOther ? 0 : 1];
              context.beginPath();
              context.arc(x, y, radius, -(quart), ((circ) * 1) - quart, false);
              context.stroke();

              context.strokeStyle = strokeStyles[everyOther ? 1 : 0];
              context.beginPath();
              context.arc(x, y, radius, -(quart), ((circ) * current) - quart, false);
              context.stroke();

              if (curPerc < lastPerc) {
                everyOther = !everyOther;
              }

              lastPerc = curPerc;
              curPerc = (elapsed%1000)/1000;

              requestAnimationFrame(function () {
                animate(curPerc);
              });

            }
          }

        },
      },
    }, callbacks);
  }

}

module.exports = ViewFront;
