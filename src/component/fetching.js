import React from 'react';

function Fetching(props) {
    return (
        <div
            className="d-flex flex-wrap align-items-center justify-content-center fetching-content"
        >
            <div className="lds-dual-ring" />
            {props.children}
        </div>
    );
}

export default Fetching;
