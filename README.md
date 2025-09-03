# PM PrioBoard

A production-quality, responsive web application for product managers to capture ideas and prioritize them using **ICE** or **RICE** scoring models with interactive **Impact vs Effort** quadrant visualization.

![PM PrioBoard Screenshot](https://via.placeholder.com/800x400?text=PM+PrioBoard+Screenshot)

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
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (or **yarn** 1.22+)
- **Git**: For version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/preksha1200/PM-PrioBoard.git
   cd PM-PrioBoard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables** (optional)
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy dist/ folder to your hosting service
```

## 🛠️ Technology Stack & Framework Support

### Core Technologies
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development with full IntelliSense support
- **Vite**: Lightning-fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for rapid styling

### Data Visualization
- **D3.js**: Interactive Impact vs Effort quadrant charts
- **Custom SVG Components**: Smooth animations and hover effects
- **Responsive Charts**: Adaptive visualizations for all screen sizes

### State Management & Persistence
- **React Hooks**: useState, useEffect for local state management
- **LocalStorage**: Automatic data persistence with migration support
- **CSV Import/Export**: Full-featured data exchange capabilities

### Development Tools
- **ESLint**: Code linting with React-specific rules
- **PostCSS**: CSS processing and optimization
- **Hot Module Replacement**: Instant development feedback

### Supported Browsers
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Deployment Platforms
- **Vercel**: Zero-config deployment (recommended)
- **Netlify**: Static site hosting with CI/CD
- **GitHub Pages**: Free hosting for open-source projects
- **AWS S3 + CloudFront**: Enterprise-grade hosting
- **Docker**: Containerized deployment support

### Production Deployment

To deploy the application to a production environment, follow these steps:

1. Build the application using `npm run build`
2. Preview the production build locally using `npm run preview`
3. Deploy the `dist/` folder to your hosting service

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
