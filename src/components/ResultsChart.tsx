import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import type { Scenario } from '../types';
import { formatCurrency } from '../utils/calculations';

interface Props {
  scenarios: Scenario[];
  showReal: boolean;
  showNominal: boolean;
}

export function ResultsChart({ scenarios, showReal, showNominal }: Props) {
  if (scenarios.length === 0) {
    return (
      <>
        <div className="chart-header">
          <div className="chart-title-group">
            <h2 className="chart-title">Portfolio Growth</h2>
            <p className="chart-subtitle">Visualize your investment trajectories</p>
          </div>
        </div>
        <div className="chart-placeholder">
          <div className="chart-placeholder-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 16l4-4 4 4 5-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="chart-placeholder-text">No scenarios yet</p>
          <p className="chart-placeholder-hint">
            Add your first investment scenario using the form to see growth projections
          </p>
        </div>
      </>
    );
  }

  const maxYears = Math.max(...scenarios.map((s) => s.inputs.years));

  const chartData = Array.from({ length: maxYears + 1 }, (_, year) => {
    const dataPoint: Record<string, number> = { year };

    scenarios.forEach((scenario) => {
      const yearData = scenario.yearlyData.find((d) => d.year === year);
      if (yearData) {
        dataPoint[`${scenario.id}_nominal`] = yearData.nominalValue;
        dataPoint[`${scenario.id}_real`] = yearData.realValue;
      }
    });

    return dataPoint;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-md)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--color-text-tertiary)',
          marginBottom: 'var(--space-sm)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Year {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            marginTop: 'var(--space-xs)',
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: entry.stroke,
            }} />
            <span style={{
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
            }}>
              {entry.name}:
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: entry.stroke,
            }}>
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="chart-header">
        <div className="chart-title-group">
          <h2 className="chart-title">Portfolio Growth</h2>
          <p className="chart-subtitle">
            {scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''} compared over {maxYears} years
          </p>
        </div>
        <div className="chart-legend">
          {showNominal && (
            <div className="legend-item">
              <div className="legend-line nominal" />
              <span>Nominal</span>
            </div>
          )}
          {showReal && (
            <div className="legend-item">
              <div className="legend-line dashed" />
              <span>Real</span>
            </div>
          )}
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={450}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
            <defs>
              {scenarios.map((scenario) => (
                <linearGradient
                  key={`gradient-${scenario.id}`}
                  id={`gradient-${scenario.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={scenario.color} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={scenario.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-subtle)"
              vertical={false}
            />

            <XAxis
              dataKey="year"
              stroke="var(--color-text-tertiary)"
              tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }}
              tickLine={{ stroke: 'var(--color-border-subtle)' }}
              axisLine={{ stroke: 'var(--color-border-subtle)' }}
              label={{
                value: 'Years',
                position: 'insideBottom',
                offset: -15,
                fill: 'var(--color-text-tertiary)',
                fontSize: 12,
              }}
            />

            <YAxis
              tickFormatter={(value) => {
                if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                return `$${value}`;
              }}
              stroke="var(--color-text-tertiary)"
              tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }}
              tickLine={{ stroke: 'var(--color-border-subtle)' }}
              axisLine={{ stroke: 'var(--color-border-subtle)' }}
              width={70}
            />

            <Tooltip content={<CustomTooltip />} />

            {scenarios.map((scenario) => (
              <Area
                key={`area-${scenario.id}`}
                type="monotone"
                dataKey={`${scenario.id}_nominal`}
                fill={`url(#gradient-${scenario.id})`}
                stroke="none"
              />
            ))}

            {scenarios.map((scenario) => (
              showNominal && (
                <Line
                  key={`${scenario.id}_nominal`}
                  type="monotone"
                  dataKey={`${scenario.id}_nominal`}
                  name={`${scenario.name} (Nominal)`}
                  stroke={scenario.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: scenario.color,
                    stroke: 'var(--color-bg-card)',
                    strokeWidth: 2,
                  }}
                />
              )
            ))}

            {scenarios.map((scenario) => (
              showReal && (
                <Line
                  key={`${scenario.id}_real`}
                  type="monotone"
                  dataKey={`${scenario.id}_real`}
                  name={`${scenario.name} (Real)`}
                  stroke={scenarios.length === 1 ? '#f472b6' : scenario.color}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                  strokeOpacity={scenarios.length === 1 ? 1 : 0.7}
                  activeDot={{
                    r: 5,
                    fill: 'var(--color-bg-card)',
                    stroke: scenarios.length === 1 ? '#f472b6' : scenario.color,
                    strokeWidth: 2,
                  }}
                />
              )
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
