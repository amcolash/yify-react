'use strict';

var rangeParser = require('range-parser'),
    pump = require('pump'),
    _ = require('lodash'),
    express = require('express'),
    multipart = require('connect-multiparty'),
    fs = require('fs'),
    store = require('./store'),
    progress = require('./progressbar'),
    stats = require('./stats'),
    http = require('http'),
    api = express(),
    { exec } = require('child_process');

api.use(express.json());
api.use(express.logger('dev'));
api.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

function serialize(torrent) {
    if (!torrent.torrent) {
        return { infoHash: torrent.infoHash };
    }
    var pieceLength = torrent.torrent.pieceLength;

    return {
        infoHash: torrent.infoHash,
        name: torrent.torrent.name,
        interested: torrent.amInterested,
        ready: torrent.ready,
        halted: torrent.halted || false,
        stats: stats(torrent),
        files: torrent.files.map(function (f) {
            // jshint -W016
            var start = f.offset / pieceLength | 0;
            var end = (f.offset + f.length - 1) / pieceLength | 0;

            return {
                name: f.name,
                path: f.path,
                link: '/torrents/' + torrent.infoHash + '/files/' + encodeURIComponent(f.path),
                length: f.length,
                offset: f.offset,
                selected: torrent.selection.some(function (s) {
                    return s.from <= start && s.to >= end;
                })
            };
        }),
        progress: progress(torrent.bitfield.buffer)
    };
}

function findTorrent(req, res, next) {
    var torrent = req.torrent = store.get(req.params.infoHash);
    if (!torrent) {
        return res.send(404);
    }
    next();
}

function start(req) {
    var index = parseInt(req.params.index);
    if (index >= 0 && index < req.torrent.files.length) {
        req.torrent.files[index].select();
    } else {
        req.torrent.files.forEach(function (f) {
            f.select();
        });
    }
}

function stop(req) {
    var index = parseInt(req.params.index);
    if (index >= 0 && index < req.torrent.files.length) {
        req.torrent.files[index].deselect();
    } else {
        req.torrent.files.forEach(function (f) {
            f.deselect();
        });
    }
}

function moveTorrent(torrent, res) {
    torrent.halted = true;

    let largestSize = 0;
    let largest;

    torrent.files.map(function (f) {
        if (f.length > largestSize) {
            largestSize = f.length;
            largest = f;
        }
    });

    let basePath = '/tmp/peerflix-symlinks';

    try {
        fs.mkdirSync(basePath);
    } catch (err) {
        // No worries, we don't need to do anything
    }

    let torrentPath = '/tmp/torrent-stream/' + torrent.infoHash + '/' + largest.path;
    let linkPath = basePath + '/' + largest.name;

    try {
        fs.unlinkSync(linkPath);
    } catch (err) {
        // No worries, we don't need to do anything
    }

    // Grumble grumble, the docker image used has node 6, so no copyFile...
    // Just going to use native filesystem copy instead
    exec('cp "' + torrentPath + '" "' + linkPath + '"', function (err, output) {
        if (err) {
            torrent.halted = false; // hmmm, maybe this will retry things?
            console.error(err)

            if (res) res.send(err);
        } else {
            store.remove(torrent.infoHash);
            
            if (res) res.send(200);
        }
    });
}

function autoPrune() {
    const torrents = store.list().map(serialize);
    for (var i = 0; i < torrents.length; i++) {
        const torrent = torrents[i];
        if (torrent.files && torrent.files.length <= 5 && torrent.progress && torrent.progress[0] > 99.9 && !torrent.halted) {
            moveTorrent(torrent);
        }
    }
}

// Autoprune every hour
setInterval(autoPrune, 60 * 60 * 1000);

api.get('/ip', function(req, res) {
    http.get('http://ipinfo.io/ip', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            res.send(data);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
        res.send("unknown");
    });
});

