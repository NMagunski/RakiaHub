import Link from "next/link";
import type {Rakija} from "@/types/app";
import ProductArtwork from "./ProductArtwork";
export type CatalogProduct=Pick<Rakija,"id"|"name"|"producer"|"fruit"|"region"|"country"|"type"|"abv"|"global_rating"|"rating_count"|"is_verified"> & Partial<Pick<Rakija,"image_url"|"image_rights"|"image_source"|"image_attribution">>;
const fruits:Record<string,string>={plum:'Слива',grape:'Грозде',apricot:'Кайсия',pear:'Круша',fig:'Смокиня',quince:'Дюля',mixed:'Смесена',other:'Друг плод'};
const countries:Record<string,string>={Bulgaria:'България',Serbia:'Сърбия','North Macedonia':'Северна Македония'};
export default function RakijaCard({rakija,featured=false}:{rakija:CatalogProduct;featured?:boolean}){
 return <Link href={`/rakija/${rakija.id}`} className={`rakija-card ${featured?'featured':''}`}>
  <div className="catalog-art"><ProductArtwork product={rakija} priority={featured}/>{featured&&rakija.rating_count>0&&<span className="editorial-badge">✦ Най-оценявана</span>}</div>
  <div className="catalog-card-copy"><div className="catalog-card-title"><h3>{rakija.name}</h3>{rakija.is_verified&&<span className="verified-dot" title="Проверен продукт" aria-label="Проверен продукт">✓</span>}</div><p className="catalog-producer">{rakija.producer||fruits[rakija.fruit||'other']}</p><div className="catalog-card-bottom"><span>{rakija.region||fruits[rakija.fruit||'other']} · {countries[rakija.country]||rakija.country}</span><span className="catalog-score">{rakija.global_rating?<><span aria-hidden="true">★</span> {Number(rakija.global_rating).toFixed(1)}<small>/10</small></>:<small>Оцени първи</small>}</span></div>{rakija.rating_count>0&&<p className="catalog-rating-count">{rakija.rating_count} {rakija.rating_count===1?'оценка':'оценки'}</p>}</div>
 </Link>;
}
