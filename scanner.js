let opts = {
    continuous: true,
    video: document.getElementById('preview'),
    mirror: true,
    captureImage: false,
    backgroundScan: false,
    refractoryPeriod: 5000,

    // Only applies to continuous mode. The period, in rendered frames, between scans. A lower scan period
    // increases CPU usage but makes scan response faster. Default 1 (i.e. analyze every frame).
    scanPeriod: 1
};


/*  docuement.ready
    This method is processed for initialization of QR code scanner and camera
*/
$(document).ready(function () {
    let currentCam = 1;

    // initialize QR code scanner
    let scanner = new Instascan.Scanner(opts);
    scanner.addListener('scan', onScan);

    // get cameras
    Instascan.Camera.getCameras().then(function (cameras) {

        // there is only one camera
        if (cameras.length == 1) {
            scanner.start(cameras[0]);

        // more than one camera: get decision by user    
        } else if(cameras.length > 1) {
            scanner.start(cameras[currentCam]);
            var toggleCamButton = $("<button type='button' id='toggleCamButton' class='w3-button w3-amber'></button>").text("Kamera wechseln");
            $("#scannerCard").append(toggleCamButton);
            $("#toggleCamButton").click(function(){
                scanner.stop().then(function () {
                    if(currentCam == 0){
                        currentCam = 1;
                    } else{
                        currentCam = 0;
                    }
                    scanner.start(cameras[currentCam]);
                 });
            });

        // no camera found    
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


/*  onScan
    This method is used as listener for the barcode event.
    Following tasks are processed in this method:
    1. Check QR code and extract object id from data string
    2. Check if object id has already been scannend
    3. Do HTTP request in order to get information from server
    4. Process information for frontend
*/
function onScan(content){
    // test data QR code
    content = "https://localhost:8080/5b9cfefa1e77bd3470c2041f";

    // reset view in order to only show current information
    $("#cardList").empty();

    // get ID from content (QR-Code) - Check if ID is included on last item in array
    var contentArray = content.split("/");
    var _id = contentArray[contentArray.length-1];
    if (_id == null) {
        let cardNoID = createCard("Ups ... Hier lief etwas nicht!", "Dein QR-Code gehört leider nicht zur CampusRallye :(");
        $("#cardList").append(cardNoID);
        return;
    }

    // build request URL (/api/object/[_id])
    var requestURL = "/api/object/" + _id;

    // request information for ID from backend (data in contained in var object as JSON)
    $.get( requestURL, function( object ) {
        console.log(object);

        // check if ID/object has already been processed (played by user) - data will be set in local storage
        if (1 !== 2) { // disable function as long in test mode
        var objectID = localStorage.getItem(object._id);
        if (objectID !== null) {
            let cardAlreadyProcessed = createCard(object.name, "");
            let cardAlreadyProcessedContent = "<b>Hier bist du schon gewesen! Suche nach anderen QR-Codes der CampusRallye und beantworte weitere Fragen!</b>";
            cardAlreadyProcessedContent += "<br><br>";
            cardAlreadyProcessedContent += object.description;  
            cardAlreadyProcessedContent = $("<div class='w3-container'></div>").html(cardAlreadyProcessedContent);
            cardAlreadyProcessed.append(cardAlreadyProcessedContent);
            $("#cardList").append(cardAlreadyProcessed);
            return;
        }
        }

        // display general information about the object
        let cardGeneralInformation = createCard(object.name, "");
        let cardGeneralInformationContent = object.description;
        cardGeneralInformationContent = $("<div class='w3-container'></div>").html(cardGeneralInformationContent);
        cardGeneralInformation.append(cardGeneralInformationContent);
        let cardGeneralInformationContentBreak = $("<p></p>").html("");
        cardGeneralInformation.append(cardGeneralInformationContentBreak);
        $("#cardList").append(cardGeneralInformation);

        // create card questions
        let cardQuestions = createCard("Fragen", "");
        let cardQuestionsContent = "Beantworte folgende Fragen! Viel Erfolg! <br><br>";
       
        // display question
        for (i in object.questions) {
            cardQuestionsContent += "<b>" + object.questions[i].text + "</b>";

            // display answers
            cardQuestionsContent += "<form action=\"" + object.questions[i].id + "\">";
            for (j in object.questions[i].answers) {
                cardQuestionsContent += "<input type=\"radio\" name=\"" + object.questions[i].id + "\"";
                cardQuestionsContent += "value=\"" + object.questions[i].answers[j].correct + "\">";
                cardQuestionsContent += object.questions[i].answers[j].text + "<br>";
            }
            cardQuestionsContent += "</form><br>";
        }

        cardQuestionsContent += "<button onclick=\"send(\'" + object._id + "\')\">Senden!</button><br><br>"
        cardQuestionsContent += "<i>Nach dem Senden werden deine Antworte gespeichert und können nicht mehr bearbeitet werden!</i><br>"
        cardQuestionsContent = $("<div class='w3-container'></div>").html(cardQuestionsContent);
        cardQuestions.append(cardQuestionsContent);
        $("#cardList").append(cardQuestions); 
    });
}


/*  createCard
    This method creates a "card" with title and body.
*/
function createCard(title, content){
    // create title
    let cardHeader = $("<header class='w3-container w3-amber'></header>")
    cardHeader.append($("<h4></h4>").text(title));

    // create body
    let cardBody = $("<div class='w3-container'></div>").text(content);

    // create card with title + body and return data
    let card = $("<div class='w3-card w3-white'></div>").append(cardHeader);
    card.append(cardBody);
    return card;
}

function send(_id) {
    // set object as processed(played by user) in local storage
    localStorage.setItem(_id, "2");
    // reset view in order to only show current information
    $("#cardList").empty();
    let cardSend = createCard("Weiter geht's!", "Deine Antworten wurden gespeichert, gehe zum nächsten Objekt!");
    $("#cardList").append(cardSend);

    // build request URL (/api/object/[_id])
    var requestURL = "/api/object/" + _id;

    // request information for ID from backend (data in contained in var object as JSON)
    $.get( requestURL, function( object ) {

    });    
}