api.get('/storage', function(req, res) {
    exec("df -h /tmp/torrent-stream | grep -v 'Use%' | awk '{ print $5 }'", function (err, output) {
        // Returned should be "xx%", replace with drive you care about above, clean up output too
        res.send({used: output.replace("%", "").trim()});
    });
});

api.get('/torrents', function (req, res) {
    res.send(store.list().map(serialize));
});

api.post('/torrents', function (req, res) {
    store.add(req.body.link, function (err, infoHash) {
        if (err) {
            console.error(err);
            res.send(500, err);
        } else {
            res.send({ infoHash: infoHash });
        }
    });
});

api.post('/upload', multipart(), function (req, res) {
    var file = req.files && req.files.file;
    if (!file) {
        return res.send(500, 'file is missing');
    }
    store.add(file.path, function (err, infoHash) {
        if (err) {
            console.error(err);
            res.send(500, err);
        } else {
            res.send({ infoHash: infoHash });
        }
        fs.unlink(file.path);
    });
});

api.get('/torrents/:infoHash', findTorrent, function (req, res) {
    res.send(serialize(req.torrent));
});

api.post('/torrents/:infoHash/start/:index?', findTorrent, function (req, res) {
    start(req);
    res.send(200);
});

api.post('/torrents/:infoHash/stop/:index?', findTorrent, function (req, res) {
    stop(req);
    res.send(200);
});

api.post('/torrents/:infoHash/halt', findTorrent, function (req, res) {
    const torrent = req.torrent;
    const swarm = torrent.swarm;

    stop(req);
    swarm.pause();

    Object.keys(swarm._peers).forEach(function (addr) {
        swarm._remove(addr);
    });

    swarm.wires.forEach(function (wire) {
        wire.destroy();
    });
    
    torrent.halted = true;

    res.send(200);
});

api.post('/torrents/:infoHash/move', findTorrent, function (req, res) {
    moveTorrent(req.torrent, res);
});

api.post('/torrents/:infoHash/pause', findTorrent, function (req, res) {
    req.torrent.swarm.pause();
    res.send(200);
});

api.post('/torrents/:infoHash/resume', findTorrent, function (req, res) {
    req.torrent.swarm.resume();
    res.send(200);
});

api.delete('/torrents/:infoHash', findTorrent, function (req, res) {
    store.remove(req.torrent.infoHash);
    res.send(200);
});

api.get('/torrents/:infoHash/stats', findTorrent, function (req, res) {
    res.send(stats(req.torrent));
});

api.get('/torrents/:infoHash/files', findTorrent, function (req, res) {
    var torrent = req.torrent;
    res.setHeader('Content-Type', 'application/x-mpegurl; charset=utf-8');
    res.send('#EXTM3U\n' + torrent.files.map(function (f) {
        return '#EXTINF:-1,' + f.path + '\n' +
            req.protocol + '://' + req.get('host') + '/torrents/' + torrent.infoHash + '/files/' + encodeURIComponent(f.path);
    }).join('\n'));
});

api.all('/torrents/:infoHash/files/:path([^"]+)', findTorrent, function (req, res) {
    var torrent = req.torrent, file = _.find(torrent.files, { path: req.params.path });

    if (!file) {
        return res.send(404);
    }

    if (typeof req.query.ffmpeg !== 'undefined') {
        return require('./ffmpeg')(req, res, torrent, file);
    }

    var range = req.headers.range;
    range = range && rangeParser(file.length, range)[0];
    res.setHeader('Accept-Ranges', 'bytes');
    res.type(file.name);
    req.connection.setTimeout(3600000);

    if (!range) {
        res.setHeader('Content-Length', file.length);
        if (req.method === 'HEAD') {
            return res.end();
        }
        return pump(file.createReadStream(), res);
    }

    res.statusCode = 206;
    res.setHeader('Content-Length', range.end - range.start + 1);
    res.setHeader('Content-Range', 'bytes ' + range.start + '-' + range.end + '/' + file.length);

    if (req.method === 'HEAD') {
        return res.end();
    }
    pump(file.createReadStream(range), res);
});

module.exports = api;
