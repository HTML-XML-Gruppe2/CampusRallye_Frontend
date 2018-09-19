$(document).ready(function () {
    $("#navButton").click(function(){
        $("#sideMenu").css("display", "block");
    });
    $("#closeMenu").click(function(){
        $("#sideMenu").css("display", "none");
    });
});

//Knapheidesi Skript eingefügt https://www.softwarecountry.com/articles/interactive-map-of-shopping-mall-on-html5-canvas/

var element = $('#canvas'), // we are going to use it for event handling
canvas = new fabric.Canvas(element.get(0), {
        selection: false, // disable groups selection
        scale: 1, // set default scale
	renderOnAddRemove: false, // disable auto-render in order to improve performance for complex maps with a lot of markers
	moveCursor: 'default', // reset mouse cursor - they are not used by us
	hoverCursor: 'default'
});

var baseWidth = 0,
	baseHeight= 0,
	baseScale = 1,
        width = 0, // current width
	height = 0, // current height
	transX = 0, // current shift for x axis
	transY = 0, // current shift for y axis
	scale = 1; // current global scale
	
var applyTransform = function () {
	var maxTransX,
		maxTransY,
		minTransX,
		minTransY,
		group;

	// Calculation of thresholds for x axis transition
	if (baseWidth * scale <= width) {
		// Map fits into the canvas
		maxTransX = (width - baseWidth * scale) / (2 * scale);
		minTransX = (width - baseWidth * scale) / (2 * scale);
	} else {
		// Map doesn’t fit
		maxTransX = 0;
		minTransX = (width - baseWidth * scale) / scale;
	}

	// Limit transition with calculated thresholds
	if (transX > maxTransX) {
		transX = maxTransX;
	} else if (transX < minTransX) {
		transX = minTransX;
	}

	// The same for y axis
	if (baseHeight * scale <= height) {
		maxTransY = (height - baseHeight * scale) / (2 * scale);
		minTransY = (height - baseHeight * scale) / (2 * scale);
	} else {
		maxTransY = 0;
		minTransY = (height - baseHeight * scale) / scale;
	}
	if (transY > maxTransY) {
		transY = maxTransY;
	} else if (transY < minTransY) {
		transY = minTransY;
	}

	// Group all objects and apply transform on the group
	group = new fabric.Group(canvas.getObjects());
	group.scaleX = scale / canvas.scale;
	group.scaleY = scale / canvas.scale;
	group.left = group.getWidth() / 2 + transX * scale;
	group.top = group.getHeight() / 2 + transY * scale;
	group.destroy();

	// Refresh global scale for the canvas
	canvas.scale = scale;

	// At last render canvas with changed objects
	canvas.renderAll();
};

var setScale = function (scaleToSet, anchorX, anchorY) {
	var zoomMax = 5, // max 5x zoom
		zoomMin =  1, // min 1x zoom - real image size
		zoomStep; // required scale change
		
	// Limit scale if needed
	if (scaleToSet > zoomMax * baseScale) {
		scaleToSet = zoomMax * baseScale;
	} else if (scaleToSet < zoomMin * baseScale) {
		scaleToSet = zoomMin * baseScale;
	}

	// The center of zoom - a point which should stay on its place.
	// It is defined by anchorX and anchorY arguments.
	// In fact, it is just a position of mouse pointer during scaling.
	if (typeof anchorX != 'undefined' && typeof anchorY != 'undefined') {
		zoomStep = scaleToSet / scale;
		// Calculate required shift for all objects
		// so the center of zoom stays motionless.
		transX -= (zoomStep - 1) / scaleToSet * anchorX;
		transY -= (zoomStep - 1) / scaleToSet * anchorY;
	}

	scale = scaleToSet;	
	applyTransform();
};

var bindContainerEvents= function () {
	var mouseDown = false,
		oldPageX,
		oldPageY,
		container = $(canvas.wrapperEl);

	container.mousemove(function (e) {
		// Shifting
		if (mouseDown) {
			// Calculate transition with respect to the current scale
			transX -= (oldPageX - e.pageX) / scale;
			transY -= (oldPageY - e.pageY) / scale;

			applyTransform();

			oldPageX = e.pageX;
			oldPageY = e.pageY;
			return false;
		}
	}).mousedown(function (e) {
		// Store position
		mouseDown = true;
		oldPageX = e.pageX;
		oldPageY = e.pageY;
		return false;
	});

	$('body').mouseup(function () {
		mouseDown = false;
	});

	// Zoom with mouse wheel
	container.mousewheel(function (event, delta, deltaX, deltaY) {
		var offset = element.offset(), // position of the canvas on the page
			centerX = event.pageX - offset.left, // x coordinate of the center of zoom 
			centerY = event.pageY - offset.top, // y coordinate of the center of zoom 
			zoomStep = Math.pow(1.3, deltaY); // user-friendly zoom step

		setScale(scale * zoomStep, centerX, centerY);
		
		// Prevent scroll of the page
		event.preventDefault();
	});
};

