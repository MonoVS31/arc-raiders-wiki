import { entityTransitionName } from '../../app/view-transitions';
import { standaloneWeaponSketch, standaloneWeaponLink } from '../../domain/standalone-weapons';
import '../../styles/weapon-studies.css';
export function OriginalWeaponSketch({ entityId, name }: { entityId: string; name: string }) {
  return (
    <section className="original-weapon-sketch" aria-label={`Boceto de ${name}`}>
      <a href={standaloneWeaponLink(entityId)} aria-label={`Abrir ${name} en el visor 3D`}>
        <img
          style={{ viewTransitionName: entityTransitionName(entityId) }}
          src={standaloneWeaponSketch(entityId)}
          alt={`Boceto del visor nuevo de ${name}`}
          width={960}
          height={480}
        />
      </a>
      <p>Diseño orientativo · Abrí el visor para girar el arma y explorar sus detalles.</p>
    </section>
  );
}
