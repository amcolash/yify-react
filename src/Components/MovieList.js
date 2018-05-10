import React, { Component, Fragment } from 'react';
import Movie from "./MovieList";

class MovieList extends Component {

    constructor() {
        super();
        this.state = {
            movies: []
        }
    }

    componentDidMount() {
        // fetch, then set state
    }

    render() {
        const movies = this.state.movies;

        return (
            <Fragment>
                {movies.map(movie =>
                    <Movie
                        movie={movie}
                    />
                )}
            </Fragment>
        );
    }
}

export default MovieList;