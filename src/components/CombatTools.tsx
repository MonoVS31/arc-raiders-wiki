import { useState } from 'react';
import { catalog, sourceById } from '../domain/catalog';
import { combatClaim, grenadeGeometry, weaponTiers, withinReportedRadius } from '../domain/combat';
import type { Claim, Entity } from '../domain/schema';
import '../styles/combat.css';
import portraits from '../data/arc-portraits.json';

function Evidence({ claim }: { claim: Claim | undefined }) {
  if (!claim) return <span className="unknown">Pendiente de verificar</span>;
  return <div className="combat-evidence"><strong>{claim.value === null ? 'Pendiente de verificar' : `${claim.value}${claim.unit ? ` ${claim.unit}` : ''}`}</strong><span className={`confidence ${claim.confidence.replaceAll(' ', '-')}`}>{claim.confidence}</span>{claim.note && <p>{claim.note}</p>}<div className="source-links">{claim.sourceIds.map(id => { const source = sourceById.get(id); return source && <a key={id} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>; })}</div></div>;
}
function Tier({ entity }: { entity: Entity }) {
  const tiers = weaponTiers(entity.id);
  const [tier, setTier] = useState(tiers[0] ?? '');
  return <div className="tier-card"><label>Nivel de {entity.name}<select value={tier} onChange={event => setTier(event.target.value)} disabled={tiers.length < 2}>{tiers.map(value => <option key={value}>{value}</option>)}</select></label>{['II', 'III', 'IV'].includes(tier) ? <Evidence claim={combatClaim(entity.id, `${entity.name} ${tier} mejoras`)} /> : <p>Valores base. No se aplica un aumento de daño sin evidencia.</p>}</div>;
}
export function WeaponComparison({ entity }: { entity: Entity }) {
  const weapons = catalog.entities.filter(item => item.category === 'weapon' && item.availability === 'disponible' && item.id !== entity.id);
  const [otherId, setOtherId] = useState(weapons[0]?.id ?? '');
  const other = weapons.find(item => item.id === otherId);
  if (!other) return null;
  const fields = [['Damage', 'Daño base'], ['Magazine Size', 'Cargador'], ['Ammo Type', 'Munición'], ['Firing Mode', 'Disparo'], ['ARC Armor Penetration', 'Penetración ARC'], ['Fire Rate', 'Cadencia declarada'], ['Range', 'Alcance declarado']];
  return <section className="combat-tool"><h3>Comparar armas y niveles</h3><label>Comparar con<select value={otherId} onChange={event => setOtherId(event.target.value)}>{weapons.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><div className="combat-pair"><Tier key={entity.id} entity={entity}/><Tier key={other.id} entity={other}/></div><p className="muted">Las mejoras se muestran por separado. La escala de alcance no se convierte a metros ni la cadencia a daño por segundo.</p><div className="combat-table"><table><thead><tr><th>Campo</th><th>{entity.name}</th><th>{other.name}</th></tr></thead><tbody>{fields.map(([field, title]) => <tr key={field}><th>{title}</th><td><Evidence claim={combatClaim(entity.id, field!)}/></td><td><Evidence claim={combatClaim(other.id, field!)}/></td></tr>)}</tbody></table></div></section>;
}
export function ARCCombatPanel({ entity }: { entity: Entity }) {
  const [field, setField] = useState('punto débil');
  const [imageFailed, setImageFailed] = useState(false);
  const portrait = portraits.portraits.find(item => item.entityId === entity.id);
  const tabs = ['punto débil', 'blindaje', 'consejo'];
  return <section className="combat-tool"><h3>Preparar el combate</h3>{portrait && <figure className="arc-portrait">{imageFailed ? <p>La imagen de referencia no está disponible. Los datos de combate siguen accesibles.</p> : <img src={portrait.imageUrl} alt={`Referencia visual de ${entity.name}`} loading="lazy" referrerPolicy="no-referrer" onError={() => setImageFailed(true)}/>}<figcaption>Referencia visual probable vía <a href="https://metaforge.app/arc-raiders" target="_blank" rel="noreferrer">MetaForge</a>. Assets © Embark Studios. <a href={sourceById.get(portraits.sourceId)?.url} target="_blank" rel="noreferrer">Fuente de identidad ↗</a>. No marca zonas de impacto.</figcaption></figure>}<div className="combat-tabs" aria-label="Información de combate">{tabs.map(tab => <button key={tab} aria-pressed={field === tab} onClick={() => setField(tab)}>{tab}</button>)}</div><div className="combat-focus" key={field}><Evidence claim={combatClaim(entity.id, field)}/></div><p className="muted">El blindaje describe una categoría. No equivale a un porcentaje de resistencia ni a un modelo de zonas de impacto.</p></section>;
}
export function GrenadeEffectPanel({ entity }: { entity: Entity }) {
  const geometry = grenadeGeometry(entity.id);
  const [distance, setDistance] = useState(0);
  const [target, setTarget] = useState('ARC');
  const hasStun = combatClaim(entity.id, 'ARC Stun Duration') || combatClaim(entity.id, 'Raider Stun Duration');
  return <section className="combat-tool"><h3>Explorar el efecto</h3><Evidence claim={combatClaim(entity.id, 'efecto')}/>{geometry ? <><p>Radio declarado de {geometry.kind}: {geometry.radius} m. La figura muestra distancia geométrica; no calcula daño ni obstáculos.</p><svg className="effect-diagram" viewBox="0 0 240 180" role="img" aria-label={`Radio de ${geometry.kind}: ${geometry.radius} metros`}><path d="M0 90H240M120 0V180" stroke="currentColor" opacity=".2"/><circle className="effect-pulse" cx="120" cy="90" r="65" fill="currentColor" fillOpacity=".12" stroke="currentColor"/><circle cx="120" cy="90" r="4" fill="currentColor"/><circle cx={120 + distance / geometry.radius * 65} cy="90" r="6" fill="#ffcc73"/><text x="8" y="168" fill="currentColor">{geometry.kind === 'búsqueda' ? 'Búsqueda de objetivo ARC' : 'Área del efecto declarado'}</text></svg><label>Distancia: {distance.toFixed(1)} m<input type="range" min="0" max={geometry.radius * 1.5} step="0.1" value={distance} onChange={event => setDistance(Number(event.target.value))}/></label><p aria-live="polite">{withinReportedRadius(distance, geometry.radius) ? 'Dentro' : 'Fuera'} del radio geométrico declarado. No garantiza impacto.</p><Evidence claim={geometry.claim}/></> : <p className="notice">No hay un radio circular verificado que permita dibujar el efecto completo de esta granada.</p>}{hasStun && <><label>Consultar aturdimiento<select value={target} onChange={event => setTarget(event.target.value)}><option>ARC</option><option>Raider</option></select></label><Evidence claim={combatClaim(entity.id, `${target} Stun Duration`)}/></>}<p className="muted">El radio puede corresponder a humo, distracción o búsqueda. No debe interpretarse automáticamente como una explosión que causa daño.</p></section>;
}
