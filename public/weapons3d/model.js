import * as THREE from './vendor/three.module.min.js';
export const palette={steel:'#68787d',dark:'#242f38',grip:'#4b5148',teal:'#79c7bb',orange:'#e69a6c',yellow:'#d8bd72',glass:'#90d6cc',outline:'#22313a',background:'#0c121d'};
export function makeGeometry(part){
 let geometry;
 if(part.kind==='box')geometry=new THREE.BoxGeometry(...part.size);
 else if(part.kind==='profile'){
  const shape=new THREE.Shape();part.points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
  geometry=new THREE.ExtrudeGeometry(shape,{depth:part.size[0],bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.025,bevelThickness:.025});geometry.translate(0,0,-part.size[0]/2);
 }else if(part.kind==='tube'){
  const [r,len]=part.size;geometry=new THREE.LatheGeometry([[r*.72,0],[r,0],[r,len*.1],[r*.92,len*.15],[r*.92,len*.95],[r,len],[r*.72,len],[r*.72,0]].map(([x,y])=>new THREE.Vector2(x,y)),12);geometry.rotateZ(-Math.PI/2);
 }else if(part.kind==='ring'){
  geometry=new THREE.TorusGeometry(part.size[0],part.size[1],5,16);if(part.axis==='x')geometry.rotateY(Math.PI/2);
 }else if(part.kind==='drum'){
  geometry=new THREE.CylinderGeometry(part.size[0],part.size[0],part.size[1],12);geometry.rotateX(Math.PI/2);if(part.axis==='x')geometry.rotateY(Math.PI/2);
 }else geometry=new THREE.IcosahedronGeometry(part.size[0],1);
 return geometry;
}
function wearTexture(variant){
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;const ctx=canvas.getContext('2d');if(!ctx)return null;
 ctx.fillStyle=palette.steel;ctx.fillRect(0,0,128,64);
 for(let i=0;i<44;i++){const x=(i*37+variant*11)%128,y=(i*19+variant*7)%64;ctx.strokeStyle=i%2?'#8e9d9955':'#1d283955';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+3+(i%6),y+1);ctx.stroke();}
 ctx.fillStyle='#c7bca8';ctx.font='9px monospace';ctx.fillText('ESTUDIO '+String(variant+1).padStart(2,'0'),8,49);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
export function buildModel(design,{preview=false,colors={}}={}){
 const p={...palette,...colors},accent=p[design.spec.color],materials={};
 for(const key of ['steel','dark','grip','accent','glass','glow']){
  const color=key==='accent'||key==='glow'?accent:p[key];materials[key]=preview?new THREE.MeshLambertMaterial({color,flatShading:true}):new THREE.MeshStandardMaterial({color,roughness:key==='glass'?.3:.82,metalness:key==='grip'?.05:.3,flatShading:true,emissive:key==='glow'?accent:'#000000',emissiveIntensity:key==='glow'?.5:0});
 }
 if(!preview){const texture=wearTexture(design.variant);if(texture){materials.steel.map=texture;materials.steel.color.set('#ffffff');}}
 const group=new THREE.Group();group.name=design.id;
 const edgeMaterial=new THREE.LineBasicMaterial({color:p.outline,transparent:true,opacity:.5});
 for(const part of design.parts){
  const geometry=makeGeometry(part),mesh=new THREE.Mesh(geometry,materials[part.material]);mesh.name=part.name;mesh.position.set(...part.pos);if(part.rotation)mesh.rotation.set(...part.rotation);if(part.scale)mesh.scale.set(...part.scale);
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,25),edgeMaterial);mesh.add(edges);group.add(mesh);
 }
 group.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(group),center=box.getCenter(new THREE.Vector3());group.position.sub(center);group.updateMatrixWorld(true);
 return {group,size:box.getSize(new THREE.Vector3()),anchors:design.anchors.map(anchor=>({...anchor,point:new THREE.Vector3(...anchor.pos)}))};
}
export function disposeModel(group){
 const geometries=new Set(),materials=new Set(),textures=new Set();
 group.traverse(object=>{if(object.geometry)geometries.add(object.geometry);for(const material of Array.isArray(object.material)?object.material:[object.material])if(material){materials.add(material);for(const value of Object.values(material))if(value?.isTexture)textures.add(value);}});
 geometries.forEach(value=>value.dispose());textures.forEach(value=>value.dispose());materials.forEach(value=>value.dispose());
}
