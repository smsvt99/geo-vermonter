const countiesInVermont = ["Addison County", "Bennington County", "Caledonia County", "Chittenden County", "Essex County", "Franklin County", "Grand Isle County", "Lamoille County", "Orange County", "Orleans County", "Rutland County", "Washington County", "Windham County", "Windsor County"]

let theSpot;
let mapCenter;

let infoState = { guessNumber: 0, score: 20, zoomLevel: 18 }

function updateInfoState(statesToChange) {
    if (statesToChange.includes("Guess number")) {
        infoState.guessNumber++
    }
    if (statesToChange.includes("Score")) {
        infoState.score--
        updateScore();
    }
    if (statesToChange.includes("Reset")) {
        infoState.guessNumber = 0;
        infoState.zoomNumber = 0;
        infoState.score = 20;
        infoState.zoomLevel = 18;
    }
    if (statesToChange.includes("Zoom level")) {
        infoState.zoomLevel--
    }
}

function changeGameState(newGameState) {
    if (newGameState === "Playing game") {
        document.getElementById("start").disabled = true;
        document.getElementById("north").disabled = false;
        document.getElementById("south").disabled = false;
        document.getElementById("east").disabled = false;
        document.getElementById("west").disabled = false;
        document.getElementById("zoomOut").disabled = false;
        document.getElementById("guess").disabled = false;
        document.getElementById("quit").disabled = false;
    } else if (newGameState === "Not playing game") {
        document.getElementById("start").disabled = false;
        document.getElementById("north").disabled = true;
        document.getElementById("south").disabled = true;
        document.getElementById("east").disabled = true;
        document.getElementById("west").disabled = true;
        document.getElementById("zoomOut").disabled = true;
        document.getElementById("guess").disabled = true;
        document.getElementById("quit").disabled = true;
    } else {
        console.error("Not a valid game state.")
    }
}

function initialize() {
    if (localStorage.getItem('highscores')) {
        highscoreDiv = document.getElementById("highscore")
        let leaderboard = JSON.parse(localStorage.getItem('highscores'))
        highscoreDiv.textContent = "Highest Score: " + leaderboard[0].score + " - " + leaderboard[0].name
    }

    changeGameState("Not playing game")

    let map = L.map('map', { zoomControl: false }).setView([43.7886, -72.7317], 7);
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
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();

    // countyPolygon 
    L.geoJSON(county_data, { color: 'red' }).addTo(map)
    // borderPolygon 
    L.geoJSON(border_data, { color: 'green', fillColor: 'white' }).addTo(map)
}
function startGame() {
    closeDropdown()
    changeGameState("Playing game")

    updateInfoState("Reset")

    randomCoords();
    theSpot.fetchCounty()
    createMap(mapCenter.latitude, mapCenter.longitude, infoState.zoomLevel, theSpot.latitude, theSpot.longitude)
    document.getElementById("longitude").textContent = "Longitude: ?"
    document.getElementById("countySpan").textContent = "County: ?"
    document.getElementById("latitude").textContent = "Latitude: ?"
    updateScore()
    closeAlert()
}
function randomCoords() {

    theSpot = createRandomPoint();

    mapCenter = new PointInVermont(theSpot.latitude, theSpot.longitude)

    layer = L.geoJson(border_data);
    results = leafletPip.pointInLayer([theSpot.longitude, theSpot.latitude], layer);
    if (!results.length) {
        randomCoords();
    }
}
function updateScore() {
    if (infoState.score === 0) {
        closeDropdown()
        endGame()
        checkAlert = document.getElementById("alert")
        checkAlert.style = "display: inline-block; position: absolute; top: 100px; left: 250px; width: 350px;"
        checkAlert.innerHTML = "You lose! <br> Your score has reached 0.<br><button onclick='closeAlert()' id='guessAgain'>Close</button>"
        changeGameState("Not playing game")
    }
    document.getElementById("score").textContent = "Score: " + infoState.score;
}
function closeAlert() {
    alert = document.getElementById("alert")
    alert.style = "display: none;"
}
function addDropdown() {
    countyDropdown = document.getElementById("countyDropdown")
    countyDropdown.innerHTML = "<span id='dropTitle'>What County are we in?</span>"
    for (let county of countiesInVermont) {
        countyDropdown.innerHTML += `<a class='dropDownItems' onclick='guessCounty("${county}");'><div id='${county}'>${county}</div></a>`
    }
    countyDropdown.innerHTML += "<button id='countyCancelButton' onclick='closeDropdown()'>Close</button>"
}

