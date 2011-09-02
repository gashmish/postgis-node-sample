var pg = require('pg');
var postgres = new pg.Client('tcp://gis:123456@127.0.0.1/gisdb');
postgres.connect();

var http = require('http').createServer();
var io = require('socket.io').listen(http);
http.listen('8088');

String.prototype.format = function() {
    var s = this,
        i = arguments.length;
    
    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

io.sockets.on('connection', function (socket) {

    socket.on('getHoles', function (data) {
        postgres.query("SELECT ST_AsGeoJSON(hole) FROM holes;", function (err, result) {
            if (err) {
                console.log(err);
            } else {
                var holes = [];
                result.rows.forEach(function(row) {
                    var point  = JSON.parse(row.st_asgeojson);
                    holes.push({
                        lat: point.coordinates[0],
                        lon: point.coordinates[1]
                    });
                });
                socket.emit('holes', { holes : holes });
            }
        });
    });

    socket.on('addHole', function (data) {
        postgres.query(
            "INSERT INTO holes(hole) VALUES(ST_GeographyFromText('SRID=4326;POINT({0} {1})'));"
            .format(
                data.hole.lat,
                data.hole.lon));
    });

    socket.on('removeHole', function (data) {
        postgres.query(
            "DELETE FROM holes WHERE hole = ST_GeographyFromText('SRID=4326;POINT({0} {1})');"
            .format(
                data.hole.lat,
                data.hole.lon));
    });
});
