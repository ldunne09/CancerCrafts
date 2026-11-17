'use client';
export default function Error({reset}:{reset:()=>void}){return <main className="page"><h1>Administration is temporarily unavailable</h1><button className="primary-btn" type="button" onClick={reset}>Try again</button></main>;}
