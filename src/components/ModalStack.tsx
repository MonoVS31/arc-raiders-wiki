import { AnimatePresence } from 'motion/react';
import WikiModal from './WikiModal';
import type { WikiPanel } from './WikiModal';
export default function ModalStack({
  panels,
  onClose,
}: {
  panels: WikiPanel[];
  onClose: () => void;
}) {
  const panel = panels.at(-1);
  return (
    <AnimatePresence initial={false} mode="wait">
      {panel && (
        <WikiModal key={`${panels.length}-${panel.kind}`} panel={panel} onClose={onClose} />
      )}
    </AnimatePresence>
  );
}
