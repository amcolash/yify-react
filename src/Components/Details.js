import React, { Component, Fragment } from 'react';
import {
    FaDownload, FaCircle, FaPlayCircle
} from 'react-icons/lib/fa';

import './Details.css';
import Progress from './Progress';

class Details extends Component {

    convertTime(min) {
        const hours = Math.floor(min / 60);
        const minutes = Math.floor(((min / 60) - hours) * 60);
        
        return (hours > 0 ? hours + "h " : "") + (minutes > 0 ? minutes + "m" : "");
    }
s
    render() {
        const { movie, downloadTorrent, cancelTorrent, openLink, getVersions, getTorrent, getProgress } = this.props;

        var versions = getVersions(movie);

        var hasPeers = false;
        for (var i = 0; i < versions.length; i++) {
            if (versions[i].peers > 0) hasPeers = true;
        }

        return (
            <div className="container">
                <div className="left">
                    <img src={movie.medium_cover_image} alt={movie.title}/>
                    {movie.yt_trailer_code ? (
                        <Fragment>
                            <br/>
                            <a href={'https://www.youtube.com/watch?v=' + movie.yt_trailer_code} target="_blank"><FaPlayCircle />Trailer</a>
                        </Fragment>
                    ) : null}
                </div>
                <div className="right">
                    <h3>
                        <span className={hasPeers ? "status green" : "status red"}><FaCircle/></span>
                        {movie.title}
                    </h3>
                    <h4>
                        {movie.year}, {this.convertTime(movie.runtime)}
                        <div className="mpaa-rating">{movie.mpa_rating ? movie.mpa_rating : "NR"}</div>
                    </h4>
                    <p>{movie.summary}</p>
                    <span>{JSON.stringify(movie.genres).replace(/[[\]"]/g, '').replace(/,/g, ', ')}</span>
                    <br/>
                    <a href={"https://www.imdb.com/title/" + movie.imdb_code} target="_blank">IMDB Rating</a><span>: {movie.rating} / 10</span>
                    <hr/>
                    {versions.map(version => (
                        <div className="version" key={version.url}>
                            <b>{version.quality}</b>
                            {getProgress(version.infoHash) ? null : (
                                <button className="orange download" onClick={() => downloadTorrent(version)}><FaDownload/></button>
                            )}
                            <span> {version.size}, (Peers: {version.peers}, Seeds: {version.seeds}, Ratio: {version.ratio})</span>
                            <br/>
                            {getProgress(version.infoHash) ? (
                                <Progress
                                    torrent={getTorrent(version.infoHash)}
                                    openLink={openLink}
                                    cancelTorrent={cancelTorrent}
                                    fullName={true}
                                />
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default Details;