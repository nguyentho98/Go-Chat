import React from 'react';

function webviewHOC(WrappedComponent) {
    return ((props) => {
        return <WrappedComponent {...props} />
    })
}

export default webviewHOC;
