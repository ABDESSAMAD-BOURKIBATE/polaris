# POLARIS Phase 2 - Developer Guide

## Quick Start

### Installation
```bash
cd frontend
npm install
npm run dev
```

The dashboard will start at `http://localhost:5173`

### Build for Production
```bash
npm run build
npm run preview
```

### Linting
```bash
npm run lint
```

## File Structure Overview

```
frontend/src/
├── App.tsx                  # Root component - orchestrates all sub-components
├── App.css                  # Application-level styles
├── index.css               # Global styles with tailwind imports
├── main.tsx                # React entry point
│
├── components/             # Reusable UI components
│   ├── layout/            # Page structure components
│   │   └── Header.tsx     # App header with logo & status
│   ├── metrics/           # KPI display components
│   │   ├── KpiGrid.tsx    # 4-card metrics grid
│   │   └── KpiCard.tsx    # Single metric card
│   ├── charts/            # Data visualization components
│   │   ├── LiveTrafficChart.tsx    # Real-time threat/traffic
│   │   └── RiskDistribution.tsx    # Threat severity donut
│   └── feedback/          # Alert/threat display components
│       ├── ThreatFeed.tsx # Alert list container
│       └── AlertCard.tsx  # Individual alert/threat
│
├── hooks/                  # Custom React hooks
│   └── useThreatSimulation.ts     # Data generation (Phase 2)
│
├── types/                  # TypeScript interfaces
│   └── interfaces.ts       # All type definitions
│
└── utils/                  # Utility functions
    └── formatters.ts       # Formatting & helper functions
```

## Component Communication Flow

```
App.tsx (Root)
│
├─ useThreatSimulation()  ──────────────── Generates mock data
│  └─ Returns: ThreatSimulationState
│
├─ Header
│  └─ Props: systemStatus, onExportReport()
│
├─ KpiGrid
│  └─ Props: ThreatSimulationState
│     ├─ KpiCard (System Health)
│     ├─ KpiCard (Critical Threats)
│     ├─ KpiCard (Peak Anomaly)
│     └─ KpiCard (Ingestion Rate)
│
├─ LiveTrafficChart
│  └─ Props: MetricPoint[]
│
├─ RiskDistribution
│  └─ Props: ThreatData[]
│
└─ ThreatFeed
   └─ Props: AlertMessage[]
      └─ AlertCard (rendered for each alert)
```

## State Management

### Current (Phase 2)

```typescript
// In App.tsx
const threatState = useThreatSimulation({ updateInterval: 1000 });
const [dataHistory, setDataHistory] = useState<MetricPoint[]>([]);

// threatState contains:
{
  currentMetrics: MetricPoint,      // Current data point
  activeAlerts: AlertMessage[],     // Up to 12 active alerts
  riskDistribution: ThreatData[],   // Threat breakdown
  systemHealth: number,              // 0-100 %
  peakAnomalyScore: number,         // 0-100
  ingestRate: number                // Events/sec
}
```

### Future (Phase 3)

Replace the hook with:

```typescript
const threatState = useWebSocketStream({
  url: 'ws://backend:8000/ws/stream',
  onError: handleWebSocketError
});

// Interface remains identical - no component changes needed!
```

## Modifying Components

### Adding a New KPI Card

1. Update `ThreatSimulationState` interface in `types/interfaces.ts`
2. Modify `useThreatSimulation.ts` to generate the new metric
3. Add new `<KpiCard>` to `KpiGrid.tsx`

Example:
```typescript
// types/interfaces.ts
interface ThreatSimulationState {
  // ... existing fields
  networkLatency: number;  // ADD THIS
}

// hooks/useThreatSimulation.ts
setState(prev => ({
  ...prev,
  networkLatency: Math.random() * 150 + 50  // 50-200ms
}));

// components/metrics/KpiGrid.tsx
<KpiCard
  title="Network Latency"
  value={Math.round(state.networkLatency)}
  unit="ms"
  icon={Zap}
  status={state.networkLatency < 100 ? 'healthy' : 'warning'}
/>
```

### Creating a New Chart Component

1. Create new file in `components/charts/`
2. Import `recharts` components
3. Define interface for props
4. Export and add to `components/charts/index.ts`
5. Import and render in `App.tsx`

