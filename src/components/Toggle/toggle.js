import React from 'react';
import "./toggle.scss";

function Toggle() {
    return (
        <>
            <div className="toggle">
                <input type="checkbox" id="mode-toggle" className="toggle__input" />
                <label htmlFor="mode-toggle" className="toggle__label"></label>
            </div>
        </>
    )
}

export default Toggle