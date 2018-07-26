import React, { Component, Fragment } from 'react';
import {
    FaDownload, FaCircle, FaPlayCircle
} from 'react-icons/lib/fa';
import axios from 'axios';

import keys from '../keys';
import './Details.css';
import Progress from './Progress';
import Spinner from './Spinner';

class Details extends Component {

    constructor(props) {
        super(props);
        this.state = { moreData: null, showCover: true };
    }

    componentDidMount() {
        axios.get('http://www.omdbapi.com/?apikey=' + keys.omdb + '&i=' + this.props.movie.imdb_code, { timeout: 10000 }).then(response => {
            this.setState({ moreData: response.data });
        }, error => {
            console.error(error);
            this.setState({ moreData: "ERROR" });
        });
    }

    convertTime(min) {
        const hours = Math.floor(min / 60);
        const minutes = Math.floor(((min / 60) - hours) * 60);
        
        return (hours > 0 ? hours + "h " : "") + (minutes > 0 ? minutes + "m" : "");
    }

    imageError() {
        this.setState({ showCover: false });
    }

    render() {
        const { movie, downloadTorrent, cancelTorrent, getLink, getVersions, getTorrent, getProgress, started } = this.props;
        const { moreData, showCover } = this.state;

        var versions = getVersions(movie);

        var hasPeers = false;
        for (var i = 0; i < versions.length; i++) {
            if (versions[i].peers > 0) hasPeers = true;
        }

        return (
            <div className="container">
                {showCover ? (
                    <div className="left">
                        <img
                            src={movie.medium_cover_image}
                            alt={movie.title}
                            onError={this.imageError.bind(this)}
                        />
                    </div>
                ) : null }
                <div className="right">
                    <h3>
                        <span className={hasPeers ? "status green" : "status red"}><FaCircle/></span>
                        {movie.title}
                    </h3>
                    <h4>
                        {movie.year}, {this.convertTime(movie.runtime)}
                        <div className="mpaa-rating">{movie.mpa_rating ? movie.mpa_rating : "NR"}</div>
                    </h4>
                    {movie.yt_trailer_code ? (
                        <a href={'https://www.youtube.com/watch?v=' + movie.yt_trailer_code} target="_blank"><FaPlayCircle />Trailer</a>
                    ) : null}
                    <p>{movie.summary}</p>
                    {movie.genres ? (
                        <Fragment>
                            <span>
                                {
                                    (movie.genres.length === 1 ? "Genre: " : "Genres: ") +
                                    JSON.stringify(movie.genres).replace(/[[\]"]/g, '').replace(/,/g, ', ')
                                }
                            </span>
                            <br/>
                            <br/>
                        </Fragment>
                    ) : null}
                    <a href={"https://www.imdb.com/title/" + movie.imdb_code} target="_blank">IMDB Rating</a><span>: {movie.rating} / 10</span>
                    
                    {moreData !== "ERROR" && moreData !== null && !moreData.Error ? (
                        <Fragment>
                            <br/>
                            {moreData.Ratings.map(rating => (
                                <Fragment key={rating.Source}>
                                    {rating.Source !== "Internet Movie Database" ? (
                                        <Fragment>
                                            <span>{rating.Source}: {rating.Value}</span>
                                            <br />
                                        </Fragment>
                                    ) : null}
                                </Fragment>
                            ))}
                            <hr/>
                            <span>{moreData.Director.indexOf(",") !== -1 ? "Directors" : "Director"}: {moreData.Director}</span>
                            <br/>
                            <span>{moreData.Writer.indexOf(",") !== -1 ? "Writers" : "Writer"}: {moreData.Writer}</span>
                            <br/>
                            <span>Actors: {moreData.Actors}</span>
                        </Fragment>
                    ) : (
                        <Fragment>
                            {moreData === "ERROR" || (moreData !== null && moreData.Error) ? (
                                null
                            ) : (
                                <Fragment>
                                    <hr/>
                                    <span>
                                        Loading additional data...
                                        <Spinner visible/>
                                    </span>
                                </Fragment>
                            )}
                        </Fragment>
                    )}

                    <hr/>

                    {versions.map(version => (
                        <div className="version" key={version.url}>
                            <b>{version.quality}</b>
                            {getProgress(version.infoHash) ? null : (
                                <button className="orange download" onClick={() => downloadTorrent(version)}>
                                    {started.indexOf(version.infoHash) !== -1 ? (
                                        <Spinner visible noMargin button />
                                    ) : (
                                        <FaDownload/>
                                    )}
                                </button>
                            )}
                            <span> {version.size}, (Peers: {version.peers}, Seeds: {version.seeds}, Ratio: {version.ratio})</span>
                            <br/>
                            {getProgress(version.infoHash) ? (
                                <Progress
                                    torrent={getTorrent(version.infoHash)}
                                    getLink={getLink}
                                    cancelTorrent={cancelTorrent}
                                    fullName
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