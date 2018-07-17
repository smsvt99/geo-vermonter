let theSpot = new PointInVermont();
let mapCenter = new PointInVermont();

let zoomLevel;
let realCounty;
let score;
let guessNumber = 0;
let zoomNumber = 0;
let highestScore;

function initialize() {
    if (localStorage.getItem('highscores')) {
        highscoreDiv = document.getElementById("highscore")
        let leaderboard = JSON.parse(localStorage.getItem('highscores'))
        highscoreDiv.textContent = "Highest Score: " + leaderboard[0].score + " - " + leaderboard[0].name
    }

    document.getElementById("guess").disabled = true;
    document.getElementById("quit").disabled = true;
    document.getElementById("zoomOut").disabled = true;
    document.getElementById("north").disabled = true;
    document.getElementById("south").disabled = true;
    document.getElementById("east").disabled = true;
    document.getElementById("west").disabled = true;

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

    let countyPolygon = L.geoJSON(county_data, { color: 'red' }).addTo(map)
    let borderPolygon = L.geoJSON(border_data, { color: 'green', fillColor: 'white' }).addTo(map)
}
function startGame() {
    cancel()
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
    zoomNumber = 0
    randomCoords();
    createMap(mapCenter.latitude, mapCenter.longitude, zoomLevel, theSpot.latitude, theSpot.longitude)
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
    // early fetch for console cheat
    fetch("https://nominatim.openstreetmap.org/search.php?q=" + theSpot.latLong() + "&format=json")
        .then(function (response) {
            return response.json();
        })
        .then(function (myJSON) {
            realCounty = myJSON[0].display_name
        })
}
function checkScore() {
    if (score === 0) {
        updateScore()
        cancel()
        document.getElementById("latitude").textContent = "Latitude: " + theSpot.latitude;
        document.getElementById("longitude").textContent = "Longitude: " + theSpot.longitude;
        checkCountyOnQuit()
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
        // document.getElementById("countyGuessButton").disabled = true;
        // document.getElementById("countyCancelButton").disabled = true;
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
    countyDropdown.innerHTML = "<span id='dropTitle'>What County are we in?</span>"
    for (i = 0; i < countyArray.length; i++) {
        countyDropdown.innerHTML += `<a class='dropDownItems' onclick='countyGuess("${countyArray[i]}");'><div id='${countyArray[i]}'>${countyArray[i]}</div></a>`
    }
    countyDropdown.innerHTML += "<button id='countyCancelButton' onclick='cancel()'>Close</button>"
}
function checkCountyOnQuit() {
    countyArray = ["Addison County", "Bennington County", "Caledonia County", "Chittenden County", "Essex County", "Franklin County", "Grand Isle County", "Lamoille County", "Orange County", "Orleans County", "Rutland County", "Washington County", "Windham County", "Windsor County"]
    fetch("https://nominatim.openstreetmap.org/search.php?q=" + theSpot.latLong() + "&format=json")
        .then(function (response) {
            return response.json();
        })
        .then(function (myJSON) {
            realCounty = myJSON[0].display_name
            for (let i = 0; i < countyArray.length; i++) {
                if (realCounty.includes(countyArray[i])) {
                    document.getElementById("countySpan").innerHTML = "County: " + countyArray[i]
                }
            }
        })
}
function countyGuess(countyName) {
    checkScore()
    fetch("https://nominatim.openstreetmap.org/search.php?q=" + theSpot.latLong() + "&format=json")
        .then(function (response) {
            return response.json();
        })
        .then(function (myJSON) {
            realCounty = myJSON[0].display_name
            if (realCounty.includes(countyName)) { // if you win

                document.getElementById("countySpan").innerHTML = "County: " + countyName
                cancel()
                rightGuessAlert = document.getElementById("alert")
                rightGuessAlert.style = "display: inline-block; position: relative; top: -300px; right: 290px;"
                rightGuessAlert.innerHTML = "Correct! You win! <br> You scored " + score + " points!<br><label for='highscores'>Enter your initials.</label><input id='initials' type='text'/><br><button onclick='closeAlert(); saveScore();' id='guessAgain'>Submit</button>"

                document.getElementById("latitude").textContent = "Latitude: " + theSpot.latitude;
                document.getElementById("longitude").textContent = "Longitude: " + theSpot.longitude;

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
                    wrongGuessAlert.style = "display: inline-block; position: relative; top: -20px;"
                    wrongGuessAlert.innerHTML = "Guess " + guessNumber + ": Wrong guess, guess again! <br><button onclick='closeAlert()' id='guessAgain'>Close</button>"
                }
            }

        })
}
function quit() {
    cancel()
    document.getElementById("latitude").textContent = "Latitude: " + theSpot.latitude;
    document.getElementById("longitude").textContent = "Longitude: " + theSpot.longitude;
    document.getElementById("countySpan").textContent = "?"

    document.getElementById("guess").disabled = true;
    document.getElementById("quit").disabled = true;
    document.getElementById("start").disabled = false;
    document.getElementById("north").disabled = true;
    document.getElementById("south").disabled = true;
    document.getElementById("east").disabled = true;
    document.getElementById("west").disabled = true;
    document.getElementById("zoomOut").disabled = true;
    checkCountyOnQuit();
}
function guess() {
    countyDropdown = document.getElementById("countyDropdown")
    countyDropdown.style = "border: 2px solid black; z-index:3; display: flex; flex-direction: column; position:absolute; top:-10px; right:370px; height: 380px; flex-wrap: wrap; background-color:white; width:450px;"
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
    createMap(mapCenter.latitude, mapCenter.longitude, zoomLevel, theSpot.latitude, theSpot.longitude)
}
function north() {
    score--
    checkScore();
    updateScore()
    mapCenter.latitude = mapCenter.latitude + .005;
    createMap(mapCenter.latitude, mapCenter.longitude, zoomLevel, theSpot.latitude, theSpot.longitude)
}
function south() {
    score--
    checkScore();
    updateScore()
    mapCenter.latitude = mapCenter.latitude - .005;
    createMap(mapCenter.latitude, mapCenter.longitude, zoomLevel, theSpot.latitude, theSpot.longitude)
}
function east() {
    score--
    checkScore();
    updateScore()
    mapCenter.longitude = mapCenter.longitude + .007;
    createMap(mapCenter.latitude, mapCenter.longitude, zoomLevel, theSpot.latitude, theSpot.longitude)
}
function west() {
    score--
    checkScore();
    updateScore()
    mapCenter.longitude = mapCenter.longitude - .007;
    createMap(mapCenter.latitude, mapCenter.longitude, zoomLevel, theSpot.latitude, theSpot.longitude)
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
function saveScore() {

    let userName = document.getElementById('initials').value

    let scoreObject = { 'name': userName, 'score': score.toString() }


    if (!localStorage.getItem('highscores')) {
        let scoresArray = []
        scoresArray.push(scoreObject)
        localStorage.setItem('highscores', JSON.stringify(scoresArray))

        highscoreDiv = document.getElementById('highscore')
        highscoreDiv.innerHTML = "Highest Score: " + scoreObject.score + " - " + scoreObject.name
    } else {
        console.log("IM HERE")
        let leaderboard = JSON.parse(localStorage.getItem('highscores'))
        console.log('leaderboard before adding scoreObject:');
        console.log(leaderboard)

        leaderboard.push(scoreObject)

        console.log('leaderboard:', leaderboard);

        let sortedLeaderboard = leaderboard.sort(function (a, b) {
            return Number(b.score) - Number(a.score);
        });

        console.log('sortedLeaderboard:', sortedLeaderboard);

        localStorage.setItem('highscores', JSON.stringify(sortedLeaderboard))
        console.log(localStorage)

        highscoreDiv = document.getElementById('highscore')
        highscoreDiv.innerHTML = "Highest Score: " + sortedLeaderboard[0].score + " - " + sortedLeaderboard[0].name

    }
}

function showLeaderboard() {

    if (!localStorage.getItem('highscores')) {

        countyDropdown = document.getElementById("countyDropdown")
        countyDropdown.style = "border: 2px solid black; z-index:3; display: block; position:absolute; top:-100px; right:370px; background-color:white; width:auto;"
        countyDropdown.innerHTML = "There are no high scores."
        countyDropdown.innerHTML += "<div id='leaderboardButtonWrapper'><button id='countyCancelButton' onclick='cancel()'>Close</button><div>"

    } else {
        let leaderboard = JSON.parse(localStorage.getItem('highscores'))

        countyDropdown = document.getElementById("countyDropdown")

        countyDropdown.style = "border: 2px solid black; z-index:3; display: block; position:absolute; top:-100px; right:370px; background-color:white; width:auto;"
        countyDropdown.innerHTML
            = "<h2>High Scores</h2><div id='highscoreTable'><table><thead><tr><th>Name</th><th>Score</th></tr></thead><tbody></tbody></table></div>"
        for (i = 0; i < leaderboard.length; i++) {
            let tableBody = document.querySelector("#countyDropdown tbody")
            tableBody.innerHTML
                += "<tr><td>" + leaderboard[i].name + "</td><td>" + leaderboard[i].score + "</td></tr>";
        }
        countyDropdown.innerHTML += "<div id='leaderboardButtonWrapper'><button id='countyCancelButton' onclick='cancel()'>Close</button><br><button id='clearScores' onclick='clearHighscoresPopup()'>Clear all scores</button><div>"
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
    countyDropdown.innerHTML += "<div id='leaderboardButtonWrapper'><button id='countyCancelButton' onclick='cancel()'>Close</button><div>"

    highscoreDiv = document.getElementById('highscore')
    highscoreDiv.innerHTML = "Highest Score: .."
}