import React, { Component, Fragment } from 'react';
import axios from 'axios';

import './MovieList.css';
import Movie from './Movie';

class MovieList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            error: null,
            isLoaded: false,
            movies: []
        }
    }

    componentDidMount() {
        this.updateData();
    }

    updateData() {
        const query = '';
        const page = 1;
        const params = 'limit=50&page=' + page + (query.length > 0 ? '&query_term=' + query : '');
        const ENDPOINT = 'https://yts.am/api/v2/list_movies.json?' + params;

        axios.get(ENDPOINT).then(response => {
            const data = response.data.data;
            this.setState({
                movies: data.movies,
                isLoaded: true
            });
        }, error => {
            this.setState({
                error: error,
                isLoaded: true
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
                            <input type="text"/>
                        </label>
                    </div>

                    <div className="movie-list">
                        {movies.map(movie => (
                            <Movie
                                key={movie.id}
                                movie={movie}
                            />
                        ))}
                    </div>
                </Fragment>
            );
        }
    }
}

export default MovieList;