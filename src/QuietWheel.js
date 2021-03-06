// Supports modern browsers & IE10+

;(function(){

'use strict';

var QuietWheel = function(callback, callbackArgs, enableScrollEvents){

	enableScrollEvents = enableScrollEvents || false;

	var qweUnits = [];
	var isWheelFired = false;
	// `isCoolingDown` is added to prevent
	// continuous dragging behaviour evoking multiple wheel events.
	var isCoolingDown = false;
	var prevTime = new Date().getTime();

	var getAverageScala = function(qweUnits, range){
		var sum = 0;
		var arr_slice = qweUnits.slice(Math.max(qweUnits.length - range, 1));
		for(var i = 0; i < arr_slice.length; i++){
			sum += arr_slice[i].scala;
		}
		return Math.ceil(sum/range);
	};

	var onWheel = function(e){

		if (typeof enableScrollEvents === 'function') {
			if (!enableScrollEvents()) e.preventDefault();
		} else {
			if (!enableScrollEvents) e.preventDefault();
		}

		var curTime = new Date().getTime();
		var qweUnit = new QWEventUnit(e);

		if(qweUnits.length > 149){
			qweUnits.shift();
		}
		qweUnits.push(qweUnit);

		var timeDiff = curTime-prevTime;
		prevTime = curTime;

		if(timeDiff > 200){
			qweUnits = [];
			isWheelFired = false;
		}

		var averageEnd = getAverageScala(qweUnits, 10);
		var averageMiddle = getAverageScala(qweUnits, 70);
		var isAccelerating = averageEnd >= averageMiddle;

		if (isAccelerating && qweUnit.isVerticalScroll){
			if (!isWheelFired) {
				isWheelFired = true;
				if (!isCoolingDown) {
					isCoolingDown = true;
					callback.apply(null, [qweUnit].concat(callbackArgs));
					setTimeout(function(){isCoolingDown=false}, 400);
				}
			}
		} else {
			isWheelFired = false;
		}
	};

	window.addEventListener('wheel', onWheel);
};

function QWEventUnit(e){

	var self = this;

	self.originalWheelEvent = e;

	self.scala = Math.abs(e.deltaY);

	self.direction = Math.max(-1, Math.min(1, e.deltaY)) < 0 ? 'up' : 'down';

	self.isVerticalScroll = Math.abs(e.deltaY) > Math.abs(e.deltaX);
}

if (typeof module === 'object' && module.exports) module.exports = QuietWheel;
else if (typeof define === 'function' && define.amd) define(QuietWheel);
else this.QuietWheel = QuietWheel;
}).call(this);
