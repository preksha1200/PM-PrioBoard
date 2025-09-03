# PM PrioBoard

A production-quality, responsive web application for product managers to capture ideas and prioritize them using **ICE** or **RICE** scoring models with interactive **Impact vs Effort** quadrant visualization.

## ✨ Features

### 🎯 Core Functionality
- **Dual Scoring Models**: Switch between ICE (Impact × Confidence / Effort) and RICE (Reach × Impact × Confidence / Effort)
- **Interactive Quadrant Chart**: D3-powered Impact vs Effort visualization with drag-to-edit functionality
- **AI-Assisted Input**: Smart suggestions for reach, impact, confidence, and effort values
- **Advanced Weights**: Customize scoring formula with exponential weights for each factor
- **Bulk Input**: Paste multiple ideas with structured format parsing

### 📊 Data Management
- **CSV Import/Export**: Full-featured import with validation and export in CSV/Markdown formats
- **Local Persistence**: Automatic saving to localStorage with version migration support
- **Inline Editing**: Click-to-edit table cells with real-time validation
- **Provenance Tracking**: Know which values were set by user vs AI

### 🎨 User Experience
- **Responsive Design**: Mobile-first with desktop enhancements
- **Light/Dark Themes**: Automatic system preference detection with manual toggle
- **Accessibility First**: WCAG AA compliant with screen reader support
- **Keyboard Shortcuts**: Power user features (Ctrl+K for weights, Ctrl+I for input focus)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pm-prioboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

### Build for Production

```bash
# Build the application
npm run build

# Preview the build
npm run preview
```

## 📖 Usage Guide

### Adding Ideas

1. **Simple Format**: One idea per line
   ```
   Improve user onboarding flow
   Add dark mode support
   Migrate to new API
   ```

2. **Structured Format**: Include scoring data
   ```
   Improve onboarding | I:2 | C:0.8 | E:1.5 | R:2000 | T:ui,growth
   Add dark mode | I:1 | C:0.9 | E:0.5 | T:ui
   ```

   **Format Guide**:
   - `I:` Impact (0.25=Tiny, 0.5=Small, 1=Medium, 2=Large, 3=Massive)
   - `C:` Confidence (0.0-1.0)
   - `E:` Effort (person-months, >0)
   - `R:` Reach (people reached, RICE only)
   - `T:` Tags (comma-separated)

### CSV Import Format

Supported columns:
- `title` (required)
- `notes`
- `reach` (RICE only)
- `impact` (0.25, 0.5, 1, 2, or 3)
- `confidence` (0.0-1.0)
- `effort` (>0)
- `tags` (comma-separated)

Example CSV:
```csv
title,impact,confidence,effort,reach,tags
"Improve onboarding",2,0.8,1.5,2000,"ui,growth"
"Add dark mode",1,0.9,0.5,800,"ui"
```

### AI Assistance Modes

- **Manual**: You provide all values
- **Assisted** (default): AI suggests values for missing fields
- **Auto**: AI fills all fields automatically

### Quadrant Chart

- **Quick Wins**: High Impact, Low Effort (top-left)
- **Big Bets**: High Impact, High Effort (top-right)  
- **Maybes**: Low Impact, Low Effort (bottom-left)
- **Time Sinks**: Low Impact, High Effort (bottom-right)

**Interactions**:
- Click points to select ideas
- Drag points to adjust Impact/Effort values
- Point size represents Reach (RICE) or Confidence (ICE)
- Color indicates score quartile

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# AI Configuration
VITE_AI_MODE=stub          # 'stub' (default) or 'llm'
VITE_LLM_ENDPOINT=         # LLM API endpoint (when using 'llm' mode)
VITE_LLM_KEY=              # LLM API key (when using 'llm' mode)
```

### Advanced Weights

Customize the scoring formula by adjusting weights (default: all = 1):
- Values > 1 increase importance
- Values < 1 decrease importance
- Applied as exponents: `(Impact^weight × Confidence^weight) / Effort^weight`

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Visualization**: D3.js for interactive charts
- **State Management**: React hooks with localStorage persistence
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library

### Project Structure
```
src/
├── components/          # React components
│   ├── TopBar.tsx      # Navigation and controls
│   ├── AddIdeasCard.tsx # Bulk input interface
│   ├── IdeasTable.tsx  # Data table with inline editing
│   ├── QuadrantChart.tsx # D3 visualization
│   └── SelectionDrawer.tsx # Detailed editing panel
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── ai/                 # AI interface and implementations
├── types.ts            # TypeScript type definitions
└── score.ts            # Scoring algorithms
```

### Design System: Summer Ocean Breeze

```css
/* Light Theme */
--color-primary-red: #E63946;     /* Primary CTA */
--color-cream: #F1FAEE;           /* Backgrounds */
--color-soft-blue: #A8DADC;       /* Secondary/hover */
--color-ocean-blue: #457B9D;      /* Active/selected */
--color-deep-navy: #1D3557;       /* Primary text */
--color-terracotta: #CD8B76;      /* Tags/badges */
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
- ✅ Scoring functions (ICE/RICE with weights)
- ✅ Structured text parsing
- ✅ CSV import/export round-trip
- ✅ Chart drag interactions
- ✅ Accessibility compliance (axe)

## 🎯 Seed Data

The application comes with 6 sample ideas:
1. Reduce pipeline retry failures via backoff
2. Inline status update generator for PMs
3. Kubeflow run summarizer
4. Improve onboarding copy
5. Model registry diff explainer
6. Idea board quadrant polish

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using React + TypeScript + Vite
- Visualization powered by D3.js
- Icons by Lucide
- Inspired by product management best practices
