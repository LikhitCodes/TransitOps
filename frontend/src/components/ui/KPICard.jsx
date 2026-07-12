import { useState, useEffect, useRef } from 'react';
import './KPICard.css';

/**
 * KPI Card with animated counter — matches design system §6.7.
 * Props:
 *   label       — overline label text (e.g. "ACTIVE VEHICLES")
 *   value       — target numeric value
 *   suffix      — optional suffix (e.g. "%" for Fleet Utilization)
 *   accentColor — 'green' | 'blue' | 'amber' | 'orange'
 */
export default function KPICard({ label, value, suffix = '', accentColor = 'green' }) {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const duration = 800; // ms
    const target = typeof value === 'number' ? value : parseInt(value, 10) || 0;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return (
    <div className={`kpi-card kpi-card--${accentColor}`}>
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">
        {String(displayValue).padStart(2, '0')}{suffix}
      </span>
    </div>
  );
}
