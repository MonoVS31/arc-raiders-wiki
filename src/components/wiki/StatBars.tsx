import { numericBarScale, numericBarSeries } from '../../domain/numeric-scale';
import type { Category, Claim } from '../../domain/schema';

export function StatBars({ claim, category }: { claim: Claim; category: Category }) {
  const series = numericBarSeries(claim, category);
  const scale = numericBarScale(claim, category);
  if (series)
    return (
      <div
        className="stat-series"
        aria-hidden="true"
        title="Escala visual del archivo por nivel I–IV"
      >
        {series.map((value, index) => (
          <div className="stat-series-row" key={index}>
            <span>{['I', 'II', 'III', 'IV'][index]}</span>
            <span className="stat-bar">
              <span style={{ transform: `scaleX(${value})` }} />
            </span>
          </div>
        ))}
      </div>
    );
  if (scale === null) return null;
  return (
    <span
      className="stat-bar"
      aria-hidden="true"
      title="Escala visual relativa al mismo campo y unidad en el archivo"
    >
      <span style={{ transform: `scaleX(${scale})` }} />
    </span>
  );
}
