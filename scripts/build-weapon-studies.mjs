// Generador editorial: SVG propios del mismo modelo; no requiere WebGL.
import { readFile,writeFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import * as THREE from '../public/weapons3d/vendor/three.module.min.js';
import { SVGRenderer } from '../public/weapons3d/vendor/SVGRenderer.js';
import { buildModel,disposeModel,palette } from '../public/weapons3d/model.js';
const dom=new JSDOM();globalThis.document=dom.window.document;
const root=new URL('../public/weapons3d/',import.meta.url),entries=JSON.parse(await readFile(new URL('catalog.json',root),'utf8'));
for(const entry of entries){const design=(await import(new URL(entry.file,root))).default;
 for(const [file,isProfile] of [[entry.profile,true],[entry.preview,false]]){
  const scene=new THREE.Scene(),model=buildModel(design,{preview:true});scene.add(model.group);scene.add(new THREE.AmbientLight('#e5e3d3',1.1));const light=new THREE.DirectionalLight('#fff1dc',2.5);light.position.set(2,4,5);scene.add(light);const rim=new THREE.DirectionalLight(palette.teal,1.4);rim.position.set(-4,1,-4);scene.add(rim);
  const width=960,height=480,half=Math.max(model.size.y*.78,model.size.x/2*.65),camera=new THREE.OrthographicCamera(-half*2,half*2,half,-half,.1,60);camera.position.set(isProfile?0:1.9,isProfile?0:1.1,6);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
  const renderer=new SVGRenderer();renderer.setSize(width,height);renderer.setPrecision(3);renderer.setQuality('high');renderer.setClearColor(palette.background);renderer.render(scene,camera);
  const svg=renderer.domElement;svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.setAttribute('role','img');svg.setAttribute('aria-label','Diseño original orientativo de '+design.name);const title=document.createElementNS('http://www.w3.org/2000/svg','title');title.textContent='Estudio original de '+design.name+'; no es una réplica del juego';svg.prepend(title);await writeFile(new URL(file,root),svg.outerHTML);disposeModel(model.group);
 }
}
console.log(`Estudios originales: ${entries.length} modelos, ${entries.length*2} miniaturas y perfiles SVG.`);
