import React, { Component } from 'react';
import { DebounceInput } from 'react-debounce-input';
import {
    FaClose
} from 'react-icons/lib/fa';
import './Search.css';
import Spinner from './Spinner';

import Genre from '../Data/Genre';
import Order from '../Data/Order';
import Quality from '../Data/Quality';

class Search extends Component {

    clearSearch() {
        this.props.updateSearch("", "", "date_added", "All");
    }

    render() {
        let { search, genre, order, quality, page, isSearching, updateSearch } = this.props;
        let clearVisible = search.length > 0 || genre.length > 0 || quality !== "All" || order !== "date_added" || page !== 1;

        return (
            < div className="search" >
                <div className="form">
                    <div className="searchItem">
                        <span>Search</span>
                        <DebounceInput
                            value={search}
                            debounceTimeout={500}
                            onChange={(event) => updateSearch(event.target.value, genre, order, quality)}
                        />
                    </div>

                    <div className="searchItem">
                        <span>Genre</span>
                        <select
                            onChange={(event) => updateSearch(search, event.target.value, order, quality)}
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
                            onChange={(event) => updateSearch(search, genre, event.target.value, quality)}
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
                            onChange={(event) => updateSearch(search, genre, quality, event.target.value)}
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

                    <button className="red" style={{display: clearVisible ? "inline" : "none"}} onClick={() => this.clearSearch()}><FaClose /></button>
                </div>

                <Spinner visible={isSearching} />
            </div >
        );
    }

}

export default Search;