import React, { Component, Fragment } from 'react';

class TorrentList extends Component {
    render() {
        const { openLink, cancelTorrent } = this.props;

        return (
            this.props.torrents.map(torrent => (
                <Fragment key={torrent.name}>
                    <span>{torrent.name}</span>
                    <progress value={torrent.progress[0]} max="100"/>
                    <button onClick={() => openLink(torrent.infoHash)}>►</button>
                    <button onClick={() => cancelTorrent(torrent.infoHash)}>X</button>
                </Fragment>
            ))
        );
    }
}

export default TorrentList;