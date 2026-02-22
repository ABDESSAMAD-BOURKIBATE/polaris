# POLARIS Phase 2: Executive Dashboard Refactoring

## Overview

Phase 2 transforms the monolithic dashboard into a production-ready, modular React/TypeScript frontend with advanced cyber-aesthetic UI, clean data management, and seamless WebSocket integration.

## Architecture

### Directory Structure

```
src/
├── components/
│   ├── layout/          # Structural components
│   │   ├── Header.tsx   # Main application header with status
│   │   └── index.ts
│   ├── metrics/         # KPI and metric displays
│   │   ├── KpiGrid.tsx  # 4-card system metrics grid
│   │   ├── KpiCard.tsx  # Individual metric card
│   │   └── index.ts
│   ├── charts/          # Data visualization
│   │   ├── LiveTrafficChart.tsx  # Real-time threat/traffic chart
│   │   ├── RiskDistribution.tsx  # Donut chart threat breakdown
│   │   └── index.ts
│   ├── feedback/        # Alert and threat display
│   │   ├── ThreatFeed.tsx   # Scrollable alert list
│   │   ├── AlertCard.tsx    # Individual alert component
│   │   └── index.ts
│   └── index.ts         # Root export
├── hooks/
│   ├── useThreatSimulation.ts  # Custom hook for realistic data
│   └── index.ts
├── types/
│   ├── interfaces.ts    # TypeScript type definitions
│   └── index.ts
├── utils/
│   ├── formatters.ts    # Formatting and utility functions
│   └── index.ts
├── App.tsx              # Root application component
├── index.css            # Global styles with glassmorphism
└── main.tsx             # Entry point
```

## Key Components

### 1. `Header` Component
- **Purpose**: Main application branding and system status indicator
- **Props**:
  - `systemStatus: SystemState` - Connection and health status
  - `onExportReport?: () => void` - Export button callback
- **Features**:
  - POLARIS branding with animated logo glow
  - Real-time system status indicator with color coding
  - Export report button

### 2. `KpiGrid` Component
- **Purpose**: Display 4 key performance indicators
- **Metrics**:
  1. System Health (%) - Overall system status
  2. Critical Threats - Active critical-level threats
  3. Peak Anomaly Score (/100) - Highest AI-detected anomaly
  4. Ingestion Rate (EPS) - Events per second

### 3. `LiveTrafficChart` Component
- **Purpose**: Real-time network behavior and threat visualization
- **Features**:
  - Two-line chart: blue for normal traffic, red for threats
  - Dynamic 20-point sliding window
  - Statistics footer with avg traffic, threat count, peak anomaly
  - Smooth animations and color coding

### 4. `RiskDistribution` Component
- **Purpose**: Visual breakdown of threat severity levels
- **Features**:
  - Donut chart showing Critical/High/Suspicious/Info split
  - Interactive legend with percentages
  - Color-coded severity indicators
  - Total threat count summary

### 5. `ThreatFeed` Component
- **Purpose**: Scrollable, auto-updating alert stream
- **Features**:
  - Real-time alert list (up to 12 active alerts)
  - Alert count with critical threat counter
  - Oldest/Latest alert timestamps
  - Severity-based highlighting for critical alerts

### 6. `AlertCard` Component
- **Purpose**: Individual threat/alert display
- **Shows**:
  - Severity badge (Critical/High/Suspicious/Info)
  - Timestamp
  - Description
  - Source (AI Engine/YARA/Rust Agent/Deep Learning)
  - IP address and protocol (when available)
  - Severity score with visual progress bar

## Custom Hook: `useThreatSimulation`

The `useThreatSimulation` hook generates highly realistic threat data for demonstration:

```typescript
const threatState = useThreatSimulation({
  updateInterval: 1000,  // Update every 1 second
  initialAlerts: 4       // Start with 4 alerts
});
```

### Features

1. **Realistic EPS Fluctuations**
   - Baseline traffic with sinusoidal volatility
   - Random spike events (5% chance per cycle)
   - Range: 100-6000 events/second

2. **Threat Generation**
   - 90% low threats (1-5)
   - 8% medium threats (8-18)
   - 2% spike events (25-40)

3. **Anomaly Scores**
   - IsolationForest-style scoring (0-100)
   - Most frequent: 0-30 (normal)
   - Occasional spikes: 60-100 (suspicious)

4. **Alert Management**
   - 15% chance per cycle to generate new alert
   - Auto-aging of old alerts
   - Risk distribution calculation
   - System health derivation from threat count

### Easy Phase 3 Migration

The hook is designed for seamless replacement with real WebSocket data:

```typescript
// Phase 2 (Current): Simulated data
const threatState = useThreatSimulation();

// Phase 3 (Future): Replace hook with real backend
const threatState = useWebSocketStream('ws://backend:8000/ws');
```

The component interface remains identical, ensuring zero App.tsx changes.

## Type System

### Core Types

```typescript
// Metric data point
interface MetricPoint {
  time: string;           // HH:MM:SS format
  threats: number;        // Detected threats count
  traffic: number;        // Events per second
  anomalyScore: number;   // 0-100 score
}

// Individual alert/threat
interface AlertMessage {
  id: number;
  type: 'Critical' | 'High' | 'Suspicious' | 'Info';
  source: 'AI Engine' | 'YARA' | 'Rust Agent' | 'Deep Learning';
  desc: string;           // Threat description
  time: string;           // Timestamp
  severity: number;       // 0-100 score
  ipAddress?: string;
  protocol?: string;
}

// Risk distribution category
interface ThreatData {
  severity: AlertMessage['type'];
  count: number;
  percentage: number;
  id: string;
}

// Full state returned by hook
interface ThreatSimulationState {
  currentMetrics: MetricPoint;
  activeAlerts: AlertMessage[];
  riskDistribution: ThreatData[];
  systemHealth: number;        // 0-100
  peakAnomalyScore: number;    // 0-100
  ingestRate: number;          // EPS
}
```

