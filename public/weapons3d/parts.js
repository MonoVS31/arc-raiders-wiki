// Piezas originales compartidas; dimensiones de dibujo, sin unidades reales.
export function designWeapon(config) {
 const s=config.spec,v=config.variant,parts=[],anchors=[];
 const add=(kind,name,size,pos,material='steel',extra={})=>{const part={kind,name,size,pos,material,...extra};parts.push(part);return part;};
 const box=(name,size,pos,material='steel',extra={})=>add('box',name,size,pos,material,extra);
 const tube=(name,r,length,pos,material='dark')=>add('tube',name,[r,length],pos,material);
 const profile=(name,points,depth,pos,material='steel')=>add('profile',name,[depth],pos,material,{points});
 const anchor=(text,pos,side)=>anchors.push({text,pos,side});
 const b=s.body,end=b/2,barrel=s.barrel,heavy=['handcannon','grenade','launcher','heavy-shotgun','energy','energy-shotgun'].includes(config.family),height=({pistol:.23,'light-pistol':.2,handcannon:.32,smg:.27,assault:.3,burst:.29,battle:.3,lmg:.34,marksman:.22,bolt:.24,rifle:.25,lever:.22,pump:.3,'heavy-shotgun':.4,energy:.38,'energy-shotgun':.36,launcher:.27,grenade:.34})[config.family]??.3;
 const radius=s.muzzle??(['pump','heavy-shotgun'].includes(config.family)?.15:.09);
 profile('Cuerpo',[[-end,-height],[end-.12-(v%3)*.08,-height],[end,height-.05-(v%4)*.025],[end-.12-(v%3)*.05,height],[-end+.22,height],[-end,height-.16]],.42,[0,.18,0]);
 box('Lomo',[b*.85,.12,.32],[0,.18+height+.05,0],'dark');
 tube('Cañón',radius,barrel,[end,.33,0]); tube('Boca',radius*1.3,.18,[end+barrel-.05,.33,0],'steel');
 add('ring','Borde del cañón',[radius*1.18,.027],[end+barrel+.13,.33,0],'accent',{axis:'x'});
 anchor('CAÑÓN',[end+barrel*.65,.33,0],'right');
 const gripX=-b*.2,gripY=.18-height-.1,magX=b*.19+(config.family==='smg'&&v===4?-.55:0),magY=.18-height;
 profile('Empuñadura',[[-.22,.15],[.14,.12],[.2+(v%4)*.035,-.68],[-.12,-.79],[-.27,-.64]],.32,[gripX,gripY,0],'grip');
 for(let i=0;i<4;i++)box('Estría de agarre',[.32,.035,.34],[gripX,gripY-.25-i*.1,0],'dark');
 add('ring','Guardamonte',[.25,.035],[gripX+.35,magY-.24,.08],'dark',{scale:[1.25,.8,1]});
 box('Gatillo',[.06,.24,.08],[gripX+.29,magY-.18,.04],'dark',{rotation:[0,0,-.16]});
 anchor('EMPUÑADURA',[gripX,gripY-.55,0],'left');
 if(s.stock){
  const stockX=-end-s.stock;
  if(s.skeleton){tube('Soporte superior',.055,s.stock,[stockX,.42,0],'steel');tube('Soporte inferior',.055,s.stock,[stockX,-.1,0],'steel');box('Apoyo',[.18,.78,.4],[stockX,.15,0],'grip');}
  else profile('Culata',[[0,-.32],[s.stock,-.2],[s.stock,.28],[.18,.46],[0,.38]],.36,[stockX,.12,0],'grip');
  box('Cantonera',[.12,.68,.42],[stockX-.04,.12,0],'dark');anchor('CULATA',[stockX+.1,.35,0],'left');
 }
 if(s.mag==='curve')profile('Cargador',[[-.18,.05],[.18,.05],[.15,-.55],[-.02,-.95],[-.38,-.83],[-.19,-.48]],.27,[magX,magY-.015,0],'dark');
 if(['straight','box','short','cell'].includes(s.mag)){
  const length=s.mag==='short'?.46:s.mag==='box'?.68:s.mag==='cell'?.62:.95;
  box(s.mag==='cell'?'Celda':'Cargador',[s.mag==='box'?.52:.32,length,.34],[magX,magY-length/2+.025,0],s.mag==='cell'?'accent':'dark',{rotation:[0,0,(v%3-1)*.08]});
  for(let i=0;i<3;i++)box('Marca del cargador',[.35,.028,.36],[magX,magY-.13-i*.12,0],'steel');
 }
 if(s.mag==='grip'){box('Base del cargador',[.42,.12,.37],[gripX+.09,gripY-.85,0],'accent');anchor('CARGADOR',[gripX+.09,gripY-.85,0],'left');}
 else if(s.mag==='drum'){
  add('drum','Tambor',[config.family==='grenade'?.5:.4,.38],[magX,magY-.29,0],'dark');
  const r=config.family==='grenade'?.36:.28;for(let i=0;i<8;i++){const a=i*Math.PI/4;add('drum','Alojamiento',[.075,.03],[magX+Math.cos(a)*r,magY-.29+Math.sin(a)*r,.22],'accent');}
  anchor('TAMBOR',[magX,magY-.65,.2],'left');
 } else if(s.mag==='tube'){tube('Tubo inferior',radius*.65,b*.8+barrel*.65,[end-b*.8,.33-radius*.9,0],'steel');anchor('TUBO',[end+barrel*.2,.33-radius*.9,0],'left');}
 else anchor(s.mag==='cell'?'CELDA':'CARGADOR',[magX,magY-.5,0],'left');
 if(s.pump){box('Corredera',[.8,.34,.44],[end+barrel*.32,.1,0],'grip');for(let i=0;i<5;i++)box('Canal de corredera',[.035,.38,.47],[end+barrel*.32-.3+i*.14,.1,0],'dark');}
 if(s.lever)add('ring','Palanca',[.37,.045],[gripX+.43,magY-.31,0],'accent',{scale:[1.45,.85,1]});
 if(s.bolt){box('Cerrojo',[.16,.1,.5],[-.35,.25,.35],'steel');add('sphere','Pomo del cerrojo',[.12],[-.35,.12,.66],'dark');}
 if(['long','large'].includes(s.scope)){
  const length=s.scope==='large'?1.35:1.05,y=height+.58;
  box('Montura',[.68,.18,.3],[-.08,height+.32,0],'dark');tube('Mira',.14,length,[-length*.4,y,0],'steel');tube('Campana',s.scope==='large'?.26:.21,.24,[length*.6-.2,y,0],'dark');add('drum','Lente',[s.scope==='large'?.22:.17,.015],[length*.6+.04,y,0],'glass',{axis:'x'});box('Regulación',[.16,.2,.14],[.08,y+.2,0],'dark');anchor('MIRA',[.15,y+.12,0],'right');
 }else if(s.scope==='hood'||s.scope==='panel'){
  box('Base de mira',[.45,.1,.34],[.25,height+.31,0],'dark');profile('Mira abierta',[[-.22,0],[.22,0],[.22,.36],[-.22,.36]],.08,[.25,height+.32,-.16],'steel');box('Panel de mira',[.32,.24,.028],[.25,height+.48,-.1],s.scope==='panel'?'glow':'glass');anchor('MIRA',[.25,height+.55,0],'right');
 }else{box('Mira trasera',[.08,.2,.25],[-end+.25,height+.28,0],'dark');box('Mira delantera',[.09,.21,.07],[end+barrel*.65,.56,0],'accent');anchor('MIRA',[-end+.25,height+.41,0],'right');}
 if(s.coils){for(let i=0;i<s.coils;i++)add('ring','Bobina',[radius*1.6,.055],[end+.13+i*(barrel-.15)/s.coils,.33,0],'glow',{axis:'x'});box('Panel de energía',[b*.6,.12,.46],[.08,.25+height,0],'glow');anchor('BOBINAS',[end+barrel*.4,.5,0],'right');}
 if(s.slide)box('Corredera superior',[b*.9,.15,.46],[.08,.5,0],'steel');
 if(s.rail)for(let i=0;i<s.rail;i++)box('Ventilación',[.07,.12,.44],[end-.25-i*.16,.28+height,0],'dark');
 if(s.bipod){box('Pata izquierda',[.08,.75,.09],[end+.25,-.15,.35],'steel',{rotation:[.28,0,.25]});box('Pata derecha',[.08,.75,.09],[end+.25,-.15,-.35],'steel',{rotation:[-.28,0,.25]});}

 const longArms=['battle','burst','assault','lmg','marksman','bolt','rifle'];
 if(longArms.includes(config.family)){
  const length=barrel*(.42+(v%3)*.08),x=end+length/2;
  box('Guardamanos',[length,.26+(v%3)*.025,.33],[x,.32,0],v%2?'grip':'dark');
  for(let i=0;i<3+(v%3);i++)box('Ranura del guardamanos',[.045,.14,.355],[end+.08+i*length/(4+(v%3)),.36,0],'steel');
 }
 if(config.family==='burst'){box('Puente de mira',[.8,.08,.25],[-.05,height+.65,0],'dark');box('Soporte del puente',[.08,.3,.25],[-.4,height+.47,0],'steel');}
 if(config.family==='lmg'){box('Alimentación lateral',[.55,.32,.22],[.1,.07,.33],'dark');box('Cubierta de alimentación',[.65,.08,.26],[.1,.24,.35],'accent');}
 if(config.family==='launcher')tube('Tubo principal',radius, b+barrel+.3,[-end-.22,.43,0],'dark');
 if(config.family==='grenade'){box('Soporte delantero',[.19,.42,.28],[end+.25,-.02,0],'grip');}
 if(config.family==='battle')box('Apoyo superior',[s.stock*.64,.14,.38],[-end-s.stock*.58,.58,0],'dark');
 if(config.family==='assault'&&v===20)profile('Agarre delantero',[[-.13,.1],[.13,.1],[.05,-.42],[-.16,-.38]],.22,[end+.27,.05,0],'grip');
 if(config.family==='smg'&&v===16){tube('Cubierta perforada',.14,barrel*.55,[end+barrel*.35,.33,0],'steel');}
 if(config.family==='handcannon')box('Refuerzo inferior',[.65,.14,.46],[.2,-.2,0],'dark');
 if(config.family==='pistol'&&v===22)box('Compensador',[.34,.3,.44],[end+barrel-.13,.34,0],'dark');
 // Las placas laterales y los remaches ayudan a distinguir cada estudio.
 box('Placa de color',[b*(.24+(v%4)*.03),.17,.035],[-.2,.24,.235],'accent');
 for(let i=0;i<2+(v%3);i++)add('sphere','Remache',[.035],[-end+.22+i*.22,.05,.235],'steel');
 return {...config,parts,anchors:anchors.sort((a,b)=>b.pos[1]-a.pos[1])};
}
