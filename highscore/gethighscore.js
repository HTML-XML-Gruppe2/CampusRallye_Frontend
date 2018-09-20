$(document).ready(function(){

// ToDo: Highscore auslesen
// $.get("/api/scores", function(data, status){
        // alert("Data: " + data + "\nStatus: " + status);
    // });
	
	var data = [{name:"Jan", score:16},{name:"Tim", score:1},{name:"Peter", score:20}, {name:"Meike", score:0}];   /* ToDo: Testdaten raus */
	console.log(data);  /* ToDo: Testdaten raus */

	// Array nach Punkteanzahl sortieren
	data.sort(function(a,b){return b.score - a.score});
	

	var highscore, place;
	place = 1;
	highscore = "<table>"; /*"<table> <tr> <th> Platz </th> <th> Name </th> <th> Punkte </th> </tr>";		/* ToDo: Anzeige mittig */
	data.forEach(print);
	function print(value){
		let textpunkte;
		if (value.score == 1) {
			textpunkte = " Punkt";
		} else {
			textpunkte = " Punkte";
		}
		highscore += "<tr> <td>" + place + ". </td> <td>"+ value.name + "</td> <td>" + value.score + textpunkte + "</td> </tr>";
		place++;
	}
	console.log(highscore);	/* ToDo: Testdaten raus */
	document.getElementById("scorelist").innerHTML = highscore;
 
});

