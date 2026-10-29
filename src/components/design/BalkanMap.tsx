"use client";
import outlines from "@/lib/balkan-map.json";
type Region={id:string;name:string;country_id:string;latitude:number;longitude:number};
type Props={regions?:Region[];visited?:Set<string|null>;selected?:string;country?:string;onRegion?:(id:string)=>void;onCountry?:(id:string)=>void;decorative?:boolean;className?:string};
const labels=[{id:'RS',name:'Сърбия',x:111,y:83},{id:'BG',name:'България',x:389,y:154},{id:'MK',name:'Северна Македония',x:161,y:216},{id:'RO',name:'Румъния',x:415,y:28},{id:'GR',name:'Гърция',x:241,y:263}];
export default function BalkanMap({regions=[],visited=new Set(),selected,country,onRegion,onCountry,decorative=false,className=""}:Props){
 return <div className={`balkan-map ${decorative?'balkan-map-decorative':''} ${className}`} role={decorative?'img':undefined} aria-label={decorative?'Контурна карта на Балканите':undefined}>
  <svg viewBox="0 0 600 280" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g>{outlines.map(c=><path key={c.id} d={c.path} className={`map-country ${country===c.id?'is-selected':''} ${regions.some(r=>visited.has(r.id)&&r.country_id===c.id)?'is-visited':''}`}/>)}</g>{!decorative&&labels.map(l=><text key={l.id} x={l.x} y={l.y} className="map-label" textAnchor="middle">{l.name}</text>)}</svg>
  {!decorative&&onCountry&&labels.filter(l=>['BG','RS','MK'].includes(l.id)).map(l=><button key={l.id} className={`country-pin ${country===l.id?'active':''}`} style={{left:`${l.x/6}%`,top:`${(l.y-15)/2.8}%`}} aria-label={`Открий ${l.name}`} aria-pressed={country===l.id} onClick={()=>onCountry(l.id)}><span/></button>)}
  {!decorative&&onRegion&&regions.filter(r=>!country||r.country_id===country).map(r=><button key={r.id} style={{left:`${(Number(r.longitude)-19)*10}%`,top:`${(46-Number(r.latitude))/6*100}%`}} className={`region-pin ${visited.has(r.id)?'visited':''} ${selected===r.id?'selected':''}`} onClick={()=>onRegion(r.id)} title={r.name} aria-label={`${r.name}${visited.has(r.id)?' · опитан':' · неопитан'}`} aria-pressed={selected===r.id}><span/>{(visited.has(r.id)||selected===r.id)&&<span className="pin-label">{r.name}</span>}</button>)}
 </div>;
}
