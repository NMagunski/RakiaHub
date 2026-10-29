"use client";
import {useEffect,useRef,useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {searchRakija} from "@/lib/queries/rakija";
import origins from "@/lib/origin-registry.json";
import RakijaCard,{type CatalogProduct} from "@/components/rakija/RakijaCard";
import BotanicalSprig from "@/components/design/BotanicalSprig";
import BalkanMap from "@/components/design/BalkanMap";
type SortBy='rating_count'|'global_rating'|'name';
const fruits=[['','Всички'],['plum','Слива'],['grape','🍇 Грозде'],['apricot','🍑 Кайсия'],['pear','🍐 Круша'],['fig','Смокиня'],['quince','Дюля'],['mixed','Смесена']];
const countries=[['','Всички'],['BG','България'],['RS','Сърбия'],['MK','Северна Македония']];
export default function DiscoverPage(){
 const client=createClient();
 const [query,setQuery]=useState(''),[fruit,setFruit]=useState(''),[country,setCountry]=useState(''),[region,setRegion]=useState('');
 const [verified,setVerified]=useState(false),[tried,setTried]=useState(false),[sort,setSort]=useState<SortBy>('rating_count'),[offset,setOffset]=useState(0),[filtersOpen,setFiltersOpen]=useState(false);
 const [rows,setRows]=useState<CatalogProduct[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[recent,setRecent]=useState<string[]>([]),[retry,setRetry]=useState(0);
 const sequence=useRef(0);
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem('rakiq-searches')||'[]');if(Array.isArray(saved))setRecent(saved.filter(q=>typeof q==='string').slice(0,6));}catch{}},[]);
 useEffect(()=>{
  const request=++sequence.current;let active=true;
  const timer=setTimeout(async()=>{
   setLoading(true);setError('');
   try{
    const data=await searchRakija(client,query,{fruit,country,region,verifiedOnly:verified,triedOnly:tried,sortBy:sort,offset});
    if(!active||request!==sequence.current)return;
    setRows(data);
    if(query.trim())try{const history=[query.trim(),...recent.filter(q=>q!==query.trim())].slice(0,6);localStorage.setItem('rakiq-searches',JSON.stringify(history));setRecent(history);}catch{}
   }catch{if(active&&request===sequence.current)setError('Каталогът не може да бъде зареден. Опитай отново.');}
   finally{if(active&&request===sequence.current)setLoading(false);}
  },280);
  return()=>{active=false;clearTimeout(timer);};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[query,fruit,country,region,verified,tried,sort,offset,retry]);
 function chooseCountry(value:string){setCountry(value);setRegion('');setOffset(0);}
 function add(){window.dispatchEvent(new CustomEvent('open-rating-sheet',{detail:{query}}));}
 function reset(){setFruit('');chooseCountry('');setVerified(false);setTried(false);setSort('rating_count');setQuery('');}
 const filtered=!!(query||fruit||country||region||verified||tried||offset);
 return <div className="discover-page">
  <section className="discover-hero"><BotanicalSprig className="hero-sprig theme-atlas"/><p className="eyebrow"><span className="theme-amber">Споделяме добрия вкус</span><span className="theme-atlas">Откривай · Опитвай · Пътувай</span></p><h1><span className="theme-amber">Открий<br/>своята ракия</span><span className="theme-atlas">Вкусът на<br/>Балканите</span></h1><p className="hero-description">Истински вкусове. Реални хора. Нови истории.</p></section>
  <section className="discover-tools" aria-label="Търсене и филтри">
   <div className="editorial-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/></svg><input aria-label="Търси ракия" type="search" placeholder="Търси ракия, производител или регион…" value={query} onChange={e=>{setQuery(e.target.value);setOffset(0);}} autoComplete="off"/><button aria-label="Филтри" aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={()=>setFiltersOpen(!filtersOpen)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 6h18M3 12h18M3 18h18M7 3v6m10 0v6M10 15v6"/></svg></button></div>
   <div className="chip-row theme-amber">{fruits.map(([id,name])=><button key={id} aria-pressed={fruit===id} className={`filter-chip ${fruit===id?'active':''}`} onClick={()=>{setFruit(id);setOffset(0);}}>{name}</button>)}</div>
   <div className="chip-row theme-atlas">{countries.map(([id,name])=><button key={id} aria-pressed={country===id} className={`filter-chip ${country===id?'active':''}`} onClick={()=>chooseCountry(id)}>{name}</button>)}</div>
   {filtersOpen&&<div id="catalog-filters" className="catalog-filters animate-fade-in"><div className="filter-selects"><label>Плод<select value={fruit} onChange={e=>{setFruit(e.target.value);setOffset(0);}}>{fruits.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label><label>Държава<select value={country} onChange={e=>chooseCountry(e.target.value)}>{countries.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label><label>Регион<select value={region} onChange={e=>{setRegion(e.target.value);setOffset(0);}}><option value="">Всички</option>{origins.filter(r=>!country||r.country_id===country).map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label><label>Подреди<select value={sort} onChange={e=>{setSort(e.target.value as SortBy);setOffset(0);}}><option value="rating_count">Най-оценявани</option><option value="global_rating">Най-висок рейтинг</option><option value="name">А–Я</option></select></label></div><div className="filter-checks"><label><input type="checkbox" checked={verified} onChange={e=>{setVerified(e.target.checked);setOffset(0);}}/>Само проверени продукти</label><label><input type="checkbox" checked={tried} onChange={e=>{setTried(e.target.checked);setOffset(0);}}/>Вече опитани</label></div><button className="text-link" onClick={reset}>Изчисти филтрите</button></div>}
   {!query&&recent.length>0&&<div className="recent-searches"><span>Скорошни</span>{recent.slice(0,3).map(q=><button key={q} onClick={()=>{setQuery(q);setOffset(0);}}>{q}</button>)}</div>}
  </section>
  {!query&&!region&&!fruit&&!tried&&<section className="country-discovery theme-atlas"><div><h2>Открий<br/>по държава</h2><span aria-hidden="true">⟶</span></div><BalkanMap country={country} onCountry={chooseCountry}/><BotanicalSprig className="country-sprig"/></section>}
  <section className="catalog-section" aria-label="Каталог"><div className="section-heading"><h2>{filtered?'Твоите открития':'Популярни ракии'}</h2><button className="text-link" onClick={()=>setFiltersOpen(!filtersOpen)}>{filtered?'Филтри':'Виж всички'} <span aria-hidden="true">↗</span></button></div>
   {error&&<div role="alert" className="state-card"><p>{error}</p><button className="text-link" onClick={()=>setRetry(retry+1)}>Опитай отново →</button></div>}
   <div aria-busy={loading} className="catalog-grid">{loading?Array.from({length:4},(_,i)=><div key={i} className="catalog-skeleton animate-pulse"/>):rows.map((product,index)=><RakijaCard key={product.id} rakija={product} featured={index===0&&!filtered}/>)}</div>
   {!loading&&!error&&rows.length===0&&<div className="state-card"><p className="eyebrow">Още едно откритие те очаква</p><h3>Не я откриваме.</h3><p>Опитай с друго име или добави липсващата ракия.</p><button className="btn-primary" onClick={add}>Добави ракия</button></div>}
   <p className="catalog-art-note">Илюстрациите представят вида напитка. Реалната бутилка може да изглежда различно.</p>
   <button className="missing-product" onClick={add}><span>＋</span><span><strong>Не я намираш?</strong> Добави ракия</span><span>→</span></button>
   <div className="catalog-pagination"><button disabled={offset===0||loading} onClick={()=>setOffset(Math.max(0,offset-40))}>← Предишни</button><span>Страница {offset/40+1}</span><button disabled={rows.length<40||loading} onClick={()=>setOffset(offset+40)}>Следващи →</button></div>
  </section>
 </div>;
}
