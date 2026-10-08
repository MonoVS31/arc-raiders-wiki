import { entityTransitionName } from '../../app/view-transitions';
import { useEffect, useRef, useState } from 'react';
import { weaponStudyFor, type WeaponViewerController } from '../../domain/weapon-studies';
import { loadWeaponViewer } from '../../domain/weapon-viewer-loader';
import { atlasAsset } from '../../domain/assets';
import '../../styles/weapon-studies.css';
export function WeaponStudyViewer({ entityId, name }: { entityId: string; name: string }) {
  const study = weaponStudyFor(entityId)!;
  const host = useRef<HTMLDivElement>(null),
    controller = useRef<WeaponViewerController | null>(null);
  const [status, setStatus] = useState<'profile' | 'loading' | 'ready' | 'fallback'>('profile'),
    [spin, setSpin] = useState(false);
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    let live = true,
      loading = false,
      entered = false,
      visible = false;
    const fallback = () => {
      if (live) {
        controller.current = null;
        setStatus('fallback');
      }
    };
    const enter = async () => {
      if (loading || entered) return;
      loading = true;
      setStatus('loading');
      try {
        const loaded = await loadWeaponViewer(study.file);
        if (!live || !visible) return;
        entered = true;
        controller.current = loaded.viewer.createWeaponViewer(node, loaded.model, {
          onReady: () => live && setStatus('ready'),
          onFallback: fallback,
          onSpin: (value) => live && setSpin(value),
        });
        controller.current?.setVisible(visible);
      } catch {
        fallback();
      } finally {
        loading = false;
      }
    };
    if (typeof IntersectionObserver === 'undefined') {
      setStatus('fallback');
      return;
    }
    let visibilityFrame = 0;
    const updateVisibility = (value: boolean) => {
      visible = value;
      controller.current?.setVisible(value);
      if (value) void enter();
    };
    // Algunos motores omiten cambios de intersección de elementos dentro de clip-path.
    // La comprobación complementaria solo corre al entrar, desplazar o cambiar tamaño.
    const checkRectangle = () => {
      visibilityFrame = 0;
      if (!live) return;
      const rect = node.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      updateVisibility(
        rect.bottom > 0 &&
          rect.top < window.innerHeight &&
          rect.right > 0 &&
          rect.left < window.innerWidth,
      );
    };
    const scheduleVisibility = () => {
      if (!visibilityFrame) visibilityFrame = window.requestAnimationFrame(checkRectangle);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        updateVisibility(!!entries[0]?.isIntersecting);
        scheduleVisibility();
      },
      { threshold: 0.05 },
    );
    observer.observe(node);
    window.addEventListener('scroll', scheduleVisibility, { passive: true });
    window.addEventListener('resize', scheduleVisibility);
    scheduleVisibility();
    return () => {
      live = false;
      observer.disconnect();
      window.cancelAnimationFrame(visibilityFrame);
      window.removeEventListener('scroll', scheduleVisibility);
      window.removeEventListener('resize', scheduleVisibility);
      controller.current?.dispose();
      controller.current = null;
    };
  }, [study.file]);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (!window.matchMedia) {
      setReduced(true);
      return;
    }
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener?.('change', update);
    return () => preference.removeEventListener?.('change', update);
  }, []);
  const ready = status === 'ready';
  return (
    <section className="weapon-study" aria-label={`Estudio original de ${name}`}>
      <div className="weapon-study-heading">
        <span>ARC ATLAS / ESTUDIO DE SILUETA</span>
        <span>DISEÑO ORIGINAL</span>
      </div>
      <div
        className="weapon-study-stage"
        ref={host}
        data-viewer-state={status}
        style={{ viewTransitionName: entityTransitionName(entityId) }}
      >
        {status !== 'ready' && (
          <img
            className="weapon-study-fallback"
            src={atlasAsset('weapons3d/' + study.profile)}
            alt={`Perfil del diseño original orientativo de ${name}`}
            width={960}
            height={480}
          />
        )}
      </div>
      <div className="weapon-study-controls" role="group" aria-label="Controles del modelo">
        <button
          disabled={!ready || reduced}
          aria-pressed={spin}
          onClick={() => controller.current?.setSpin(!spin)}
        >
          {spin ? 'Pausar' : 'Girar'}
        </button>
        <button disabled={!ready} onClick={() => controller.current?.profile()}>
          Vista de perfil
        </button>
        <button disabled={!ready} onClick={() => controller.current?.reset()}>
          Reiniciar vista
        </button>
      </div>
      <p className="weapon-study-help">
        Arrastrá para rotar · Ruedita o pellizco para acercar · Flechas y +/− con el dibujo
        enfocado.
      </p>
      <p className="weapon-study-note">
        Diseño original orientativo: su forma y sus piezas no representan el arma real del juego.
        Los datos del catálogo conservan sus fuentes.
      </p>
      <span className="weapon-study-status" role="status">
        {status === 'loading'
          ? 'Preparando el modelo…'
          : status === 'fallback'
            ? 'Este navegador muestra el dibujo de perfil.'
            : status === 'profile'
              ? 'Vista de perfil disponible.'
              : reduced
                ? 'Giro automático desactivado por tu preferencia de movimiento.'
                : ''}
      </span>
    </section>
  );
}
