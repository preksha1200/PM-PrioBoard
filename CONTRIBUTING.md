# Contributing to PM PrioBoard

Thank you for your interest in contributing to PM PrioBoard! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm 8.0 or higher (or yarn 1.22+)
- Git for version control
- A GitHub account

### Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/PM-PrioBoard.git
   cd PM-PrioBoard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Configure your local settings
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm test
   ```

## 🎯 How to Contribute

### Types of Contributions
- 🐛 **Bug Reports**: Help us identify and fix issues
- ✨ **Feature Requests**: Suggest new functionality
- 🔧 **Code Contributions**: Submit bug fixes or new features
- 📚 **Documentation**: Improve guides, examples, and API docs
- 🎨 **Design**: UI/UX improvements and accessibility enhancements
- 🧪 **Testing**: Add test coverage and quality assurance

### Before You Start
1. **Check existing issues** to avoid duplicate work
2. **Create an issue** to discuss major changes
3. **Follow our coding standards** and style guide
4. **Write tests** for new functionality
5. **Update documentation** as needed

## 📋 Development Process

### Branch Naming Convention
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(chart): add hover tooltips to quadrant visualization
fix(storage): resolve data persistence issue on page refresh
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): your descriptive message"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a clear, descriptive title
   - Provide detailed description of changes
   - Reference any related issues
   - Include screenshots for UI changes

## 🔧 Code Standards

### TypeScript Guidelines
- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` types when possible
- Use meaningful variable and function names

### React Best Practices
- Use functional components with hooks
- Follow React naming conventions
- Implement proper error boundaries
- Optimize performance with useMemo/useCallback when needed

### CSS/Styling Guidelines
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Ensure accessibility compliance

### Testing Requirements
- Write unit tests for utilities and hooks
- Add integration tests for components
- Maintain minimum 80% code coverage
- Test edge cases and error scenarios

## 🎨 Design Guidelines

### UI/UX Principles
- **Consistency**: Follow established design patterns
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimize for fast loading and smooth interactions
- **Mobile-First**: Responsive design for all screen sizes

### Color Palette
- Primary Red: `#E63946`
- Deep Navy: `#1D3557`
- Ocean Blue: `#457B9D`
- Soft Blue: `#A8DADC`
- Light Cream: `#F1FAEE`
- Terracotta: `#CD8B76`

## 🐛 Bug Reports

### Before Reporting
- Search existing issues to avoid duplicates
- Test with the latest version
- Try to reproduce the issue consistently

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 1.0.0]

**Additional context**
Any other context about the problem.
```

## ✨ Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context, mockups, or examples.
```

## 📚 Documentation

### Documentation Standards
- Use clear, concise language
- Include code examples where helpful
- Keep documentation up-to-date with code changes
- Follow markdown formatting guidelines

### Areas Needing Documentation
- API documentation
- Component usage examples
- Deployment guides
- Troubleshooting guides

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributor graphs
- Special mentions for outstanding contributions

## 📞 Getting Help

### Community Support
- **GitHub Discussions**: Ask questions and share ideas
- **Issues**: Report bugs and request features
- **Email**: preksha.deshmukh@gmail.com for private matters

### Response Times
- **Bug reports**: 24-48 hours
- **Feature requests**: 3-5 days
- **Pull requests**: 2-3 days for initial review

## 📄 License

By contributing to PM PrioBoard, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to PM PrioBoard!** 🎉

Your contributions help make this tool better for product managers everywhere.
