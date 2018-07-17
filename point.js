function createRandomPoint() {
    let latitude = Math.random() * (2.267) + 42.7395;
    let longitude = Math.random() * (-1.8165) - 71.5489;

    return new PointInVermont(latitude, longitude)
}
class PointInVermont {
    constructor(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
    latLong() {
        return [this.latitude, this.longitude].join(',');
    }
    longLat() {
        return [this.longitude, this.latitude].join(',');
    }
    fetchCounty() {
        fetch("https://nominatim.openstreetmap.org/search.php?q=" + this.latLong() + "&format=json")
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log({data})
                this.fullAddress = data[0].display_name
                console.log("got county: "+this.fullAddress)
                if (checkCounty(this.fullAddress)) {
                    console.log("We are in a Vermont county!")
                } else {
                    console.log("Not a Vermont county")
                }
            })
    }
}