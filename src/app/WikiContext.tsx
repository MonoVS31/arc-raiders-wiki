import { createContext, useContext } from 'react';
import type { ReactNode, MouseEvent, CSSProperties, Ref } from 'react';
import { entityLink, entityShareLink } from '../domain/navigation';
export interface WikiActions {
  navigate: (id: string, focus?: { blueprintId?: string; arcId?: string }) => void;
  references: (ids: string[]) => void;
  material: (name: string) => void;
}
export const WikiContext = createContext<WikiActions | null>(null);
export const useWiki = () => useContext(WikiContext);
export function WikiLink({
  entityId,
  blueprintId,
  arcId,
  shareable = false,
  children,
  className,
  style,
  ref,
}: {
  entityId: string;
  blueprintId?: string;
  arcId?: string;
  shareable?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLAnchorElement>;
}) {
  const actions = useWiki();
  const base = window.location.href;
  const href = (shareable ? entityShareLink : entityLink)(base, entityId, blueprintId, arcId);
  const click = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      actions &&
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      event.preventDefault();
      actions.navigate(entityId, {
        ...(blueprintId ? { blueprintId } : {}),
        ...(arcId ? { arcId } : {}),
      });
    }
  };
  return (
    <a ref={ref} href={href} className={className} style={style} onClick={click}>
      {children}
    </a>
  );
}
export function Sources({ ids, label = 'Evidencia' }: { ids: string[]; label?: string }) {
  const actions = useWiki();
  return (
    <button
      className="evidence-button"
      type="button"
      aria-haspopup="dialog"
      onClick={() => actions?.references(ids)}
    >
      <span aria-hidden="true">◇</span> {label}
    </button>
  );
}
