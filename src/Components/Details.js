import React, { Component, Fragment } from 'react';

import './Details.css';

class Details extends Component {

    getVersions(movie) {
        var versions = [];

        if (movie) {
            for (var i = 0; i < movie.torrents.length; i++) {
                var torrent = movie.torrents[i];
                versions.push({
                    quality: torrent.quality,
                    peers: torrent.peers.toFixed(0),
                    ratio: (torrent.peers / torrent.seeds).toFixed(3),
                    url: torrent.url,
                    infoHash: torrent.hash.toLowerCase(),
                });
            }
        }

        return versions;
    }

    getProgress(infoHash) {
        const { torrents } = this.props;

        for (var i = 0; i < torrents.length; i++) {
            const torrent = torrents[i];
            if (torrent.infoHash === infoHash) return torrent.progress[0] + 0.0001;
        }

        return null;
    }

    render() {
        const { movie, downloadTorrent, cancelTorrent, openLink } = this.props;

        var versions = this.getVersions(movie);
        var hasPeers = false;
        for (var i = 0; i < versions.length; i++) {
            if (versions[i].peers > 0) hasPeers = true;
        }


        return (
            <div className="container">
                <img src={movie.medium_cover_image} alt={movie.title}/>
                <div className="data">
                    <h3>
                        <span className={hasPeers ? "status green" : "status red"}>●</span>
                        {movie.title} ({movie.year})
                        <div className="mpaa-rating">{movie.mpa_rating ? movie.mpa_rating : "NR"}</div>
                    </h3>
                    <p>{movie.summary}</p>
                    <span>{JSON.stringify(movie.genres).replace(/[[\]"]/g, '').replace(/,/g, ', ')}</span>
                    <br/>
                    <span>IMDB Rating: {movie.rating} / 10</span>
                    <hr/>
                    {versions.map(version => (
                        version.peers > 0 ? (
                            <div className="version" key={version.url}>
                            <b>{version.quality}</b>
                            {this.getProgress(version.infoHash) ? null : 
                                <button onClick={() => downloadTorrent(version)}>⭳</button>
                            }
                            <span> (Peers: {version.peers}, Ratio: {version.ratio})</span>
                            <br/>
                            {this.getProgress(version.infoHash) ? (
                                <Fragment>
                                    <progress value={this.getProgress(version.infoHash)} max="100"></progress>
                                    <button onClick={() => openLink(version.infoHash)}>►</button>
                                    <button onClick={() => cancelTorrent(version.infoHash)}>X</button>
                                </Fragment>
                            ) : null}
                        </div>
                        ) : null
                    ))}
                </div>
            </div>
        );
    }
}

export default Details;