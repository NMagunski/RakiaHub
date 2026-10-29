import BalkanMap from "./BalkanMap";
export default function PassportCover({countries=0}:{countries?:number}) {
 return <div className="passport-cover"><div className="passport-cover-copy"><span className="cover-wordmark">RAKIQ</span><p>РАКИЕН<br/>ПАСПОРТ</p><span>{countries?`${countries} ${countries===1?'ДЪРЖАВА':'ДЪРЖАВИ'}`:'ТВОЕТО ПЪТЕШЕСТВИЕ'}<br/>БЕЗБРОЙ ИСТОРИИ</span></div><BalkanMap decorative/><svg className="compass" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="31"/><circle cx="40" cy="40" r="27"/><path d="m40 8 5 27 27 5-27 5-5 27-5-27-27-5 27-5ZM20 20l40 40M60 20 20 60"/></svg></div>;
}
