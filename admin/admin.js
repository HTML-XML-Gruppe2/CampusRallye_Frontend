$(document).ready(function () {

    $.get("/api/objects/basic", function (data) {
        createList(data, "objectList", "objectDetails");
    });
});

function createList(objectArray, listHtmlElementId, detailHtmlElementId) {
    for (var i = 0; i < objectArray.length; i++) {

        var listObject = createListObject(objectArray[i], detailHtmlElementId);
        $("#" + listHtmlElementId).append(listObject);
    }
}
function createListObject(object, detailElementId) {

    let listItem = $("<li></li>").text(object.name).attr("id", object._id);

    let onClickFunction = "setObjectDetails('" + object._id + "','" + detailElementId + "')";
    listItem.attr("onclick", onClickFunction);

    return listItem;
}

function setObjectDetails(objectId, detailElementId) {

    $.get("/api/object/" + objectId, function (data) {

        let heading = $("<h3></h3>").append($("<b></b>").text(data.name));
        let description = $("<p></p>").text(data.description);

        let positionTable = $("<table class='w3-table-all w3-border' style='max-width:200px'></table>");
        let firstRow = $("<tr></tr>").append($("<td></td>").text("X")).append($("<td></td>").text(data.position.x));
        let secondRow = $("<tr></tr>").append($("<td></td>").text("Y")).append($("<td></td>").text(data.position.y));
        positionTable.append(firstRow, secondRow);
        let positionHeading = $("<h4></h4>").append($("<b></b>").text("Position:"));
        let divider = $("<hr/>");
        let divider2 = $("<hr/>");
        let divider3 = $("<hr/>");

        let questionHeading = $("<h4></h4>").append($("<b></b>").text("Questions"));
        let questions = $("<div></div>");


        for (var i = 0; i < data.questions.length; i++) {
            questions.append($("<h5></h5>").text(data.questions[i].text));

            for (var j = 0; j < data.questions[i].answers.length; j++) {

                var answer = data.questions[i].answers[j];
                var answerText = "";
                if (answer.correct) {
                    answerText = "✓ " + answer.text;
                } else {
                    answerText = "✘ " + answer.text;
                }
                questions.append($("<p></p>").text(answerText));
            }
        }

        let onclickFunc = "printElem('code')";
        let button = $("<button class='w3-button w3-amber'>Print QR Code</button>").attr("onclick",onclickFunc);      
        let qrCode = $("<div class='w3-container' id='code' style='margin: 15px;'></div>")
        
        let content = $("<div></div>").append(heading, description, divider, positionHeading, positionTable, divider2, questionHeading, questions,divider3, button,qrCode);

        $("#" + detailElementId).html(content);

        new QRCode(document.getElementById("code"),"https://localhost:8080/code/"+data._id);
    });
}

function printElem(elem)
{
    var mywindow = window.open('', 'PRINT', 'height=400,width=600');

    mywindow.document.write('<html><head><title>' + document.title  + '</title>');
    mywindow.document.write('</head><body >');
    mywindow.document.write('<h1>' + document.title  + '</h1>');
    mywindow.document.write(document.getElementById(elem).innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();
    mywindow.close();

    return true;
}
