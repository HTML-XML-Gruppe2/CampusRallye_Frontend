let opts = {
    continuous: true,
    video: document.getElementById('preview'),
    mirror: false,
    captureImage: false,
    backgroundScan: false,
    refractoryPeriod: 5000,

    // Only applies to continuous mode. The period, in rendered frames, between scans. A lower scan period
    // increases CPU usage but makes scan response faster. Default 1 (i.e. analyze every frame).
    scanPeriod: 1
};


$(document).ready(function () {

    let currentCam = 1;
    let scanner = new Instascan.Scanner(opts);
    scanner.addListener('scan', onScan);

    Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length == 1) {
            scanner.start(cameras[0]);
        } else if(cameras.length > 1) {
            scanner.start(cameras[currentCam]);

            var toggleCamButton = $("<button type='button' id='toggleCamButton' class='w3-button w3-amber'></button>").text("Kamera wechseln");
            $("#scannerCard").append(toggleCamButton);

            $("#toggleCamButton").click(function(){

                scanner.stop().then(function () {
                    if(currentCam == 0){
                        currentCam = 1;
                    }
                    else{
                        currentCam = 0;
                    }
                    scanner.start(cameras[currentCam]);
                   
                 });
            });
        } else {
            console.error('No cameras found.');
        }
    }).catch(function (e) {
        console.error(e);
    })


    $("#navButton").click(function(){
        $("#sideMenu").css("display", "block");
    });
    $("#closeMenu").click(function(){
        $("#sideMenu").css("display", "none");
    });
    
});



function onScan(content){
    let card = createCard("QR Code", content);
    $("#cardList").prepend(card);
}

function createCard(title, content){
    let cardBody = $("<div class='w3-container'></div>").text(content);
    let cardHeader = $("<header class='w3-container w3-amber'></header>")
    cardHeader.append($("<h4></h4>").text(title));
    let card = $("<div class='w3-card w3-white'></div>").append(cardHeader);
    card.append(cardBody);

    return card;
}
