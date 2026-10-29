export default function BotanicalSprig({className=""}:{className?:string}) {
 return <svg viewBox="0 0 200 260" fill="none" aria-hidden="true" className={className}>
  <path d="M38 248C76 190 79 115 172 15" stroke="currentColor" strokeWidth="1.3"/>
  {[[153,39,-28],[130,70,145],[117,91,-30],[99,126,149],[91,151,-24],[72,184,145],[63,210,-33]].map(([x,y,r],i)=><g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
   <path d="M0 0C-7-14-8-42 4-62C24-39 17-9 0 0Z" fill="currentColor" opacity={.14+i*.035}/>
   <path d="M0 0C5-18 6-37 4-62M2-12l8-10M4-25l-8-13M5-36l7-10" stroke="currentColor" strokeWidth=".8" opacity=".55"/>
  </g>)}
  <path d="M70 184c-23-2-44-14-45-35 23-2 44 13 45 35ZM117 92c-24-2-39-12-41-32 22 0 38 10 41 32Z" fill="currentColor" opacity=".15"/>
  <circle cx="101" cy="122" r="7" fill="currentColor" opacity=".22"/><circle cx="79" cy="171" r="6" fill="currentColor" opacity=".2"/>
 </svg>;
}