var bindContainerTouchEvents = function () {
	var touchStartScale,
		touchStartDistance, 
		container = $(canvas.wrapperEl),
		touchX,
		touchY,
		centerTouchX,
		centerTouchY,
		lastTouchesLength,
		handleTouchEvent = function (e) {
			var touches = e.originalEvent.touches,
				offset,
				currentScale,
				transXOld,
				transYOld;

			if (e.type == 'touchstart') {
				lastTouchesLength = 0;
			}
			if (touches.length == 1) {
				// Simple shift
				if (lastTouchesLength == 1) {
					transXOld = transX;
					transYOld = transY;
					transX -= (touchX - touches[0].pageX) / scale;
					transY -= (touchY - touches[0].pageY) / scale;
					applyTransform();
					if (transXOld != transX || transYOld != transY) {
						e.preventDefault();
					}
				}
				touchX = touches[0].pageX;
				touchY = touches[0].pageY;
			} else if (touches.length == 2) {
				// Zoom
				if (lastTouchesLength == 2) {
					currentScale = Math.sqrt(
					  Math.pow(touches[0].pageX - touches[1].pageX, 2) +
					  Math.pow(touches[0].pageY - touches[1].pageY, 2)
					) / touchStartDistance;
					setScale(touchStartScale * currentScale, centerTouchX, centerTouchY);
					e.preventDefault();
				} else {
					// This is zoom start, store current state
					offset = element.offset();
					if (touches[0].pageX > touches[1].pageX) {
						centerTouchX = touches[1].pageX + (touches[0].pageX - touches[1].pageX) / 2;
					} else {
						centerTouchX = touches[0].pageX + (touches[1].pageX - touches[0].pageX) / 2;
					}
					if (touches[0].pageY > touches[1].pageY) {
						centerTouchY = touches[1].pageY + (touches[0].pageY - touches[1].pageY) / 2;
					} else {
						centerTouchY = touches[0].pageY + (touches[1].pageY - touches[0].pageY) / 2;
					}
					centerTouchX -= offset.left;
					centerTouchY -= offset.top;
					touchStartScale = scale;
					touchStartDistance = Math.sqrt(
					  Math.pow(touches[0].pageX - touches[1].pageX, 2) +
					  Math.pow(touches[0].pageY - touches[1].pageY, 2)
					);
				}
			}

			lastTouchesLength = touches.length;
		};

	container.bind('touchstart', handleTouchEvent);
	container.bind('touchmove', handleTouchEvent);
};

var map = document.getElementById("Karte");
fabric.util.loadImage('map.jpg', function(img) {
	var map = new fabric.Image(img),
		curBaseScale;
	if (('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch)) {
		bindContainerTouchEvents();
	} else {
		bindContainerEvents();
	}
	
	// Set base and current dimensions
	baseWidth = map.width;
	baseHeight = map.height;
	width = element.width();
	height = element.height();
	
	// Disable all edit and object selecting functionality on the canvas
	map.set({
		hasRotatingPoint: false,
		hasBorders: false,
		hasControls: false,
		lockScalingY: true,
		lockScalingX: true,
		selectable: false,
		left: map.width / 2,
		top: map.height / 2,
		originX: 'center',
		originY: 'center'
	});
	canvas.add(map);
	
	// Zoom after load in order to show whole map from the beginning
	curBaseScale  = baseScale;
	if (width / height > baseWidth / baseHeight) {
		baseScale = height / baseHeight;
	} else {
		baseScale = width / baseWidth;
	}
	scale *= baseScale / curBaseScale;
	transX *= baseScale / curBaseScale;
	transY *= baseScale / curBaseScale;
	
	canvas.setWidth(width);
	canvas.setHeight(height);
	
	applyTransform();
	
	// Show markers on the map, will be added later
	createMarkers();
});

var markerColor = '#2567d5';

var addMarker = function(point, text) {
	// Marker itself
	var marker = new fabric.Path('m 11,-19.124715 c -8.2234742,0 -14.8981027,-6.676138 -14.8981027,-14.9016 0,-5.633585 3.35732837,-10.582599 6.3104192,-14.933175 C 4.5507896,-52.109948 9.1631953,-59.34619 11,-61.92345 c 1.733396,2.518329 6.760904,9.975806 8.874266,13.22971 3.050966,4.697513 6.023837,8.647788 6.023837,14.667425 0,8.225462 -6.674629,14.9016 -14.898103,14.9016 z m 0,-9.996913 c 2.703016,0 4.903568,-2.201022 4.903568,-4.904687 0,-2.703664 -2.200552,-4.873493 -4.903568,-4.873493 -2.7030165,0 -4.903568,2.169829 -4.903568,4.873493 0,2.703665 2.2005515,4.904687 4.903568,4.904687 z"', 
	{
		width: 40, 
		height: 80,
		scaleX: scale, 
		scaleY: scale, 
		left: point.x,
		top: point.y,
		originX: 'center',
		originY: 'center',
		fill: markerColor,
		stroke: '#2e69b6',
		text: text // save text inside the marker for import/export 
	}),
	// Text
	textObject = new fabric.Text(text, { 
		fontSize: 30, 
		originX: 'center', 
		fill: markerColor,
		originY: 'center' 
	}),
	// Wrapper
	background = new fabric.Rect({
		width: 100, 
		height: 40, 
		originX: 'center', 
		originY: 'center',
		fill: 'white',
		stroke: 'black'
	}),
	// Group for correct positioning
	textGroup = new fabric.Group([background, textObject], { 
		scaleX: scale,
		scaleY: scale,
		left: point.x + 20 * scale, // respect current scale
		top: point.y - 30 * scale // respect current scale
	});

	canvas.add(marker);
	canvas.add(textGroup);
};


addMarker({x: 550, y: 390}, '#0:500');
	addMarker({x: 460, y: 120}, '#1:300');
	canvas.renderAll();
	
	