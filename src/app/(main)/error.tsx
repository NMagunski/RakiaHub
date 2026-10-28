"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="card m-4 p-6"><h1 className="font-serif text-2xl">Не успяхме да заредим тази страница.</h1><p className="text-sm text-muted mt-3">Провери връзката и опитай отново.</p><button onClick={reset} className="btn-primary mt-4">Опитай отново</button></div>;}
