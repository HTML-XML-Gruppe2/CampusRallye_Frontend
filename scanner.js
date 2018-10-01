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
    onScan("");
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
    //content = "https://localhost:8080/5b9cfefa1e77bd3470c2041f";

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
        let cardGeneralInformation = createCard(object.name, object.description);
        let cardGeneralInformationContentBreak = $("<p></p>").html("");
        cardGeneralInformation.append(cardGeneralInformationContentBreak);
        $("#cardList").append(cardGeneralInformation);

        // create card questions
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
        //cardQuestionsContent = $("<div class='w3-container'></div>").html(cardQuestionsContent);
        let cardQuestions = createCard("Fragen", cardQuestionsContent);
        //cardQuestions.append(cardQuestionsContent);
        $("#cardList").append(cardQuestions);

        var coll = document.getElementsByClassName("collapsible");
        var i;

        for (i = 0; i < coll.length; i++) {
            coll[i].addEventListener("click", function () {
                this.classList.toggle("active");
                var content = this.nextElementSibling;
                if (content.style.display === "block") {
                    content.style.display = "none";
                } else {
                    content.style.display = "block";
                }
            });
        }
    });
}


/*  createCard
    This method creates a "card" with title (as button) and body.
    The body is hidden by default and can be displayed by a buttonclick!
*/
function createCard(title, content) {
    let newContent = "<div><button class=\"collapsible\">" + title + "</button>";
    newContent += "<div class=\"content\">" + content + "</div></div>";
    let cardBody = $("<div></div>").html(newContent);
    let card = $("<div class='w3-card w3-white'></div>").append(cardBody);
    return card;
}


/*  confirmAnswers
    This method confirms answers and displays the solutions
*/
function confirmAnswers(_id) {
    // build request URL (/api/object/[_id])
    var requestURL = "/api/object/" + _id;

    // request information for ID from backend (data in contained in var object as JSON)
    $.get(requestURL, function (object) {
        console.log(object);
        var flagNoAnswer = isNoAnswer(object);
        if (flagNoAnswer == true) {
            var answer = confirm("Es wurden nicht alle Fragen beantwortet! Trotzdem fortfahren?");
            if (answer == true) {
                saveAnswers(object);
            } else {
            }
        } else {
            saveAnswers(object);
        }
    });
}


/*  confirmAnswers
    This method returns true if user hasn't answered all questions
*/
function isNoAnswer(object) {
    // get questions and check results from user --> if no answer: return "true"
    for (i in object.questions) {
        var nameRadioGroup = "input[name=question" + object.questions[i].id + "]:checked";
        var nameTextAnswer = "textAnswer" + object.questions[i].id;
        var result = $(nameRadioGroup).val();
        var nameRadioGroupAll = "input[name=question" + object.questions[i].id + "]";
        if (result == "true") {
        } else if (result == "false") {
        } else {
            return true;
        }
    }
}


/*  confirmAnswers
    This method saves the answers. Therefore die answers have to be analyzed, the score has to be increased,
    the object has to be added to the visited objects and the confirm process has to be disabled!
*/
function saveAnswers(object) {
    // get current score and visited objects
    var scoreCampusRallye = localStorage.getItem("scoreCampusRallye");
    if (scoreCampusRallye == null) {
        scoreCampusRallye = 0;
    }
    new Number(scoreCampusRallye);
    var visitedObjectsCampusRallye = localStorage.getItem("visitedObjectsCampusRallye")
    if (visitedObjectsCampusRallye == null) {
        visitedObjectsCampusRallye = "{\"visitedObjects\":[]}";
    }

    // get questions + answers and check results from user --> increase score
    for (i in object.questions) {
        var nameRadioGroup = "input[name=question" + object.questions[i].id + "]:checked";
        var nameTextAnswer = "textAnswer" + object.questions[i].id;
        var result = $(nameRadioGroup).val();
        var nameRadioGroupAll = "input[name=question" + object.questions[i].id + "]";
        $(nameRadioGroupAll).attr('disabled', true);
        if (result == "true") {
            document.getElementById(nameTextAnswer).innerHTML = "<font color=\"green\">&#10004; Diese Antwort war richtig!</font>";
            scoreCampusRallye++;
        } else if (result == "false") {
            document.getElementById(nameTextAnswer).innerHTML = "<font color=\"red\">&#10006; Diese Antwort war falsch!</font>";
        } else {
            document.getElementById(nameTextAnswer).innerHTML = "<font color=\"red\">&#9888; Keine Antwort abgegeben!</font>";
        }
    }

    // set new score and visited items
    localStorage.setItem("scoreCampusRallye", scoreCampusRallye);
    var visitedObjectsCampusRallyeJSON = JSON.parse(visitedObjectsCampusRallye);
    visitedObjectsCampusRallyeJSON['visitedObjects'].push({ "_id": object._id, "name": object.name });
    visitedObjectsCampusRallye = JSON.stringify(visitedObjectsCampusRallyeJSON);
    localStorage.setItem("visitedObjectsCampusRallye", visitedObjectsCampusRallye);

    // remove confirm elements so that user can't confirm twice
    document.getElementById("buttonSend").remove();
    document.getElementById("textSend").remove();
}


function openNav() {
    document.getElementById("mySidebar").style.width = "100%";
    document.getElementById("main").style.marginLeft = "100%";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}