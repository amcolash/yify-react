import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { DebounceInput } from 'react-debounce-input';
import Modal from 'react-responsive-modal';


import './MovieList.css';
import Movie from './Movie';
import Spinner from './Spinner';
import Details from './Details';
import TorrentList from './TorrentList';

class MovieList extends Component {

    server = "http://localhost:9000";

    constructor(props) {
        super(props);

        this.state = {
            error: null,
            isLoaded: false,
            isSearching: false,
            movies: [],
            search: '',
            page: 1,
            totalPages: 1,
            modal: false,
            movie: {},
            torrents: []
        }
    }

    componentDidMount() {
        this.updateData();

        // First update, then schedule polling
        this.updateTorrents();
        // setInterval(() => this.updateTorrents(), 5000); // Poll torrents every 5 seconds (might be overkill)
    }

    updateTorrents() {
        console.log("update")
        axios.get(this.server + '/torrents').then(response => {
            this.setState({ torrents: response.data });
        }, error => {
            console.error(error);
        });
    }

    updateData() {
        this.setState({
            isSearching: true
        });

        const limit = 10;
        const query = this.state.search;
        const page = this.state.page;
        const params = 'limit=' + limit + '&page=' + page + (query.length > 0 ? '&sort_by=title&query_term=' + query : '');
        const ENDPOINT = 'https://yts.am/api/v2/list_movies.json?' + params;

        axios.get(ENDPOINT).then(response => {
            const data = response.data.data;
            const total = data.movie_count;
            const totalPages = Math.ceil(total / limit);

            this.setState({
                movies: data.movies,
                isLoaded: true,
                isSearching: false,
                totalPages: totalPages
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
        console.log("cancel: " + infoHash)
        axios.delete(this.server + '/torrents/' + infoHash).then(response => {
            this.updateTorrents();
        }, error => {
            console.error(error);
        });
    }

    downloadTorrent = (version) => {
        console.log("download")
        axios.post(this.server + '/torrents', { link: version.url }).then(response => {
            this.updateTorrents();
        }, error => {
            console.error(error);
        });
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

    changePage(direction) {
        const { page, totalPages } = this.state;
        var newPage = direction + page;
        if (newPage < 1 || newPage > totalPages) return;

        this.setState({ page: newPage }, () => this.updateData());
    }

    render() {
        const { error, isLoaded, movies, modal, movie, page, totalPages, torrents } = this.state;

        if (error) {
            return <div className="message">Error: {error.message}</div>;
        } else if (!isLoaded) {
            return (
            <div className="message">
                <span>Loading...</span>
                <Spinner visible={true}/>
            </div>
            );
        } else {
            return (
                <Fragment>
                    <Modal open={modal} onClose={this.onCloseModal} center>
                        <Details
                            movie={movie}
                            server={this.server}
                            torrents={torrents}
                            updateTorrents={this.updateTorrents}
                            cancelTorrent={this.cancelTorrent}
                            downloadTorrent={this.downloadTorrent}
                        />
                    </Modal>
            
                    <TorrentList
                        torrents={torrents}
                        cancelTorrent={this.cancelTorrent}
                    />

                    <div className="search">
                        <label>
                            Search
                            <DebounceInput
                                value={this.state.search}
                                minLength={2}
                                debounceTimeout={1000}
                                onChange={event => this.changeSearch(event.target.value) }
                            />
                            <button onClick={() => this.changeSearch('') }>✖</button>
                        </label>

                        <Spinner visible={this.state.isSearching} />
                    </div>

                    <div className="movie-list">
                        {(movies && movies.length > 0) ? (
                            movies.map(movie => (
                                <Movie
                                    key={movie.id}
                                    movie={movie}
                                    click={this.onOpenModal}
                                />
                            ))
                        ) :
                            <div className="message">No Results</div>
                        }
                    </div>

                    {(movies && movies.length > 0) ? (
                        <div className="pager">
                            {page > 1 ? (
                                <span className="arrow" onClick={() => this.changePage(-1)}>⇦</span>
                            ) : null}
                            
                            <span>{page}</span>
                            
                            {page < totalPages ? (
                                <span className="arrow" onClick={() => this.changePage(1)}>⇨</span>
                            ) : null}

                            <Spinner visible={this.state.isSearching} />
                        </div>
                    ) : null}
                </Fragment>
            );
        }
    }
}

export default MovieList;