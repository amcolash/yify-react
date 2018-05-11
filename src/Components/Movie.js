import React, { Component, Fragment } from 'react';
import './Movie.css';

class Movie extends Component {
    render() {
        const { click, movie, downloadTorrent, cancelTorrent, getVersions, getProgress } = this.props;
        const versions = getVersions(movie);

        for (var i = 0; i < versions.length; i++) {
            versions[i].progress = getProgress(versions[i].infoHash);
        }

        return (
            <div className="movie">
                <div
                    className="cover"
                    style={{ backgroundImage: "url('" + movie.medium_cover_image + "')" }}
                    onClick={(e) => click(movie)}
                >
                    <div className="quality">
                        {versions.map(version => (
                            <Fragment
                                key={version.quality}
                            >
                                <span>{version.quality}</span>
                                {version.progress > 0 ? (
                                    <button className="red" onClick={(e) => {
                                        e.stopPropagation();
                                        e.nativeEvent.stopImmediatePropagation();
                                        cancelTorrent(version.infoHash);
                                    }}>✖</button>
                                ) : (
                                    <button className="orange download" onClick={(e) => {
                                        e.stopPropagation();
                                        e.nativeEvent.stopImmediatePropagation();
                                        downloadTorrent(version);
                                    }}>⭳</button>
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