function displayCounty(countyName) {
    document.getElementById("countySpan").textContent = "County: " + countyName
}
function extractCounty(fullAddress) {
    for (let county of countiesInVermont) {
        if (fullAddress.includes(county)) {
            return county;
        }
    }
    return null;
}
function correctGuess() {
    endGame()
    closeDropdown()
    rightGuessAlert = document.getElementById("alert")
    rightGuessAlert.style = "display: inline-block; position: absolute; top: 100px; left: 250px; width: 350px;"
    rightGuessAlert.innerHTML = "Correct! You win! <br> You scored " + infoState.score + " points!<br><label for='highscores'>Enter your initials, must be 3 characters:</label><input style='letter-spacing:5px;' id='initials' type='text' placeholder='---' /><br><button onclick='checkName()' id='guessAgain'>Submit</button>"

    changeGameState("Not playing game")
}
function checkName() {
    let name = document.getElementById('initials').value
    if (name.length === 3) {
        closeAlert();
        saveScore();
    }
}
function wrongGuess() {
    updateInfoState("Guess number")
    wrongGuessAlert = document.getElementById("alert")
    wrongGuessAlert.style = "display: inline-block; position: absolute; top: 400px; left: 250px; width: 350px;"
    wrongGuessAlert.innerHTML = "Guess " + infoState.guessNumber + ": Wrong guess, guess again! <br><button onclick='closeAlert()' id='guessAgain'>Close</button>"
    updateInfoState("Score")
}

function guessCounty(countyGuessed) {
    updateScore()
    if (theSpot.county === countyGuessed) {
        correctGuess()
    } else {
        wrongGuess()
    }
}

function endGame() {
    closeDropdown()
    document.getElementById("latitude").textContent = "Latitude: " + theSpot.latitude;
    document.getElementById("longitude").textContent = "Longitude: " + theSpot.longitude;
    displayCounty(theSpot.county)

    changeGameState("Not playing game")
}
function guess() {
    countyDropdown = document.getElementById("countyDropdown")
    countyDropdown.style = "border: 2px solid black; z-index:3; display: flex; flex-direction: column; position:absolute; top: 20px; left:250px; height: 380px; flex-wrap: wrap; background-color:white; width:450px;"
    addDropdown()
}
function closeDropdown() {
    countyDropdown = document.getElementById("countyDropdown")
    countyDropdown.style = "display:none;"
}
function zoomOut() {
    updateInfoState(["Zoom level", "Score"])
    if (infoState.zoomLevel === 15) {
        document.getElementById("zoomOut").disabled = true;
    }
    createMap(mapCenter.latitude, mapCenter.longitude, infoState.zoomLevel, theSpot.latitude, theSpot.longitude)
}
function north() {
    updateInfoState("Score")
    mapCenter.latitude = mapCenter.latitude + .005;
    createMap(mapCenter.latitude, mapCenter.longitude, infoState.zoomLevel, theSpot.latitude, theSpot.longitude)
}
function south() {
    updateInfoState("Score")
    mapCenter.latitude = mapCenter.latitude - .005;
    createMap(mapCenter.latitude, mapCenter.longitude, infoState.zoomLevel, theSpot.latitude, theSpot.longitude)
}
function east() {
    updateInfoState("Score")
    mapCenter.longitude = mapCenter.longitude + .007;
    createMap(mapCenter.latitude, mapCenter.longitude, infoState.zoomLevel, theSpot.latitude, theSpot.longitude)
}
function west() {
    updateInfoState("Score")
    mapCenter.longitude = mapCenter.longitude - .007;
    createMap(mapCenter.latitude, mapCenter.longitude, infoState.zoomLevel, theSpot.latitude, theSpot.longitude)
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
    //  countyPolygon
    L.geoJSON(county_data, { color: 'black', fillOpacity: '.01' }).addTo(map)
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    markerID = L.marker([originalLat, originalLong]).addTo(map);
}
function saveScore() {
    let userName = document.getElementById('initials').value
    let scoreObject = { 'name': userName, 'score': infoState.score.toString() }

    if (!localStorage.getItem('highscores')) {
        let scoresArray = []
        scoresArray.push(scoreObject)
        localStorage.setItem('highscores', JSON.stringify(scoresArray))

        highscoreDiv = document.getElementById('highscore')
        highscoreDiv.textContent = "Highest Score: " + scoreObject.score + " - " + scoreObject.name
    } else {
        let leaderboard = JSON.parse(localStorage.getItem('highscores'))

        leaderboard.push(scoreObject)

        let sortedLeaderboard = leaderboard.sort(function (a, b) {
            return Number(b.score) - Number(a.score);
        });

        localStorage.setItem('highscores', JSON.stringify(sortedLeaderboard))

        highscoreDiv = document.getElementById('highscore')
        highscoreDiv.textContent = "Highest Score: " + sortedLeaderboard[0].score + " - " + sortedLeaderboard[0].name
    }
}

