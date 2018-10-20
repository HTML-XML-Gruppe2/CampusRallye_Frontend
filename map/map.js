var requestURL = "https://localhost:8080/api/objects/basic";
var Markers = new Array();
// Map sprite
var mapSprite = new Image();
var canvas = document.getElementById('Canvas');
var context = canvas.getContext("2d");
mapSprite.src = "map.jpg";
//Größenverhältnis
var sizeheight = mapSprite.naturalHeight / mapSprite.naturalWidth;
// VIsuelle AUsfüllung des Elternobjektes
canvas.style.width = '100%';
canvas.style.height = canvas.style.width * sizeheight;
// ...setzen der internen Größe
canvas.width = canvas.offsetWidth;
canvas.height = canvas.width * sizeheight;

function openNav() {
    document.getElementById("mySidebar").style.width = "100%";
    document.getElementById("main").style.marginLeft = "100%";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}

//START:Knapheidesi Karte Responsive an Fenster anpassen
window.addEventListener("resize", handleResize);
function handleResize() {
	// Make it visually fill the positioned parent
	canvas.style.width = '100%';
	canvas.style.height = canvas.style.width * sizeheight;
	// ...then set the internal size to match
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.width * sizeheight;
	main();
}
window.addEventListener('orientationchange', handleResize);
//END:Knapheidesi Karte Responsive an Fenster anpassen

//START:Knapheidesi Zum testen einen Marker zu bearbeitet hinzugefügt
// var visitedObjectsCampusRallye = localStorage.getItem("visitedObjectsCampusRallye");
// var visitedObjectsCampusRallyeJSON = JSON.parse(visitedObjectsCampusRallye);
// visitedObjectsCampusRallyeJSON['visitedObjects'].push({ "_id": '5bc7a042113fa655f46a8a3e', "name": 'Test' });
// visitedObjectsCampusRallye = JSON.stringify(visitedObjectsCampusRallyeJSON);
// localStorage.setItem("visitedObjectsCampusRallye", visitedObjectsCampusRallye);
//END:Knapheidesi Zum testen einen Marker zu bearbeitet hinzugefügt

// function hammerIt(elm) {
//     hammertime = new Hammer(elm, {});
//     hammertime.get('pinch').set({
//         enable: true
//     });
//     var posX = 0,
//         posY = 0,
//         scale = 1,
//         last_scale = 1,
//         last_posX = 0,
//         last_posY = 0,
//         max_pos_x = 0,
//         max_pos_y = 0,
//         transform = "",
//         el = elm;

//     hammertime.on('doubletap pan pinch panend pinchend', function (ev) {
//         if (ev.type == "doubletap") {
//             transform =
//                 "translate3d(0, 0, 0) " +
//                 "scale3d(2, 2, 1) ";
//             scale = 2;
//             last_scale = 2;
//             try {
//                 if (window.getComputedStyle(el, null).getPropertyValue('-webkit-transform').toString() != "matrix(1, 0, 0, 1, 0, 0)") {
//                     transform =
//                         "translate3d(0, 0, 0) " +
//                         "scale3d(1, 1, 1) ";
//                     scale = 1;
//                     last_scale = 1;
//                 }
//             } catch (err) { }
//             el.style.webkitTransform = transform;
//             transform = "";
//         }

//         //pan    
//         if (scale != 1) {
//             posX = last_posX + ev.deltaX;
//             posY = last_posY + ev.deltaY;
//             max_pos_x = Math.ceil((scale - 1) * el.clientWidth / 2);
//             max_pos_y = Math.ceil((scale - 1) * el.clientHeight / 2);
//             if (posX > max_pos_x) {
//                 posX = max_pos_x;
//             }
//             if (posX < -max_pos_x) {
//                 posX = -max_pos_x;
//             }
//             if (posY > max_pos_y) {
//                 posY = max_pos_y;
//             }
//             if (posY < -max_pos_y) {
//                 posY = -max_pos_y;
//             }
//         }
//         console.log(posY);


//         //pinch
//         if (ev.type == "pinch") {
//             scale = Math.max(.999, Math.min(last_scale * (ev.scale), 4));
//         }
//         if (ev.type == "pinchend") { last_scale = scale; }

