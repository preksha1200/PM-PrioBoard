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
- Node.js 18+ 
- npm or yarn

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