## UI/UX Features

### Deep Space Theme
- **Base**: `bg-slate-950` (dark space)
- **Accents**: Cyan, blue, red, orange, yellow for severity
- **Background Effects**: Subtle radial gradients with 8% opacity

### Advanced Glassmorphism
- All panels use `.glass-panel` class
- 50% background opacity with gradient
- `backdrop-blur-md` with `-webkit-backdrop-filter` fallback
- Subtle hover effects with increased opacity
- Smooth transitions on all interactive elements

### Threat Highlighting
- **Critical**: Red glow `shadow-[0_0_15px_rgba(239,68,68,0.5)]`
- **High**: Orange glow `shadow-[0_0_12px_rgba(249,115,22,0.4)]`
- **Suspicious**: Yellow glow `shadow-[0_0_10px_rgba(234,179,8,0.3)]`
- **Info**: Blue glow `shadow-[0_0_10px_rgba(59,130,246,0.3)]`

### Typography
- **Headers**: Clean sans-serif, white, bold
- **Data**: Monospace for IPs, times, scores
- **Metadata**: Slate-400 for secondary text
- **Labels**: Uppercase, letter-spaced for technical feel

### Icons
- **Source**: `lucide-react` for semantic meaning
- **Consistent sizing**: 20px for headers, 12px for metadata
- **Color matching**: Icons inherit severity color

## CSS Custom Properties

### Glass Panel
```css
.glass-panel {
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.6) 0%,
    rgba(30, 41, 59, 0.3) 100%
  );
  backdrop-filter: blur(12px);
  border: 1px solid rgba(30, 41, 59, 1);
}
```

### Glow Effects
```css
.glow-critical {
  box-shadow: 0 0 15px rgba(239,68,68,0.5),
              inset 0 0 15px rgba(239,68,68,0.1);
}
```

### Custom Scrollbar
```css
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(100, 116, 139, 0.5);
}
```

## Utility Functions

### Formatters (`utils/formatters.ts`)

- **`formatTimeStamp()`** - Returns HH:MM:SS format timestamp
- **`formatNumber(value)`** - Human-readable numbers (K, M notation)
- **`formatPercentage(value, decimals)`** - Formats as percentage
- **`generateRandomIP()`** - Creates fake IP for demo
- **`getSeverityColor(type)`** - Returns Tailwind color classes
- **`getSeverityGlowColor(type)`** - Returns shadow glow classes
- **`getStatusColor(status)`** - Returns health status color
- **`getStatusBgColor(status)`** - Returns background for status
- **`clamp(value, min, max)`** - Constrains number to range

## Integration with Backend (Phase 3)

### Current Architecture (Phase 2)
```
App.tsx
  └─ useThreatSimulation() [Simulated Data]
     └─ Components [Display only]
```

### Planned Architecture (Phase 3)
```
App.tsx
  └─ useWebSocketStream() [Real WebSocket Connection]
     ├─ FastAPI Backend (ws://localhost:8000/ws)
     ├─ Kafka Consumer
     ├─ YARA Engine
     └─ Components [Display + Real Data]
```

### WebSocket Message Format (Phase 3 Ready)
```typescript
interface WebSocketPayload {
  type: 'METRICS_UPDATE' | 'ALERT' | 'STATUS';
  data: MetricPoint;      // Time, traffic, threats, anomalyScore
  alert?: AlertMessage;   // Optional new alert
}
```

## Performance Optimizations

- **Chart Data**: Limited to 30 points in memory (sliding window)
- **Alert Buffer**: Max 12 active alerts displayed
- **Renders**: Memoized component props to prevent unnecessary re-renders
- **Animations**: GPU-accelerated via CSS transforms
- **Icons**: Lucide-react SVGs are tree-shakeable

## TypeScript Configuration

- **Strict Mode**: Enabled
- **No Implicit Any**: Enforced
- **Strict Null Checks**: On
- **All interfaces fully typed**
- **0 TypeScript Errors**

## Responsive Design

- **Mobile**: Single column layout
- **Tablet (md)**: 2-column KPI grid
- **Desktop (lg)**: Full 4-column KPI, 2-column main view
- **Large Desktop**: Optimized spacing and padding

## Future Enhancements (Phase 3+)

1. **Real WebSocket Integration**
   - Connect to FastAPI backend
   - Real threat data from YARA, Rust agents
   - Live Kafka stream ingestion

2. **Advanced Filtering**
   - Severity level filters
   - Time range selection
   - Source-based filtering

3. **Export Features**
   - PDF report generation
   - CSV time-series export
   - Custom report templates

4. **Machine Learning Insights**
   - Anomaly prediction overlay
   - Threat pattern analysis
   - Forecasting charts

5. **Collaboration Features**
   - Alert annotations
   - Team comments
   - Threat sharing

## Development

### Setup
```bash
npm install
npm run dev
npm run build
npm run lint
```

### Building
- Vite for dev server and production build
- TypeScript compilation via `tsc -b`
- ESLint with React hooks plugin

## Notes for Phase 3

- The `useThreatSimulation` hook can be fully replaced by a `useWebSocketStream` hook
- Component props remain identical
- No changes needed to App.tsx beyond hook import change
- All types are already aligned with expected backend format
- Graphics/styling are production-ready

---

**POLARIS Autonomous Cyber Intelligence Dashboard**  
*Phase 2: Production-Ready Frontend Architecture*  
*Generated: February 2026*
