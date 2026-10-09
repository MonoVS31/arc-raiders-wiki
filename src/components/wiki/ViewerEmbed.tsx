import type { StandaloneViewer } from '../../domain/standalone-weapons';
import { entityTransitionName } from '../../app/view-transitions';
import '../../styles/weapon-studies.css';

// Visor 3D original metido dentro de la ficha (modo ?embed: sin encabezado ni lista).
export function ViewerEmbed({
  entityId,
  viewer,
  name,
}: {
  entityId: string;
  viewer: StandaloneViewer;
  name: string;
}) {
  return (
    <section className="viewer-embed" aria-label={`Visor 3D de ${name}`}>
      <div
        className="viewer-embed-frame"
        style={{ viewTransitionName: entityTransitionName(entityId) }}
      >
        <iframe
          src={viewer.embed}
          title={`Visor 3D de ${name}`}
          loading="lazy"
          allow="fullscreen"
        />
      </div>
      <p className="viewer-embed-note">
        <span>
          Diseño original orientativo · Girá el modelo, usá «Desarme» y tocá los puntos para ver
          cada dato.
        </span>
        <a href={viewer.link}>Abrir en pantalla completa</a>
      </p>
    </section>
  );
}
