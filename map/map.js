//Zum erstellen der Karte mit Marken darauf wurde folgende Vorlage genutzt: https://jsfiddle.net/7hed6uxL/2/
//Unterschiede hierzu sind, dass die Daten zum erstellen der Marker aus dem Backend gezogen werden und dass sich die Karte responsive an das Fenster anpasst.

var requestURL = "https://localhost:8080/api/objects/basic";
var Markers = new Array();
// Map sprite
var mapSprite = new Image();
var sizeheight;

//mapSprite sizes can only be used when the image has loaded
mapSprite.onload = function () {
	//Größenverhältnis
	sizeheight = mapSprite.naturalHeight / mapSprite.naturalWidth;

	// Visuelle Ausfüllung des Elternobjektes
	canvas.style.width = '100%';
	canvas.style.height = canvas.style.width * sizeheight;
	// ...setzen der internen Größe
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.width * sizeheight;
}

var canvas = document.getElementById('Canvas');
var context = canvas.getContext("2d");
mapSprite.src = "map.jpg";

//START:Navigationsbar öffnen und schließen
function openNav() {
	document.getElementById("mySidebar").style.width = "100%";
	document.getElementById("main").style.marginLeft = "100%";
}

function closeNav() {
	document.getElementById("mySidebar").style.width = "0";
	document.getElementById("main").style.marginLeft = "0";
}
//ENDE:Navigationsbar öffnen und schließen

//START:Knapheidesi Karte Responsive an Fenster anpassen
window.addEventListener("resize", handleResize);
window.addEventListener('orientationchange', handleResize);
function handleResize() {
	// Make it visually fill the positioned parent
	canvas.style.width = '100%';
	canvas.style.height = canvas.style.width * sizeheight;
	// ...then set the internal size to match
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.width * sizeheight;
	main();
}
//END:Knapheidesi Karte Responsive an Fenster anpassen

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

firstLoad();

var main = function () {
	draw();
};

var draw = function () {
	context.fillStyle = "#000";

	context.fillRect(0, 0, canvas.width, canvas.height);

	// Zeichnen der Karte
	// Sprite, X Koordinate, Y Koordinate, Image Breite, Image Höhe
	context.drawImage(mapSprite, 0, 0, canvas.width, canvas.height);

	// Zeichnen der Marker
	for (var i = 0; i < Markers.length; i++) {
		var tempMarker = Markers[i];
		// Zeichne Marker
		context.drawImage(tempMarker.Sprite, tempMarker.XPos * canvas.width, tempMarker.YPos * canvas.height, canvas.width * 0.048, canvas.height * 0.08);
	}
};
setInterval(main, (1000 / 100)); // Refresh 100 mal pro Minute