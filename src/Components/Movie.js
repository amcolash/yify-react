import React, { Component, Fragment } from 'react';
import {
    FaDownload, FaTrash, FaFilm
} from 'react-icons/lib/fa';
import './Movie.css';
import Spinner from './Spinner';
import ScrollReveal from '../ScrollReveal';

class Movie extends Component {
    componentDidMount() {
        const config = {
            duration: 300,
            scale: 1.05,
            distance: '50px',
            easing: 'ease'
        }

        ScrollReveal.reveal(this.refs.movieCover, config);
    }

    render() {
        const { click, movie, downloadTorrent, cancelTorrent, getVersions, getProgress, started } = this.props;
        const versions = getVersions(movie);

        for (var i = 0; i < versions.length; i++) {
            versions[i].progress = getProgress(versions[i].infoHash);
        }

        return (
            <div className="movie" ref='movieCover'>
                <div
                    className="cover"
                    style={{ backgroundImage: "url('" + movie.medium_cover_image + "')" }}
                    onClick={(e) => click(movie)}
                >
                    <div className="movieIcon">
                        <FaFilm />
                    </div>
                    <div className="quality">
                        {versions.map(version => (
                            <Fragment
                                key={version.infoHash}
                            >
                                <span>{version.quality}</span>
                                {version.progress > 0 ? (
                                    <button className="red" onClick={(e) => {
                                        e.stopPropagation();
                                        e.nativeEvent.stopImmediatePropagation();
                                        cancelTorrent(version.infoHash);
                                    }}><FaTrash/></button>
                                ) : (
                                    <button className="orange download" onClick={(e) => {
                                        e.stopPropagation();
                                        e.nativeEvent.stopImmediatePropagation();
                                        downloadTorrent(version);
                                    }}>
                                        {started.indexOf(version.infoHash) !== -1 ? (
                                            <Spinner visible noMargin button />
                                        ) : (
                                            <FaDownload />
                                        )}
                                    </button>
                                )}
                                <br/>
                            </Fragment>
                        ))}
                    </div>
                </div>
                <span onClick={(e) => click(movie)}>{movie.title} ({movie.year})</span>
            </div>
        );
    }
}

export default Movie;