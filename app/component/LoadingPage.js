import React from 'react';
import Loading from './Loading';

export default function LoadingPage() {
  return (
    <div style={{ minHeight: 100, zIndex: 40000 }}>
      <Loading />
    </div>
  );
}
