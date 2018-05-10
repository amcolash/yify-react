import React, { Component } from 'react';
import './Movie.css';

class Movie extends Component {
    render() {
        const movie = this.props.movie;

        return (
            <div className="movie">
                <img src={movie.medium_cover_image} alt={movie.title} />
                <br />
                <a href={movie.url}>{movie.title}</a>
            </div>
        );
    }
}

export default Movie;