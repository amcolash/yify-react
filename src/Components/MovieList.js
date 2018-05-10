import React, { Component, Fragment } from 'react';
import axios from 'axios';

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
        const ENDPOINT = 'https://yts.am/api/v2/list_movies.json';

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
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div className="movie-list">
                    {movies.map(movie => (
                        <Movie
                            key={movie.id}
                            movie={movie}
                        />
                    ))}
                </div>
            );
        }
    }
}

export default MovieList;