import { useState } from 'react';
import { entityLink } from '../domain/navigation';
export function ShareEntityLink({entityId,blueprintId,arcId}:{entityId:string;blueprintId?:string|undefined;arcId?:string|undefined}){
 const [status,setStatus]=useState('');
 const url=typeof window==='undefined'?`?entity=${encodeURIComponent(entityId)}#catalog`:entityLink(window.location.href,entityId,blueprintId,arcId);
 return <div className="share-fiche"><a href={url} target="_blank" rel="noreferrer">Enlace a esta ficha ↗</a><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(url);setStatus('Enlace copiado');}catch{setStatus('No se pudo copiar automáticamente. Usá el enlace de esta ficha.');}}}>Copiar enlace</button><span role="status">{status}</span><p>Si encontrás un error, compartí este enlace y el campo que querés corregir.</p></div>;
}
