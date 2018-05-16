import React, { Component } from 'react';
import {
    FaTrash, FaPlay, FaExclamationCircle
} from 'react-icons/lib/fa';

class Progress extends Component {
    
    render() {
        const { torrent, openLink, cancelTorrent, fullName } = this.props;
        const name = (fullName || torrent.name.indexOf(")") === -1) ? torrent.name : torrent.name.substring(0, torrent.name.indexOf(")") + 1);
        const speed = torrent.stats ? (torrent.stats.speed.down / 1000000).toFixed(2) : null;
        const progress = torrent.progress[0].toFixed(0);

        return (
            <div className="progress">
                <span>{name}</span>
                <progress value={progress > 1 ? progress : null } max="100" />
                <span>{progress}% </span>
                {torrent.stats && progress < 100 ? (
                    <span className={speed > 0.25 ? "green" : speed > 0.125 ? "orange" : "red"}>
                        {speed < 0.15 ? (
                            <FaExclamationCircle
                                style={{ paddingRight: "0.25em" }}
                            />
                        ) : null}
                        [{speed} MB/s]
                    </span>
                ) : null}
                <button className="green" onClick={() => openLink(torrent.infoHash)}><FaPlay/></button>
                <button className="red" onClick={() => cancelTorrent(torrent.infoHash)}><FaTrash/></button>
            </div>
        );
    }    
}

export default Progress;