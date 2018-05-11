import React, { Component } from 'react';
import Progress from './Progress';

class TorrentList extends Component {
    render() {
        const { openLink, cancelTorrent } = this.props;

        return (
            this.props.torrents.map(torrent => (
                <Progress
                    key={torrent.infoHash}
                    torrent={torrent}
                    openLink={openLink}
                    cancelTorrent={cancelTorrent}
                />
            ))
        );
    }
}

export default TorrentList;