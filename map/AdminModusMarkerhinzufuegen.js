var mouseClicked = function (mouse) {
    // Get corrent mouse coords
    var rect = canvas.getBoundingClientRect();
    var mouseXPos = (mouse.x - rect.left);
    var mouseYPos = (mouse.y - rect.top);

    console.log("Marker added");

    // Move the marker when placed to a better location
    var marker = new Marker();
    marker.XPos = (mouseXPos - (marker.Width / 2)) / canvas.width;
    marker.YPos = (mouseYPos - marker.Height) / canvas.height;

    // Markers.push(marker);
}

// Add mouse click event listener to canvas
canvas.addEventListener("mousedown", mouseClicked, false);
Marker.Sprite = new Image();
Marker.Sprite.src = "http://www.clker.com/cliparts/w/O/e/P/x/i/map-marker-hi.png"
context.drawImage(Marker.Sprite, marker.XPos, marker.YPos, canvas.width * 0.048, canvas.height * 0.08);