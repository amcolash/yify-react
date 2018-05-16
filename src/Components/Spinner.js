import React, { Component } from 'react';
import './Spinner.css';

class Spinner extends Component {
    render() {
        const { visible, noMargin, button } = this.props;
        return <div className={"spinner " + (visible ? "visible" : "invisible") + (noMargin ? "" : " margin") + (button ? " button" : "")}></div>;
    }
}

export default Spinner;