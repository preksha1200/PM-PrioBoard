# PM PrioBoard

🚀 **A professional product management prioritization tool** for capturing ideas and prioritizing them using **ICE** or **RICE** scoring models with interactive **Impact vs Effort** quadrant visualization.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-PM_PrioBoard-blue?style=for-the-badge)](http://localhost:5173)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/preksha1200/PM-PrioBoard)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## ✨ Features

### 🎯 **Core Prioritization**
- **🔄 ICE/RICE Toggle**: Seamlessly switch between ICE (Impact × Confidence / Effort) and RICE (Reach × Impact × Confidence / Effort) scoring models
- **📊 Interactive Quadrant Chart**: Visual Impact vs Effort chart with hover effects and data point tooltips
- **📝 Comprehensive Ideas Table**: Professional data table with sorting, editing, and priority highlighting
- **🎨 Professional UI**: Clean, modern interface with consistent color palette and responsive design

### 🤖 **AI-Powered Analysis**
- **🧠 Google Gemini 2.0 Flash Integration**: Real AI-powered idea scoring with detailed reasoning
- **⚡ Enhanced Fallback System**: Intelligent local analysis when AI is unavailable
- **🔍 Model Transparency**: Clear badges showing which AI system powered each analysis
- **📋 Structured Text Parsing**: Bulk input with format: `Title | I:5 | C:0.8 | E:1.5 | R:100 | T:tags`

### 📊 **Data Management**
- **💾 Local Persistence**: Automatic saving to localStorage with data integrity
- **📤 CSV Export**: Export your prioritized ideas for external analysis
- **✏️ Inline Editing**: Click-to-edit functionality with real-time score updates
- **🗑️ Safe Deletion**: Confirmation dialogs prevent accidental data loss

### 🎨 **User Experience**
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🎯 Professional Styling**: Consistent design language with hover effects and smooth transitions
- **🔧 Collapsible Interface**: Expandable Add Ideas section for clean workspace management
- **🏆 Priority Highlighting**: Top 3 ideas automatically highlighted for easy identification

## 🚀 Quick Start

### Prerequisites
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **Git**: For version control
- **Google Gemini API Key**: (Optional) For AI-powered scoring

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/preksha1200/PM-PrioBoard.git
   cd PM-PrioBoard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (Optional - for AI features)
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Google Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```
   
   Get your free API key from: [Google AI Studio](https://aistudio.google.com/app/apikey)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to start using PM PrioBoard!

---

## 🎯 How to Use

### **Adding Ideas**
1. **Click the "+" icon** to expand the Add Ideas section
2. **Choose your input method**:
   - **Bulk Text**: Paste multiple ideas, one per line
   - **Structured Format**: Use `Title | I:5 | C:0.8 | E:1.5 | R:100 | T:feature,ui`
3. **Select scoring method**: Manual or AI Suggested
4. **Add default tags** (optional) to apply to all ideas
5. **Click "Add Ideas"** to process and score your ideas

### **Prioritization**
- **Switch Models**: Toggle between ICE and RICE scoring in the header
- **View Chart**: Analyze ideas on the Impact vs Effort quadrant
- **Review Table**: Sort and review all ideas with calculated scores
- **Edit Ideas**: Click any field in the table to edit values
- **Export Data**: Use the Export CSV button to save your prioritization

### **AI Features**
- **🤖 Gemini Analysis**: When API key is configured, get detailed AI reasoning
- **⚡ Smart Fallback**: Intelligent local analysis when AI is unavailable
- **🔍 Transparency**: See which system powered each analysis

## 🛠️ Technology Stack

### **Frontend Framework**
- **⚛️ React 18** with TypeScript for type-safe development
- **⚡ Vite** for lightning-fast development and building
- **🎨 Custom CSS** with professional styling and responsive design
- **📊 D3.js** for interactive Impact vs Effort quadrant visualization

### **AI Integration**
- **🧠 Google Gemini 2.0 Flash** for advanced idea analysis and scoring
- **📦 @google/genai** package for seamless API integration
- **🔄 Intelligent Fallback** system for offline functionality

### **Data Management**
- **💾 localStorage** for automatic data persistence
- **📤 CSV Export** functionality for external analysis
- **🔄 Real-time Updates** with React state management

### **Development Tools**
- **📝 TypeScript** for enhanced code quality and IntelliSense
- **🔍 ESLint** for code linting and consistency
- **🔧 PostCSS** for advanced CSS processing

---

## 📁 Project Structure

```
PM-PrioBoard/
├── src/
│   ├── App.tsx              # Main application component
│   ├── services/
│   │   └── aiService.ts      # Google Gemini API integration
│   ├── components/           # Reusable UI components
│   ├── types.ts             # TypeScript type definitions
│   └── utils/               # Utility functions
├── public/
│   └── favicon.svg          # Custom PM PrioBoard favicon
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

---

## 🚀 Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy dist/ folder to your hosting service
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini 2.0 Flash** for AI-powered idea analysis
- **D3.js** for powerful data visualization capabilities
- **React & TypeScript** communities for excellent tooling
- **Product Management** community for inspiration and feedback

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/preksha1200/PM-PrioBoard/issues) page
2. Create a new issue with detailed information
3. Review the [CONTRIBUTING.md](CONTRIBUTING.md) guide

**Made with ❤️ for product managers everywhere**
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
