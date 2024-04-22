import React from 'react';

const CallAgencyIcon = () => {
  return (
    <div
      style={{
        maxWidth: '100%',
        display: 'flex',
        minWidth: '64px',
        minHeight: '64px',
        justifyContent: 'center',
      }}
    >
      <svg
        style={{
          height: '50px',
          width: '50px',
        }}
        viewBox="0 0 60 60"
        className="icon"
      >
        <use xlinkHref="#icon-icon_call" />
      </svg>
    </div>
  );
};

export default CallAgencyIcon;
