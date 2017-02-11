var g_html;
// instantiate, default values
var origin;
var destination;
var arrivalTime;

var time = 0;
var hours = 0;
var minutes = 0;

var spinner = document.getElementById("loader");
var API_KEY = "AIzaSyBL_q9wjVBVQj3ajBIUQzSOV0voZz0-uZk"; // API KEY

// TO-DO:
// Arrival time regex, calculations.
// HH:MM format.
// Distance metrics fixed.
// Clear container after, right now repeats values.
// Add loading metric/
// Could add total time for travel.

function getDirections() {
    origin = document.getElementById("origin");
    destination = document.getElementById("destination");
    arrivalTime = document.getElementById("arrivalTime");

    // Validation
    if (!origin.checkValidity()) {
       alert("Invalid Origin");
        return;
    }
    if (!destination.checkValidity()) {
        alert("Invalid Destination");
        return;
    }
    if (!arrivalTime.checkValidity()){
        alert("Invalid Arrival Time");
        return;
    }

    // Get values
    origin = origin.value;
    destination = destination.value;
    arrivalTime = arrivalTime.value;

    var xhttp = new XMLHttpRequest();
    xhttp.onloadstart = function() {
         var block = "block";
    }
    xhttp.onload = function() {
        if (this.status == 200) {
            loadData(this);
        }
    };
    xhttp.onerror = function(err) {
        console.log("Error loading direction data" + err);
    }
    xhttp.onloadend = function() {
    }

     var query = "https://maps.googleapis.com/maps/api/directions/xml?origin=" + origin +
     "&destination=" + destination 
     + "&mode=transit&key=" 
     + API_KEY;
    
    xhttp.open("GET", query, true);
    xhttp.send();
} // end getDirections

function loadData(response) {
    var xmlDoc = response.responseXML;
    if (xmlDoc == null) {
        alert('Invalid response from server.');
        return;
    }
    
    // loop through step-tag until null/0
    var directions = xmlDoc.getElementsByTagName("step");
    console.log(xmlDoc);
    if (directions.length === 0) {
        alert("No Direction Data.");
    }
    for (var i = 0; i < directions.length; i++) {
        var direc = directions[i];
       
        if (direc != null) {
            try{
            displayDirections(direc, i, directions.length);
            }catch(err){
                console.log(err);
            }
        }
    }
    try{
        var realtime = Math.ceil(time/60);
        minutes = Math.ceil(realtime);
        if(minutes > 59){
            hours = parseInt(minutes%60);
            minutes = parseInt(minutes/hours);
            
        }
    }catch(err) {
        console.log("Error:" + err);
        var porigin = document.getElementById('origin-div');
        var pdestination = document.getElementById('destination-div');
        porigin.innerHTML = "<div class= 'well well-sm'>" + "Leave " + origin + "</div>";
        pdestination.innerHTML = "<div class= 'well well-sm'>" + "Arrive at " +  destination + "</div>";
        }
    
    var porigin = document.getElementById('origin-div');
    var pdestination = document.getElementById('destination-div');

    var today = new Date(), // curr time
            h = checkTime(today.getHours()),
            m = checkTime(today.getMinutes());
    
    var totalM = m+minutes;
    var totalH = h+hours;
    //console.log(totalM);
    //console.log(totalH);

    // Right now hour is 09 and +1 converts to 0901
    if (totalM > 60){ // minutes greater than 60:
       var diff = totalM % 60; // 61 minutes % 60 -> 1 extra minute.. etc
        totalH += 1;
        totalM -= 60;
        totalM += diff;
    }
     porigin.innerHTML = "<div class='well well-sm'>" + "Arrival time: " + totalH + ":" + totalM + "<br>Leave " + origin + "<br></div>";
     pdestination.innerHTML = "<div class= 'well well-sm'>" + "Arrive at " +  destination + "</div>";

} // end loadData

function displayDirections(direc, num, maxnum) {
    getTime();
    var panel = document.getElementById("directions-div");
        // Directions
        // console.log("2");
        var directions = direc.getElementsByTagName("html_instructions")[0];
        var nodeD = directions.childNodes[0];

        // Distance
        var distance = direc.getElementsByTagName("distance")[0];
        var distsub = distance.getElementsByTagName("text")[0];
        var nodeDist = distsub.childNodes[0];

        // Time
        var duration = direc.getElementsByTagName("duration")[0];
        var timesub = duration.getElementsByTagName("value")[0]
        var nodeTime = timesub.childNodes[0];
        time += parseInt(nodeTime.nodeValue);
        minutes = parseInt(nodeTime.nodeValue)/60;
        minutes = Math.ceil(minutes);

        // Check math
        var hours = 0;
        if(minutes > 59){
            hours = parseInt(minutes%60);
            minutes = parseInt(minutes/hours);
        }

        // Get transit mode
        var travelmde = direc.getElementsByTagName("travel_mode")[0];
        var nodeMode = travelmde.childNodes[0];
        text = (nodeMode.nodeValue);
        text = getModeImage(text);

        //Bus Numbers
        var boolbus = false;
        try{
            var bus = direc.getElementsByTagName("short_name")[0];
            var nodeN = bus.childNodes[0]
            boolbus = true;
        }catch(noBus){
            var error = noBus;
        }
        if(boolbus == false){ // Check if bus or walk
            if(g_html == null){
                g_html = "<div class='well' id='step"+num+"'>" + text  + " " + nodeD.nodeValue +" "  +
            nodeDist.nodeValue + "</div>"; 
            }else{
                g_html += "<div class='well' id='step"+num+"'>" + text  + " " + nodeD.nodeValue +" "  +
            nodeDist.nodeValue +  "</div>"; 
            }
        }else{
            if(g_html == null){
                g_html = "<div class='well' id='step"+num+"'>" + text  + " Bus: " + nodeN.nodeValue + " " + nodeD.nodeValue +" "  +
            nodeDist.nodeValue + "</div>"; 
            }else{
                g_html += "<div class='well' id='step"+num+"'>" + text  + " Bus: " + nodeN.nodeValue + " " + nodeD.nodeValue +" "  +
            nodeDist.nodeValue + "</div>"; 
            }
        }
    panel.innerHTML = g_html;
} // end displayDirections

function getModeImage(text) { // icon function
    if (text.match(/DRIVING/i)) {
        return "<i class='fa fa-car' aria-hidden='true'></i>";
    } else if (text.match(/WALKING/i)) {
        return "<i class='fa fa-male' aria-hidden='true'></i>";
    } else if (text.match(/TRANSIT/i)) {
        return "<i class='fa fa-bus' aria-hidden='true'></i>";
    }
}

function getTime() { // Departure/current time
    function startTime() { // running time, always current/local time
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

 function checkTime(i) {
    return (i < 10) ? "0" + i : i;
} // w3 function