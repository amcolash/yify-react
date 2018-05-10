import React, { Component } from 'react';
import './Movie.css';

class Movie extends Component {
    render() {
        const movie = this.props.movie;

        return (
            <div className="movie">
                <a href={movie.url}>
                    <img src={movie.medium_cover_image} alt={movie.title} />
                    <br/>
                    {movie.title}
                </a>
            </div>
        );
    }
}

export default Movie;