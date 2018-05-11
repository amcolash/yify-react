import React, { Component } from 'react';

import './Details.css';
import Progress from './Progress';

class Details extends Component {

    getVersions(movie) {
        var versions = [];

        for (var i = 0; i < movie.torrents.length; i++) {
            const torrent = movie.torrents[i];
            versions.push({
                quality: torrent.quality,
                peers: torrent.peers.toFixed(0),
                seeds: torrent.seeds.toFixed(0),
                ratio: (torrent.peers / torrent.seeds).toFixed(3),
                url: torrent.url,
                infoHash: torrent.hash.toLowerCase(),
                size: torrent.size
            });
        }

        return versions;
    }

    getTorrent(infoHash) {
        const { torrents } = this.props;
        for (var i = 0; i < torrents.length; i++) {
            const torrent = torrents[i];
            if (torrent.infoHash === infoHash) return torrent;
        }

        return null;
    }

    getProgress(infoHash) {
        const torrent = this.getTorrent(infoHash);
        return torrent !== null ? torrent.progress[0] + 0.001 : null;
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
                    <a href={"https://www.imdb.com/title/" + movie.imdb_code} target="_blank">IMDB Rating</a><span>: {movie.rating} / 10</span>
                    <hr/>
                    {versions.map(version => (
                        version.peers > 0 ? (
                            <div className="version" key={version.url}>
                            <b>{version.quality}</b>
                            {this.getProgress(version.infoHash) ? null : (
                                <button className="orange download" onClick={() => downloadTorrent(version)}>⭳</button>
                            )}
                            <span> {version.size}, (Peers: {version.peers}, Seeds: {version.seeds}, Ratio: {version.ratio})</span>
                            <br/>
                            {this.getProgress(version.infoHash) ? (
                                <Progress
                                    torrent={this.getTorrent(version.infoHash)}
                                    openLink={openLink}
                                    cancelTorrent={cancelTorrent}
                                />
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