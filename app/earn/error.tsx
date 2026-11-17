'use client';
export default function Error({reset}:{reset:()=>void}) {return <main className="page"><h1>Marketplace is temporarily unavailable</h1><button className="primary-btn" onClick={reset}>Try again</button></main>;}
