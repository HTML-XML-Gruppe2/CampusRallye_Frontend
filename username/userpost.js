
//check whether the username is filled
function filled() {
	console.log("Username:" + document.getElementById("username").value);
	if (document.getElementById("username").value == "") {
		document.getElementById("text").innerHTML = "Sie müssen einen Namen eingeben, um das Spiel zu beenden!";
	} else {
		confirmation();
	}
}

//display confirmation before sending username and score to the backend
function confirmation() {

	var confirmation = document.getElementById("confirmation");
	var yes = document.getElementById("yes");
	var no = document.getElementById("no");

	if (confirmation.style.display === "none") {
		confirmation.style.display = "block";
	} else {
		confirmation.style.display = "none";
	}

	if (yes.style.display === "none") {
		yes.style.display = "block";
	} else {
		yes.style.display = "none";
	}

	if (no.style.display === "none") {
		no.style.display = "block";
	} else {
		no.style.display = "none";
		document.getElementById("username").value = "";
		document.getElementById("text").innerHTML = "Um das Spiel zu beenden und dich in die Rankingliste eintragen zu können, musst du deinen Namen angeben.";

	}

}


//sending user and score to the backend
function postuser() {
	var username = $("#username").val();
	var punkte = localStorage.getItem("scoreCampusRallye");
	var jsonScore = "{\"name\": \"" + username + "\", \"score\":" + punkte + "}";
//{"name": "username", "score": 34 }
	//alert(punkte); +/			ToDo: wieder reinnehmen 
	//$.post("/api/scores/", jsonScore);
	$.ajax({
		url: "/api/scores/",
		type: "POST",
		contentType: "application/json",
		data: jsonScore,

		success: function (result) {
			console.log("success");
			localStorage.removeItem("scoreCampusRallye");
			localStorage.removeItem("visitedObjectsCampusRallye");
		},
		error: function (xhr) {
			console.log("error");
			localStorage.removeItem("scoreCampusRallye");
			localStorage.removeItem("visitedObjectsCampusRallye");
		}
	});
}



