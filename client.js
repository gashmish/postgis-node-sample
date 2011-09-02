var map;
var socket;

function start() {
    initMap();
    initConnection();
}

function initMap() {
    var palaceSquare = new google.maps.LatLng(59.939, 30.315);

    var mapOptions = {
        zoom: 15,
        center: palaceSquare,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(
        document.getElementById("map_canvas"),
        mapOptions);

    google.maps.event.addListener(map, "click", function(event) {
        var hole = {
            lat: event.latLng.Pa,
            lon: event.latLng.Qa
        };
        socket.emit('addHole', { hole: hole });
        addMarker(event.latLng);
    });
}

function initConnection() {
    socket = io.connect('127.0.0.1:8088');

    socket.on('holes', function (data) {
        data.holes.forEach(function(hole) {
            var position = new google.maps.LatLng(
                hole.lat, hole.lon);

            addMarker(position);
        });
    });

    socket.emit('getHoles');
}

function addMarker(position) {
    console.log("Hole placed: " + position);

    var marker = new google.maps.Marker({
        position : position,
        icon : 'hole.png',
        map : map
    });

    google.maps.event.addListener(marker, 'click', function() {
        var postition = marker.getPosition();
        var hole = {
            lat: postition.Pa,
            lon: postition.Qa
        };
        socket.emit('removeHole', { hole : hole });
        removeMarker(marker);
    });
}

function removeMarker(marker) {
    console.log("Hole removed: " + marker.getPosition());
    marker.setMap(null);
}