Example:
```typescript
// components/charts/LatencyTrend.tsx
import { LineChart, Line, XAxis, YAxis, ... } from 'recharts';
import type { MetricPoint } from '../../types/interfaces';

interface LatencyTrendProps {
  data: MetricPoint[];
}

export const LatencyTrend = ({ data }: LatencyTrendProps) => {
  return (
    <div className="glass-panel p-6">
      {/* Component content */}
    </div>
  );
};
```

## Styling Guide

### Color System

| Severity | Tailwind Class | RGB Value | Use Case |
|----------|---|---|---|
| Critical | `red-500/red-400` | 239, 68, 68 | System failures, critical alerts |
| High | `orange-500/orange-400` | 249, 115, 22 | High-priority threats |
| Suspicious | `yellow-500/yellow-400` | 234, 179, 8 | Unusual but not confirmed threat |
| Info | `blue-500/blue-400` | 59, 130, 246 | Informational logs |
| Healthy | `emerald-500/emerald-400` | 16, 185, 129 | All systems normal |
| Neutral | `slate-*` | Various | Text, borders, backgrounds |

### Layout Classes

```typescript
// Full-width container with background effects
<div className="min-h-screen bg-slate-950">

// Content wrapper with padding
<div className="relative z-10 p-6">

// Glassmorphic panel
<div className="glass-panel p-6">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// Flexbox centering
<div className="flex items-center justify-between">

// Scrollable container with custom scrollbar
<div className="overflow-y-auto custom-scrollbar">
```

### Typography

```typescript
// Headers
<h1 className="text-3xl font-black tracking-tight text-white">POLARIS</h1>
<h2 className="text-lg font-semibold">Section Title</h2>

// Body text
<p className="text-slate-400">Secondary text</p>

// Monospace (for IPs, times, scores)
<span className="font-mono text-slate-300">192.168.1.1</span>

// Badges/Labels
<span className="text-xs font-bold px-2 py-1 rounded-full uppercase">CRITICAL</span>
```

### Shadow & Glow Effects

```typescript
// Subtle shadow
<div className="shadow-lg shadow-blue-500/20">

// Glow effect classes (defined in index.css)
<div className="glow-critical">Critical Alert</div>
<div className="glow-warning">Warning Alert</div>
<div className="glow-info">Info</div>

// Animated glow
<div className="animate-cyber-pulse">Pulsing Element</div>
```

## Data Flow for Developers

### Adding a New Alert Type

1. Update `AlertMessage` type in `types/interfaces.ts`:
```typescript
interface AlertMessage {
  // ... existing fields
  tags?: string[];  // ADD THIS
}
```

2. Update alert generation in `useThreatSimulation.ts`:
```typescript
const generateAlert = useCallback((): AlertMessage => {
  // ... existing code
  return {
    // ... existing fields
    tags: ['network', 'security']  // ADD THIS
  };
}, [alertCounter]);
```

3. Display in `AlertCard.tsx`:
```typescript
{alert.tags && (
  <div className="flex gap-2 flex-wrap mt-2">
    {alert.tags.map(tag => (
      <span key={tag} className="text-xs bg-slate-800 px-2 py-1 rounded">
        {tag}
      </span>
    ))}
  </div>
)}
```

## Performance Considerations

### Memory Management

- **Data History**: Max 30 points (size ~3KB)
- **Active Alerts**: Max 12 alerts (size ~5KB)
- **Risk Distribution**: Always 4 entries (size <1KB)
- **Total Memory**: < 10KB for state

### Render Optimization

1. Components use props for data (no deep context nesting)
2. Parent (`App.tsx`) manages all state updates
3. Charts use `isAnimationActive={false}` for smooth performance
4. Scroll containers have `custom-scrollbar` for 60fps scrolling

### Time Complexity

- Hook update: O(n) where n = alert count (max 12)
- Chart render: O(m) where m = data points (max 30)
- Total per cycle: O(42) = constant time

## Common Tasks

### Disable Threat Simulation

Replace in `App.tsx`:
```typescript
// Remove useThreatSimulation hook
// const threatState = useThreatSimulation(...);

// Use static data instead
const threatState: ThreatSimulationState = {
  currentMetrics: { time: '00:00:00', threats: 0, traffic: 0, anomalyScore: 0 },
  activeAlerts: [],
  riskDistribution: [...],
  systemHealth: 85,
  peakAnomalyScore: 0,
  ingestRate: 0
};
```

