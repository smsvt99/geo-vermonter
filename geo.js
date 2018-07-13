function startGame() {
    document.getElementById("north").disabled = false;
    document.getElementById("south").disabled = false;
    document.getElementById("east").disabled = false;
    document.getElementById("west").disabled = false;
    document.getElementById("zoomOut").disabled = false;
    document.getElementById("start").disabled = true;
    document.getElementById("guess").disabled = false;
    document.getElementById("quit").disabled = false;
    zoomLevel = 18;
    score = 20;
    guessNumber = 0
    randomCoords();
    createMap(newLat, newLong, zoomLevel, randomLat, randomLong)
    document.getElementById("longitude").textContent = "Longitude: ?"
    document.getElementById("county").innerHTML = "County: ?<div id='countyDropdown'></div>"
    document.getElementById("latitude").textContent = "Latitude: ?"
    updateScore()
    closeAlert()
}
function randomCoords() {
    randomLat = Math.random() * (2.267) + 42.7395;
    randomLong = Math.random() * (-1.8165) - 71.5489;
    newLat = randomLat;
    newLong = randomLong;
    randomPair = randomLat + "," + randomLong
    randomPairArray = [randomLat, randomLong]
    layer = L.geoJson(border_data);
    results = leafletPip.pointInLayer([randomLong, randomLat], layer);
    if (!results.length) {
        console.log("getting new number")
        randomCoords();
    }
    else {
        console.log("point in polygon")
    }
}
function checkScore() {
    if (score === 0) {
        checkAlert = document.getElementById("alert")
        checkAlert.style = "display: inline-block;"
        checkAlert.innerHTML = "You lose! <br> Your score has reached 0.<br><button onclick='closeAlert()' id='guessAgain'>Close</button>"
        document.getElementById("guess").disabled = true;
        document.getElementById("quit").disabled = true;
        document.getElementById("north").disabled = true;
        document.getElementById("south").disabled = true;
        document.getElementById("east").disabled = true;
        document.getElementById("west").disabled = true;
        document.getElementById("zoomOut").disabled = true;
        document.getElementById("start").disabled = false;
        document.getElementById("countyGuessButton").disabled = true;
        document.getElementById("countyCancelButton").disabled = true;
    }
}
function updateScore() {
    scoreDiv = document.getElementById("score")
    scoreDiv.remove()
    document.getElementById("infoWrapper").innerHTML += "<div id='score'>Score: " + score + "</div>";
}
function closeAlert() {
    wrongGuessAlert = document.getElementById("alert")
    wrongGuessAlert.style = "display: none;"
}
function addDropdown() {
    countyDropdown = document.getElementById("countyDropdown")
    countyArray = ["Addison County", "Bennington County", "Caledonia County", "Chittenden County", "Essex County", "Franklin County", "Grand Isle County", "Lamoille County", "Orange County", "Orleans County", "Rutland County", "Washington County", "Windham County", "Windsor County"]
    countyDropdown.innerHTML += "<span>What County are we in?</span>"
    for (i = 0; i < countyArray.length; i++) {
        countyDropdown.innerHTML += `<a class='dropDownItems' href='#countyInput' onclick='fillCounty("${countyArray[i]}"); countyGuess();'><div id='${countyArray[i]}'>${countyArray[i]}</div></a>`
    }
    countyDropdown.innerHTML += "<input style='display:none;' id='countyInput' readonly />"
    countyDropdown.innerHTML += "<button id='countyCancelButton' onclick='cancel()'>Cancel</button>"
}
function fillCounty(county) {
    document.getElementById("countyInput").value = county.toString();
}
function checkForCounty() {
    countyArray = ["Addison County", "Bennington County", "Caledonia County", "Chittenden County", "Essex County", "Franklin County", "Grand Isle County", "Lamoille County", "Orange County", "Orleans County", "Rutland County", "Washington County", "Windham County", "Windsor County"]
    countyArrayIndex = 0
    fetch("https://nominatim.openstreetmap.org/search.php?q=" + randomPair + "&format=json")
        .then(function (response) {
            return response.json();
        })
        .then(function (myJSON) {
            realCounty = myJSON[0].display_name
            for (i = 0; i < countyArray.length; i++) {
                if (realCounty.includes(countyArray[countyArrayIndex])) {
                    console.log("Found it")
                    document.getElementById("county").innerHTML = "County: " + countyArray[countyArrayIndex]
                } else {
                    console.log(countyArray[countyArrayIndex])
                }
                countyArrayIndex++
            }
        })
}
function countyGuess() {
    fetch("https://nominatim.openstreetmap.org/search.php?q=" + randomPair + "&format=json")
        .then(function (response) {
            return response.json();
        })
        .then(function (myJSON) {
            realCounty = myJSON[0].display_name
            if (realCounty.includes(document.getElementById("countyInput").value)) {
                document.getElementById("county").innerHTML = "County: " + document.getElementById("countyInput").value + "<div id='countyDropdown'></div>"
                rightGuessAlert = document.getElementById("alert")
                rightGuessAlert.style = "display: inline-block;"
                rightGuessAlert.innerHTML = "Correct! You win! <br> You scored " + score + " points!<br><button onclick='closeAlert()' id='guessAgain'>Close</button>"
                document.getElementById("latitude").textContent = "Latitude: " + randomLat;
                document.getElementById("longitude").textContent = "Longitude: " + randomLong;
                document.getElementById("start").disabled = false;
                document.getElementById("guess").disabled = true;
                document.getElementById("quit").disabled = true;
                document.getElementById("north").disabled = true;
                document.getElementById("south").disabled = true;
                document.getElementById("east").disabled = true;
                document.getElementById("west").disabled = true;
                document.getElementById("zoomOut").disabled = true;
            }
            else {
                score--
                if (score === 0) {
                    checkScore()
                } else {
                    guessNumber++
                    updateScore()
                    wrongGuessAlert = document.getElementById("alert")
                    wrongGuessAlert.style = "display: inline-block;"
                    wrongGuessAlert.innerHTML = "Guess " + guessNumber + ": Wrong guess, guess again! <br><button onclick='closeAlert()' id='guessAgain'>Close</button>"
                }
            }
        })
}
function quit() {
    document.getElementById("longitude").textContent = "Longitude: " + randomLong;
    document.getElementById("county").textContent = "?"
    document.getElementById("latitude").textContent = "Latitude: " + randomLat;
    document.getElementById("guess").disabled = true;
    document.getElementById("quit").disabled = true;
    document.getElementById("start").disabled = false;
    document.getElementById("north").disabled = true;
    document.getElementById("south").disabled = true;
    document.getElementById("east").disabled = true;
    document.getElementById("west").disabled = true;
    document.getElementById("zoomOut").disabled = true;
    checkForCounty();
}
function guess() {
    countyDropdown = document.getElementById("countyDropdown")
    countyDropdown.style = "border: 2px solid black; display: flex; flex-direction: column; position:absolute; top:-50px; right:370px; height: 345px; flex-wrap: wrap; background-color:white; width:450px;"
    addDropdown()
}
function cancel() {
    countyDropdown = document.getElementById("countyDropdown")
    countyDropdown.innerHTML = "";
    countyDropdown.style = "display:none;"
}
function zoomOut() {
    zoomNumber++
    if (zoomNumber <= 2) {
        zoomLevel--;
    } else {
        zoomLevel--;
        document.getElementById("zoomOut").disabled = true;
    }
    score--;
    checkScore();
    updateScore()
    createMap(newLat, newLong, zoomLevel, randomLat, randomLong)
}
function north() {
    score--
    checkScore();
    updateScore()
    newLat = newLat + .002;
    createMap(newLat, newLong, zoomLevel, randomLat, randomLong)
}
function south() {
    score--
    checkScore();
    updateScore()
    newLat = newLat - .002;
    createMap(newLat, newLong, zoomLevel, randomLat, randomLong)
}
function east() {
    score--
    checkScore();
    updateScore()
    newLong = newLong + .004;
    createMap(newLat, newLong, zoomLevel, randomLat, randomLong)
}
function west() {
    score--
    checkScore();
    updateScore()
    newLong = newLong - .004;
    createMap(newLat, newLong, zoomLevel, randomLat, randomLong)
}
function createMap(lat, long, zoomL, originalLat, originalLong) {
    document.getElementById("mapWrapper").innerHTML = "<div id='map'></div>"
    let map = L.map('map', { zoomControl: false }).setView([lat, long], zoomL);
    mapLink =
        '<a href="http://www.esri.com/">Esri</a>';
    wholink =
        'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    L.tileLayer(
        'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; ' + mapLink + ', ' + wholink,
            maxZoom: 18,
            minZoom: 1,
        }).addTo(map);
    let countyPolygon = L.geoJSON(county_data, { color: 'black', fillOpacity: '.01' }).addTo(map)
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    markerID = L.marker([originalLat, originalLong]).addTo(map);
}