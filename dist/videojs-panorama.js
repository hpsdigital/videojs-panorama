(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
/*! npm.im/intervalometer */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function intervalometer(cb, request, cancel, requestParameter) {
	var requestId;
	var previousLoopTime;
	function loop(now) {
		// must be requested before cb() because that might call .stop()
		requestId = request(loop, requestParameter);

		// called with "ms since last call". 0 on start()
		cb(now - (previousLoopTime || now));

		previousLoopTime = now;
	}
	return {
		start: function start() {
			if (!requestId) { // prevent double starts
				loop(0);
			}
		},
		stop: function stop() {
			cancel(requestId);
			requestId = null;
			previousLoopTime = 0;
		}
	};
}

function frameIntervalometer(cb) {
	return intervalometer(cb, requestAnimationFrame, cancelAnimationFrame);
}

function timerIntervalometer(cb, delay) {
	return intervalometer(cb, setTimeout, clearTimeout, delay);
}

exports.intervalometer = intervalometer;
exports.frameIntervalometer = frameIntervalometer;
exports.timerIntervalometer = timerIntervalometer;
},{}],3:[function(require,module,exports){
/*! npm.im/iphone-inline-video */
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Symbol = _interopDefault(require('poor-mans-symbol'));
var intervalometer = require('intervalometer');

function preventEvent(element, eventName, toggleProperty, preventWithProperty) {
	function handler(e) {
		if (Boolean(element[toggleProperty]) === Boolean(preventWithProperty)) {
			e.stopImmediatePropagation();
			// console.log(eventName, 'prevented on', element);
		}
		delete element[toggleProperty];
	}
	element.addEventListener(eventName, handler, false);

	// Return handler to allow to disable the prevention. Usage:
	// const preventionHandler = preventEvent(el, 'click');
	// el.removeEventHandler('click', preventionHandler);
	return handler;
}

function proxyProperty(object, propertyName, sourceObject, copyFirst) {
	function get() {
		return sourceObject[propertyName];
	}
	function set(value) {
		sourceObject[propertyName] = value;
	}

	if (copyFirst) {
		set(object[propertyName]);
	}

	Object.defineProperty(object, propertyName, {get: get, set: set});
}

function proxyEvent(object, eventName, sourceObject) {
	sourceObject.addEventListener(eventName, function () { return object.dispatchEvent(new Event(eventName)); });
}

function dispatchEventAsync(element, type) {
	Promise.resolve().then(function () {
		element.dispatchEvent(new Event(type));
	});
}

// iOS 10 adds support for native inline playback + silent autoplay
var isWhitelisted = 'object-fit' in document.head.style && /iPhone|iPod/i.test(navigator.userAgent) && !matchMedia('(-webkit-video-playable-inline)').matches;

var ಠ = Symbol();
var ಠevent = Symbol();
var ಠplay = Symbol('nativeplay');
var ಠpause = Symbol('nativepause');

/**
 * UTILS
 */

function getAudioFromVideo(video) {
	var audio = new Audio();
	proxyEvent(video, 'play', audio);
	proxyEvent(video, 'playing', audio);
	proxyEvent(video, 'pause', audio);
	audio.crossOrigin = video.crossOrigin;

	// 'data:' causes audio.networkState > 0
	// which then allows to keep <audio> in a resumable playing state
	// i.e. once you set a real src it will keep playing if it was if .play() was called
	audio.src = video.src || video.currentSrc || 'data:';

	// if (audio.src === 'data:') {
	//   TODO: wait for video to be selected
	// }
	return audio;
}

var lastRequests = [];
var requestIndex = 0;
var lastTimeupdateEvent;

function setTime(video, time, rememberOnly) {
	// allow one timeupdate event every 200+ ms
	if ((lastTimeupdateEvent || 0) + 200 < Date.now()) {
		video[ಠevent] = true;
		lastTimeupdateEvent = Date.now();
	}
	if (!rememberOnly) {
		video.currentTime = time;
	}
	lastRequests[++requestIndex % 3] = time * 100 | 0 / 100;
}

function isPlayerEnded(player) {
	return player.driver.currentTime >= player.video.duration;
}

function update(timeDiff) {
	var player = this;
	// console.log('update', player.video.readyState, player.video.networkState, player.driver.readyState, player.driver.networkState, player.driver.paused);
	if (player.video.readyState >= player.video.HAVE_FUTURE_DATA) {
		if (!player.hasAudio) {
			player.driver.currentTime = player.video.currentTime + ((timeDiff * player.video.playbackRate) / 1000);
			if (player.video.loop && isPlayerEnded(player)) {
				player.driver.currentTime = 0;
			}
		}
		setTime(player.video, player.driver.currentTime);
	} else if (player.video.networkState === player.video.NETWORK_IDLE && !player.video.buffered.length) {
		// this should happen when the source is available but:
		// - it's potentially playing (.paused === false)
		// - it's not ready to play
		// - it's not loading
		// If it hasAudio, that will be loaded in the 'emptied' handler below
		player.video.load();
		// console.log('Will load');
	}

	// console.assert(player.video.currentTime === player.driver.currentTime, 'Video not updating!');

	if (player.video.ended) {
		delete player.video[ಠevent]; // allow timeupdate event
		player.video.pause(true);
	}
}

/**
 * METHODS
 */

function play() {
	// console.log('play');
	var video = this;
	var player = video[ಠ];

	// if it's fullscreen, use the native player
	if (video.webkitDisplayingFullscreen) {
		video[ಠplay]();
		return;
	}

	if (player.driver.src !== 'data:' && player.driver.src !== video.src) {
		// console.log('src changed on play', video.src);
		setTime(video, 0, true);
		player.driver.src = video.src;
	}

	if (!video.paused) {
		return;
	}
	player.paused = false;

	if (!video.buffered.length) {
		// .load() causes the emptied event
		// the alternative is .play()+.pause() but that triggers play/pause events, even worse
		// possibly the alternative is preventing this event only once
		video.load();
	}

	player.driver.play();
	player.updater.start();

	if (!player.hasAudio) {
		dispatchEventAsync(video, 'play');
		if (player.video.readyState >= player.video.HAVE_ENOUGH_DATA) {
			// console.log('onplay');
			dispatchEventAsync(video, 'playing');
		}
	}
}
function pause(forceEvents) {
	// console.log('pause');
	var video = this;
	var player = video[ಠ];

	player.driver.pause();
	player.updater.stop();

	// if it's fullscreen, the developer the native player.pause()
	// This is at the end of pause() because it also
	// needs to make sure that the simulation is paused
	if (video.webkitDisplayingFullscreen) {
		video[ಠpause]();
	}

	if (player.paused && !forceEvents) {
		return;
	}

	player.paused = true;
	if (!player.hasAudio) {
		dispatchEventAsync(video, 'pause');
	}
	if (video.ended) {
		video[ಠevent] = true;
		dispatchEventAsync(video, 'ended');
	}
}

/**
 * SETUP
 */

function addPlayer(video, hasAudio) {
	var player = video[ಠ] = {};
	player.paused = true; // track whether 'pause' events have been fired
	player.hasAudio = hasAudio;
	player.video = video;
	player.updater = intervalometer.frameIntervalometer(update.bind(player));

	if (hasAudio) {
		player.driver = getAudioFromVideo(video);
	} else {
		video.addEventListener('canplay', function () {
			if (!video.paused) {
				// console.log('oncanplay');
				dispatchEventAsync(video, 'playing');
			}
		});
		player.driver = {
			src: video.src || video.currentSrc || 'data:',
			muted: true,
			paused: true,
			pause: function () {
				player.driver.paused = true;
			},
			play: function () {
				player.driver.paused = false;
				// media automatically goes to 0 if .play() is called when it's done
				if (isPlayerEnded(player)) {
					setTime(video, 0);
				}
			},
			get ended() {
				return isPlayerEnded(player);
			}
		};
	}

	// .load() causes the emptied event
	video.addEventListener('emptied', function () {
		// console.log('driver src is', player.driver.src);
		var wasEmpty = !player.driver.src || player.driver.src === 'data:';
		if (player.driver.src && player.driver.src !== video.src) {
			// console.log('src changed to', video.src);
			setTime(video, 0, true);
			player.driver.src = video.src;
			// playing videos will only keep playing if no src was present when .play()’ed
			if (wasEmpty) {
				player.driver.play();
			} else {
				player.updater.stop();
			}
		}
	}, false);

	// stop programmatic player when OS takes over
	video.addEventListener('webkitbeginfullscreen', function () {
		if (!video.paused) {
			// make sure that the <audio> and the syncer/updater are stopped
			video.pause();

			// play video natively
			video[ಠplay]();
		} else if (hasAudio && !player.driver.buffered.length) {
			// if the first play is native,
			// the <audio> needs to be buffered manually
			// so when the fullscreen ends, it can be set to the same current time
			player.driver.load();
		}
	});
	if (hasAudio) {
		video.addEventListener('webkitendfullscreen', function () {
			// sync audio to new video position
			player.driver.currentTime = video.currentTime;
			// console.assert(player.driver.currentTime === video.currentTime, 'Audio not synced');
		});

		// allow seeking
		video.addEventListener('seeking', function () {
			if (lastRequests.indexOf(video.currentTime * 100 | 0 / 100) < 0) {
				// console.log('User-requested seeking');
				player.driver.currentTime = video.currentTime;
			}
		});
	}
}

function overloadAPI(video) {
	var player = video[ಠ];
	video[ಠplay] = video.play;
	video[ಠpause] = video.pause;
	video.play = play;
	video.pause = pause;
	proxyProperty(video, 'paused', player.driver);
	proxyProperty(video, 'muted', player.driver, true);
	proxyProperty(video, 'playbackRate', player.driver, true);
	proxyProperty(video, 'ended', player.driver);
	proxyProperty(video, 'loop', player.driver, true);
	preventEvent(video, 'seeking');
	preventEvent(video, 'seeked');
	preventEvent(video, 'timeupdate', ಠevent, false);
	preventEvent(video, 'ended', ಠevent, false); // prevent occasional native ended events
}

function enableInlineVideo(video, hasAudio, onlyWhitelisted) {
	if ( hasAudio === void 0 ) hasAudio = true;
	if ( onlyWhitelisted === void 0 ) onlyWhitelisted = true;

	if ((onlyWhitelisted && !isWhitelisted) || video[ಠ]) {
		return;
	}
	addPlayer(video, hasAudio);
	overloadAPI(video);
	video.classList.add('IIV');
	if (!hasAudio && video.autoplay) {
		video.play();
	}
	if (!/iPhone|iPod|iPad/.test(navigator.platform)) {
		console.warn('iphone-inline-video is not guaranteed to work in emulated environments');
	}
}

enableInlineVideo.isWhitelisted = isWhitelisted;

module.exports = enableInlineVideo;
},{"intervalometer":2,"poor-mans-symbol":4}],4:[function(require,module,exports){
'use strict';

var index = typeof Symbol === 'undefined' ? function (description) {
	return '@' + (description || '@') + Math.random();
} : Symbol;

module.exports = index;
},{}],5:[function(require,module,exports){
/*!
 * EventEmitter v5.2.2 - git.io/ee
 * Unlicense - http://unlicense.org/
 * Oliver Caldwell - http://oli.me.uk/
 * @preserve
 */

;(function (exports) {
    'use strict';

    /**
     * Class for managing events.
     * Can be extended to provide event functionality in other classes.
     *
     * @class EventEmitter Manages event registering and emitting.
     */
    function EventEmitter() {}

    // Shortcuts to improve speed and size
    var proto = EventEmitter.prototype;
    var originalGlobalValue = exports.EventEmitter;

    /**
     * Finds the index of the listener for the event in its storage array.
     *
     * @param {Function[]} listeners Array of listeners to search through.
     * @param {Function} listener Method to look for.
     * @return {Number} Index of the specified listener, -1 if not found
     * @api private
     */
    function indexOfListener(listeners, listener) {
        var i = listeners.length;
        while (i--) {
            if (listeners[i].listener === listener) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Alias a method while keeping the context correct, to allow for overwriting of target method.
     *
     * @param {String} name The name of the target method.
     * @return {Function} The aliased method
     * @api private
     */
    function alias(name) {
        return function aliasClosure() {
            return this[name].apply(this, arguments);
        };
    }

    /**
     * Returns the listener array for the specified event.
     * Will initialise the event object and listener arrays if required.
     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
     * Each property in the object response is an array of listener functions.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Function[]|Object} All listener functions for the event.
     */
    proto.getListeners = function getListeners(evt) {
        var events = this._getEvents();
        var response;
        var key;

        // Return a concatenated array of all matching events if
        // the selector is a regular expression.
        if (evt instanceof RegExp) {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        }
        else {
            response = events[evt] || (events[evt] = []);
        }

        return response;
    };

    /**
     * Takes a list of listener objects and flattens it into a list of listener functions.
     *
     * @param {Object[]} listeners Raw listener objects.
     * @return {Function[]} Just the listener functions.
     */
    proto.flattenListeners = function flattenListeners(listeners) {
        var flatListeners = [];
        var i;

        for (i = 0; i < listeners.length; i += 1) {
            flatListeners.push(listeners[i].listener);
        }

        return flatListeners;
    };

    /**
     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Object} All listener functions for an event in an object.
     */
    proto.getListenersAsObject = function getListenersAsObject(evt) {
        var listeners = this.getListeners(evt);
        var response;

        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }

        return response || listeners;
    };

    function isValidListener (listener) {
        if (typeof listener === 'function' || listener instanceof RegExp) {
            return true
        } else if (listener && typeof listener === 'object') {
            return isValidListener(listener.listener)
        } else {
            return false
        }
    }

    /**
     * Adds a listener function to the specified event.
     * The listener will not be added if it is a duplicate.
     * If the listener returns true then it will be removed after it is called.
     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListener = function addListener(evt, listener) {
        if (!isValidListener(listener)) {
            throw new TypeError('listener must be a function');
        }

        var listeners = this.getListenersAsObject(evt);
        var listenerIsWrapped = typeof listener === 'object';
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                listeners[key].push(listenerIsWrapped ? listener : {
                    listener: listener,
                    once: false
                });
            }
        }

        return this;
    };

    /**
     * Alias of addListener
     */
    proto.on = alias('addListener');

    /**
     * Semi-alias of addListener. It will add a listener that will be
     * automatically removed after its first execution.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addOnceListener = function addOnceListener(evt, listener) {
        return this.addListener(evt, {
            listener: listener,
            once: true
        });
    };

    /**
     * Alias of addOnceListener.
     */
    proto.once = alias('addOnceListener');

    /**
     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
     * You need to tell it what event names should be matched by a regex.
     *
     * @param {String} evt Name of the event to create.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvent = function defineEvent(evt) {
        this.getListeners(evt);
        return this;
    };

    /**
     * Uses defineEvent to define multiple events.
     *
     * @param {String[]} evts An array of event names to define.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvents = function defineEvents(evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    };

    /**
     * Removes a listener function from the specified event.
     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to remove the listener from.
     * @param {Function} listener Method to remove from the event.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListener = function removeListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var index;
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                index = indexOfListener(listeners[key], listener);

                if (index !== -1) {
                    listeners[key].splice(index, 1);
                }
            }
        }

        return this;
    };

    /**
     * Alias of removeListener
     */
    proto.off = alias('removeListener');

    /**
     * Adds listeners in bulk using the manipulateListeners method.
     * If you pass an object as the first argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
     * You can also pass it a regular expression to add the array of listeners to all events that match it.
     * Yeah, this function does quite a bit. That's probably a bad thing.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListeners = function addListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(false, evt, listeners);
    };

    /**
     * Removes listeners in bulk using the manipulateListeners method.
     * If you pass an object as the first argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be removed.
     * You can also pass it a regular expression to remove the listeners from all events that match it.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListeners = function removeListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(true, evt, listeners);
    };

    /**
     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
     * The first argument will determine if the listeners are removed (true) or added (false).
     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be added/removed.
     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
     *
     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
        var i;
        var value;
        var single = remove ? this.removeListener : this.addListener;
        var multiple = remove ? this.removeListeners : this.addListeners;

        // If evt is an object then pass each of its properties to this method
        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    // Pass the single listener straight through to the singular method
                    if (typeof value === 'function') {
                        single.call(this, i, value);
                    }
                    else {
                        // Otherwise pass back to the multiple function
                        multiple.call(this, i, value);
                    }
                }
            }
        }
        else {
            // So evt must be a string
            // And listeners must be an array of listeners
            // Loop over it and pass each one to the multiple method
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }

        return this;
    };

    /**
     * Removes all listeners from a specified event.
     * If you do not specify an event then all listeners will be removed.
     * That means every event will be emptied.
     * You can also pass a regex to remove all events that match it.
     *
     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeEvent = function removeEvent(evt) {
        var type = typeof evt;
        var events = this._getEvents();
        var key;

        // Remove different things depending on the state of evt
        if (type === 'string') {
            // Remove all listeners for the specified event
            delete events[evt];
        }
        else if (evt instanceof RegExp) {
            // Remove all events matching the regex.
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    delete events[key];
                }
            }
        }
        else {
            // Remove all listeners in all events
            delete this._events;
        }

        return this;
    };

    /**
     * Alias of removeEvent.
     *
     * Added to mirror the node API.
     */
    proto.removeAllListeners = alias('removeEvent');

    /**
     * Emits an event of your choice.
     * When emitted, every listener attached to that event will be executed.
     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
     * So they will not arrive within the array on the other side, they will be separate.
     * You can also pass a regular expression to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {Array} [args] Optional array of arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emitEvent = function emitEvent(evt, args) {
        var listenersMap = this.getListenersAsObject(evt);
        var listeners;
        var listener;
        var i;
        var key;
        var response;

        for (key in listenersMap) {
            if (listenersMap.hasOwnProperty(key)) {
                listeners = listenersMap[key].slice(0);

                for (i = 0; i < listeners.length; i++) {
                    // If the listener returns true then it shall be removed from the event
                    // The function is executed either with a basic call or an apply if there is an args array
                    listener = listeners[i];

                    if (listener.once === true) {
                        this.removeListener(evt, listener.listener);
                    }

                    response = listener.listener.apply(this, args || []);

                    if (response === this._getOnceReturnValue()) {
                        this.removeListener(evt, listener.listener);
                    }
                }
            }
        }

        return this;
    };

    /**
     * Alias of emitEvent
     */
    proto.trigger = alias('emitEvent');

    /**
     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {...*} Optional additional arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emit = function emit(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };

    /**
     * Sets the current value to check against when executing listeners. If a
     * listeners return value matches the one set here then it will be removed
     * after execution. This value defaults to true.
     *
     * @param {*} value The new value to check for when executing listeners.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.setOnceReturnValue = function setOnceReturnValue(value) {
        this._onceReturnValue = value;
        return this;
    };

    /**
     * Fetches the current value to check against when executing listeners. If
     * the listeners return value matches this one then it should be removed
     * automatically. It will return true by default.
     *
     * @return {*|Boolean} The current value to check for or the default, true.
     * @api private
     */
    proto._getOnceReturnValue = function _getOnceReturnValue() {
        if (this.hasOwnProperty('_onceReturnValue')) {
            return this._onceReturnValue;
        }
        else {
            return true;
        }
    };

    /**
     * Fetches the events object and creates one if required.
     *
     * @return {Object} The events storage object.
     * @api private
     */
    proto._getEvents = function _getEvents() {
        return this._events || (this._events = {});
    };

    /**
     * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
     *
     * @return {Function} Non conflicting EventEmitter class.
     */
    EventEmitter.noConflict = function noConflict() {
        exports.EventEmitter = originalGlobalValue;
        return EventEmitter;
    };

    // Expose the class either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return EventEmitter;
        });
    }
    else if (typeof module === 'object' && module.exports){
        module.exports = EventEmitter;
    }
    else {
        exports.EventEmitter = EventEmitter;
    }
}(this || {}));

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseCanvas = require('./BaseCanvas');

var _BaseCanvas2 = _interopRequireDefault(_BaseCanvas);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Animation = function () {
    function Animation(player, options) {
        var _this = this;

        _classCallCheck(this, Animation);

        this._player = player;
        this._options = (0, _utils.mergeOptions)({}, this._options);
        this._options = (0, _utils.mergeOptions)(this._options, options);

        this._canvas = this._options.canvas;
        this._timeline = [];

        this._options.animation.forEach(function (obj) {
            _this.addTimeline(obj);
        });
    }

    _createClass(Animation, [{
        key: 'addTimeline',
        value: function addTimeline(opt) {
            var timeline = {
                active: false,
                initialized: false,
                completed: false,
                startValue: {},
                byValue: {},
                endValue: {},
                keyPoint: opt.keyPoint,
                duration: opt.duration,
                beginTime: Infinity,
                endTime: Infinity,
                onComplete: opt.onComplete,
                from: opt.from,
                to: opt.to
            };

            if (typeof opt.ease === "string") {
                timeline.ease = _utils.easeFunctions[opt.ease];
            }
            if (typeof opt.ease === "undefined") {
                timeline.ease = _utils.easeFunctions.linear;
            }

            this._timeline.push(timeline);
            this.attachEvents();
        }
    }, {
        key: 'initialTimeline',
        value: function initialTimeline(timeline) {
            for (var key in timeline.to) {
                if (timeline.to.hasOwnProperty(key)) {
                    var _from = timeline.from ? typeof timeline.from[key] !== "undefined" ? timeline.from[key] : this._canvas['_' + key] : this._canvas['_' + key];
                    timeline.startValue[key] = _from;
                    timeline.endValue[key] = timeline.to[key];
                    timeline.byValue[key] = timeline.to[key] - _from;
                }
            }
        }
    }, {
        key: 'processTimeline',
        value: function processTimeline(timeline, animationTime) {
            for (var key in timeline.to) {
                if (timeline.to.hasOwnProperty(key)) {
                    var newVal = timeline.ease && timeline.ease(animationTime, timeline.startValue[key], timeline.byValue[key], timeline.duration);
                    if (key === "fov") {
                        this._canvas._camera.fov = newVal;
                        this._canvas._camera.updateProjectionMatrix();
                    } else {
                        this._canvas['_' + key] = newVal;
                    }
                }
            }
        }
    }, {
        key: 'attachEvents',
        value: function attachEvents() {
            this._active = true;
            this._canvas.addListener("beforeRender", this.renderAnimation.bind(this));
            this._player.on("seeked", this.handleVideoSeek.bind(this));
        }
    }, {
        key: 'detachEvents',
        value: function detachEvents() {
            this._active = false;
            this._canvas.controlable = true;
            this._canvas.removeListener("beforeRender", this.renderAnimation.bind(this));
        }
    }, {
        key: 'handleVideoSeek',
        value: function handleVideoSeek() {
            var currentTime = this._player.getVideoEl().currentTime * 1000;
            var resetTimeline = 0;
            this._timeline.forEach(function (timeline) {
                var res = timeline.keyPoint >= currentTime || timeline.keyPoint <= currentTime && timeline.keyPoint + timeline.duration >= currentTime;
                if (res) {
                    resetTimeline++;
                    timeline.completed = false;
                    timeline.initialized = false;
                }
            });

            if (resetTimeline > 0 && !this._active) {
                this.attachEvents();
            }
        }
    }, {
        key: 'renderAnimation',
        value: function renderAnimation() {
            var _this2 = this;

            var currentTime = this._player.getVideoEl().currentTime * 1000;
            var completeTimeline = 0;
            var inActiveTimeline = 0;
            this._timeline.filter(function (timeline) {
                if (timeline.completed) {
                    completeTimeline++;
                    return false;
                }
                var res = timeline.keyPoint <= currentTime && timeline.keyPoint + timeline.duration > currentTime;
                timeline.active = res;
                if (timeline.active === false) inActiveTimeline++;

                if (res && !timeline.initialized) {
                    timeline.initialized = true;
                    timeline.beginTime = timeline.keyPoint;
                    timeline.endTime = timeline.beginTime + timeline.duration;
                    _this2.initialTimeline(timeline);
                }
                if (timeline.endTime <= currentTime) {
                    timeline.completed = true;
                    _this2.processTimeline(timeline, timeline.duration);
                    if (timeline.onComplete) {
                        timeline.onComplete.call(_this2);
                    }
                }
                return res;
            }).forEach(function (timeline) {
                var animationTime = currentTime - timeline.beginTime;
                _this2.processTimeline(timeline, animationTime);
            });

            this._canvas.controlable = inActiveTimeline === this._timeline.length;

            if (completeTimeline === this._timeline.length) {
                this.detachEvents();
            }
        }
    }]);

    return Animation;
}();

exports.default = Animation;

},{"../utils":36,"./BaseCanvas":7}],7:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

var _Component2 = require('./Component');

var _Component3 = _interopRequireDefault(_Component2);

var _HelperCanvas = require('./HelperCanvas');

var _HelperCanvas2 = _interopRequireDefault(_HelperCanvas);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HAVE_CURRENT_DATA = 2;

var BaseCanvas = function (_Component) {
    _inherits(BaseCanvas, _Component);

    /**
     * Base constructor
     * @param player
     * @param options
     */


    /**
     * Interaction
     */


    /**
     * Three.js
     */


    /**
     * Position
     */

    /**
     * Dimension
     */
    function BaseCanvas(player, options, renderElement) {
        _classCallCheck(this, BaseCanvas);

        var _this = _possibleConstructorReturn(this, (BaseCanvas.__proto__ || Object.getPrototypeOf(BaseCanvas)).call(this, player, options, renderElement));

        _this._width = _this.player.el().offsetWidth, _this._height = _this.player.el().offsetHeight;
        _this._lon = _this.options.initLon, _this._lat = _this.options.initLat, _this._phi = 0, _this._theta = 0;
        _this._accelector = {
            x: 0,
            y: 0
        };
        _this._renderer.setSize(_this._width, _this._height);

        //init interaction
        _this._mouseDown = false;
        _this._isUserInteracting = false;
        _this._runOnMobile = (0, _utils.mobileAndTabletcheck)();
        _this._VRMode = false;
        _this._controlable = true;

        _this._mouseDownPointer = {
            x: 0,
            y: 0
        };

        _this._mouseDownLocation = {
            Lat: 0,
            Lon: 0
        };

        _this.attachControlEvents();
        return _this;
    }

    _createClass(BaseCanvas, [{
        key: 'createEl',
        value: function createEl() {
            var tagName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "div";
            var properties = arguments[1];
            var attributes = arguments[2];

            /**
             * initial webgl render
             */
            this._renderer = new _three2.default.WebGLRenderer();
            this._renderer.setPixelRatio(window.devicePixelRatio);
            this._renderer.autoClear = false;
            this._renderer.setClearColor(0x000000, 1);

            var renderElement = this._renderElement;

            if (renderElement.tagName.toLowerCase() === "video" && (this.options.useHelperCanvas === true || !(0, _utils.supportVideoTexture)(renderElement) && this.options.useHelperCanvas === "auto")) {
                this._helperCanvas = this.player.addComponent("HelperCanvas", new _HelperCanvas2.default(this.player));

                var context = this._helperCanvas.el();
                this._texture = new _three2.default.Texture(context);
            } else {
                this._texture = new _three2.default.Texture(renderElement);
            }

            this._texture.generateMipmaps = false;
            this._texture.minFilter = _three2.default.LinearFilter;
            this._texture.maxFilter = _three2.default.LinearFilter;
            this._texture.format = _three2.default.RGBFormat;

            var el = this._renderer.domElement;
            el.classList.add('vjs-panorama-canvas');

            return el;
        }
    }, {
        key: 'dispose',
        value: function dispose() {
            this.detachControlEvents();
            this.stopAnimation();
            _get(BaseCanvas.prototype.__proto__ || Object.getPrototypeOf(BaseCanvas.prototype), 'dispose', this).call(this);
        }
    }, {
        key: 'startAnimation',
        value: function startAnimation() {
            this._time = new Date().getTime();
            this.animate();
        }
    }, {
        key: 'stopAnimation',
        value: function stopAnimation() {
            if (this._requestAnimationId) {
                cancelAnimationFrame(this._requestAnimationId);
            }
        }
    }, {
        key: 'attachControlEvents',
        value: function attachControlEvents() {
            this.on('mousemove', this.handleMouseMove.bind(this));
            this.on('touchmove', this.handleTouchMove.bind(this));
            this.on('mousedown', this.handleMouseDown.bind(this));
            this.on('touchstart', this.handleTouchStart.bind(this));
            this.on('mouseup', this.handleMouseUp.bind(this));
            this.on('touchend', this.handleTouchEnd.bind(this));
            this.on('mouseenter', this.handleMouseEnter.bind(this));
            this.on('mouseleave', this.handleMouseLease.bind(this));
            if (this.options.scrollable) {
                this.on('mousewheel', this.handleMouseWheel.bind(this));
                this.on('MozMousePixelScroll', this.handleMouseWheel.bind(this));
            }
            if (this.options.resizable) {
                window.addEventListener("resize", this.handleResize.bind(this));
            }
            if (this.options.autoMobileOrientation) {
                window.addEventListener('devicemotion', this.handleMobileOrientation.bind(this));
            }
            if (this.options.KeyboardControl) {
                window.addEventListener('keydown', this.handleKeyDown.bind(this));
                window.addEventListener('keyup', this.handleKeyUp.bind(this));
            }
        }
    }, {
        key: 'detachControlEvents',
        value: function detachControlEvents() {
            this.off('mousemove', this.handleMouseMove.bind(this));
            this.off('touchmove', this.handleTouchMove.bind(this));
            this.off('mousedown', this.handleMouseDown.bind(this));
            this.off('touchstart', this.handleTouchStart.bind(this));
            this.off('mouseup', this.handleMouseUp.bind(this));
            this.off('touchend', this.handleTouchEnd.bind(this));
            this.off('mouseenter', this.handleMouseEnter.bind(this));
            this.off('mouseleave', this.handleMouseLease.bind(this));
            if (this.options.scrollable) {
                this.off('mousewheel', this.handleMouseWheel.bind(this));
                this.off('MozMousePixelScroll', this.handleMouseWheel.bind(this));
            }
            if (this.options.resizable) {
                window.removeEventListener("resize", this.handleResize.bind(this));
            }
            if (this.options.autoMobileOrientation) {
                window.removeEventListener('devicemotion', this.handleMobileOrientation.bind(this));
            }
            if (this.options.KeyboardControl) {
                window.removeEventListener('keydown', this.handleKeyDown.bind(this));
                window.removeEventListener('keyup', this.handleKeyUp.bind(this));
            }
        }

        /**
         * trigger when window resized
         */

    }, {
        key: 'handleResize',
        value: function handleResize() {
            this._width = this.player.el().offsetWidth, this._height = this.player.el().offsetHeight;
            this._renderer.setSize(this._width, this._height);
        }
    }, {
        key: 'handleMouseWheel',
        value: function handleMouseWheel(event) {
            event.stopPropagation();
            event.preventDefault();
        }
    }, {
        key: 'handleMouseEnter',
        value: function handleMouseEnter(event) {
            this._isUserInteracting = true;
            this._accelector.x = 0;
            this._accelector.y = 0;
        }
    }, {
        key: 'handleMouseLease',
        value: function handleMouseLease(event) {
            this._isUserInteracting = false;
            this._accelector.x = 0;
            this._accelector.y = 0;
            if (this._mouseDown) {
                this._mouseDown = false;
            }
        }
    }, {
        key: 'handleMouseDown',
        value: function handleMouseDown(event) {
            event.preventDefault();
            var clientX = event.clientX || event.touches && event.touches[0].clientX;
            var clientY = event.clientY || event.touches && event.touches[0].clientY;
            if (typeof clientX !== "undefined" && clientY !== "undefined") {
                this._mouseDown = true;
                this._mouseDownPointer.x = clientX;
                this._mouseDownPointer.y = clientY;
                this._mouseDownLocation.Lon = this._lon;
                this._mouseDownLocation.Lat = this._lat;

                // console.log('turning pointer events off for markers');
                $('.vjs-marker').css('pointer-events', 'none');
            }
        }
    }, {
        key: 'handleMouseMove',
        value: function handleMouseMove(event) {
            var clientX = event.clientX || event.touches && event.touches[0].clientX;
            var clientY = event.clientY || event.touches && event.touches[0].clientY;

            if (this.options.MouseEnable && this.controlable && typeof clientX !== "undefined" && typeof clientY !== "undefined") {
                if (this._mouseDown) {
                    this._lon = (this._mouseDownPointer.x - clientX) * 0.2 + this._mouseDownLocation.Lon;
                    this._lat = (clientY - this._mouseDownPointer.y) * 0.2 + this._mouseDownLocation.Lat;
                    this._accelector.x = 0;
                    this._accelector.y = 0;
                } else if (!this.options.clickAndDrag) {
                    var rect = this.el().getBoundingClientRect();
                    var x = clientX - this._width / 2 - rect.left;
                    var y = this._height / 2 - (clientY - rect.top);
                    var angle = 0;
                    if (x === 0) {
                        angle = y > 0 ? Math.PI / 2 : Math.PI * 3 / 2;
                    } else if (x > 0 && y > 0) {
                        angle = Math.atan(y / x);
                    } else if (x > 0 && y < 0) {
                        angle = 2 * Math.PI - Math.atan(y * -1 / x);
                    } else if (x < 0 && y > 0) {
                        angle = Math.PI - Math.atan(y / x * -1);
                    } else {
                        angle = Math.PI + Math.atan(y / x);
                    }
                    this._accelector.x = Math.cos(angle) * this.options.movingSpeed.x * Math.abs(x);
                    this._accelector.y = Math.sin(angle) * this.options.movingSpeed.y * Math.abs(y);
                }
            }
        }
    }, {
        key: 'handleMouseUp',
        value: function handleMouseUp(event) {
            this._mouseDown = false;

            // console.log('turning pointer events on for markers');
            $('.vjs-marker').css('pointer-events', 'auto');

            if (this.options.clickToToggle) {
                var clientX = event.clientX || event.changedTouches && event.changedTouches[0].clientX;
                var clientY = event.clientY || event.changedTouches && event.changedTouches[0].clientY;
                if (typeof clientX !== "undefined" && clientY !== "undefined" && this.options.clickToToggle) {
                    var diffX = Math.abs(clientX - this._mouseDownPointer.x);
                    var diffY = Math.abs(clientY - this._mouseDownPointer.y);
                    if (diffX < 0.1 && diffY < 0.1) this.player.paused() ? this.player.play() : this.player.pause();
                }
            }
        }
    }, {
        key: 'handleTouchStart',
        value: function handleTouchStart(event) {
            if (event.touches.length > 1) {
                this._isUserPinch = true;
                this._multiTouchDistance = (0, _utils.getTouchesDistance)(event.touches);
            }
            this.handleMouseDown(event);
        }
    }, {
        key: 'handleTouchMove',
        value: function handleTouchMove(event) {
            this.trigger("touchMove");
            //handle single touch event,
            if (!this._isUserPinch || event.touches.length <= 1) {
                this.handleMouseMove(event);
            }
        }
    }, {
        key: 'handleTouchEnd',
        value: function handleTouchEnd(event) {
            this._isUserPinch = false;
            this.handleMouseUp(event);
        }
    }, {
        key: 'handleMobileOrientation',
        value: function handleMobileOrientation(event) {
            if (typeof event.rotationRate !== "undefined") {
                var x = event.rotationRate.alpha;
                var y = event.rotationRate.beta;
                var portrait = typeof event.portrait !== "undefined" ? event.portrait : window.matchMedia("(orientation: portrait)").matches;
                var landscape = typeof event.landscape !== "undefined" ? event.landscape : window.matchMedia("(orientation: landscape)").matches;
                var orientation = event.orientation || window.orientation;

                if (portrait) {
                    this._lon = this._lon - y * this.options.mobileVibrationValue;
                    this._lat = this._lat + x * this.options.mobileVibrationValue;
                } else if (landscape) {
                    var orientationDegree = -90;
                    if (typeof orientation !== "undefined") {
                        orientationDegree = orientation;
                    }

                    this._lon = orientationDegree === -90 ? this._lon + x * this.options.mobileVibrationValue : this._lon - x * this.options.mobileVibrationValue;
                    this._lat = orientationDegree === -90 ? this._lat + y * this.options.mobileVibrationValue : this._lat - y * this.options.mobileVibrationValue;
                }
            }
        }
    }, {
        key: 'handleKeyDown',
        value: function handleKeyDown(event) {
            this._isUserInteracting = true;
            switch (event.keyCode) {
                case 38: /*up*/
                case 87:
                    /*W*/
                    this._lat += this.options.KeyboardMovingSpeed.y;
                    break;
                case 37: /*left*/
                case 65:
                    /*A*/
                    this._lon -= this.options.KeyboardMovingSpeed.x;
                    break;
                case 39: /*right*/
                case 68:
                    /*D*/
                    this._lon += this.options.KeyboardMovingSpeed.x;
                    break;
                case 40: /*down*/
                case 83:
                    /*S*/
                    this._lat -= this.options.KeyboardMovingSpeed.y;
                    break;
            }
        }
    }, {
        key: 'handleKeyUp',
        value: function handleKeyUp(event) {
            this._isUserInteracting = false;
        }
    }, {
        key: 'enableVR',
        value: function enableVR() {
            this._VRMode = true;
        }
    }, {
        key: 'disableVR',
        value: function disableVR() {
            this._VRMode = false;
        }
    }, {
        key: 'animate',
        value: function animate() {
            this._requestAnimationId = requestAnimationFrame(this.animate.bind(this));
            var ct = new Date().getTime();
            if (ct - this._time >= 30) {
                this._texture.needsUpdate = true;
                this._time = ct;
                this.trigger("textureRender");
            }

            //canvas should only be rendered when video is ready or will report `no video` warning message.
            if (this._renderElement.tagName.toLowerCase() !== "video" || this.player.readyState() >= HAVE_CURRENT_DATA) {
                this.render();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            this.trigger("beforeRender");
            if (this._controlable) {
                if (!this._isUserInteracting) {
                    var symbolLat = this._lat > this.options.initLat ? -1 : 1;
                    var symbolLon = this._lon > this.options.initLon ? -1 : 1;
                    if (this.options.backToInitLat) {
                        this._lat = this._lat > this.options.initLat - Math.abs(this.options.returnLatSpeed) && this._lat < this.options.initLat + Math.abs(this.options.returnLatSpeed) ? this.options.initLat : this._lat + this.options.returnLatSpeed * symbolLat;
                    }
                    if (this.options.backToInitLon) {
                        this._lon = this._lon > this.options.initLon - Math.abs(this.options.returnLonSpeed) && this._lon < this.options.initLon + Math.abs(this.options.returnLonSpeed) ? this.options.initLon : this._lon + this.options.returnLonSpeed * symbolLon;
                    }
                } else if (this._accelector.x !== 0 && this._accelector.y !== 0) {
                    this._lat += this._accelector.y;
                    this._lon += this._accelector.x;
                }
            }

            if (this._options.minLon === 0 && this._options.maxLon === 360) {
                if (this._lon > 360) {
                    this._lon -= 360;
                } else if (this._lon < 0) {
                    this._lon += 360;
                }
            }

            this._lat = Math.max(this.options.minLat, Math.min(this.options.maxLat, this._lat));
            this._lon = Math.max(this.options.minLon, Math.min(this.options.maxLon, this._lon));
            this._phi = _three2.default.Math.degToRad(90 - this._lat);
            this._theta = _three2.default.Math.degToRad(this._lon);

            if (this._helperCanvas) {
                this._helperCanvas.render();
            }
            this._renderer.clear();
            this.trigger("render");
        }
    }, {
        key: 'VRMode',
        get: function get() {
            return this._VRMode;
        }
    }, {
        key: 'controlable',
        get: function get() {
            return this._controlable;
        },
        set: function set(val) {
            this._controlable = val;
        }
    }]);

    return BaseCanvas;
}(_Component3.default);

exports.default = BaseCanvas;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../utils":36,"./Component":10,"./HelperCanvas":14}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _ClickableComponent2 = require('./ClickableComponent');

var _ClickableComponent3 = _interopRequireDefault(_ClickableComponent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Button = function (_ClickableComponent) {
    _inherits(Button, _ClickableComponent);

    function Button(player) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Button);

        var _this = _possibleConstructorReturn(this, (Button.__proto__ || Object.getPrototypeOf(Button)).call(this, player, options));

        _this.on("keydown", _this.handleKeyPress.bind(_this));
        return _this;
    }

    _createClass(Button, [{
        key: 'createEl',
        value: function createEl(tagName, properties, attributes) {
            return _get(Button.prototype.__proto__ || Object.getPrototypeOf(Button.prototype), 'createEl', this).call(this, "button", null, {
                type: "button",
                // let the screen reader user know that the text of the button may change
                'aria-live': 'polite'
            });
        }

        /**
         * Enable the `Button` element so that it can be activated or clicked. Use this with
         * {@link Button#disable}.
         */

    }, {
        key: 'enable',
        value: function enable() {
            this.el().removeAttribute('disabled');
        }

        /**
         * Enable the `Button` element so that it cannot be activated or clicked. Use this with
         * {@link Button#enable}.
         */

    }, {
        key: 'disable',
        value: function disable() {
            this.el().setAttribute('disabled', 'disabled');
        }
    }, {
        key: 'handleKeyPress',
        value: function handleKeyPress(event) {
            // Ignore Space (32) or Enter (13) key operation, which is handled by the browser for a button.
            if (event.which === 32 || event.which === 13) {
                return;
            }
        }
    }]);

    return Button;
}(_ClickableComponent3.default);

exports.default = Button;

},{"./ClickableComponent":9}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _Component2 = require('./Component');

var _Component3 = _interopRequireDefault(_Component2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ClickableComponent = function (_Component) {
    _inherits(ClickableComponent, _Component);

    function ClickableComponent(player) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, ClickableComponent);

        var _this = _possibleConstructorReturn(this, (ClickableComponent.__proto__ || Object.getPrototypeOf(ClickableComponent)).call(this, player, options));

        _this.on("click", _this.handleClick.bind(_this));
        _this.addListener("tap", _this.handleClick.bind(_this));
        return _this;
    }

    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object.
     */


    _createClass(ClickableComponent, [{
        key: 'buildCSSClass',
        value: function buildCSSClass() {
            return 'vjs-control vjs-button ' + _get(ClickableComponent.prototype.__proto__ || Object.getPrototypeOf(ClickableComponent.prototype), 'buildCSSClass', this).call(this);
        }
    }, {
        key: 'handleClick',
        value: function handleClick(event) {
            this.trigger("click");
        }
    }]);

    return ClickableComponent;
}(_Component3.default);

exports.default = ClickableComponent;

},{"./Component":10}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _wolfy87Eventemitter = require('wolfy87-eventemitter');

var _wolfy87Eventemitter2 = _interopRequireDefault(_wolfy87Eventemitter);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // @ flow

/**
 * base Component layer, which will be use when videojs is not supported environment.
 */
var Component = function (_EventEmitter) {
    _inherits(Component, _EventEmitter);

    function Component(player) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var renderElement = arguments[2];
        var ready = arguments[3];

        _classCallCheck(this, Component);

        var _this = _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).call(this));

        _this._player = player;
        // Make a copy of prototype.options_ to protect against overriding defaults
        _this._options = (0, _utils.mergeOptions)({}, _this._options);
        // Updated options with supplied options
        _this._options = (0, _utils.mergeOptions)(_this._options, options);

        _this._renderElement = renderElement;

        // Get ID from options or options element if one is supplied
        _this._id = options.id || options.el && options.el.id;

        _this._el = options.el ? options.el : _this.createEl();

        _this.emitTapEvents();

        _this._children = [];

        if (ready) {
            ready.call(_this);
        }
        return _this;
    }

    _createClass(Component, [{
        key: 'dispose',
        value: function dispose() {
            for (var i = 0; i < this._children.length; i++) {
                this._children[i].component.dispose();
            }

            if (this._el) {
                if (this._el.parentNode) {
                    this._el.parentNode.removeChild(this._el);
                }

                this._el = null;
            }
        }

        /**
         * Emit a 'tap' events when touch event support gets detected. This gets used to
         * support toggling the controls through a tap on the video. They get enabled
         * because every sub-component would have extra overhead otherwise.
         * */

    }, {
        key: 'emitTapEvents',
        value: function emitTapEvents() {
            var _this2 = this;

            // Track the start time so we can determine how long the touch lasted
            var touchStart = 0;
            var firstTouch = null;

            // Maximum movement allowed during a touch event to still be considered a tap
            // Other popular libs use anywhere from 2 (hammer.js) to 15,
            // so 10 seems like a nice, round number.
            var tapMovementThreshold = 10;

            // The maximum length a touch can be while still being considered a tap
            var touchTimeThreshold = 200;

            var couldBeTap = void 0;

            this.on('touchstart', function (event) {
                // If more than one finger, don't consider treating this as a click
                if (event.touches.length === 1) {
                    // Copy pageX/pageY from the object
                    firstTouch = {
                        pageX: event.touches[0].pageX,
                        pageY: event.touches[0].pageY
                    };
                    // Record start time so we can detect a tap vs. "touch and hold"
                    touchStart = new Date().getTime();
                    // Reset couldBeTap tracking
                    couldBeTap = true;
                }
            });

            this.on('touchmove', function (event) {
                // If more than one finger, don't consider treating this as a click
                if (event.touches.length > 1) {
                    couldBeTap = false;
                } else if (firstTouch) {
                    // Some devices will throw touchmoves for all but the slightest of taps.
                    // So, if we moved only a small distance, this could still be a tap
                    var xdiff = event.touches[0].pageX - firstTouch.pageX;
                    var ydiff = event.touches[0].pageY - firstTouch.pageY;
                    var touchDistance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);

                    if (touchDistance > tapMovementThreshold) {
                        couldBeTap = false;
                    }
                }
            });

            var noTap = function noTap() {
                couldBeTap = false;
            };

            this.on('touchleave', noTap);
            this.on('touchcancel', noTap);

            // When the touch ends, measure how long it took and trigger the appropriate
            // event
            this.on('touchend', function (event) {
                firstTouch = null;
                // Proceed only if the touchmove/leave/cancel event didn't happen
                if (couldBeTap === true) {
                    // Measure how long the touch lasted
                    var touchTime = new Date().getTime() - touchStart;

                    // Make sure the touch was less than the threshold to be considered a tap
                    if (touchTime < touchTimeThreshold) {
                        // Don't let browser turn this into a click
                        event.preventDefault();
                        /**
                         * Triggered when a `Component` is tapped.
                         *
                         * @event Component#tap
                         * @type {EventTarget~Event}
                         */
                        _this2.trigger('tap');
                        // It may be good to copy the touchend event object and change the
                        // type to tap, if the other event properties aren't exact after
                        // Events.fixEvent runs (e.g. event.target)
                    }
                }
            });
        }
    }, {
        key: 'createEl',
        value: function createEl() {
            var tagName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "div";
            var properties = arguments[1];
            var attributes = arguments[2];

            var el = document.createElement(tagName);
            el.className = this.buildCSSClass();

            for (var attribute in attributes) {
                if (attributes.hasOwnProperty(attribute)) {
                    var value = attributes[attribute];
                    el.setAttribute(attribute, value);
                }
            }
            return el;
        }
    }, {
        key: 'el',
        value: function el() {
            return this._el;
        }

        /**
         * Builds the default DOM class name. Should be overriden by sub-components.
         *
         * @return {string}
         *         The DOM class name for this object.
         *
         * @abstract
         */

    }, {
        key: 'buildCSSClass',
        value: function buildCSSClass() {
            // Child classes can include a function that does:
            // return 'CLASS NAME' + this._super();
            return '';
        }
    }, {
        key: 'on',
        value: function on(name, action) {
            this.el().addEventListener(name, action);
        }
    }, {
        key: 'off',
        value: function off(name, action) {
            this.el().removeEventListener(name, action);
        }
    }, {
        key: 'one',
        value: function one(name, action) {
            var _this3 = this;

            var _oneTimeFunction = void 0;
            this.on(name, _oneTimeFunction = function oneTimeFunction() {
                action();
                _this3.off(name, _oneTimeFunction);
            });
        }

        //Do nothing by default

    }, {
        key: 'handleResize',
        value: function handleResize() {}
    }, {
        key: 'addClass',
        value: function addClass(name) {
            this.el().classList.add(name);
        }
    }, {
        key: 'removeClass',
        value: function removeClass(name) {
            this.el().classList.remove(name);
        }
    }, {
        key: 'toggleClass',
        value: function toggleClass(name) {
            this.el().classList.toggle(name);
        }
    }, {
        key: 'show',
        value: function show() {
            this.el().style.display = "block";
        }
    }, {
        key: 'hide',
        value: function hide() {
            this.el().style.display = "none";
        }
    }, {
        key: 'addChild',
        value: function addChild(name, component, index) {
            var location = this.el();
            if (!index) {
                index = -1;
            }

            if (typeof component.el === "function" && component.el()) {
                if (index === -1) {
                    location.appendChild(component.el());
                } else {
                    var children = location.childNodes;
                    var child = children[index];
                    location.insertBefore(component.el(), child);
                }
            }

            this._children.push({
                name: name,
                component: component,
                location: location
            });
        }
    }, {
        key: 'removeChild',
        value: function removeChild(name) {
            this._children = this._children.reduce(function (acc, component) {
                if (component.name !== name) {
                    acc.push(component);
                } else {
                    component.component.dispose();
                }
                return acc;
            }, []);
        }
    }, {
        key: 'getChild',
        value: function getChild(name) {
            var component = void 0;
            for (var i = 0; i < this._children.length; i++) {
                if (this._children[i].name === name) {
                    component = this._children[i];
                    break;
                }
            }
            return component ? component.component : null;
        }
    }, {
        key: 'player',
        get: function get() {
            return this._player;
        }
    }, {
        key: 'options',
        get: function get() {
            return this._options;
        }
    }]);

    return Component;
}(_wolfy87Eventemitter2.default);

exports.default = Component;

},{"../utils":36,"wolfy87-eventemitter":5}],11:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _TwoDVideo2 = require('./TwoDVideo');

var _TwoDVideo3 = _interopRequireDefault(_TwoDVideo2);

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DualFisheye = function (_TwoDVideo) {
    _inherits(DualFisheye, _TwoDVideo);

    function DualFisheye(player, options, renderElement) {
        _classCallCheck(this, DualFisheye);

        var _this = _possibleConstructorReturn(this, (DualFisheye.__proto__ || Object.getPrototypeOf(DualFisheye)).call(this, player, options, renderElement));

        var geometry = new _three2.default.SphereBufferGeometry(500, 60, 40).toNonIndexed();
        var normals = geometry.attributes.normal.array;
        var uvs = geometry.attributes.uv.array;
        var l = normals.length / 3;
        for (var i = 0; i < l / 2; i++) {
            var x = normals[i * 3 + 0];
            var y = normals[i * 3 + 1];
            var z = normals[i * 3 + 2];

            var r = x == 0 && z == 0 ? 1 : Math.acos(y) / Math.sqrt(x * x + z * z) * (2 / Math.PI);
            uvs[i * 2 + 0] = x * _this.options.dualFish.circle1.rx * r * _this.options.dualFish.circle1.coverX + _this.options.dualFish.circle1.x;
            uvs[i * 2 + 1] = z * _this.options.dualFish.circle1.ry * r * _this.options.dualFish.circle1.coverY + _this.options.dualFish.circle1.y;
        }
        for (var _i = l / 2; _i < l; _i++) {
            var _x = normals[_i * 3 + 0];
            var _y = normals[_i * 3 + 1];
            var _z = normals[_i * 3 + 2];

            var _r = _x == 0 && _z == 0 ? 1 : Math.acos(-_y) / Math.sqrt(_x * _x + _z * _z) * (2 / Math.PI);
            uvs[_i * 2 + 0] = -_x * _this.options.dualFish.circle2.rx * _r * _this.options.dualFish.circle2.coverX + _this.options.dualFish.circle2.x;
            uvs[_i * 2 + 1] = _z * _this.options.dualFish.circle2.ry * _r * _this.options.dualFish.circle2.coverY + _this.options.dualFish.circle2.y;
        }
        geometry.rotateX(_this.options.Sphere.rotateX);
        geometry.rotateY(_this.options.Sphere.rotateY);
        geometry.rotateZ(_this.options.Sphere.rotateZ);
        geometry.scale(-1, 1, 1);

        //define mesh
        _this._mesh = new _three2.default.Mesh(geometry, new _three2.default.MeshBasicMaterial({ map: _this._texture }));
        _this._scene.add(_this._mesh);
        return _this;
    }

    return DualFisheye;
}(_TwoDVideo3.default);

exports.default = DualFisheye;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./TwoDVideo":21}],12:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _TwoDVideo2 = require('./TwoDVideo');

var _TwoDVideo3 = _interopRequireDefault(_TwoDVideo2);

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaults = {
    SphericalSegment: {
        start: 0,
        length: 1
    }
};

var Equirectangular = function (_TwoDVideo) {
    _inherits(Equirectangular, _TwoDVideo);

    function Equirectangular(player, options, renderElement) {
        _classCallCheck(this, Equirectangular);

        var _this = _possibleConstructorReturn(this, (Equirectangular.__proto__ || Object.getPrototypeOf(Equirectangular)).call(this, player, options, renderElement));

        _this._options = (0, _utils.mergeOptions)({}, defaults, options);

        var geometry = new _three2.default.SphereGeometry(500, 60, 40, 0, Math.PI * 2, Math.PI * _this.options.SphericalSegment.start, Math.PI * _this.options.SphericalSegment.length);
        geometry.scale(-1, 1, 1);
        //define mesh
        _this._mesh = new _three2.default.Mesh(geometry, new _three2.default.MeshBasicMaterial({ map: _this._texture }));
        _this._scene.add(_this._mesh);
        return _this;
    }

    return Equirectangular;
}(_TwoDVideo3.default);

exports.default = Equirectangular;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../utils":36,"./TwoDVideo":21}],13:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _TwoDVideo2 = require('./TwoDVideo');

var _TwoDVideo3 = _interopRequireDefault(_TwoDVideo2);

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Fisheye = function (_TwoDVideo) {
    _inherits(Fisheye, _TwoDVideo);

    function Fisheye(player, options, renderElement) {
        _classCallCheck(this, Fisheye);

        var _this = _possibleConstructorReturn(this, (Fisheye.__proto__ || Object.getPrototypeOf(Fisheye)).call(this, player, options, renderElement));

        var geometry = new _three2.default.SphereBufferGeometry(500, 60, 40).toNonIndexed();
        var normals = geometry.attributes.normal.array;
        var uvs = geometry.attributes.uv.array;
        for (var i = 0, l = normals.length / 3; i < l; i++) {
            var x = normals[i * 3 + 0];
            var y = normals[i * 3 + 1];
            var z = normals[i * 3 + 2];

            var r = Math.asin(Math.sqrt(x * x + z * z) / Math.sqrt(x * x + y * y + z * z)) / Math.PI;
            if (y < 0) r = 1 - r;
            var theta = x === 0 && z === 0 ? 0 : Math.acos(x / Math.sqrt(x * x + z * z));
            if (z < 0) theta = theta * -1;
            uvs[i * 2 + 0] = -0.8 * r * Math.cos(theta) + 0.5;
            uvs[i * 2 + 1] = 0.8 * r * Math.sin(theta) + 0.5;
        }
        geometry.rotateX(_this.options.Sphere.rotateX);
        geometry.rotateY(_this.options.Sphere.rotateY);
        geometry.rotateZ(_this.options.Sphere.rotateZ);
        geometry.scale(-1, 1, 1);
        //define mesh
        _this._mesh = new _three2.default.Mesh(geometry, new _three2.default.MeshBasicMaterial({ map: _this._texture }));
        _this._scene.add(_this._mesh);
        return _this;
    }

    return Fisheye;
}(_TwoDVideo3.default);

exports.default = Fisheye;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./TwoDVideo":21}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Component2 = require('./Component');

var _Component3 = _interopRequireDefault(_Component2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HelperCanvas = function (_Component) {
    _inherits(HelperCanvas, _Component);

    function HelperCanvas(player) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, HelperCanvas);

        var element = document.createElement('canvas');
        element.className = "vjs-panorama-video-helper-canvas";
        options.el = element;

        var _this = _possibleConstructorReturn(this, (HelperCanvas.__proto__ || Object.getPrototypeOf(HelperCanvas)).call(this, player, options));

        _this._videoElement = player.getVideoEl();
        _this._width = _this._videoElement.offsetWidth;
        _this._height = _this._videoElement.offsetHeight;

        _this.updateDimention();
        element.style.display = "none";

        _this._context = element.getContext('2d');
        _this._context.drawImage(_this._videoElement, 0, 0, _this._width, _this._height);
        /**
         * Get actual video dimension after video load.
         */
        player.one("loadedmetadata", function () {
            _this._width = _this._videoElement.videoWidth;
            _this._height = _this._videoElement.videoHeight;
            _this.updateDimention();
            _this.render();
        });
        return _this;
    }

    _createClass(HelperCanvas, [{
        key: 'updateDimention',
        value: function updateDimention() {
            this.el().width = this._width;
            this.el().height = this._height;
        }
    }, {
        key: 'el',
        value: function el() {
            return this._el;
        }
    }, {
        key: 'render',
        value: function render() {
            this._context.drawImage(this._videoElement, 0, 0, this._width, this._height);
        }
    }]);

    return HelperCanvas;
}(_Component3.default);

exports.default = HelperCanvas;

},{"./Component":10}],15:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

var _Component2 = require('./Component');

var _Component3 = _interopRequireDefault(_Component2);

var _BaseCanvas = require('./BaseCanvas');

var _BaseCanvas2 = _interopRequireDefault(_BaseCanvas);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaults = {
    keyPoint: -1,
    duration: -1
};

var Marker = function (_Component) {
    _inherits(Marker, _Component);

    function Marker(player, options) {
        _classCallCheck(this, Marker);

        var el = void 0;

        var elem = options.element;
        if (typeof elem === "string") {
            el = document.createElement('div');
            el.innerText = elem;
        } else {
            el = elem.cloneNode(true);
        }
        el.id = options.id || "";
        el.className = "vjs-marker";

        options.el = el;

        var _this = _possibleConstructorReturn(this, (Marker.__proto__ || Object.getPrototypeOf(Marker)).call(this, player, options));

        _this._options = (0, _utils.mergeOptions)({}, defaults, options);

        var phi = _three2.default.Math.degToRad(90 - options.location.lat);
        var theta = _three2.default.Math.degToRad(options.location.lon);
        _this._position = new _three2.default.Vector3(options.radius * Math.sin(phi) * Math.cos(theta), options.radius * Math.cos(phi), options.radius * Math.sin(phi) * Math.sin(theta));
        if (_this.options.keyPoint < 0) {
            _this.enableMarker();
        }
        return _this;
    }

    _createClass(Marker, [{
        key: 'enableMarker',
        value: function enableMarker() {
            this._enable = true;
            this.addClass("vjs-marker--enable");
            if (this.options.onShow) {
                this.options.onShow.call(null);
            }
        }
    }, {
        key: 'disableMarker',
        value: function disableMarker() {
            this._enable = false;
            this.removeClass("vjs-marker--enable");
            if (this.options.onHide) {
                this.options.onHide.call(null);
            }
        }
    }, {
        key: 'render',
        value: function render(canvas, camera) {
            var angle = this._position.angleTo(camera.target);
            if (angle > Math.PI * 0.4) {
                this.addClass("vjs-marker--backside");
            } else {
                this.removeClass("vjs-marker--backside");
                var vector = this._position.clone().project(camera);
                var width = canvas.VRMode ? canvas._width / 2 : canvas._width;
                var point = {
                    x: (vector.x + 1) / 2 * width,
                    y: -(vector.y - 1) / 2 * canvas._height
                };
                this.el().style.transform = 'translate(' + point.x + 'px, ' + point.y + 'px)';
            }
        }
    }, {
        key: 'enable',
        get: function get() {
            return this._enable;
        }
    }, {
        key: 'position',
        get: function get() {
            return this._position;
        }
    }]);

    return Marker;
}(_Component3.default);

exports.default = Marker;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../utils":36,"./BaseCanvas":7,"./Component":10}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _BaseCanvas = require('./BaseCanvas');

var _BaseCanvas2 = _interopRequireDefault(_BaseCanvas);

var _Component2 = require('./Component');

var _Component3 = _interopRequireDefault(_Component2);

var _MarkerGroup = require('./MarkerGroup');

var _MarkerGroup2 = _interopRequireDefault(_MarkerGroup);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MarkerContainer = function (_Component) {
    _inherits(MarkerContainer, _Component);

    function MarkerContainer(player, options) {
        _classCallCheck(this, MarkerContainer);

        var _this = _possibleConstructorReturn(this, (MarkerContainer.__proto__ || Object.getPrototypeOf(MarkerContainer)).call(this, player, options));

        _this.el().classList.add("vjs-marker-container");
        _this._canvas = _this.options.canvas;

        if (_this.options.VREnable) {
            var leftMarkerGroup = new _MarkerGroup2.default(_this.player, {
                id: "left_group",
                canvas: _this._canvas,
                markers: _this.options.markers,
                camera: _this._canvas._camera
            });

            var markersSettings = _this.options.markers.map(function (marker) {
                var newMarker = (0, _utils.mergeOptions)({}, marker);
                newMarker.onShow = undefined;
                newMarker.onHide = undefined;
                return newMarker;
            });
            var rightMarkerGroup = new _MarkerGroup2.default(_this.player, {
                id: "right_group",
                canvas: _this._canvas,
                markers: markersSettings,
                camera: _this._canvas._camera
            });
            _this.addChild("leftMarkerGroup", leftMarkerGroup);
            _this.addChild("rightMarkerGroup", rightMarkerGroup);

            leftMarkerGroup.attachEvents();
            if (_this._canvas.VRMode) {
                rightMarkerGroup.attachEvents();
            }

            _this.player.on("VRModeOn", function () {
                _this.el().classList.add("vjs-marker-container--VREnable");
                leftMarkerGroup.camera = _this._canvas._cameraL;
                rightMarkerGroup.camera = _this._canvas._cameraR;
                rightMarkerGroup.attachEvents();
            });

            _this.player.on("VRModeOff", function () {
                _this.el().classList.remove("vjs-marker-container--VREnable");
                leftMarkerGroup.camera = _this._canvas._camera;
                rightMarkerGroup.detachEvents();
            });
        } else {
            var markerGroup = new _MarkerGroup2.default(_this.player, {
                id: "group",
                canvas: _this._canvas,
                markers: _this.options.markers,
                camera: _this._canvas._camera
            });
            _this.addChild("markerGroup", markerGroup);
            markerGroup.attachEvents();
        }
        return _this;
    }

    return MarkerContainer;
}(_Component3.default);

exports.default = MarkerContainer;

},{"../utils":36,"./BaseCanvas":7,"./Component":10,"./MarkerGroup":17}],17:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

var _Component2 = require('./Component');

var _Component3 = _interopRequireDefault(_Component2);

var _BaseCanvas = require('./BaseCanvas');

var _BaseCanvas2 = _interopRequireDefault(_BaseCanvas);

var _Marker = require('./Marker');

var _Marker2 = _interopRequireDefault(_Marker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MarkerGroup = function (_Component) {
    _inherits(MarkerGroup, _Component);

    //save total markers enable to generate marker id
    function MarkerGroup(player, options) {
        _classCallCheck(this, MarkerGroup);

        var _this = _possibleConstructorReturn(this, (MarkerGroup.__proto__ || Object.getPrototypeOf(MarkerGroup)).call(this, player, options));

        _this._totalMarkers = 0;
        _this._markers = [];
        _this._camera = options.camera;
        _this.el().classList.add("vjs-marker-group");
        _this._canvas = options.canvas;

        _this.options.markers.forEach(function (markSetting) {
            _this.addMarker(markSetting);
        });

        _this.renderMarkers();
        return _this;
    }

    _createClass(MarkerGroup, [{
        key: 'attachEvents',
        value: function attachEvents() {
            this.el().classList.add("vjs-marker-group--enable");
            this.player.on("timeupdate", this.updateMarkers.bind(this));
            this._canvas.addListener("render", this.renderMarkers.bind(this));
        }
    }, {
        key: 'detachEvents',
        value: function detachEvents() {
            this.el().classList.remove("vjs-marker-group--enable");
            this.player.off("timeupdate", this.updateMarkers.bind(this));
            this._canvas.removeListener("render", this.renderMarkers.bind(this));
        }
    }, {
        key: 'addMarker',
        value: function addMarker(markSetting) {
            this._totalMarkers++;
            markSetting.id = this.options.id + '_' + (markSetting.id ? markSetting.id : 'marker_' + this._totalMarkers);
            var marker = new _Marker2.default(this.player, markSetting);
            this.addChild(markSetting.id, marker);
            this._markers.push(marker);
            return marker;
        }
    }, {
        key: 'removeMarker',
        value: function removeMarker(markerId) {
            this.removeChild(markerId);
        }
    }, {
        key: 'updateMarkers',
        value: function updateMarkers() {
            var currentTime = this.player.getVideoEl().currentTime * 1000;
            this._markers.forEach(function (marker) {
                //only check keypoint greater and equal zero
                if (marker.options.keyPoint >= 0) {
                    if (marker.options.duration > 0) {
                        marker.options.keyPoint <= currentTime && currentTime < marker.options.keyPoint + marker.options.duration ? !marker.enable && marker.enableMarker() : marker.enable && marker.disableMarker();
                    } else {
                        marker.options.keyPoint <= currentTime ? !marker.enable && marker.enableMarker() : marker.enable && marker.disableMarker();
                    }
                }
            });
        }
    }, {
        key: 'renderMarkers',
        value: function renderMarkers() {
            var _this2 = this;

            this._markers.forEach(function (marker) {
                if (marker.enable) {
                    marker.render(_this2._canvas, _this2._camera);
                }
            });
        }
    }, {
        key: 'camera',
        set: function set(camera) {
            this._camera = camera;
        }
    }]);

    return MarkerGroup;
}(_Component3.default);

exports.default = MarkerGroup;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./BaseCanvas":7,"./Component":10,"./Marker":15}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Component2 = require('./Component');

var _Component3 = _interopRequireDefault(_Component2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Notification = function (_Component) {
    _inherits(Notification, _Component);

    function Notification(player, options) {
        _classCallCheck(this, Notification);

        var el = void 0;

        var message = options.Message;
        if (typeof message === 'string') {
            el = document.createElement('div');
            el.className = "vjs-video-notice-label vjs-video-notice-show";
            el.innerText = message;
        } else {
            el = message.cloneNode(true);
            el.classList.add("vjs-video-notice-show");
        }

        options.el = el;

        return _possibleConstructorReturn(this, (Notification.__proto__ || Object.getPrototypeOf(Notification)).call(this, player, options));
    }

    return Notification;
}(_Component3.default);

exports.default = Notification;

},{"./Component":10}],19:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _BaseCanvas2 = require('./BaseCanvas');

var _BaseCanvas3 = _interopRequireDefault(_BaseCanvas2);

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ThreeDVideo = function (_BaseCanvas) {
    _inherits(ThreeDVideo, _BaseCanvas);

    function ThreeDVideo(player, options, renderElement) {
        _classCallCheck(this, ThreeDVideo);

        //only show left part by default
        var _this = _possibleConstructorReturn(this, (ThreeDVideo.__proto__ || Object.getPrototypeOf(ThreeDVideo)).call(this, player, options, renderElement));

        _this._scene = new _three2.default.Scene();

        var aspectRatio = _this._width / _this._height;
        //define camera
        _this._cameraL = new _three2.default.PerspectiveCamera(_this.options.initFov, aspectRatio, 1, 2000);
        _this._cameraL.target = new _three2.default.Vector3(0, 0, 0);

        _this._cameraR = new _three2.default.PerspectiveCamera(_this.options.initFov, aspectRatio / 2, 1, 2000);
        _this._cameraR.position.set(1000, 0, 0);
        _this._cameraR.target = new _three2.default.Vector3(1000, 0, 0);
        return _this;
    }

    _createClass(ThreeDVideo, [{
        key: 'handleResize',
        value: function handleResize() {
            _get(ThreeDVideo.prototype.__proto__ || Object.getPrototypeOf(ThreeDVideo.prototype), 'handleResize', this).call(this);

            var aspectRatio = this._width / this._height;
            if (!this.VRMode) {
                this._cameraL.aspect = aspectRatio;
                this._cameraL.updateProjectionMatrix();
            } else {
                aspectRatio /= 2;
                this._cameraL.aspect = aspectRatio;
                this._cameraR.aspect = aspectRatio;
                this._cameraL.updateProjectionMatrix();
                this._cameraR.updateProjectionMatrix();
            }
        }
    }, {
        key: 'handleMouseWheel',
        value: function handleMouseWheel(event) {
            _get(ThreeDVideo.prototype.__proto__ || Object.getPrototypeOf(ThreeDVideo.prototype), 'handleMouseWheel', this).call(this, event);

            // WebKit
            if (event.wheelDeltaY) {
                this._cameraL.fov -= event.wheelDeltaY * 0.05;
                // Opera / Explorer 9
            } else if (event.wheelDelta) {
                this._cameraL.fov -= event.wheelDelta * 0.05;
                // Firefox
            } else if (event.detail) {
                this._cameraL.fov += event.detail * 1.0;
            }
            this._cameraL.fov = Math.min(this.options.maxFov, this._cameraL.fov);
            this._cameraL.fov = Math.max(this.options.minFov, this._cameraL.fov);
            this._cameraL.updateProjectionMatrix();
            if (this.VRMode) {
                this._cameraR.fov = this._cameraL.fov;
                this._cameraR.updateProjectionMatrix();
            }
        }
    }, {
        key: 'enableVR',
        value: function enableVR() {
            _get(ThreeDVideo.prototype.__proto__ || Object.getPrototypeOf(ThreeDVideo.prototype), 'enableVR', this).call(this);
            this._scene.add(this._meshR);
            this.handleResize();
        }
    }, {
        key: 'disableVR',
        value: function disableVR() {
            _get(ThreeDVideo.prototype.__proto__ || Object.getPrototypeOf(ThreeDVideo.prototype), 'disableVR', this).call(this);
            this._scene.remove(this._meshR);
            this.handleResize();
        }
    }, {
        key: 'render',
        value: function render() {
            _get(ThreeDVideo.prototype.__proto__ || Object.getPrototypeOf(ThreeDVideo.prototype), 'render', this).call(this);

            this._cameraL.target.x = 500 * Math.sin(this._phi) * Math.cos(this._theta);
            this._cameraL.target.y = 500 * Math.cos(this._phi);
            this._cameraL.target.z = 500 * Math.sin(this._phi) * Math.sin(this._theta);
            this._cameraL.lookAt(this._cameraL.target);

            if (this.VRMode) {
                var viewPortWidth = this._width / 2,
                    viewPortHeight = this._height;
                this._cameraR.target.x = 1000 + 500 * Math.sin(this._phi) * Math.cos(this._theta);
                this._cameraR.target.y = 500 * Math.cos(this._phi);
                this._cameraR.target.z = 500 * Math.sin(this._phi) * Math.sin(this._theta);
                this._cameraR.lookAt(this._cameraR.target);

                // render left eye
                this._renderer.setViewport(0, 0, viewPortWidth, viewPortHeight);
                this._renderer.setScissor(0, 0, viewPortWidth, viewPortHeight);
                this._renderer.render(this._scene, this._cameraL);

                // render right eye
                this._renderer.setViewport(viewPortWidth, 0, viewPortWidth, viewPortHeight);
                this._renderer.setScissor(viewPortWidth, 0, viewPortWidth, viewPortHeight);
                this._renderer.render(this._scene, this._cameraR);
            } else {
                this._renderer.render(this._scene, this._cameraL);
            }
        }
    }]);

    return ThreeDVideo;
}(_BaseCanvas3.default);

exports.default = ThreeDVideo;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./BaseCanvas":7}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Component2 = require('./Component');

var _Component3 = _interopRequireDefault(_Component2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Thumbnail = function (_Component) {
    _inherits(Thumbnail, _Component);

    function Thumbnail(player, options) {
        _classCallCheck(this, Thumbnail);

        var el = void 0;

        el = document.createElement('img');
        el.src = options.posterSrc;

        options.el = el;

        var _this = _possibleConstructorReturn(this, (Thumbnail.__proto__ || Object.getPrototypeOf(Thumbnail)).call(this, player, options));

        _this.one('load', function () {
            if (options.onComplete) {
                options.onComplete();
            }
        });
        return _this;
    }

    return Thumbnail;
}(_Component3.default);

exports.default = Thumbnail;

},{"./Component":10}],21:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _BaseCanvas2 = require('./BaseCanvas');

var _BaseCanvas3 = _interopRequireDefault(_BaseCanvas2);

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TwoDVideo = function (_BaseCanvas) {
    _inherits(TwoDVideo, _BaseCanvas);

    function TwoDVideo(player, options, renderElement) {
        _classCallCheck(this, TwoDVideo);

        //define scene
        var _this = _possibleConstructorReturn(this, (TwoDVideo.__proto__ || Object.getPrototypeOf(TwoDVideo)).call(this, player, options, renderElement));

        _this._scene = new _three2.default.Scene();
        //define camera
        _this._camera = new _three2.default.PerspectiveCamera(_this.options.initFov, _this._width / _this._height, 1, 2000);
        _this._camera.target = new _three2.default.Vector3(0, 0, 0);
        return _this;
    }

    _createClass(TwoDVideo, [{
        key: 'enableVR',
        value: function enableVR() {
            _get(TwoDVideo.prototype.__proto__ || Object.getPrototypeOf(TwoDVideo.prototype), 'enableVR', this).call(this);

            if (typeof window.vrHMD !== 'undefined') {
                var eyeParamsL = window.vrHMD.getEyeParameters('left');
                var eyeParamsR = window.vrHMD.getEyeParameters('right');

                this._eyeFOVL = eyeParamsL.recommendedFieldOfView;
                this._eyeFOVR = eyeParamsR.recommendedFieldOfView;
            }

            this._cameraL = new _three2.default.PerspectiveCamera(this._camera.fov, this._width / 2 / this._height, 1, 2000);
            this._cameraR = new _three2.default.PerspectiveCamera(this._camera.fov, this._width / 2 / this._height, 1, 2000);
            this._cameraL.target = new _three2.default.Vector3(0, 0, 0);
            this._cameraR.target = new _three2.default.Vector3(0, 0, 0);
        }
    }, {
        key: 'disableVR',
        value: function disableVR() {
            _get(TwoDVideo.prototype.__proto__ || Object.getPrototypeOf(TwoDVideo.prototype), 'disableVR', this).call(this);
            this._renderer.setViewport(0, 0, this._width, this._height);
            this._renderer.setScissor(0, 0, this._width, this._height);
        }
    }, {
        key: 'handleResize',
        value: function handleResize() {
            _get(TwoDVideo.prototype.__proto__ || Object.getPrototypeOf(TwoDVideo.prototype), 'handleResize', this).call(this);
            this._camera.aspect = this._width / this._height;
            this._camera.updateProjectionMatrix();
            if (this.VRMode) {
                this._cameraL.aspect = this._camera.aspect / 2;
                this._cameraR.aspect = this._camera.aspect / 2;
                this._cameraL.updateProjectionMatrix();
                this._cameraR.updateProjectionMatrix();
            }
        }
    }, {
        key: 'handleMouseWheel',
        value: function handleMouseWheel(event) {
            _get(TwoDVideo.prototype.__proto__ || Object.getPrototypeOf(TwoDVideo.prototype), 'handleMouseWheel', this).call(this, event);

            // WebKit
            if (event.wheelDeltaY) {
                this._camera.fov -= event.wheelDeltaY * 0.05;
                // Opera / Explorer 9
            } else if (event.wheelDelta) {
                this._camera.fov -= event.wheelDelta * 0.05;
                // Firefox
            } else if (event.detail) {
                this._camera.fov += event.detail * 1.0;
            }
            this._camera.fov = Math.min(this.options.maxFov, this._camera.fov);
            this._camera.fov = Math.max(this.options.minFov, this._camera.fov);
            this._camera.updateProjectionMatrix();
            if (this.VRMode) {
                this._cameraL.fov = this._camera.fov;
                this._cameraR.fov = this._camera.fov;
                this._cameraL.updateProjectionMatrix();
                this._cameraR.updateProjectionMatrix();
            }
        }
    }, {
        key: 'handleTouchMove',
        value: function handleTouchMove(event) {
            _get(TwoDVideo.prototype.__proto__ || Object.getPrototypeOf(TwoDVideo.prototype), 'handleTouchMove', this).call(this, event);

            if (this._isUserPinch) {
                var currentDistance = (0, _utils.getTouchesDistance)(event.touches);
                event.wheelDeltaY = (currentDistance - this._multiTouchDistance) * 2;
                this.handleMouseWheel(event);
                this._multiTouchDistance = currentDistance;
            }
        }
    }, {
        key: 'render',
        value: function render() {
            _get(TwoDVideo.prototype.__proto__ || Object.getPrototypeOf(TwoDVideo.prototype), 'render', this).call(this);

            this._camera.target.x = 500 * Math.sin(this._phi) * Math.cos(this._theta);
            this._camera.target.y = 500 * Math.cos(this._phi);
            this._camera.target.z = 500 * Math.sin(this._phi) * Math.sin(this._theta);
            this._camera.lookAt(this._camera.target);

            if (!this.VRMode) {
                this._renderer.render(this._scene, this._camera);
            } else {
                var viewPortWidth = this._width / 2,
                    viewPortHeight = this._height;
                if (typeof window.vrHMD !== 'undefined') {
                    this._cameraL.projectionMatrix = (0, _utils.fovToProjection)(this._eyeFOVL, true, this._camera.near, this._camera.far);
                    this._cameraR.projectionMatrix = (0, _utils.fovToProjection)(this._eyeFOVR, true, this._camera.near, this._camera.far);
                } else {
                    var lonL = this._lon + this.options.VRGapDegree;
                    var lonR = this._lon - this.options.VRGapDegree;

                    var thetaL = _three2.default.Math.degToRad(lonL);
                    var thetaR = _three2.default.Math.degToRad(lonR);

                    this._cameraL.target.x = 500 * Math.sin(this._phi) * Math.cos(thetaL);
                    this._cameraL.target.y = this._camera.target.y;
                    this._cameraL.target.z = 500 * Math.sin(this._phi) * Math.sin(thetaL);
                    this._cameraL.lookAt(this._cameraL.target);

                    this._cameraR.target.x = 500 * Math.sin(this._phi) * Math.cos(thetaR);
                    this._cameraR.target.y = this._camera.target.y;
                    this._cameraR.target.z = 500 * Math.sin(this._phi) * Math.sin(thetaR);
                    this._cameraR.lookAt(this._cameraR.target);
                }
                // render left eye
                this._renderer.setViewport(0, 0, viewPortWidth, viewPortHeight);
                this._renderer.setScissor(0, 0, viewPortWidth, viewPortHeight);
                this._renderer.render(this._scene, this._cameraL);

                // render right eye
                this._renderer.setViewport(viewPortWidth, 0, viewPortWidth, viewPortHeight);
                this._renderer.setScissor(viewPortWidth, 0, viewPortWidth, viewPortHeight);
                this._renderer.render(this._scene, this._cameraR);
            }
        }
    }]);

    return TwoDVideo;
}(_BaseCanvas3.default);

exports.default = TwoDVideo;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../utils":36,"./BaseCanvas":7}],22:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ThreeDVideo2 = require('./ThreeDVideo');

var _ThreeDVideo3 = _interopRequireDefault(_ThreeDVideo2);

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VR1803D = function (_ThreeDVideo) {
    _inherits(VR1803D, _ThreeDVideo);

    function VR1803D(player, options, renderElement) {
        _classCallCheck(this, VR1803D);

        var _this = _possibleConstructorReturn(this, (VR1803D.__proto__ || Object.getPrototypeOf(VR1803D)).call(this, player, options, renderElement));

        var geometryL = new _three2.default.SphereBufferGeometry(500, 60, 40, 0, Math.PI).toNonIndexed();
        var geometryR = new _three2.default.SphereBufferGeometry(500, 60, 40, 0, Math.PI).toNonIndexed();

        var uvsL = geometryL.attributes.uv.array;
        var normalsL = geometryL.attributes.normal.array;
        for (var i = 0; i < normalsL.length / 3; i++) {
            uvsL[i * 2] = uvsL[i * 2] / 2;
        }

        var uvsR = geometryR.attributes.uv.array;
        var normalsR = geometryR.attributes.normal.array;
        for (var _i = 0; _i < normalsR.length / 3; _i++) {
            uvsR[_i * 2] = uvsR[_i * 2] / 2 + 0.5;
        }

        geometryL.scale(-1, 1, 1);
        geometryR.scale(-1, 1, 1);

        _this._meshL = new _three2.default.Mesh(geometryL, new _three2.default.MeshBasicMaterial({ map: _this._texture }));

        _this._meshR = new _three2.default.Mesh(geometryR, new _three2.default.MeshBasicMaterial({ map: _this._texture }));
        _this._meshR.position.set(1000, 0, 0);

        _this._scene.add(_this._meshL);
        return _this;
    }

    return VR1803D;
}(_ThreeDVideo3.default);

exports.default = VR1803D;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./ThreeDVideo":19}],23:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ThreeDVideo2 = require('./ThreeDVideo');

var _ThreeDVideo3 = _interopRequireDefault(_ThreeDVideo2);

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VR3603D = function (_ThreeDVideo) {
    _inherits(VR3603D, _ThreeDVideo);

    function VR3603D(player, options, renderElement) {
        _classCallCheck(this, VR3603D);

        var _this = _possibleConstructorReturn(this, (VR3603D.__proto__ || Object.getPrototypeOf(VR3603D)).call(this, player, options, renderElement));

        var geometryL = new _three2.default.SphereBufferGeometry(500, 60, 40).toNonIndexed();
        var geometryR = new _three2.default.SphereBufferGeometry(500, 60, 40).toNonIndexed();

        var uvsL = geometryL.attributes.uv.array;
        var normalsL = geometryL.attributes.normal.array;
        for (var i = 0; i < normalsL.length / 3; i++) {
            uvsL[i * 2 + 1] = uvsL[i * 2 + 1] / 2;
        }

        var uvsR = geometryR.attributes.uv.array;
        var normalsR = geometryR.attributes.normal.array;
        for (var _i = 0; _i < normalsR.length / 3; _i++) {
            uvsR[_i * 2 + 1] = uvsR[_i * 2 + 1] / 2 + 0.5;
        }

        geometryL.scale(-1, 1, 1);
        geometryR.scale(-1, 1, 1);

        _this._meshL = new _three2.default.Mesh(geometryL, new _three2.default.MeshBasicMaterial({ map: _this._texture }));

        _this._meshR = new _three2.default.Mesh(geometryR, new _three2.default.MeshBasicMaterial({ map: _this._texture }));
        _this._meshR.position.set(1000, 0, 0);

        _this._scene.add(_this._meshL);
        return _this;
    }

    return VR3603D;
}(_ThreeDVideo3.default);

exports.default = VR3603D;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./ThreeDVideo":19}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _Button2 = require('./Button');

var _Button3 = _interopRequireDefault(_Button2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VRButton = function (_Button) {
    _inherits(VRButton, _Button);

    function VRButton(player) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, VRButton);

        return _possibleConstructorReturn(this, (VRButton.__proto__ || Object.getPrototypeOf(VRButton)).call(this, player, options));
    }

    _createClass(VRButton, [{
        key: 'buildCSSClass',
        value: function buildCSSClass() {
            return 'vjs-VR-control ' + _get(VRButton.prototype.__proto__ || Object.getPrototypeOf(VRButton.prototype), 'buildCSSClass', this).call(this);
        }
    }, {
        key: 'handleClick',
        value: function handleClick(event) {
            _get(VRButton.prototype.__proto__ || Object.getPrototypeOf(VRButton.prototype), 'handleClick', this).call(this, event);
            this.toggleClass("enable");

            var videoCanvas = this.player.getComponent("VideoCanvas");
            var VRMode = videoCanvas.VRMode;
            !VRMode ? videoCanvas.enableVR() : videoCanvas.disableVR();
            !VRMode ? this.player.trigger('VRModeOn') : this.player.trigger('VRModeOff');
            if (!VRMode && this.options.VRFullscreen) {
                this.player.enableFullscreen();
            }
        }
    }]);

    return VRButton;
}(_Button3.default);

exports.default = VRButton;

},{"./Button":8}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.VR180Defaults = exports.defaults = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _iphoneInlineVideo = require('iphone-inline-video');

var _iphoneInlineVideo2 = _interopRequireDefault(_iphoneInlineVideo);

var _wolfy87Eventemitter = require('wolfy87-eventemitter');

var _wolfy87Eventemitter2 = _interopRequireDefault(_wolfy87Eventemitter);

var _Equirectangular = require('./Components/Equirectangular');

var _Equirectangular2 = _interopRequireDefault(_Equirectangular);

var _Fisheye = require('./Components/Fisheye');

var _Fisheye2 = _interopRequireDefault(_Fisheye);

var _DualFisheye = require('./Components/DualFisheye');

var _DualFisheye2 = _interopRequireDefault(_DualFisheye);

var _VR3603D = require('./Components/VR3603D');

var _VR3603D2 = _interopRequireDefault(_VR3603D);

var _VR1803D = require('./Components/VR1803D');

var _VR1803D2 = _interopRequireDefault(_VR1803D);

var _Notification = require('./Components/Notification');

var _Notification2 = _interopRequireDefault(_Notification);

var _Thumbnail = require('./Components/Thumbnail');

var _Thumbnail2 = _interopRequireDefault(_Thumbnail);

var _VRButton = require('./Components/VRButton');

var _VRButton2 = _interopRequireDefault(_VRButton);

var _MarkerContainer = require('./Components/MarkerContainer');

var _MarkerContainer2 = _interopRequireDefault(_MarkerContainer);

var _Animation = require('./Components/Animation');

var _Animation2 = _interopRequireDefault(_Animation);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var runOnMobile = (0, _utils.mobileAndTabletcheck)();

var videoTypes = ["equirectangular", "fisheye", "dual_fisheye", "VR1803D", "VR3603D"];

var defaults = exports.defaults = {
    videoType: "equirectangular",
    MouseEnable: true,
    clickAndDrag: true,
    movingSpeed: {
        x: 0.0005,
        y: 0.0005
    },
    clickToToggle: true,
    scrollable: true,
    resizable: true,
    useHelperCanvas: "auto",
    initFov: 75,
    maxFov: 105,
    minFov: 51,
    //initial position for the video
    initLat: 0,
    initLon: 180,
    //A float value back to center when mouse out the canvas. The higher, the faster.
    returnLatSpeed: 0.5,
    returnLonSpeed: 2,
    backToInitLat: false,
    backToInitLon: false,

    //limit viewable zoom
    minLat: -85,
    maxLat: 85,

    minLon: 0,
    maxLon: 360,

    autoMobileOrientation: true,
    mobileVibrationValue: (0, _utils.isIos)() ? 0.022 : 1,

    VREnable: runOnMobile,
    VRGapDegree: 0.5,
    VRFullscreen: true, //auto fullscreen when in vr mode

    PanoramaThumbnail: false,
    KeyboardControl: false,
    KeyboardMovingSpeed: {
        x: 1,
        y: 1
    },

    Sphere: {
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0
    },

    dualFish: {
        width: 1920,
        height: 1080,
        circle1: {
            x: 0.240625,
            y: 0.553704,
            rx: 0.23333,
            ry: 0.43148,
            coverX: 0.913,
            coverY: 0.9
        },
        circle2: {
            x: 0.757292,
            y: 0.553704,
            rx: 0.232292,
            ry: 0.4296296,
            coverX: 0.913,
            coverY: 0.9308
        }
    },

    Notice: {
        Enable: !runOnMobile,
        Message: "Please use your mouse drag and drop the video.",
        HideTime: 3000
    },

    Markers: false,

    Animations: false
};

var VR180Defaults = exports.VR180Defaults = {
    //initial position for the video
    initLat: 0,
    initLon: 90,
    //limit viewable zoom
    minLat: -75,
    maxLat: 55,

    minLon: 50,
    maxLon: 130,

    clickAndDrag: true
};

/**
 * panorama controller class which control required components
 */

var Panorama = function (_EventEmitter) {
    _inherits(Panorama, _EventEmitter);

    _createClass(Panorama, null, [{
        key: 'checkOptions',


        /**
         * check legacy option settings and produce warning message if user use legacy options, automatically set it to new options.
         * @param options the option settings which user parse.
         * @returns {*} the latest version which we use.
         */
        value: function checkOptions(options) {
            if (options.videoType === "3dVideo") {
                (0, _utils.warning)('videoType: ' + String(options.videoType) + ' is deprecated, please use VR3603D');
                options.videoType = "VR3603D";
            } else if (options.videoType && videoTypes.indexOf(options.videoType) === -1) {
                (0, _utils.warning)('videoType: ' + String(options.videoType) + ' is not supported, set video type to ' + String(defaults.videoType) + '.');
                options.videoType = defaults.videoType;
            }

            if (typeof options.backToVerticalCenter !== "undefined") {
                (0, _utils.warning)('backToVerticalCenter is deprecated, please use backToInitLat.');
                options.backToInitLat = options.backToVerticalCenter;
            }
            if (typeof options.backToHorizonCenter !== "undefined") {
                (0, _utils.warning)('backToHorizonCenter is deprecated, please use backToInitLon.');
                options.backToInitLon = options.backToHorizonCenter;
            }
            if (typeof options.returnStepLat !== "undefined") {
                (0, _utils.warning)('returnStepLat is deprecated, please use returnLatSpeed.');
                options.returnLatSpeed = options.returnStepLat;
            }
            if (typeof options.returnStepLon !== "undefined") {
                (0, _utils.warning)('returnStepLon is deprecated, please use returnLonSpeed.');
                options.returnLonSpeed = options.returnStepLon;
            }
            if (typeof options.helperCanvas !== "undefined") {
                (0, _utils.warning)('helperCanvas is deprecated, you don\'t have to set it up on new version.');
            }
            if (typeof options.callback !== "undefined") {
                (0, _utils.warning)('callback is deprecated, please use ready.');
                options.ready = options.callback;
            }
            if (typeof options.Sphere === "undefined") {
                options.Sphere = {};
            }
            if (typeof options.rotateX !== "undefined") {
                (0, _utils.warning)('rotateX is deprecated, please use Sphere:{ rotateX: 0, rotateY: 0, rotateZ: 0}.');
                if (options.Sphere) {
                    options.Sphere.rotateX = options.rotateX;
                }
            }
            if (typeof options.rotateY !== "undefined") {
                (0, _utils.warning)('rotateY is deprecated, please use Sphere:{ rotateX: 0, rotateY: 0, rotateZ: 0}.');
                if (options.Sphere) {
                    options.Sphere.rotateY = options.rotateY;
                }
            }
            if (typeof options.rotateZ !== "undefined") {
                (0, _utils.warning)('rotateZ is deprecated, please use Sphere:{ rotateX: 0, rotateY: 0, rotateZ: 0}.');
                if (options.Sphere) {
                    options.Sphere.rotateY = options.rotateZ;
                }
            }
            if (typeof options.Notice === "undefined") {
                options.Notice = {};
            }
            if (typeof options.showNotice !== "undefined") {
                (0, _utils.warning)('showNotice is deprecated, please use Notice: { Enable: true }');
                if (options.Notice) {
                    options.Notice.Enable = options.showNotice;
                }
            }
            if (typeof options.NoticeMessage !== "undefined") {
                (0, _utils.warning)('NoticeMessage is deprecated, please use Notice: { Message: "" }');
                if (options.Notice) {
                    options.Notice.Message = options.NoticeMessage;
                }
            }
            if (typeof options.autoHideNotice !== "undefined") {
                (0, _utils.warning)('autoHideNotice is deprecated, please use Notice: { HideTime: 3000 }');
                if (options.Notice) {
                    options.Notice.HideTime = options.autoHideNotice;
                }
            }
        }
    }, {
        key: 'chooseVideoComponent',
        value: function chooseVideoComponent(videoType) {
            var VideoClass = void 0;
            switch (videoType) {
                case "equirectangular":
                    VideoClass = _Equirectangular2.default;
                    break;
                case "fisheye":
                    VideoClass = _Fisheye2.default;
                    break;
                case "dual_fisheye":
                    VideoClass = _DualFisheye2.default;
                    break;
                case "VR3603D":
                    VideoClass = _VR3603D2.default;
                    break;
                case "VR1803D":
                    VideoClass = _VR1803D2.default;
                    break;
                default:
                    VideoClass = _Equirectangular2.default;
            }
            return VideoClass;
        }
    }]);

    function Panorama(player) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Panorama);

        var _this = _possibleConstructorReturn(this, (Panorama.__proto__ || Object.getPrototypeOf(Panorama)).call(this));

        Panorama.checkOptions(options);
        if (options.videoType === "VR1803D") {
            options = (0, _utils.mergeOptions)({}, VR180Defaults, options);
        }
        _this._options = (0, _utils.mergeOptions)({}, defaults, options);
        _this._player = player;

        _this.player.addClass("vjs-panorama");

        if (!_utils.Detector.webgl) {
            _this.popupNotification((0, _utils.webGLErrorMessage)());
            return _possibleConstructorReturn(_this);
        }

        var VideoClass = Panorama.chooseVideoComponent(_this.options.videoType);
        //render 360 thumbnail
        if (_this.options.PanoramaThumbnail && player.getThumbnailURL()) {
            var thumbnailURL = player.getThumbnailURL();
            var poster = new _Thumbnail2.default(player, {
                posterSrc: thumbnailURL,
                onComplete: function onComplete() {
                    if (_this.thumbnailCanvas) {
                        _this.thumbnailCanvas._texture.needsUpdate = true;
                        _this.thumbnailCanvas.startAnimation();
                    }
                }
            });
            _this.player.addComponent("Thumbnail", poster);

            poster.el().style.display = "none";
            _this._thumbnailCanvas = new VideoClass(player, _this.options, poster.el());
            _this.player.addComponent("ThumbnailCanvas", _this.thumbnailCanvas);

            _this.player.one("play", function () {
                _this.thumbnailCanvas && _this.thumbnailCanvas.hide();
                _this.player.removeComponent("Thumbnail");
                _this.player.removeComponent("ThumbnailCanvas");
                _this._thumbnailCanvas = null;
            });
        }

        _this.player.ready(function () {
            //enable inline play on mobile
            if (runOnMobile) {
                var videoElement = _this.player.getVideoEl();
                if ((0, _utils.isRealIphone)()) {
                    //ios 10 support play video inline
                    videoElement.setAttribute("playsinline", "");
                    (0, _iphoneInlineVideo2.default)(videoElement, true);
                }
                _this.player.addClass("vjs-panorama-mobile-inline-video");
                //by default videojs hide control bar on mobile device.
                _this.player.removeClass("vjs-using-native-controls");
            }
            //add vr icon to player
            if (_this.options.VREnable) {
                var controlbar = _this.player.controlBar();
                var index = controlbar.childNodes.length;
                var vrButton = new _VRButton2.default(player, _this.options);
                vrButton.disable();
                _this.player.addComponent("VRButton", vrButton, _this.player.controlBar(), index - 1);
            }
            //add canvas to player
            _this._videoCanvas = new VideoClass(player, _this.options, player.getVideoEl());
            _this.videoCanvas.hide();
            _this.player.addComponent("VideoCanvas", _this.videoCanvas);

            _this.attachEvents();

            if (_this.options.VREnable) {
                var _vrButton = _this.player.getComponent("VRButton");
                _vrButton && _vrButton.enable();
            }

            if (_this.options.ready) {
                _this.options.ready.call(_this);
            }
        });

        //register trigger callback function, so everything trigger to player will also trigger in here
        _this.player.registerTriggerCallback(function (eventName) {
            _this.trigger(eventName);
        });
        return _this;
    }

    _createClass(Panorama, [{
        key: 'dispose',
        value: function dispose() {
            this.detachEvents();
            this.player.getVideoEl().style.visibility = "visible";
            this.player.removeComponent("VideoCanvas");
        }
    }, {
        key: 'attachEvents',
        value: function attachEvents() {
            var _this2 = this;

            //show notice message
            if (this.options.Notice && this.options.Notice.Enable) {
                this.player.one("playing", function () {
                    var message = _this2.options.Notice && _this2.options.Notice.Message || "";
                    _this2.popupNotification(message);
                });
            }

            //enable canvas rendering when video is playing
            var handlePlay = function handlePlay() {
                _this2.player.getVideoEl().style.visibility = "hidden";
                _this2.videoCanvas.startAnimation();
                _this2.videoCanvas.show();

                //initial markers
                if (_this2.options.Markers && Array.isArray(_this2.options.Markers)) {
                    var markerContainer = new _MarkerContainer2.default(_this2.player, {
                        canvas: _this2.videoCanvas,
                        markers: _this2.options.Markers,
                        VREnable: _this2.options.VREnable
                    });
                    _this2.player.addComponent("markerContainer", markerContainer);
                }

                //initial animations
                if (_this2.options.Animation && Array.isArray(_this2.options.Animation)) {
                    _this2._animation = new _Animation2.default(_this2.player, {
                        animation: _this2.options.Animation,
                        canvas: _this2.videoCanvas
                    });
                }

                //detect black screen
                if (window.console && window.console.error) {
                    var originalErrorFunction = window.console.error;
                    var originalWarnFunction = window.console.warn;
                    window.console.error = function (error) {
                        if (error.message.indexOf("insecure") !== -1) {
                            _this2.popupNotification((0, _utils.crossDomainWarning)());
                            _this2.dispose();
                        }
                    };
                    window.console.warn = function (warn) {
                        if (warn.indexOf("gl.getShaderInfoLog") !== -1) {
                            _this2.popupNotification((0, _utils.crossDomainWarning)());
                            _this2.dispose();
                            window.console.warn = originalWarnFunction;
                        }
                    };
                    setTimeout(function () {
                        window.console.error = originalErrorFunction;
                        window.console.warn = originalWarnFunction;
                    }, 500);
                }
            };
            if (!this.player.paused()) {
                handlePlay();
            } else {
                this.player.one("play", handlePlay);
            }

            var report = function report() {
                _this2.player.reportUserActivity();
            };

            this.videoCanvas.addListeners({
                "touchMove": report,
                "tap": report
            });
        }
    }, {
        key: 'detachEvents',
        value: function detachEvents() {
            if (this.thumbnailCanvas) {
                this.thumbnailCanvas.stopAnimation();
            }
            if (this.videoCanvas) {
                this.videoCanvas.stopAnimation();
            }
        }
    }, {
        key: 'popupNotification',
        value: function popupNotification(message) {
            var notice = this.player.addComponent("Notice", new _Notification2.default(this.player, {
                Message: message
            }));

            if (this.options.Notice && this.options.Notice.HideTime && this.options.Notice.HideTime > 0) {
                setTimeout(function () {
                    notice.removeClass("vjs-video-notice-show");
                    notice.addClass("vjs-video-notice-fadeOut");
                    notice.one(_utils.transitionEvent, function () {
                        notice.hide();
                        notice.removeClass("vjs-video-notice-fadeOut");
                    });
                }, this.options.Notice.HideTime);
            }
        }
    }, {
        key: 'addTimeline',
        value: function addTimeline(animation) {
            this._animation.addTimeline(animation);
        }
    }, {
        key: 'enableAnimation',
        value: function enableAnimation() {
            this._animation.attachEvents();
        }
    }, {
        key: 'disableAnimation',
        value: function disableAnimation() {
            this._animation.detachEvents();
        }
    }, {
        key: 'getCoordinates',
        value: function getCoordinates() {
            var canvas = this.thumbnailCanvas || this.videoCanvas;
            return {
                lat: canvas._lat,
                lon: canvas._lon
            };
        }
    }, {
        key: 'thumbnailCanvas',
        get: function get() {
            return this._thumbnailCanvas;
        }
    }, {
        key: 'videoCanvas',
        get: function get() {
            return this._videoCanvas;
        }
    }, {
        key: 'player',
        get: function get() {
            return this._player;
        }
    }, {
        key: 'options',
        get: function get() {
            return this._options;
        }
    }], [{
        key: 'VERSION',
        get: function get() {
            return '1.0.0';
        }
    }]);

    return Panorama;
}(_wolfy87Eventemitter2.default);

exports.default = Panorama;

},{"./Components/Animation":6,"./Components/DualFisheye":11,"./Components/Equirectangular":12,"./Components/Fisheye":13,"./Components/MarkerContainer":16,"./Components/Notification":18,"./Components/Thumbnail":20,"./Components/VR1803D":22,"./Components/VR3603D":23,"./Components/VRButton":24,"./utils":36,"iphone-inline-video":3,"wolfy87-eventemitter":5}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _BasePlayer = require('./tech/BasePlayer');

var _BasePlayer2 = _interopRequireDefault(_BasePlayer);

var _Loader = require('./tech/Loader');

var _Loader2 = _interopRequireDefault(_Loader);

var _Panorama = require('./Panorama');

var _Panorama2 = _interopRequireDefault(_Panorama);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var playerClass = (0, _Loader2.default)(window.VIDEO_PANORAMA);

if (playerClass) {
    playerClass.registerPlugin();
}

var plugin = function plugin(playerDom, options, playerType) {
    var videoEm = typeof playerDom === "string" ? document.querySelector(playerDom) : playerDom;
    if (!playerClass) {
        playerClass = (0, _Loader2.default)(playerType);
        if (!playerClass) {
            throw new Error("Unable to figure out which media player in use.");
        }
        playerClass.registerPlugin();
    }
    var player = new playerClass(videoEm, options);
    var panorama = new _Panorama2.default(player, options);
    return panorama;
};

window.Panorama = plugin;

exports.default = plugin;

},{"./Panorama":25,"./tech/BasePlayer":27,"./tech/Loader":28}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// @ flow

var BasePlayer = function () {
    function BasePlayer(playerInstance) {
        _classCallCheck(this, BasePlayer);

        if (Object.getPrototypeOf(this) === BasePlayer.prototype) {
            throw Error('abstract class should not be instantiated directly; write a subclass');
        }

        this.playerInstance = playerInstance;
        this._components = [];
    }

    _createClass(BasePlayer, [{
        key: 'registerTriggerCallback',
        value: function registerTriggerCallback(callback) {
            this._triggerCallback = callback;
        }
    }, {
        key: 'el',
        value: function el() {
            throw Error('Not implemented');
        }
    }, {
        key: 'getVideoEl',
        value: function getVideoEl() {
            throw Error('Not implemented');
        }
    }, {
        key: 'getThumbnailURL',
        value: function getThumbnailURL() {
            throw Error('Not implemented');
        }
    }, {
        key: 'on',
        value: function on() {
            throw Error('Not implemented');
        }
    }, {
        key: 'off',
        value: function off() {
            throw Error('Not implemented');
        }
    }, {
        key: 'one',
        value: function one() {
            throw Error('Not implemented');
        }
    }, {
        key: 'trigger',
        value: function trigger(name) {
            throw Error('Not implemented');
        }
    }, {
        key: 'addClass',
        value: function addClass(name) {
            throw Error('Not implemented');
        }
    }, {
        key: 'removeClass',
        value: function removeClass(name) {
            throw Error('Not implemented');
        }
    }, {
        key: 'addComponent',
        value: function addComponent(name, component, location, index) {
            if (!location) {
                location = this.el();
            }
            if (!index) {
                index = -1;
            }

            if (typeof component.el === "function" && component.el()) {
                if (index === -1) {
                    location.appendChild(component.el());
                } else {
                    var children = location.childNodes;
                    var child = children[index];
                    location.insertBefore(component.el(), child);
                }
            }

            this._components.push({
                name: name,
                component: component,
                location: location
            });

            return component;
        }
    }, {
        key: 'removeComponent',
        value: function removeComponent(name) {
            this._components = this._components.reduce(function (acc, component) {
                if (component.name !== name) {
                    acc.push(component);
                } else {
                    component.component.dispose();
                }
                return acc;
            }, []);
        }
    }, {
        key: 'getComponent',
        value: function getComponent(name) {
            var componentData = void 0;
            for (var i = 0; i < this._components.length; i++) {
                if (this._components[i].name === name) {
                    componentData = this._components[i];
                    break;
                }
            }
            return componentData ? componentData.component : null;
        }
    }, {
        key: 'play',
        value: function play() {
            this.playerInstance.play();
        }
    }, {
        key: 'pause',
        value: function pause() {
            this.playerInstance.pause();
        }
    }, {
        key: 'paused',
        value: function paused() {
            throw Error('Not implemented');
        }
    }, {
        key: 'readyState',
        value: function readyState() {
            throw Error('Not implemented');
        }
    }, {
        key: 'reportUserActivity',
        value: function reportUserActivity() {
            throw Error('Not implemented');
        }
    }, {
        key: 'controlBar',
        value: function controlBar() {
            throw Error('Not implemented');
        }
    }, {
        key: 'enableFullscreen',
        value: function enableFullscreen() {
            throw Error('Not implemented');
        }
    }, {
        key: 'ready',
        value: function ready(fn) {
            throw Error('Not implemented');
        }
    }, {
        key: 'components',
        get: function get() {
            return this._components;
        }
    }], [{
        key: 'registerPlugin',
        value: function registerPlugin() {
            throw Error('Not implemented');
        }
    }]);

    return BasePlayer;
}();

exports.default = BasePlayer;

},{}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _BasePlayer = require('./BasePlayer');

var _BasePlayer2 = _interopRequireDefault(_BasePlayer);

var _Videojs = require('./Videojs4');

var _Videojs2 = _interopRequireDefault(_Videojs);

var _Videojs3 = require('./Videojs5');

var _Videojs4 = _interopRequireDefault(_Videojs3);

var _MediaElementPlayer = require('./MediaElementPlayer');

var _MediaElementPlayer2 = _interopRequireDefault(_MediaElementPlayer);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VIDEOPLAYER = {
    'videojs_v4': _Videojs2.default,
    'videojs_v5': _Videojs4.default,
    'MediaElementPlayer': _MediaElementPlayer2.default
};

function checkType(playerType) {
    if (typeof playerType !== "undefined") {
        if (VIDEOPLAYER[playerType]) {
            return VIDEOPLAYER[playerType];
        }
        (0, _utils.warning)('playerType: ' + playerType + ' is not supported');
    }
    return null;
}

function chooseTech() {
    if (typeof window.videojs !== "undefined") {
        var version = window.videojs.VERSION;
        var major = (0, _utils.getVideojsVersion)(version);
        if (major === 4) {
            return VIDEOPLAYER['videojs_v4'];
        } else {
            return VIDEOPLAYER['videojs_v5'];
        }
    }

    if (typeof window.MediaElementPlayer !== "undefined") {
        return VIDEOPLAYER["MediaElementPlayer"];
    }

    return null;
}

function Loader(playerType) {
    var preferType = checkType(playerType);
    if (!preferType) {
        preferType = chooseTech();
    }

    return preferType;
}

exports.default = Loader;

},{"../utils":36,"./BasePlayer":27,"./MediaElementPlayer":29,"./Videojs4":30,"./Videojs5":31}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Panorama = require('../Panorama');

var _Panorama2 = _interopRequireDefault(_Panorama);

var _utils = require('../utils');

var _BasePlayer2 = require('./BasePlayer');

var _BasePlayer3 = _interopRequireDefault(_BasePlayer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // @ flow

var MediaElement = function (_BasePlayer) {
    _inherits(MediaElement, _BasePlayer);

    function MediaElement(playerInstance) {
        _classCallCheck(this, MediaElement);

        var _this = _possibleConstructorReturn(this, (MediaElement.__proto__ || Object.getPrototypeOf(MediaElement)).call(this, playerInstance));

        if ((0, _utils.isIos)()) {
            _this._fullscreenOnIOS();
        }
        return _this;
    }

    _createClass(MediaElement, [{
        key: 'el',
        value: function el() {
            return this.playerInstance.container;
        }
    }, {
        key: 'getVideoEl',
        value: function getVideoEl() {
            return this.playerInstance.domNode;
        }
    }, {
        key: 'getThumbnailURL',
        value: function getThumbnailURL() {
            return this.playerInstance.options.poster || this.getVideoEl().getAttribute("poster");
        }
    }, {
        key: 'addClass',
        value: function addClass(name) {
            this.playerInstance.container.classList.add(name);
        }
    }, {
        key: 'removeClass',
        value: function removeClass(name) {
            this.playerInstance.container.classList.remove(name);
        }
    }, {
        key: 'on',
        value: function on() {
            var name = arguments.length <= 0 ? undefined : arguments[0];
            var fn = arguments.length <= 1 ? undefined : arguments[1];
            this.getVideoEl().addEventListener(name, fn);
        }
    }, {
        key: 'off',
        value: function off() {
            var name = arguments.length <= 0 ? undefined : arguments[0];
            var fn = arguments.length <= 1 ? undefined : arguments[1];
            this.getVideoEl().removeEventListener(name, fn);
        }
    }, {
        key: 'one',
        value: function one() {
            var _this2 = this;

            var name = arguments.length <= 0 ? undefined : arguments[0];
            var fn = arguments.length <= 1 ? undefined : arguments[1];
            var _oneTimeFunction = void 0;
            this.on(name, _oneTimeFunction = function oneTimeFunction() {
                fn();
                _this2.off(name, _oneTimeFunction);
            });
        }
    }, {
        key: 'trigger',
        value: function trigger(name) {
            var event = (0, _utils.customEvent)(name, this.el());
            this.getVideoEl().dispatchEvent(event);
            if (this._triggerCallback) {
                this._triggerCallback(name);
            }
        }
    }, {
        key: 'paused',
        value: function paused() {
            return this.getVideoEl().paused;
        }
    }, {
        key: 'readyState',
        value: function readyState() {
            return this.getVideoEl().readyState;
        }
    }, {
        key: 'reportUserActivity',
        value: function reportUserActivity() {
            this.playerInstance.showControls();
        }
    }, {
        key: 'controlBar',
        value: function controlBar() {
            return this.playerInstance.controls;
        }
    }, {
        key: 'enableFullscreen',
        value: function enableFullscreen() {
            if (!this.playerInstance.isFullScreen) {
                this.playerInstance.enterFullScreen();
            }
        }
    }, {
        key: '_resizeCanvasFn',
        value: function _resizeCanvasFn(canvas) {
            var _this3 = this;

            return function () {
                _this3.playerInstance.container.style.width = "100%";
                _this3.playerInstance.container.style.height = "100%";
                canvas.handleResize();
            };
        }
    }, {
        key: '_fullscreenOnIOS',
        value: function _fullscreenOnIOS() {
            var self = this;
            //disable fullscreen on ios
            this.playerInstance.enterFullScreen = function () {
                var canvas = self.getComponent("VideoCanvas");
                var resizeFn = self._resizeCanvasFn(canvas).bind(self);
                self.trigger("before_EnterFullscreen");
                document.documentElement.classList.add(this.options.classPrefix + 'fullscreen');
                self.addClass(this.options.classPrefix + 'container-fullscreen');
                this.container.style.width = "100%";
                this.container.style.height = "100%";
                window.addEventListener("devicemotion", resizeFn); //trigger when user rotate screen
                self.trigger("after_EnterFullscreen");
                this.isFullScreen = true;
                canvas.handleResize();
            };

            this.playerInstance.exitFullScreen = function () {
                var canvas = self.getComponent("VideoCanvas");
                var resizeFn = self._resizeCanvasFn(canvas).bind(self);
                self.trigger("before_ExitFullscreen");
                document.documentElement.classList.remove(this.options.classPrefix + 'fullscreen');
                self.removeClass(this.options.classPrefix + 'container-fullscreen');
                this.isFullScreen = false;
                this.container.style.width = "";
                this.container.style.height = "";
                window.removeEventListener("devicemotion", resizeFn);
                self.trigger("after_ExitFullscreen");
                canvas.handleResize();
            };
        }
    }, {
        key: 'ready',
        value: function ready(fn) {
            this.one('canplay', fn);
        }
    }], [{
        key: 'registerPlugin',
        value: function registerPlugin() {
            mejs.MepDefaults = (0, _utils.mergeOptions)(mejs.MepDefaults, {
                Panorama: _extends({}, _Panorama.defaults)
            });
            MediaElementPlayer.prototype = (0, _utils.mergeOptions)(MediaElementPlayer.prototype, {
                buildPanorama: function buildPanorama(player) {
                    if (player.domNode.tagName.toLowerCase() !== "video") {
                        throw new Error("Panorama don't support third party player");
                    }
                    var instance = new MediaElement(player);
                    player.panorama = new _Panorama2.default(instance, this.options.Panorama);
                },
                clearPanorama: function clearPanorama(player) {
                    if (player.panorama) {
                        player.panorama.dispose();
                    }
                }
            });
        }
    }]);

    return MediaElement;
}(_BasePlayer3.default);

exports.default = MediaElement;

},{"../Panorama":25,"../utils":36,"./BasePlayer":27}],30:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _video = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _video2 = _interopRequireDefault(_video);

var _videojs = require('./videojs');

var _videojs2 = _interopRequireDefault(_videojs);

var _Panorama = require('../Panorama');

var _Panorama2 = _interopRequireDefault(_Panorama);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Videojs4 = function (_BaseVideoJs) {
    _inherits(Videojs4, _BaseVideoJs);

    function Videojs4() {
        _classCallCheck(this, Videojs4);

        return _possibleConstructorReturn(this, (Videojs4.__proto__ || Object.getPrototypeOf(Videojs4)).apply(this, arguments));
    }

    _createClass(Videojs4, [{
        key: 'getVideoEl',
        value: function getVideoEl() {
            return this.playerInstance.tech ? this.playerInstance.tech.el() : this.playerInstance.h.el();
        }
    }, {
        key: '_originalFullscreenClickFn',
        value: function _originalFullscreenClickFn() {
            return this.playerInstance.controlBar.fullscreenToggle.onClick || this.playerInstance.controlBar.fullscreenToggle.u;
        }
    }], [{
        key: 'registerPlugin',
        value: function registerPlugin() {
            _video2.default.plugin("panorama", function (options) {
                var instance = new Videojs4(this);
                var panorama = new _Panorama2.default(instance, options);
                return panorama;
            });
        }
    }]);

    return Videojs4;
}(_videojs2.default);

exports.default = Videojs4;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../Panorama":25,"./videojs":32}],31:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _video = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _video2 = _interopRequireDefault(_video);

var _videojs = require('./videojs');

var _videojs2 = _interopRequireDefault(_videojs);

var _Panorama = require('../Panorama');

var _Panorama2 = _interopRequireDefault(_Panorama);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Videojs5 = function (_BaseVideoJs) {
    _inherits(Videojs5, _BaseVideoJs);

    function Videojs5() {
        _classCallCheck(this, Videojs5);

        return _possibleConstructorReturn(this, (Videojs5.__proto__ || Object.getPrototypeOf(Videojs5)).apply(this, arguments));
    }

    _createClass(Videojs5, [{
        key: 'getVideoEl',
        value: function getVideoEl() {
            return this.playerInstance.tech({ IWillNotUseThisInPlugins: true }).el();
        }
    }, {
        key: '_originalFullscreenClickFn',
        value: function _originalFullscreenClickFn() {
            return this.playerInstance.controlBar.fullscreenToggle.handleClick;
        }
    }], [{
        key: 'registerPlugin',
        value: function registerPlugin() {
            _video2.default.plugin("panorama", function (options) {
                var instance = new Videojs5(this);
                var panorama = new _Panorama2.default(instance, options);
                return panorama;
            });
        }
    }]);

    return Videojs5;
}(_videojs2.default);

exports.default = Videojs5;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../Panorama":25,"./videojs":32}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BasePlayer2 = require('./BasePlayer');

var _BasePlayer3 = _interopRequireDefault(_BasePlayer2);

var _Component = require('../Components/Component');

var _Component2 = _interopRequireDefault(_Component);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Videojs = function (_BasePlayer) {
    _inherits(Videojs, _BasePlayer);

    function Videojs(playerInstance) {
        _classCallCheck(this, Videojs);

        var _this = _possibleConstructorReturn(this, (Videojs.__proto__ || Object.getPrototypeOf(Videojs)).call(this, playerInstance));

        _this.on("ready", function () {
            //ios device don't support fullscreen, we have to monkey patch the original fullscreen function.
            if ((0, _utils.isIos)()) {
                _this._fullscreenOnIOS();
            }
        });
        //resize video if fullscreen change, this is used for ios device
        _this.on("fullscreenchange", function () {
            var canvas = _this.getComponent("VideoCanvas");
            canvas.handleResize();
        });
        return _this;
    }

    _createClass(Videojs, [{
        key: 'el',
        value: function el() {
            return this.playerInstance.el();
        }
    }, {
        key: 'getVideoEl',
        value: function getVideoEl() {
            throw Error('Not implemented');
        }
    }, {
        key: 'getThumbnailURL',
        value: function getThumbnailURL() {
            return this.playerInstance.poster();
        }
    }, {
        key: 'on',
        value: function on() {
            var _playerInstance;

            (_playerInstance = this.playerInstance).on.apply(_playerInstance, arguments);
        }
    }, {
        key: 'off',
        value: function off() {
            var _playerInstance2;

            (_playerInstance2 = this.playerInstance).off.apply(_playerInstance2, arguments);
        }
    }, {
        key: 'one',
        value: function one() {
            var _playerInstance3;

            (_playerInstance3 = this.playerInstance).one.apply(_playerInstance3, arguments);
        }
    }, {
        key: 'addClass',
        value: function addClass(name) {
            this.playerInstance.addClass(name);
        }
    }, {
        key: 'removeClass',
        value: function removeClass(name) {
            this.playerInstance.removeClass(name);
        }
    }, {
        key: '_resizeCanvasFn',
        value: function _resizeCanvasFn(canvas) {
            return function () {
                canvas.handleResize();
            };
        }
    }, {
        key: 'paused',
        value: function paused() {
            return this.playerInstance.paused();
        }
    }, {
        key: 'readyState',
        value: function readyState() {
            return this.playerInstance.readyState();
        }
    }, {
        key: 'trigger',
        value: function trigger(name) {
            this.playerInstance.trigger(name);
            if (this._triggerCallback) {
                this._triggerCallback(name);
            }
        }
    }, {
        key: 'reportUserActivity',
        value: function reportUserActivity() {
            this.playerInstance.reportUserActivity();
        }

        /**
         * Get original fullscreen function
         */

    }, {
        key: '_originalFullscreenClickFn',
        value: function _originalFullscreenClickFn() {
            throw Error('Not implemented');
        }
    }, {
        key: '_fullscreenOnIOS',
        value: function _fullscreenOnIOS() {
            var _this2 = this;

            this.playerInstance.controlBar.fullscreenToggle.off("tap", this._originalFullscreenClickFn());
            this.playerInstance.controlBar.fullscreenToggle.on("tap", function () {
                var canvas = _this2.getComponent("VideoCanvas");
                var resizeFn = _this2._resizeCanvasFn(canvas);
                if (!_this2.playerInstance.isFullscreen()) {
                    _this2.trigger("before_EnterFullscreen");
                    //set to fullscreen
                    _this2.playerInstance.isFullscreen(true);
                    _this2.playerInstance.enterFullWindow();
                    window.addEventListener("devicemotion", resizeFn); //trigger when user rotate screen
                    _this2.trigger("after_EnterFullscreen");
                } else {
                    _this2.trigger("before_ExitFullscreen");
                    _this2.playerInstance.isFullscreen(false);
                    _this2.playerInstance.exitFullWindow();
                    window.removeEventListener("devicemotion", resizeFn);
                    _this2.trigger("after_ExitFullscreen");
                }
                _this2.trigger("fullscreenchange");
            });
        }
    }, {
        key: 'controlBar',
        value: function controlBar() {
            var controlBar = this.playerInstance.controlBar;
            return controlBar.el();
        }
    }, {
        key: 'enableFullscreen',
        value: function enableFullscreen() {
            if (!this.playerInstance.isFullscreen()) this.playerInstance.controlBar.fullscreenToggle.trigger("tap");
        }
    }, {
        key: 'ready',
        value: function ready(fn) {
            this.playerInstance.ready(fn);
        }
    }]);

    return Videojs;
}(_BasePlayer3.default);

exports.default = Videojs;

},{"../Components/Component":10,"../utils":36,"./BasePlayer":27}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function whichTransitionEvent() {
    var el = document.createElement('div');
    var transitions = {
        'transition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'MozTransition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd'
    };

    for (var t in transitions) {
        var nodeStyle = el.style;
        if (nodeStyle[t] !== undefined) {
            return transitions[t];
        }
    }
}

var transitionEvent = exports.transitionEvent = whichTransitionEvent();

//adopt from http://gizma.com/easing/
function linear(t, b, c, d) {
    return c * t / d + b;
}

function easeInQuad(t, b, c, d) {
    t /= d;
    return c * t * t + b;
}

function easeOutQuad(t, b, c, d) {
    t /= d;
    return -c * t * (t - 2) + b;
}

function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
}

var easeFunctions = exports.easeFunctions = {
    linear: linear,
    easeInQuad: easeInQuad,
    easeOutQuad: easeOutQuad,
    easeInOutQuad: easeInOutQuad
};

},{}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.webGLErrorMessage = webGLErrorMessage;
exports.ieOrEdgeVersion = ieOrEdgeVersion;
exports.isLiveStreamOnSafari = isLiveStreamOnSafari;
exports.supportVideoTexture = supportVideoTexture;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _Detector = function _Detector() {
    _classCallCheck(this, _Detector);

    this.canvas = !!window.CanvasRenderingContext2D;
    this.webgl = false;
    try {
        this.canvas = document.createElement("canvas");
        this.webgl = !!(window.WebGLRenderingContext && (this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl')));
    } catch (e) {}
    this.workers = !!window.Worker;
    this.fileapi = window.File && window.FileReader && window.FileList && window.Blob;
};

var Detector = exports.Detector = new _Detector();

function webGLErrorMessage() {
    var element = document.createElement('div');
    element.id = 'webgl-error-message';

    if (!Detector.webgl) {
        element.innerHTML = window.WebGLRenderingContext ? ['Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />', 'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'].join('\n') : ['Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>', 'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'].join('\n');
    }
    return element;
}

/**
 * check ie or edge browser version, return -1 if use other browsers
 */
function ieOrEdgeVersion() {
    var rv = -1;
    if (navigator.appName === 'Microsoft Internet Explorer') {

        var ua = navigator.userAgent,
            re = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");

        var result = re.exec(ua);
        if (result !== null) {

            rv = parseFloat(result[1]);
        }
    } else if (navigator.appName === "Netscape") {
        /// in IE 11 the navigator.appVersion says 'trident'
        /// in Edge the navigator.appVersion does not say trident
        if (navigator.appVersion.indexOf('Trident') !== -1) rv = 11;else {
            var _ua = navigator.userAgent;
            var _re = new RegExp("Edge\/([0-9]{1,}[\\.0-9]{0,})");
            var _result = _re.exec(_ua);
            if (_re.exec(_ua) !== null) {
                rv = parseFloat(_result[1]);
            }
        }
    }

    return rv;
}

function isLiveStreamOnSafari(videoElement) {
    //live stream on safari doesn't support video texture
    var videoSources = [].slice.call(videoElement.querySelectorAll("source"));
    var result = false;
    if (videoElement.src && videoElement.src.indexOf('.m3u8') > -1) {
        videoSources.push({
            src: videoElement.src,
            type: "application/x-mpegURL"
        });
    }
    for (var i = 0; i < videoSources.length; i++) {
        var currentVideoSource = videoSources[i];
        if ((currentVideoSource.type === "application/x-mpegURL" || currentVideoSource.type === "application/vnd.apple.mpegurl") && /(Safari|AppleWebKit)/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
            result = true;
            break;
        }
    }
    return result;
}

function supportVideoTexture(videoElement) {
    //ie 11 and edge 12 and live stream on safari doesn't support video texture directly.
    var version = ieOrEdgeVersion();
    return (version === -1 || version >= 13) && !isLiveStreamOnSafari(videoElement);
}

},{}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.customEvent = customEvent;
function customEvent(eventName, target) {
    var event = new CustomEvent(eventName, {
        'detail': {
            target: target
        }
    });
    return event;
}

},{}],36:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mergeOptions = require('./merge-options');

Object.keys(_mergeOptions).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _mergeOptions[key];
    }
  });
});

var _warning = require('./warning');

Object.keys(_warning).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _warning[key];
    }
  });
});

var _detector = require('./detector');

Object.keys(_detector).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _detector[key];
    }
  });
});

var _version = require('./version');

Object.keys(_version).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _version[key];
    }
  });
});

var _mobile = require('./mobile');

Object.keys(_mobile).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _mobile[key];
    }
  });
});

var _vr = require('./vr');

Object.keys(_vr).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _vr[key];
    }
  });
});

var _animation = require('./animation');

Object.keys(_animation).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _animation[key];
    }
  });
});

var _event = require('./event');

Object.keys(_event).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _event[key];
    }
  });
});

},{"./animation":33,"./detector":34,"./event":35,"./merge-options":37,"./mobile":38,"./version":39,"./vr":40,"./warning":41}],37:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.isObject = isObject;
exports.isPlain = isPlain;


/**
 * code adopt from https://github.com/videojs/video.js/blob/master/src/js/utils/merge-options.js
 */

/**
 * Returns whether a value is an object of any kind - including DOM nodes,
 * arrays, regular expressions, etc. Not functions, though.
 *
 * This avoids the gotcha where using `typeof` on a `null` value
 * results in `'object'`.
 *
 * @param  {Object} value
 * @return {Boolean}
 */
function isObject(value) {
    return !!value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
}

/**
 * Returns whether an object appears to be a "plain" object - that is, a
 * direct instance of `Object`.
 *
 * @param  {Object} value
 * @return {Boolean}
 */
function isPlain(value) {
    return isObject(value) && Object.prototype.toString.call(value) === '[object Object]' && value.constructor === Object;
}

var mergeOptions = exports.mergeOptions = function mergeOptions() {
    for (var _len = arguments.length, sources = Array(_len), _key = 0; _key < _len; _key++) {
        sources[_key] = arguments[_key];
    }

    var results = {};
    sources.forEach(function (values) {
        if (!values) {
            return;
        }

        Object.getOwnPropertyNames(values).forEach(function (key) {
            var value = values[key];
            if (!isPlain(value)) {
                results[key] = value;
                return;
            }

            if (!isPlain(results[key])) {
                results[key] = {};
            }

            results[key] = mergeOptions(results[key], value);
        });
    });

    return results;
};

},{}],38:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getTouchesDistance = getTouchesDistance;
exports.mobileAndTabletcheck = mobileAndTabletcheck;
exports.isIos = isIos;
exports.isRealIphone = isRealIphone;
function getTouchesDistance(touches) {
    return Math.sqrt((touches[0].clientX - touches[1].clientX) * (touches[0].clientX - touches[1].clientX) + (touches[0].clientY - touches[1].clientY) * (touches[0].clientY - touches[1].clientY));
}

function mobileAndTabletcheck() {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}

function isIos() {
    return (/iPhone|iPad|iPod/i.test(navigator.userAgent)
    );
}

function isRealIphone() {
    return (/iPhone|iPod/i.test(navigator.platform)
    );
}

},{}],39:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getVideojsVersion = getVideojsVersion;
function getVideojsVersion(str) {
    var index = str.indexOf(".");
    if (index === -1) return 0;
    var major = parseInt(str.substring(0, index));
    return major;
}

},{}],40:[function(require,module,exports){
(function (global){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.fovToProjection = fovToProjection;

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//adopt code from: https://github.com/MozVR/vr-web-examples/blob/master/threejs-vr-boilerplate/js/VREffect.js
function fovToNDCScaleOffset(fov) {
    var pxscale = 2.0 / (fov.leftTan + fov.rightTan);
    var pxoffset = (fov.leftTan - fov.rightTan) * pxscale * 0.5;
    var pyscale = 2.0 / (fov.upTan + fov.downTan);
    var pyoffset = (fov.upTan - fov.downTan) * pyscale * 0.5;
    return { scale: [pxscale, pyscale], offset: [pxoffset, pyoffset] };
}

function fovPortToProjection(fov, rightHanded, zNear, zFar) {

    rightHanded = rightHanded === undefined ? true : rightHanded;
    zNear = zNear === undefined ? 0.01 : zNear;
    zFar = zFar === undefined ? 10000.0 : zFar;

    var handednessScale = rightHanded ? -1.0 : 1.0;

    // start with an identity matrix
    var mobj = new _three2.default.Matrix4();
    var m = mobj.elements;

    // and with scale/offset info for normalized device coords
    var scaleAndOffset = fovToNDCScaleOffset(fov);

    // X result, map clip edges to [-w,+w]
    m[0 * 4 + 0] = scaleAndOffset.scale[0];
    m[0 * 4 + 1] = 0.0;
    m[0 * 4 + 2] = scaleAndOffset.offset[0] * handednessScale;
    m[0 * 4 + 3] = 0.0;

    // Y result, map clip edges to [-w,+w]
    // Y offset is negated because this proj matrix transforms from world coords with Y=up,
    // but the NDC scaling has Y=down (thanks D3D?)
    m[1 * 4 + 0] = 0.0;
    m[1 * 4 + 1] = scaleAndOffset.scale[1];
    m[1 * 4 + 2] = -scaleAndOffset.offset[1] * handednessScale;
    m[1 * 4 + 3] = 0.0;

    // Z result (up to the app)
    m[2 * 4 + 0] = 0.0;
    m[2 * 4 + 1] = 0.0;
    m[2 * 4 + 2] = zFar / (zNear - zFar) * -handednessScale;
    m[2 * 4 + 3] = zFar * zNear / (zNear - zFar);

    // W result (= Z in)
    m[3 * 4 + 0] = 0.0;
    m[3 * 4 + 1] = 0.0;
    m[3 * 4 + 2] = handednessScale;
    m[3 * 4 + 3] = 0.0;

    mobj.transpose();

    return mobj;
}

function fovToProjection(fov, rightHanded, zNear, zFar) {
    var DEG2RAD = Math.PI / 180.0;

    var fovPort = {
        upTan: Math.tan(fov.upDegrees * DEG2RAD),
        downTan: Math.tan(fov.downDegrees * DEG2RAD),
        leftTan: Math.tan(fov.leftDegrees * DEG2RAD),
        rightTan: Math.tan(fov.rightDegrees * DEG2RAD)
    };

    return fovPortToProjection(fovPort, rightHanded, zNear, zFar);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],41:[function(require,module,exports){
(function (process){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});


/**
 * Prints a warning in the console if it exists.
 * Disable on production environment.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
var warning = exports.warning = function warning(message) {
    //warning message only happen on develop environment
    if (process.env.NODE_ENV !== 'production') {
        if (typeof console !== "undefined" && typeof console.error === "function") {
            console.error(message);
        }

        try {
            throw new Error(message);
        } catch (e) {}
    }
};

var crossDomainWarning = exports.crossDomainWarning = function crossDomainWarning() {
    var element = document.createElement('div');
    element.className = "vjs-cross-domain-unsupport";
    element.innerHTML = "Sorry, Your browser don't support cross domain.";
    return element;
};

}).call(this,require('_process'))

},{"_process":1}]},{},[26])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2ludGVydmFsb21ldGVyL2Rpc3QvaW50ZXJ2YWxvbWV0ZXIuY29tbW9uLWpzLmpzIiwibm9kZV9tb2R1bGVzL2lwaG9uZS1pbmxpbmUtdmlkZW8vZGlzdC9pcGhvbmUtaW5saW5lLXZpZGVvLmNvbW1vbi1qcy5qcyIsIm5vZGVfbW9kdWxlcy9wb29yLW1hbnMtc3ltYm9sL2Rpc3QvcG9vci1tYW5zLXN5bWJvbC5jb21tb24tanMuanMiLCJub2RlX21vZHVsZXMvd29sZnk4Ny1ldmVudGVtaXR0ZXIvRXZlbnRFbWl0dGVyLmpzIiwic3JjL3NjcmlwdHMvQ29tcG9uZW50cy9BbmltYXRpb24uanMiLCJzcmMvc2NyaXB0cy9Db21wb25lbnRzL0Jhc2VDYW52YXMuanMiLCJzcmMvc2NyaXB0cy9Db21wb25lbnRzL0J1dHRvbi5qcyIsInNyYy9zY3JpcHRzL0NvbXBvbmVudHMvQ2xpY2thYmxlQ29tcG9uZW50LmpzIiwic3JjL3NjcmlwdHMvQ29tcG9uZW50cy9Db21wb25lbnQuanMiLCJzcmMvc2NyaXB0cy9Db21wb25lbnRzL0R1YWxGaXNoZXllLmpzIiwic3JjL3NjcmlwdHMvQ29tcG9uZW50cy9FcXVpcmVjdGFuZ3VsYXIuanMiLCJzcmMvc2NyaXB0cy9Db21wb25lbnRzL0Zpc2hleWUuanMiLCJzcmMvc2NyaXB0cy9Db21wb25lbnRzL0hlbHBlckNhbnZhcy5qcyIsInNyYy9zY3JpcHRzL0NvbXBvbmVudHMvTWFya2VyLmpzIiwic3JjL3NjcmlwdHMvQ29tcG9uZW50cy9NYXJrZXJDb250YWluZXIuanMiLCJzcmMvc2NyaXB0cy9Db21wb25lbnRzL01hcmtlckdyb3VwLmpzIiwic3JjL3NjcmlwdHMvQ29tcG9uZW50cy9Ob3RpZmljYXRpb24uanMiLCJzcmMvc2NyaXB0cy9Db21wb25lbnRzL1RocmVlRFZpZGVvLmpzIiwic3JjL3NjcmlwdHMvQ29tcG9uZW50cy9UaHVtYm5haWwuanMiLCJzcmMvc2NyaXB0cy9Db21wb25lbnRzL1R3b0RWaWRlby5qcyIsInNyYy9zY3JpcHRzL0NvbXBvbmVudHMvVlIxODAzRC5qcyIsInNyYy9zY3JpcHRzL0NvbXBvbmVudHMvVlIzNjAzRC5qcyIsInNyYy9zY3JpcHRzL0NvbXBvbmVudHMvVlJCdXR0b24uanMiLCJzcmMvc2NyaXB0cy9QYW5vcmFtYS5qcyIsInNyYy9zY3JpcHRzL2luZGV4LmpzIiwic3JjL3NjcmlwdHMvdGVjaC9CYXNlUGxheWVyLmpzIiwic3JjL3NjcmlwdHMvdGVjaC9Mb2FkZXIuanMiLCJzcmMvc2NyaXB0cy90ZWNoL01lZGlhRWxlbWVudFBsYXllci5qcyIsInNyYy9zY3JpcHRzL3RlY2gvVmlkZW9qczQuanMiLCJzcmMvc2NyaXB0cy90ZWNoL1ZpZGVvanM1LmpzIiwic3JjL3NjcmlwdHMvdGVjaC92aWRlb2pzLmpzIiwic3JjL3NjcmlwdHMvdXRpbHMvYW5pbWF0aW9uLmpzIiwic3JjL3NjcmlwdHMvdXRpbHMvZGV0ZWN0b3IuanMiLCJzcmMvc2NyaXB0cy91dGlscy9ldmVudC5qcyIsInNyYy9zY3JpcHRzL3V0aWxzL2luZGV4LmpzIiwic3JjL3NjcmlwdHMvdXRpbHMvbWVyZ2Utb3B0aW9ucy5qcyIsInNyYy9zY3JpcHRzL3V0aWxzL21vYmlsZS5qcyIsInNyYy9zY3JpcHRzL3V0aWxzL3ZlcnNpb24uanMiLCJzcmMvc2NyaXB0cy91dGlscy92ci5qcyIsInNyYy9zY3JpcHRzL3V0aWxzL3dhcm5pbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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bnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLyohIG5wbS5pbS9pbnRlcnZhbG9tZXRlciAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG5mdW5jdGlvbiBpbnRlcnZhbG9tZXRlcihjYiwgcmVxdWVzdCwgY2FuY2VsLCByZXF1ZXN0UGFyYW1ldGVyKSB7XG5cdHZhciByZXF1ZXN0SWQ7XG5cdHZhciBwcmV2aW91c0xvb3BUaW1lO1xuXHRmdW5jdGlvbiBsb29wKG5vdykge1xuXHRcdC8vIG11c3QgYmUgcmVxdWVzdGVkIGJlZm9yZSBjYigpIGJlY2F1c2UgdGhhdCBtaWdodCBjYWxsIC5zdG9wKClcblx0XHRyZXF1ZXN0SWQgPSByZXF1ZXN0KGxvb3AsIHJlcXVlc3RQYXJhbWV0ZXIpO1xuXG5cdFx0Ly8gY2FsbGVkIHdpdGggXCJtcyBzaW5jZSBsYXN0IGNhbGxcIi4gMCBvbiBzdGFydCgpXG5cdFx0Y2Iobm93IC0gKHByZXZpb3VzTG9vcFRpbWUgfHwgbm93KSk7XG5cblx0XHRwcmV2aW91c0xvb3BUaW1lID0gbm93O1xuXHR9XG5cdHJldHVybiB7XG5cdFx0c3RhcnQ6IGZ1bmN0aW9uIHN0YXJ0KCkge1xuXHRcdFx0aWYgKCFyZXF1ZXN0SWQpIHsgLy8gcHJldmVudCBkb3VibGUgc3RhcnRzXG5cdFx0XHRcdGxvb3AoMCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRzdG9wOiBmdW5jdGlvbiBzdG9wKCkge1xuXHRcdFx0Y2FuY2VsKHJlcXVlc3RJZCk7XG5cdFx0XHRyZXF1ZXN0SWQgPSBudWxsO1xuXHRcdFx0cHJldmlvdXNMb29wVGltZSA9IDA7XG5cdFx0fVxuXHR9O1xufVxuXG5mdW5jdGlvbiBmcmFtZUludGVydmFsb21ldGVyKGNiKSB7XG5cdHJldHVybiBpbnRlcnZhbG9tZXRlcihjYiwgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLCBjYW5jZWxBbmltYXRpb25GcmFtZSk7XG59XG5cbmZ1bmN0aW9uIHRpbWVySW50ZXJ2YWxvbWV0ZXIoY2IsIGRlbGF5KSB7XG5cdHJldHVybiBpbnRlcnZhbG9tZXRlcihjYiwgc2V0VGltZW91dCwgY2xlYXJUaW1lb3V0LCBkZWxheSk7XG59XG5cbmV4cG9ydHMuaW50ZXJ2YWxvbWV0ZXIgPSBpbnRlcnZhbG9tZXRlcjtcbmV4cG9ydHMuZnJhbWVJbnRlcnZhbG9tZXRlciA9IGZyYW1lSW50ZXJ2YWxvbWV0ZXI7XG5leHBvcnRzLnRpbWVySW50ZXJ2YWxvbWV0ZXIgPSB0aW1lckludGVydmFsb21ldGVyOyIsIi8qISBucG0uaW0vaXBob25lLWlubGluZS12aWRlbyAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfaW50ZXJvcERlZmF1bHQgKGV4KSB7IHJldHVybiAoZXggJiYgKHR5cGVvZiBleCA9PT0gJ29iamVjdCcpICYmICdkZWZhdWx0JyBpbiBleCkgPyBleFsnZGVmYXVsdCddIDogZXg7IH1cblxudmFyIFN5bWJvbCA9IF9pbnRlcm9wRGVmYXVsdChyZXF1aXJlKCdwb29yLW1hbnMtc3ltYm9sJykpO1xudmFyIGludGVydmFsb21ldGVyID0gcmVxdWlyZSgnaW50ZXJ2YWxvbWV0ZXInKTtcblxuZnVuY3Rpb24gcHJldmVudEV2ZW50KGVsZW1lbnQsIGV2ZW50TmFtZSwgdG9nZ2xlUHJvcGVydHksIHByZXZlbnRXaXRoUHJvcGVydHkpIHtcblx0ZnVuY3Rpb24gaGFuZGxlcihlKSB7XG5cdFx0aWYgKEJvb2xlYW4oZWxlbWVudFt0b2dnbGVQcm9wZXJ0eV0pID09PSBCb29sZWFuKHByZXZlbnRXaXRoUHJvcGVydHkpKSB7XG5cdFx0XHRlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuXHRcdFx0Ly8gY29uc29sZS5sb2coZXZlbnROYW1lLCAncHJldmVudGVkIG9uJywgZWxlbWVudCk7XG5cdFx0fVxuXHRcdGRlbGV0ZSBlbGVtZW50W3RvZ2dsZVByb3BlcnR5XTtcblx0fVxuXHRlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyLCBmYWxzZSk7XG5cblx0Ly8gUmV0dXJuIGhhbmRsZXIgdG8gYWxsb3cgdG8gZGlzYWJsZSB0aGUgcHJldmVudGlvbi4gVXNhZ2U6XG5cdC8vIGNvbnN0IHByZXZlbnRpb25IYW5kbGVyID0gcHJldmVudEV2ZW50KGVsLCAnY2xpY2snKTtcblx0Ly8gZWwucmVtb3ZlRXZlbnRIYW5kbGVyKCdjbGljaycsIHByZXZlbnRpb25IYW5kbGVyKTtcblx0cmV0dXJuIGhhbmRsZXI7XG59XG5cbmZ1bmN0aW9uIHByb3h5UHJvcGVydHkob2JqZWN0LCBwcm9wZXJ0eU5hbWUsIHNvdXJjZU9iamVjdCwgY29weUZpcnN0KSB7XG5cdGZ1bmN0aW9uIGdldCgpIHtcblx0XHRyZXR1cm4gc291cmNlT2JqZWN0W3Byb3BlcnR5TmFtZV07XG5cdH1cblx0ZnVuY3Rpb24gc2V0KHZhbHVlKSB7XG5cdFx0c291cmNlT2JqZWN0W3Byb3BlcnR5TmFtZV0gPSB2YWx1ZTtcblx0fVxuXG5cdGlmIChjb3B5Rmlyc3QpIHtcblx0XHRzZXQob2JqZWN0W3Byb3BlcnR5TmFtZV0pO1xuXHR9XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwgcHJvcGVydHlOYW1lLCB7Z2V0OiBnZXQsIHNldDogc2V0fSk7XG59XG5cbmZ1bmN0aW9uIHByb3h5RXZlbnQob2JqZWN0LCBldmVudE5hbWUsIHNvdXJjZU9iamVjdCkge1xuXHRzb3VyY2VPYmplY3QuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG9iamVjdC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChldmVudE5hbWUpKTsgfSk7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRXZlbnRBc3luYyhlbGVtZW50LCB0eXBlKSB7XG5cdFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQodHlwZSkpO1xuXHR9KTtcbn1cblxuLy8gaU9TIDEwIGFkZHMgc3VwcG9ydCBmb3IgbmF0aXZlIGlubGluZSBwbGF5YmFjayArIHNpbGVudCBhdXRvcGxheVxudmFyIGlzV2hpdGVsaXN0ZWQgPSAnb2JqZWN0LWZpdCcgaW4gZG9jdW1lbnQuaGVhZC5zdHlsZSAmJiAvaVBob25lfGlQb2QvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICYmICFtYXRjaE1lZGlhKCcoLXdlYmtpdC12aWRlby1wbGF5YWJsZS1pbmxpbmUpJykubWF0Y2hlcztcblxudmFyIOCyoCA9IFN5bWJvbCgpO1xudmFyIOCyoGV2ZW50ID0gU3ltYm9sKCk7XG52YXIg4LKgcGxheSA9IFN5bWJvbCgnbmF0aXZlcGxheScpO1xudmFyIOCyoHBhdXNlID0gU3ltYm9sKCduYXRpdmVwYXVzZScpO1xuXG4vKipcbiAqIFVUSUxTXG4gKi9cblxuZnVuY3Rpb24gZ2V0QXVkaW9Gcm9tVmlkZW8odmlkZW8pIHtcblx0dmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCk7XG5cdHByb3h5RXZlbnQodmlkZW8sICdwbGF5JywgYXVkaW8pO1xuXHRwcm94eUV2ZW50KHZpZGVvLCAncGxheWluZycsIGF1ZGlvKTtcblx0cHJveHlFdmVudCh2aWRlbywgJ3BhdXNlJywgYXVkaW8pO1xuXHRhdWRpby5jcm9zc09yaWdpbiA9IHZpZGVvLmNyb3NzT3JpZ2luO1xuXG5cdC8vICdkYXRhOicgY2F1c2VzIGF1ZGlvLm5ldHdvcmtTdGF0ZSA+IDBcblx0Ly8gd2hpY2ggdGhlbiBhbGxvd3MgdG8ga2VlcCA8YXVkaW8+IGluIGEgcmVzdW1hYmxlIHBsYXlpbmcgc3RhdGVcblx0Ly8gaS5lLiBvbmNlIHlvdSBzZXQgYSByZWFsIHNyYyBpdCB3aWxsIGtlZXAgcGxheWluZyBpZiBpdCB3YXMgaWYgLnBsYXkoKSB3YXMgY2FsbGVkXG5cdGF1ZGlvLnNyYyA9IHZpZGVvLnNyYyB8fCB2aWRlby5jdXJyZW50U3JjIHx8ICdkYXRhOic7XG5cblx0Ly8gaWYgKGF1ZGlvLnNyYyA9PT0gJ2RhdGE6Jykge1xuXHQvLyAgIFRPRE86IHdhaXQgZm9yIHZpZGVvIHRvIGJlIHNlbGVjdGVkXG5cdC8vIH1cblx0cmV0dXJuIGF1ZGlvO1xufVxuXG52YXIgbGFzdFJlcXVlc3RzID0gW107XG52YXIgcmVxdWVzdEluZGV4ID0gMDtcbnZhciBsYXN0VGltZXVwZGF0ZUV2ZW50O1xuXG5mdW5jdGlvbiBzZXRUaW1lKHZpZGVvLCB0aW1lLCByZW1lbWJlck9ubHkpIHtcblx0Ly8gYWxsb3cgb25lIHRpbWV1cGRhdGUgZXZlbnQgZXZlcnkgMjAwKyBtc1xuXHRpZiAoKGxhc3RUaW1ldXBkYXRlRXZlbnQgfHwgMCkgKyAyMDAgPCBEYXRlLm5vdygpKSB7XG5cdFx0dmlkZW9b4LKgZXZlbnRdID0gdHJ1ZTtcblx0XHRsYXN0VGltZXVwZGF0ZUV2ZW50ID0gRGF0ZS5ub3coKTtcblx0fVxuXHRpZiAoIXJlbWVtYmVyT25seSkge1xuXHRcdHZpZGVvLmN1cnJlbnRUaW1lID0gdGltZTtcblx0fVxuXHRsYXN0UmVxdWVzdHNbKytyZXF1ZXN0SW5kZXggJSAzXSA9IHRpbWUgKiAxMDAgfCAwIC8gMTAwO1xufVxuXG5mdW5jdGlvbiBpc1BsYXllckVuZGVkKHBsYXllcikge1xuXHRyZXR1cm4gcGxheWVyLmRyaXZlci5jdXJyZW50VGltZSA+PSBwbGF5ZXIudmlkZW8uZHVyYXRpb247XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZSh0aW1lRGlmZikge1xuXHR2YXIgcGxheWVyID0gdGhpcztcblx0Ly8gY29uc29sZS5sb2coJ3VwZGF0ZScsIHBsYXllci52aWRlby5yZWFkeVN0YXRlLCBwbGF5ZXIudmlkZW8ubmV0d29ya1N0YXRlLCBwbGF5ZXIuZHJpdmVyLnJlYWR5U3RhdGUsIHBsYXllci5kcml2ZXIubmV0d29ya1N0YXRlLCBwbGF5ZXIuZHJpdmVyLnBhdXNlZCk7XG5cdGlmIChwbGF5ZXIudmlkZW8ucmVhZHlTdGF0ZSA+PSBwbGF5ZXIudmlkZW8uSEFWRV9GVVRVUkVfREFUQSkge1xuXHRcdGlmICghcGxheWVyLmhhc0F1ZGlvKSB7XG5cdFx0XHRwbGF5ZXIuZHJpdmVyLmN1cnJlbnRUaW1lID0gcGxheWVyLnZpZGVvLmN1cnJlbnRUaW1lICsgKCh0aW1lRGlmZiAqIHBsYXllci52aWRlby5wbGF5YmFja1JhdGUpIC8gMTAwMCk7XG5cdFx0XHRpZiAocGxheWVyLnZpZGVvLmxvb3AgJiYgaXNQbGF5ZXJFbmRlZChwbGF5ZXIpKSB7XG5cdFx0XHRcdHBsYXllci5kcml2ZXIuY3VycmVudFRpbWUgPSAwO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRzZXRUaW1lKHBsYXllci52aWRlbywgcGxheWVyLmRyaXZlci5jdXJyZW50VGltZSk7XG5cdH0gZWxzZSBpZiAocGxheWVyLnZpZGVvLm5ldHdvcmtTdGF0ZSA9PT0gcGxheWVyLnZpZGVvLk5FVFdPUktfSURMRSAmJiAhcGxheWVyLnZpZGVvLmJ1ZmZlcmVkLmxlbmd0aCkge1xuXHRcdC8vIHRoaXMgc2hvdWxkIGhhcHBlbiB3aGVuIHRoZSBzb3VyY2UgaXMgYXZhaWxhYmxlIGJ1dDpcblx0XHQvLyAtIGl0J3MgcG90ZW50aWFsbHkgcGxheWluZyAoLnBhdXNlZCA9PT0gZmFsc2UpXG5cdFx0Ly8gLSBpdCdzIG5vdCByZWFkeSB0byBwbGF5XG5cdFx0Ly8gLSBpdCdzIG5vdCBsb2FkaW5nXG5cdFx0Ly8gSWYgaXQgaGFzQXVkaW8sIHRoYXQgd2lsbCBiZSBsb2FkZWQgaW4gdGhlICdlbXB0aWVkJyBoYW5kbGVyIGJlbG93XG5cdFx0cGxheWVyLnZpZGVvLmxvYWQoKTtcblx0XHQvLyBjb25zb2xlLmxvZygnV2lsbCBsb2FkJyk7XG5cdH1cblxuXHQvLyBjb25zb2xlLmFzc2VydChwbGF5ZXIudmlkZW8uY3VycmVudFRpbWUgPT09IHBsYXllci5kcml2ZXIuY3VycmVudFRpbWUsICdWaWRlbyBub3QgdXBkYXRpbmchJyk7XG5cblx0aWYgKHBsYXllci52aWRlby5lbmRlZCkge1xuXHRcdGRlbGV0ZSBwbGF5ZXIudmlkZW9b4LKgZXZlbnRdOyAvLyBhbGxvdyB0aW1ldXBkYXRlIGV2ZW50XG5cdFx0cGxheWVyLnZpZGVvLnBhdXNlKHRydWUpO1xuXHR9XG59XG5cbi8qKlxuICogTUVUSE9EU1xuICovXG5cbmZ1bmN0aW9uIHBsYXkoKSB7XG5cdC8vIGNvbnNvbGUubG9nKCdwbGF5Jyk7XG5cdHZhciB2aWRlbyA9IHRoaXM7XG5cdHZhciBwbGF5ZXIgPSB2aWRlb1vgsqBdO1xuXG5cdC8vIGlmIGl0J3MgZnVsbHNjcmVlbiwgdXNlIHRoZSBuYXRpdmUgcGxheWVyXG5cdGlmICh2aWRlby53ZWJraXREaXNwbGF5aW5nRnVsbHNjcmVlbikge1xuXHRcdHZpZGVvW+CyoHBsYXldKCk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0aWYgKHBsYXllci5kcml2ZXIuc3JjICE9PSAnZGF0YTonICYmIHBsYXllci5kcml2ZXIuc3JjICE9PSB2aWRlby5zcmMpIHtcblx0XHQvLyBjb25zb2xlLmxvZygnc3JjIGNoYW5nZWQgb24gcGxheScsIHZpZGVvLnNyYyk7XG5cdFx0c2V0VGltZSh2aWRlbywgMCwgdHJ1ZSk7XG5cdFx0cGxheWVyLmRyaXZlci5zcmMgPSB2aWRlby5zcmM7XG5cdH1cblxuXHRpZiAoIXZpZGVvLnBhdXNlZCkge1xuXHRcdHJldHVybjtcblx0fVxuXHRwbGF5ZXIucGF1c2VkID0gZmFsc2U7XG5cblx0aWYgKCF2aWRlby5idWZmZXJlZC5sZW5ndGgpIHtcblx0XHQvLyAubG9hZCgpIGNhdXNlcyB0aGUgZW1wdGllZCBldmVudFxuXHRcdC8vIHRoZSBhbHRlcm5hdGl2ZSBpcyAucGxheSgpKy5wYXVzZSgpIGJ1dCB0aGF0IHRyaWdnZXJzIHBsYXkvcGF1c2UgZXZlbnRzLCBldmVuIHdvcnNlXG5cdFx0Ly8gcG9zc2libHkgdGhlIGFsdGVybmF0aXZlIGlzIHByZXZlbnRpbmcgdGhpcyBldmVudCBvbmx5IG9uY2Vcblx0XHR2aWRlby5sb2FkKCk7XG5cdH1cblxuXHRwbGF5ZXIuZHJpdmVyLnBsYXkoKTtcblx0cGxheWVyLnVwZGF0ZXIuc3RhcnQoKTtcblxuXHRpZiAoIXBsYXllci5oYXNBdWRpbykge1xuXHRcdGRpc3BhdGNoRXZlbnRBc3luYyh2aWRlbywgJ3BsYXknKTtcblx0XHRpZiAocGxheWVyLnZpZGVvLnJlYWR5U3RhdGUgPj0gcGxheWVyLnZpZGVvLkhBVkVfRU5PVUdIX0RBVEEpIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCdvbnBsYXknKTtcblx0XHRcdGRpc3BhdGNoRXZlbnRBc3luYyh2aWRlbywgJ3BsYXlpbmcnKTtcblx0XHR9XG5cdH1cbn1cbmZ1bmN0aW9uIHBhdXNlKGZvcmNlRXZlbnRzKSB7XG5cdC8vIGNvbnNvbGUubG9nKCdwYXVzZScpO1xuXHR2YXIgdmlkZW8gPSB0aGlzO1xuXHR2YXIgcGxheWVyID0gdmlkZW9b4LKgXTtcblxuXHRwbGF5ZXIuZHJpdmVyLnBhdXNlKCk7XG5cdHBsYXllci51cGRhdGVyLnN0b3AoKTtcblxuXHQvLyBpZiBpdCdzIGZ1bGxzY3JlZW4sIHRoZSBkZXZlbG9wZXIgdGhlIG5hdGl2ZSBwbGF5ZXIucGF1c2UoKVxuXHQvLyBUaGlzIGlzIGF0IHRoZSBlbmQgb2YgcGF1c2UoKSBiZWNhdXNlIGl0IGFsc29cblx0Ly8gbmVlZHMgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHNpbXVsYXRpb24gaXMgcGF1c2VkXG5cdGlmICh2aWRlby53ZWJraXREaXNwbGF5aW5nRnVsbHNjcmVlbikge1xuXHRcdHZpZGVvW+CyoHBhdXNlXSgpO1xuXHR9XG5cblx0aWYgKHBsYXllci5wYXVzZWQgJiYgIWZvcmNlRXZlbnRzKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0cGxheWVyLnBhdXNlZCA9IHRydWU7XG5cdGlmICghcGxheWVyLmhhc0F1ZGlvKSB7XG5cdFx0ZGlzcGF0Y2hFdmVudEFzeW5jKHZpZGVvLCAncGF1c2UnKTtcblx0fVxuXHRpZiAodmlkZW8uZW5kZWQpIHtcblx0XHR2aWRlb1vgsqBldmVudF0gPSB0cnVlO1xuXHRcdGRpc3BhdGNoRXZlbnRBc3luYyh2aWRlbywgJ2VuZGVkJyk7XG5cdH1cbn1cblxuLyoqXG4gKiBTRVRVUFxuICovXG5cbmZ1bmN0aW9uIGFkZFBsYXllcih2aWRlbywgaGFzQXVkaW8pIHtcblx0dmFyIHBsYXllciA9IHZpZGVvW+CyoF0gPSB7fTtcblx0cGxheWVyLnBhdXNlZCA9IHRydWU7IC8vIHRyYWNrIHdoZXRoZXIgJ3BhdXNlJyBldmVudHMgaGF2ZSBiZWVuIGZpcmVkXG5cdHBsYXllci5oYXNBdWRpbyA9IGhhc0F1ZGlvO1xuXHRwbGF5ZXIudmlkZW8gPSB2aWRlbztcblx0cGxheWVyLnVwZGF0ZXIgPSBpbnRlcnZhbG9tZXRlci5mcmFtZUludGVydmFsb21ldGVyKHVwZGF0ZS5iaW5kKHBsYXllcikpO1xuXG5cdGlmIChoYXNBdWRpbykge1xuXHRcdHBsYXllci5kcml2ZXIgPSBnZXRBdWRpb0Zyb21WaWRlbyh2aWRlbyk7XG5cdH0gZWxzZSB7XG5cdFx0dmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignY2FucGxheScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICghdmlkZW8ucGF1c2VkKSB7XG5cdFx0XHRcdC8vIGNvbnNvbGUubG9nKCdvbmNhbnBsYXknKTtcblx0XHRcdFx0ZGlzcGF0Y2hFdmVudEFzeW5jKHZpZGVvLCAncGxheWluZycpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHBsYXllci5kcml2ZXIgPSB7XG5cdFx0XHRzcmM6IHZpZGVvLnNyYyB8fCB2aWRlby5jdXJyZW50U3JjIHx8ICdkYXRhOicsXG5cdFx0XHRtdXRlZDogdHJ1ZSxcblx0XHRcdHBhdXNlZDogdHJ1ZSxcblx0XHRcdHBhdXNlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHBsYXllci5kcml2ZXIucGF1c2VkID0gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRwbGF5OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHBsYXllci5kcml2ZXIucGF1c2VkID0gZmFsc2U7XG5cdFx0XHRcdC8vIG1lZGlhIGF1dG9tYXRpY2FsbHkgZ29lcyB0byAwIGlmIC5wbGF5KCkgaXMgY2FsbGVkIHdoZW4gaXQncyBkb25lXG5cdFx0XHRcdGlmIChpc1BsYXllckVuZGVkKHBsYXllcikpIHtcblx0XHRcdFx0XHRzZXRUaW1lKHZpZGVvLCAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGdldCBlbmRlZCgpIHtcblx0XHRcdFx0cmV0dXJuIGlzUGxheWVyRW5kZWQocGxheWVyKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0Ly8gLmxvYWQoKSBjYXVzZXMgdGhlIGVtcHRpZWQgZXZlbnRcblx0dmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignZW1wdGllZCcsIGZ1bmN0aW9uICgpIHtcblx0XHQvLyBjb25zb2xlLmxvZygnZHJpdmVyIHNyYyBpcycsIHBsYXllci5kcml2ZXIuc3JjKTtcblx0XHR2YXIgd2FzRW1wdHkgPSAhcGxheWVyLmRyaXZlci5zcmMgfHwgcGxheWVyLmRyaXZlci5zcmMgPT09ICdkYXRhOic7XG5cdFx0aWYgKHBsYXllci5kcml2ZXIuc3JjICYmIHBsYXllci5kcml2ZXIuc3JjICE9PSB2aWRlby5zcmMpIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCdzcmMgY2hhbmdlZCB0bycsIHZpZGVvLnNyYyk7XG5cdFx0XHRzZXRUaW1lKHZpZGVvLCAwLCB0cnVlKTtcblx0XHRcdHBsYXllci5kcml2ZXIuc3JjID0gdmlkZW8uc3JjO1xuXHRcdFx0Ly8gcGxheWluZyB2aWRlb3Mgd2lsbCBvbmx5IGtlZXAgcGxheWluZyBpZiBubyBzcmMgd2FzIHByZXNlbnQgd2hlbiAucGxheSgp4oCZZWRcblx0XHRcdGlmICh3YXNFbXB0eSkge1xuXHRcdFx0XHRwbGF5ZXIuZHJpdmVyLnBsYXkoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHBsYXllci51cGRhdGVyLnN0b3AoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sIGZhbHNlKTtcblxuXHQvLyBzdG9wIHByb2dyYW1tYXRpYyBwbGF5ZXIgd2hlbiBPUyB0YWtlcyBvdmVyXG5cdHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmtpdGJlZ2luZnVsbHNjcmVlbicsIGZ1bmN0aW9uICgpIHtcblx0XHRpZiAoIXZpZGVvLnBhdXNlZCkge1xuXHRcdFx0Ly8gbWFrZSBzdXJlIHRoYXQgdGhlIDxhdWRpbz4gYW5kIHRoZSBzeW5jZXIvdXBkYXRlciBhcmUgc3RvcHBlZFxuXHRcdFx0dmlkZW8ucGF1c2UoKTtcblxuXHRcdFx0Ly8gcGxheSB2aWRlbyBuYXRpdmVseVxuXHRcdFx0dmlkZW9b4LKgcGxheV0oKTtcblx0XHR9IGVsc2UgaWYgKGhhc0F1ZGlvICYmICFwbGF5ZXIuZHJpdmVyLmJ1ZmZlcmVkLmxlbmd0aCkge1xuXHRcdFx0Ly8gaWYgdGhlIGZpcnN0IHBsYXkgaXMgbmF0aXZlLFxuXHRcdFx0Ly8gdGhlIDxhdWRpbz4gbmVlZHMgdG8gYmUgYnVmZmVyZWQgbWFudWFsbHlcblx0XHRcdC8vIHNvIHdoZW4gdGhlIGZ1bGxzY3JlZW4gZW5kcywgaXQgY2FuIGJlIHNldCB0byB0aGUgc2FtZSBjdXJyZW50IHRpbWVcblx0XHRcdHBsYXllci5kcml2ZXIubG9hZCgpO1xuXHRcdH1cblx0fSk7XG5cdGlmIChoYXNBdWRpbykge1xuXHRcdHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmtpdGVuZGZ1bGxzY3JlZW4nLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQvLyBzeW5jIGF1ZGlvIHRvIG5ldyB2aWRlbyBwb3NpdGlvblxuXHRcdFx0cGxheWVyLmRyaXZlci5jdXJyZW50VGltZSA9IHZpZGVvLmN1cnJlbnRUaW1lO1xuXHRcdFx0Ly8gY29uc29sZS5hc3NlcnQocGxheWVyLmRyaXZlci5jdXJyZW50VGltZSA9PT0gdmlkZW8uY3VycmVudFRpbWUsICdBdWRpbyBub3Qgc3luY2VkJyk7XG5cdFx0fSk7XG5cblx0XHQvLyBhbGxvdyBzZWVraW5nXG5cdFx0dmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignc2Vla2luZycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChsYXN0UmVxdWVzdHMuaW5kZXhPZih2aWRlby5jdXJyZW50VGltZSAqIDEwMCB8IDAgLyAxMDApIDwgMCkge1xuXHRcdFx0XHQvLyBjb25zb2xlLmxvZygnVXNlci1yZXF1ZXN0ZWQgc2Vla2luZycpO1xuXHRcdFx0XHRwbGF5ZXIuZHJpdmVyLmN1cnJlbnRUaW1lID0gdmlkZW8uY3VycmVudFRpbWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gb3ZlcmxvYWRBUEkodmlkZW8pIHtcblx0dmFyIHBsYXllciA9IHZpZGVvW+CyoF07XG5cdHZpZGVvW+CyoHBsYXldID0gdmlkZW8ucGxheTtcblx0dmlkZW9b4LKgcGF1c2VdID0gdmlkZW8ucGF1c2U7XG5cdHZpZGVvLnBsYXkgPSBwbGF5O1xuXHR2aWRlby5wYXVzZSA9IHBhdXNlO1xuXHRwcm94eVByb3BlcnR5KHZpZGVvLCAncGF1c2VkJywgcGxheWVyLmRyaXZlcik7XG5cdHByb3h5UHJvcGVydHkodmlkZW8sICdtdXRlZCcsIHBsYXllci5kcml2ZXIsIHRydWUpO1xuXHRwcm94eVByb3BlcnR5KHZpZGVvLCAncGxheWJhY2tSYXRlJywgcGxheWVyLmRyaXZlciwgdHJ1ZSk7XG5cdHByb3h5UHJvcGVydHkodmlkZW8sICdlbmRlZCcsIHBsYXllci5kcml2ZXIpO1xuXHRwcm94eVByb3BlcnR5KHZpZGVvLCAnbG9vcCcsIHBsYXllci5kcml2ZXIsIHRydWUpO1xuXHRwcmV2ZW50RXZlbnQodmlkZW8sICdzZWVraW5nJyk7XG5cdHByZXZlbnRFdmVudCh2aWRlbywgJ3NlZWtlZCcpO1xuXHRwcmV2ZW50RXZlbnQodmlkZW8sICd0aW1ldXBkYXRlJywg4LKgZXZlbnQsIGZhbHNlKTtcblx0cHJldmVudEV2ZW50KHZpZGVvLCAnZW5kZWQnLCDgsqBldmVudCwgZmFsc2UpOyAvLyBwcmV2ZW50IG9jY2FzaW9uYWwgbmF0aXZlIGVuZGVkIGV2ZW50c1xufVxuXG5mdW5jdGlvbiBlbmFibGVJbmxpbmVWaWRlbyh2aWRlbywgaGFzQXVkaW8sIG9ubHlXaGl0ZWxpc3RlZCkge1xuXHRpZiAoIGhhc0F1ZGlvID09PSB2b2lkIDAgKSBoYXNBdWRpbyA9IHRydWU7XG5cdGlmICggb25seVdoaXRlbGlzdGVkID09PSB2b2lkIDAgKSBvbmx5V2hpdGVsaXN0ZWQgPSB0cnVlO1xuXG5cdGlmICgob25seVdoaXRlbGlzdGVkICYmICFpc1doaXRlbGlzdGVkKSB8fCB2aWRlb1vgsqBdKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGFkZFBsYXllcih2aWRlbywgaGFzQXVkaW8pO1xuXHRvdmVybG9hZEFQSSh2aWRlbyk7XG5cdHZpZGVvLmNsYXNzTGlzdC5hZGQoJ0lJVicpO1xuXHRpZiAoIWhhc0F1ZGlvICYmIHZpZGVvLmF1dG9wbGF5KSB7XG5cdFx0dmlkZW8ucGxheSgpO1xuXHR9XG5cdGlmICghL2lQaG9uZXxpUG9kfGlQYWQvLnRlc3QobmF2aWdhdG9yLnBsYXRmb3JtKSkge1xuXHRcdGNvbnNvbGUud2FybignaXBob25lLWlubGluZS12aWRlbyBpcyBub3QgZ3VhcmFudGVlZCB0byB3b3JrIGluIGVtdWxhdGVkIGVudmlyb25tZW50cycpO1xuXHR9XG59XG5cbmVuYWJsZUlubGluZVZpZGVvLmlzV2hpdGVsaXN0ZWQgPSBpc1doaXRlbGlzdGVkO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVuYWJsZUlubGluZVZpZGVvOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGluZGV4ID0gdHlwZW9mIFN5bWJvbCA9PT0gJ3VuZGVmaW5lZCcgPyBmdW5jdGlvbiAoZGVzY3JpcHRpb24pIHtcblx0cmV0dXJuICdAJyArIChkZXNjcmlwdGlvbiB8fCAnQCcpICsgTWF0aC5yYW5kb20oKTtcbn0gOiBTeW1ib2w7XG5cbm1vZHVsZS5leHBvcnRzID0gaW5kZXg7IiwiLyohXG4gKiBFdmVudEVtaXR0ZXIgdjUuMi4yIC0gZ2l0LmlvL2VlXG4gKiBVbmxpY2Vuc2UgLSBodHRwOi8vdW5saWNlbnNlLm9yZy9cbiAqIE9saXZlciBDYWxkd2VsbCAtIGh0dHA6Ly9vbGkubWUudWsvXG4gKiBAcHJlc2VydmVcbiAqL1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqXG4gICAgICogQ2xhc3MgZm9yIG1hbmFnaW5nIGV2ZW50cy5cbiAgICAgKiBDYW4gYmUgZXh0ZW5kZWQgdG8gcHJvdmlkZSBldmVudCBmdW5jdGlvbmFsaXR5IGluIG90aGVyIGNsYXNzZXMuXG4gICAgICpcbiAgICAgKiBAY2xhc3MgRXZlbnRFbWl0dGVyIE1hbmFnZXMgZXZlbnQgcmVnaXN0ZXJpbmcgYW5kIGVtaXR0aW5nLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHt9XG5cbiAgICAvLyBTaG9ydGN1dHMgdG8gaW1wcm92ZSBzcGVlZCBhbmQgc2l6ZVxuICAgIHZhciBwcm90byA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGU7XG4gICAgdmFyIG9yaWdpbmFsR2xvYmFsVmFsdWUgPSBleHBvcnRzLkV2ZW50RW1pdHRlcjtcblxuICAgIC8qKlxuICAgICAqIEZpbmRzIHRoZSBpbmRleCBvZiB0aGUgbGlzdGVuZXIgZm9yIHRoZSBldmVudCBpbiBpdHMgc3RvcmFnZSBhcnJheS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb25bXX0gbGlzdGVuZXJzIEFycmF5IG9mIGxpc3RlbmVycyB0byBzZWFyY2ggdGhyb3VnaC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciBNZXRob2QgdG8gbG9vayBmb3IuXG4gICAgICogQHJldHVybiB7TnVtYmVyfSBJbmRleCBvZiB0aGUgc3BlY2lmaWVkIGxpc3RlbmVyLCAtMSBpZiBub3QgZm91bmRcbiAgICAgKiBAYXBpIHByaXZhdGVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpbmRleE9mTGlzdGVuZXIobGlzdGVuZXJzLCBsaXN0ZW5lcikge1xuICAgICAgICB2YXIgaSA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcnNbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWxpYXMgYSBtZXRob2Qgd2hpbGUga2VlcGluZyB0aGUgY29udGV4dCBjb3JyZWN0LCB0byBhbGxvdyBmb3Igb3ZlcndyaXRpbmcgb2YgdGFyZ2V0IG1ldGhvZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSB0YXJnZXQgbWV0aG9kLlxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgYWxpYXNlZCBtZXRob2RcbiAgICAgKiBAYXBpIHByaXZhdGVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhbGlhcyhuYW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBhbGlhc0Nsb3N1cmUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGxpc3RlbmVyIGFycmF5IGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICAgICAqIFdpbGwgaW5pdGlhbGlzZSB0aGUgZXZlbnQgb2JqZWN0IGFuZCBsaXN0ZW5lciBhcnJheXMgaWYgcmVxdWlyZWQuXG4gICAgICogV2lsbCByZXR1cm4gYW4gb2JqZWN0IGlmIHlvdSB1c2UgYSByZWdleCBzZWFyY2guIFRoZSBvYmplY3QgY29udGFpbnMga2V5cyBmb3IgZWFjaCBtYXRjaGVkIGV2ZW50LiBTbyAvYmFbcnpdLyBtaWdodCByZXR1cm4gYW4gb2JqZWN0IGNvbnRhaW5pbmcgYmFyIGFuZCBiYXouIEJ1dCBvbmx5IGlmIHlvdSBoYXZlIGVpdGhlciBkZWZpbmVkIHRoZW0gd2l0aCBkZWZpbmVFdmVudCBvciBhZGRlZCBzb21lIGxpc3RlbmVycyB0byB0aGVtLlxuICAgICAqIEVhY2ggcHJvcGVydHkgaW4gdGhlIG9iamVjdCByZXNwb25zZSBpcyBhbiBhcnJheSBvZiBsaXN0ZW5lciBmdW5jdGlvbnMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xSZWdFeHB9IGV2dCBOYW1lIG9mIHRoZSBldmVudCB0byByZXR1cm4gdGhlIGxpc3RlbmVycyBmcm9tLlxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9uW118T2JqZWN0fSBBbGwgbGlzdGVuZXIgZnVuY3Rpb25zIGZvciB0aGUgZXZlbnQuXG4gICAgICovXG4gICAgcHJvdG8uZ2V0TGlzdGVuZXJzID0gZnVuY3Rpb24gZ2V0TGlzdGVuZXJzKGV2dCkge1xuICAgICAgICB2YXIgZXZlbnRzID0gdGhpcy5fZ2V0RXZlbnRzKCk7XG4gICAgICAgIHZhciByZXNwb25zZTtcbiAgICAgICAgdmFyIGtleTtcblxuICAgICAgICAvLyBSZXR1cm4gYSBjb25jYXRlbmF0ZWQgYXJyYXkgb2YgYWxsIG1hdGNoaW5nIGV2ZW50cyBpZlxuICAgICAgICAvLyB0aGUgc2VsZWN0b3IgaXMgYSByZWd1bGFyIGV4cHJlc3Npb24uXG4gICAgICAgIGlmIChldnQgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgICAgIHJlc3BvbnNlID0ge307XG4gICAgICAgICAgICBmb3IgKGtleSBpbiBldmVudHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRzLmhhc093blByb3BlcnR5KGtleSkgJiYgZXZ0LnRlc3Qoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZVtrZXldID0gZXZlbnRzW2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzcG9uc2UgPSBldmVudHNbZXZ0XSB8fCAoZXZlbnRzW2V2dF0gPSBbXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRha2VzIGEgbGlzdCBvZiBsaXN0ZW5lciBvYmplY3RzIGFuZCBmbGF0dGVucyBpdCBpbnRvIGEgbGlzdCBvZiBsaXN0ZW5lciBmdW5jdGlvbnMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdFtdfSBsaXN0ZW5lcnMgUmF3IGxpc3RlbmVyIG9iamVjdHMuXG4gICAgICogQHJldHVybiB7RnVuY3Rpb25bXX0gSnVzdCB0aGUgbGlzdGVuZXIgZnVuY3Rpb25zLlxuICAgICAqL1xuICAgIHByb3RvLmZsYXR0ZW5MaXN0ZW5lcnMgPSBmdW5jdGlvbiBmbGF0dGVuTGlzdGVuZXJzKGxpc3RlbmVycykge1xuICAgICAgICB2YXIgZmxhdExpc3RlbmVycyA9IFtdO1xuICAgICAgICB2YXIgaTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBmbGF0TGlzdGVuZXJzLnB1c2gobGlzdGVuZXJzW2ldLmxpc3RlbmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmbGF0TGlzdGVuZXJzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBGZXRjaGVzIHRoZSByZXF1ZXN0ZWQgbGlzdGVuZXJzIHZpYSBnZXRMaXN0ZW5lcnMgYnV0IHdpbGwgYWx3YXlzIHJldHVybiB0aGUgcmVzdWx0cyBpbnNpZGUgYW4gb2JqZWN0LiBUaGlzIGlzIG1haW5seSBmb3IgaW50ZXJuYWwgdXNlIGJ1dCBvdGhlcnMgbWF5IGZpbmQgaXQgdXNlZnVsLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd8UmVnRXhwfSBldnQgTmFtZSBvZiB0aGUgZXZlbnQgdG8gcmV0dXJuIHRoZSBsaXN0ZW5lcnMgZnJvbS5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEFsbCBsaXN0ZW5lciBmdW5jdGlvbnMgZm9yIGFuIGV2ZW50IGluIGFuIG9iamVjdC5cbiAgICAgKi9cbiAgICBwcm90by5nZXRMaXN0ZW5lcnNBc09iamVjdCA9IGZ1bmN0aW9uIGdldExpc3RlbmVyc0FzT2JqZWN0KGV2dCkge1xuICAgICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5nZXRMaXN0ZW5lcnMoZXZ0KTtcbiAgICAgICAgdmFyIHJlc3BvbnNlO1xuXG4gICAgICAgIGlmIChsaXN0ZW5lcnMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgcmVzcG9uc2UgPSB7fTtcbiAgICAgICAgICAgIHJlc3BvbnNlW2V2dF0gPSBsaXN0ZW5lcnM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzcG9uc2UgfHwgbGlzdGVuZXJzO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBpc1ZhbGlkTGlzdGVuZXIgKGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgPT09ICdmdW5jdGlvbicgfHwgbGlzdGVuZXIgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH0gZWxzZSBpZiAobGlzdGVuZXIgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgcmV0dXJuIGlzVmFsaWRMaXN0ZW5lcihsaXN0ZW5lci5saXN0ZW5lcilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIGZ1bmN0aW9uIHRvIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gICAgICogVGhlIGxpc3RlbmVyIHdpbGwgbm90IGJlIGFkZGVkIGlmIGl0IGlzIGEgZHVwbGljYXRlLlxuICAgICAqIElmIHRoZSBsaXN0ZW5lciByZXR1cm5zIHRydWUgdGhlbiBpdCB3aWxsIGJlIHJlbW92ZWQgYWZ0ZXIgaXQgaXMgY2FsbGVkLlxuICAgICAqIElmIHlvdSBwYXNzIGEgcmVndWxhciBleHByZXNzaW9uIGFzIHRoZSBldmVudCBuYW1lIHRoZW4gdGhlIGxpc3RlbmVyIHdpbGwgYmUgYWRkZWQgdG8gYWxsIGV2ZW50cyB0aGF0IG1hdGNoIGl0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd8UmVnRXhwfSBldnQgTmFtZSBvZiB0aGUgZXZlbnQgdG8gYXR0YWNoIHRoZSBsaXN0ZW5lciB0by5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciBNZXRob2QgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGV2ZW50IGlzIGVtaXR0ZWQuIElmIHRoZSBmdW5jdGlvbiByZXR1cm5zIHRydWUgdGhlbiBpdCB3aWxsIGJlIHJlbW92ZWQgYWZ0ZXIgY2FsbGluZy5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEN1cnJlbnQgaW5zdGFuY2Ugb2YgRXZlbnRFbWl0dGVyIGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBwcm90by5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZExpc3RlbmVyKGV2dCwgbGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKCFpc1ZhbGlkTGlzdGVuZXIobGlzdGVuZXIpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLmdldExpc3RlbmVyc0FzT2JqZWN0KGV2dCk7XG4gICAgICAgIHZhciBsaXN0ZW5lcklzV3JhcHBlZCA9IHR5cGVvZiBsaXN0ZW5lciA9PT0gJ29iamVjdCc7XG4gICAgICAgIHZhciBrZXk7XG5cbiAgICAgICAgZm9yIChrZXkgaW4gbGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBpZiAobGlzdGVuZXJzLmhhc093blByb3BlcnR5KGtleSkgJiYgaW5kZXhPZkxpc3RlbmVyKGxpc3RlbmVyc1trZXldLCBsaXN0ZW5lcikgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzW2tleV0ucHVzaChsaXN0ZW5lcklzV3JhcHBlZCA/IGxpc3RlbmVyIDoge1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcjogbGlzdGVuZXIsXG4gICAgICAgICAgICAgICAgICAgIG9uY2U6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWxpYXMgb2YgYWRkTGlzdGVuZXJcbiAgICAgKi9cbiAgICBwcm90by5vbiA9IGFsaWFzKCdhZGRMaXN0ZW5lcicpO1xuXG4gICAgLyoqXG4gICAgICogU2VtaS1hbGlhcyBvZiBhZGRMaXN0ZW5lci4gSXQgd2lsbCBhZGQgYSBsaXN0ZW5lciB0aGF0IHdpbGwgYmVcbiAgICAgKiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQgYWZ0ZXIgaXRzIGZpcnN0IGV4ZWN1dGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfFJlZ0V4cH0gZXZ0IE5hbWUgb2YgdGhlIGV2ZW50IHRvIGF0dGFjaCB0aGUgbGlzdGVuZXIgdG8uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgTWV0aG9kIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBldmVudCBpcyBlbWl0dGVkLiBJZiB0aGUgZnVuY3Rpb24gcmV0dXJucyB0cnVlIHRoZW4gaXQgd2lsbCBiZSByZW1vdmVkIGFmdGVyIGNhbGxpbmcuXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBDdXJyZW50IGluc3RhbmNlIG9mIEV2ZW50RW1pdHRlciBmb3IgY2hhaW5pbmcuXG4gICAgICovXG4gICAgcHJvdG8uYWRkT25jZUxpc3RlbmVyID0gZnVuY3Rpb24gYWRkT25jZUxpc3RlbmVyKGV2dCwgbGlzdGVuZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkTGlzdGVuZXIoZXZ0LCB7XG4gICAgICAgICAgICBsaXN0ZW5lcjogbGlzdGVuZXIsXG4gICAgICAgICAgICBvbmNlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBbGlhcyBvZiBhZGRPbmNlTGlzdGVuZXIuXG4gICAgICovXG4gICAgcHJvdG8ub25jZSA9IGFsaWFzKCdhZGRPbmNlTGlzdGVuZXInKTtcblxuICAgIC8qKlxuICAgICAqIERlZmluZXMgYW4gZXZlbnQgbmFtZS4gVGhpcyBpcyByZXF1aXJlZCBpZiB5b3Ugd2FudCB0byB1c2UgYSByZWdleCB0byBhZGQgYSBsaXN0ZW5lciB0byBtdWx0aXBsZSBldmVudHMgYXQgb25jZS4gSWYgeW91IGRvbid0IGRvIHRoaXMgdGhlbiBob3cgZG8geW91IGV4cGVjdCBpdCB0byBrbm93IHdoYXQgZXZlbnQgdG8gYWRkIHRvPyBTaG91bGQgaXQganVzdCBhZGQgdG8gZXZlcnkgcG9zc2libGUgbWF0Y2ggZm9yIGEgcmVnZXg/IE5vLiBUaGF0IGlzIHNjYXJ5IGFuZCBiYWQuXG4gICAgICogWW91IG5lZWQgdG8gdGVsbCBpdCB3aGF0IGV2ZW50IG5hbWVzIHNob3VsZCBiZSBtYXRjaGVkIGJ5IGEgcmVnZXguXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZ0IE5hbWUgb2YgdGhlIGV2ZW50IHRvIGNyZWF0ZS5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEN1cnJlbnQgaW5zdGFuY2Ugb2YgRXZlbnRFbWl0dGVyIGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBwcm90by5kZWZpbmVFdmVudCA9IGZ1bmN0aW9uIGRlZmluZUV2ZW50KGV2dCkge1xuICAgICAgICB0aGlzLmdldExpc3RlbmVycyhldnQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVXNlcyBkZWZpbmVFdmVudCB0byBkZWZpbmUgbXVsdGlwbGUgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmdbXX0gZXZ0cyBBbiBhcnJheSBvZiBldmVudCBuYW1lcyB0byBkZWZpbmUuXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBDdXJyZW50IGluc3RhbmNlIG9mIEV2ZW50RW1pdHRlciBmb3IgY2hhaW5pbmcuXG4gICAgICovXG4gICAgcHJvdG8uZGVmaW5lRXZlbnRzID0gZnVuY3Rpb24gZGVmaW5lRXZlbnRzKGV2dHMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICB0aGlzLmRlZmluZUV2ZW50KGV2dHNbaV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgbGlzdGVuZXIgZnVuY3Rpb24gZnJvbSB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICAgICAqIFdoZW4gcGFzc2VkIGEgcmVndWxhciBleHByZXNzaW9uIGFzIHRoZSBldmVudCBuYW1lLCBpdCB3aWxsIHJlbW92ZSB0aGUgbGlzdGVuZXIgZnJvbSBhbGwgZXZlbnRzIHRoYXQgbWF0Y2ggaXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xSZWdFeHB9IGV2dCBOYW1lIG9mIHRoZSBldmVudCB0byByZW1vdmUgdGhlIGxpc3RlbmVyIGZyb20uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgTWV0aG9kIHRvIHJlbW92ZSBmcm9tIHRoZSBldmVudC5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEN1cnJlbnQgaW5zdGFuY2Ugb2YgRXZlbnRFbWl0dGVyIGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBwcm90by5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2dCwgbGlzdGVuZXIpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuZ2V0TGlzdGVuZXJzQXNPYmplY3QoZXZ0KTtcbiAgICAgICAgdmFyIGluZGV4O1xuICAgICAgICB2YXIga2V5O1xuXG4gICAgICAgIGZvciAoa2V5IGluIGxpc3RlbmVycykge1xuICAgICAgICAgICAgaWYgKGxpc3RlbmVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBpbmRleE9mTGlzdGVuZXIobGlzdGVuZXJzW2tleV0sIGxpc3RlbmVyKTtcblxuICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXJzW2tleV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWxpYXMgb2YgcmVtb3ZlTGlzdGVuZXJcbiAgICAgKi9cbiAgICBwcm90by5vZmYgPSBhbGlhcygncmVtb3ZlTGlzdGVuZXInKTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgbGlzdGVuZXJzIGluIGJ1bGsgdXNpbmcgdGhlIG1hbmlwdWxhdGVMaXN0ZW5lcnMgbWV0aG9kLlxuICAgICAqIElmIHlvdSBwYXNzIGFuIG9iamVjdCBhcyB0aGUgZmlyc3QgYXJndW1lbnQgeW91IGNhbiBhZGQgdG8gbXVsdGlwbGUgZXZlbnRzIGF0IG9uY2UuIFRoZSBvYmplY3Qgc2hvdWxkIGNvbnRhaW4ga2V5IHZhbHVlIHBhaXJzIG9mIGV2ZW50cyBhbmQgbGlzdGVuZXJzIG9yIGxpc3RlbmVyIGFycmF5cy4gWW91IGNhbiBhbHNvIHBhc3MgaXQgYW4gZXZlbnQgbmFtZSBhbmQgYW4gYXJyYXkgb2YgbGlzdGVuZXJzIHRvIGJlIGFkZGVkLlxuICAgICAqIFlvdSBjYW4gYWxzbyBwYXNzIGl0IGEgcmVndWxhciBleHByZXNzaW9uIHRvIGFkZCB0aGUgYXJyYXkgb2YgbGlzdGVuZXJzIHRvIGFsbCBldmVudHMgdGhhdCBtYXRjaCBpdC5cbiAgICAgKiBZZWFoLCB0aGlzIGZ1bmN0aW9uIGRvZXMgcXVpdGUgYSBiaXQuIFRoYXQncyBwcm9iYWJseSBhIGJhZCB0aGluZy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdHxSZWdFeHB9IGV2dCBBbiBldmVudCBuYW1lIGlmIHlvdSB3aWxsIHBhc3MgYW4gYXJyYXkgb2YgbGlzdGVuZXJzIG5leHQuIEFuIG9iamVjdCBpZiB5b3Ugd2lzaCB0byBhZGQgdG8gbXVsdGlwbGUgZXZlbnRzIGF0IG9uY2UuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbltdfSBbbGlzdGVuZXJzXSBBbiBvcHRpb25hbCBhcnJheSBvZiBsaXN0ZW5lciBmdW5jdGlvbnMgdG8gYWRkLlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gQ3VycmVudCBpbnN0YW5jZSBvZiBFdmVudEVtaXR0ZXIgZm9yIGNoYWluaW5nLlxuICAgICAqL1xuICAgIHByb3RvLmFkZExpc3RlbmVycyA9IGZ1bmN0aW9uIGFkZExpc3RlbmVycyhldnQsIGxpc3RlbmVycykge1xuICAgICAgICAvLyBQYXNzIHRocm91Z2ggdG8gbWFuaXB1bGF0ZUxpc3RlbmVyc1xuICAgICAgICByZXR1cm4gdGhpcy5tYW5pcHVsYXRlTGlzdGVuZXJzKGZhbHNlLCBldnQsIGxpc3RlbmVycyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgbGlzdGVuZXJzIGluIGJ1bGsgdXNpbmcgdGhlIG1hbmlwdWxhdGVMaXN0ZW5lcnMgbWV0aG9kLlxuICAgICAqIElmIHlvdSBwYXNzIGFuIG9iamVjdCBhcyB0aGUgZmlyc3QgYXJndW1lbnQgeW91IGNhbiByZW1vdmUgZnJvbSBtdWx0aXBsZSBldmVudHMgYXQgb25jZS4gVGhlIG9iamVjdCBzaG91bGQgY29udGFpbiBrZXkgdmFsdWUgcGFpcnMgb2YgZXZlbnRzIGFuZCBsaXN0ZW5lcnMgb3IgbGlzdGVuZXIgYXJyYXlzLlxuICAgICAqIFlvdSBjYW4gYWxzbyBwYXNzIGl0IGFuIGV2ZW50IG5hbWUgYW5kIGFuIGFycmF5IG9mIGxpc3RlbmVycyB0byBiZSByZW1vdmVkLlxuICAgICAqIFlvdSBjYW4gYWxzbyBwYXNzIGl0IGEgcmVndWxhciBleHByZXNzaW9uIHRvIHJlbW92ZSB0aGUgbGlzdGVuZXJzIGZyb20gYWxsIGV2ZW50cyB0aGF0IG1hdGNoIGl0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fFJlZ0V4cH0gZXZ0IEFuIGV2ZW50IG5hbWUgaWYgeW91IHdpbGwgcGFzcyBhbiBhcnJheSBvZiBsaXN0ZW5lcnMgbmV4dC4gQW4gb2JqZWN0IGlmIHlvdSB3aXNoIHRvIHJlbW92ZSBmcm9tIG11bHRpcGxlIGV2ZW50cyBhdCBvbmNlLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb25bXX0gW2xpc3RlbmVyc10gQW4gb3B0aW9uYWwgYXJyYXkgb2YgbGlzdGVuZXIgZnVuY3Rpb25zIHRvIHJlbW92ZS5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEN1cnJlbnQgaW5zdGFuY2Ugb2YgRXZlbnRFbWl0dGVyIGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBwcm90by5yZW1vdmVMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcnMoZXZ0LCBsaXN0ZW5lcnMpIHtcbiAgICAgICAgLy8gUGFzcyB0aHJvdWdoIHRvIG1hbmlwdWxhdGVMaXN0ZW5lcnNcbiAgICAgICAgcmV0dXJuIHRoaXMubWFuaXB1bGF0ZUxpc3RlbmVycyh0cnVlLCBldnQsIGxpc3RlbmVycyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEVkaXRzIGxpc3RlbmVycyBpbiBidWxrLiBUaGUgYWRkTGlzdGVuZXJzIGFuZCByZW1vdmVMaXN0ZW5lcnMgbWV0aG9kcyBib3RoIHVzZSB0aGlzIHRvIGRvIHRoZWlyIGpvYi4gWW91IHNob3VsZCByZWFsbHkgdXNlIHRob3NlIGluc3RlYWQsIHRoaXMgaXMgYSBsaXR0bGUgbG93ZXIgbGV2ZWwuXG4gICAgICogVGhlIGZpcnN0IGFyZ3VtZW50IHdpbGwgZGV0ZXJtaW5lIGlmIHRoZSBsaXN0ZW5lcnMgYXJlIHJlbW92ZWQgKHRydWUpIG9yIGFkZGVkIChmYWxzZSkuXG4gICAgICogSWYgeW91IHBhc3MgYW4gb2JqZWN0IGFzIHRoZSBzZWNvbmQgYXJndW1lbnQgeW91IGNhbiBhZGQvcmVtb3ZlIGZyb20gbXVsdGlwbGUgZXZlbnRzIGF0IG9uY2UuIFRoZSBvYmplY3Qgc2hvdWxkIGNvbnRhaW4ga2V5IHZhbHVlIHBhaXJzIG9mIGV2ZW50cyBhbmQgbGlzdGVuZXJzIG9yIGxpc3RlbmVyIGFycmF5cy5cbiAgICAgKiBZb3UgY2FuIGFsc28gcGFzcyBpdCBhbiBldmVudCBuYW1lIGFuZCBhbiBhcnJheSBvZiBsaXN0ZW5lcnMgdG8gYmUgYWRkZWQvcmVtb3ZlZC5cbiAgICAgKiBZb3UgY2FuIGFsc28gcGFzcyBpdCBhIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byBtYW5pcHVsYXRlIHRoZSBsaXN0ZW5lcnMgb2YgYWxsIGV2ZW50cyB0aGF0IG1hdGNoIGl0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtCb29sZWFufSByZW1vdmUgVHJ1ZSBpZiB5b3Ugd2FudCB0byByZW1vdmUgbGlzdGVuZXJzLCBmYWxzZSBpZiB5b3Ugd2FudCB0byBhZGQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fFJlZ0V4cH0gZXZ0IEFuIGV2ZW50IG5hbWUgaWYgeW91IHdpbGwgcGFzcyBhbiBhcnJheSBvZiBsaXN0ZW5lcnMgbmV4dC4gQW4gb2JqZWN0IGlmIHlvdSB3aXNoIHRvIGFkZC9yZW1vdmUgZnJvbSBtdWx0aXBsZSBldmVudHMgYXQgb25jZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9uW119IFtsaXN0ZW5lcnNdIEFuIG9wdGlvbmFsIGFycmF5IG9mIGxpc3RlbmVyIGZ1bmN0aW9ucyB0byBhZGQvcmVtb3ZlLlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gQ3VycmVudCBpbnN0YW5jZSBvZiBFdmVudEVtaXR0ZXIgZm9yIGNoYWluaW5nLlxuICAgICAqL1xuICAgIHByb3RvLm1hbmlwdWxhdGVMaXN0ZW5lcnMgPSBmdW5jdGlvbiBtYW5pcHVsYXRlTGlzdGVuZXJzKHJlbW92ZSwgZXZ0LCBsaXN0ZW5lcnMpIHtcbiAgICAgICAgdmFyIGk7XG4gICAgICAgIHZhciB2YWx1ZTtcbiAgICAgICAgdmFyIHNpbmdsZSA9IHJlbW92ZSA/IHRoaXMucmVtb3ZlTGlzdGVuZXIgOiB0aGlzLmFkZExpc3RlbmVyO1xuICAgICAgICB2YXIgbXVsdGlwbGUgPSByZW1vdmUgPyB0aGlzLnJlbW92ZUxpc3RlbmVycyA6IHRoaXMuYWRkTGlzdGVuZXJzO1xuXG4gICAgICAgIC8vIElmIGV2dCBpcyBhbiBvYmplY3QgdGhlbiBwYXNzIGVhY2ggb2YgaXRzIHByb3BlcnRpZXMgdG8gdGhpcyBtZXRob2RcbiAgICAgICAgaWYgKHR5cGVvZiBldnQgPT09ICdvYmplY3QnICYmICEoZXZ0IGluc3RhbmNlb2YgUmVnRXhwKSkge1xuICAgICAgICAgICAgZm9yIChpIGluIGV2dCkge1xuICAgICAgICAgICAgICAgIGlmIChldnQuaGFzT3duUHJvcGVydHkoaSkgJiYgKHZhbHVlID0gZXZ0W2ldKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBQYXNzIHRoZSBzaW5nbGUgbGlzdGVuZXIgc3RyYWlnaHQgdGhyb3VnaCB0byB0aGUgc2luZ3VsYXIgbWV0aG9kXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpbmdsZS5jYWxsKHRoaXMsIGksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSBwYXNzIGJhY2sgdG8gdGhlIG11bHRpcGxlIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBtdWx0aXBsZS5jYWxsKHRoaXMsIGksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFNvIGV2dCBtdXN0IGJlIGEgc3RyaW5nXG4gICAgICAgICAgICAvLyBBbmQgbGlzdGVuZXJzIG11c3QgYmUgYW4gYXJyYXkgb2YgbGlzdGVuZXJzXG4gICAgICAgICAgICAvLyBMb29wIG92ZXIgaXQgYW5kIHBhc3MgZWFjaCBvbmUgdG8gdGhlIG11bHRpcGxlIG1ldGhvZFxuICAgICAgICAgICAgaSA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICAgICAgc2luZ2xlLmNhbGwodGhpcywgZXZ0LCBsaXN0ZW5lcnNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIGxpc3RlbmVycyBmcm9tIGEgc3BlY2lmaWVkIGV2ZW50LlxuICAgICAqIElmIHlvdSBkbyBub3Qgc3BlY2lmeSBhbiBldmVudCB0aGVuIGFsbCBsaXN0ZW5lcnMgd2lsbCBiZSByZW1vdmVkLlxuICAgICAqIFRoYXQgbWVhbnMgZXZlcnkgZXZlbnQgd2lsbCBiZSBlbXB0aWVkLlxuICAgICAqIFlvdSBjYW4gYWxzbyBwYXNzIGEgcmVnZXggdG8gcmVtb3ZlIGFsbCBldmVudHMgdGhhdCBtYXRjaCBpdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfFJlZ0V4cH0gW2V2dF0gT3B0aW9uYWwgbmFtZSBvZiB0aGUgZXZlbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLiBXaWxsIHJlbW92ZSBmcm9tIGV2ZXJ5IGV2ZW50IGlmIG5vdCBwYXNzZWQuXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBDdXJyZW50IGluc3RhbmNlIG9mIEV2ZW50RW1pdHRlciBmb3IgY2hhaW5pbmcuXG4gICAgICovXG4gICAgcHJvdG8ucmVtb3ZlRXZlbnQgPSBmdW5jdGlvbiByZW1vdmVFdmVudChldnQpIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgZXZ0O1xuICAgICAgICB2YXIgZXZlbnRzID0gdGhpcy5fZ2V0RXZlbnRzKCk7XG4gICAgICAgIHZhciBrZXk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIGRpZmZlcmVudCB0aGluZ3MgZGVwZW5kaW5nIG9uIHRoZSBzdGF0ZSBvZiBldnRcbiAgICAgICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgYWxsIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudFxuICAgICAgICAgICAgZGVsZXRlIGV2ZW50c1tldnRdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGV2dCBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgICAgICAgLy8gUmVtb3ZlIGFsbCBldmVudHMgbWF0Y2hpbmcgdGhlIHJlZ2V4LlxuICAgICAgICAgICAgZm9yIChrZXkgaW4gZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50cy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGV2dC50ZXN0KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGV2ZW50c1trZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSBhbGwgbGlzdGVuZXJzIGluIGFsbCBldmVudHNcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWxpYXMgb2YgcmVtb3ZlRXZlbnQuXG4gICAgICpcbiAgICAgKiBBZGRlZCB0byBtaXJyb3IgdGhlIG5vZGUgQVBJLlxuICAgICAqL1xuICAgIHByb3RvLnJlbW92ZUFsbExpc3RlbmVycyA9IGFsaWFzKCdyZW1vdmVFdmVudCcpO1xuXG4gICAgLyoqXG4gICAgICogRW1pdHMgYW4gZXZlbnQgb2YgeW91ciBjaG9pY2UuXG4gICAgICogV2hlbiBlbWl0dGVkLCBldmVyeSBsaXN0ZW5lciBhdHRhY2hlZCB0byB0aGF0IGV2ZW50IHdpbGwgYmUgZXhlY3V0ZWQuXG4gICAgICogSWYgeW91IHBhc3MgdGhlIG9wdGlvbmFsIGFyZ3VtZW50IGFycmF5IHRoZW4gdGhvc2UgYXJndW1lbnRzIHdpbGwgYmUgcGFzc2VkIHRvIGV2ZXJ5IGxpc3RlbmVyIHVwb24gZXhlY3V0aW9uLlxuICAgICAqIEJlY2F1c2UgaXQgdXNlcyBgYXBwbHlgLCB5b3VyIGFycmF5IG9mIGFyZ3VtZW50cyB3aWxsIGJlIHBhc3NlZCBhcyBpZiB5b3Ugd3JvdGUgdGhlbSBvdXQgc2VwYXJhdGVseS5cbiAgICAgKiBTbyB0aGV5IHdpbGwgbm90IGFycml2ZSB3aXRoaW4gdGhlIGFycmF5IG9uIHRoZSBvdGhlciBzaWRlLCB0aGV5IHdpbGwgYmUgc2VwYXJhdGUuXG4gICAgICogWW91IGNhbiBhbHNvIHBhc3MgYSByZWd1bGFyIGV4cHJlc3Npb24gdG8gZW1pdCB0byBhbGwgZXZlbnRzIHRoYXQgbWF0Y2ggaXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xSZWdFeHB9IGV2dCBOYW1lIG9mIHRoZSBldmVudCB0byBlbWl0IGFuZCBleGVjdXRlIGxpc3RlbmVycyBmb3IuXG4gICAgICogQHBhcmFtIHtBcnJheX0gW2FyZ3NdIE9wdGlvbmFsIGFycmF5IG9mIGFyZ3VtZW50cyB0byBiZSBwYXNzZWQgdG8gZWFjaCBsaXN0ZW5lci5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEN1cnJlbnQgaW5zdGFuY2Ugb2YgRXZlbnRFbWl0dGVyIGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBwcm90by5lbWl0RXZlbnQgPSBmdW5jdGlvbiBlbWl0RXZlbnQoZXZ0LCBhcmdzKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lcnNNYXAgPSB0aGlzLmdldExpc3RlbmVyc0FzT2JqZWN0KGV2dCk7XG4gICAgICAgIHZhciBsaXN0ZW5lcnM7XG4gICAgICAgIHZhciBsaXN0ZW5lcjtcbiAgICAgICAgdmFyIGk7XG4gICAgICAgIHZhciBrZXk7XG4gICAgICAgIHZhciByZXNwb25zZTtcblxuICAgICAgICBmb3IgKGtleSBpbiBsaXN0ZW5lcnNNYXApIHtcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcnNNYXAuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVyc01hcFtrZXldLnNsaWNlKDApO1xuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgbGlzdGVuZXIgcmV0dXJucyB0cnVlIHRoZW4gaXQgc2hhbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZSBldmVudFxuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgZnVuY3Rpb24gaXMgZXhlY3V0ZWQgZWl0aGVyIHdpdGggYSBiYXNpYyBjYWxsIG9yIGFuIGFwcGx5IGlmIHRoZXJlIGlzIGFuIGFyZ3MgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGxpc3RlbmVyLm9uY2UgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZ0LCBsaXN0ZW5lci5saXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IGxpc3RlbmVyLmxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3MgfHwgW10pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSA9PT0gdGhpcy5fZ2V0T25jZVJldHVyblZhbHVlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZ0LCBsaXN0ZW5lci5saXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWxpYXMgb2YgZW1pdEV2ZW50XG4gICAgICovXG4gICAgcHJvdG8udHJpZ2dlciA9IGFsaWFzKCdlbWl0RXZlbnQnKTtcblxuICAgIC8qKlxuICAgICAqIFN1YnRseSBkaWZmZXJlbnQgZnJvbSBlbWl0RXZlbnQgaW4gdGhhdCBpdCB3aWxsIHBhc3MgaXRzIGFyZ3VtZW50cyBvbiB0byB0aGUgbGlzdGVuZXJzLCBhcyBvcHBvc2VkIHRvIHRha2luZyBhIHNpbmdsZSBhcnJheSBvZiBhcmd1bWVudHMgdG8gcGFzcyBvbi5cbiAgICAgKiBBcyB3aXRoIGVtaXRFdmVudCwgeW91IGNhbiBwYXNzIGEgcmVnZXggaW4gcGxhY2Ugb2YgdGhlIGV2ZW50IG5hbWUgdG8gZW1pdCB0byBhbGwgZXZlbnRzIHRoYXQgbWF0Y2ggaXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xSZWdFeHB9IGV2dCBOYW1lIG9mIHRoZSBldmVudCB0byBlbWl0IGFuZCBleGVjdXRlIGxpc3RlbmVycyBmb3IuXG4gICAgICogQHBhcmFtIHsuLi4qfSBPcHRpb25hbCBhZGRpdGlvbmFsIGFyZ3VtZW50cyB0byBiZSBwYXNzZWQgdG8gZWFjaCBsaXN0ZW5lci5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEN1cnJlbnQgaW5zdGFuY2Ugb2YgRXZlbnRFbWl0dGVyIGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBwcm90by5lbWl0ID0gZnVuY3Rpb24gZW1pdChldnQpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5lbWl0RXZlbnQoZXZ0LCBhcmdzKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgY3VycmVudCB2YWx1ZSB0byBjaGVjayBhZ2FpbnN0IHdoZW4gZXhlY3V0aW5nIGxpc3RlbmVycy4gSWYgYVxuICAgICAqIGxpc3RlbmVycyByZXR1cm4gdmFsdWUgbWF0Y2hlcyB0aGUgb25lIHNldCBoZXJlIHRoZW4gaXQgd2lsbCBiZSByZW1vdmVkXG4gICAgICogYWZ0ZXIgZXhlY3V0aW9uLiBUaGlzIHZhbHVlIGRlZmF1bHRzIHRvIHRydWUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSBuZXcgdmFsdWUgdG8gY2hlY2sgZm9yIHdoZW4gZXhlY3V0aW5nIGxpc3RlbmVycy5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEN1cnJlbnQgaW5zdGFuY2Ugb2YgRXZlbnRFbWl0dGVyIGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBwcm90by5zZXRPbmNlUmV0dXJuVmFsdWUgPSBmdW5jdGlvbiBzZXRPbmNlUmV0dXJuVmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fb25jZVJldHVyblZhbHVlID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBGZXRjaGVzIHRoZSBjdXJyZW50IHZhbHVlIHRvIGNoZWNrIGFnYWluc3Qgd2hlbiBleGVjdXRpbmcgbGlzdGVuZXJzLiBJZlxuICAgICAqIHRoZSBsaXN0ZW5lcnMgcmV0dXJuIHZhbHVlIG1hdGNoZXMgdGhpcyBvbmUgdGhlbiBpdCBzaG91bGQgYmUgcmVtb3ZlZFxuICAgICAqIGF1dG9tYXRpY2FsbHkuIEl0IHdpbGwgcmV0dXJuIHRydWUgYnkgZGVmYXVsdC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4geyp8Qm9vbGVhbn0gVGhlIGN1cnJlbnQgdmFsdWUgdG8gY2hlY2sgZm9yIG9yIHRoZSBkZWZhdWx0LCB0cnVlLlxuICAgICAqIEBhcGkgcHJpdmF0ZVxuICAgICAqL1xuICAgIHByb3RvLl9nZXRPbmNlUmV0dXJuVmFsdWUgPSBmdW5jdGlvbiBfZ2V0T25jZVJldHVyblZhbHVlKCkge1xuICAgICAgICBpZiAodGhpcy5oYXNPd25Qcm9wZXJ0eSgnX29uY2VSZXR1cm5WYWx1ZScpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fb25jZVJldHVyblZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRmV0Y2hlcyB0aGUgZXZlbnRzIG9iamVjdCBhbmQgY3JlYXRlcyBvbmUgaWYgcmVxdWlyZWQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBldmVudHMgc3RvcmFnZSBvYmplY3QuXG4gICAgICogQGFwaSBwcml2YXRlXG4gICAgICovXG4gICAgcHJvdG8uX2dldEV2ZW50cyA9IGZ1bmN0aW9uIF9nZXRFdmVudHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudHMgfHwgKHRoaXMuX2V2ZW50cyA9IHt9KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV2ZXJ0cyB0aGUgZ2xvYmFsIHtAbGluayBFdmVudEVtaXR0ZXJ9IHRvIGl0cyBwcmV2aW91cyB2YWx1ZSBhbmQgcmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGlzIHZlcnNpb24uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gTm9uIGNvbmZsaWN0aW5nIEV2ZW50RW1pdHRlciBjbGFzcy5cbiAgICAgKi9cbiAgICBFdmVudEVtaXR0ZXIubm9Db25mbGljdCA9IGZ1bmN0aW9uIG5vQ29uZmxpY3QoKSB7XG4gICAgICAgIGV4cG9ydHMuRXZlbnRFbWl0dGVyID0gb3JpZ2luYWxHbG9iYWxWYWx1ZTtcbiAgICAgICAgcmV0dXJuIEV2ZW50RW1pdHRlcjtcbiAgICB9O1xuXG4gICAgLy8gRXhwb3NlIHRoZSBjbGFzcyBlaXRoZXIgdmlhIEFNRCwgQ29tbW9uSlMgb3IgdGhlIGdsb2JhbCBvYmplY3RcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gRXZlbnRFbWl0dGVyO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpe1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGV4cG9ydHMuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuICAgIH1cbn0odGhpcyB8fCB7fSkpO1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgeyBQbGF5ZXIsIEFuaW1hdGlvblNldHRpbmdzIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IEJhc2VDYW52YXMgZnJvbSAnLi9CYXNlQ2FudmFzJztcbmltcG9ydCB7IG1lcmdlT3B0aW9ucywgZWFzZUZ1bmN0aW9ucyB9IGZyb20gJy4uL3V0aWxzJztcblxudHlwZSBUaW1lbGluZSA9IHtcbiAgICBhY3RpdmU6IGJvb2xlYW47XG4gICAgaW5pdGlhbGl6ZWQ6IGJvb2xlYW47XG4gICAgY29tcGxldGVkOiBib29sZWFuO1xuICAgIHN0YXJ0VmFsdWU6IGFueTtcbiAgICBieVZhbHVlOiBhbnk7XG4gICAgZW5kVmFsdWU6IGFueTtcbiAgICBlYXNlPzogRnVuY3Rpb247XG4gICAgb25Db21wbGV0ZT86IEZ1bmN0aW9uO1xuICAgIGtleVBvaW50OiBudW1iZXI7XG4gICAgZHVyYXRpb246IG51bWJlcjtcbiAgICBiZWdpblRpbWU6IG51bWJlcjtcbiAgICBlbmRUaW1lOiBudW1iZXI7XG4gICAgZnJvbT86IGFueTtcbiAgICB0bzogYW55O1xufVxuXG5jbGFzcyBBbmltYXRpb24ge1xuICAgIF9wbGF5ZXI6IFBsYXllcjtcbiAgICBfb3B0aW9uczoge1xuICAgICAgICBhbmltYXRpb246IEFuaW1hdGlvblNldHRpbmdzW107XG4gICAgICAgIGNhbnZhczogQmFzZUNhbnZhc1xuICAgIH07XG4gICAgX2NhbnZhczogQmFzZUNhbnZhcztcbiAgICBfdGltZWxpbmU6IFRpbWVsaW5lW107XG4gICAgX2FjdGl2ZTogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiB7YW5pbWF0aW9uOiBBbmltYXRpb25TZXR0aW5nc1tdLCBjYW52YXM6IEJhc2VDYW52YXN9KXtcbiAgICAgICAgdGhpcy5fcGxheWVyID0gcGxheWVyO1xuICAgICAgICB0aGlzLl9vcHRpb25zID0gbWVyZ2VPcHRpb25zKHt9LCB0aGlzLl9vcHRpb25zKTtcbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IG1lcmdlT3B0aW9ucyh0aGlzLl9vcHRpb25zLCBvcHRpb25zKTtcblxuICAgICAgICB0aGlzLl9jYW52YXMgPSB0aGlzLl9vcHRpb25zLmNhbnZhcztcbiAgICAgICAgdGhpcy5fdGltZWxpbmUgPSBbXTtcblxuICAgICAgICB0aGlzLl9vcHRpb25zLmFuaW1hdGlvbi5mb3JFYWNoKChvYmo6IEFuaW1hdGlvblNldHRpbmdzKSA9PntcbiAgICAgICAgICAgIHRoaXMuYWRkVGltZWxpbmUob2JqKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkVGltZWxpbmUob3B0OiBBbmltYXRpb25TZXR0aW5ncyl7XG4gICAgICAgIGxldCB0aW1lbGluZTogVGltZWxpbmUgPSB7XG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgICAgICAgaW5pdGlhbGl6ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgY29tcGxldGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHN0YXJ0VmFsdWU6IHt9LFxuICAgICAgICAgICAgYnlWYWx1ZToge30sXG4gICAgICAgICAgICBlbmRWYWx1ZToge30sXG4gICAgICAgICAgICBrZXlQb2ludDogb3B0LmtleVBvaW50LFxuICAgICAgICAgICAgZHVyYXRpb246IG9wdC5kdXJhdGlvbixcbiAgICAgICAgICAgIGJlZ2luVGltZTogSW5maW5pdHksXG4gICAgICAgICAgICBlbmRUaW1lOiBJbmZpbml0eSxcbiAgICAgICAgICAgIG9uQ29tcGxldGU6IG9wdC5vbkNvbXBsZXRlLFxuICAgICAgICAgICAgZnJvbTogb3B0LmZyb20sXG4gICAgICAgICAgICB0bzogb3B0LnRvXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYodHlwZW9mIG9wdC5lYXNlID09PSBcInN0cmluZ1wiKXtcbiAgICAgICAgICAgIHRpbWVsaW5lLmVhc2UgPSBlYXNlRnVuY3Rpb25zW29wdC5lYXNlXTtcbiAgICAgICAgfVxuICAgICAgICBpZih0eXBlb2Ygb3B0LmVhc2UgPT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgdGltZWxpbmUuZWFzZSA9IGVhc2VGdW5jdGlvbnMubGluZWFyO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdGltZWxpbmUucHVzaCh0aW1lbGluZSk7XG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnRzKCk7XG4gICAgfVxuXG4gICAgaW5pdGlhbFRpbWVsaW5lKHRpbWVsaW5lOiBUaW1lbGluZSl7XG4gICAgICAgIGZvcihsZXQga2V5IGluIHRpbWVsaW5lLnRvKXtcbiAgICAgICAgICAgIGlmKHRpbWVsaW5lLnRvLmhhc093blByb3BlcnR5KGtleSkpe1xuICAgICAgICAgICAgICAgIGxldCBmcm9tID0gdGltZWxpbmUuZnJvbT8gKHR5cGVvZiB0aW1lbGluZS5mcm9tW2tleV0gIT09IFwidW5kZWZpbmVkXCI/IHRpbWVsaW5lLmZyb21ba2V5XSA6IHRoaXMuX2NhbnZhc1tgXyR7a2V5fWBdKSA6IHRoaXMuX2NhbnZhc1tgXyR7a2V5fWBdO1xuICAgICAgICAgICAgICAgIHRpbWVsaW5lLnN0YXJ0VmFsdWVba2V5XSA9IGZyb207XG4gICAgICAgICAgICAgICAgdGltZWxpbmUuZW5kVmFsdWVba2V5XSA9IHRpbWVsaW5lLnRvW2tleV07XG4gICAgICAgICAgICAgICAgdGltZWxpbmUuYnlWYWx1ZVtrZXldICA9IHRpbWVsaW5lLnRvW2tleV0gLSBmcm9tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvY2Vzc1RpbWVsaW5lKHRpbWVsaW5lOiBUaW1lbGluZSwgYW5pbWF0aW9uVGltZTogbnVtYmVyKXtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRpbWVsaW5lLnRvKXtcbiAgICAgICAgICAgIGlmICh0aW1lbGluZS50by5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5ld1ZhbCA9IHRpbWVsaW5lLmVhc2UgJiYgdGltZWxpbmUuZWFzZShhbmltYXRpb25UaW1lLCB0aW1lbGluZS5zdGFydFZhbHVlW2tleV0sIHRpbWVsaW5lLmJ5VmFsdWVba2V5XSwgdGltZWxpbmUuZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgIGlmKGtleSA9PT0gXCJmb3ZcIil7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhbnZhcy5fY2FtZXJhLmZvdiA9IG5ld1ZhbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FudmFzLl9jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYW52YXNbYF8ke2tleX1gXSA9IG5ld1ZhbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhdHRhY2hFdmVudHMoKXtcbiAgICAgICAgdGhpcy5fYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fY2FudmFzLmFkZExpc3RlbmVyKFwiYmVmb3JlUmVuZGVyXCIsIHRoaXMucmVuZGVyQW5pbWF0aW9uLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9wbGF5ZXIub24oXCJzZWVrZWRcIiwgdGhpcy5oYW5kbGVWaWRlb1NlZWsuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgZGV0YWNoRXZlbnRzKCl7XG4gICAgICAgIHRoaXMuX2FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9jYW52YXMuY29udHJvbGFibGUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9jYW52YXMucmVtb3ZlTGlzdGVuZXIoXCJiZWZvcmVSZW5kZXJcIiwgdGhpcy5yZW5kZXJBbmltYXRpb24uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgaGFuZGxlVmlkZW9TZWVrKCl7XG4gICAgICAgIGxldCBjdXJyZW50VGltZSA9IHRoaXMuX3BsYXllci5nZXRWaWRlb0VsKCkuY3VycmVudFRpbWUgKiAxMDAwO1xuICAgICAgICBsZXQgcmVzZXRUaW1lbGluZSA9IDA7XG4gICAgICAgIHRoaXMuX3RpbWVsaW5lLmZvckVhY2goKHRpbWVsaW5lOiBUaW1lbGluZSk9PntcbiAgICAgICAgICAgIGxldCByZXMgPSB0aW1lbGluZS5rZXlQb2ludCA+PSBjdXJyZW50VGltZSB8fCAodGltZWxpbmUua2V5UG9pbnQgPD0gY3VycmVudFRpbWUgJiYgKHRpbWVsaW5lLmtleVBvaW50ICsgdGltZWxpbmUuZHVyYXRpb24pID49IGN1cnJlbnRUaW1lKTtcbiAgICAgICAgICAgIGlmKHJlcyl7XG4gICAgICAgICAgICAgICAgcmVzZXRUaW1lbGluZSsrO1xuICAgICAgICAgICAgICAgIHRpbWVsaW5lLmNvbXBsZXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRpbWVsaW5lLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmKHJlc2V0VGltZWxpbmUgPiAwICYmICF0aGlzLl9hY3RpdmUpe1xuICAgICAgICAgICAgdGhpcy5hdHRhY2hFdmVudHMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlckFuaW1hdGlvbigpe1xuICAgICAgICBsZXQgY3VycmVudFRpbWUgPSB0aGlzLl9wbGF5ZXIuZ2V0VmlkZW9FbCgpLmN1cnJlbnRUaW1lICogMTAwMDtcbiAgICAgICAgbGV0IGNvbXBsZXRlVGltZWxpbmUgPSAwO1xuICAgICAgICBsZXQgaW5BY3RpdmVUaW1lbGluZSA9IDA7XG4gICAgICAgIHRoaXMuX3RpbWVsaW5lLmZpbHRlcigodGltZWxpbmU6IFRpbWVsaW5lKT0+e1xuICAgICAgICAgICAgaWYodGltZWxpbmUuY29tcGxldGVkKSB7XG4gICAgICAgICAgICAgICAgY29tcGxldGVUaW1lbGluZSsrO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCByZXMgPSB0aW1lbGluZS5rZXlQb2ludCA8PSBjdXJyZW50VGltZSAmJiAodGltZWxpbmUua2V5UG9pbnQgKyB0aW1lbGluZS5kdXJhdGlvbikgPiBjdXJyZW50VGltZTtcbiAgICAgICAgICAgIHRpbWVsaW5lLmFjdGl2ZSA9IHJlcztcbiAgICAgICAgICAgIGlmKHRpbWVsaW5lLmFjdGl2ZSA9PT0gZmFsc2UpIGluQWN0aXZlVGltZWxpbmUrKztcblxuICAgICAgICAgICAgaWYocmVzICYmICF0aW1lbGluZS5pbml0aWFsaXplZCl7XG4gICAgICAgICAgICAgICAgdGltZWxpbmUuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRpbWVsaW5lLmJlZ2luVGltZSA9IHRpbWVsaW5lLmtleVBvaW50O1xuICAgICAgICAgICAgICAgIHRpbWVsaW5lLmVuZFRpbWUgPSB0aW1lbGluZS5iZWdpblRpbWUgKyB0aW1lbGluZS5kdXJhdGlvbjtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxUaW1lbGluZSh0aW1lbGluZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZih0aW1lbGluZS5lbmRUaW1lIDw9IGN1cnJlbnRUaW1lKXtcbiAgICAgICAgICAgICAgICB0aW1lbGluZS5jb21wbGV0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc1RpbWVsaW5lKHRpbWVsaW5lLCB0aW1lbGluZS5kdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgaWYodGltZWxpbmUub25Db21wbGV0ZSl7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVsaW5lLm9uQ29tcGxldGUuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9KS5mb3JFYWNoKCh0aW1lbGluZTogVGltZWxpbmUpPT57XG4gICAgICAgICAgICBsZXQgYW5pbWF0aW9uVGltZSA9IGN1cnJlbnRUaW1lIC0gdGltZWxpbmUuYmVnaW5UaW1lO1xuICAgICAgICAgICAgdGhpcy5wcm9jZXNzVGltZWxpbmUodGltZWxpbmUsIGFuaW1hdGlvblRpbWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9jYW52YXMuY29udHJvbGFibGUgPSBpbkFjdGl2ZVRpbWVsaW5lID09PSB0aGlzLl90aW1lbGluZS5sZW5ndGg7XG5cbiAgICAgICAgaWYoY29tcGxldGVUaW1lbGluZSA9PT0gdGhpcy5fdGltZWxpbmUubGVuZ3RoKXtcbiAgICAgICAgICAgIHRoaXMuZGV0YWNoRXZlbnRzKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFuaW1hdGlvbjsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7IFBsYXllciwgU2V0dGluZ3MsIFBvaW50LCBMb2NhdGlvbiB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBUSFJFRSBmcm9tIFwidGhyZWVcIjtcbmltcG9ydCBDb21wb25lbnQgZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IEhlbHBlckNhbnZhcyBmcm9tICcuL0hlbHBlckNhbnZhcyc7XG5pbXBvcnQgeyBzdXBwb3J0VmlkZW9UZXh0dXJlLCBnZXRUb3VjaGVzRGlzdGFuY2UsIG1vYmlsZUFuZFRhYmxldGNoZWNrIH0gZnJvbSAnLi4vdXRpbHMnO1xuXG5jb25zdCBIQVZFX0NVUlJFTlRfREFUQSA9IDI7XG5cbmNsYXNzIEJhc2VDYW52YXMgZXh0ZW5kcyBDb21wb25lbnR7XG4gICAgLyoqXG4gICAgICogRGltZW5zaW9uXG4gICAgICovXG4gICAgX3dpZHRoOiBudW1iZXI7XG4gICAgX2hlaWdodDogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogUG9zaXRpb25cbiAgICAgKi9cbiAgICBfbG9uOiBudW1iZXI7XG4gICAgX2xhdDogbnVtYmVyO1xuICAgIF9waGk6IG51bWJlcjtcbiAgICBfdGhldGE6IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFRocmVlLmpzXG4gICAgICovXG4gICAgX2hlbHBlckNhbnZhczogSGVscGVyQ2FudmFzO1xuICAgIF9yZW5kZXJlcjogYW55O1xuICAgIF90ZXh0dXJlOiBhbnk7XG4gICAgX3NjZW5lOiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiBJbnRlcmFjdGlvblxuICAgICAqL1xuICAgIF9jb250cm9sYWJsZTogYm9vbGVhbjtcbiAgICBfVlJNb2RlOiBib29sZWFuO1xuICAgIF9tb3VzZURvd246IGJvb2xlYW47XG4gICAgX21vdXNlRG93blBvaW50ZXI6IFBvaW50O1xuICAgIF9tb3VzZURvd25Mb2NhdGlvbjogTG9jYXRpb247XG4gICAgX2FjY2VsZWN0b3I6IFBvaW50O1xuXG4gICAgX2lzVXNlckludGVyYWN0aW5nOiBib29sZWFuO1xuICAgIF9pc1VzZXJQaW5jaDogYm9vbGVhbjtcbiAgICBfbXVsdGlUb3VjaERpc3RhbmNlOiBudW1iZXI7XG5cbiAgICBfcmVxdWVzdEFuaW1hdGlvbklkOiB3aW5kb3c7XG4gICAgX3RpbWU6IG51bWJlcjtcbiAgICBfcnVuT25Nb2JpbGU6IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBCYXNlIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHBsYXllclxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXIsIG9wdGlvbnM6IFNldHRpbmdzLCByZW5kZXJFbGVtZW50OiBIVE1MRWxlbWVudCl7XG4gICAgICAgIHN1cGVyKHBsYXllciwgb3B0aW9ucywgcmVuZGVyRWxlbWVudCk7XG4gICAgICAgIHRoaXMuX3dpZHRoID0gdGhpcy5wbGF5ZXIuZWwoKS5vZmZzZXRXaWR0aCwgdGhpcy5faGVpZ2h0ID0gdGhpcy5wbGF5ZXIuZWwoKS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIHRoaXMuX2xvbiA9IHRoaXMub3B0aW9ucy5pbml0TG9uLCB0aGlzLl9sYXQgPSB0aGlzLm9wdGlvbnMuaW5pdExhdCwgdGhpcy5fcGhpID0gMCwgdGhpcy5fdGhldGEgPSAwO1xuICAgICAgICB0aGlzLl9hY2NlbGVjdG9yID0ge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDBcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0U2l6ZSh0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0KTtcblxuICAgICAgICAvL2luaXQgaW50ZXJhY3Rpb25cbiAgICAgICAgdGhpcy5fbW91c2VEb3duID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2lzVXNlckludGVyYWN0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3J1bk9uTW9iaWxlID0gbW9iaWxlQW5kVGFibGV0Y2hlY2soKTtcbiAgICAgICAgdGhpcy5fVlJNb2RlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2NvbnRyb2xhYmxlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLl9tb3VzZURvd25Qb2ludGVyID0ge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDBcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9tb3VzZURvd25Mb2NhdGlvbiA9IHtcbiAgICAgICAgICAgIExhdDogMCxcbiAgICAgICAgICAgIExvbjogMFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuYXR0YWNoQ29udHJvbEV2ZW50cygpO1xuICAgIH1cblxuXG4gICAgY3JlYXRlRWwodGFnTmFtZT86IHN0cmluZyA9IFwiZGl2XCIsIHByb3BlcnRpZXM/OiBhbnksIGF0dHJpYnV0ZXM/OiBhbnkpOiBIVE1MRWxlbWVudHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGluaXRpYWwgd2ViZ2wgcmVuZGVyXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKCk7XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFBpeGVsUmF0aW8od2luZG93LmRldmljZVBpeGVsUmF0aW8pO1xuICAgICAgICB0aGlzLl9yZW5kZXJlci5hdXRvQ2xlYXIgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcigweDAwMDAwMCwgMSk7XG5cbiAgICAgICAgY29uc3QgcmVuZGVyRWxlbWVudCA9IHRoaXMuX3JlbmRlckVsZW1lbnQ7XG5cbiAgICAgICAgaWYocmVuZGVyRWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwidmlkZW9cIiAmJiAodGhpcy5vcHRpb25zLnVzZUhlbHBlckNhbnZhcyA9PT0gdHJ1ZSB8fCAoIXN1cHBvcnRWaWRlb1RleHR1cmUocmVuZGVyRWxlbWVudCkgJiYgdGhpcy5vcHRpb25zLnVzZUhlbHBlckNhbnZhcyA9PT0gXCJhdXRvXCIpKSl7XG4gICAgICAgICAgICB0aGlzLl9oZWxwZXJDYW52YXMgPSB0aGlzLnBsYXllci5hZGRDb21wb25lbnQoXCJIZWxwZXJDYW52YXNcIiwgbmV3IEhlbHBlckNhbnZhcyh0aGlzLnBsYXllcikpO1xuXG4gICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5faGVscGVyQ2FudmFzLmVsKCk7XG4gICAgICAgICAgICB0aGlzLl90ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUoY29udGV4dCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5fdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKHJlbmRlckVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdGV4dHVyZS5nZW5lcmF0ZU1pcG1hcHMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fdGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG4gICAgICAgIHRoaXMuX3RleHR1cmUubWF4RmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICAgICAgICB0aGlzLl90ZXh0dXJlLmZvcm1hdCA9IFRIUkVFLlJHQkZvcm1hdDtcblxuICAgICAgICBsZXQgZWw6IEhUTUxFbGVtZW50ID0gdGhpcy5fcmVuZGVyZXIuZG9tRWxlbWVudDtcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgndmpzLXBhbm9yYW1hLWNhbnZhcycpO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9XG5cbiAgICBkaXNwb3NlKCl7XG4gICAgICAgIHRoaXMuZGV0YWNoQ29udHJvbEV2ZW50cygpO1xuICAgICAgICB0aGlzLnN0b3BBbmltYXRpb24oKTtcbiAgICAgICAgc3VwZXIuZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIHN0YXJ0QW5pbWF0aW9uKCkge1xuICAgICAgICB0aGlzLl90aW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIHRoaXMuYW5pbWF0ZSgpO1xuICAgIH1cblxuICAgIHN0b3BBbmltYXRpb24oKXtcbiAgICAgICAgaWYodGhpcy5fcmVxdWVzdEFuaW1hdGlvbklkKXtcbiAgICAgICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3JlcXVlc3RBbmltYXRpb25JZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhdHRhY2hDb250cm9sRXZlbnRzKCk6IHZvaWR7XG4gICAgICAgIHRoaXMub24oJ21vdXNlbW92ZScsIHRoaXMuaGFuZGxlTW91c2VNb3ZlLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm9uKCd0b3VjaG1vdmUnLCB0aGlzLmhhbmRsZVRvdWNoTW92ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vbignbW91c2Vkb3duJywgdGhpcy5oYW5kbGVNb3VzZURvd24uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMub24oJ3RvdWNoc3RhcnQnLHRoaXMuaGFuZGxlVG91Y2hTdGFydC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vbignbW91c2V1cCcsIHRoaXMuaGFuZGxlTW91c2VVcC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vbigndG91Y2hlbmQnLCB0aGlzLmhhbmRsZVRvdWNoRW5kLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm9uKCdtb3VzZWVudGVyJywgdGhpcy5oYW5kbGVNb3VzZUVudGVyLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm9uKCdtb3VzZWxlYXZlJywgdGhpcy5oYW5kbGVNb3VzZUxlYXNlLmJpbmQodGhpcykpO1xuICAgICAgICBpZih0aGlzLm9wdGlvbnMuc2Nyb2xsYWJsZSl7XG4gICAgICAgICAgICB0aGlzLm9uKCdtb3VzZXdoZWVsJywgdGhpcy5oYW5kbGVNb3VzZVdoZWVsLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy5vbignTW96TW91c2VQaXhlbFNjcm9sbCcsIHRoaXMuaGFuZGxlTW91c2VXaGVlbC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLm9wdGlvbnMucmVzaXphYmxlKXtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMuaGFuZGxlUmVzaXplLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5hdXRvTW9iaWxlT3JpZW50YXRpb24pe1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2RldmljZW1vdGlvbicsIHRoaXMuaGFuZGxlTW9iaWxlT3JpZW50YXRpb24uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5vcHRpb25zLktleWJvYXJkQ29udHJvbCl7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCB0aGlzLmhhbmRsZUtleURvd24uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2tleXVwJywgdGhpcy5oYW5kbGVLZXlVcC5iaW5kKHRoaXMpICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZXRhY2hDb250cm9sRXZlbnRzKCk6IHZvaWR7XG4gICAgICAgIHRoaXMub2ZmKCdtb3VzZW1vdmUnLCB0aGlzLmhhbmRsZU1vdXNlTW92ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vZmYoJ3RvdWNobW92ZScsIHRoaXMuaGFuZGxlVG91Y2hNb3ZlLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm9mZignbW91c2Vkb3duJywgdGhpcy5oYW5kbGVNb3VzZURvd24uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMub2ZmKCd0b3VjaHN0YXJ0Jyx0aGlzLmhhbmRsZVRvdWNoU3RhcnQuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMub2ZmKCdtb3VzZXVwJywgdGhpcy5oYW5kbGVNb3VzZVVwLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm9mZigndG91Y2hlbmQnLCB0aGlzLmhhbmRsZVRvdWNoRW5kLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm9mZignbW91c2VlbnRlcicsIHRoaXMuaGFuZGxlTW91c2VFbnRlci5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vZmYoJ21vdXNlbGVhdmUnLCB0aGlzLmhhbmRsZU1vdXNlTGVhc2UuYmluZCh0aGlzKSk7XG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5zY3JvbGxhYmxlKXtcbiAgICAgICAgICAgIHRoaXMub2ZmKCdtb3VzZXdoZWVsJywgdGhpcy5oYW5kbGVNb3VzZVdoZWVsLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy5vZmYoJ01vek1vdXNlUGl4ZWxTY3JvbGwnLCB0aGlzLmhhbmRsZU1vdXNlV2hlZWwuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5vcHRpb25zLnJlc2l6YWJsZSl7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLmhhbmRsZVJlc2l6ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLm9wdGlvbnMuYXV0b01vYmlsZU9yaWVudGF0aW9uKXtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdkZXZpY2Vtb3Rpb24nLCB0aGlzLmhhbmRsZU1vYmlsZU9yaWVudGF0aW9uLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5LZXlib2FyZENvbnRyb2wpe1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgdGhpcy5oYW5kbGVLZXlEb3duLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdrZXl1cCcsIHRoaXMuaGFuZGxlS2V5VXAuYmluZCh0aGlzKSApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogdHJpZ2dlciB3aGVuIHdpbmRvdyByZXNpemVkXG4gICAgICovXG4gICAgaGFuZGxlUmVzaXplKCk6IHZvaWR7XG4gICAgICAgIHRoaXMuX3dpZHRoID0gdGhpcy5wbGF5ZXIuZWwoKS5vZmZzZXRXaWR0aCwgdGhpcy5faGVpZ2h0ID0gdGhpcy5wbGF5ZXIuZWwoKS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFNpemUoIHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQgKTtcbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZVdoZWVsKGV2ZW50OiBNb3VzZUV2ZW50KXtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2VFbnRlcihldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICB0aGlzLl9pc1VzZXJJbnRlcmFjdGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2FjY2VsZWN0b3IueCA9IDA7XG4gICAgICAgIHRoaXMuX2FjY2VsZWN0b3IueSA9IDA7XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2VMZWFzZShldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICB0aGlzLl9pc1VzZXJJbnRlcmFjdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9hY2NlbGVjdG9yLnggPSAwO1xuICAgICAgICB0aGlzLl9hY2NlbGVjdG9yLnkgPSAwO1xuICAgICAgICBpZih0aGlzLl9tb3VzZURvd24pIHtcbiAgICAgICAgICAgIHRoaXMuX21vdXNlRG93biA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2VEb3duKGV2ZW50OiBhbnkpOiB2b2lke1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjb25zdCBjbGllbnRYID0gZXZlbnQuY2xpZW50WCB8fCBldmVudC50b3VjaGVzICYmIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgICAgY29uc3QgY2xpZW50WSA9IGV2ZW50LmNsaWVudFkgfHwgZXZlbnQudG91Y2hlcyAmJiBldmVudC50b3VjaGVzWzBdLmNsaWVudFk7XG4gICAgICAgIGlmKHR5cGVvZiBjbGllbnRYICE9PSBcInVuZGVmaW5lZFwiICYmIGNsaWVudFkgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX21vdXNlRG93biA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9tb3VzZURvd25Qb2ludGVyLnggPSBjbGllbnRYO1xuICAgICAgICAgICAgdGhpcy5fbW91c2VEb3duUG9pbnRlci55ID0gY2xpZW50WTtcbiAgICAgICAgICAgIHRoaXMuX21vdXNlRG93bkxvY2F0aW9uLkxvbiA9IHRoaXMuX2xvbjtcbiAgICAgICAgICAgIHRoaXMuX21vdXNlRG93bkxvY2F0aW9uLkxhdCA9IHRoaXMuX2xhdDtcblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3R1cm5pbmcgcG9pbnRlciBldmVudHMgb2ZmIGZvciBtYXJrZXJzJyk7XG4gICAgICAgICAgICAkKCcudmpzLW1hcmtlcicpLmNzcygncG9pbnRlci1ldmVudHMnLCAnbm9uZScpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2VNb3ZlKGV2ZW50OiBhbnkpOiB2b2lke1xuICAgICAgICBjb25zdCBjbGllbnRYID0gZXZlbnQuY2xpZW50WCB8fCBldmVudC50b3VjaGVzICYmIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgICAgY29uc3QgY2xpZW50WSA9IGV2ZW50LmNsaWVudFkgfHwgZXZlbnQudG91Y2hlcyAmJiBldmVudC50b3VjaGVzWzBdLmNsaWVudFk7XG5cbiAgICAgICAgaWYodGhpcy5vcHRpb25zLk1vdXNlRW5hYmxlICYmIHRoaXMuY29udHJvbGFibGUgJiYgdHlwZW9mIGNsaWVudFggIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIGNsaWVudFkgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuX21vdXNlRG93bil7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9uID0gKCB0aGlzLl9tb3VzZURvd25Qb2ludGVyLnggLSBjbGllbnRYICkgKiAwLjIgKyB0aGlzLl9tb3VzZURvd25Mb2NhdGlvbi5Mb247XG4gICAgICAgICAgICAgICAgdGhpcy5fbGF0ID0gKCBjbGllbnRZIC0gdGhpcy5fbW91c2VEb3duUG9pbnRlci55ICkgKiAwLjIgKyB0aGlzLl9tb3VzZURvd25Mb2NhdGlvbi5MYXQ7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWNjZWxlY3Rvci54ID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY2NlbGVjdG9yLnkgPSAwO1xuICAgICAgICAgICAgfWVsc2UgaWYoIXRoaXMub3B0aW9ucy5jbGlja0FuZERyYWcpe1xuICAgICAgICAgICAgICAgIGxldCByZWN0ID0gdGhpcy5lbCgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHggPSBjbGllbnRYIC0gdGhpcy5fd2lkdGggLyAyIC0gcmVjdC5sZWZ0O1xuICAgICAgICAgICAgICAgIGNvbnN0IHkgPSB0aGlzLl9oZWlnaHQgLyAyIC0gKGNsaWVudFkgLSByZWN0LnRvcCk7XG4gICAgICAgICAgICAgICAgbGV0IGFuZ2xlID0gMDtcbiAgICAgICAgICAgICAgICBpZih4ID09PSAwKXtcbiAgICAgICAgICAgICAgICAgICAgYW5nbGUgPSAoeSA+IDApPyBNYXRoLlBJIC8gMiA6IE1hdGguUEkgKiAzIC8gMjtcbiAgICAgICAgICAgICAgICB9ZWxzZSBpZih4ID4gMCAmJiB5ID4gMCl7XG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlID0gTWF0aC5hdGFuKHkgLyB4KTtcbiAgICAgICAgICAgICAgICB9ZWxzZSBpZih4ID4gMCAmJiB5IDwgMCl7XG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlID0gMiAqIE1hdGguUEkgLSBNYXRoLmF0YW4oeSAqIC0xIC8geCk7XG4gICAgICAgICAgICAgICAgfWVsc2UgaWYoeCA8IDAgJiYgeSA+IDApe1xuICAgICAgICAgICAgICAgICAgICBhbmdsZSA9IE1hdGguUEkgLSBNYXRoLmF0YW4oeSAvIHggKiAtMSk7XG4gICAgICAgICAgICAgICAgfWVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhbmdsZSA9IE1hdGguUEkgKyBNYXRoLmF0YW4oeSAvIHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9hY2NlbGVjdG9yLnggPSBNYXRoLmNvcyhhbmdsZSkgKiB0aGlzLm9wdGlvbnMubW92aW5nU3BlZWQueCAqIE1hdGguYWJzKHgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FjY2VsZWN0b3IueSA9IE1hdGguc2luKGFuZ2xlKSAqIHRoaXMub3B0aW9ucy5tb3ZpbmdTcGVlZC55ICogTWF0aC5hYnMoeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZVVwKGV2ZW50OiBhbnkpOiB2b2lke1xuICAgICAgICB0aGlzLl9tb3VzZURvd24gPSBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCd0dXJuaW5nIHBvaW50ZXIgZXZlbnRzIG9uIGZvciBtYXJrZXJzJyk7XG4gICAgICAgICQoJy52anMtbWFya2VyJykuY3NzKCdwb2ludGVyLWV2ZW50cycsICdhdXRvJyk7XG5cbiAgICAgICAgaWYodGhpcy5vcHRpb25zLmNsaWNrVG9Ub2dnbGUpe1xuICAgICAgICAgICAgY29uc3QgY2xpZW50WCA9IGV2ZW50LmNsaWVudFggfHwgZXZlbnQuY2hhbmdlZFRvdWNoZXMgJiYgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgICAgICAgIGNvbnN0IGNsaWVudFkgPSBldmVudC5jbGllbnRZIHx8IGV2ZW50LmNoYW5nZWRUb3VjaGVzICYmIGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFk7XG4gICAgICAgICAgICBpZih0eXBlb2YgY2xpZW50WCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBjbGllbnRZICE9PSBcInVuZGVmaW5lZFwiICYmIHRoaXMub3B0aW9ucy5jbGlja1RvVG9nZ2xlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGlmZlggPSBNYXRoLmFicyhjbGllbnRYIC0gdGhpcy5fbW91c2VEb3duUG9pbnRlci54KTtcbiAgICAgICAgICAgICAgICBjb25zdCBkaWZmWSA9IE1hdGguYWJzKGNsaWVudFkgLSB0aGlzLl9tb3VzZURvd25Qb2ludGVyLnkpO1xuICAgICAgICAgICAgICAgIGlmKGRpZmZYIDwgMC4xICYmIGRpZmZZIDwgMC4xKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllci5wYXVzZWQoKSA/IHRoaXMucGxheWVyLnBsYXkoKSA6IHRoaXMucGxheWVyLnBhdXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVUb3VjaFN0YXJ0KGV2ZW50OiBUb3VjaEV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC50b3VjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHRoaXMuX2lzVXNlclBpbmNoID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX211bHRpVG91Y2hEaXN0YW5jZSA9IGdldFRvdWNoZXNEaXN0YW5jZShldmVudC50b3VjaGVzKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhhbmRsZU1vdXNlRG93bihldmVudCk7XG4gICAgfVxuXG4gICAgaGFuZGxlVG91Y2hNb3ZlKGV2ZW50OiBUb3VjaEV2ZW50KSB7XG4gICAgICAgIHRoaXMudHJpZ2dlcihcInRvdWNoTW92ZVwiKTtcbiAgICAgICAgLy9oYW5kbGUgc2luZ2xlIHRvdWNoIGV2ZW50LFxuICAgICAgICBpZiAoIXRoaXMuX2lzVXNlclBpbmNoIHx8IGV2ZW50LnRvdWNoZXMubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTW91c2VNb3ZlKGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZVRvdWNoRW5kKGV2ZW50OiBUb3VjaEV2ZW50KSB7XG4gICAgICAgIHRoaXMuX2lzVXNlclBpbmNoID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaGFuZGxlTW91c2VVcChldmVudCk7XG4gICAgfVxuXG4gICAgaGFuZGxlTW9iaWxlT3JpZW50YXRpb24oZXZlbnQ6IGFueSl7XG4gICAgICAgIGlmKHR5cGVvZiBldmVudC5yb3RhdGlvblJhdGUgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgY29uc3QgeCA9IGV2ZW50LnJvdGF0aW9uUmF0ZS5hbHBoYTtcbiAgICAgICAgICAgIGNvbnN0IHkgPSBldmVudC5yb3RhdGlvblJhdGUuYmV0YTtcbiAgICAgICAgICAgIGNvbnN0IHBvcnRyYWl0ID0gKHR5cGVvZiBldmVudC5wb3J0cmFpdCAhPT0gXCJ1bmRlZmluZWRcIik/IGV2ZW50LnBvcnRyYWl0IDogd2luZG93Lm1hdGNoTWVkaWEoXCIob3JpZW50YXRpb246IHBvcnRyYWl0KVwiKS5tYXRjaGVzO1xuICAgICAgICAgICAgY29uc3QgbGFuZHNjYXBlID0gKHR5cGVvZiBldmVudC5sYW5kc2NhcGUgIT09IFwidW5kZWZpbmVkXCIpPyBldmVudC5sYW5kc2NhcGUgOiB3aW5kb3cubWF0Y2hNZWRpYShcIihvcmllbnRhdGlvbjogbGFuZHNjYXBlKVwiKS5tYXRjaGVzO1xuICAgICAgICAgICAgY29uc3Qgb3JpZW50YXRpb24gPSBldmVudC5vcmllbnRhdGlvbiB8fCB3aW5kb3cub3JpZW50YXRpb247XG5cbiAgICAgICAgICAgIGlmIChwb3J0cmFpdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvbiA9IHRoaXMuX2xvbiAtIHkgKiB0aGlzLm9wdGlvbnMubW9iaWxlVmlicmF0aW9uVmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5fbGF0ID0gdGhpcy5fbGF0ICsgeCAqIHRoaXMub3B0aW9ucy5tb2JpbGVWaWJyYXRpb25WYWx1ZTtcbiAgICAgICAgICAgIH1lbHNlIGlmKGxhbmRzY2FwZSl7XG4gICAgICAgICAgICAgICAgbGV0IG9yaWVudGF0aW9uRGVncmVlID0gLTkwO1xuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBvcmllbnRhdGlvbiAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uRGVncmVlID0gb3JpZW50YXRpb247XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5fbG9uID0gKG9yaWVudGF0aW9uRGVncmVlID09PSAtOTApPyB0aGlzLl9sb24gKyB4ICogdGhpcy5vcHRpb25zLm1vYmlsZVZpYnJhdGlvblZhbHVlIDogdGhpcy5fbG9uIC0geCAqIHRoaXMub3B0aW9ucy5tb2JpbGVWaWJyYXRpb25WYWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9sYXQgPSAob3JpZW50YXRpb25EZWdyZWUgPT09IC05MCk/IHRoaXMuX2xhdCArIHkgKiB0aGlzLm9wdGlvbnMubW9iaWxlVmlicmF0aW9uVmFsdWUgOiB0aGlzLl9sYXQgLSB5ICogdGhpcy5vcHRpb25zLm1vYmlsZVZpYnJhdGlvblZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlS2V5RG93bihldmVudDogYW55KXtcbiAgICAgICAgdGhpcy5faXNVc2VySW50ZXJhY3RpbmcgPSB0cnVlO1xuICAgICAgICBzd2l0Y2goZXZlbnQua2V5Q29kZSl7XG4gICAgICAgICAgICBjYXNlIDM4OiAvKnVwKi9cbiAgICAgICAgICAgIGNhc2UgODc6IC8qVyovXG4gICAgICAgICAgICAgICAgdGhpcy5fbGF0ICs9IHRoaXMub3B0aW9ucy5LZXlib2FyZE1vdmluZ1NwZWVkLnk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM3OiAvKmxlZnQqL1xuICAgICAgICAgICAgY2FzZSA2NTogLypBKi9cbiAgICAgICAgICAgICAgICB0aGlzLl9sb24gLT0gdGhpcy5vcHRpb25zLktleWJvYXJkTW92aW5nU3BlZWQueDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzk6IC8qcmlnaHQqL1xuICAgICAgICAgICAgY2FzZSA2ODogLypEKi9cbiAgICAgICAgICAgICAgICB0aGlzLl9sb24gKz0gdGhpcy5vcHRpb25zLktleWJvYXJkTW92aW5nU3BlZWQueDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNDA6IC8qZG93biovXG4gICAgICAgICAgICBjYXNlIDgzOiAvKlMqL1xuICAgICAgICAgICAgICAgIHRoaXMuX2xhdCAtPSB0aGlzLm9wdGlvbnMuS2V5Ym9hcmRNb3ZpbmdTcGVlZC55O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlS2V5VXAoZXZlbnQ6IGFueSl7XG4gICAgICAgIHRoaXMuX2lzVXNlckludGVyYWN0aW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZW5hYmxlVlIoKSB7XG4gICAgICAgIHRoaXMuX1ZSTW9kZSA9IHRydWU7XG4gICAgfVxuXG4gICAgZGlzYWJsZVZSKCkge1xuICAgICAgICB0aGlzLl9WUk1vZGUgPSBmYWxzZTtcbiAgICB9XG5cblxuICAgIGFuaW1hdGUoKXtcbiAgICAgICAgdGhpcy5fcmVxdWVzdEFuaW1hdGlvbklkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCB0aGlzLmFuaW1hdGUuYmluZCh0aGlzKSApO1xuICAgICAgICBsZXQgY3QgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgaWYgKGN0IC0gdGhpcy5fdGltZSA+PSAzMCkge1xuICAgICAgICAgICAgdGhpcy5fdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl90aW1lID0gY3Q7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoXCJ0ZXh0dXJlUmVuZGVyXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9jYW52YXMgc2hvdWxkIG9ubHkgYmUgcmVuZGVyZWQgd2hlbiB2aWRlbyBpcyByZWFkeSBvciB3aWxsIHJlcG9ydCBgbm8gdmlkZW9gIHdhcm5pbmcgbWVzc2FnZS5cbiAgICAgICAgaWYodGhpcy5fcmVuZGVyRWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09IFwidmlkZW9cIiB8fCB0aGlzLnBsYXllci5yZWFkeVN0YXRlKCkgPj0gSEFWRV9DVVJSRU5UX0RBVEEpe1xuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpe1xuICAgICAgICB0aGlzLnRyaWdnZXIoXCJiZWZvcmVSZW5kZXJcIik7XG4gICAgICAgIGlmKHRoaXMuX2NvbnRyb2xhYmxlKXtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9pc1VzZXJJbnRlcmFjdGluZyl7XG4gICAgICAgICAgICAgICAgbGV0IHN5bWJvbExhdCA9ICh0aGlzLl9sYXQgPiB0aGlzLm9wdGlvbnMuaW5pdExhdCk/ICAtMSA6IDE7XG4gICAgICAgICAgICAgICAgbGV0IHN5bWJvbExvbiA9ICh0aGlzLl9sb24gPiB0aGlzLm9wdGlvbnMuaW5pdExvbik/ICAtMSA6IDE7XG4gICAgICAgICAgICAgICAgaWYodGhpcy5vcHRpb25zLmJhY2tUb0luaXRMYXQpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sYXQgPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9sYXQgPiAodGhpcy5vcHRpb25zLmluaXRMYXQgLSBNYXRoLmFicyh0aGlzLm9wdGlvbnMucmV0dXJuTGF0U3BlZWQpKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbGF0IDwgKHRoaXMub3B0aW9ucy5pbml0TGF0ICsgTWF0aC5hYnModGhpcy5vcHRpb25zLnJldHVybkxhdFNwZWVkKSlcbiAgICAgICAgICAgICAgICAgICAgKT8gdGhpcy5vcHRpb25zLmluaXRMYXQgOiB0aGlzLl9sYXQgKyB0aGlzLm9wdGlvbnMucmV0dXJuTGF0U3BlZWQgKiBzeW1ib2xMYXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKHRoaXMub3B0aW9ucy5iYWNrVG9Jbml0TG9uKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9uID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9uID4gKHRoaXMub3B0aW9ucy5pbml0TG9uIC0gTWF0aC5hYnModGhpcy5vcHRpb25zLnJldHVybkxvblNwZWVkKSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvbiA8ICh0aGlzLm9wdGlvbnMuaW5pdExvbiArIE1hdGguYWJzKHRoaXMub3B0aW9ucy5yZXR1cm5Mb25TcGVlZCkpXG4gICAgICAgICAgICAgICAgICAgICk/IHRoaXMub3B0aW9ucy5pbml0TG9uIDogdGhpcy5fbG9uICsgdGhpcy5vcHRpb25zLnJldHVybkxvblNwZWVkICogc3ltYm9sTG9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1lbHNlIGlmKHRoaXMuX2FjY2VsZWN0b3IueCAhPT0gMCAmJiB0aGlzLl9hY2NlbGVjdG9yLnkgIT09IDApe1xuICAgICAgICAgICAgICAgIHRoaXMuX2xhdCArPSB0aGlzLl9hY2NlbGVjdG9yLnk7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9uICs9IHRoaXMuX2FjY2VsZWN0b3IueDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMuX29wdGlvbnMubWluTG9uID09PSAwICYmIHRoaXMuX29wdGlvbnMubWF4TG9uID09PSAzNjApe1xuICAgICAgICAgICAgaWYodGhpcy5fbG9uID4gMzYwKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb24gLT0gMzYwO1xuICAgICAgICAgICAgfWVsc2UgaWYodGhpcy5fbG9uIDwgMCl7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9uICs9IDM2MDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2xhdCA9IE1hdGgubWF4KCB0aGlzLm9wdGlvbnMubWluTGF0LCBNYXRoLm1pbiggdGhpcy5vcHRpb25zLm1heExhdCwgdGhpcy5fbGF0ICkgKTtcbiAgICAgICAgdGhpcy5fbG9uID0gTWF0aC5tYXgoIHRoaXMub3B0aW9ucy5taW5Mb24sIE1hdGgubWluKCB0aGlzLm9wdGlvbnMubWF4TG9uLCB0aGlzLl9sb24gKSApO1xuICAgICAgICB0aGlzLl9waGkgPSBUSFJFRS5NYXRoLmRlZ1RvUmFkKCA5MCAtIHRoaXMuX2xhdCApO1xuICAgICAgICB0aGlzLl90aGV0YSA9IFRIUkVFLk1hdGguZGVnVG9SYWQoIHRoaXMuX2xvbiApO1xuXG4gICAgICAgIGlmKHRoaXMuX2hlbHBlckNhbnZhcyl7XG4gICAgICAgICAgICB0aGlzLl9oZWxwZXJDYW52YXMucmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcmVuZGVyZXIuY2xlYXIoKTtcbiAgICAgICAgdGhpcy50cmlnZ2VyKFwicmVuZGVyXCIpO1xuICAgIH1cblxuICAgIGdldCBWUk1vZGUoKTogYm9vbGVhbntcbiAgICAgICAgcmV0dXJuIHRoaXMuX1ZSTW9kZTtcbiAgICB9XG5cbiAgICBnZXQgY29udHJvbGFibGUoKTogYm9vbGVhbntcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbnRyb2xhYmxlO1xuICAgIH1cblxuICAgIHNldCBjb250cm9sYWJsZSh2YWw6IGJvb2xlYW4pOiB2b2lke1xuICAgICAgICB0aGlzLl9jb250cm9sYWJsZSA9IHZhbDtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VDYW52YXM7IiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgeyBQbGF5ZXJ9IGZyb20gJy4uL3R5cGVzL2luZGV4JztcbmltcG9ydCBDbGlja2FibGVDb21wb25lbnQgZnJvbSAnLi9DbGlja2FibGVDb21wb25lbnQnO1xuXG5jbGFzcyBCdXR0b24gZXh0ZW5kcyBDbGlja2FibGVDb21wb25lbnR7XG4gICAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXIsIG9wdGlvbnM6IGFueSA9IHt9KXtcbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5vbihcImtleWRvd25cIiwgdGhpcy5oYW5kbGVLZXlQcmVzcy5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBjcmVhdGVFbCh0YWdOYW1lOiBzdHJpbmcsIHByb3BlcnRpZXM/OiBhbnksIGF0dHJpYnV0ZXM/OiBhbnkpe1xuICAgICAgICByZXR1cm4gc3VwZXIuY3JlYXRlRWwoXCJidXR0b25cIiwgbnVsbCwge1xuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgIC8vIGxldCB0aGUgc2NyZWVuIHJlYWRlciB1c2VyIGtub3cgdGhhdCB0aGUgdGV4dCBvZiB0aGUgYnV0dG9uIG1heSBjaGFuZ2VcbiAgICAgICAgICAgICdhcmlhLWxpdmUnOiAncG9saXRlJ1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuYWJsZSB0aGUgYEJ1dHRvbmAgZWxlbWVudCBzbyB0aGF0IGl0IGNhbiBiZSBhY3RpdmF0ZWQgb3IgY2xpY2tlZC4gVXNlIHRoaXMgd2l0aFxuICAgICAqIHtAbGluayBCdXR0b24jZGlzYWJsZX0uXG4gICAgICovXG4gICAgZW5hYmxlKCkge1xuICAgICAgICB0aGlzLmVsKCkucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuYWJsZSB0aGUgYEJ1dHRvbmAgZWxlbWVudCBzbyB0aGF0IGl0IGNhbm5vdCBiZSBhY3RpdmF0ZWQgb3IgY2xpY2tlZC4gVXNlIHRoaXMgd2l0aFxuICAgICAqIHtAbGluayBCdXR0b24jZW5hYmxlfS5cbiAgICAgKi9cbiAgICBkaXNhYmxlKCkge1xuICAgICAgICB0aGlzLmVsKCkuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuICAgIH1cblxuICAgIGhhbmRsZUtleVByZXNzKGV2ZW50OiBFdmVudCl7XG4gICAgICAgIC8vIElnbm9yZSBTcGFjZSAoMzIpIG9yIEVudGVyICgxMykga2V5IG9wZXJhdGlvbiwgd2hpY2ggaXMgaGFuZGxlZCBieSB0aGUgYnJvd3NlciBmb3IgYSBidXR0b24uXG4gICAgICAgIGlmIChldmVudC53aGljaCA9PT0gMzIgfHwgZXZlbnQud2hpY2ggPT09IDEzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJ1dHRvbjsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7IFBsYXllciB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBDb21wb25lbnQgZnJvbSAnLi9Db21wb25lbnQnO1xuXG5jbGFzcyBDbGlja2FibGVDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnR7XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczogYW55ID0ge30pe1xuICAgICAgICBzdXBlcihwbGF5ZXIsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm9uKFwiY2xpY2tcIiwgdGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5hZGRMaXN0ZW5lcihcInRhcFwiLCB0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJ1aWxkcyB0aGUgZGVmYXVsdCBET00gYGNsYXNzTmFtZWAuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAgICogICAgICAgICBUaGUgRE9NIGBjbGFzc05hbWVgIGZvciB0aGlzIG9iamVjdC5cbiAgICAgKi9cbiAgICBidWlsZENTU0NsYXNzKCkge1xuICAgICAgICByZXR1cm4gYHZqcy1jb250cm9sIHZqcy1idXR0b24gJHtzdXBlci5idWlsZENTU0NsYXNzKCl9YDtcbiAgICB9XG5cbiAgICBoYW5kbGVDbGljayhldmVudDogRXZlbnQpIHtcbiAgICAgICAgdGhpcy50cmlnZ2VyKFwiY2xpY2tcIik7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDbGlja2FibGVDb21wb25lbnQ7IiwiLy8gQCBmbG93XG5cbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnd29sZnk4Ny1ldmVudGVtaXR0ZXInO1xuaW1wb3J0IHR5cGUgeyBQbGF5ZXIgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBtZXJnZU9wdGlvbnMsIENvbXBvbmVudERhdGEgfSBmcm9tICcuLi91dGlscyc7XG5cbi8qKlxuICogYmFzZSBDb21wb25lbnQgbGF5ZXIsIHdoaWNoIHdpbGwgYmUgdXNlIHdoZW4gdmlkZW9qcyBpcyBub3Qgc3VwcG9ydGVkIGVudmlyb25tZW50LlxuICovXG5jbGFzcyBDb21wb25lbnQgZXh0ZW5kcyBFdmVudEVtaXR0ZXJ7XG4gICAgX29wdGlvbnM6IGFueTtcbiAgICBfaWQ6IHN0cmluZztcbiAgICBfZWw6IEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICBfcGxheWVyOiBQbGF5ZXI7XG4gICAgX3JlbmRlckVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICAgIF9jaGlsZHJlbjogQ29tcG9uZW50RGF0YVtdO1xuXG4gICAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXIsIG9wdGlvbnM6IGFueSA9IHt9LCByZW5kZXJFbGVtZW50PzogSFRNTEVsZW1lbnQsIHJlYWR5PzogKCkgPT4gdm9pZCl7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5fcGxheWVyID0gcGxheWVyO1xuICAgICAgICAvLyBNYWtlIGEgY29weSBvZiBwcm90b3R5cGUub3B0aW9uc18gdG8gcHJvdGVjdCBhZ2FpbnN0IG92ZXJyaWRpbmcgZGVmYXVsdHNcbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IG1lcmdlT3B0aW9ucyh7fSwgdGhpcy5fb3B0aW9ucyk7XG4gICAgICAgIC8vIFVwZGF0ZWQgb3B0aW9ucyB3aXRoIHN1cHBsaWVkIG9wdGlvbnNcbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IG1lcmdlT3B0aW9ucyh0aGlzLl9vcHRpb25zLCBvcHRpb25zKTtcblxuICAgICAgICB0aGlzLl9yZW5kZXJFbGVtZW50ID0gcmVuZGVyRWxlbWVudDtcblxuICAgICAgICAvLyBHZXQgSUQgZnJvbSBvcHRpb25zIG9yIG9wdGlvbnMgZWxlbWVudCBpZiBvbmUgaXMgc3VwcGxpZWRcbiAgICAgICAgdGhpcy5faWQgPSBvcHRpb25zLmlkIHx8IChvcHRpb25zLmVsICYmIG9wdGlvbnMuZWwuaWQpO1xuXG4gICAgICAgIHRoaXMuX2VsID0gKG9wdGlvbnMuZWwpPyBvcHRpb25zLmVsIDogdGhpcy5jcmVhdGVFbCgpO1xuXG4gICAgICAgIHRoaXMuZW1pdFRhcEV2ZW50cygpO1xuXG4gICAgICAgIHRoaXMuX2NoaWxkcmVuID0gW107XG5cbiAgICAgICAgaWYocmVhZHkpe1xuICAgICAgICAgICAgcmVhZHkuY2FsbCh0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpc3Bvc2UoKXtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMuX2NoaWxkcmVuLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIHRoaXMuX2NoaWxkcmVuW2ldLmNvbXBvbmVudC5kaXNwb3NlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLl9lbCl7XG4gICAgICAgICAgICBpZih0aGlzLl9lbC5wYXJlbnROb2RlKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX2VsKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fZWwgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW1pdCBhICd0YXAnIGV2ZW50cyB3aGVuIHRvdWNoIGV2ZW50IHN1cHBvcnQgZ2V0cyBkZXRlY3RlZC4gVGhpcyBnZXRzIHVzZWQgdG9cbiAgICAgKiBzdXBwb3J0IHRvZ2dsaW5nIHRoZSBjb250cm9scyB0aHJvdWdoIGEgdGFwIG9uIHRoZSB2aWRlby4gVGhleSBnZXQgZW5hYmxlZFxuICAgICAqIGJlY2F1c2UgZXZlcnkgc3ViLWNvbXBvbmVudCB3b3VsZCBoYXZlIGV4dHJhIG92ZXJoZWFkIG90aGVyd2lzZS5cbiAgICAgKiAqL1xuICAgIGVtaXRUYXBFdmVudHMoKSB7XG4gICAgICAgIC8vIFRyYWNrIHRoZSBzdGFydCB0aW1lIHNvIHdlIGNhbiBkZXRlcm1pbmUgaG93IGxvbmcgdGhlIHRvdWNoIGxhc3RlZFxuICAgICAgICBsZXQgdG91Y2hTdGFydCA9IDA7XG4gICAgICAgIGxldCBmaXJzdFRvdWNoID0gbnVsbDtcblxuICAgICAgICAvLyBNYXhpbXVtIG1vdmVtZW50IGFsbG93ZWQgZHVyaW5nIGEgdG91Y2ggZXZlbnQgdG8gc3RpbGwgYmUgY29uc2lkZXJlZCBhIHRhcFxuICAgICAgICAvLyBPdGhlciBwb3B1bGFyIGxpYnMgdXNlIGFueXdoZXJlIGZyb20gMiAoaGFtbWVyLmpzKSB0byAxNSxcbiAgICAgICAgLy8gc28gMTAgc2VlbXMgbGlrZSBhIG5pY2UsIHJvdW5kIG51bWJlci5cbiAgICAgICAgY29uc3QgdGFwTW92ZW1lbnRUaHJlc2hvbGQgPSAxMDtcblxuICAgICAgICAvLyBUaGUgbWF4aW11bSBsZW5ndGggYSB0b3VjaCBjYW4gYmUgd2hpbGUgc3RpbGwgYmVpbmcgY29uc2lkZXJlZCBhIHRhcFxuICAgICAgICBjb25zdCB0b3VjaFRpbWVUaHJlc2hvbGQgPSAyMDA7XG5cbiAgICAgICAgbGV0IGNvdWxkQmVUYXA7XG5cbiAgICAgICAgdGhpcy5vbigndG91Y2hzdGFydCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAvLyBJZiBtb3JlIHRoYW4gb25lIGZpbmdlciwgZG9uJ3QgY29uc2lkZXIgdHJlYXRpbmcgdGhpcyBhcyBhIGNsaWNrXG4gICAgICAgICAgICBpZiAoZXZlbnQudG91Y2hlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAvLyBDb3B5IHBhZ2VYL3BhZ2VZIGZyb20gdGhlIG9iamVjdFxuICAgICAgICAgICAgICAgIGZpcnN0VG91Y2ggPSB7XG4gICAgICAgICAgICAgICAgICAgIHBhZ2VYOiBldmVudC50b3VjaGVzWzBdLnBhZ2VYLFxuICAgICAgICAgICAgICAgICAgICBwYWdlWTogZXZlbnQudG91Y2hlc1swXS5wYWdlWVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgLy8gUmVjb3JkIHN0YXJ0IHRpbWUgc28gd2UgY2FuIGRldGVjdCBhIHRhcCB2cy4gXCJ0b3VjaCBhbmQgaG9sZFwiXG4gICAgICAgICAgICAgICAgdG91Y2hTdGFydCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgICAgIC8vIFJlc2V0IGNvdWxkQmVUYXAgdHJhY2tpbmdcbiAgICAgICAgICAgICAgICBjb3VsZEJlVGFwID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5vbigndG91Y2htb3ZlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIC8vIElmIG1vcmUgdGhhbiBvbmUgZmluZ2VyLCBkb24ndCBjb25zaWRlciB0cmVhdGluZyB0aGlzIGFzIGEgY2xpY2tcbiAgICAgICAgICAgIGlmIChldmVudC50b3VjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICBjb3VsZEJlVGFwID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZpcnN0VG91Y2gpIHtcbiAgICAgICAgICAgICAgICAvLyBTb21lIGRldmljZXMgd2lsbCB0aHJvdyB0b3VjaG1vdmVzIGZvciBhbGwgYnV0IHRoZSBzbGlnaHRlc3Qgb2YgdGFwcy5cbiAgICAgICAgICAgICAgICAvLyBTbywgaWYgd2UgbW92ZWQgb25seSBhIHNtYWxsIGRpc3RhbmNlLCB0aGlzIGNvdWxkIHN0aWxsIGJlIGEgdGFwXG4gICAgICAgICAgICAgICAgY29uc3QgeGRpZmYgPSBldmVudC50b3VjaGVzWzBdLnBhZ2VYIC0gZmlyc3RUb3VjaC5wYWdlWDtcbiAgICAgICAgICAgICAgICBjb25zdCB5ZGlmZiA9IGV2ZW50LnRvdWNoZXNbMF0ucGFnZVkgLSBmaXJzdFRvdWNoLnBhZ2VZO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvdWNoRGlzdGFuY2UgPSBNYXRoLnNxcnQoeGRpZmYgKiB4ZGlmZiArIHlkaWZmICogeWRpZmYpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRvdWNoRGlzdGFuY2UgPiB0YXBNb3ZlbWVudFRocmVzaG9sZCkge1xuICAgICAgICAgICAgICAgICAgICBjb3VsZEJlVGFwID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBub1RhcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY291bGRCZVRhcCA9IGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub24oJ3RvdWNobGVhdmUnLCBub1RhcCk7XG4gICAgICAgIHRoaXMub24oJ3RvdWNoY2FuY2VsJywgbm9UYXApO1xuXG4gICAgICAgIC8vIFdoZW4gdGhlIHRvdWNoIGVuZHMsIG1lYXN1cmUgaG93IGxvbmcgaXQgdG9vayBhbmQgdHJpZ2dlciB0aGUgYXBwcm9wcmlhdGVcbiAgICAgICAgLy8gZXZlbnRcbiAgICAgICAgdGhpcy5vbigndG91Y2hlbmQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGZpcnN0VG91Y2ggPSBudWxsO1xuICAgICAgICAgICAgLy8gUHJvY2VlZCBvbmx5IGlmIHRoZSB0b3VjaG1vdmUvbGVhdmUvY2FuY2VsIGV2ZW50IGRpZG4ndCBoYXBwZW5cbiAgICAgICAgICAgIGlmIChjb3VsZEJlVGFwID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgLy8gTWVhc3VyZSBob3cgbG9uZyB0aGUgdG91Y2ggbGFzdGVkXG4gICAgICAgICAgICAgICAgY29uc3QgdG91Y2hUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0b3VjaFN0YXJ0O1xuXG4gICAgICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSB0b3VjaCB3YXMgbGVzcyB0aGFuIHRoZSB0aHJlc2hvbGQgdG8gYmUgY29uc2lkZXJlZCBhIHRhcFxuICAgICAgICAgICAgICAgIGlmICh0b3VjaFRpbWUgPCB0b3VjaFRpbWVUaHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRG9uJ3QgbGV0IGJyb3dzZXIgdHVybiB0aGlzIGludG8gYSBjbGlja1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gYSBgQ29tcG9uZW50YCBpcyB0YXBwZWQuXG4gICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBDb21wb25lbnQjdGFwXG4gICAgICAgICAgICAgICAgICAgICAqIEB0eXBlIHtFdmVudFRhcmdldH5FdmVudH1cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcigndGFwJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIEl0IG1heSBiZSBnb29kIHRvIGNvcHkgdGhlIHRvdWNoZW5kIGV2ZW50IG9iamVjdCBhbmQgY2hhbmdlIHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyB0eXBlIHRvIHRhcCwgaWYgdGhlIG90aGVyIGV2ZW50IHByb3BlcnRpZXMgYXJlbid0IGV4YWN0IGFmdGVyXG4gICAgICAgICAgICAgICAgICAgIC8vIEV2ZW50cy5maXhFdmVudCBydW5zIChlLmcuIGV2ZW50LnRhcmdldClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNyZWF0ZUVsKHRhZ05hbWU/OiBzdHJpbmcgPSBcImRpdlwiLCBwcm9wZXJ0aWVzPzogYW55LCBhdHRyaWJ1dGVzPzogYW55KTogSFRNTEVsZW1lbnR7XG4gICAgICAgIGxldCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XG4gICAgICAgIGVsLmNsYXNzTmFtZSA9IHRoaXMuYnVpbGRDU1NDbGFzcygpO1xuXG4gICAgICAgIGZvcihsZXQgYXR0cmlidXRlIGluIGF0dHJpYnV0ZXMpe1xuICAgICAgICAgICAgaWYoYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShhdHRyaWJ1dGUpKXtcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSBhdHRyaWJ1dGVzW2F0dHJpYnV0ZV07XG4gICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9XG5cbiAgICBlbCgpOiBIVE1MRWxlbWVudHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJ1aWxkcyB0aGUgZGVmYXVsdCBET00gY2xhc3MgbmFtZS4gU2hvdWxkIGJlIG92ZXJyaWRlbiBieSBzdWItY29tcG9uZW50cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICAgKiAgICAgICAgIFRoZSBET00gY2xhc3MgbmFtZSBmb3IgdGhpcyBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAYWJzdHJhY3RcbiAgICAgKi9cbiAgICBidWlsZENTU0NsYXNzKCkge1xuICAgICAgICAvLyBDaGlsZCBjbGFzc2VzIGNhbiBpbmNsdWRlIGEgZnVuY3Rpb24gdGhhdCBkb2VzOlxuICAgICAgICAvLyByZXR1cm4gJ0NMQVNTIE5BTUUnICsgdGhpcy5fc3VwZXIoKTtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIG9uKG5hbWU6IHN0cmluZywgYWN0aW9uOiBGdW5jdGlvbik6IHZvaWR7XG4gICAgICAgIHRoaXMuZWwoKS5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGFjdGlvbik7XG4gICAgfVxuXG4gICAgb2ZmKG5hbWU6IHN0cmluZywgYWN0aW9uOiBGdW5jdGlvbik6IHZvaWR7XG4gICAgICAgIHRoaXMuZWwoKS5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIGFjdGlvbik7XG4gICAgfVxuXG4gICAgb25lKG5hbWU6IHN0cmluZywgYWN0aW9uOiBGdW5jdGlvbik6IHZvaWR7XG4gICAgICAgIGxldCBvbmVUaW1lRnVuY3Rpb247XG4gICAgICAgIHRoaXMub24obmFtZSwgb25lVGltZUZ1bmN0aW9uID0gKCk9PntcbiAgICAgICAgICAgYWN0aW9uKCk7XG4gICAgICAgICAgIHRoaXMub2ZmKG5hbWUsIG9uZVRpbWVGdW5jdGlvbik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vRG8gbm90aGluZyBieSBkZWZhdWx0XG4gICAgaGFuZGxlUmVzaXplKCk6IHZvaWR7XG4gICAgfVxuXG4gICAgYWRkQ2xhc3MobmFtZTogc3RyaW5nKXtcbiAgICAgICAgdGhpcy5lbCgpLmNsYXNzTGlzdC5hZGQobmFtZSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlQ2xhc3MobmFtZTogc3RyaW5nKXtcbiAgICAgICAgdGhpcy5lbCgpLmNsYXNzTGlzdC5yZW1vdmUobmFtZSk7XG4gICAgfVxuXG4gICAgdG9nZ2xlQ2xhc3MobmFtZTogc3RyaW5nKXtcbiAgICAgICAgdGhpcy5lbCgpLmNsYXNzTGlzdC50b2dnbGUobmFtZSk7XG4gICAgfVxuXG4gICAgc2hvdygpe1xuICAgICAgICB0aGlzLmVsKCkuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICB9XG5cbiAgICBoaWRlKCl7XG4gICAgICAgIHRoaXMuZWwoKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfVxuXG4gICAgYWRkQ2hpbGQobmFtZTogc3RyaW5nLCBjb21wb25lbnQ6IENvbXBvbmVudCwgaW5kZXg6ID9udW1iZXIpIDogdm9pZHtcbiAgICAgICAgbGV0IGxvY2F0aW9uID0gdGhpcy5lbCgpO1xuICAgICAgICBpZighaW5kZXgpe1xuICAgICAgICAgICAgaW5kZXggPSAtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHR5cGVvZiBjb21wb25lbnQuZWwgPT09IFwiZnVuY3Rpb25cIiAmJiBjb21wb25lbnQuZWwoKSl7XG4gICAgICAgICAgICBpZihpbmRleCA9PT0gLTEpe1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmFwcGVuZENoaWxkKGNvbXBvbmVudC5lbCgpKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGxldCBjaGlsZHJlbiA9IGxvY2F0aW9uLmNoaWxkTm9kZXM7XG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gY2hpbGRyZW5baW5kZXhdO1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmluc2VydEJlZm9yZShjb21wb25lbnQuZWwoKSwgY2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fY2hpbGRyZW4ucHVzaCh7XG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgY29tcG9uZW50LFxuICAgICAgICAgICAgbG9jYXRpb25cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlQ2hpbGQobmFtZTogc3RyaW5nKTogdm9pZHtcbiAgICAgICAgdGhpcy5fY2hpbGRyZW4gPSB0aGlzLl9jaGlsZHJlbi5yZWR1Y2UoKGFjYywgY29tcG9uZW50KT0+e1xuICAgICAgICAgICAgaWYoY29tcG9uZW50Lm5hbWUgIT09IG5hbWUpe1xuICAgICAgICAgICAgICAgIGFjYy5wdXNoKGNvbXBvbmVudCk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuY29tcG9uZW50LmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgIH0sIFtdKTtcbiAgICB9XG5cbiAgICBnZXRDaGlsZChuYW1lOiBzdHJpbmcpOiBDb21wb25lbnQgfCBudWxse1xuICAgICAgICBsZXQgY29tcG9uZW50O1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5fY2hpbGRyZW4ubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgaWYodGhpcy5fY2hpbGRyZW5baV0ubmFtZSA9PT0gbmFtZSl7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50ID0gdGhpcy5fY2hpbGRyZW5baV07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudD8gY29tcG9uZW50LmNvbXBvbmVudDogbnVsbDtcbiAgICB9XG5cbiAgICBnZXQgcGxheWVyKCk6IFBsYXllcntcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BsYXllcjtcbiAgICB9XG5cbiAgICBnZXQgb3B0aW9ucygpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9ucztcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudDtcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIHsgUGxheWVyLCBTZXR0aW5ncyB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBUd29EVmlkZW8gZnJvbSAnLi9Ud29EVmlkZW8nO1xuaW1wb3J0IFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuXG5jbGFzcyBEdWFsRmlzaGV5ZSBleHRlbmRzIFR3b0RWaWRlb3tcbiAgICBfbWVzaDogYW55O1xuXG4gICAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXIsIG9wdGlvbnM6IFNldHRpbmdzLCByZW5kZXJFbGVtZW50OiBIVE1MRWxlbWVudCl7XG4gICAgICAgIHN1cGVyKHBsYXllciwgb3B0aW9ucywgcmVuZGVyRWxlbWVudCk7XG5cbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUJ1ZmZlckdlb21ldHJ5KCA1MDAsIDYwLCA0MCApLnRvTm9uSW5kZXhlZCgpO1xuICAgICAgICBsZXQgbm9ybWFscyA9IGdlb21ldHJ5LmF0dHJpYnV0ZXMubm9ybWFsLmFycmF5O1xuICAgICAgICBsZXQgdXZzID0gZ2VvbWV0cnkuYXR0cmlidXRlcy51di5hcnJheTtcbiAgICAgICAgbGV0IGwgPSBub3JtYWxzLmxlbmd0aCAvIDM7XG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGwgLyAyOyBpICsrICkge1xuICAgICAgICAgICAgbGV0IHggPSBub3JtYWxzWyBpICogMyArIDAgXTtcbiAgICAgICAgICAgIGxldCB5ID0gbm9ybWFsc1sgaSAqIDMgKyAxIF07XG4gICAgICAgICAgICBsZXQgeiA9IG5vcm1hbHNbIGkgKiAzICsgMiBdO1xuXG4gICAgICAgICAgICBsZXQgciA9ICggeCA9PSAwICYmIHogPT0gMCApID8gMSA6ICggTWF0aC5hY29zKCB5ICkgLyBNYXRoLnNxcnQoIHggKiB4ICsgeiAqIHogKSApICogKCAyIC8gTWF0aC5QSSApO1xuICAgICAgICAgICAgdXZzWyBpICogMiArIDAgXSA9IHggKiB0aGlzLm9wdGlvbnMuZHVhbEZpc2guY2lyY2xlMS5yeCAqIHIgKiB0aGlzLm9wdGlvbnMuZHVhbEZpc2guY2lyY2xlMS5jb3ZlclggICsgdGhpcy5vcHRpb25zLmR1YWxGaXNoLmNpcmNsZTEueDtcbiAgICAgICAgICAgIHV2c1sgaSAqIDIgKyAxIF0gPSB6ICogdGhpcy5vcHRpb25zLmR1YWxGaXNoLmNpcmNsZTEucnkgKiByICogdGhpcy5vcHRpb25zLmR1YWxGaXNoLmNpcmNsZTEuY292ZXJZICArIHRoaXMub3B0aW9ucy5kdWFsRmlzaC5jaXJjbGUxLnk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICggbGV0IGkgPSBsIC8gMjsgaSA8IGw7IGkgKysgKSB7XG4gICAgICAgICAgICBsZXQgeCA9IG5vcm1hbHNbIGkgKiAzICsgMCBdO1xuICAgICAgICAgICAgbGV0IHkgPSBub3JtYWxzWyBpICogMyArIDEgXTtcbiAgICAgICAgICAgIGxldCB6ID0gbm9ybWFsc1sgaSAqIDMgKyAyIF07XG5cbiAgICAgICAgICAgIGxldCByID0gKCB4ID09IDAgJiYgeiA9PSAwICkgPyAxIDogKCBNYXRoLmFjb3MoIC0geSApIC8gTWF0aC5zcXJ0KCB4ICogeCArIHogKiB6ICkgKSAqICggMiAvIE1hdGguUEkgKTtcbiAgICAgICAgICAgIHV2c1sgaSAqIDIgKyAwIF0gPSAtIHggKiB0aGlzLm9wdGlvbnMuZHVhbEZpc2guY2lyY2xlMi5yeCAqIHIgKiB0aGlzLm9wdGlvbnMuZHVhbEZpc2guY2lyY2xlMi5jb3ZlclggICsgdGhpcy5vcHRpb25zLmR1YWxGaXNoLmNpcmNsZTIueDtcbiAgICAgICAgICAgIHV2c1sgaSAqIDIgKyAxIF0gPSB6ICogdGhpcy5vcHRpb25zLmR1YWxGaXNoLmNpcmNsZTIucnkgKiByICogdGhpcy5vcHRpb25zLmR1YWxGaXNoLmNpcmNsZTIuY292ZXJZICArIHRoaXMub3B0aW9ucy5kdWFsRmlzaC5jaXJjbGUyLnk7XG4gICAgICAgIH1cbiAgICAgICAgZ2VvbWV0cnkucm90YXRlWCggdGhpcy5vcHRpb25zLlNwaGVyZS5yb3RhdGVYKTtcbiAgICAgICAgZ2VvbWV0cnkucm90YXRlWSggdGhpcy5vcHRpb25zLlNwaGVyZS5yb3RhdGVZKTtcbiAgICAgICAgZ2VvbWV0cnkucm90YXRlWiggdGhpcy5vcHRpb25zLlNwaGVyZS5yb3RhdGVaKTtcbiAgICAgICAgZ2VvbWV0cnkuc2NhbGUoIC0gMSwgMSwgMSApO1xuXG4gICAgICAgIC8vZGVmaW5lIG1lc2hcbiAgICAgICAgdGhpcy5fbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LFxuICAgICAgICAgICAgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLl90ZXh0dXJlfSlcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fc2NlbmUuYWRkKHRoaXMuX21lc2gpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRHVhbEZpc2hleWU7IiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgeyBQbGF5ZXIsIFNldHRpbmdzIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IFR3b0RWaWRlbyBmcm9tICcuL1R3b0RWaWRlbyc7XG5pbXBvcnQgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5pbXBvcnQgeyBtZXJnZU9wdGlvbnMgfSBmcm9tICcuLi91dGlscyc7XG5cbmNvbnN0IGRlZmF1bHRzID0ge1xuICAgIFNwaGVyaWNhbFNlZ21lbnQgOiB7XG4gICAgICAgIHN0YXJ0IDogMCxcbiAgICAgICAgbGVuZ3RoIDogMVxuICAgIH1cbn1cblxuY2xhc3MgRXF1aXJlY3Rhbmd1bGFyIGV4dGVuZHMgVHdvRFZpZGVve1xuICAgIF9tZXNoOiBhbnk7XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczogU2V0dGluZ3MsIHJlbmRlckVsZW1lbnQ6IEhUTUxFbGVtZW50KXtcbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zLCByZW5kZXJFbGVtZW50KTtcbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IG1lcmdlT3B0aW9ucyh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIFxuICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoNTAwLCA2MCwgNDAsIDAsIE1hdGguUEkgKiAyLCBNYXRoLlBJICogdGhpcy5vcHRpb25zLlNwaGVyaWNhbFNlZ21lbnQuc3RhcnQsIE1hdGguUEkgKiB0aGlzLm9wdGlvbnMuU3BoZXJpY2FsU2VnbWVudC5sZW5ndGgpO1xuICAgICAgICBnZW9tZXRyeS5zY2FsZSggLSAxLCAxLCAxICk7XG4gICAgICAgIC8vZGVmaW5lIG1lc2hcbiAgICAgICAgdGhpcy5fbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LFxuICAgICAgICAgICAgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLl90ZXh0dXJlfSlcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fc2NlbmUuYWRkKHRoaXMuX21lc2gpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRXF1aXJlY3Rhbmd1bGFyOyIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIHsgUGxheWVyLCBTZXR0aW5ncyB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBUd29EVmlkZW8gZnJvbSAnLi9Ud29EVmlkZW8nO1xuaW1wb3J0IFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuXG5jbGFzcyBGaXNoZXllIGV4dGVuZHMgVHdvRFZpZGVve1xuICAgIF9tZXNoOiBhbnk7XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczogU2V0dGluZ3MsIHJlbmRlckVsZW1lbnQ6IEhUTUxFbGVtZW50KXtcbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zLCByZW5kZXJFbGVtZW50KTtcblxuICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlQnVmZmVyR2VvbWV0cnkoIDUwMCwgNjAsIDQwICkudG9Ob25JbmRleGVkKCk7XG4gICAgICAgIGxldCBub3JtYWxzID0gZ2VvbWV0cnkuYXR0cmlidXRlcy5ub3JtYWwuYXJyYXk7XG4gICAgICAgIGxldCB1dnMgPSBnZW9tZXRyeS5hdHRyaWJ1dGVzLnV2LmFycmF5O1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDAsIGwgPSBub3JtYWxzLmxlbmd0aCAvIDM7IGkgPCBsOyBpICsrICkge1xuICAgICAgICAgICAgbGV0IHggPSBub3JtYWxzWyBpICogMyArIDAgXTtcbiAgICAgICAgICAgIGxldCB5ID0gbm9ybWFsc1sgaSAqIDMgKyAxIF07XG4gICAgICAgICAgICBsZXQgeiA9IG5vcm1hbHNbIGkgKiAzICsgMiBdO1xuXG4gICAgICAgICAgICBsZXQgciA9IE1hdGguYXNpbihNYXRoLnNxcnQoeCAqIHggKyB6ICogeikgLyBNYXRoLnNxcnQoeCAqIHggICsgeSAqIHkgKyB6ICogeikpIC8gTWF0aC5QSTtcbiAgICAgICAgICAgIGlmKHkgPCAwKSByID0gMSAtIHI7XG4gICAgICAgICAgICBsZXQgdGhldGEgPSAoeCA9PT0gMCAmJiB6ID09PSAwKT8gMCA6IE1hdGguYWNvcyh4IC8gTWF0aC5zcXJ0KHggKiB4ICsgeiAqIHopKTtcbiAgICAgICAgICAgIGlmKHogPCAwKSB0aGV0YSA9IHRoZXRhICogLTE7XG4gICAgICAgICAgICB1dnNbIGkgKiAyICsgMCBdID0gLTAuOCAqIHIgKiBNYXRoLmNvcyh0aGV0YSkgKyAwLjU7XG4gICAgICAgICAgICB1dnNbIGkgKiAyICsgMSBdID0gMC44ICogciAqIE1hdGguc2luKHRoZXRhKSArIDAuNTtcbiAgICAgICAgfVxuICAgICAgICBnZW9tZXRyeS5yb3RhdGVYKCB0aGlzLm9wdGlvbnMuU3BoZXJlLnJvdGF0ZVgpO1xuICAgICAgICBnZW9tZXRyeS5yb3RhdGVZKCB0aGlzLm9wdGlvbnMuU3BoZXJlLnJvdGF0ZVkpO1xuICAgICAgICBnZW9tZXRyeS5yb3RhdGVaKCB0aGlzLm9wdGlvbnMuU3BoZXJlLnJvdGF0ZVopO1xuICAgICAgICBnZW9tZXRyeS5zY2FsZSggLSAxLCAxLCAxICk7XG4gICAgICAgIC8vZGVmaW5lIG1lc2hcbiAgICAgICAgdGhpcy5fbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LFxuICAgICAgICAgICAgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLl90ZXh0dXJlfSlcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fc2NlbmUuYWRkKHRoaXMuX21lc2gpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRmlzaGV5ZTsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7IFBsYXllciB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBDb21wb25lbnQgZnJvbSAnLi9Db21wb25lbnQnO1xuXG5jbGFzcyBIZWxwZXJDYW52YXMgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIF92aWRlb0VsZW1lbnQ6IEhUTUxWaWRlb0VsZW1lbnQ7XG4gICAgX2NvbnRleHQ6IGFueTtcbiAgICBfd2lkdGg6IG51bWJlcjtcbiAgICBfaGVpZ2h0OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9ucz86IGFueSA9IHt9KXtcbiAgICAgICAgbGV0IGVsZW1lbnQ6IGFueSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9IFwidmpzLXBhbm9yYW1hLXZpZGVvLWhlbHBlci1jYW52YXNcIjtcbiAgICAgICAgb3B0aW9ucy5lbCA9IGVsZW1lbnQ7XG4gICAgICAgIHN1cGVyKHBsYXllciwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX3ZpZGVvRWxlbWVudCA9IHBsYXllci5nZXRWaWRlb0VsKCk7XG4gICAgICAgIHRoaXMuX3dpZHRoID0gdGhpcy5fdmlkZW9FbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICB0aGlzLl9oZWlnaHQgPSB0aGlzLl92aWRlb0VsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuXG4gICAgICAgIHRoaXMudXBkYXRlRGltZW50aW9uKCk7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuXG4gICAgICAgIHRoaXMuX2NvbnRleHQgPSBlbGVtZW50LmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIHRoaXMuX2NvbnRleHQuZHJhd0ltYWdlKHRoaXMuX3ZpZGVvRWxlbWVudCwgMCwgMCwgdGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgYWN0dWFsIHZpZGVvIGRpbWVuc2lvbiBhZnRlciB2aWRlbyBsb2FkLlxuICAgICAgICAgKi9cbiAgICAgICAgcGxheWVyLm9uZShcImxvYWRlZG1ldGFkYXRhXCIsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3dpZHRoID0gdGhpcy5fdmlkZW9FbGVtZW50LnZpZGVvV2lkdGg7XG4gICAgICAgICAgICB0aGlzLl9oZWlnaHQgPSB0aGlzLl92aWRlb0VsZW1lbnQudmlkZW9IZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURpbWVudGlvbigpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdXBkYXRlRGltZW50aW9uKCl7XG4gICAgICAgIHRoaXMuZWwoKS53aWR0aCA9IHRoaXMuX3dpZHRoO1xuICAgICAgICB0aGlzLmVsKCkuaGVpZ2h0ID0gdGhpcy5faGVpZ2h0O1xuICAgIH1cblxuICAgIGVsKCl7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbDtcbiAgICB9XG5cbiAgICByZW5kZXIoKXtcbiAgICAgICAgdGhpcy5fY29udGV4dC5kcmF3SW1hZ2UodGhpcy5fdmlkZW9FbGVtZW50LCAwLCAwLCB0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEhlbHBlckNhbnZhczsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7IFBsYXllciwgTWFya2VyU2V0dGluZ3MsIFBvaW50IH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQgQmFzZUNhbnZhcyBmcm9tICcuL0Jhc2VDYW52YXMnO1xuaW1wb3J0IHsgbWVyZ2VPcHRpb25zIH0gZnJvbSAnLi4vdXRpbHMnO1xuXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgICBrZXlQb2ludDogLTEsXG4gICAgZHVyYXRpb246IC0xXG59O1xuXG5jbGFzcyBNYXJrZXIgZXh0ZW5kcyBDb21wb25lbnR7XG4gICAgX3Bvc2l0aW9uOiBUSFJFRS5WZWN0b3IzO1xuICAgIF9lbmFibGU6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczogTWFya2VyU2V0dGluZ3MgJiB7XG4gICAgICAgIGVsPzogSFRNTEVsZW1lbnQ7XG4gICAgfSl7XG4gICAgICAgIGxldCBlbDogSFRNTEVsZW1lbnQ7XG5cbiAgICAgICAgbGV0IGVsZW0gPSBvcHRpb25zLmVsZW1lbnQ7XG4gICAgICAgIGlmKHR5cGVvZiBlbGVtID09PSBcInN0cmluZ1wiKXtcbiAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBlbC5pbm5lclRleHQgPSBlbGVtO1xuICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICBlbCA9IGVsZW0uY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsLmlkID0gb3B0aW9ucy5pZCB8fCBcIlwiO1xuICAgICAgICBlbC5jbGFzc05hbWUgPSBcInZqcy1tYXJrZXJcIjtcblxuICAgICAgICBvcHRpb25zLmVsID0gZWw7XG5cbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IG1lcmdlT3B0aW9ucyh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgICAgIGxldCBwaGkgPSBUSFJFRS5NYXRoLmRlZ1RvUmFkKCA5MCAtIG9wdGlvbnMubG9jYXRpb24ubGF0ICk7XG4gICAgICAgIGxldCB0aGV0YSA9IFRIUkVFLk1hdGguZGVnVG9SYWQoIG9wdGlvbnMubG9jYXRpb24ubG9uICk7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoXG4gICAgICAgICAgICBvcHRpb25zLnJhZGl1cyAqIE1hdGguc2luKCBwaGkgKSAqIE1hdGguY29zKCB0aGV0YSApLFxuICAgICAgICAgICAgb3B0aW9ucy5yYWRpdXMgKiBNYXRoLmNvcyggcGhpICksXG4gICAgICAgICAgICBvcHRpb25zLnJhZGl1cyAqIE1hdGguc2luKCBwaGkgKSAqIE1hdGguc2luKCB0aGV0YSApLFxuICAgICAgICApO1xuICAgICAgICBpZih0aGlzLm9wdGlvbnMua2V5UG9pbnQgPCAwKXtcbiAgICAgICAgICAgIHRoaXMuZW5hYmxlTWFya2VyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBlbmFibGVNYXJrZXIoKXtcbiAgICAgICAgdGhpcy5fZW5hYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhcInZqcy1tYXJrZXItLWVuYWJsZVwiKTtcbiAgICAgICAgaWYodGhpcy5vcHRpb25zLm9uU2hvdyl7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25TaG93LmNhbGwobnVsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNhYmxlTWFya2VyKCl7XG4gICAgICAgIHRoaXMuX2VuYWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKFwidmpzLW1hcmtlci0tZW5hYmxlXCIpO1xuICAgICAgICBpZih0aGlzLm9wdGlvbnMub25IaWRlKXtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkhpZGUuY2FsbChudWxsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcihjYW52YXM6IEJhc2VDYW52YXMsIGNhbWVyYTogVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEpe1xuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLl9wb3NpdGlvbi5hbmdsZVRvKGNhbWVyYS50YXJnZXQpO1xuICAgICAgICBpZihhbmdsZSA+IE1hdGguUEkgKiAwLjQpe1xuICAgICAgICAgICAgdGhpcy5hZGRDbGFzcyhcInZqcy1tYXJrZXItLWJhY2tzaWRlXCIpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoXCJ2anMtbWFya2VyLS1iYWNrc2lkZVwiKTtcbiAgICAgICAgICAgIGxldCB2ZWN0b3IgPSB0aGlzLl9wb3NpdGlvbi5jbG9uZSgpLnByb2plY3QoY2FtZXJhKTtcbiAgICAgICAgICAgIGxldCB3aWR0aCA9IGNhbnZhcy5WUk1vZGU/IGNhbnZhcy5fd2lkdGggLyAyOiBjYW52YXMuX3dpZHRoO1xuICAgICAgICAgICAgbGV0IHBvaW50OiBQb2ludCA9IHtcbiAgICAgICAgICAgICAgICB4OiAodmVjdG9yLnggKyAxKSAvIDIgKiB3aWR0aCxcbiAgICAgICAgICAgICAgICB5OiAtICh2ZWN0b3IueSAtIDEpIC8gMiAqIGNhbnZhcy5faGVpZ2h0XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5lbCgpLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHtwb2ludC54fXB4LCAke3BvaW50Lnl9cHgpYDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBlbmFibGUoKTogYm9vbGVhbntcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VuYWJsZTtcbiAgICB9XG5cbiAgICBnZXQgcG9zaXRpb24oKTogVEhSRUUuVmVjdG9yM3tcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvc2l0aW9uO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWFya2VyOyIsIi8vIEBmbG93XG5cbmltcG9ydCBCYXNlQ2FudmFzIGZyb20gJy4vQmFzZUNhbnZhcyc7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCBNYXJrZXJHcm91cCBmcm9tICcuL01hcmtlckdyb3VwJztcbmltcG9ydCB7IG1lcmdlT3B0aW9ucyB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB0eXBlIHsgUGxheWVyLCBNYXJrZXJTZXR0aW5ncyB9IGZyb20gJy4uL3R5cGVzJztcblxuY2xhc3MgTWFya2VyQ29udGFpbmVyIGV4dGVuZHMgQ29tcG9uZW50e1xuICAgIF9jYW52YXM6IEJhc2VDYW52YXM7XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczoge1xuICAgICAgICBjYW52YXM6IEJhc2VDYW52YXM7XG4gICAgICAgIG1hcmtlcnM6IE1hcmtlclNldHRpbmdzW107XG4gICAgICAgIFZSRW5hYmxlOiBib29sZWFuO1xuICAgIH0pe1xuICAgICAgICBzdXBlcihwbGF5ZXIsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmVsKCkuY2xhc3NMaXN0LmFkZChcInZqcy1tYXJrZXItY29udGFpbmVyXCIpO1xuICAgICAgICB0aGlzLl9jYW52YXMgPSB0aGlzLm9wdGlvbnMuY2FudmFzO1xuXG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5WUkVuYWJsZSl7XG4gICAgICAgICAgICBsZXQgbGVmdE1hcmtlckdyb3VwID0gbmV3IE1hcmtlckdyb3VwKHRoaXMucGxheWVyLCB7XG4gICAgICAgICAgICAgICAgaWQ6IFwibGVmdF9ncm91cFwiLFxuICAgICAgICAgICAgICAgIGNhbnZhczogdGhpcy5fY2FudmFzLFxuICAgICAgICAgICAgICAgIG1hcmtlcnM6IHRoaXMub3B0aW9ucy5tYXJrZXJzLFxuICAgICAgICAgICAgICAgIGNhbWVyYTogdGhpcy5fY2FudmFzLl9jYW1lcmFcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgbWFya2Vyc1NldHRpbmdzID0gdGhpcy5vcHRpb25zLm1hcmtlcnMubWFwKChtYXJrZXI6IE1hcmtlclNldHRpbmdzKT0+e1xuICAgICAgICAgICAgICAgIGxldCBuZXdNYXJrZXIgPSBtZXJnZU9wdGlvbnMoe30sIG1hcmtlcik7XG4gICAgICAgICAgICAgICAgbmV3TWFya2VyLm9uU2hvdyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBuZXdNYXJrZXIub25IaWRlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXdNYXJrZXI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCByaWdodE1hcmtlckdyb3VwID0gbmV3IE1hcmtlckdyb3VwKHRoaXMucGxheWVyLCB7XG4gICAgICAgICAgICAgICAgaWQ6IFwicmlnaHRfZ3JvdXBcIixcbiAgICAgICAgICAgICAgICBjYW52YXM6IHRoaXMuX2NhbnZhcyxcbiAgICAgICAgICAgICAgICBtYXJrZXJzOiBtYXJrZXJzU2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgY2FtZXJhOiB0aGlzLl9jYW52YXMuX2NhbWVyYVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmFkZENoaWxkKFwibGVmdE1hcmtlckdyb3VwXCIsIGxlZnRNYXJrZXJHcm91cCk7XG4gICAgICAgICAgICB0aGlzLmFkZENoaWxkKFwicmlnaHRNYXJrZXJHcm91cFwiLCByaWdodE1hcmtlckdyb3VwKTtcblxuICAgICAgICAgICAgbGVmdE1hcmtlckdyb3VwLmF0dGFjaEV2ZW50cygpO1xuICAgICAgICAgICAgaWYodGhpcy5fY2FudmFzLlZSTW9kZSl7XG4gICAgICAgICAgICAgICAgcmlnaHRNYXJrZXJHcm91cC5hdHRhY2hFdmVudHMoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIub24oXCJWUk1vZGVPblwiLCAoKT0+e1xuICAgICAgICAgICAgICAgIHRoaXMuZWwoKS5jbGFzc0xpc3QuYWRkKFwidmpzLW1hcmtlci1jb250YWluZXItLVZSRW5hYmxlXCIpO1xuICAgICAgICAgICAgICAgIGxlZnRNYXJrZXJHcm91cC5jYW1lcmEgPSB0aGlzLl9jYW52YXMuX2NhbWVyYUw7XG4gICAgICAgICAgICAgICAgcmlnaHRNYXJrZXJHcm91cC5jYW1lcmEgPSB0aGlzLl9jYW52YXMuX2NhbWVyYVI7XG4gICAgICAgICAgICAgICAgcmlnaHRNYXJrZXJHcm91cC5hdHRhY2hFdmVudHMoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnBsYXllci5vbihcIlZSTW9kZU9mZlwiLCAoKT0+e1xuICAgICAgICAgICAgICAgIHRoaXMuZWwoKS5jbGFzc0xpc3QucmVtb3ZlKFwidmpzLW1hcmtlci1jb250YWluZXItLVZSRW5hYmxlXCIpO1xuICAgICAgICAgICAgICAgIGxlZnRNYXJrZXJHcm91cC5jYW1lcmEgPSB0aGlzLl9jYW52YXMuX2NhbWVyYTtcbiAgICAgICAgICAgICAgICByaWdodE1hcmtlckdyb3VwLmRldGFjaEV2ZW50cygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgbGV0IG1hcmtlckdyb3VwID0gbmV3IE1hcmtlckdyb3VwKHRoaXMucGxheWVyLCB7XG4gICAgICAgICAgICAgICAgaWQ6IFwiZ3JvdXBcIixcbiAgICAgICAgICAgICAgICBjYW52YXM6IHRoaXMuX2NhbnZhcyxcbiAgICAgICAgICAgICAgICBtYXJrZXJzOiB0aGlzLm9wdGlvbnMubWFya2VycyxcbiAgICAgICAgICAgICAgICBjYW1lcmE6IHRoaXMuX2NhbnZhcy5fY2FtZXJhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQoXCJtYXJrZXJHcm91cFwiLCBtYXJrZXJHcm91cCk7XG4gICAgICAgICAgICBtYXJrZXJHcm91cC5hdHRhY2hFdmVudHMoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWFya2VyQ29udGFpbmVyO1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuaW1wb3J0IHR5cGUgeyBQbGF5ZXIsIE1hcmtlclNldHRpbmdzIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQgQmFzZUNhbnZhcyBmcm9tICcuL0Jhc2VDYW52YXMnO1xuaW1wb3J0IE1hcmtlciBmcm9tICcuL01hcmtlcic7XG5cbmNsYXNzIE1hcmtlckdyb3VwIGV4dGVuZHMgQ29tcG9uZW50e1xuICAgIC8vc2F2ZSB0b3RhbCBtYXJrZXJzIGVuYWJsZSB0byBnZW5lcmF0ZSBtYXJrZXIgaWRcbiAgICBfdG90YWxNYXJrZXJzOiBudW1iZXI7XG4gICAgX21hcmtlcnM6IE1hcmtlcltdO1xuICAgIF9jYW1lcmE6IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhO1xuICAgIF9jYW52YXM6IEJhc2VDYW52YXM7XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczoge1xuICAgICAgICBpZDogc3RyaW5nO1xuICAgICAgICBtYXJrZXJzOiBNYXJrZXJTZXR0aW5nc1tdLFxuICAgICAgICBjYW52YXM6IEJhc2VDYW52YXMsXG4gICAgICAgIGNhbWVyYTogVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmFcbiAgICB9KXtcbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fdG90YWxNYXJrZXJzID0gMDtcbiAgICAgICAgdGhpcy5fbWFya2VycyA9IFtdO1xuICAgICAgICB0aGlzLl9jYW1lcmEgPSBvcHRpb25zLmNhbWVyYTtcbiAgICAgICAgdGhpcy5lbCgpLmNsYXNzTGlzdC5hZGQoXCJ2anMtbWFya2VyLWdyb3VwXCIpO1xuICAgICAgICB0aGlzLl9jYW52YXMgPSBvcHRpb25zLmNhbnZhcztcblxuICAgICAgICB0aGlzLm9wdGlvbnMubWFya2Vycy5mb3JFYWNoKChtYXJrU2V0dGluZyk9PntcbiAgICAgICAgICAgIHRoaXMuYWRkTWFya2VyKG1hcmtTZXR0aW5nKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXJNYXJrZXJzKCk7XG4gICAgfVxuXG4gICAgYXR0YWNoRXZlbnRzKCl7XG4gICAgICAgIHRoaXMuZWwoKS5jbGFzc0xpc3QuYWRkKFwidmpzLW1hcmtlci1ncm91cC0tZW5hYmxlXCIpO1xuICAgICAgICB0aGlzLnBsYXllci5vbihcInRpbWV1cGRhdGVcIiwgdGhpcy51cGRhdGVNYXJrZXJzLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9jYW52YXMuYWRkTGlzdGVuZXIoXCJyZW5kZXJcIiwgdGhpcy5yZW5kZXJNYXJrZXJzLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGRldGFjaEV2ZW50cygpe1xuICAgICAgICB0aGlzLmVsKCkuY2xhc3NMaXN0LnJlbW92ZShcInZqcy1tYXJrZXItZ3JvdXAtLWVuYWJsZVwiKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIub2ZmKFwidGltZXVwZGF0ZVwiLCB0aGlzLnVwZGF0ZU1hcmtlcnMuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX2NhbnZhcy5yZW1vdmVMaXN0ZW5lcihcInJlbmRlclwiLCB0aGlzLnJlbmRlck1hcmtlcnMuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgYWRkTWFya2VyKG1hcmtTZXR0aW5nOiBhbnkpOiBNYXJrZXJ7XG4gICAgICAgIHRoaXMuX3RvdGFsTWFya2VycysrO1xuICAgICAgICBtYXJrU2V0dGluZy5pZD0gYCR7dGhpcy5vcHRpb25zLmlkfV9gICsgKG1hcmtTZXR0aW5nLmlkPyBtYXJrU2V0dGluZy5pZCA6IGBtYXJrZXJfJHt0aGlzLl90b3RhbE1hcmtlcnN9YCk7XG4gICAgICAgIGxldCBtYXJrZXIgPSBuZXcgTWFya2VyKHRoaXMucGxheWVyLCBtYXJrU2V0dGluZyk7XG4gICAgICAgIHRoaXMuYWRkQ2hpbGQobWFya1NldHRpbmcuaWQsIG1hcmtlcik7XG4gICAgICAgIHRoaXMuX21hcmtlcnMucHVzaChtYXJrZXIpO1xuICAgICAgICByZXR1cm4gbWFya2VyO1xuICAgIH1cblxuICAgIHJlbW92ZU1hcmtlcihtYXJrZXJJZDogc3RyaW5nKTogdm9pZHtcbiAgICAgICAgdGhpcy5yZW1vdmVDaGlsZChtYXJrZXJJZCk7XG4gICAgfVxuXG4gICAgdXBkYXRlTWFya2Vycygpe1xuICAgICAgICBsZXQgY3VycmVudFRpbWUgPSB0aGlzLnBsYXllci5nZXRWaWRlb0VsKCkuY3VycmVudFRpbWUgKiAxMDAwO1xuICAgICAgICB0aGlzLl9tYXJrZXJzLmZvckVhY2goKG1hcmtlcik9PntcbiAgICAgICAgICAgIC8vb25seSBjaGVjayBrZXlwb2ludCBncmVhdGVyIGFuZCBlcXVhbCB6ZXJvXG4gICAgICAgICAgICBpZihtYXJrZXIub3B0aW9ucy5rZXlQb2ludCA+PSAwKXtcbiAgICAgICAgICAgICAgICBpZihtYXJrZXIub3B0aW9ucy5kdXJhdGlvbiA+IDApe1xuICAgICAgICAgICAgICAgICAgICAobWFya2VyLm9wdGlvbnMua2V5UG9pbnQgPD0gY3VycmVudFRpbWUgJiYgY3VycmVudFRpbWUgPCBtYXJrZXIub3B0aW9ucy5rZXlQb2ludCArIG1hcmtlci5vcHRpb25zLmR1cmF0aW9uKT9cbiAgICAgICAgICAgICAgICAgICAgICAgICFtYXJrZXIuZW5hYmxlICYmIG1hcmtlci5lbmFibGVNYXJrZXIoKSA6IG1hcmtlci5lbmFibGUgJiYgbWFya2VyLmRpc2FibGVNYXJrZXIoKTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgKG1hcmtlci5vcHRpb25zLmtleVBvaW50IDw9IGN1cnJlbnRUaW1lKT9cbiAgICAgICAgICAgICAgICAgICAgICAgICFtYXJrZXIuZW5hYmxlICYmIG1hcmtlci5lbmFibGVNYXJrZXIoKSA6IG1hcmtlci5lbmFibGUgJiYgbWFya2VyLmRpc2FibGVNYXJrZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlck1hcmtlcnMoKXtcbiAgICAgICAgdGhpcy5fbWFya2Vycy5mb3JFYWNoKChtYXJrZXIpPT57XG4gICAgICAgICAgICBpZihtYXJrZXIuZW5hYmxlKXtcbiAgICAgICAgICAgICAgICBtYXJrZXIucmVuZGVyKHRoaXMuX2NhbnZhcywgdGhpcy5fY2FtZXJhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0IGNhbWVyYShjYW1lcmE6IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKXtcbiAgICAgICAgdGhpcy5fY2FtZXJhID0gY2FtZXJhO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWFya2VyR3JvdXA7IiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgeyBQbGF5ZXIgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gJy4vQ29tcG9uZW50JztcblxuY2xhc3MgTm90aWZpY2F0aW9uIGV4dGVuZHMgQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiB7XG4gICAgICAgIE1lc3NhZ2U6IHN0cmluZyB8IEhUTUxFbGVtZW50O1xuICAgICAgICBlbD86IEhUTUxFbGVtZW50O1xuICAgIH0pe1xuICAgICAgICBsZXQgZWw6IEhUTUxFbGVtZW50O1xuXG4gICAgICAgIGxldCBtZXNzYWdlID0gb3B0aW9ucy5NZXNzYWdlO1xuICAgICAgICBpZih0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGVsLmNsYXNzTmFtZSA9IFwidmpzLXZpZGVvLW5vdGljZS1sYWJlbCB2anMtdmlkZW8tbm90aWNlLXNob3dcIjtcbiAgICAgICAgICAgIGVsLmlubmVyVGV4dCA9IG1lc3NhZ2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbCA9IG1lc3NhZ2UuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZChcInZqcy12aWRlby1ub3RpY2Utc2hvd1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9wdGlvbnMuZWwgPSBlbDtcblxuICAgICAgICBzdXBlcihwbGF5ZXIsIG9wdGlvbnMpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm90aWZpY2F0aW9uOyIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIHsgUGxheWVyLCBTZXR0aW5ncyB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBCYXNlQ2FudmFzIGZyb20gJy4vQmFzZUNhbnZhcyc7XG5pbXBvcnQgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5cbmNsYXNzIFRocmVlRFZpZGVvIGV4dGVuZHMgQmFzZUNhbnZhc3tcbiAgICBfY2FtZXJhTDogYW55O1xuICAgIF9jYW1lcmFSOiBhbnk7XG5cbiAgICBfbWVzaEw6IGFueTtcbiAgICBfbWVzaFI6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiBTZXR0aW5ncywgcmVuZGVyRWxlbWVudDogSFRNTEVsZW1lbnQpe1xuICAgICAgICBzdXBlcihwbGF5ZXIsIG9wdGlvbnMsIHJlbmRlckVsZW1lbnQpO1xuXG4gICAgICAgIC8vb25seSBzaG93IGxlZnQgcGFydCBieSBkZWZhdWx0XG4gICAgICAgIHRoaXMuX3NjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cbiAgICAgICAgbGV0IGFzcGVjdFJhdGlvID0gdGhpcy5fd2lkdGggLyB0aGlzLl9oZWlnaHQ7XG4gICAgICAgIC8vZGVmaW5lIGNhbWVyYVxuICAgICAgICB0aGlzLl9jYW1lcmFMID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKHRoaXMub3B0aW9ucy5pbml0Rm92LCBhc3BlY3RSYXRpbywgMSwgMjAwMCk7XG4gICAgICAgIHRoaXMuX2NhbWVyYUwudGFyZ2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoIDAsIDAsIDAgKTtcblxuICAgICAgICB0aGlzLl9jYW1lcmFSID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKHRoaXMub3B0aW9ucy5pbml0Rm92LCBhc3BlY3RSYXRpbyAvIDIsIDEsIDIwMDApO1xuICAgICAgICB0aGlzLl9jYW1lcmFSLnBvc2l0aW9uLnNldCggMTAwMCwgMCwgMCApO1xuICAgICAgICB0aGlzLl9jYW1lcmFSLnRhcmdldCA9IG5ldyBUSFJFRS5WZWN0b3IzKCAxMDAwLCAwLCAwICk7XG4gICAgfVxuXG4gICAgaGFuZGxlUmVzaXplKCk6IHZvaWR7XG4gICAgICAgIHN1cGVyLmhhbmRsZVJlc2l6ZSgpO1xuXG4gICAgICAgIGxldCBhc3BlY3RSYXRpbyA9IHRoaXMuX3dpZHRoIC8gdGhpcy5faGVpZ2h0O1xuICAgICAgICBpZighdGhpcy5WUk1vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYUwuYXNwZWN0ID0gYXNwZWN0UmF0aW87XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFMLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBhc3BlY3RSYXRpbyAvPSAyO1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhTC5hc3BlY3QgPSBhc3BlY3RSYXRpbztcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYVIuYXNwZWN0ID0gYXNwZWN0UmF0aW87XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFMLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYVIudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2VXaGVlbChldmVudDogYW55KXtcbiAgICAgICAgc3VwZXIuaGFuZGxlTW91c2VXaGVlbChldmVudCk7XG5cbiAgICAgICAgLy8gV2ViS2l0XG4gICAgICAgIGlmICggZXZlbnQud2hlZWxEZWx0YVkgKSB7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFMLmZvdiAtPSBldmVudC53aGVlbERlbHRhWSAqIDAuMDU7XG4gICAgICAgICAgICAvLyBPcGVyYSAvIEV4cGxvcmVyIDlcbiAgICAgICAgfSBlbHNlIGlmICggZXZlbnQud2hlZWxEZWx0YSApIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYUwuZm92IC09IGV2ZW50LndoZWVsRGVsdGEgKiAwLjA1O1xuICAgICAgICAgICAgLy8gRmlyZWZveFxuICAgICAgICB9IGVsc2UgaWYgKCBldmVudC5kZXRhaWwgKSB7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFMLmZvdiArPSBldmVudC5kZXRhaWwgKiAxLjA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY2FtZXJhTC5mb3YgPSBNYXRoLm1pbih0aGlzLm9wdGlvbnMubWF4Rm92LCB0aGlzLl9jYW1lcmFMLmZvdik7XG4gICAgICAgIHRoaXMuX2NhbWVyYUwuZm92ID0gTWF0aC5tYXgodGhpcy5vcHRpb25zLm1pbkZvdiwgdGhpcy5fY2FtZXJhTC5mb3YpO1xuICAgICAgICB0aGlzLl9jYW1lcmFMLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICAgICAgaWYodGhpcy5WUk1vZGUpe1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhUi5mb3YgPSB0aGlzLl9jYW1lcmFMLmZvdjtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYVIudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZW5hYmxlVlIoKSB7XG4gICAgICAgIHN1cGVyLmVuYWJsZVZSKCk7XG4gICAgICAgIHRoaXMuX3NjZW5lLmFkZCh0aGlzLl9tZXNoUik7XG4gICAgICAgIHRoaXMuaGFuZGxlUmVzaXplKCk7XG4gICAgfVxuXG4gICAgZGlzYWJsZVZSKCkge1xuICAgICAgICBzdXBlci5kaXNhYmxlVlIoKTtcbiAgICAgICAgdGhpcy5fc2NlbmUucmVtb3ZlKHRoaXMuX21lc2hSKTtcbiAgICAgICAgdGhpcy5oYW5kbGVSZXNpemUoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKXtcbiAgICAgICAgc3VwZXIucmVuZGVyKCk7XG5cbiAgICAgICAgdGhpcy5fY2FtZXJhTC50YXJnZXQueCA9IDUwMCAqIE1hdGguc2luKCB0aGlzLl9waGkgKSAqIE1hdGguY29zKCB0aGlzLl90aGV0YSApO1xuICAgICAgICB0aGlzLl9jYW1lcmFMLnRhcmdldC55ID0gNTAwICogTWF0aC5jb3MoIHRoaXMuX3BoaSApO1xuICAgICAgICB0aGlzLl9jYW1lcmFMLnRhcmdldC56ID0gNTAwICogTWF0aC5zaW4oIHRoaXMuX3BoaSApICogTWF0aC5zaW4oIHRoaXMuX3RoZXRhICk7XG4gICAgICAgIHRoaXMuX2NhbWVyYUwubG9va0F0KHRoaXMuX2NhbWVyYUwudGFyZ2V0KTtcblxuICAgICAgICBpZih0aGlzLlZSTW9kZSl7XG4gICAgICAgICAgICBsZXQgdmlld1BvcnRXaWR0aCA9IHRoaXMuX3dpZHRoIC8gMiwgdmlld1BvcnRIZWlnaHQgPSB0aGlzLl9oZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFSLnRhcmdldC54ID0gMTAwMCArIDUwMCAqIE1hdGguc2luKCB0aGlzLl9waGkgKSAqIE1hdGguY29zKCB0aGlzLl90aGV0YSApO1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhUi50YXJnZXQueSA9IDUwMCAqIE1hdGguY29zKCB0aGlzLl9waGkgKTtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYVIudGFyZ2V0LnogPSA1MDAgKiBNYXRoLnNpbiggdGhpcy5fcGhpICkgKiBNYXRoLnNpbiggdGhpcy5fdGhldGEgKTtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYVIubG9va0F0KCB0aGlzLl9jYW1lcmFSLnRhcmdldCApO1xuXG4gICAgICAgICAgICAvLyByZW5kZXIgbGVmdCBleWVcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFZpZXdwb3J0KCAwLCAwLCB2aWV3UG9ydFdpZHRoLCB2aWV3UG9ydEhlaWdodCApO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0U2Npc3NvciggMCwgMCwgdmlld1BvcnRXaWR0aCwgdmlld1BvcnRIZWlnaHQgKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbmRlciggdGhpcy5fc2NlbmUsIHRoaXMuX2NhbWVyYUwgKTtcblxuICAgICAgICAgICAgLy8gcmVuZGVyIHJpZ2h0IGV5ZVxuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0Vmlld3BvcnQoIHZpZXdQb3J0V2lkdGgsIDAsIHZpZXdQb3J0V2lkdGgsIHZpZXdQb3J0SGVpZ2h0ICk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5zZXRTY2lzc29yKCB2aWV3UG9ydFdpZHRoLCAwLCB2aWV3UG9ydFdpZHRoLCB2aWV3UG9ydEhlaWdodCApO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIucmVuZGVyKCB0aGlzLl9zY2VuZSwgdGhpcy5fY2FtZXJhUiApO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbmRlciggdGhpcy5fc2NlbmUsIHRoaXMuX2NhbWVyYUwgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGhyZWVEVmlkZW87IiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgeyBQbGF5ZXIgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gJy4vQ29tcG9uZW50JztcblxuY2xhc3MgVGh1bWJuYWlsIGV4dGVuZHMgQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiB7XG4gICAgICAgIHBvc3RlclNyYzogc3RyaW5nO1xuICAgICAgICBvbkNvbXBsZXRlPzogRnVuY3Rpb247XG4gICAgICAgIGVsPzogSFRNTEVsZW1lbnQ7XG4gICAgfSl7XG4gICAgICAgIGxldCBlbDogSFRNTEVsZW1lbnQ7XG5cbiAgICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICAgICAgZWwuc3JjID0gb3B0aW9ucy5wb3N0ZXJTcmM7XG5cbiAgICAgICAgb3B0aW9ucy5lbCA9IGVsO1xuXG4gICAgICAgIHN1cGVyKHBsYXllciwgb3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5vbmUoJ2xvYWQnLCAoKT0+e1xuICAgICAgICAgICAgaWYob3B0aW9ucy5vbkNvbXBsZXRlKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9uQ29tcGxldGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRodW1ibmFpbDsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7IFBsYXllciwgU2V0dGluZ3MgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgQmFzZUNhbnZhcyBmcm9tICcuL0Jhc2VDYW52YXMnO1xuaW1wb3J0IFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuaW1wb3J0IHsgZ2V0VG91Y2hlc0Rpc3RhbmNlLCBmb3ZUb1Byb2plY3Rpb24gfSBmcm9tICcuLi91dGlscydcblxuY2xhc3MgVHdvRFZpZGVvIGV4dGVuZHMgQmFzZUNhbnZhc3tcbiAgICBfY2FtZXJhOiBhbnk7XG5cbiAgICBfZXllRk9WTDogYW55O1xuICAgIF9leWVGT1ZSOiBhbnk7XG5cbiAgICBfY2FtZXJhTDogYW55O1xuICAgIF9jYW1lcmFSOiBhbnk7XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczogU2V0dGluZ3MsIHJlbmRlckVsZW1lbnQ6IEhUTUxFbGVtZW50KXtcbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zLCByZW5kZXJFbGVtZW50KTtcblxuICAgICAgICAvL2RlZmluZSBzY2VuZVxuICAgICAgICB0aGlzLl9zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuICAgICAgICAvL2RlZmluZSBjYW1lcmFcbiAgICAgICAgdGhpcy5fY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKHRoaXMub3B0aW9ucy5pbml0Rm92LCB0aGlzLl93aWR0aCAvIHRoaXMuX2hlaWdodCwgMSwgMjAwMCk7XG4gICAgICAgIHRoaXMuX2NhbWVyYS50YXJnZXQgPSBuZXcgVEhSRUUuVmVjdG9yMyggMCwgMCwgMCApO1xuICAgIH1cblxuICAgIGVuYWJsZVZSKCl7XG4gICAgICAgIHN1cGVyLmVuYWJsZVZSKCk7XG5cbiAgICAgICAgaWYodHlwZW9mIHdpbmRvdy52ckhNRCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgbGV0IGV5ZVBhcmFtc0wgPSB3aW5kb3cudnJITUQuZ2V0RXllUGFyYW1ldGVycyggJ2xlZnQnICk7XG4gICAgICAgICAgICBsZXQgZXllUGFyYW1zUiA9IHdpbmRvdy52ckhNRC5nZXRFeWVQYXJhbWV0ZXJzKCAncmlnaHQnICk7XG5cbiAgICAgICAgICAgIHRoaXMuX2V5ZUZPVkwgPSBleWVQYXJhbXNMLnJlY29tbWVuZGVkRmllbGRPZlZpZXc7XG4gICAgICAgICAgICB0aGlzLl9leWVGT1ZSID0gZXllUGFyYW1zUi5yZWNvbW1lbmRlZEZpZWxkT2ZWaWV3O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fY2FtZXJhTCA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSh0aGlzLl9jYW1lcmEuZm92LCB0aGlzLl93aWR0aCAvIDIgLyB0aGlzLl9oZWlnaHQsIDEsIDIwMDApO1xuICAgICAgICB0aGlzLl9jYW1lcmFSID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKHRoaXMuX2NhbWVyYS5mb3YsIHRoaXMuX3dpZHRoIC8gMiAvIHRoaXMuX2hlaWdodCwgMSwgMjAwMCk7XG4gICAgICAgIHRoaXMuX2NhbWVyYUwudGFyZ2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoIDAsIDAsIDAgKTtcbiAgICAgICAgdGhpcy5fY2FtZXJhUi50YXJnZXQgPSBuZXcgVEhSRUUuVmVjdG9yMyggMCwgMCwgMCApO1xuICAgIH1cblxuICAgIGRpc2FibGVWUigpe1xuICAgICAgICBzdXBlci5kaXNhYmxlVlIoKTtcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0Vmlld3BvcnQoIDAsIDAsIHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQgKTtcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0U2Npc3NvciggMCwgMCwgdGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCApO1xuICAgIH1cblxuICAgIGhhbmRsZVJlc2l6ZSgpe1xuICAgICAgICBzdXBlci5oYW5kbGVSZXNpemUoKTtcbiAgICAgICAgdGhpcy5fY2FtZXJhLmFzcGVjdCA9IHRoaXMuX3dpZHRoIC8gdGhpcy5faGVpZ2h0O1xuICAgICAgICB0aGlzLl9jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgICAgICBpZih0aGlzLlZSTW9kZSl7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFMLmFzcGVjdCA9IHRoaXMuX2NhbWVyYS5hc3BlY3QgLyAyO1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhUi5hc3BlY3QgPSB0aGlzLl9jYW1lcmEuYXNwZWN0IC8gMjtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYUwudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhUi51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZVdoZWVsKGV2ZW50OiBhbnkpe1xuICAgICAgICBzdXBlci5oYW5kbGVNb3VzZVdoZWVsKGV2ZW50KTtcblxuICAgICAgICAvLyBXZWJLaXRcbiAgICAgICAgaWYgKCBldmVudC53aGVlbERlbHRhWSApIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYS5mb3YgLT0gZXZlbnQud2hlZWxEZWx0YVkgKiAwLjA1O1xuICAgICAgICAgICAgLy8gT3BlcmEgLyBFeHBsb3JlciA5XG4gICAgICAgIH0gZWxzZSBpZiAoIGV2ZW50LndoZWVsRGVsdGEgKSB7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmEuZm92IC09IGV2ZW50LndoZWVsRGVsdGEgKiAwLjA1O1xuICAgICAgICAgICAgLy8gRmlyZWZveFxuICAgICAgICB9IGVsc2UgaWYgKCBldmVudC5kZXRhaWwgKSB7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmEuZm92ICs9IGV2ZW50LmRldGFpbCAqIDEuMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jYW1lcmEuZm92ID0gTWF0aC5taW4odGhpcy5vcHRpb25zLm1heEZvdiwgdGhpcy5fY2FtZXJhLmZvdik7XG4gICAgICAgIHRoaXMuX2NhbWVyYS5mb3YgPSBNYXRoLm1heCh0aGlzLm9wdGlvbnMubWluRm92LCB0aGlzLl9jYW1lcmEuZm92KTtcbiAgICAgICAgdGhpcy5fY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICAgICAgaWYodGhpcy5WUk1vZGUpe1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhTC5mb3YgPSB0aGlzLl9jYW1lcmEuZm92O1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhUi5mb3YgPSB0aGlzLl9jYW1lcmEuZm92O1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhTC51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFSLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZVRvdWNoTW92ZShldmVudDogYW55KSB7XG4gICAgICAgIHN1cGVyLmhhbmRsZVRvdWNoTW92ZShldmVudCk7XG5cbiAgICAgICAgaWYodGhpcy5faXNVc2VyUGluY2gpe1xuICAgICAgICAgICAgbGV0IGN1cnJlbnREaXN0YW5jZSA9IGdldFRvdWNoZXNEaXN0YW5jZShldmVudC50b3VjaGVzKTtcbiAgICAgICAgICAgIGV2ZW50LndoZWVsRGVsdGFZID0gIChjdXJyZW50RGlzdGFuY2UgLSB0aGlzLl9tdWx0aVRvdWNoRGlzdGFuY2UpICogMjtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTW91c2VXaGVlbChldmVudCk7XG4gICAgICAgICAgICB0aGlzLl9tdWx0aVRvdWNoRGlzdGFuY2UgPSBjdXJyZW50RGlzdGFuY2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKXtcbiAgICAgICAgc3VwZXIucmVuZGVyKCk7XG5cbiAgICAgICAgdGhpcy5fY2FtZXJhLnRhcmdldC54ID0gNTAwICogTWF0aC5zaW4oIHRoaXMuX3BoaSApICogTWF0aC5jb3MoIHRoaXMuX3RoZXRhICk7XG4gICAgICAgIHRoaXMuX2NhbWVyYS50YXJnZXQueSA9IDUwMCAqIE1hdGguY29zKCB0aGlzLl9waGkgKTtcbiAgICAgICAgdGhpcy5fY2FtZXJhLnRhcmdldC56ID0gNTAwICogTWF0aC5zaW4oIHRoaXMuX3BoaSApICogTWF0aC5zaW4oIHRoaXMuX3RoZXRhICk7XG4gICAgICAgIHRoaXMuX2NhbWVyYS5sb29rQXQoIHRoaXMuX2NhbWVyYS50YXJnZXQgKTtcblxuICAgICAgICBpZighdGhpcy5WUk1vZGUpe1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIucmVuZGVyKCB0aGlzLl9zY2VuZSwgdGhpcy5fY2FtZXJhICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIGxldCB2aWV3UG9ydFdpZHRoID0gdGhpcy5fd2lkdGggLyAyLCB2aWV3UG9ydEhlaWdodCA9IHRoaXMuX2hlaWdodDtcbiAgICAgICAgICAgIGlmKHR5cGVvZiB3aW5kb3cudnJITUQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYW1lcmFMLnByb2plY3Rpb25NYXRyaXggPSBmb3ZUb1Byb2plY3Rpb24oIHRoaXMuX2V5ZUZPVkwsIHRydWUsIHRoaXMuX2NhbWVyYS5uZWFyLCB0aGlzLl9jYW1lcmEuZmFyICk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FtZXJhUi5wcm9qZWN0aW9uTWF0cml4ID0gZm92VG9Qcm9qZWN0aW9uKCB0aGlzLl9leWVGT1ZSLCB0cnVlLCB0aGlzLl9jYW1lcmEubmVhciwgdGhpcy5fY2FtZXJhLmZhciApO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgbGV0IGxvbkwgPSB0aGlzLl9sb24gKyB0aGlzLm9wdGlvbnMuVlJHYXBEZWdyZWU7XG4gICAgICAgICAgICAgICAgbGV0IGxvblIgPSB0aGlzLl9sb24gLSB0aGlzLm9wdGlvbnMuVlJHYXBEZWdyZWU7XG5cbiAgICAgICAgICAgICAgICBsZXQgdGhldGFMID0gVEhSRUUuTWF0aC5kZWdUb1JhZCggbG9uTCApO1xuICAgICAgICAgICAgICAgIGxldCB0aGV0YVIgPSBUSFJFRS5NYXRoLmRlZ1RvUmFkKCBsb25SICk7XG5cblxuICAgICAgICAgICAgICAgIHRoaXMuX2NhbWVyYUwudGFyZ2V0LnggPSA1MDAgKiBNYXRoLnNpbiggdGhpcy5fcGhpICkgKiBNYXRoLmNvcyggdGhldGFMICk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FtZXJhTC50YXJnZXQueSA9IHRoaXMuX2NhbWVyYS50YXJnZXQueTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYW1lcmFMLnRhcmdldC56ID0gNTAwICogTWF0aC5zaW4oIHRoaXMuX3BoaSApICogTWF0aC5zaW4oIHRoZXRhTCApO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhbWVyYUwubG9va0F0KHRoaXMuX2NhbWVyYUwudGFyZ2V0KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2NhbWVyYVIudGFyZ2V0LnggPSA1MDAgKiBNYXRoLnNpbiggdGhpcy5fcGhpICkgKiBNYXRoLmNvcyggdGhldGFSICk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FtZXJhUi50YXJnZXQueSA9IHRoaXMuX2NhbWVyYS50YXJnZXQueTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYW1lcmFSLnRhcmdldC56ID0gNTAwICogTWF0aC5zaW4oIHRoaXMuX3BoaSApICogTWF0aC5zaW4oIHRoZXRhUiApO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhbWVyYVIubG9va0F0KHRoaXMuX2NhbWVyYVIudGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHJlbmRlciBsZWZ0IGV5ZVxuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0Vmlld3BvcnQoIDAsIDAsIHZpZXdQb3J0V2lkdGgsIHZpZXdQb3J0SGVpZ2h0ICk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5zZXRTY2lzc29yKCAwLCAwLCB2aWV3UG9ydFdpZHRoLCB2aWV3UG9ydEhlaWdodCApO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIucmVuZGVyKCB0aGlzLl9zY2VuZSwgdGhpcy5fY2FtZXJhTCApO1xuXG4gICAgICAgICAgICAvLyByZW5kZXIgcmlnaHQgZXllXG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5zZXRWaWV3cG9ydCggdmlld1BvcnRXaWR0aCwgMCwgdmlld1BvcnRXaWR0aCwgdmlld1BvcnRIZWlnaHQgKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFNjaXNzb3IoIHZpZXdQb3J0V2lkdGgsIDAsIHZpZXdQb3J0V2lkdGgsIHZpZXdQb3J0SGVpZ2h0ICk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW5kZXIoIHRoaXMuX3NjZW5lLCB0aGlzLl9jYW1lcmFSICk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFR3b0RWaWRlbzsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7IFBsYXllciwgU2V0dGluZ3MgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgVGhyZWVEVmlkZW8gZnJvbSAnLi9UaHJlZURWaWRlbyc7XG5pbXBvcnQgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5cbmNsYXNzIFZSMTgwM0QgZXh0ZW5kcyBUaHJlZURWaWRlb3tcbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczogU2V0dGluZ3MsIHJlbmRlckVsZW1lbnQ6IEhUTUxFbGVtZW50KXtcbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zLCByZW5kZXJFbGVtZW50KTtcblxuICAgICAgICBsZXQgZ2VvbWV0cnlMID0gbmV3IFRIUkVFLlNwaGVyZUJ1ZmZlckdlb21ldHJ5KDUwMCwgNjAsIDQwLCAwLCBNYXRoLlBJKS50b05vbkluZGV4ZWQoKTtcbiAgICAgICAgbGV0IGdlb21ldHJ5UiA9IG5ldyBUSFJFRS5TcGhlcmVCdWZmZXJHZW9tZXRyeSg1MDAsIDYwLCA0MCwgMCwgTWF0aC5QSSkudG9Ob25JbmRleGVkKCk7XG5cbiAgICAgICAgbGV0IHV2c0wgPSBnZW9tZXRyeUwuYXR0cmlidXRlcy51di5hcnJheTtcbiAgICAgICAgbGV0IG5vcm1hbHNMID0gZ2VvbWV0cnlMLmF0dHJpYnV0ZXMubm9ybWFsLmFycmF5O1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBub3JtYWxzTC5sZW5ndGggLyAzOyBpICsrICkge1xuICAgICAgICAgICAgdXZzTFsgaSAqIDIgXSA9IHV2c0xbIGkgKiAyIF0gLyAyO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHV2c1IgPSBnZW9tZXRyeVIuYXR0cmlidXRlcy51di5hcnJheTtcbiAgICAgICAgbGV0IG5vcm1hbHNSID0gZ2VvbWV0cnlSLmF0dHJpYnV0ZXMubm9ybWFsLmFycmF5O1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBub3JtYWxzUi5sZW5ndGggLyAzOyBpICsrICkge1xuICAgICAgICAgICAgdXZzUlsgaSAqIDIgXSA9IHV2c1JbIGkgKiAyIF0gLyAyICsgMC41O1xuICAgICAgICB9XG5cbiAgICAgICAgZ2VvbWV0cnlMLnNjYWxlKCAtIDEsIDEsIDEgKTtcbiAgICAgICAgZ2VvbWV0cnlSLnNjYWxlKCAtIDEsIDEsIDEgKTtcblxuICAgICAgICB0aGlzLl9tZXNoTCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5TCxcbiAgICAgICAgICAgIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGhpcy5fdGV4dHVyZX0pXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5fbWVzaFIgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeVIsXG4gICAgICAgICAgICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMuX3RleHR1cmV9KVxuICAgICAgICApO1xuICAgICAgICB0aGlzLl9tZXNoUi5wb3NpdGlvbi5zZXQoMTAwMCwgMCwgMCk7XG5cbiAgICAgICAgdGhpcy5fc2NlbmUuYWRkKHRoaXMuX21lc2hMKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFZSMTgwM0Q7IiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgeyBQbGF5ZXIsIFNldHRpbmdzIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IFRocmVlRFZpZGVvIGZyb20gJy4vVGhyZWVEVmlkZW8nO1xuaW1wb3J0IFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuXG5jbGFzcyBWUjM2MDNEIGV4dGVuZHMgVGhyZWVEVmlkZW97XG4gICAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXIsIG9wdGlvbnM6IFNldHRpbmdzLCByZW5kZXJFbGVtZW50OiBIVE1MRWxlbWVudCl7XG4gICAgICAgIHN1cGVyKHBsYXllciwgb3B0aW9ucywgcmVuZGVyRWxlbWVudCk7XG5cbiAgICAgICAgbGV0IGdlb21ldHJ5TCA9IG5ldyBUSFJFRS5TcGhlcmVCdWZmZXJHZW9tZXRyeSg1MDAsIDYwLCA0MCkudG9Ob25JbmRleGVkKCk7XG4gICAgICAgIGxldCBnZW9tZXRyeVIgPSBuZXcgVEhSRUUuU3BoZXJlQnVmZmVyR2VvbWV0cnkoNTAwLCA2MCwgNDApLnRvTm9uSW5kZXhlZCgpO1xuXG4gICAgICAgIGxldCB1dnNMID0gZ2VvbWV0cnlMLmF0dHJpYnV0ZXMudXYuYXJyYXk7XG4gICAgICAgIGxldCBub3JtYWxzTCA9IGdlb21ldHJ5TC5hdHRyaWJ1dGVzLm5vcm1hbC5hcnJheTtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbm9ybWFsc0wubGVuZ3RoIC8gMzsgaSArKyApIHtcbiAgICAgICAgICAgIHV2c0xbIGkgKiAyICsgMSBdID0gdXZzTFsgaSAqIDIgKyAxIF0gLyAyO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHV2c1IgPSBnZW9tZXRyeVIuYXR0cmlidXRlcy51di5hcnJheTtcbiAgICAgICAgbGV0IG5vcm1hbHNSID0gZ2VvbWV0cnlSLmF0dHJpYnV0ZXMubm9ybWFsLmFycmF5O1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBub3JtYWxzUi5sZW5ndGggLyAzOyBpICsrICkge1xuICAgICAgICAgICAgdXZzUlsgaSAqIDIgKyAxIF0gPSB1dnNSWyBpICogMiArIDEgXSAvIDIgKyAwLjU7XG4gICAgICAgIH1cblxuICAgICAgICBnZW9tZXRyeUwuc2NhbGUoIC0gMSwgMSwgMSApO1xuICAgICAgICBnZW9tZXRyeVIuc2NhbGUoIC0gMSwgMSwgMSApO1xuXG4gICAgICAgIHRoaXMuX21lc2hMID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnlMLFxuICAgICAgICAgICAgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLl90ZXh0dXJlfSlcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLl9tZXNoUiA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5UixcbiAgICAgICAgICAgIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGhpcy5fdGV4dHVyZX0pXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuX21lc2hSLnBvc2l0aW9uLnNldCgxMDAwLCAwLCAwKTtcblxuICAgICAgICB0aGlzLl9zY2VuZS5hZGQodGhpcy5fbWVzaEwpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVlIzNjAzRDsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7IFBsYXllciB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBCdXR0b24gZnJvbSAnLi9CdXR0b24nO1xuXG5jbGFzcyBWUkJ1dHRvbiBleHRlbmRzIEJ1dHRvbntcbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczogYW55ID0ge30pe1xuICAgICAgICBzdXBlcihwbGF5ZXIsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGJ1aWxkQ1NTQ2xhc3MoKSB7XG4gICAgICAgIHJldHVybiBgdmpzLVZSLWNvbnRyb2wgJHtzdXBlci5idWlsZENTU0NsYXNzKCl9YDtcbiAgICB9XG5cbiAgICBoYW5kbGVDbGljayhldmVudDogRXZlbnQpe1xuICAgICAgICBzdXBlci5oYW5kbGVDbGljayhldmVudCk7XG4gICAgICAgIHRoaXMudG9nZ2xlQ2xhc3MoXCJlbmFibGVcIik7XG5cbiAgICAgICAgbGV0IHZpZGVvQ2FudmFzID0gdGhpcy5wbGF5ZXIuZ2V0Q29tcG9uZW50KFwiVmlkZW9DYW52YXNcIik7XG4gICAgICAgIGxldCBWUk1vZGUgPSB2aWRlb0NhbnZhcy5WUk1vZGU7XG4gICAgICAgICghVlJNb2RlKT8gdmlkZW9DYW52YXMuZW5hYmxlVlIoKSA6IHZpZGVvQ2FudmFzLmRpc2FibGVWUigpO1xuICAgICAgICAoIVZSTW9kZSk/ICB0aGlzLnBsYXllci50cmlnZ2VyKCdWUk1vZGVPbicpOiB0aGlzLnBsYXllci50cmlnZ2VyKCdWUk1vZGVPZmYnKTtcbiAgICAgICAgaWYoIVZSTW9kZSAmJiB0aGlzLm9wdGlvbnMuVlJGdWxsc2NyZWVuKXtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmVuYWJsZUZ1bGxzY3JlZW4oKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVlJCdXR0b247IiwiLy8gQGZsb3dcblxuaW1wb3J0IG1ha2VWaWRlb1BsYXlhYmxlSW5saW5lIGZyb20gJ2lwaG9uZS1pbmxpbmUtdmlkZW8nO1xuaW1wb3J0IHR5cGUge1NldHRpbmdzLCBQbGF5ZXIsIFZpZGVvVHlwZXMsIENvb3JkaW5hdGVzLCBBbmltYXRpb25TZXR0aW5nc30gZnJvbSAnLi90eXBlcy9pbmRleCc7XG5pbXBvcnQgdHlwZSBCYXNlQ2FudmFzIGZyb20gJy4vQ29tcG9uZW50cy9CYXNlQ2FudmFzJztcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnd29sZnk4Ny1ldmVudGVtaXR0ZXInO1xuaW1wb3J0IEVxdWlyZWN0YW5ndWxhciBmcm9tICcuL0NvbXBvbmVudHMvRXF1aXJlY3Rhbmd1bGFyJztcbmltcG9ydCBGaXNoZXllIGZyb20gJy4vQ29tcG9uZW50cy9GaXNoZXllJztcbmltcG9ydCBEdWFsRmlzaGV5ZSBmcm9tICcuL0NvbXBvbmVudHMvRHVhbEZpc2hleWUnO1xuaW1wb3J0IFZSMzYwM0QgZnJvbSAnLi9Db21wb25lbnRzL1ZSMzYwM0QnO1xuaW1wb3J0IFZSMTgwM0QgZnJvbSAnLi9Db21wb25lbnRzL1ZSMTgwM0QnO1xuaW1wb3J0IE5vdGlmaWNhdGlvbiBmcm9tICcuL0NvbXBvbmVudHMvTm90aWZpY2F0aW9uJztcbmltcG9ydCBUaHVtYm5haWwgZnJvbSAnLi9Db21wb25lbnRzL1RodW1ibmFpbCc7XG5pbXBvcnQgVlJCdXR0b24gZnJvbSAnLi9Db21wb25lbnRzL1ZSQnV0dG9uJztcbmltcG9ydCBNYXJrZXJDb250YWluZXIgZnJvbSAnLi9Db21wb25lbnRzL01hcmtlckNvbnRhaW5lcic7XG5pbXBvcnQgQW5pbWF0aW9uIGZyb20gJy4vQ29tcG9uZW50cy9BbmltYXRpb24nO1xuaW1wb3J0IHsgRGV0ZWN0b3IsIHdlYkdMRXJyb3JNZXNzYWdlLCBjcm9zc0RvbWFpbldhcm5pbmcsIHRyYW5zaXRpb25FdmVudCwgbWVyZ2VPcHRpb25zLCBtb2JpbGVBbmRUYWJsZXRjaGVjaywgaXNJb3MsIGlzUmVhbElwaG9uZSwgd2FybmluZyB9IGZyb20gJy4vdXRpbHMnO1xuXG5jb25zdCBydW5Pbk1vYmlsZSA9IG1vYmlsZUFuZFRhYmxldGNoZWNrKCk7XG5cbmNvbnN0IHZpZGVvVHlwZXMgPSBbXCJlcXVpcmVjdGFuZ3VsYXJcIiwgXCJmaXNoZXllXCIsIFwiZHVhbF9maXNoZXllXCIsIFwiVlIxODAzRFwiLCBcIlZSMzYwM0RcIl07XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0czogU2V0dGluZ3MgPSB7XG4gICAgdmlkZW9UeXBlOiBcImVxdWlyZWN0YW5ndWxhclwiLFxuICAgIE1vdXNlRW5hYmxlOiB0cnVlLFxuICAgIGNsaWNrQW5kRHJhZzogdHJ1ZSxcbiAgICBtb3ZpbmdTcGVlZDoge1xuICAgICAgICB4OiAwLjAwMDUsXG4gICAgICAgIHk6IDAuMDAwNVxuICAgIH0sXG4gICAgY2xpY2tUb1RvZ2dsZTogdHJ1ZSxcbiAgICBzY3JvbGxhYmxlOiB0cnVlLFxuICAgIHJlc2l6YWJsZTogdHJ1ZSxcbiAgICB1c2VIZWxwZXJDYW52YXM6IFwiYXV0b1wiLFxuICAgIGluaXRGb3Y6IDc1LFxuICAgIG1heEZvdjogMTA1LFxuICAgIG1pbkZvdjogNTEsXG4gICAgLy9pbml0aWFsIHBvc2l0aW9uIGZvciB0aGUgdmlkZW9cbiAgICBpbml0TGF0OiAwLFxuICAgIGluaXRMb246IDE4MCxcbiAgICAvL0EgZmxvYXQgdmFsdWUgYmFjayB0byBjZW50ZXIgd2hlbiBtb3VzZSBvdXQgdGhlIGNhbnZhcy4gVGhlIGhpZ2hlciwgdGhlIGZhc3Rlci5cbiAgICByZXR1cm5MYXRTcGVlZDogMC41LFxuICAgIHJldHVybkxvblNwZWVkOiAyLFxuICAgIGJhY2tUb0luaXRMYXQ6IGZhbHNlLFxuICAgIGJhY2tUb0luaXRMb246IGZhbHNlLFxuXG4gICAgLy9saW1pdCB2aWV3YWJsZSB6b29tXG4gICAgbWluTGF0OiAtODUsXG4gICAgbWF4TGF0OiA4NSxcblxuICAgIG1pbkxvbjogMCxcbiAgICBtYXhMb246IDM2MCxcblxuICAgIGF1dG9Nb2JpbGVPcmllbnRhdGlvbjogdHJ1ZSxcbiAgICBtb2JpbGVWaWJyYXRpb25WYWx1ZTogaXNJb3MoKT8gMC4wMjIgOiAxLFxuXG4gICAgVlJFbmFibGU6IHJ1bk9uTW9iaWxlLFxuICAgIFZSR2FwRGVncmVlOiAwLjUsXG4gICAgVlJGdWxsc2NyZWVuOiB0cnVlLC8vYXV0byBmdWxsc2NyZWVuIHdoZW4gaW4gdnIgbW9kZVxuXG4gICAgUGFub3JhbWFUaHVtYm5haWw6IGZhbHNlLFxuICAgIEtleWJvYXJkQ29udHJvbDogZmFsc2UsXG4gICAgS2V5Ym9hcmRNb3ZpbmdTcGVlZDoge1xuICAgICAgICB4OiAxLFxuICAgICAgICB5OiAxXG4gICAgfSxcblxuICAgIFNwaGVyZTp7XG4gICAgICAgIHJvdGF0ZVg6IDAsXG4gICAgICAgIHJvdGF0ZVk6IDAsXG4gICAgICAgIHJvdGF0ZVo6IDBcbiAgICB9LFxuXG4gICAgZHVhbEZpc2g6IHtcbiAgICAgICAgd2lkdGg6IDE5MjAsXG4gICAgICAgIGhlaWdodDogMTA4MCxcbiAgICAgICAgY2lyY2xlMToge1xuICAgICAgICAgICAgeDogMC4yNDA2MjUsXG4gICAgICAgICAgICB5OiAwLjU1MzcwNCxcbiAgICAgICAgICAgIHJ4OiAwLjIzMzMzLFxuICAgICAgICAgICAgcnk6IDAuNDMxNDgsXG4gICAgICAgICAgICBjb3Zlclg6IDAuOTEzLFxuICAgICAgICAgICAgY292ZXJZOiAwLjlcbiAgICAgICAgfSxcbiAgICAgICAgY2lyY2xlMjoge1xuICAgICAgICAgICAgeDogMC43NTcyOTIsXG4gICAgICAgICAgICB5OiAwLjU1MzcwNCxcbiAgICAgICAgICAgIHJ4OiAwLjIzMjI5MixcbiAgICAgICAgICAgIHJ5OiAwLjQyOTYyOTYsXG4gICAgICAgICAgICBjb3Zlclg6IDAuOTEzLFxuICAgICAgICAgICAgY292ZXJZOiAwLjkzMDhcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBOb3RpY2U6IHtcbiAgICAgICAgRW5hYmxlOiAhcnVuT25Nb2JpbGUsXG4gICAgICAgIE1lc3NhZ2U6IFwiUGxlYXNlIHVzZSB5b3VyIG1vdXNlIGRyYWcgYW5kIGRyb3AgdGhlIHZpZGVvLlwiLFxuICAgICAgICBIaWRlVGltZTogMzAwMCxcbiAgICB9LFxuXG4gICAgTWFya2VyczogZmFsc2UsXG5cbiAgICBBbmltYXRpb25zOiBmYWxzZVxufTtcblxuZXhwb3J0IGNvbnN0IFZSMTgwRGVmYXVsdHM6IGFueSA9IHtcbiAgICAvL2luaXRpYWwgcG9zaXRpb24gZm9yIHRoZSB2aWRlb1xuICAgIGluaXRMYXQ6IDAsXG4gICAgaW5pdExvbjogOTAsXG4gICAgLy9saW1pdCB2aWV3YWJsZSB6b29tXG4gICAgbWluTGF0OiAtNzUsXG4gICAgbWF4TGF0OiA1NSxcblxuICAgIG1pbkxvbjogNTAsXG4gICAgbWF4TG9uOiAxMzAsXG5cbiAgICBjbGlja0FuZERyYWc6IHRydWVcbn07XG5cbi8qKlxuICogcGFub3JhbWEgY29udHJvbGxlciBjbGFzcyB3aGljaCBjb250cm9sIHJlcXVpcmVkIGNvbXBvbmVudHNcbiAqL1xuY2xhc3MgUGFub3JhbWEgZXh0ZW5kcyBFdmVudEVtaXR0ZXJ7XG4gICAgX29wdGlvbnM6IFNldHRpbmdzO1xuICAgIF9wbGF5ZXI6IFBsYXllcjtcbiAgICBfdmlkZW9DYW52YXM6IEJhc2VDYW52YXM7XG4gICAgX3RodW1ibmFpbENhbnZhczogQmFzZUNhbnZhcyB8IG51bGw7XG4gICAgX2FuaW1hdGlvbjogQW5pbWF0aW9uO1xuXG4gICAgLyoqXG4gICAgICogY2hlY2sgbGVnYWN5IG9wdGlvbiBzZXR0aW5ncyBhbmQgcHJvZHVjZSB3YXJuaW5nIG1lc3NhZ2UgaWYgdXNlciB1c2UgbGVnYWN5IG9wdGlvbnMsIGF1dG9tYXRpY2FsbHkgc2V0IGl0IHRvIG5ldyBvcHRpb25zLlxuICAgICAqIEBwYXJhbSBvcHRpb25zIHRoZSBvcHRpb24gc2V0dGluZ3Mgd2hpY2ggdXNlciBwYXJzZS5cbiAgICAgKiBAcmV0dXJucyB7Kn0gdGhlIGxhdGVzdCB2ZXJzaW9uIHdoaWNoIHdlIHVzZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgY2hlY2tPcHRpb25zKG9wdGlvbnM6IFNldHRpbmdzKTogdm9pZCB7XG4gICAgICAgIGlmKG9wdGlvbnMudmlkZW9UeXBlID09PSBcIjNkVmlkZW9cIil7XG4gICAgICAgICAgICB3YXJuaW5nKGB2aWRlb1R5cGU6ICR7U3RyaW5nKG9wdGlvbnMudmlkZW9UeXBlKX0gaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBWUjM2MDNEYCk7XG4gICAgICAgICAgICBvcHRpb25zLnZpZGVvVHlwZSA9IFwiVlIzNjAzRFwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYob3B0aW9ucy52aWRlb1R5cGUgJiYgdmlkZW9UeXBlcy5pbmRleE9mKG9wdGlvbnMudmlkZW9UeXBlKSA9PT0gLTEpe1xuICAgICAgICAgICAgd2FybmluZyhgdmlkZW9UeXBlOiAke1N0cmluZyhvcHRpb25zLnZpZGVvVHlwZSl9IGlzIG5vdCBzdXBwb3J0ZWQsIHNldCB2aWRlbyB0eXBlIHRvICR7U3RyaW5nKGRlZmF1bHRzLnZpZGVvVHlwZSl9LmApO1xuICAgICAgICAgICAgb3B0aW9ucy52aWRlb1R5cGUgPSBkZWZhdWx0cy52aWRlb1R5cGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0eXBlb2Ygb3B0aW9ucy5iYWNrVG9WZXJ0aWNhbENlbnRlciAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICB3YXJuaW5nKGBiYWNrVG9WZXJ0aWNhbENlbnRlciBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIGJhY2tUb0luaXRMYXQuYCk7XG4gICAgICAgICAgICBvcHRpb25zLmJhY2tUb0luaXRMYXQgPSBvcHRpb25zLmJhY2tUb1ZlcnRpY2FsQ2VudGVyO1xuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zLmJhY2tUb0hvcml6b25DZW50ZXIgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgd2FybmluZyhgYmFja1RvSG9yaXpvbkNlbnRlciBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIGJhY2tUb0luaXRMb24uYCk7XG4gICAgICAgICAgICBvcHRpb25zLmJhY2tUb0luaXRMb24gPSBvcHRpb25zLmJhY2tUb0hvcml6b25DZW50ZXI7XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIG9wdGlvbnMucmV0dXJuU3RlcExhdCAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICB3YXJuaW5nKGByZXR1cm5TdGVwTGF0IGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgcmV0dXJuTGF0U3BlZWQuYCk7XG4gICAgICAgICAgICBvcHRpb25zLnJldHVybkxhdFNwZWVkID0gb3B0aW9ucy5yZXR1cm5TdGVwTGF0O1xuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zLnJldHVyblN0ZXBMb24gIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgd2FybmluZyhgcmV0dXJuU3RlcExvbiBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIHJldHVybkxvblNwZWVkLmApO1xuICAgICAgICAgICAgb3B0aW9ucy5yZXR1cm5Mb25TcGVlZCA9IG9wdGlvbnMucmV0dXJuU3RlcExvbjtcbiAgICAgICAgfVxuICAgICAgICBpZih0eXBlb2Ygb3B0aW9ucy5oZWxwZXJDYW52YXMgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgd2FybmluZyhgaGVscGVyQ2FudmFzIGlzIGRlcHJlY2F0ZWQsIHlvdSBkb24ndCBoYXZlIHRvIHNldCBpdCB1cCBvbiBuZXcgdmVyc2lvbi5gKTtcbiAgICAgICAgfVxuICAgICAgICBpZih0eXBlb2Ygb3B0aW9ucy5jYWxsYmFjayAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICB3YXJuaW5nKGBjYWxsYmFjayBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIHJlYWR5LmApO1xuICAgICAgICAgICAgb3B0aW9ucy5yZWFkeSA9IG9wdGlvbnMuY2FsbGJhY2s7XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIG9wdGlvbnMuU3BoZXJlID09PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIG9wdGlvbnMuU3BoZXJlID0ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIG9wdGlvbnMucm90YXRlWCAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICB3YXJuaW5nKGByb3RhdGVYIGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgU3BoZXJlOnsgcm90YXRlWDogMCwgcm90YXRlWTogMCwgcm90YXRlWjogMH0uYCk7XG4gICAgICAgICAgICBpZihvcHRpb25zLlNwaGVyZSl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5TcGhlcmUucm90YXRlWCA9IG9wdGlvbnMucm90YXRlWDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZih0eXBlb2Ygb3B0aW9ucy5yb3RhdGVZICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHdhcm5pbmcoYHJvdGF0ZVkgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBTcGhlcmU6eyByb3RhdGVYOiAwLCByb3RhdGVZOiAwLCByb3RhdGVaOiAwfS5gKTtcbiAgICAgICAgICAgIGlmKG9wdGlvbnMuU3BoZXJlKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zLlNwaGVyZS5yb3RhdGVZID0gb3B0aW9ucy5yb3RhdGVZO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zLnJvdGF0ZVogIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgd2FybmluZyhgcm90YXRlWiBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIFNwaGVyZTp7IHJvdGF0ZVg6IDAsIHJvdGF0ZVk6IDAsIHJvdGF0ZVo6IDB9LmApO1xuICAgICAgICAgICAgaWYob3B0aW9ucy5TcGhlcmUpe1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuU3BoZXJlLnJvdGF0ZVkgPSBvcHRpb25zLnJvdGF0ZVo7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIG9wdGlvbnMuTm90aWNlID09PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIG9wdGlvbnMuTm90aWNlID0ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIG9wdGlvbnMuc2hvd05vdGljZSAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICB3YXJuaW5nKGBzaG93Tm90aWNlIGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgTm90aWNlOiB7IEVuYWJsZTogdHJ1ZSB9YCk7XG4gICAgICAgICAgICBpZihvcHRpb25zLk5vdGljZSl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5Ob3RpY2UuRW5hYmxlID0gb3B0aW9ucy5zaG93Tm90aWNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zLk5vdGljZU1lc3NhZ2UgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgd2FybmluZyhgTm90aWNlTWVzc2FnZSBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIE5vdGljZTogeyBNZXNzYWdlOiBcIlwiIH1gKTtcbiAgICAgICAgICAgIGlmKG9wdGlvbnMuTm90aWNlKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zLk5vdGljZS5NZXNzYWdlID0gb3B0aW9ucy5Ob3RpY2VNZXNzYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zLmF1dG9IaWRlTm90aWNlICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHdhcm5pbmcoYGF1dG9IaWRlTm90aWNlIGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgTm90aWNlOiB7IEhpZGVUaW1lOiAzMDAwIH1gKTtcbiAgICAgICAgICAgIGlmKG9wdGlvbnMuTm90aWNlKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zLk5vdGljZS5IaWRlVGltZSA9IG9wdGlvbnMuYXV0b0hpZGVOb3RpY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgY2hvb3NlVmlkZW9Db21wb25lbnQodmlkZW9UeXBlOiBWaWRlb1R5cGVzKTogQ2xhc3M8QmFzZUNhbnZhcz57XG4gICAgICAgIGxldCBWaWRlb0NsYXNzOiBDbGFzczxCYXNlQ2FudmFzPjtcbiAgICAgICAgc3dpdGNoKHZpZGVvVHlwZSl7XG4gICAgICAgICAgICBjYXNlIFwiZXF1aXJlY3Rhbmd1bGFyXCI6XG4gICAgICAgICAgICAgICAgVmlkZW9DbGFzcyA9IEVxdWlyZWN0YW5ndWxhcjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJmaXNoZXllXCI6XG4gICAgICAgICAgICAgICAgVmlkZW9DbGFzcyA9IEZpc2hleWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZHVhbF9maXNoZXllXCI6XG4gICAgICAgICAgICAgICAgVmlkZW9DbGFzcyA9IER1YWxGaXNoZXllO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlZSMzYwM0RcIjpcbiAgICAgICAgICAgICAgICBWaWRlb0NsYXNzID0gVlIzNjAzRDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJWUjE4MDNEXCI6XG4gICAgICAgICAgICAgICAgVmlkZW9DbGFzcyA9IFZSMTgwM0Q7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIFZpZGVvQ2xhc3MgPSBFcXVpcmVjdGFuZ3VsYXI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFZpZGVvQ2xhc3M7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXIsIG9wdGlvbnM6IGFueSA9IHt9KXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgUGFub3JhbWEuY2hlY2tPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICBpZihvcHRpb25zLnZpZGVvVHlwZSA9PT0gXCJWUjE4MDNEXCIpe1xuICAgICAgICAgICAgb3B0aW9ucyA9IG1lcmdlT3B0aW9ucyh7fSwgVlIxODBEZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IG1lcmdlT3B0aW9ucyh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9wbGF5ZXIgPSBwbGF5ZXI7XG5cbiAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ2xhc3MoXCJ2anMtcGFub3JhbWFcIik7XG5cbiAgICAgICAgaWYoIURldGVjdG9yLndlYmdsKXtcbiAgICAgICAgICAgIHRoaXMucG9wdXBOb3RpZmljYXRpb24od2ViR0xFcnJvck1lc3NhZ2UoKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgVmlkZW9DbGFzcyA9IFBhbm9yYW1hLmNob29zZVZpZGVvQ29tcG9uZW50KHRoaXMub3B0aW9ucy52aWRlb1R5cGUpO1xuICAgICAgICAvL3JlbmRlciAzNjAgdGh1bWJuYWlsXG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5QYW5vcmFtYVRodW1ibmFpbCAmJiBwbGF5ZXIuZ2V0VGh1bWJuYWlsVVJMKCkpe1xuICAgICAgICAgICAgbGV0IHRodW1ibmFpbFVSTCA9IHBsYXllci5nZXRUaHVtYm5haWxVUkwoKTtcbiAgICAgICAgICAgIGxldCBwb3N0ZXIgPSBuZXcgVGh1bWJuYWlsKHBsYXllciwge1xuICAgICAgICAgICAgICAgIHBvc3RlclNyYzogdGh1bWJuYWlsVVJMLFxuICAgICAgICAgICAgICAgIG9uQ29tcGxldGU6ICgpPT57XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMudGh1bWJuYWlsQ2FudmFzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGh1bWJuYWlsQ2FudmFzLl90ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGh1bWJuYWlsQ2FudmFzLnN0YXJ0QW5pbWF0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmFkZENvbXBvbmVudChcIlRodW1ibmFpbFwiLCBwb3N0ZXIpO1xuXG4gICAgICAgICAgICBwb3N0ZXIuZWwoKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICB0aGlzLl90aHVtYm5haWxDYW52YXMgPSBuZXcgVmlkZW9DbGFzcyhwbGF5ZXIsIHRoaXMub3B0aW9ucywgcG9zdGVyLmVsKCkpO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KFwiVGh1bWJuYWlsQ2FudmFzXCIsIHRoaXMudGh1bWJuYWlsQ2FudmFzKTtcblxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIub25lKFwicGxheVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy50aHVtYm5haWxDYW52YXMgJiYgdGhpcy50aHVtYm5haWxDYW52YXMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyLnJlbW92ZUNvbXBvbmVudChcIlRodW1ibmFpbFwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllci5yZW1vdmVDb21wb25lbnQoXCJUaHVtYm5haWxDYW52YXNcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGh1bWJuYWlsQ2FudmFzID0gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wbGF5ZXIucmVhZHkoKCk9PntcbiAgICAgICAgICAgIC8vZW5hYmxlIGlubGluZSBwbGF5IG9uIG1vYmlsZVxuICAgICAgICAgICAgaWYocnVuT25Nb2JpbGUpe1xuICAgICAgICAgICAgICAgIGxldCB2aWRlb0VsZW1lbnQgPSB0aGlzLnBsYXllci5nZXRWaWRlb0VsKCk7XG4gICAgICAgICAgICAgICAgaWYoaXNSZWFsSXBob25lKCkpe1xuICAgICAgICAgICAgICAgICAgICAvL2lvcyAxMCBzdXBwb3J0IHBsYXkgdmlkZW8gaW5saW5lXG4gICAgICAgICAgICAgICAgICAgIHZpZGVvRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJwbGF5c2lubGluZVwiLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgbWFrZVZpZGVvUGxheWFibGVJbmxpbmUodmlkZW9FbGVtZW50LCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ2xhc3MoXCJ2anMtcGFub3JhbWEtbW9iaWxlLWlubGluZS12aWRlb1wiKTtcbiAgICAgICAgICAgICAgICAvL2J5IGRlZmF1bHQgdmlkZW9qcyBoaWRlIGNvbnRyb2wgYmFyIG9uIG1vYmlsZSBkZXZpY2UuXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXIucmVtb3ZlQ2xhc3MoXCJ2anMtdXNpbmctbmF0aXZlLWNvbnRyb2xzXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9hZGQgdnIgaWNvbiB0byBwbGF5ZXJcbiAgICAgICAgICAgIGlmKHRoaXMub3B0aW9ucy5WUkVuYWJsZSl7XG4gICAgICAgICAgICAgICAgbGV0IGNvbnRyb2xiYXIgPSB0aGlzLnBsYXllci5jb250cm9sQmFyKCk7XG4gICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gY29udHJvbGJhci5jaGlsZE5vZGVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBsZXQgdnJCdXR0b24gPSBuZXcgVlJCdXR0b24ocGxheWVyLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHZyQnV0dG9uLmRpc2FibGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllci5hZGRDb21wb25lbnQoXCJWUkJ1dHRvblwiLCB2ckJ1dHRvbiwgdGhpcy5wbGF5ZXIuY29udHJvbEJhcigpLCBpbmRleCAtIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9hZGQgY2FudmFzIHRvIHBsYXllclxuICAgICAgICAgICAgdGhpcy5fdmlkZW9DYW52YXMgPSBuZXcgVmlkZW9DbGFzcyhwbGF5ZXIsIHRoaXMub3B0aW9ucywgcGxheWVyLmdldFZpZGVvRWwoKSk7XG4gICAgICAgICAgICB0aGlzLnZpZGVvQ2FudmFzLmhpZGUoKTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmFkZENvbXBvbmVudChcIlZpZGVvQ2FudmFzXCIsIHRoaXMudmlkZW9DYW52YXMpO1xuXG4gICAgICAgICAgICB0aGlzLmF0dGFjaEV2ZW50cygpO1xuXG4gICAgICAgICAgICBpZih0aGlzLm9wdGlvbnMuVlJFbmFibGUpe1xuICAgICAgICAgICAgICAgIGxldCB2ckJ1dHRvbiA9IHRoaXMucGxheWVyLmdldENvbXBvbmVudChcIlZSQnV0dG9uXCIpO1xuICAgICAgICAgICAgICAgIHZyQnV0dG9uICYmIHZyQnV0dG9uLmVuYWJsZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLm9wdGlvbnMucmVhZHkpe1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5yZWFkeS5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvL3JlZ2lzdGVyIHRyaWdnZXIgY2FsbGJhY2sgZnVuY3Rpb24sIHNvIGV2ZXJ5dGhpbmcgdHJpZ2dlciB0byBwbGF5ZXIgd2lsbCBhbHNvIHRyaWdnZXIgaW4gaGVyZVxuICAgICAgICB0aGlzLnBsYXllci5yZWdpc3RlclRyaWdnZXJDYWxsYmFjaygoZXZlbnROYW1lKT0+e1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKGV2ZW50TmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKXtcbiAgICAgICAgdGhpcy5kZXRhY2hFdmVudHMoKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuZ2V0VmlkZW9FbCgpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICAgICAgdGhpcy5wbGF5ZXIucmVtb3ZlQ29tcG9uZW50KFwiVmlkZW9DYW52YXNcIik7XG4gICAgfVxuXG4gICAgYXR0YWNoRXZlbnRzKCl7XG4gICAgICAgIC8vc2hvdyBub3RpY2UgbWVzc2FnZVxuICAgICAgICBpZih0aGlzLm9wdGlvbnMuTm90aWNlICYmIHRoaXMub3B0aW9ucy5Ob3RpY2UuRW5hYmxlKXtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLm9uZShcInBsYXlpbmdcIiwgKCk9PntcbiAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IHRoaXMub3B0aW9ucy5Ob3RpY2UgJiYgdGhpcy5vcHRpb25zLk5vdGljZS5NZXNzYWdlIHx8IFwiXCI7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1cE5vdGlmaWNhdGlvbihtZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9lbmFibGUgY2FudmFzIHJlbmRlcmluZyB3aGVuIHZpZGVvIGlzIHBsYXlpbmdcbiAgICAgICAgY29uc3QgaGFuZGxlUGxheSA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmdldFZpZGVvRWwoKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgICAgIHRoaXMudmlkZW9DYW52YXMuc3RhcnRBbmltYXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMudmlkZW9DYW52YXMuc2hvdygpO1xuXG4gICAgICAgICAgICAvL2luaXRpYWwgbWFya2Vyc1xuICAgICAgICAgICAgaWYodGhpcy5vcHRpb25zLk1hcmtlcnMgJiYgQXJyYXkuaXNBcnJheSh0aGlzLm9wdGlvbnMuTWFya2Vycykpe1xuICAgICAgICAgICAgICAgIGxldCBtYXJrZXJDb250YWluZXIgPSBuZXcgTWFya2VyQ29udGFpbmVyKHRoaXMucGxheWVyLCB7XG4gICAgICAgICAgICAgICAgICAgIGNhbnZhczogdGhpcy52aWRlb0NhbnZhcyxcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyczogdGhpcy5vcHRpb25zLk1hcmtlcnMsXG4gICAgICAgICAgICAgICAgICAgIFZSRW5hYmxlOiB0aGlzLm9wdGlvbnMuVlJFbmFibGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllci5hZGRDb21wb25lbnQoXCJtYXJrZXJDb250YWluZXJcIiwgbWFya2VyQ29udGFpbmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9pbml0aWFsIGFuaW1hdGlvbnNcbiAgICAgICAgICAgIGlmKHRoaXMub3B0aW9ucy5BbmltYXRpb24gJiYgQXJyYXkuaXNBcnJheSh0aGlzLm9wdGlvbnMuQW5pbWF0aW9uKSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbih0aGlzLnBsYXllciwge1xuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHRoaXMub3B0aW9ucy5BbmltYXRpb24sXG4gICAgICAgICAgICAgICAgICAgIGNhbnZhczogdGhpcy52aWRlb0NhbnZhc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL2RldGVjdCBibGFjayBzY3JlZW5cbiAgICAgICAgICAgIGlmKHdpbmRvdy5jb25zb2xlICYmIHdpbmRvdy5jb25zb2xlLmVycm9yKXtcbiAgICAgICAgICAgICAgICBsZXQgb3JpZ2luYWxFcnJvckZ1bmN0aW9uID0gd2luZG93LmNvbnNvbGUuZXJyb3I7XG4gICAgICAgICAgICAgICAgbGV0IG9yaWdpbmFsV2FybkZ1bmN0aW9uID0gd2luZG93LmNvbnNvbGUud2FybjtcbiAgICAgICAgICAgICAgICB3aW5kb3cuY29uc29sZS5lcnJvciA9IChlcnJvcik9PntcbiAgICAgICAgICAgICAgICAgICAgaWYoZXJyb3IubWVzc2FnZS5pbmRleE9mKFwiaW5zZWN1cmVcIikgIT09IC0xKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9wdXBOb3RpZmljYXRpb24oY3Jvc3NEb21haW5XYXJuaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHdpbmRvdy5jb25zb2xlLndhcm4gPSAod2FybikgPT57XG4gICAgICAgICAgICAgICAgICAgIGlmKHdhcm4uaW5kZXhPZihcImdsLmdldFNoYWRlckluZm9Mb2dcIikgIT09IC0xKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9wdXBOb3RpZmljYXRpb24oY3Jvc3NEb21haW5XYXJuaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY29uc29sZS53YXJuID0gb3JpZ2luYWxXYXJuRnVuY3Rpb247XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PntcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmNvbnNvbGUuZXJyb3IgPSBvcmlnaW5hbEVycm9yRnVuY3Rpb247XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5jb25zb2xlLndhcm4gPSBvcmlnaW5hbFdhcm5GdW5jdGlvbjtcbiAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpZighdGhpcy5wbGF5ZXIucGF1c2VkKCkpe1xuICAgICAgICAgICAgaGFuZGxlUGxheSgpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLm9uZShcInBsYXlcIiwgaGFuZGxlUGxheSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXBvcnQgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsYXllci5yZXBvcnRVc2VyQWN0aXZpdHkoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnZpZGVvQ2FudmFzLmFkZExpc3RlbmVycyh7XG4gICAgICAgICAgICBcInRvdWNoTW92ZVwiOiByZXBvcnQsXG4gICAgICAgICAgICBcInRhcFwiOiByZXBvcnRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGV0YWNoRXZlbnRzKCl7XG4gICAgICAgIGlmKHRoaXMudGh1bWJuYWlsQ2FudmFzKXtcbiAgICAgICAgICAgIHRoaXMudGh1bWJuYWlsQ2FudmFzLnN0b3BBbmltYXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLnZpZGVvQ2FudmFzKXtcbiAgICAgICAgICAgIHRoaXMudmlkZW9DYW52YXMuc3RvcEFuaW1hdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcG9wdXBOb3RpZmljYXRpb24obWVzc2FnZTogc3RyaW5nIHwgSFRNTEVsZW1lbnQpe1xuICAgICAgICBsZXQgbm90aWNlID0gdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KFwiTm90aWNlXCIsIG5ldyBOb3RpZmljYXRpb24odGhpcy5wbGF5ZXIsIHtcbiAgICAgICAgICAgIE1lc3NhZ2U6IG1lc3NhZ2VcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5Ob3RpY2UgJiYgdGhpcy5vcHRpb25zLk5vdGljZS5IaWRlVGltZSAmJiB0aGlzLm9wdGlvbnMuTm90aWNlLkhpZGVUaW1lID4gMCl7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBub3RpY2UucmVtb3ZlQ2xhc3MoXCJ2anMtdmlkZW8tbm90aWNlLXNob3dcIik7XG4gICAgICAgICAgICAgICAgbm90aWNlLmFkZENsYXNzKFwidmpzLXZpZGVvLW5vdGljZS1mYWRlT3V0XCIpO1xuICAgICAgICAgICAgICAgIG5vdGljZS5vbmUodHJhbnNpdGlvbkV2ZW50LCAoKT0+e1xuICAgICAgICAgICAgICAgICAgICBub3RpY2UuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBub3RpY2UucmVtb3ZlQ2xhc3MoXCJ2anMtdmlkZW8tbm90aWNlLWZhZGVPdXRcIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCB0aGlzLm9wdGlvbnMuTm90aWNlLkhpZGVUaW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZFRpbWVsaW5lKGFuaW1hdGlvbjogQW5pbWF0aW9uU2V0dGluZ3MpIDogdm9pZHtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uLmFkZFRpbWVsaW5lKGFuaW1hdGlvbik7XG4gICAgfVxuXG4gICAgZW5hYmxlQW5pbWF0aW9uKCl7XG4gICAgICAgIHRoaXMuX2FuaW1hdGlvbi5hdHRhY2hFdmVudHMoKTtcbiAgICB9XG5cbiAgICBkaXNhYmxlQW5pbWF0aW9uKCl7XG4gICAgICAgIHRoaXMuX2FuaW1hdGlvbi5kZXRhY2hFdmVudHMoKTtcbiAgICB9XG5cbiAgICBnZXRDb29yZGluYXRlcygpOiBDb29yZGluYXRlc3tcbiAgICAgICAgbGV0IGNhbnZhcyA9IHRoaXMudGh1bWJuYWlsQ2FudmFzIHx8IHRoaXMudmlkZW9DYW52YXM7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYXQ6IGNhbnZhcy5fbGF0LFxuICAgICAgICAgICAgbG9uOiBjYW52YXMuX2xvblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IHRodW1ibmFpbENhbnZhcygpOiBCYXNlQ2FudmFzIHwgbnVsbHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RodW1ibmFpbENhbnZhcztcbiAgICB9XG5cbiAgICBnZXQgdmlkZW9DYW52YXMoKTogQmFzZUNhbnZhc3tcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZpZGVvQ2FudmFzO1xuICAgIH1cblxuICAgIGdldCBwbGF5ZXIoKTogUGxheWVye1xuICAgICAgICByZXR1cm4gdGhpcy5fcGxheWVyO1xuICAgIH1cblxuICAgIGdldCBvcHRpb25zKCk6IFNldHRpbmdze1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9ucztcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IFZFUlNJT04oKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuICcxLjAuMCc7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQYW5vcmFtYTsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7U2V0dGluZ3N9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IEJhc2VQbGF5ZXIgZnJvbSAnLi90ZWNoL0Jhc2VQbGF5ZXInO1xuaW1wb3J0IExvYWRlciBmcm9tICcuL3RlY2gvTG9hZGVyJztcbmltcG9ydCBQYW5vcmFtYSBmcm9tICcuL1Bhbm9yYW1hJztcblxubGV0IHBsYXllckNsYXNzOiB0eXBlb2YgQmFzZVBsYXllciB8IG51bGwgPSBMb2FkZXIod2luZG93LlZJREVPX1BBTk9SQU1BKTtcblxuaWYocGxheWVyQ2xhc3Mpe1xuICAgIHBsYXllckNsYXNzLnJlZ2lzdGVyUGx1Z2luKCk7XG59XG5cbmNvbnN0IHBsdWdpbiA9IChwbGF5ZXJEb206IHN0cmluZyB8IEhUTUxWaWRlb0VsZW1lbnQsIG9wdGlvbnM6IFNldHRpbmdzLCBwbGF5ZXJUeXBlPzogc3RyaW5nKSA9PiB7XG4gICAgbGV0IHZpZGVvRW0gPSAodHlwZW9mIHBsYXllckRvbSA9PT0gXCJzdHJpbmdcIik/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocGxheWVyRG9tKTogcGxheWVyRG9tO1xuICAgIGlmKCFwbGF5ZXJDbGFzcyl7XG4gICAgICAgIHBsYXllckNsYXNzID0gTG9hZGVyKHBsYXllclR5cGUpO1xuICAgICAgICBpZighcGxheWVyQ2xhc3Mpe1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIGZpZ3VyZSBvdXQgd2hpY2ggbWVkaWEgcGxheWVyIGluIHVzZS5cIik7XG4gICAgICAgIH1cbiAgICAgICAgcGxheWVyQ2xhc3MucmVnaXN0ZXJQbHVnaW4oKTtcbiAgICB9XG4gICAgbGV0IHBsYXllciA9IG5ldyBwbGF5ZXJDbGFzcyh2aWRlb0VtLCBvcHRpb25zKTtcbiAgICBsZXQgcGFub3JhbWEgPSBuZXcgUGFub3JhbWEocGxheWVyLCBvcHRpb25zKTtcbiAgICByZXR1cm4gcGFub3JhbWE7XG59O1xuXG53aW5kb3cuUGFub3JhbWEgPSBwbHVnaW47XG5cbmV4cG9ydCBkZWZhdWx0IHBsdWdpbjsiLCIvLyBAIGZsb3dcblxuaW1wb3J0IHR5cGUgQ29tcG9uZW50IGZyb20gJy4uL0NvbXBvbmVudHMvQ29tcG9uZW50JztcbmltcG9ydCB0eXBlIHsgUGxheWVyLCBDb21wb25lbnREYXRhIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5jbGFzcyBCYXNlUGxheWVyIGltcGxlbWVudHMgUGxheWVyIHtcbiAgICBfY29tcG9uZW50czogQXJyYXk8Q29tcG9uZW50RGF0YT47XG4gICAgX3RyaWdnZXJDYWxsYmFjazogRnVuY3Rpb247XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXJJbnN0YW5jZSl7XG4gICAgICAgIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykgPT09IEJhc2VQbGF5ZXIucHJvdG90eXBlKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcignYWJzdHJhY3QgY2xhc3Mgc2hvdWxkIG5vdCBiZSBpbnN0YW50aWF0ZWQgZGlyZWN0bHk7IHdyaXRlIGEgc3ViY2xhc3MnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UgPSBwbGF5ZXJJbnN0YW5jZTtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50cyA9IFtdO1xuICAgIH1cblxuICAgIHN0YXRpYyByZWdpc3RlclBsdWdpbigpe1xuICAgICAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJUcmlnZ2VyQ2FsbGJhY2soY2FsbGJhY2s6IEZ1bmN0aW9uKTogdm9pZHtcbiAgICAgICAgdGhpcy5fdHJpZ2dlckNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgfVxuXG4gICAgZWwoKTogSFRNTEVsZW1lbnR7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBnZXRWaWRlb0VsKCk6IEhUTUxWaWRlb0VsZW1lbnR7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBnZXRUaHVtYm5haWxVUkwoKTogc3RyaW5ne1xuICAgICAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgb24oLi4uYXJnczogYW55KTogdm9pZHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIG9mZiguLi5hcmdzOiBhbnkpOiB2b2lke1xuICAgICAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgb25lKC4uLmFyZ3M6IGFueSk6IHZvaWR7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICB0cmlnZ2VyKG5hbWU6IHN0cmluZyk6IHZvaWR7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBhZGRDbGFzcyhuYW1lOiBzdHJpbmcpOiB2b2lke1xuICAgICAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgcmVtb3ZlQ2xhc3MobmFtZTogc3RyaW5nKTogdm9pZHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIGFkZENvbXBvbmVudChuYW1lOiBzdHJpbmcsIGNvbXBvbmVudDogQ29tcG9uZW50LCBsb2NhdGlvbjogP0hUTUxFbGVtZW50LCBpbmRleDogP251bWJlcik6IENvbXBvbmVudHtcbiAgICAgICAgaWYoIWxvY2F0aW9uKXtcbiAgICAgICAgICAgIGxvY2F0aW9uID0gdGhpcy5lbCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmKCFpbmRleCl7XG4gICAgICAgICAgICBpbmRleCA9IC0xO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodHlwZW9mIGNvbXBvbmVudC5lbCA9PT0gXCJmdW5jdGlvblwiICYmIGNvbXBvbmVudC5lbCgpKXtcbiAgICAgICAgICAgIGlmKGluZGV4ID09PSAtMSl7XG4gICAgICAgICAgICAgICAgbG9jYXRpb24uYXBwZW5kQ2hpbGQoY29tcG9uZW50LmVsKCkpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkcmVuID0gbG9jYXRpb24uY2hpbGROb2RlcztcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSBjaGlsZHJlbltpbmRleF07XG4gICAgICAgICAgICAgICAgbG9jYXRpb24uaW5zZXJ0QmVmb3JlKGNvbXBvbmVudC5lbCgpLCBjaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jb21wb25lbnRzLnB1c2goe1xuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIGNvbXBvbmVudCxcbiAgICAgICAgICAgIGxvY2F0aW9uXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgfVxuXG4gICAgcmVtb3ZlQ29tcG9uZW50KG5hbWU6IHN0cmluZyk6IHZvaWR7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudHMgPSB0aGlzLl9jb21wb25lbnRzLnJlZHVjZSgoYWNjLCBjb21wb25lbnQpPT57XG4gICAgICAgICAgICBpZihjb21wb25lbnQubmFtZSAhPT0gbmFtZSl7XG4gICAgICAgICAgICAgICAgYWNjLnB1c2goY29tcG9uZW50KVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmNvbXBvbmVudC5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICB9LCBbXSk7XG4gICAgfVxuXG4gICAgZ2V0Q29tcG9uZW50KG5hbWU6IHN0cmluZyk6IENvbXBvbmVudCB8IG51bGx7XG4gICAgICAgIGxldCBjb21wb25lbnREYXRhO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5fY29tcG9uZW50cy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBpZih0aGlzLl9jb21wb25lbnRzW2ldLm5hbWUgPT09IG5hbWUpe1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudERhdGEgPSB0aGlzLl9jb21wb25lbnRzW2ldO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21wb25lbnREYXRhPyBjb21wb25lbnREYXRhLmNvbXBvbmVudDogbnVsbDtcbiAgICB9XG5cbiAgICBwbGF5KCk6IHZvaWR7XG4gICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UucGxheSgpO1xuICAgIH1cblxuICAgIHBhdXNlKCk6IHZvaWR7XG4gICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UucGF1c2UoKTtcbiAgICB9XG5cbiAgICBwYXVzZWQoKTogYm9vbGVhbntcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIHJlYWR5U3RhdGUoKTogbnVtYmVye1xuICAgICAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgcmVwb3J0VXNlckFjdGl2aXR5KCk6IHZvaWR7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBjb250cm9sQmFyKCk6IEhUTUxFbGVtZW50e1xuICAgICAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgZW5hYmxlRnVsbHNjcmVlbigpOiB2b2lke1xuICAgICAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgcmVhZHkoZm46IEZ1bmN0aW9uKTogdm9pZHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIGdldCBjb21wb25lbnRzKCk6IEFycmF5PENvbXBvbmVudERhdGE+e1xuICAgICAgICByZXR1cm4gdGhpcy5fY29tcG9uZW50cztcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VQbGF5ZXI7IiwiLy8gQGZsb3dcblxuaW1wb3J0IEJhc2VQbGF5ZXIgZnJvbSAnLi9CYXNlUGxheWVyJztcbmltcG9ydCBWaWRlb2pzNCBmcm9tICcuL1ZpZGVvanM0JztcbmltcG9ydCBWaWRlb2pzNSBmcm9tICcuL1ZpZGVvanM1JztcbmltcG9ydCBNZWRpYUVsZW1lbnQgZnJvbSAnLi9NZWRpYUVsZW1lbnRQbGF5ZXInO1xuaW1wb3J0IHsgZ2V0VmlkZW9qc1ZlcnNpb24sIHdhcm5pbmcgfSBmcm9tICcuLi91dGlscyc7XG5cbmNvbnN0IFZJREVPUExBWUVSOiB7XG4gICAgW25hbWU6IHN0cmluZ106IHR5cGVvZiBCYXNlUGxheWVyXG59ID0ge1xuICAgICd2aWRlb2pzX3Y0JzogVmlkZW9qczQgLFxuICAgICd2aWRlb2pzX3Y1JyA6IFZpZGVvanM1LFxuICAgICdNZWRpYUVsZW1lbnRQbGF5ZXInOiBNZWRpYUVsZW1lbnRcbn07XG5cbmZ1bmN0aW9uIGNoZWNrVHlwZShwbGF5ZXJUeXBlPzogc3RyaW5nKTogdHlwZW9mIEJhc2VQbGF5ZXIgfCBudWxse1xuICAgIGlmKHR5cGVvZiBwbGF5ZXJUeXBlICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgaWYoVklERU9QTEFZRVJbcGxheWVyVHlwZV0pe1xuICAgICAgICAgICAgcmV0dXJuIFZJREVPUExBWUVSW3BsYXllclR5cGVdO1xuICAgICAgICB9XG4gICAgICAgIHdhcm5pbmcoYHBsYXllclR5cGU6ICR7cGxheWVyVHlwZX0gaXMgbm90IHN1cHBvcnRlZGApO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gY2hvb3NlVGVjaCgpOiB0eXBlb2YgQmFzZVBsYXllciB8IG51bGwge1xuICAgIGlmKHR5cGVvZiB3aW5kb3cudmlkZW9qcyAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgIGxldCB2ZXJzaW9uID0gd2luZG93LnZpZGVvanMuVkVSU0lPTjtcbiAgICAgICAgbGV0IG1ham9yID0gZ2V0VmlkZW9qc1ZlcnNpb24odmVyc2lvbik7XG4gICAgICAgIGlmKG1ham9yID09PSA0KXtcbiAgICAgICAgICAgIHJldHVybiBWSURFT1BMQVlFUlsndmlkZW9qc192NCddO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybiBWSURFT1BMQVlFUlsndmlkZW9qc192NSddO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYodHlwZW9mIHdpbmRvdy5NZWRpYUVsZW1lbnRQbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICByZXR1cm4gVklERU9QTEFZRVJbXCJNZWRpYUVsZW1lbnRQbGF5ZXJcIl07XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBMb2FkZXIocGxheWVyVHlwZT86IHN0cmluZyk6IHR5cGVvZiBCYXNlUGxheWVyIHwgbnVsbHtcbiAgICBsZXQgcHJlZmVyVHlwZSA9IGNoZWNrVHlwZShwbGF5ZXJUeXBlKTtcbiAgICBpZighcHJlZmVyVHlwZSl7XG4gICAgICAgIHByZWZlclR5cGUgPSBjaG9vc2VUZWNoKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByZWZlclR5cGU7XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgTG9hZGVyOyIsIi8vIEAgZmxvd1xuXG5pbXBvcnQgIFBhbm9yYW1hLCB7IGRlZmF1bHRzIH0gZnJvbSAnLi4vUGFub3JhbWEnO1xuaW1wb3J0IHsgbWVyZ2VPcHRpb25zLCBjdXN0b21FdmVudCwgaXNJb3MgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgQmFzZVBsYXllciBmcm9tICcuL0Jhc2VQbGF5ZXInO1xuXG5jbGFzcyBNZWRpYUVsZW1lbnQgZXh0ZW5kcyBCYXNlUGxheWVye1xuICAgIGNvbnN0cnVjdG9yKHBsYXllckluc3RhbmNlOiBhbnkpe1xuICAgICAgICBzdXBlcihwbGF5ZXJJbnN0YW5jZSk7XG4gICAgICAgIGlmKGlzSW9zKCkpe1xuICAgICAgICAgICAgdGhpcy5fZnVsbHNjcmVlbk9uSU9TKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgcmVnaXN0ZXJQbHVnaW4oKXtcbiAgICAgICAgbWVqcy5NZXBEZWZhdWx0cyA9IG1lcmdlT3B0aW9ucyhtZWpzLk1lcERlZmF1bHRzLCB7XG4gICAgICAgICAgICBQYW5vcmFtYToge1xuICAgICAgICAgICAgICAgIC4uLmRlZmF1bHRzXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBNZWRpYUVsZW1lbnRQbGF5ZXIucHJvdG90eXBlID0gbWVyZ2VPcHRpb25zKE1lZGlhRWxlbWVudFBsYXllci5wcm90b3R5cGUsIHtcbiAgICAgICAgICAgIGJ1aWxkUGFub3JhbWEocGxheWVyKXtcbiAgICAgICAgICAgICAgICBpZihwbGF5ZXIuZG9tTm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09IFwidmlkZW9cIil7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhbm9yYW1hIGRvbid0IHN1cHBvcnQgdGhpcmQgcGFydHkgcGxheWVyXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgaW5zdGFuY2UgPSBuZXcgTWVkaWFFbGVtZW50KHBsYXllcik7XG4gICAgICAgICAgICAgICAgcGxheWVyLnBhbm9yYW1hID0gbmV3IFBhbm9yYW1hKGluc3RhbmNlLCB0aGlzLm9wdGlvbnMuUGFub3JhbWEpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNsZWFyUGFub3JhbWEocGxheWVyKXtcbiAgICAgICAgICAgICAgICBpZihwbGF5ZXIucGFub3JhbWEpe1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIucGFub3JhbWEuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBlbCgpOiBIVE1MRWxlbWVudHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySW5zdGFuY2UuY29udGFpbmVyO1xuICAgIH1cblxuICAgIGdldFZpZGVvRWwoKTogSFRNTFZpZGVvRWxlbWVudHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySW5zdGFuY2UuZG9tTm9kZTtcbiAgICB9XG5cbiAgICBnZXRUaHVtYm5haWxVUkwoKTogc3RyaW5ne1xuICAgICAgIHJldHVybiB0aGlzLnBsYXllckluc3RhbmNlLm9wdGlvbnMucG9zdGVyIHx8IHRoaXMuZ2V0VmlkZW9FbCgpLmdldEF0dHJpYnV0ZShcInBvc3RlclwiKTtcbiAgICB9XG5cbiAgICBhZGRDbGFzcyhuYW1lOiBzdHJpbmcpOiB2b2lke1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKG5hbWUpO1xuICAgIH1cblxuICAgIHJlbW92ZUNsYXNzKG5hbWU6IHN0cmluZyk6IHZvaWR7XG4gICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UuY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUobmFtZSk7XG4gICAgfVxuXG4gICAgb24oLi4uYXJnczogYW55KTogdm9pZHtcbiAgICAgICAgbGV0IG5hbWUgPSBhcmdzWzBdO1xuICAgICAgICBsZXQgZm4gPSBhcmdzWzFdO1xuICAgICAgICB0aGlzLmdldFZpZGVvRWwoKS5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGZuKTtcbiAgICB9XG5cbiAgICBvZmYoLi4uYXJnczogYW55KTogdm9pZHtcbiAgICAgICAgbGV0IG5hbWUgPSBhcmdzWzBdO1xuICAgICAgICBsZXQgZm4gPSBhcmdzWzFdO1xuICAgICAgICB0aGlzLmdldFZpZGVvRWwoKS5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIGZuKTtcbiAgICB9XG5cbiAgICBvbmUoLi4uYXJnczogYW55KTogdm9pZHtcbiAgICAgICAgbGV0IG5hbWUgPSBhcmdzWzBdO1xuICAgICAgICBsZXQgZm4gPSBhcmdzWzFdO1xuICAgICAgICBsZXQgb25lVGltZUZ1bmN0aW9uO1xuICAgICAgICB0aGlzLm9uKG5hbWUsIG9uZVRpbWVGdW5jdGlvbiA9ICgpPT57XG4gICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgdGhpcy5vZmYobmFtZSwgb25lVGltZUZ1bmN0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdHJpZ2dlcihuYW1lOiBzdHJpbmcpOiB2b2lke1xuICAgICAgICBsZXQgZXZlbnQgPSBjdXN0b21FdmVudChuYW1lLCB0aGlzLmVsKCkpO1xuICAgICAgICB0aGlzLmdldFZpZGVvRWwoKS5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgaWYodGhpcy5fdHJpZ2dlckNhbGxiYWNrKXtcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJDYWxsYmFjayhuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBhdXNlZCgpOiBib29sZWFue1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRWaWRlb0VsKCkucGF1c2VkO1xuICAgIH1cblxuICAgIHJlYWR5U3RhdGUoKTogbnVtYmVye1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRWaWRlb0VsKCkucmVhZHlTdGF0ZTtcbiAgICB9XG5cbiAgICByZXBvcnRVc2VyQWN0aXZpdHkoKTogdm9pZHtcbiAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5zaG93Q29udHJvbHMoKTtcbiAgICB9XG5cbiAgICBjb250cm9sQmFyKCk6IEhUTUxFbGVtZW50e1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJJbnN0YW5jZS5jb250cm9scztcbiAgICB9XG5cbiAgICBlbmFibGVGdWxsc2NyZWVuKCk6IHZvaWR7XG4gICAgICAgIGlmKCF0aGlzLnBsYXllckluc3RhbmNlLmlzRnVsbFNjcmVlbil7XG4gICAgICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLmVudGVyRnVsbFNjcmVlbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX3Jlc2l6ZUNhbnZhc0ZuKGNhbnZhczogQ29tcG9uZW50KTogRnVuY3Rpb257XG4gICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5jb250YWluZXIuc3R5bGUud2lkdGggPSBcIjEwMCVcIjtcbiAgICAgICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UuY29udGFpbmVyLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xuICAgICAgICAgICAgY2FudmFzLmhhbmRsZVJlc2l6ZSgpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9mdWxsc2NyZWVuT25JT1MoKXtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICAvL2Rpc2FibGUgZnVsbHNjcmVlbiBvbiBpb3NcbiAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5lbnRlckZ1bGxTY3JlZW4gPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgbGV0IGNhbnZhczogQ29tcG9uZW50ID0gc2VsZi5nZXRDb21wb25lbnQoXCJWaWRlb0NhbnZhc1wiKTtcbiAgICAgICAgICAgIGxldCByZXNpemVGbiA9IHNlbGYuX3Jlc2l6ZUNhbnZhc0ZuKGNhbnZhcykuYmluZChzZWxmKTtcbiAgICAgICAgICAgIHNlbGYudHJpZ2dlcihcImJlZm9yZV9FbnRlckZ1bGxzY3JlZW5cIik7XG4gICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZChgJHt0aGlzLm9wdGlvbnMuY2xhc3NQcmVmaXh9ZnVsbHNjcmVlbmApO1xuICAgICAgICAgICAgc2VsZi5hZGRDbGFzcyhgJHt0aGlzLm9wdGlvbnMuY2xhc3NQcmVmaXh9Y29udGFpbmVyLWZ1bGxzY3JlZW5gKTtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBcIjEwMCVcIjtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiZGV2aWNlbW90aW9uXCIsIHJlc2l6ZUZuKTsgLy90cmlnZ2VyIHdoZW4gdXNlciByb3RhdGUgc2NyZWVuXG4gICAgICAgICAgICBzZWxmLnRyaWdnZXIoXCJhZnRlcl9FbnRlckZ1bGxzY3JlZW5cIik7XG4gICAgICAgICAgICB0aGlzLmlzRnVsbFNjcmVlbiA9IHRydWU7XG4gICAgICAgICAgICBjYW52YXMuaGFuZGxlUmVzaXplKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5leGl0RnVsbFNjcmVlbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsZXQgY2FudmFzOiBDb21wb25lbnQgPSBzZWxmLmdldENvbXBvbmVudChcIlZpZGVvQ2FudmFzXCIpO1xuICAgICAgICAgICAgbGV0IHJlc2l6ZUZuID0gc2VsZi5fcmVzaXplQ2FudmFzRm4oY2FudmFzKS5iaW5kKHNlbGYpO1xuICAgICAgICAgICAgc2VsZi50cmlnZ2VyKFwiYmVmb3JlX0V4aXRGdWxsc2NyZWVuXCIpO1xuICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoYCR7dGhpcy5vcHRpb25zLmNsYXNzUHJlZml4fWZ1bGxzY3JlZW5gKTtcbiAgICAgICAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoYCR7dGhpcy5vcHRpb25zLmNsYXNzUHJlZml4fWNvbnRhaW5lci1mdWxsc2NyZWVuYCk7XG4gICAgICAgICAgICB0aGlzLmlzRnVsbFNjcmVlbiA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXIuc3R5bGUud2lkdGggPSBcIlwiO1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gXCJcIjtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwiZGV2aWNlbW90aW9uXCIsIHJlc2l6ZUZuKTtcbiAgICAgICAgICAgIHNlbGYudHJpZ2dlcihcImFmdGVyX0V4aXRGdWxsc2NyZWVuXCIpO1xuICAgICAgICAgICAgY2FudmFzLmhhbmRsZVJlc2l6ZSgpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJlYWR5KGZuOiBGdW5jdGlvbik6IHZvaWR7XG4gICAgICAgIHRoaXMub25lKCdjYW5wbGF5JywgZm4pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVkaWFFbGVtZW50OyIsIi8vIEBmbG93XG5cbmltcG9ydCB2aWRlb2pzIGZyb20gJ3ZpZGVvLmpzJztcbmltcG9ydCBCYXNlVmlkZW9KcyBmcm9tICcuL3ZpZGVvanMnO1xuaW1wb3J0IFBhbm9yYW1hIGZyb20gJy4uL1Bhbm9yYW1hJztcblxuY2xhc3MgVmlkZW9qczQgZXh0ZW5kcyBCYXNlVmlkZW9Kc3tcbiAgICBzdGF0aWMgcmVnaXN0ZXJQbHVnaW4oKTogdm9pZHtcbiAgICAgICAgdmlkZW9qcy5wbHVnaW4oXCJwYW5vcmFtYVwiLCBmdW5jdGlvbihvcHRpb25zKXtcbiAgICAgICAgICAgIGxldCBpbnN0YW5jZSA9IG5ldyBWaWRlb2pzNCh0aGlzKTtcbiAgICAgICAgICAgIGxldCBwYW5vcmFtYSA9IG5ldyBQYW5vcmFtYShpbnN0YW5jZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm4gcGFub3JhbWE7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFZpZGVvRWwoKTogSFRNTFZpZGVvRWxlbWVudHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySW5zdGFuY2UudGVjaD9cbiAgICAgICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UudGVjaC5lbCgpOlxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5oLmVsKCk7XG4gICAgfVxuXG4gICAgX29yaWdpbmFsRnVsbHNjcmVlbkNsaWNrRm4oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySW5zdGFuY2UuY29udHJvbEJhci5mdWxsc2NyZWVuVG9nZ2xlLm9uQ2xpY2sgfHwgdGhpcy5wbGF5ZXJJbnN0YW5jZS5jb250cm9sQmFyLmZ1bGxzY3JlZW5Ub2dnbGUudTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFZpZGVvanM0OyIsIi8vIEBmbG93XG5cbmltcG9ydCB2aWRlb2pzIGZyb20gJ3ZpZGVvLmpzJztcbmltcG9ydCBCYXNlVmlkZW9KcyBmcm9tICcuL3ZpZGVvanMnO1xuaW1wb3J0IFBhbm9yYW1hIGZyb20gJy4uL1Bhbm9yYW1hJztcblxuY2xhc3MgVmlkZW9qczUgZXh0ZW5kcyBCYXNlVmlkZW9Kc3tcbiAgICBzdGF0aWMgcmVnaXN0ZXJQbHVnaW4oKTogdm9pZHtcbiAgICAgICAgdmlkZW9qcy5wbHVnaW4oXCJwYW5vcmFtYVwiLCBmdW5jdGlvbihvcHRpb25zKXtcbiAgICAgICAgICAgIGxldCBpbnN0YW5jZSA9IG5ldyBWaWRlb2pzNSh0aGlzKTtcbiAgICAgICAgICAgIGxldCBwYW5vcmFtYSA9IG5ldyBQYW5vcmFtYShpbnN0YW5jZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm4gcGFub3JhbWE7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFZpZGVvRWwoKTogSFRNTFZpZGVvRWxlbWVudHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySW5zdGFuY2UudGVjaCh7IElXaWxsTm90VXNlVGhpc0luUGx1Z2luczogdHJ1ZSB9KS5lbCgpO1xuICAgIH1cblxuICAgIF9vcmlnaW5hbEZ1bGxzY3JlZW5DbGlja0ZuKCl7XG4gICAgICAgIHJldHVybiB0aGlzLnBsYXllckluc3RhbmNlLmNvbnRyb2xCYXIuZnVsbHNjcmVlblRvZ2dsZS5oYW5kbGVDbGljaztcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFZpZGVvanM1OyIsIi8vIEBmbG93XG5cbmltcG9ydCBCYXNlUGxheWVyIGZyb20gJy4vQmFzZVBsYXllcic7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gJy4uL0NvbXBvbmVudHMvQ29tcG9uZW50JztcbmltcG9ydCB7IGlzSW9zIH0gZnJvbSAnLi4vdXRpbHMnO1xuXG5jbGFzcyBWaWRlb2pzIGV4dGVuZHMgQmFzZVBsYXllcntcbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXJJbnN0YW5jZTogYW55KXtcbiAgICAgICAgc3VwZXIocGxheWVySW5zdGFuY2UpO1xuICAgICAgICB0aGlzLm9uKFwicmVhZHlcIiwgKCk9PntcbiAgICAgICAgICAgIC8vaW9zIGRldmljZSBkb24ndCBzdXBwb3J0IGZ1bGxzY3JlZW4sIHdlIGhhdmUgdG8gbW9ua2V5IHBhdGNoIHRoZSBvcmlnaW5hbCBmdWxsc2NyZWVuIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYoaXNJb3MoKSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fZnVsbHNjcmVlbk9uSU9TKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL3Jlc2l6ZSB2aWRlbyBpZiBmdWxsc2NyZWVuIGNoYW5nZSwgdGhpcyBpcyB1c2VkIGZvciBpb3MgZGV2aWNlXG4gICAgICAgIHRoaXMub24oXCJmdWxsc2NyZWVuY2hhbmdlXCIsICAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgY2FudmFzOiBDb21wb25lbnQgPSB0aGlzLmdldENvbXBvbmVudChcIlZpZGVvQ2FudmFzXCIpO1xuICAgICAgICAgICAgY2FudmFzLmhhbmRsZVJlc2l6ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBlbCgpOiBIVE1MRWxlbWVudHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySW5zdGFuY2UuZWwoKTtcbiAgICB9XG5cbiAgICBnZXRWaWRlb0VsKCk6IEhUTUxWaWRlb0VsZW1lbnR7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBnZXRUaHVtYm5haWxVUkwoKTogc3RyaW5ne1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJJbnN0YW5jZS5wb3N0ZXIoKTtcbiAgICB9XG5cbiAgICBvbiguLi5hcmdzOiBhbnkpOiB2b2lke1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLm9uKC4uLmFyZ3MpO1xuICAgIH1cblxuICAgIG9mZiguLi5hcmdzOiBhbnkpOiB2b2lke1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLm9mZiguLi5hcmdzKTtcbiAgICB9XG5cbiAgICBvbmUoLi4uYXJnczogYW55KTogdm9pZHtcbiAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5vbmUoLi4uYXJncyk7XG4gICAgfVxuXG4gICAgYWRkQ2xhc3MobmFtZTogc3RyaW5nKTogdm9pZHtcbiAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5hZGRDbGFzcyhuYW1lKTtcbiAgICB9XG5cbiAgICByZW1vdmVDbGFzcyhuYW1lOiBzdHJpbmcpOiB2b2lke1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLnJlbW92ZUNsYXNzKG5hbWUpO1xuICAgIH1cblxuICAgIF9yZXNpemVDYW52YXNGbihjYW52YXM6IENvbXBvbmVudCk6IEZ1bmN0aW9ue1xuICAgICAgICByZXR1cm4gKCk9PntcbiAgICAgICAgICAgIGNhbnZhcy5oYW5kbGVSZXNpemUoKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwYXVzZWQoKTogYm9vbGVhbntcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySW5zdGFuY2UucGF1c2VkKCk7XG4gICAgfVxuXG4gICAgcmVhZHlTdGF0ZSgpOiBudW1iZXJ7XG4gICAgICAgIHJldHVybiB0aGlzLnBsYXllckluc3RhbmNlLnJlYWR5U3RhdGUoKTtcbiAgICB9XG5cbiAgICB0cmlnZ2VyKG5hbWU6IHN0cmluZyk6IHZvaWR7XG4gICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UudHJpZ2dlcihuYW1lKTtcbiAgICAgICAgaWYodGhpcy5fdHJpZ2dlckNhbGxiYWNrKXtcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJDYWxsYmFjayhuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlcG9ydFVzZXJBY3Rpdml0eSgpOiB2b2lke1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLnJlcG9ydFVzZXJBY3Rpdml0eSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBvcmlnaW5hbCBmdWxsc2NyZWVuIGZ1bmN0aW9uXG4gICAgICovXG4gICAgX29yaWdpbmFsRnVsbHNjcmVlbkNsaWNrRm4oKXtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIF9mdWxsc2NyZWVuT25JT1MoKTogdm9pZHtcbiAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5jb250cm9sQmFyLmZ1bGxzY3JlZW5Ub2dnbGUub2ZmKFwidGFwXCIsIHRoaXMuX29yaWdpbmFsRnVsbHNjcmVlbkNsaWNrRm4oKSk7XG4gICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UuY29udHJvbEJhci5mdWxsc2NyZWVuVG9nZ2xlLm9uKFwidGFwXCIsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBjYW52YXM6IENvbXBvbmVudCA9IHRoaXMuZ2V0Q29tcG9uZW50KFwiVmlkZW9DYW52YXNcIik7XG4gICAgICAgICAgICBsZXQgcmVzaXplRm4gPSB0aGlzLl9yZXNpemVDYW52YXNGbihjYW52YXMpO1xuICAgICAgICAgICAgaWYoIXRoaXMucGxheWVySW5zdGFuY2UuaXNGdWxsc2NyZWVuKCkpe1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcihcImJlZm9yZV9FbnRlckZ1bGxzY3JlZW5cIik7XG4gICAgICAgICAgICAgICAgLy9zZXQgdG8gZnVsbHNjcmVlblxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UuaXNGdWxsc2NyZWVuKHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UuZW50ZXJGdWxsV2luZG93KCk7XG4gICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJkZXZpY2Vtb3Rpb25cIiwgcmVzaXplRm4pOyAvL3RyaWdnZXIgd2hlbiB1c2VyIHJvdGF0ZSBzY3JlZW5cbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoXCJhZnRlcl9FbnRlckZ1bGxzY3JlZW5cIik7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoXCJiZWZvcmVfRXhpdEZ1bGxzY3JlZW5cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5pc0Z1bGxzY3JlZW4oZmFsc2UpO1xuICAgICAgICAgICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UuZXhpdEZ1bGxXaW5kb3coKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImRldmljZW1vdGlvblwiLCByZXNpemVGbik7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyKFwiYWZ0ZXJfRXhpdEZ1bGxzY3JlZW5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoXCJmdWxsc2NyZWVuY2hhbmdlXCIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb250cm9sQmFyKCk6IEhUTUxFbGVtZW50e1xuICAgICAgICBsZXQgY29udHJvbEJhciA9IHRoaXMucGxheWVySW5zdGFuY2UuY29udHJvbEJhcjtcbiAgICAgICAgcmV0dXJuIGNvbnRyb2xCYXIuZWwoKTtcbiAgICB9XG5cbiAgICBlbmFibGVGdWxsc2NyZWVuKCk6IHZvaWR7XG4gICAgICAgIGlmKCF0aGlzLnBsYXllckluc3RhbmNlLmlzRnVsbHNjcmVlbigpKVxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5jb250cm9sQmFyLmZ1bGxzY3JlZW5Ub2dnbGUudHJpZ2dlcihcInRhcFwiKTtcbiAgICB9XG5cbiAgICByZWFkeShmbjogRnVuY3Rpb24pOiB2b2lke1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLnJlYWR5KGZuKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFZpZGVvanM7IiwiLy8gQGZsb3dcblxuZnVuY3Rpb24gd2hpY2hUcmFuc2l0aW9uRXZlbnQoKXtcbiAgICBsZXQgZWw6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbGV0IHRyYW5zaXRpb25zID0ge1xuICAgICAgICAndHJhbnNpdGlvbic6J3RyYW5zaXRpb25lbmQnLFxuICAgICAgICAnT1RyYW5zaXRpb24nOidvVHJhbnNpdGlvbkVuZCcsXG4gICAgICAgICdNb3pUcmFuc2l0aW9uJzondHJhbnNpdGlvbmVuZCcsXG4gICAgICAgICdXZWJraXRUcmFuc2l0aW9uJzond2Via2l0VHJhbnNpdGlvbkVuZCdcbiAgICB9O1xuXG4gICAgZm9yKGxldCB0IGluIHRyYW5zaXRpb25zKXtcbiAgICAgICAgY29uc3Qgbm9kZVN0eWxlOiBPYmplY3QgPSBlbC5zdHlsZTtcbiAgICAgICAgaWYoIG5vZGVTdHlsZVt0XSAhPT0gdW5kZWZpbmVkICl7XG4gICAgICAgICAgICByZXR1cm4gdHJhbnNpdGlvbnNbdF07XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCB0cmFuc2l0aW9uRXZlbnQgPSB3aGljaFRyYW5zaXRpb25FdmVudCgpO1xuXG4vL2Fkb3B0IGZyb20gaHR0cDovL2dpem1hLmNvbS9lYXNpbmcvXG5mdW5jdGlvbiBsaW5lYXIodDogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlciwgZDogbnVtYmVyKTogbnVtYmVye1xuICAgIHJldHVybiBjKnQvZCArIGI7XG59XG5cbmZ1bmN0aW9uIGVhc2VJblF1YWQodDogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlciwgZDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICB0IC89IGQ7XG4gICAgcmV0dXJuIGMqdCp0ICsgYjtcbn1cblxuZnVuY3Rpb24gZWFzZU91dFF1YWQodDogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlciwgZDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICB0IC89IGQ7XG4gICAgcmV0dXJuIC1jICogdCoodC0yKSArIGI7XG59XG5cbmZ1bmN0aW9uIGVhc2VJbk91dFF1YWQodDogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlciwgZDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICB0IC89IGQgLyAyO1xuICAgIGlmICh0IDwgMSkgcmV0dXJuIGMgLyAyICogdCAqIHQgKyBiO1xuICAgIHQtLTtcbiAgICByZXR1cm4gLWMgLyAyICogKHQgKiAodCAtIDIpIC0gMSkgKyBiO1xufVxuXG5leHBvcnQgY29uc3QgZWFzZUZ1bmN0aW9ucyA9IHtcbiAgICBsaW5lYXI6IGxpbmVhcixcbiAgICBlYXNlSW5RdWFkOiBlYXNlSW5RdWFkLFxuICAgIGVhc2VPdXRRdWFkOiBlYXNlT3V0UXVhZCxcbiAgICBlYXNlSW5PdXRRdWFkOiBlYXNlSW5PdXRRdWFkXG59OyIsIi8vIEBmbG93XG5cbmNsYXNzIF9EZXRlY3RvciB7XG4gICAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICB3ZWJnbDogYm9vbGVhbjtcbiAgICB3b3JrZXJzOiBXb3JrZXI7XG4gICAgZmlsZWFwaTogRmlsZTtcblxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIHRoaXMuY2FudmFzID0gISF3aW5kb3cuQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgICAgICB0aGlzLndlYmdsID0gZmFsc2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgICAgICAgICB0aGlzLndlYmdsID0gISEgKCB3aW5kb3cuV2ViR0xSZW5kZXJpbmdDb250ZXh0ICYmICggdGhpcy5jYW52YXMuZ2V0Q29udGV4dCggJ3dlYmdsJyApIHx8IHRoaXMuY2FudmFzLmdldENvbnRleHQoICdleHBlcmltZW50YWwtd2ViZ2wnICkgKSApXG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53b3JrZXJzID0gISF3aW5kb3cuV29ya2VyO1xuICAgICAgICB0aGlzLmZpbGVhcGkgPSB3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkJsb2I7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgRGV0ZWN0b3IgPSAgbmV3IF9EZXRlY3RvcigpO1xuXG5leHBvcnQgZnVuY3Rpb24gd2ViR0xFcnJvck1lc3NhZ2UoKTogSFRNTEVsZW1lbnQge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcbiAgICBlbGVtZW50LmlkID0gJ3dlYmdsLWVycm9yLW1lc3NhZ2UnO1xuXG4gICAgaWYgKCAhIERldGVjdG9yLndlYmdsICkge1xuICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IHdpbmRvdy5XZWJHTFJlbmRlcmluZ0NvbnRleHQgPyBbXG4gICAgICAgICAgICAnWW91ciBncmFwaGljcyBjYXJkIGRvZXMgbm90IHNlZW0gdG8gc3VwcG9ydCA8YSBocmVmPVwiaHR0cDovL2tocm9ub3Mub3JnL3dlYmdsL3dpa2kvR2V0dGluZ19hX1dlYkdMX0ltcGxlbWVudGF0aW9uXCIgc3R5bGU9XCJjb2xvcjojMDAwXCI+V2ViR0w8L2E+LjxiciAvPicsXG4gICAgICAgICAgICAnRmluZCBvdXQgaG93IHRvIGdldCBpdCA8YSBocmVmPVwiaHR0cDovL2dldC53ZWJnbC5vcmcvXCIgc3R5bGU9XCJjb2xvcjojMDAwXCI+aGVyZTwvYT4uJ1xuICAgICAgICBdLmpvaW4oICdcXG4nICkgOiBbXG4gICAgICAgICAgICAnWW91ciBicm93c2VyIGRvZXMgbm90IHNlZW0gdG8gc3VwcG9ydCA8YSBocmVmPVwiaHR0cDovL2tocm9ub3Mub3JnL3dlYmdsL3dpa2kvR2V0dGluZ19hX1dlYkdMX0ltcGxlbWVudGF0aW9uXCIgc3R5bGU9XCJjb2xvcjojMDAwXCI+V2ViR0w8L2E+Ljxici8+JyxcbiAgICAgICAgICAgICdGaW5kIG91dCBob3cgdG8gZ2V0IGl0IDxhIGhyZWY9XCJodHRwOi8vZ2V0LndlYmdsLm9yZy9cIiBzdHlsZT1cImNvbG9yOiMwMDBcIj5oZXJlPC9hPi4nXG4gICAgICAgIF0uam9pbiggJ1xcbicgKTtcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG59XG5cbi8qKlxuICogY2hlY2sgaWUgb3IgZWRnZSBicm93c2VyIHZlcnNpb24sIHJldHVybiAtMSBpZiB1c2Ugb3RoZXIgYnJvd3NlcnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGllT3JFZGdlVmVyc2lvbigpe1xuICAgIGxldCBydiA9IC0xO1xuICAgIGlmIChuYXZpZ2F0b3IuYXBwTmFtZSA9PT0gJ01pY3Jvc29mdCBJbnRlcm5ldCBFeHBsb3JlcicpIHtcblxuICAgICAgICBsZXQgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgICAgcmUgPSBuZXcgUmVnRXhwKFwiTVNJRSAoWzAtOV17MSx9W1xcXFwuMC05XXswLH0pXCIpO1xuXG4gICAgICAgIGxldCByZXN1bHQgPSByZS5leGVjKHVhKTtcbiAgICAgICAgaWYgKHJlc3VsdCAhPT0gbnVsbCkge1xuXG4gICAgICAgICAgICBydiA9IHBhcnNlRmxvYXQocmVzdWx0WzFdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChuYXZpZ2F0b3IuYXBwTmFtZSA9PT0gXCJOZXRzY2FwZVwiKSB7XG4gICAgICAgIC8vLyBpbiBJRSAxMSB0aGUgbmF2aWdhdG9yLmFwcFZlcnNpb24gc2F5cyAndHJpZGVudCdcbiAgICAgICAgLy8vIGluIEVkZ2UgdGhlIG5hdmlnYXRvci5hcHBWZXJzaW9uIGRvZXMgbm90IHNheSB0cmlkZW50XG4gICAgICAgIGlmIChuYXZpZ2F0b3IuYXBwVmVyc2lvbi5pbmRleE9mKCdUcmlkZW50JykgIT09IC0xKSBydiA9IDExO1xuICAgICAgICBlbHNle1xuICAgICAgICAgICAgbGV0IHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgICAgICAgICAgIGxldCByZSA9IG5ldyBSZWdFeHAoXCJFZGdlXFwvKFswLTldezEsfVtcXFxcLjAtOV17MCx9KVwiKTtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSByZS5leGVjKHVhKTtcbiAgICAgICAgICAgIGlmIChyZS5leGVjKHVhKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJ2ID0gcGFyc2VGbG9hdChyZXN1bHRbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJ2O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNMaXZlU3RyZWFtT25TYWZhcmkodmlkZW9FbGVtZW50OiBIVE1MVmlkZW9FbGVtZW50KXtcbiAgICAvL2xpdmUgc3RyZWFtIG9uIHNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgdmlkZW8gdGV4dHVyZVxuICAgIGxldCB2aWRlb1NvdXJjZXMgPSBbXS5zbGljZS5jYWxsKHZpZGVvRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwic291cmNlXCIpKTtcbiAgICBsZXQgcmVzdWx0ID0gZmFsc2U7XG4gICAgaWYodmlkZW9FbGVtZW50LnNyYyAmJiB2aWRlb0VsZW1lbnQuc3JjLmluZGV4T2YoJy5tM3U4JykgPiAtMSl7XG4gICAgICAgIHZpZGVvU291cmNlcy5wdXNoKHtcbiAgICAgICAgICAgIHNyYzogdmlkZW9FbGVtZW50LnNyYyxcbiAgICAgICAgICAgIHR5cGU6IFwiYXBwbGljYXRpb24veC1tcGVnVVJMXCJcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB2aWRlb1NvdXJjZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICBsZXQgY3VycmVudFZpZGVvU291cmNlID0gdmlkZW9Tb3VyY2VzW2ldO1xuICAgICAgICBpZigoY3VycmVudFZpZGVvU291cmNlLnR5cGUgPT09IFwiYXBwbGljYXRpb24veC1tcGVnVVJMXCIgfHwgY3VycmVudFZpZGVvU291cmNlLnR5cGUgPT09IFwiYXBwbGljYXRpb24vdm5kLmFwcGxlLm1wZWd1cmxcIikgJiYgLyhTYWZhcml8QXBwbGVXZWJLaXQpLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICYmIC9BcHBsZSBDb21wdXRlci8udGVzdChuYXZpZ2F0b3IudmVuZG9yKSl7XG4gICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1cHBvcnRWaWRlb1RleHR1cmUodmlkZW9FbGVtZW50OiBIVE1MVmlkZW9FbGVtZW50KXtcbiAgICAvL2llIDExIGFuZCBlZGdlIDEyIGFuZCBsaXZlIHN0cmVhbSBvbiBzYWZhcmkgZG9lc24ndCBzdXBwb3J0IHZpZGVvIHRleHR1cmUgZGlyZWN0bHkuXG4gICAgbGV0IHZlcnNpb24gPSBpZU9yRWRnZVZlcnNpb24oKTtcbiAgICByZXR1cm4gKHZlcnNpb24gPT09IC0xIHx8IHZlcnNpb24gPj0gMTMpICYmICFpc0xpdmVTdHJlYW1PblNhZmFyaSh2aWRlb0VsZW1lbnQpO1xufVxuXG4iLCIvLyBAZmxvd1xuXG5leHBvcnQgZnVuY3Rpb24gY3VzdG9tRXZlbnQoZXZlbnROYW1lOiBzdHJpbmcsIHRhcmdldDogSFRNTEVsZW1lbnQpOiBDdXN0b21FdmVudHtcbiAgICBsZXQgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoZXZlbnROYW1lLCB7XG4gICAgICAgICdkZXRhaWwnOiB7XG4gICAgICAgICAgICB0YXJnZXRcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBldmVudDtcbn0iLCIvLyBAZmxvd1xuXG5leHBvcnQgKiBmcm9tICcuL21lcmdlLW9wdGlvbnMnO1xuZXhwb3J0ICogZnJvbSAnLi93YXJuaW5nJztcbmV4cG9ydCAqIGZyb20gJy4vZGV0ZWN0b3InO1xuZXhwb3J0ICogZnJvbSAnLi92ZXJzaW9uJztcbmV4cG9ydCAqIGZyb20gJy4vbW9iaWxlJztcbmV4cG9ydCAqIGZyb20gJy4vdnInO1xuZXhwb3J0ICogZnJvbSAnLi9hbmltYXRpb24nO1xuZXhwb3J0ICogZnJvbSAnLi9ldmVudCc7IiwiLy8gQGZsb3dcblxuLyoqXG4gKiBjb2RlIGFkb3B0IGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3ZpZGVvanMvdmlkZW8uanMvYmxvYi9tYXN0ZXIvc3JjL2pzL3V0aWxzL21lcmdlLW9wdGlvbnMuanNcbiAqL1xuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBhIHZhbHVlIGlzIGFuIG9iamVjdCBvZiBhbnkga2luZCAtIGluY2x1ZGluZyBET00gbm9kZXMsXG4gKiBhcnJheXMsIHJlZ3VsYXIgZXhwcmVzc2lvbnMsIGV0Yy4gTm90IGZ1bmN0aW9ucywgdGhvdWdoLlxuICpcbiAqIFRoaXMgYXZvaWRzIHRoZSBnb3RjaGEgd2hlcmUgdXNpbmcgYHR5cGVvZmAgb24gYSBgbnVsbGAgdmFsdWVcbiAqIHJlc3VsdHMgaW4gYCdvYmplY3QnYC5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3QodmFsdWU6IGFueSkge1xuICAgIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIGFuIG9iamVjdCBhcHBlYXJzIHRvIGJlIGEgXCJwbGFpblwiIG9iamVjdCAtIHRoYXQgaXMsIGFcbiAqIGRpcmVjdCBpbnN0YW5jZSBvZiBgT2JqZWN0YC5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQbGFpbih2YWx1ZTogYW55KSB7XG4gICAgcmV0dXJuIGlzT2JqZWN0KHZhbHVlKSAmJlxuICAgICAgICBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBPYmplY3RdJyAmJlxuICAgICAgICB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0O1xufVxuXG5leHBvcnQgY29uc3QgbWVyZ2VPcHRpb25zID0gKC4uLnNvdXJjZXM6IGFueSk6IGFueSA9PiB7XG4gICAgbGV0IHJlc3VsdHMgPSB7fTtcbiAgICBzb3VyY2VzLmZvckVhY2goKHZhbHVlcyk9PntcbiAgICAgICAgaWYgKCF2YWx1ZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlcykuZm9yRWFjaCgoa2V5KT0+e1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gdmFsdWVzW2tleV07XG4gICAgICAgICAgICBpZiAoIWlzUGxhaW4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0c1trZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWlzUGxhaW4ocmVzdWx0c1trZXldKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdHNba2V5XSA9IHt9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHRzW2tleV0gPSBtZXJnZU9wdGlvbnMocmVzdWx0c1trZXldLCB2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdHM7XG59OyIsIi8vIEBmbG93XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb3VjaGVzRGlzdGFuY2UodG91Y2hlczogYW55KTogbnVtYmVye1xuICAgIHJldHVybiBNYXRoLnNxcnQoXG4gICAgICAgICh0b3VjaGVzWzBdLmNsaWVudFgtdG91Y2hlc1sxXS5jbGllbnRYKSAqICh0b3VjaGVzWzBdLmNsaWVudFgtdG91Y2hlc1sxXS5jbGllbnRYKSArXG4gICAgICAgICh0b3VjaGVzWzBdLmNsaWVudFktdG91Y2hlc1sxXS5jbGllbnRZKSAqICh0b3VjaGVzWzBdLmNsaWVudFktdG91Y2hlc1sxXS5jbGllbnRZKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb2JpbGVBbmRUYWJsZXRjaGVjaygpIHtcbiAgICBsZXQgY2hlY2s6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAoZnVuY3Rpb24oYSl7XG4gICAgICAgICAgICBpZigvKGFuZHJvaWR8YmJcXGQrfG1lZWdvKS4rbW9iaWxlfGF2YW50Z298YmFkYVxcL3xibGFja2JlcnJ5fGJsYXplcnxjb21wYWx8ZWxhaW5lfGZlbm5lY3xoaXB0b3B8aWVtb2JpbGV8aXAoaG9uZXxvZCl8aXJpc3xraW5kbGV8bGdlIHxtYWVtb3xtaWRwfG1tcHxtb2JpbGUuK2ZpcmVmb3h8bmV0ZnJvbnR8b3BlcmEgbShvYnxpbilpfHBhbG0oIG9zKT98cGhvbmV8cChpeGl8cmUpXFwvfHBsdWNrZXJ8cG9ja2V0fHBzcHxzZXJpZXMoNHw2KTB8c3ltYmlhbnx0cmVvfHVwXFwuKGJyb3dzZXJ8bGluayl8dm9kYWZvbmV8d2FwfHdpbmRvd3MgY2V8eGRhfHhpaW5vfGFuZHJvaWR8aXBhZHxwbGF5Ym9va3xzaWxrL2kudGVzdChhKXx8LzEyMDd8NjMxMHw2NTkwfDNnc298NHRocHw1MFsxLTZdaXw3NzBzfDgwMnN8YSB3YXxhYmFjfGFjKGVyfG9vfHNcXC0pfGFpKGtvfHJuKXxhbChhdnxjYXxjbyl8YW1vaXxhbihleHxueXx5dyl8YXB0dXxhcihjaHxnbyl8YXModGV8dXMpfGF0dHd8YXUoZGl8XFwtbXxyIHxzICl8YXZhbnxiZShja3xsbHxucSl8YmkobGJ8cmQpfGJsKGFjfGF6KXxicihlfHYpd3xidW1ifGJ3XFwtKG58dSl8YzU1XFwvfGNhcGl8Y2N3YXxjZG1cXC18Y2VsbHxjaHRtfGNsZGN8Y21kXFwtfGNvKG1wfG5kKXxjcmF3fGRhKGl0fGxsfG5nKXxkYnRlfGRjXFwtc3xkZXZpfGRpY2F8ZG1vYnxkbyhjfHApb3xkcygxMnxcXC1kKXxlbCg0OXxhaSl8ZW0obDJ8dWwpfGVyKGljfGswKXxlc2w4fGV6KFs0LTddMHxvc3x3YXx6ZSl8ZmV0Y3xmbHkoXFwtfF8pfGcxIHV8ZzU2MHxnZW5lfGdmXFwtNXxnXFwtbW98Z28oXFwud3xvZCl8Z3IoYWR8dW4pfGhhaWV8aGNpdHxoZFxcLShtfHB8dCl8aGVpXFwtfGhpKHB0fHRhKXxocCggaXxpcCl8aHNcXC1jfGh0KGMoXFwtfCB8X3xhfGd8cHxzfHQpfHRwKXxodShhd3x0Yyl8aVxcLSgyMHxnb3xtYSl8aTIzMHxpYWMoIHxcXC18XFwvKXxpYnJvfGlkZWF8aWcwMXxpa29tfGltMWt8aW5ub3xpcGFxfGlyaXN8amEodHx2KWF8amJyb3xqZW11fGppZ3N8a2RkaXxrZWppfGtndCggfFxcLyl8a2xvbnxrcHQgfGt3Y1xcLXxreW8oY3xrKXxsZShub3x4aSl8bGcoIGd8XFwvKGt8bHx1KXw1MHw1NHxcXC1bYS13XSl8bGlid3xseW54fG0xXFwtd3xtM2dhfG01MFxcL3xtYSh0ZXx1aXx4byl8bWMoMDF8MjF8Y2EpfG1cXC1jcnxtZShyY3xyaSl8bWkobzh8b2F8dHMpfG1tZWZ8bW8oMDF8MDJ8Yml8ZGV8ZG98dChcXC18IHxvfHYpfHp6KXxtdCg1MHxwMXx2ICl8bXdicHxteXdhfG4xMFswLTJdfG4yMFsyLTNdfG4zMCgwfDIpfG41MCgwfDJ8NSl8bjcoMCgwfDEpfDEwKXxuZSgoY3xtKVxcLXxvbnx0Znx3Znx3Z3x3dCl8bm9rKDZ8aSl8bnpwaHxvMmltfG9wKHRpfHd2KXxvcmFufG93ZzF8cDgwMHxwYW4oYXxkfHQpfHBkeGd8cGcoMTN8XFwtKFsxLThdfGMpKXxwaGlsfHBpcmV8cGwoYXl8dWMpfHBuXFwtMnxwbyhja3xydHxzZSl8cHJveHxwc2lvfHB0XFwtZ3xxYVxcLWF8cWMoMDd8MTJ8MjF8MzJ8NjB8XFwtWzItN118aVxcLSl8cXRla3xyMzgwfHI2MDB8cmFrc3xyaW05fHJvKHZlfHpvKXxzNTVcXC98c2EoZ2V8bWF8bW18bXN8bnl8dmEpfHNjKDAxfGhcXC18b298cFxcLSl8c2RrXFwvfHNlKGMoXFwtfDB8MSl8NDd8bWN8bmR8cmkpfHNnaFxcLXxzaGFyfHNpZShcXC18bSl8c2tcXC0wfHNsKDQ1fGlkKXxzbShhbHxhcnxiM3xpdHx0NSl8c28oZnR8bnkpfHNwKDAxfGhcXC18dlxcLXx2ICl8c3koMDF8bWIpfHQyKDE4fDUwKXx0NigwMHwxMHwxOCl8dGEoZ3R8bGspfHRjbFxcLXx0ZGdcXC18dGVsKGl8bSl8dGltXFwtfHRcXC1tb3x0byhwbHxzaCl8dHMoNzB8bVxcLXxtM3xtNSl8dHhcXC05fHVwKFxcLmJ8ZzF8c2kpfHV0c3R8djQwMHx2NzUwfHZlcml8dmkocmd8dGUpfHZrKDQwfDVbMC0zXXxcXC12KXx2bTQwfHZvZGF8dnVsY3x2eCg1Mnw1M3w2MHw2MXw3MHw4MHw4MXw4M3w4NXw5OCl8dzNjKFxcLXwgKXx3ZWJjfHdoaXR8d2koZyB8bmN8bncpfHdtbGJ8d29udXx4NzAwfHlhc1xcLXx5b3VyfHpldG98enRlXFwtL2kudGVzdChhLnN1YnN0cigwLDQpKSlcbiAgICAgICAgICAgICAgICBjaGVjayA9IHRydWVcbiAgICAgICAgfSkobmF2aWdhdG9yLnVzZXJBZ2VudHx8bmF2aWdhdG9yLnZlbmRvcnx8d2luZG93Lm9wZXJhKTtcbiAgICByZXR1cm4gY2hlY2s7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0lvcygpIHtcbiAgICByZXR1cm4gL2lQaG9uZXxpUGFkfGlQb2QvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSZWFsSXBob25lKCkge1xuICAgIHJldHVybiAvaVBob25lfGlQb2QvaS50ZXN0KG5hdmlnYXRvci5wbGF0Zm9ybSk7XG59IiwiLy8gQGZsb3dcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFZpZGVvanNWZXJzaW9uKHN0cjogc3RyaW5nKXtcbiAgICBsZXQgaW5kZXggPSBzdHIuaW5kZXhPZihcIi5cIik7XG4gICAgaWYoaW5kZXggPT09IC0xKSByZXR1cm4gMDtcbiAgICBsZXQgbWFqb3IgPSBwYXJzZUludChzdHIuc3Vic3RyaW5nKDAsIGluZGV4KSk7XG4gICAgcmV0dXJuIG1ham9yO1xufSIsIi8vIEBmbG93XG5cbmltcG9ydCBUSFJFRSBmcm9tIFwidGhyZWVcIjtcblxuLy9hZG9wdCBjb2RlIGZyb206IGh0dHBzOi8vZ2l0aHViLmNvbS9Nb3pWUi92ci13ZWItZXhhbXBsZXMvYmxvYi9tYXN0ZXIvdGhyZWVqcy12ci1ib2lsZXJwbGF0ZS9qcy9WUkVmZmVjdC5qc1xuZnVuY3Rpb24gZm92VG9ORENTY2FsZU9mZnNldCggZm92OiBhbnkgKSB7XG4gICAgbGV0IHB4c2NhbGUgPSAyLjAgLyAoZm92LmxlZnRUYW4gKyBmb3YucmlnaHRUYW4pO1xuICAgIGxldCBweG9mZnNldCA9IChmb3YubGVmdFRhbiAtIGZvdi5yaWdodFRhbikgKiBweHNjYWxlICogMC41O1xuICAgIGxldCBweXNjYWxlID0gMi4wIC8gKGZvdi51cFRhbiArIGZvdi5kb3duVGFuKTtcbiAgICBsZXQgcHlvZmZzZXQgPSAoZm92LnVwVGFuIC0gZm92LmRvd25UYW4pICogcHlzY2FsZSAqIDAuNTtcbiAgICByZXR1cm4geyBzY2FsZTogWyBweHNjYWxlLCBweXNjYWxlIF0sIG9mZnNldDogWyBweG9mZnNldCwgcHlvZmZzZXQgXSB9O1xufVxuXG5mdW5jdGlvbiBmb3ZQb3J0VG9Qcm9qZWN0aW9uKCBmb3Y6IGFueSwgcmlnaHRIYW5kZWQ/OiBib29sZWFuLCB6TmVhcj8gOiBudW1iZXIsIHpGYXI/IDogbnVtYmVyICkge1xuXG4gICAgcmlnaHRIYW5kZWQgPSByaWdodEhhbmRlZCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHJpZ2h0SGFuZGVkO1xuICAgIHpOZWFyID0gek5lYXIgPT09IHVuZGVmaW5lZCA/IDAuMDEgOiB6TmVhcjtcbiAgICB6RmFyID0gekZhciA9PT0gdW5kZWZpbmVkID8gMTAwMDAuMCA6IHpGYXI7XG5cbiAgICBsZXQgaGFuZGVkbmVzc1NjYWxlID0gcmlnaHRIYW5kZWQgPyAtMS4wIDogMS4wO1xuXG4gICAgLy8gc3RhcnQgd2l0aCBhbiBpZGVudGl0eSBtYXRyaXhcbiAgICBsZXQgbW9iaiA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG4gICAgbGV0IG0gPSBtb2JqLmVsZW1lbnRzO1xuXG4gICAgLy8gYW5kIHdpdGggc2NhbGUvb2Zmc2V0IGluZm8gZm9yIG5vcm1hbGl6ZWQgZGV2aWNlIGNvb3Jkc1xuICAgIGxldCBzY2FsZUFuZE9mZnNldCA9IGZvdlRvTkRDU2NhbGVPZmZzZXQoZm92KTtcblxuICAgIC8vIFggcmVzdWx0LCBtYXAgY2xpcCBlZGdlcyB0byBbLXcsK3ddXG4gICAgbVswICogNCArIDBdID0gc2NhbGVBbmRPZmZzZXQuc2NhbGVbMF07XG4gICAgbVswICogNCArIDFdID0gMC4wO1xuICAgIG1bMCAqIDQgKyAyXSA9IHNjYWxlQW5kT2Zmc2V0Lm9mZnNldFswXSAqIGhhbmRlZG5lc3NTY2FsZTtcbiAgICBtWzAgKiA0ICsgM10gPSAwLjA7XG5cbiAgICAvLyBZIHJlc3VsdCwgbWFwIGNsaXAgZWRnZXMgdG8gWy13LCt3XVxuICAgIC8vIFkgb2Zmc2V0IGlzIG5lZ2F0ZWQgYmVjYXVzZSB0aGlzIHByb2ogbWF0cml4IHRyYW5zZm9ybXMgZnJvbSB3b3JsZCBjb29yZHMgd2l0aCBZPXVwLFxuICAgIC8vIGJ1dCB0aGUgTkRDIHNjYWxpbmcgaGFzIFk9ZG93biAodGhhbmtzIEQzRD8pXG4gICAgbVsxICogNCArIDBdID0gMC4wO1xuICAgIG1bMSAqIDQgKyAxXSA9IHNjYWxlQW5kT2Zmc2V0LnNjYWxlWzFdO1xuICAgIG1bMSAqIDQgKyAyXSA9IC1zY2FsZUFuZE9mZnNldC5vZmZzZXRbMV0gKiBoYW5kZWRuZXNzU2NhbGU7XG4gICAgbVsxICogNCArIDNdID0gMC4wO1xuXG4gICAgLy8gWiByZXN1bHQgKHVwIHRvIHRoZSBhcHApXG4gICAgbVsyICogNCArIDBdID0gMC4wO1xuICAgIG1bMiAqIDQgKyAxXSA9IDAuMDtcbiAgICBtWzIgKiA0ICsgMl0gPSB6RmFyIC8gKHpOZWFyIC0gekZhcikgKiAtaGFuZGVkbmVzc1NjYWxlO1xuICAgIG1bMiAqIDQgKyAzXSA9ICh6RmFyICogek5lYXIpIC8gKHpOZWFyIC0gekZhcik7XG5cbiAgICAvLyBXIHJlc3VsdCAoPSBaIGluKVxuICAgIG1bMyAqIDQgKyAwXSA9IDAuMDtcbiAgICBtWzMgKiA0ICsgMV0gPSAwLjA7XG4gICAgbVszICogNCArIDJdID0gaGFuZGVkbmVzc1NjYWxlO1xuICAgIG1bMyAqIDQgKyAzXSA9IDAuMDtcblxuICAgIG1vYmoudHJhbnNwb3NlKCk7XG5cbiAgICByZXR1cm4gbW9iajtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvdlRvUHJvamVjdGlvbiggIGZvdjogYW55LCByaWdodEhhbmRlZD86IGJvb2xlYW4sIHpOZWFyPyA6IG51bWJlciwgekZhcj8gOiBudW1iZXIgKSB7XG4gICAgbGV0IERFRzJSQUQgPSBNYXRoLlBJIC8gMTgwLjA7XG5cbiAgICBsZXQgZm92UG9ydCA9IHtcbiAgICAgICAgdXBUYW46IE1hdGgudGFuKCBmb3YudXBEZWdyZWVzICogREVHMlJBRCApLFxuICAgICAgICBkb3duVGFuOiBNYXRoLnRhbiggZm92LmRvd25EZWdyZWVzICogREVHMlJBRCApLFxuICAgICAgICBsZWZ0VGFuOiBNYXRoLnRhbiggZm92LmxlZnREZWdyZWVzICogREVHMlJBRCApLFxuICAgICAgICByaWdodFRhbjogTWF0aC50YW4oIGZvdi5yaWdodERlZ3JlZXMgKiBERUcyUkFEIClcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZvdlBvcnRUb1Byb2plY3Rpb24oIGZvdlBvcnQsIHJpZ2h0SGFuZGVkLCB6TmVhciwgekZhciApO1xufSIsIi8vIEBmbG93XG5cbi8qKlxuICogUHJpbnRzIGEgd2FybmluZyBpbiB0aGUgY29uc29sZSBpZiBpdCBleGlzdHMuXG4gKiBEaXNhYmxlIG9uIHByb2R1Y3Rpb24gZW52aXJvbm1lbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgVGhlIHdhcm5pbmcgbWVzc2FnZS5cbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgY29uc3Qgd2FybmluZyA9IChtZXNzYWdlOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAvL3dhcm5pbmcgbWVzc2FnZSBvbmx5IGhhcHBlbiBvbiBkZXZlbG9wIGVudmlyb25tZW50XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBjb25zb2xlLmVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgY3Jvc3NEb21haW5XYXJuaW5nID0gKCk6IEhUTUxFbGVtZW50ID0+IHtcbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG4gICAgZWxlbWVudC5jbGFzc05hbWUgPSBcInZqcy1jcm9zcy1kb21haW4tdW5zdXBwb3J0XCI7XG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSBcIlNvcnJ5LCBZb3VyIGJyb3dzZXIgZG9uJ3Qgc3VwcG9ydCBjcm9zcyBkb21haW4uXCI7XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG59OyJdfQ==
