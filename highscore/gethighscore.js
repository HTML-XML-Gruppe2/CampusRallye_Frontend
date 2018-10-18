$(document).ready(function () {
	$.get("/api/scores/", function (data, status) {

		// Array nach Punkteanzahl sortieren
		data.sort(function (a, b) { return b.score - a.score });

		var highscore, place;
		place = 1;
		highscore = "<div class='w3-responsive'><table class='w3-table-all' style='width: 90%' align='center'>"; /*"<table> <tr> <th> Platz </th> <th> Name </th> <th> Punkte </th> </tr>";		/* ToDo: Anzeige mittig */
		data.forEach(print);
		function print(value) {
			let textpunkte;
			if (value.score == 1) {
				textpunkte = " Punkt";
			} else {
				textpunkte = " Punkte";
			}
			highscore += "<tr> <td>" + place + ". </td> <td>" + value.name + "</td> <td>" + value.score + textpunkte + "</td> </tr>";
			place++;
		}
		document.getElementById("scorelist").innerHTML = highscore;
	});
});

