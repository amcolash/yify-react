import React, { Component } from 'react';
import {
    FaTrash, FaPlay
} from 'react-icons/lib/fa';

class Progress extends Component {
    render() {
        const { torrent, openLink, cancelTorrent, fullName } = this.props;

        const name = fullName ? torrent.name : torrent.name.substring(0, torrent.name.indexOf(")") + 1);

        return (
            <div className="progress">
                <span>{name}</span>
                <progress value={torrent.progress[0] > 1 ? torrent.progress[0] : null } max="100" />
                <span>{torrent.progress[0].toFixed(0)}%</span>
                <button className="green" onClick={() => openLink(torrent.infoHash)}><FaPlay/></button>
                <button className="red" onClick={() => cancelTorrent(torrent.infoHash)}><FaTrash/></button>
            </div>
        );
    }    
}

export default Progress;