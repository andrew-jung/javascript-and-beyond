var g_html;
var API_KEY = "AIzaSyBL_q9wjVBVQj3ajBIUQzSOV0voZz0-uZk";
var origin;
var destination;
var arrivalTime;
var arriveBy;


function getTime() {
    function checkTime(i) {
        return (i < 10) ? "0" + i : i;
    }

    function startTime() {
        var today = new Date(),
            h = checkTime(today.getHours()),
            m = checkTime(today.getMinutes());
        document.getElementById('time').innerHTML = "Departure time: " + h + ":" + m;
            t = setTimeout(function () {
            startTime()
        }, 500);
    }
    startTime();
};

function getDirections() {
    origin = document.getElementById("origin");
    destination = document.getElementById("destination");
    arrivalTime = document.getElementById("arrivalTime");

    // I need to convert arrival time, into <current date> <arrival time> -> epoch
    // Validate forms one at a time
    // Could implement counter, if counter > 0, then invalid form
    if(!origin.checkValidity() || !destination.checkValidity() || !arrivalTime.checkValidity()){
      alert("Check all missing fields");
      return;
    }

    var xhttp = new XMLHttpRequest();

    // add loading functionality
    xhttp.onloadstart = function() {
        //
    }
    xhttp.onload = function() {
        if (this.status == 200) {
            loadData(this);
        }
    };
    xhttp.onerror = function(err) {
        alert("Error loading direction data" + err);
    }
    xhttp.onloadend = function() {
      //
    }

    var porigin = document.getElementById('origindiv');
    var pdestination = document.getElementById('destinationdiv');
    porigin.innerHTML = "<div class= 'well well-sm'>" + "Leave " + origin + "</div>";
    pdestination.innerHTML = "<div class= 'well well-sm'>" + "Arrive at " +  destination + "</div>";

   // arriveBy = new Date(); // create new date (DAY MM DD YYYY HH:MM:SS TIMEZONE)
   // arriveBy.setHours(arrivalTime.split(":")[0],arrivalTime.split(":")[1]);
   // "&arrival_time=" + Math.round(arriveBy.getTime()/1000) +

    var query = "https://maps.googleapis.com/maps/api/directions/xml?origin=" + origin +
        "&destination=" + destination +
        "&mode=transit" +
        "&key=" + API_KEY;
    xhttp.open("GET", query, true);
    xhttp.send();
}

function loadData(response) {
    var xmlDoc = response.responseXML;
    if (xmlDoc == null) {
        alert('Invalid response from server.');
        return;
    }
    var directions = xmlDoc.getElementsByTagName("step");
    if (directions.length == 0) {
        alert("No Direction Data.");
    }
    for (var i = 0; i < directions.length; i++) {
        var direc = directions[i];
        if (direc != null) {
            displayData(direc, i, directions.length);
        }
    }
}

// Currently displaying transit route but with 'wrong' text?
// add icons
function displayData(direc, num, maxnum) {
    getTime();
    var panel = document.getElementById("directions");
    //Directions
    var directions = direc.getElementsByTagName("html_instructions")[0];
    var nodeD = directions.childNodes[0];
    //Distance
    var distance = direc.getElementsByTagName("distance")[0];
    var distsub = distance.getElementsByTagName("text")[0];
    var nodeDist = distsub.childNodes[0];
    //Duration
    var duration = direc.getElementsByTagName("duration")[0];
    var dursub = duration.getElementsByTagName("text")[0];
    var nodeDur = dursub.childNodes[0];
    if(g_html == null){
        g_html = "<div class='well' id='step" + num + "'> " + nodeD.nodeValue +" "  +
    nodeDist.nodeValue  + " or " + nodeDur.nodeValue +  "</div>";
    }else{
        g_html += "<div class='well' id='step" + num +"'> " + nodeD.nodeValue +" "  +
    nodeDist.nodeValue  + " or " + nodeDur.nodeValue +  "</div>";
    }

    panel.innerHTML = g_html;
}

