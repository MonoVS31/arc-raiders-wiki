import { numericBarScale, numericBarSeries } from '../../domain/numeric-scale';
import type { Category, Claim } from '../../domain/schema';
import type { CSSProperties } from 'react';
import { DiagramFrame } from './DiagramFrame';

export function StatBars({ claim, category }: { claim: Claim; category: Category }) {
  const series = numericBarSeries(claim, category);
  const scale = numericBarScale(claim, category);
  if (series)
    return (
      <DiagramFrame className="diagram-stat-frame" scan={false} decorative>
        <div
          className="stat-series"
          aria-hidden="true"
          title="Escala visual del archivo por nivel I–IV"
        >
          {series.map((value, index) => (
            <div
              className="stat-series-row diagram-stat-reveal"
              key={index}
              style={{ '--diagram-order': index } as CSSProperties}
            >
              <span>{['I', 'II', 'III', 'IV'][index]}</span>
              <span className="stat-bar">
                <span style={{ transform: `scaleX(${value})` }} />
              </span>
            </div>
          ))}
        </div>
      </DiagramFrame>
    );
  if (scale === null) return null;
  return (
    <DiagramFrame className="diagram-stat-frame" scan={false} decorative>
      <span
        className="stat-bar diagram-stat-reveal"
        aria-hidden="true"
        title="Escala visual relativa al mismo campo y unidad en el archivo"
      >
        <span style={{ transform: `scaleX(${scale})` }} />
      </span>
    </DiagramFrame>
  );
}
