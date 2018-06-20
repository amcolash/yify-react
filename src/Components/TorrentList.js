import React, { Component } from 'react';
import {
    FaPlus, FaMinus
} from 'react-icons/lib/fa';

import Progress from './Progress';

class TorrentList extends Component {
    constructor(props) {
        super(props);

        this.state = { collapsed: true };
    }

    expand() {
        this.setState({ collapsed: false });
    }

    collapse() {
        this.setState({ collapsed: true });
    }

    toggleCollapse() {
        this.setState({ collapsed: !this.state.collapsed });
    }

    render() {
        const { getLink, cancelTorrent, torrents } = this.props;

        if (torrents.length === 0) return null;

        return (
            <div className="torrentList">
                <h3>
                    <span>Downloads ({torrents.length})</span>
                    <button onClick={ () => this.toggleCollapse() }>
                        {this.state.collapsed ? <FaPlus/> : <FaMinus/>}
                    </button>
                </h3>

                {!this.state.collapsed ? (
                    <div>
                        {(torrents.map(torrent => (
                            <Progress
                                key={torrent.infoHash}
                                torrent={torrent}
                                getLink={getLink}
                                cancelTorrent={cancelTorrent}
                                fullName={false}
                            />
                        )))}
                    </div>
                ) : null}
                <hr/>
            </div>
        );
    }
}

export default TorrentList;