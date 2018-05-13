import React, { Component } from 'react';
import Progress from './Progress';

class TorrentList extends Component {
    render() {
        const { openLink, cancelTorrent, torrents } = this.props;

        if (torrents.length === 0) return null;

        return (
            <div className="torrentList">
                <h3>Downloads</h3>
                {torrents.map(torrent => (
                    <Progress
                        key={torrent.infoHash}
                        torrent={torrent}
                        openLink={openLink}
                        cancelTorrent={cancelTorrent}
                        fullName={false}
                    />
                ))}
                <hr/>
            </div>
        );
    }
}

export default TorrentList;