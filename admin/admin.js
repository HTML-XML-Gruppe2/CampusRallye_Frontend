let listHtmlElementId = "objectList";
let detailHtmlElementId = "objectDetails";

let questionsToBeAdded = [];

$(document).ready(function () {

    $.ajax({
        url: "/api/objects/basic",
        type: "GET",
        contentType: "application/json",

        success: function (result) {
            createList(result);
        },
        error: function () {
            createList(null);
        }
    });
});

function createList(objectArray) {

    $("#" + listHtmlElementId).html("");

    if (objectArray != null) {
        for (var i = 0; i < objectArray.length; i++) {

            var listObject = createListObject(objectArray[i]);
            $("#" + listHtmlElementId).append(listObject);
        }
    }

    $("#" + listHtmlElementId).append(createAddObjectButton());
}
function createListObject(object) {

    let onClickFunction = "setObjectDetails('" + object._id + "')";

    let listItem = $("<li></li>").attr("onclick", onClickFunction);
    listItem.text(object.name);

    return listItem;
}

function setObjectDetails(objectId) {

    questionsToBeAdded = [];

    $.get("/api/object/" + objectId, function (data) {

        let heading = createHeadingRow(data._id, data.name);
        let description = $("<p></p>").text(data.description);

        let positionTable = createPositionTable(data.position.x, data.position.y)
        let divider = $("<hr/>");
        let divider2 = $("<hr/>");
        let divider3 = $("<hr/>");

        let questions = createQuestionList(data.questions);

        let onclickFunc = "printElem('code')";
        let button = $("<button class='w3-button mainColor'>Print QR Code</button>").attr("onclick", onclickFunc);
        let qrCode = $("<div class='w3-container' id='code' style='margin: 15px;'></div>")

        let content = $("<div></div>").append(heading, description, divider, positionTable, divider2, questions, divider3, button, qrCode);
        $("#" + detailHtmlElementId).html(content);

        new QRCode(document.getElementById("code"),
            {
                text: "https://localhost:8080/code/" + data._id,
                width: 200,
                height: 200
            });
    });
}

