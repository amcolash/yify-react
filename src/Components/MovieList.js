import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { DebounceInput } from 'react-debounce-input';
import Modal from 'react-responsive-modal';
import {
    FaAngleDoubleRight, FaAngleDoubleLeft, FaAngleRight, FaAngleLeft, FaClose, FaExclamationTriangle
} from 'react-icons/lib/fa';

import './MovieList.css';
import Genre from '../Data/Genre';
import Order from '../Data/Order';
import Quality from '../Data/Quality';
import Movie from './Movie';
import Spinner from './Spinner';
import Details from './Details';
import TorrentList from './TorrentList';

class MovieList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            error: null,
            isLoaded: false,
            isSearching: false,
            movies: [],
            search: '',
            totalMovies: 0,
            page: 1,
            totalPages: 1,
            modal: false,
            movie: {},
            torrents: [],
            started: [],
            genre: '',
            quality: 'All',
            order: 'date_added',
            width: 0,
            height: 0
        }

        this.getTorrent = this.getTorrent.bind(this);
        this.getProgress = this.getProgress.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

        this.server = "http://" + window.location.hostname + ":9000";
    }
    
    componentDidMount() {
        this.updateData();
        
        this.updateLocation();
        
        // First update, then schedule polling
        this.updateTorrents();
        setInterval(() => this.updateTorrents(), 5000); // Poll torrents every 5 seconds (might be overkill)

        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }
    
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    updateLocation() {
        // If the server is not patched or something goes wrong, no worries
        axios.get(this.server + '/ip').then(ip => {
            axios.get('https://api.ipdata.co/' + ip.data).then(response => {
                this.setState({ location: response.data.city + ', ' + response.data.country_name });
            }, error => {
                console.error(error);
            });
        }, error => {
            console.error(error);
        });
    }

    updateTorrents() {
        axios.get(this.server + '/torrents').then(response => {
            const torrents = response.data;
            const started = this.state.started.filter(infoHash => {
                for (var i = 0; i < torrents.length; i++) {
                    if (torrents[i].infoHash === infoHash) return false;
                }
                return true;
            });

            for (var i = 0; i < torrents.length; i++) {
                const torrent = torrents[i];
                if (torrent.progress && torrent.progress[0] === 100 && !torrent.halted) {
                    console.log("stopping complete torrent: " + torrent.infoHash);
                    axios.post(this.server + '/torrents/' + torrent.infoHash + '/halt').then(response => {
                        this.updateTorrents();
                    }, error => {
                        console.error(error);
                    });
                }
            }

            this.setState({
                torrents: torrents,
                started: started
            });
        }, error => {
            console.error(error);
        });
    }

    updateData() {
        const { search, page, genre, order, quality } = this.state;

        this.setState({
            isSearching: true
        });

        const limit = 20;
        const direction = order === 'title' ? 'asc' : 'dec';
        const params = 'limit=' + limit + '&page=' + page +
            (search.length > 0 ? '&query_term=' + search : '') +
            '&sort_by=' + order + '&order_by=' + direction +
            (genre.length > 0 ? '&genre=' + genre : '') +
            '&quality=' + quality;
        const ENDPOINT = 'https://yts.am/api/v2/list_movies.json?' + params;

        axios.get(ENDPOINT).then(response => {
            const data = response.data.data;
            const total = data.movie_count;
            const totalPages = Math.ceil(total / limit);

            this.setState({
                movies: data.movies,
                isLoaded: true,
                isSearching: false,
                totalPages: totalPages,
                totalMovies: total
            });
        }, error => {
            this.setState({
                error: error,
                isLoaded: true,
                isSearching: false,
            });
        });
    }

    cancelTorrent = (infoHash) => {
        axios.delete(this.server + '/torrents/' + infoHash).then(response => {
            this.updateTorrents();
        }, error => {
            console.error(error);
        });
    }

    stopTorrent = (infoHash) => {
        axios.post(this.server + '/torrents/' + infoHash + '/stop').then(response => {
            this.updateTorrents();
        }, error => {
            console.error(error);
        });
    }

    downloadTorrent = (version) => {
        this.setState({
            started: [ ...this.state.started, version.infoHash ]
        });

        axios.post(this.server + '/torrents', { link: version.url }).then(response => {
            this.updateTorrents();
        }, error => {
            console.error(error);
        });

        this.torrentList.expand();
    }

    getVersions(movie) {
        var versions = [];

        for (var i = 0; i < movie.torrents.length; i++) {
            const torrent = movie.torrents[i];
            versions.push({
                quality: torrent.quality,
                peers: torrent.peers.toFixed(0),
                seeds: torrent.seeds.toFixed(0),
                ratio: torrent.peers > 0 ? (torrent.seeds / torrent.peers).toFixed(3) : 'dead',
                url: torrent.url,
                infoHash: torrent.hash.toLowerCase(),
                size: torrent.size
            });
        }

        return versions;
    }

    getTorrent(infoHash) {
        for (var i = 0; i < this.state.torrents.length; i++) {
            const torrent = this.state.torrents[i];
            if (torrent.infoHash === infoHash) return torrent;
        }

        return null;
    }

    getProgress(infoHash) {
        const torrent = this.getTorrent(infoHash);
        return torrent !== null ? torrent.progress[0] + 0.001 : null;
    }

    openLink = (infoHash) => {
        const { torrents } = this.state;

        for (var i = 0; i < torrents.length; i++) {
            const torrent = torrents[i];
            if (torrent.infoHash === infoHash) {
                var largestSize = 0;
                var largestIndex = 0;

                for (var j = 0; j < torrent.files.length; j++) {
                    const file = torrent.files[j];
                    if (file.length > largestSize) {
                        largestIndex = j;
                        largestSize = file.length;
                    }
                }

                window.open(this.server + torrent.files[largestIndex].link);
                return;
            }
        }
    }

    onOpenModal = (movie) => {
        this.setState({ movie: movie, modal: true });
    };

    onCloseModal = () => {
        this.setState({ modal: false });
    };

    changeSearch(newValue) {
        this.setState({ search: newValue, page: 1 }, () => this.updateData());
    }

    changeGenre(newValue) {
        this.setState({ genre: newValue, page: 1 }, () => this.updateData());
    }

    changeOrder(newValue) {
        this.setState({ order: newValue, page: 1 }, () => this.updateData());
    }

    changeQuality(newValue) {
        this.setState({ quality: newValue, page: 1 }, () => this.updateData());
    }

    clearSearch() {
        const { search, genre, order, page, quality } = this.state;
        if (search === '' && genre === '' && order === 'date_added' && page === 1 && quality === 'All') return;

        this.setState({ search: '', genre: '', order: 'date_added', page: 1, quality: 'All' }, () => this.updateData());
    }

    changePage(direction) {
        const { page, totalPages } = this.state;
        var newPage = direction + page;
        if (page === newPage) return;
        if (newPage < 1) newPage = 1;
        if (newPage > totalPages) newPage = totalPages;

        this.setState({ page: newPage }, () => this.updateData());
    }

    render() {
        const {
            error, isLoaded, movies, modal, movie, page, totalPages, torrents, search, isSearching, genre, order, quality, location, totalMovies, started, width
        } = this.state;

        if (error) {
            return <div className="message">Error: {error.message}</div>;
        } else if (!isLoaded) {
            return (
            <div className="message">
                <span>Loading...</span>
                <Spinner visible/>
            </div>
            );
        } else {
            return (
                <Fragment>
                    <Modal open={modal} onClose={this.onCloseModal} center={width > 680}>
                        <Details
                            movie={movie}
                            server={this.server}
                            torrents={torrents}
                            started={started}
                            updateTorrents={this.updateTorrents}
                            cancelTorrent={this.cancelTorrent}
                            downloadTorrent={this.downloadTorrent}
                            openLink={this.openLink}
                            getProgress={this.getProgress}
                            getTorrent={this.getTorrent}
                            getVersions={this.getVersions}
                        />
                    </Modal>
            
                    {location === "Seattle, United States" ? (
                        <span className="warning red">
                            <FaExclamationTriangle/>
                            <span>Server not secure</span>
                        </span>
                    ) : null}

                    <TorrentList
                        torrents={torrents}
                        cancelTorrent={this.cancelTorrent}
                        openLink={this.openLink}
                        ref={instance => { this.torrentList = instance; }}
                    />

                    <div className="search">
                        <label>
                            <div className="searchItem">
                                <span>Search</span>
                                <DebounceInput
                                    value={search}
                                    debounceTimeout={500}
                                    onChange={event => this.changeSearch(event.target.value)}
                                />
                            </div>

                            <div className="searchItem">
                                <span>Genre</span>
                                <select
                                    onChange={event => this.changeGenre(event.target.value)}
                                    value={genre}
                                >
                                    {Genre.map(genre => (
                                        <option
                                            key={genre.label}
                                            value={genre.value}
                                        >
                                            {genre.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="searchItem">
                                <span>Order</span>
                                <select
                                    onChange={event => this.changeOrder(event.target.value)}
                                    value={order}
                                >
                                    {Order.map(order => (
                                        <option
                                            key={order.label}
                                            value={order.value}
                                        >
                                            {order.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="searchItem">
                                <span>Quality</span>
                                <select
                                    onChange={event => this.changeQuality(event.target.value)}
                                    value={quality}
                                >
                                    {Quality.map(quality => (
                                        <option
                                            key={quality.label}
                                            value={quality.value}
                                        >
                                            {quality.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button className="red" onClick={() => this.clearSearch() }><FaClose/></button>
                        </label>

                        <Spinner visible={isSearching} />
                    </div>

                    <h2>{totalMovies} Movies</h2>

                    <div className="movie-list">
                        {(movies && movies.length > 0) ? (
                            movies.map(movie => (
                                <Movie
                                    key={movie.id}
                                    movie={movie}
                                    click={this.onOpenModal}
                                    downloadTorrent={this.downloadTorrent}
                                    cancelTorrent={this.cancelTorrent}
                                    torrents={this.torrents}
                                    started={started}
                                    getProgress={this.getProgress}
                                    getVersions={this.getVersions}
                                />
                            ))
                        ) :
                            <div className="message">No Results</div>
                        }
                    </div>

                    {(movies && movies.length > 0) ? (
                        <div className="pager">
                            <FaAngleDoubleLeft
                                className="arrow"
                                style={{ visibility: page > 1 ? "visible" : "hidden" }}
                                onClick={() => this.changePage(-5)}
                            />
                            <FaAngleLeft
                                className="arrow"
                                style={{ visibility: page > 1 ? "visible" : "hidden" }}
                                onClick={() => this.changePage(-1)}
                            />
                            <span>{page}</span>
                            <FaAngleRight
                                className="arrow"
                                style={{ visibility: page < totalPages ? "visible" : "hidden" }}
                                onClick={() => this.changePage(1)}
                            />
                            <FaAngleDoubleRight
                                className="arrow"
                                style={{ visibility: page < totalPages ? "visible" : "hidden" }}
                                onClick={() => this.changePage(5)}
                            />

                            <br/>
                            
                            <Spinner visible={isSearching} noMargin />

                            {location ? (
                                <Fragment>
                                    <br/>
                                    <br/>
                                    <span className="location">Server Location: {location}</span>
                                </Fragment>
                            ) : null}
                        </div>
                    ) : null}
                </Fragment>
            );
        }
    }
}

export default MovieList;