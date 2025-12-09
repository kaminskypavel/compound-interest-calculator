import { useRef, useState, useCallback } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Brush,
  ReferenceLine,
} from 'recharts';
import { toPng } from 'html-to-image';
import type { Scenario } from '../types';
import { formatCurrency } from '../utils/calculations';
import { Button } from '@/components/ui/button';
import { useI18nStore } from '../stores/i18nStore';

type DisplayMode = 'nominal' | 'real' | 'both';

interface Props {
  scenarios: Scenario[];
  showReal: boolean;
  showNominal: boolean;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
}

export function ResultsChart({ scenarios, showReal, showNominal, displayMode, onDisplayModeChange }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isExporting, setIsExporting] = useState(false);
  const { t } = useI18nStore();

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const handleDownloadPng = useCallback(async () => {
    if (!chartRef.current) return;

    setIsExporting(true);
    try {
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: '#0a0a0c',
        pixelRatio: 2,
        style: {
          transform: 'scale(1)',
        },
      });

      const link = document.createElement('a');
      link.download = `compound-growth-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export chart:', err);
    } finally {
      setIsExporting(false);
    }
  }, []);

  if (scenarios.length === 0) {
    return (
      <div className="chart-section-inner">
        <div className="chart-header">
          <div className="chart-title-group">
            <h2 className="chart-title">{t.portfolioGrowth}</h2>
            <p className="chart-subtitle">{t.visualizeTrajectories}</p>
          </div>
        </div>
        <div className="chart-placeholder">
          <div className="chart-placeholder-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 16l4-4 4 4 5-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="chart-placeholder-text">{t.noScenariosYet}</p>
          <p className="chart-placeholder-hint">
            {t.addFirstScenario}
          </p>
        </div>
      </div>
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

    // Filter out Area entries (they don't have stroke) and entries with UUID-like names
    const filteredPayload = payload.filter((entry: any) =>
      entry.stroke && entry.name && !entry.name.includes('_nominal') && !entry.name.includes('_real')
    );

    if (filteredPayload.length === 0) return null;

    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip-header">
          Year {label}
        </div>
        {filteredPayload.map((entry: any, index: number) => (
          <div key={index} className="chart-tooltip-item">
            <div
              className="chart-tooltip-dot"
              style={{ background: entry.stroke }}
            />
            <span className="chart-tooltip-label">
              {entry.name}:
            </span>
            <span
              className="chart-tooltip-value"
              style={{ color: entry.stroke }}
            >
              {formatCurrency(entry.value, t.currency)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const chartHeight = Math.max(400, 400 * (zoomLevel / 100));

  return (
    <div className="chart-section-inner">
      <div className="chart-header">
        <div className="chart-title-group">
          <h2 className="chart-title">{t.portfolioGrowth}</h2>
          <p className="chart-subtitle">
            {t.scenariosCompared(scenarios.length, maxYears)}
          </p>
        </div>

        <div className="chart-controls">
          <div className="display-mode-toggle">
            <button
              type="button"
              className={`mode-btn ${displayMode === 'nominal' ? 'active' : ''}`}
              onClick={() => onDisplayModeChange('nominal')}
            >
              {t.nominal}
            </button>
            <button
              type="button"
              className={`mode-btn ${displayMode === 'real' ? 'active' : ''}`}
              onClick={() => onDisplayModeChange('real')}
            >
              {t.real}
            </button>
            <button
              type="button"
              className={`mode-btn ${displayMode === 'both' ? 'active' : ''}`}
              onClick={() => onDisplayModeChange('both')}
            >
              {t.both}
            </button>
          </div>

          <div className="zoom-controls">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
              className="zoom-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35M8 11h6"/>
              </svg>
            </Button>
            <span className="zoom-level">{zoomLevel}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 200}
              className="zoom-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
              </svg>
            </Button>
            {zoomLevel !== 100 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetZoom}
                className="zoom-reset"
              >
                Reset
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="download-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isExporting ? t.exporting : t.png}
          </Button>
        </div>
      </div>

      <div className="chart-container" ref={chartRef}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                  <stop offset="0%" stopColor={scenario.color} stopOpacity={0.2} />
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
                offset: -10,
                fill: 'var(--color-text-tertiary)',
                fontSize: 12,
              }}
            />

            <YAxis
              tickFormatter={(value) => {
                const symbol = t.currencySymbol;
                if (value >= 1000000) return `${symbol}${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${symbol}${(value / 1000).toFixed(0)}K`;
                return `${symbol}${value}`;
              }}
              stroke="var(--color-text-tertiary)"
              tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }}
              tickLine={{ stroke: 'var(--color-border-subtle)' }}
              axisLine={{ stroke: 'var(--color-border-subtle)' }}
              width={70}
            />

            <Tooltip content={<CustomTooltip />} />

            <Brush
              dataKey="year"
              height={30}
              stroke="var(--color-accent)"
              fill="var(--color-bg-card)"
              travellerWidth={10}
            />

            <ReferenceLine y={0} stroke="var(--color-border)" />

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
    </div>
  );
}
