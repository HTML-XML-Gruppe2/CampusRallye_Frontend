var requestURL = "https://localhost:8080/api/objects/basic";
var canvas = document.getElementById('Canvas');
var context = canvas.getContext("2d");
// Map sprite
var mapSprite = new Image();
mapSprite.src = "map.jpg";
//Größenverhältnis
var sizeheight = mapSprite.naturalHeight / mapSprite.naturalWidth;
// Make it visually fill the positioned parent
canvas.style.width = '100%';
canvas.style.height = canvas.style.width * sizeheight;
// ...then set the internal size to match
canvas.width = canvas.offsetWidth;
canvas.height = canvas.width * sizeheight;
//START:Knapheidesi Karte Responsive an Fenster anpassen
window.addEventListener("load", draw);
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

var Marker = function () {
    this.Sprite = new Image();
    this.Sprite.src = "offenemarker.png";
    this.Width = 12;
    this.Height = 20;
    this.XPos = 0;
    this.YPos = 0;
}

var Markers = new Array();

//START:Knapheidesi Marker hinzufügen
var mouseClicked = function (mouse) {
    // Get corrent mouse coords
    var rect = canvas.getBoundingClientRect();
    var mouseXPos = (mouse.x - rect.left);
    var mouseYPos = (mouse.y - rect.top);

    // Move the marker when placed to a better location
    var marker = new Marker();
    marker.XPos = (mouseXPos - (marker.Width / 2)) / canvas.width;
    marker.YPos = (mouseYPos - marker.Height) / canvas.height;
    console.log("X:"+ marker.XPos + " Y:"+ marker.YPos);
    Markers.push(marker);
}

// Add mouse click event listener to canvas
canvas.addEventListener("mousedown", mouseClicked, false);

// function getthemarkerdatat() {

//     // request information for ID from backend (data in contained in var object as JSON)
//     $.get(requestURL, function (object) {
//         for (var i = 0; i < object.length; i++) {
//             createMarker(object[i]._id, object[i].position.x, object[i].position.y);
//         }
//     });
// }

function createMarker(OId, XPosi, YPosi) {
    var marker = new Marker();
    marker.XPos = XPosi;
    marker.YPos = YPosi;
    Markers.push(marker);
}
//END:Knapheidesi Marker hinzufügen

var firstLoad = function () {
    context.font = "15px Georgia";
    context.textAlign = "center";
    // getthemarkerdatat();
}

firstLoad();

var main = function () {
    draw();
};

var draw = function () {
    //Clear Canvas
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw map
    // Sprite, X location, Y location, Image width, Image height
    // You can leave the image height and width off, if you do it will draw the image at default size
    context.drawImage(mapSprite, 0, 0, canvas.width, canvas.height);

    // Draw markers
    for (var i = 0; i < Markers.length; i++) {
        var tempMarker = Markers[i];
        // Draw marker
        context.drawImage(tempMarker.Sprite, tempMarker.XPos * canvas.width, tempMarker.YPos * canvas.height, tempMarker.Width, tempMarker.Height);

        // Calculate postion text
        var markerText = "Postion (X:" + tempMarker.XPos + ", Y:" + tempMarker.YPos;

        // Draw a simple box so you can see the position
        var textMeasurements = context.measureText(markerText);
        context.fillStyle = "#666";
        context.globalAlpha = 0.7;
        context.fillRect(tempMarker.XPos * canvas.width - (textMeasurements.width / 2), tempMarker.YPos * canvas.height - 15, textMeasurements.width, 20);
        context.globalAlpha = 1;

        // Draw position above
        context.fillStyle = "#000";
        context.fillText(markerText, tempMarker.XPos * canvas.width, tempMarker.YPos * canvas.height);
    }
};
setInterval(main, (1000 / 60)); // Refresh 60 times a second