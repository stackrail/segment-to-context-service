# Frontend Dashboard

A minimal, production-style Next.js dashboard for real-time event streaming and AI-generated persona visualization.

## Features

✅ **Live Event Stream Dashboard**

- Real-time polling of events (4-second intervals)
- Mock event generation for demo purposes
- Color-coded action badges (purchase, click, view, scroll)
- Responsive card-based UI

✅ **Persona Viewer**

- Search users by tenant_id and user_id
- Display AI-generated personas with confidence scores
- View behavioral signals
- Error states and loading indicators

✅ **Tech Stack**

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS (no external UI libraries)
- Responsive design

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend running on `http://localhost:3000`

### Installation

```bash
cd frontend
npm install
```

### Configuration

Create or update `.env.local`:

```bash
# Backend API base URL (default: http://localhost:3000)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx           # Root layout with navigation
│   ├── globals.css          # Tailwind imports
│   ├── page.tsx             # Dashboard (live events)
│   └── context/
│       └── page.tsx         # Persona viewer
├── components/
│   ├── EventCard.tsx        # Event display component
│   └── ContextCard.tsx      # Persona/context display component
├── lib/
│   └── api.ts               # API client and utilities
├── public/                  # Static files
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

## API Integration

### Endpoints Used

- **GET /context?tenant_id=&user_id=**
  - Fetches user persona/context
  - Returns: `{ data: { persona, confidence, signals } }`
  - Errors: 400 (missing params), 404 (not found)

### Event Stream

For demo purposes, uses mock events with automatic generation. To integrate real events:

1. Create a new API call in `lib/api.ts`
2. Update dashboard to fetch from backend instead of mock data

## UI Components

### Dashboard (`app/page.tsx`)

- Live event stream with polling
- Start/stop controls
- Event count indicator
- Color-coded action types

### Persona Viewer (`app/context/page.tsx`)

- Search form for tenant/user IDs
- Confidence score visualization (progress bar)
- Behavioral signals display
- Error and loading states

## Styling

Uses **Tailwind CSS only** (no additional UI libraries):

- Responsive grid layouts
- Color badges for status
- Clean typography hierarchy
- Hover/focus states

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Notes

- The dashboard uses mock events for demo (polling every 4 seconds)
- "Start/Stop Polling" button controls event stream simulation
- Persona data is fetched live from the backend API
- All API requests use environment-based base URL for flexibility

## Future Enhancements (Not Implemented)

- Real WebSocket event streaming
- User authentication
- Tenant management UI
- Event filtering/search
- Export persona data
- Real LLM integration feedback loop
