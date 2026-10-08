import * as THREE from './vendor/three.module.min.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { buildModel, disposeModel } from './model.js';
let activeViewer=null;
export function createWeaponViewer(host,design,{onFallback=()=>{},onReady=()=>{},onSpin=()=>{}}={}){
 activeViewer?.dispose();
 const canvas=document.createElement('canvas'),context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});
 if(!context){onFallback();return null;}
 let renderer;try{renderer=new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:true,powerPreference:'low-power'});}catch{context.getExtension('WEBGL_lose_context')?.loseContext();onFallback();return null;}
 const style=getComputedStyle(host),css=(name,fallback)=>style.getPropertyValue(name).trim()||fallback;
 const colors={background:css('--color-weapon-scene','#0c121d'),teal:css('--color-secondary','#79c7bb'),orange:css('--color-accent','#e69a6c'),yellow:css('--color-weapon-yellow','#d8bd72'),steel:css('--color-weapon-steel','#68787d')};
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.setClearColor(colors.background,1);
 canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Modelo original orientativo de '+design.name);canvas.setAttribute('aria-description','Arrastrá para rotar. Flechas para girar, más y menos para acercar o alejar.');canvas.tabIndex=0;
 const scene=new THREE.Scene(),model=buildModel(design,{colors});scene.add(model.group);
 const camera=new THREE.OrthographicCamera(-4,4,2,-2,.1,60),controls=new OrbitControls(camera,canvas);
 const preference=window.matchMedia('(prefers-reduced-motion: reduce)');let reduced=preference.matches,spin=!reduced,visible=true,disposed=false,dragging=false,raf=0,last=0,settleUntil=0;
 controls.enablePan=false;controls.enableDamping=!reduced;controls.dampingFactor=.09;controls.minZoom=.75;controls.maxZoom=2.7;controls.minPolarAngle=Math.PI*.22;controls.maxPolarAngle=Math.PI*.78;controls.autoRotateSpeed=.42;
 const initial=new THREE.Vector3(1.9,1.1,6);camera.position.copy(initial);controls.target.set(0,0,0);controls.update();
 scene.add(new THREE.AmbientLight('#e4e8df',1.7));const key=new THREE.DirectionalLight('#fff1d4',3.1);key.position.set(2,4,6);scene.add(key);const rim=new THREE.DirectionalLight(colors.teal,3.5);rim.position.set(-3,2,-4);scene.add(rim);const warm=new THREE.DirectionalLight(colors.orange,.85);warm.position.set(4,-1,-2);scene.add(warm);
 const grid=new THREE.GridHelper(16,32,'#314651','#243440');grid.position.y=-model.size.y/2-.2;grid.material.transparent=true;grid.material.opacity=.35;scene.add(grid);
 const labels=document.createElement('div');labels.className='weapon3d-labels';labels.setAttribute('aria-hidden','true');const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');labels.append(svg);const items=model.anchors.map((anchor,index)=>{
  const line=document.createElementNS('http://www.w3.org/2000/svg','line');svg.append(line);const span=document.createElement('span');span.textContent=anchor.text;labels.append(span);return {...anchor,line,span,index};
 });
 host.append(canvas,labels);
 function resize(){if(disposed)return;const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;const aspect=width/height,half=Math.max(model.size.y*.85,model.size.x/aspect*.66);camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();renderer.setSize(width,height,false);svg.setAttribute('viewBox',`0 0 ${width} ${height}`);requestRender();}
 function drawLabels(){const width=host.clientWidth,height=host.clientHeight;let left=0,right=0;for(const item of items){const vector=item.point.clone().applyMatrix4(model.group.matrixWorld).project(camera),x=(vector.x*.5+.5)*width,y=(-vector.y*.5+.5)*height,isLeft=item.side==='left',slot=isLeft?left++:right++,tx=isLeft?12:width-92,ty=30+slot*height*.23;item.span.style.transform=`translate(${tx}px,${ty}px)`;item.line.setAttribute('x1',String(x));item.line.setAttribute('y1',String(y));item.line.setAttribute('x2',String(isLeft?tx+75:tx));item.line.setAttribute('y2',String(ty+8));}}
 function requestRender(){if(!disposed&&visible&&!document.hidden&&!raf)raf=requestAnimationFrame(render);}
 function render(time){raf=0;if(disposed||!visible||document.hidden)return;const delta=last?Math.min((time-last)/1000,.05):1/60;last=time;controls.autoRotate=spin&&!reduced&&!dragging;controls.update(delta);model.group.updateMatrixWorld(true);drawLabels();renderer.render(scene,camera);if(controls.autoRotate||dragging||time<settleUntil)requestRender();}
 function setSpin(value){spin=value&&!reduced;controls.autoRotate=spin;onSpin(spin);requestRender();}
 function profile(){spin=false;controls.autoRotate=false;onSpin(false);model.group.rotation.set(0,0,0);camera.position.set(0,0,6);camera.zoom=1;controls.target.set(0,0,0);controls.update();settleUntil=performance.now()+300;requestRender();}
 function reset(){model.group.rotation.set(0,0,0);camera.position.copy(initial);camera.zoom=1;controls.target.set(0,0,0);controls.update();settleUntil=performance.now()+300;requestRender();}
 function visibility(){cancelAnimationFrame(raf);raf=0;last=0;if(!document.hidden)requestRender();}
 function preferenceChanged(){reduced=preference.matches;controls.enableDamping=!reduced;if(reduced)setSpin(false);requestRender();}
 function keyboard(event){if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(event.key)){event.preventDefault();if(event.key==='ArrowLeft'||event.key==='ArrowRight')model.group.rotation.y+=event.key==='ArrowLeft'?-.12:.12;else if(event.key==='ArrowUp'||event.key==='ArrowDown')model.group.rotation.x=THREE.MathUtils.clamp(model.group.rotation.x+(event.key==='ArrowUp'?-.08:.08),-.4,.4);else{camera.zoom=THREE.MathUtils.clamp(camera.zoom*(event.key==='-'?.9:1.1),controls.minZoom,controls.maxZoom);camera.updateProjectionMatrix();}settleUntil=performance.now()+250;requestRender();}}
 const changed=()=>requestRender(),start=()=>{dragging=true;requestRender();},end=()=>{dragging=false;settleUntil=performance.now()+350;requestRender();};controls.addEventListener('change',changed);controls.addEventListener('start',start);controls.addEventListener('end',end);
 const observer=new ResizeObserver(resize);observer.observe(host);document.addEventListener('visibilitychange',visibility);preference.addEventListener('change',preferenceChanged);canvas.addEventListener('keydown',keyboard);
 const api={setSpin,profile,reset,setVisible(value){visible=value;if(!value){cancelAnimationFrame(raf);raf=0;}else{last=0;requestRender();}},dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',visibility);preference.removeEventListener('change',preferenceChanged);canvas.removeEventListener('keydown',keyboard);canvas.removeEventListener('webglcontextlost',lost);controls.dispose();disposeModel(model.group);grid.geometry.dispose();grid.material.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();labels.remove();if(activeViewer===api)activeViewer=null;}};
 function lost(event){if(disposed)return;event.preventDefault();api.dispose();onFallback();}canvas.addEventListener('webglcontextlost',lost);
 activeViewer=api;try{resize();renderer.render(scene,camera);onReady();onSpin(spin);requestRender();}catch{api.dispose();onFallback();return null;}return api;
}
