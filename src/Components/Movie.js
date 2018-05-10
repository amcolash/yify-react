import React from 'react';

export default ({movie}) =>
    <div>
        <img src={movie.img} alt={movie.title}/>
        <br/>
        <span>{movie.title}</span>
        <br/>
        <a href={movie.url}>url</a>
    </div>