function printElem(elem) {
    var mywindow = window.open('', 'PRINT', 'height=400,width=600');

    mywindow.document.write('<html><head><title>' + document.title + '</title>');
    mywindow.document.write('</head><body >');
    mywindow.document.write('<h1>' + document.title + '</h1>');
    mywindow.document.write(document.getElementById(elem).innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();
    mywindow.close();

    return true;
}


function createHeadingRow(objectId, objectName) {

    let deleteFunction = "showDeleteModal('" + objectId + "','" + objectName + "')";

    let delButton = $("<button id='delButton' class='w3-button w3-red'></button>")
    delButton.append($("<i class='fa fa-trash'></i>"));
    delButton.attr("onclick", deleteFunction);
    let headingText = $("<h3></h3>").append($("<b></b>").text(objectName));
    let heading = $("<div></div>").append(delButton, headingText);

    return heading;
}

function showDeleteModal(objectId, objectName) {
    $("#confirmDeleteButton").attr("onclick", "deleteObject('" + objectId + "')");
    $("#deleteText").text("Are you sure that you want to delete '" + objectName + "'?");
    $("#deleteModal").css("display", "block");
}
function hideDeleteModal() {
    $("#deleteModal").css("display", "none");
}

function showAddModal() {
    $("#questionTextInput").val("");
    $("#answerInputs").html("");
    $("#addModal").css("display", "block");

    addQuestionField();
    addQuestionField();
}

function hideAddModal() {
    $("#addModal").css("display", "none");
}

function deleteObject(objectId) {

    $.ajax({
        url: "/api/object/" + objectId,
        type: "DELETE",
        success: function (result) {
            hideDeleteModal();
            location.reload();
        },
        error: function () {
            alert("an error occured");
        }
    });
}

function createAddObjectButton() {

    let item = $("<li class='w3-green w3-hover-gray'> Add new object </li>");
    item.prepend($("<i class='fa fa-plus-circle'></i>"))
    item.attr("onclick", "addNewObject('" + detailHtmlElementId + "')");

    return item;
}

function addNewObject(detailElementId) {

    let saveFunction = "saveObject()";

    let saveButton = $("<button id='saveButton' class='w3-button w3-blue'></button>")
    saveButton.append($("<i class='fa fa-save'></i>"));
    saveButton.attr("onclick", saveFunction);
    let headingText = $("<h3></h3>").append($("<b></b>").text("Create new object"));
    let heading = $("<div></div>").append(saveButton, headingText);

    let titleLabel = $("<label></label").text("Title");
    let titleInput = $("<input id='titleInput' class='w3-input w3-border' type='text'>")
    let descriptionLabel = $("<label></label").text("Description");
    let descriptionInput = $("<textarea rows='5' id='descriptionInput' class='w3-input w3-border'></textarea>")
    let divider = $("<hr/>");
    let basicData = $("<div></div>").append(heading, titleLabel, titleInput, descriptionLabel, descriptionInput, divider);

    let positionHeading = $("<h4></h4>").append($("<b></b>").text("Position:"));
    let xLabel = $("<label></label>").text("x");
    let xInput = $("<input id='xInput' class='w3-input w3-border positionInput' type='text'>");
    let yLabel = $("<label></label>").text("y");
    let yInput = $("<input id='yInput' class='w3-input w3-border positionInput' type='text'>");
    let divider2 = $("<hr/>");
    let positionData = $("<div></div>").append(positionHeading, xLabel, xInput, yLabel, yInput, divider2);

    let addButton = $("<button class='w3-button mainColor'></button>").text("Add Question");
    addButton.attr("onclick", "showAddModal()");

    let questions = $("<div id='questionsToBeAdded' ></div>");
    let questionData = $("<div></div>").append(addButton, questions);

    let content = $("<div></div>");
    content.append(basicData, positionData, questionData);
    $("#" + detailElementId).html(content);
}

function addQuestionField() {
    let field = $("<div class='answerField'></div>")

    field.append($("<input style='float: left; width: 5%' class='w3-radio answerType' type='radio' name='correct' checked='true'>"));
    field.append($("<input style='float: left; width: 90%' class='w3-input w3-border answerInput' type='text'>"));

    $("#answerInputs").append(field);
}

function addQuestion() {

    let question = {}

    question.text = $("#questionTextInput").val();
    question.answers = [];

    $('.answerField').each(function () {
        let answer = {}
        answer.text = $(this).find(".answerInput")[0].value
        answer.correct = $(this).find(".answerType")[0].checked

        question.answers.push(answer);
    })

    console.log(JSON.stringify(question, null, 2));
    questionsToBeAdded.push(question);
    hideAddModal();

    $("#questionsToBeAdded").html("");
    $("#questionsToBeAdded").append(createQuestionList(questionsToBeAdded));

}

function saveObject() {

    let data = {}
    data.name = $("#titleInput").val();
    data.description = $("#descriptionInput").val();
    data.position = {};
    data.position.x = $("#xInput").val();
    data.position.y = $("#yInput").val();
    data.questions = questionsToBeAdded;

    console.log(JSON.stringify(data, null, 2));

    $.ajax({
        url: "/api/objects/",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),

        success: function (result) {
            questionsToBeAdded = [];
            location.reload();
        },
        error: function () {
            alert("an error occured");
        }
    });
}


function createPositionTable(x, y) {
    let position = $("<div></div>");
    let positionTable = $("<table class='w3-table-all w3-border' style='max-width:200px'></table>");
    let firstRow = $("<tr></tr>").append($("<td></td>").text("X")).append($("<td></td>").text(x));
    let secondRow = $("<tr></tr>").append($("<td></td>").text("Y")).append($("<td></td>").text(y));
    positionTable.append(firstRow, secondRow);
    let positionHeading = $("<h4></h4>").append($("<b></b>").text("Position:"));

    position.append(positionHeading, positionTable);

    return position;
}

function createQuestionList(questionsArray) {

    let questionList = $("<div></div>");
    let questionHeading = $("<h4></h4>").append($("<b></b>").text("Questions"));
    let questions = $("<div></div>");


    for (var i = 0; i < questionsArray.length; i++) {
        questions.append($("<h5></h5>").text(questionsArray[i].text));

        for (var j = 0; j < questionsArray[i].answers.length; j++) {

            var answer = questionsArray[i].answers[j];
            var answerText = "";
            if (answer.correct) {
                answerText = "✓ " + answer.text;
            } else {
                answerText = "✘ " + answer.text;
            }
            questions.append($("<p></p>").text(answerText));
        }
    }

    questionList.append(questionHeading, questions);

    return questionList;
}
