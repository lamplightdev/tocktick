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
    items: {}, //each element has key: 'id', values: 'id', 'start', 'stop'
  }
};

var currentJobID = 1;
var currentItemID = shortId.generate();

timer.addEventListener('click', function() {
  if (jobs[currentJobID].active) {

    jobs[currentJobID].items[currentItemID].stop = new Date().getTime();
    jobs[currentJobID].active = false;

    var id = currentItemID;
    request('PUT', '/api/timer/stop/' + id, {
      json: {
        item: jobs[currentJobID].items[id]
      }
    }).then(function(response) {
      console.log(response);
    });
    currentItemID = shortId.generate();

  } else {
    jobs[currentJobID].items[currentItemID] = {
      id: currentItemID,
      start: new Date().getTime()
    };

    jobs[currentJobID].active = true;
    animate();

    request('POST', '/api/timer/start/' + currentJobID, {
      json: {
        item: jobs[currentJobID].items[currentItemID]
      }
    }).then(function(response) {
      //jobs[currentJobID].items[currentItemID].serverID = JSON.parse(response.body).id;
    });
  }

  console.log(jobs);
});

function animate(current) {
  if (jobs[currentJobID].active) {

    var now = new Date().getTime();
    var elapsed = now - jobs[currentJobID].items[currentItemID].start;

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
