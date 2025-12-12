import React from 'react'

export const Loader = () => {

  const loaderStyle = {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    display: 'inline-block',
    borderTop: '3px solid #111',
    borderRight: '3px solid transparent',
    boxSizing: 'border-box',
    animation: 'rotation 1s linear infinite',
  };

  const keyframes = `
        @keyframes rotation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `;

  return (
    <>
      <span style={loaderStyle}></span>
      <style>{keyframes}</style>
    </>
  )
}