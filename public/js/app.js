var request = require('then-request');

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
  dev: {
    active: false,
    items: [], //each element has: 'start', 'stop'
  }
};

var currentJob = 'dev';
var currentItemIndex = 0;

timer.addEventListener('click', function() {
  if (jobs[currentJob].active) {

    jobs[currentJob].items[currentItemIndex].stop = new Date().getTime();
    jobs[currentJob].active = false;

    request('PUT', '/api/timer/stop/' + currentJob + '/' + currentItemIndex, {
      json: {
        job: jobs[currentJob]
      }
    }).then(function(response) {
      console.log(response);
    });

    currentItemIndex++;
  } else {

    jobs[currentJob].items[currentItemIndex] = {
      start: new Date().getTime()
    };

    jobs[currentJob].active = true;
    animate();

    request('POST', '/api/timer/start/' + currentJob + '/' + currentItemIndex, {
      json: {
        job: jobs[currentJob]
      }
    }).then(function(response) {
      console.log(response);
    });
  }

  console.log(jobs);
});

function animate(current) {
  if (jobs[currentJob].active) {

    var now = new Date().getTime();
    var elapsed = now - jobs[currentJob].items[currentItemIndex].start;

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
