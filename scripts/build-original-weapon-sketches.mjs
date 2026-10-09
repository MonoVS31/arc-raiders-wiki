import { Resvg } from '@resvg/resvg-js';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import * as THREE from '../public/weapons3d/vendor/three.module.min.js';
import { SVGRenderer } from '../public/weapons3d/vendor/SVGRenderer.js';
const dom = new JSDOM();
globalThis.document = dom.window.document;
const context2d = new Proxy(
  {},
  {
    get(_, key) {
      if (key === 'measureText') return () => ({ width: 100 });
      if (key === 'getImageData' || key === 'createImageData')
        return () => ({ data: new Uint8ClampedArray(256 * 256 * 4) });
      if (key === 'createRadialGradient' || key === 'createLinearGradient')
        return () => ({ addColorStop() {} });
      return () => {};
    },
  },
);
dom.window.HTMLCanvasElement.prototype.getContext = () => context2d;
const html = await readFile('armas-3d.html', 'utf8');
const source = html.slice(
  html.indexOf('(function(){') + '(function(){'.length,
  html.indexOf('/* ---------- escena ---------- */'),
);
const sandbox = {
  THREE,
  document,
  localStorage: {
    getItem() {
      return null;
    },
  },
  console,
};
vm.createContext(sandbox);
vm.runInContext(
  source +
    `\nthis.originalModels = DEFS; this.createOriginalModel = (id) => {
const d=DEFS.find(d=>d.id===id); MATS=[]; DECALS=[]; TAG=null; RX=null; BARR=null; NOLOWER=!!PMAG[d.id]||d.id==='ancla'||d.id==='canto'; G=new THREE.Group(); P=makePal(Object.assign({},d.pal,MODPAL[d.id]||{})); d.build(); return G;
};`,
  sandbox,
);
const codes = Object.fromEntries(
  [
    ...(await readFile('src/domain/standalone-weapons.ts', 'utf8')).matchAll(
      /'?(weapon-[a-z-]+)'?:\s*'([a-z]+)'/g,
    ),
  ].map((m) => [m[1], m[2]]),
);
await mkdir('public/weapon-sketches', { recursive: true });
for (const [entityId, code] of Object.entries(codes)) {
  const model = sandbox.createOriginalModel(code);
  const box = new THREE.Box3().setFromObject(model),
    size = box.getSize(new THREE.Vector3());
  model.position.sub(box.getCenter(new THREE.Vector3()));
  const scene = new THREE.Scene();
  scene.add(model);
  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(1, 3, 5);
  scene.add(light);
  const half = Math.max(size.y * 0.78, size.x * 0.3);
  const camera = new THREE.OrthographicCamera(-half * 2, half * 2, half, -half, 0.001, 100);
  camera.position.set(size.x * 0.1, size.y * 0.35, 6);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  const renderer = new SVGRenderer();
  renderer.setSize(960, 480);
  renderer.setPrecision(3);
  renderer.setClearColor('#d8d1c0');
  renderer.render(scene, camera);
  const svg = renderer.domElement;
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('data-original-viewer', code);
  await writeFile(
    'public/weapon-sketches/' + code + '.png',
    new Resvg(svg.outerHTML).render().asPng(),
  );
  model.traverse((o) => {
    o.geometry?.dispose();
  });
  console.log(entityId, code);
}
if (Object.keys(codes).length !== 24) throw Error('Se requieren 24 bocetos');
