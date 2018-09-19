/*  scanner.js - by Christian Hirtz
    Scripts and functions for site "scan"
*/


/*  Global data
    Global data for scanner.js
*/
let opts = {
    continuous: true,
    video: document.getElementById('preview'),
    mirror: false,
    captureImage: false,
    backgroundScan: false,
    refractoryPeriod: 5000,
    scanPeriod: 1
};


/*  docuement.ready
    This method is processed for the initialization of the QR code scanner and camera
*/
$(document).ready(function () {
    let currentCam = 1;

    // initialize QR code scanner
    let scanner = new Instascan.Scanner(opts);
    scanner.addListener('scan', onScan);

    // get cameras
    Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length == 1) {
            // there is only one camera
            scanner.start(cameras[0]);

        } else if (cameras.length > 1) {
            // more than one camera: get decision by user 
            scanner.start(cameras[currentCam]);
            var toggleCamButton = $("<button type='button' id='toggleCamButton' class='w3-button w3-amber'></button>").text("Kamera wechseln");
            $("#scannerCard").append(toggleCamButton);
            $("#toggleCamButton").click(function () {
                scanner.stop().then(function () {
                    if (currentCam == 0) {
                        currentCam = 1;
                    } else {
                        currentCam = 0;
                    }
                    scanner.start(cameras[currentCam]);
                });
            });
       
        } else {
            // no camera found
            console.error('No cameras found.');
        }
    }).catch(function (e) {
        console.error(e);
    })

    // navigation
    $("#navButton").click(function () {
        $("#sideMenu").css("display", "block");
    });
    $("#closeMenu").click(function () {
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
function onScan(content) {
    // test data QR code
    content = "https://localhost:8080/5b9cfefa1e77bd3470c2041f";

    // reset view in order to only show current information
    $("#cardList").empty();

    // get ID from content (QR-Code) - Check if ID is included on last item in array
    var contentArray = content.split("/");
    var _id = contentArray[contentArray.length - 1];
    if (_id == null) {
        let cardNoID = createCard("Ups ... Hier lief etwas nicht!", "Dein QR-Code gehört leider nicht zur CampusRallye :(");
        $("#cardList").append(cardNoID);
        return;
    }

    // build request URL (/api/object/[_id])
    var requestURL = "/api/object/" + _id;

    // request information for ID from backend (data in contained in var object as JSON)
    $.get(requestURL, function (object) {
        console.log(object);

        // check if ID/object has already been processed (played by user) - data will be set in local storage
        if (1 == 2) { // disable function as long in test mode
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
            cardQuestionsContent += "<div>";
            for (j in object.questions[i].answers) {
                cardQuestionsContent += "<input type=\"radio\" name=\"question" + object.questions[i].id + "\"";
                cardQuestionsContent += "value=\"" + object.questions[i].answers[j].correct + "\">";
                cardQuestionsContent += " " + object.questions[i].answers[j].text + "<br>";
            }
            cardQuestionsContent += "</div>";
            cardQuestionsContent += "<p id=\"textAnswer" + object.questions[i].id + "\"></p>";
        }

        // display button to confirm answers
        cardQuestionsContent += "<button id=\"buttonSend\" onclick=\"confirmAnswers(\'" + object._id + "\')\">Senden!</button><br><br>"
        cardQuestionsContent += "<p id=\"textSend\"><i>Nach dem Senden werden deine Antworten gespeichert und können nicht mehr bearbeitet werden!</i></p><br>"
        
        // append card
        cardQuestionsContent = $("<div class='w3-container'></div>").html(cardQuestionsContent);
        cardQuestions.append(cardQuestionsContent);
        $("#cardList").append(cardQuestions);
    });
}


/*  createCard
    This method creates a "card" with title and body.
*/
function createCard(title, content) {
    // create title
    let cardHeader = $("<header class='w3-container w3-amber'></header>");
    cardHeader.append($("<h4></h4>").text(title));

    // create body
    let cardBody = $("<div class='w3-container'></div>").text(content);

    // create card with title + body and return data
    let card = $("<div class='w3-card w3-white'></div>").append(cardHeader);
    card.append(cardBody);
    return card;
}


/*  confirmAnswers
    This method confirms answers and displays the solutions
*/
function confirmAnswers(_id) {
    // set object as processed (played by user) in local storage
    localStorage.setItem(_id, "true");

    // build request URL (/api/object/[_id])
    var requestURL = "/api/object/" + _id;

    // request information for ID from backend (data in contained in var object as JSON)
    $.get(requestURL, function (object) {
        console.log(object);
        var scoreCampusRallye;
        new Number(scoreCampusRallye);
        scoreCampusRallye = parseInt(localStorage.getItem("scoreCampusRallye"));

        // get questions and check results from user
        for (i in object.questions) {
            var nameRadioGroup = "input[name=question" + object.questions[i].id + "]:checked";
            var nameTextAnswer = "textAnswer" + object.questions[i].id;
            var result = $(nameRadioGroup).val();
            var nameRadioGroupAll = "input[name=question" + object.questions[i].id + "]";
            $(nameRadioGroupAll).attr('disabled', true);
            if (result == "true") {
                document.getElementById(nameTextAnswer).innerHTML = "<font color=\"green\">&#10004; Diese Antwort war richtig!</font>";
                scoreCampusRallye = scoreCampusRallye + 1;
            } else if (result == "false") {
                document.getElementById(nameTextAnswer).innerHTML = "<font color=\"red\">&#10006; Diese Antwort war falsch!</font>";
            } else {
                document.getElementById(nameTextAnswer).innerHTML = "<font color=\"red\">&#9888; Keine Antwort abgegeben!</font>";
            }
        }

        // set score
        localStorage.setItem("scoreCampusRallye", scoreCampusRallye);
    });


    // remove send button and text
    document.getElementById("buttonSend").remove();
    document.getElementById("textSend").remove();
}