function showLeaderboard() {

    countyDropdown = document.getElementById("countyDropdown")

    if (!localStorage.getItem('highscores')) {

        countyDropdown.style = "border: 2px solid black; z-index:3; display: block; position:absolute; top: 10px; left:250px; background-color:white; width:200px;"
        countyDropdown.innerHTML = "There are no high scores."
        countyDropdown.innerHTML += "<div id='leaderboardButtonWrapper'><button id='countyCancelButton' onclick='closeDropdown()'>Close</button><div>"

    } else {
        let leaderboard = JSON.parse(localStorage.getItem('highscores'))

        countyDropdown.style = "border: 2px solid black; z-index:3; display: block; position:absolute; top: 10px; left:250px; background-color:white; width:300px;"
        countyDropdown.innerHTML
            = "<h2>High Scores</h2><div id='highscoreTable'><table><thead><tr><th>Name</th><th>Score</th></tr></thead><tbody></tbody></table></div>"
        for (let game of leaderboard) {
            let tableBody = document.querySelector("#countyDropdown tbody")
            tableBody.innerHTML
                += "<tr><td>" + game.name + "</td><td>" + game.score + "</td></tr>";
        }
        countyDropdown.innerHTML += "<div id='leaderboardButtonWrapper'><button id='countyCancelButton' onclick='closeDropdown()'>Close</button><br><button id='clearScores' onclick='clearHighscoresPopup()'>Clear all scores</button><div>"
    }
}
function clearHighscoresPopup() {
    let alert = document.getElementById("alert");
    alert.innerHTML = "<h3>Are you sure you want to clear all the scores?</h3><br><button onclick='clearHighscores()'>Yes, OK</button><button onclick='closeAlert()'>No, cancel</button>"
    alert.style = "display: inline-block; position: absolute; top: 300px; left:100px; width: 500px;"
}

function clearHighscores() {
    localStorage.clear()
    closeAlert()

    countyDropdown = document.getElementById("countyDropdown")
    countyDropdown.innerHTML = "High scores cleared!"
    countyDropdown.innerHTML += "<div id='leaderboardButtonWrapper'><button id='countyCancelButton' onclick='closeDropdown()'>Close</button><div>"

    highscoreDiv = document.getElementById('highscore')
    highscoreDiv.innerHTML = "Highest Score: .."
}