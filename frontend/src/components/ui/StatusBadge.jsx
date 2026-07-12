import './StatusBadge.css';

/**
 * Status badge pill with colored dot — matches design system §6.3.
 * Supports: Available, On Trip, In Shop, Retired, Dispatched, Completed, Draft, Cancelled, Suspended, Off Duty
 */

const STATUS_CLASS_MAP = {
  'Available':   'badge-available',
  'On Trip':     'badge-on-trip',
  'In Shop':     'badge-in-shop',
  'Retired':     'badge-retired',
  'Dispatched':  'badge-dispatched',
  'Completed':   'badge-completed',
  'Draft':       'badge-draft',
  'Cancelled':   'badge-cancelled',
  'Suspended':   'badge-suspended',
  'Off Duty':    'badge-off-duty',
};

export default function StatusBadge({ status }) {
  const cls = STATUS_CLASS_MAP[status] || 'badge-draft';

  return (
    <span className={`status-badge ${cls}`}>
      {status}
    </span>
  );
}
