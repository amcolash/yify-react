import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { DebounceInput } from 'react-debounce-input';

import './MovieList.css';
import Movie from './Movie';
import Spinner from './Spinner';

class MovieList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            error: null,
            isLoaded: false,
            isSearching: false,
            movies: [],
            search: ''
        }
    }

    componentDidMount() {
        this.updateData();
    }

    updateData() {
        this.setState({
            isSearching: true
        });

        const query = this.state.search;
        const page = 1;
        const params = 'limit=50&page=' + page + (query.length > 0 ? '&sort_by=title&query_term=' + query : '');
        const ENDPOINT = 'https://yts.am/api/v2/list_movies.json?' + params;

        axios.get(ENDPOINT).then(response => {
            const data = response.data.data;
            this.setState({
                movies: data.movies,
                isLoaded: true,
                isSearching: false
            });
        }, error => {
            this.setState({
                error: error,
                isLoaded: true,
                isSearching: false
            });
        });
    }

    render() {
        const { error, isLoaded, movies } = this.state;

        if (error) {
            return <div className="message">Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div className="message">Loading...</div>;
        } else {
            return (
                <Fragment>
                    <div className="search">
                        <label>
                            Search
                            <DebounceInput
                                minLength={2}
                                debounceTimeout={1000}
                                onChange={event => this.setState({ search: event.target.value }, () => this.updateData() )}
                            />
                        </label>

                        <Spinner visible={this.state.isSearching} />
                    </div>

                    <div className="movie-list">
                        {(movies && movies.length > 0) ? movies.map(movie => (
                            <Movie
                                key={movie.id}
                                movie={movie}
                            />
                        )) :
                            <div className="message">No Results</div>
                        }
                    </div>
                </Fragment>
            );
        }
    }
}

export default MovieList;