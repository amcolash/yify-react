import React, { Component, } from 'react';
import './Details.css';

class Details extends Component {
    render() {
        const movie = this.props.movie;

        var hasPeers = false;
        var versions = [];
        for (var i = 0; i < movie.torrents.length; i++) {
            var torrent = movie.torrents[i];
            if (torrent.peers > 0) hasPeers = true;
            versions[i] = {
                quality: torrent.quality,
                peers: torrent.peers.toFixed(0),
                ratio: (torrent.peers / torrent.seeds).toFixed(3),
                url: torrent.url
            }
        }

        return (
            <div className="container">
                <img src={movie.medium_cover_image} alt={movie.title}/>
                <div className="data">
                    <h3>{movie.title} ({movie.year}) <span className={hasPeers ? "status green" : "status red"}>●</span></h3>
                    <p>{movie.summary}</p>
                    <span>{JSON.stringify(movie.genres).replace(/[[\]"]/g, '').replace(/,/g, ', ')}</span>
                    <br/>
                    <span>IMDB Rating: {movie.rating} / 10</span>
                    <hr/>
                    {versions.map(version => (
                        version.peers > 0 ? (
                            <div className="version" key={version.url}>
                            <a href={version.url}><b>{version.quality} ►</b></a>
                            <span> (Peers: {version.peers}, Ratio: {version.ratio})</span>
                        </div>
                        ) : null
                    ))}

                    <div className="mpaa-rating">{movie.mpa_rating ? movie.mpa_rating : "NR"}</div>
                </div>
            </div>
        );
    }
}

export default Details;