//         //panend
//         if (ev.type == "panend") {
//             last_posX = posX < max_pos_x ? posX : max_pos_x;
//             last_posY = posY < max_pos_y ? posY : max_pos_y;
//         }

//         if (scale != 1) {
//             transform =
//                 "translate3d(" + posX + "px," + posY + "px, 0) " +
//                 "scale3d(" + scale + ", " + scale + ", 1)";
//         }

//         if (transform) {
//             el.style.webkitTransform = transform;
//         }
//     });
// }


//START:Knapheidesi Marker hinzufügen
function getthemarkerdatat() {

	// request information for ID from backend (data in contained in var object as JSON)
	$.get(requestURL, function (object) {
		for (var i = 0; i < object.length; i++) {
			createMarker(object[i]._id, object[i].position.x, object[i].position.y);
		}
	});
}
var Marker = function () {
	this.Sprite = new Image();
	this.Sprite.src = "offenemarker.png";
	this.Width = 12;
	this.Height = 20;
	this.XPos = 0;
	this.YPos = 0;
}
function createMarker(OId, XPosi, YPosi) {
	var marker = new Marker();
	marker.XPos = XPosi;
	marker.YPos = YPosi;
	$.get(requestURL, function () {
		// check if ID/object has already been processed (played by user) - data will be set in local storage
		var visitedObjectsCampusRallye = localStorage.getItem("visitedObjectsCampusRallye");
		var visitedObjectsCampusRallyeJSON = JSON.parse(visitedObjectsCampusRallye);
		if (visitedObjectsCampusRallyeJSON !== null) {
			for (n in visitedObjectsCampusRallyeJSON.visitedObjects) {
				if (OId == visitedObjectsCampusRallyeJSON.visitedObjects[n]._id) {
					marker.Sprite.src = "fertigemarker.png";
				}
			}


		}
	});


	Markers.push(marker);
}
//END:Knapheidesi Marker hinzufügen 

var firstLoad = function () {
	context.font = "15px Georgia";
	context.textAlign = "center";
	getthemarkerdatat();
}

//END:Knapheidesi hier muss abgefragt werden ob schon bearbeitet, oder wo anders einbinden, dass Bild geändert werden kann 

var firstLoad = function () {
	context.font = "15px Georgia";
	context.textAlign = "center";
	getthemarkerdatat();
}

firstLoad();

var main = function () {
	draw();
};


var draw = function () {
	console.log(Markers);
	//Clear Canvas
	context.fillStyle = "#000";

	context.fillRect(0, 0, canvas.width, canvas.height);

	// Draw map
	// Sprite, X location, Y location, Image width, Image height
	// You can leave the image height and width off, if you do it will draw the image at default size
	context.drawImage(mapSprite, 0, 0, canvas.width, canvas.height);

	// Marker.Sprite = new Image();
	// Marker.Sprite.src = "http://www.clker.com/cliparts/w/O/e/P/x/i/map-marker-hi.png"
	// context.drawImage(Marker.Sprite, canvas.width * 0.25, canvas.height * 0.25, canvas.width * 0.048, canvas.height * 0.08);

	// Draw markers
	for (var i = 0; i < Markers.length; i++) {
		var tempMarker = Markers[i];
		// Draw marker
		context.drawImage(tempMarker.Sprite, tempMarker.XPos * canvas.width, tempMarker.YPos * canvas.height, canvas.width * 0.048, canvas.height * 0.08);

		// // Calculate postion text
		// var markerText = "Postion (X:" + tempMarker.XPos + ", Y:" + tempMarker.YPos;

		// // Draw a simple box so you can see the position
		// var textMeasurements = context.measureText(markerText);
		// context.fillStyle = "#666";
		// context.globalAlpha = 0.7;
		// context.fillRect(tempMarker.XPos - (textMeasurements.width / 2), tempMarker.YPos - 15, textMeasurements.width, 20);
		// context.globalAlpha = 1;

		// // Draw position above
		// context.fillStyle = "#000";
		// context.fillText(markerText, tempMarker.XPos, tempMarker.YPos);
	}
};
setInterval(main, (1000 / 100)); // Refresh 100 times a second