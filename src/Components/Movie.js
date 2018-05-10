import React, { Component } from 'react';
import './Movie.css';

class Movie extends Component {
    render() {
        const movie = this.props.movie;
        const click = this.props.click;

        return (
            <div className="movie" onClick={(e) => click(movie)}>
                <img src={movie.medium_cover_image} alt={movie.title} />
                <br/>
                <span>{movie.title} ({movie.year})</span>
            </div>
        );
    }
}

export default Movie;