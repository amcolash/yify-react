import React, { Component } from 'react';
import './Spinner.css';

class Spinner extends Component {
    render() {
        const visible = this.props.visible;
        return <div className={visible ? "spinner visible" : "spinner invisible"}></div>;
    }
}

export default Spinner;