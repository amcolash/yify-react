import React, { Component } from 'react';
import {
    FaTrash, FaPlay, FaExclamationCircle
} from 'react-icons/lib/fa';

class Progress extends Component {
    
    render() {
        const { torrent, openLink, cancelTorrent, fullName } = this.props;
        const name = fullName ? torrent.name : torrent.name.substring(0, torrent.name.indexOf(")") + 1);
        const speed = torrent.stats ? (torrent.stats.speed.down / 1000000).toFixed(2) : null;

        return (
            <div className="progress">
                <span>{name}</span>
                <progress value={torrent.progress[0] > 1 ? torrent.progress[0] : null } max="100" />
                <span>{torrent.progress[0].toFixed(0)}% </span>
                {torrent.stats ? (
                    <span className={speed > 0.25 ? "green" : speed > 0.125 ? "orange" : "red"}>
                        {speed < 0.15 ? (
                            <FaExclamationCircle/>
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