### Connect to Real Backend

1. Create `hooks/useWebSocketStream.ts`:
```typescript
export const useWebSocketStream = (url: string) => {
  const [state, setState] = useState<ThreatSimulationState>({...});
  
  useEffect(() => {
    const ws = new WebSocket(url);
    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      // Update state from backend
      setState(prev => updateFromBackend(prev, payload));
    };
    return () => ws.close();
  }, []);

  return state;
};
```

2. Update `App.tsx`:
```typescript
const threatState = useWebSocketStream('ws://backend:8000/ws');
// No other changes needed!
```

### Add Dark Mode Toggle

1. Create theme context
2. Wrap App in ThemeProvider
3. Apply `dark:` Tailwind classes
4. Add toggle in Header

Note: Current design is already dark mode focused

### Export PDF Report

Extend `handleExportReport` in `App.tsx`:
```typescript
import html2pdf from 'html2pdf.js';

const handleExportReport = () => {
  const element = document.getElementById('report-content');
  html2pdf().set({
    margin: 10,
    filename: `polaris-report-${Date.now()}.pdf`,
    image: { type: 'png', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  }).save(element);
};
```

## Testing

### Unit Tests (Example with Vitest)

```typescript
// formatters.test.ts
import { describe, it, expect } from 'vitest';
import { formatNumber, clamp } from './formatters';

describe('formatters', () => {
  it('should format large numbers to K notation', () => {
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(1000000)).toBe('1.0M');
  });

  it('should clamp values within range', () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-10, 0, 100)).toBe(0);
  });
});
```

### Component Tests (Example with React Testing Library)

```typescript
// AlertCard.test.tsx
import { render, screen } from '@testing-library/react';
import { AlertCard } from './AlertCard';
import type { AlertMessage } from '../../types/interfaces';

it('should display alert severity badge', () => {
  const alert: AlertMessage = {
    id: 1,
    type: 'Critical',
    source: 'AI Engine',
    desc: 'Test alert',
    time: '12:34:56',
    severity: 95
  };

  render(<AlertCard alert={alert} />);
  expect(screen.getByText('Critical')).toBeInTheDocument();
});
```

## Debugging

### Debug Mode

Enable logging in `useThreatSimulation.ts`:
```typescript
const DEBUG = true;

if (DEBUG) {
  console.log('Simulation state:', state);
  console.log('Active alerts:', state.activeAlerts.length);
}
```

### Chrome DevTools

1. **React DevTools**: Inspect component props/state
2. **Network Tab**: Monitor WebSocket messages (Phase 3)
3. **Performance Tab**: Profile render times

### Browser Console

```javascript
// Check current state
window.__POLARIS_STATE__ = threatState;  // (add in App.tsx)

// Monitor updates
console.log('Data history length:', dataHistory.length);
console.log('Active alerts:', threatState.activeAlerts);
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Charts not rendering | Ensure data array has > 1 point |
| Styling looks wrong | Run `npm install` to ensure tailwindcss installed |
| High CPU usage | Reduce `updateInterval` in useThreatSimulation |
| WebSocket fails (Phase 3) | Check backend URL, ensure CORS headers |
| Type errors | Run `npm run build` to check TypeScript |

## Environment Variables (Phase 3)

Create `.env`:
```env
VITE_WS_URL=ws://localhost:8000/ws
VITE_API_URL=http://localhost:8000
VITE_DEBUG=false
```

Access in code:
```typescript
const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
```

## Contributing

### Code Style
- Use TypeScript strict mode
- Prefer functional components and hooks
- Destructure props in function signature
- Use meaningful variable names

### Commit Messages
```
feat: Add threat severity filter to ThreatFeed
fix: Correct anomaly score calculation in useThreatSimulation
refactor: Extract AlertCard styling to tailwind utilities
docs: Update Phase 2 architecture guide
```

### Pull Request Process
1. Create feature branch: `git checkout -b feat/feature-name`
2. Make changes with commits
3. Run `npm run lint` and fix any errors
4. Submit PR with description of changes
5. Request review from team

---

**POLARIS Development Guide - Phase 2**  
*Last Updated: February 2026*
