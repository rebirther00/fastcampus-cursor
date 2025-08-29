# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Korean web development portfolio site called "VIBE CODING" - a static frontend project showcasing web development services. The site features a modern, responsive design with smooth animations and interactive elements.

## Architecture

- **Frontend**: Vanilla HTML, CSS, and JavaScript (no frameworks)
- **Structure**: Single-page application with multiple sections
- **Styling**: CSS custom properties (CSS variables) for theming
- **Authentication**: Mock authentication system with local storage
- **Animations**: CSS animations with Intersection Observer API
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox

## Key Components

### Core Files
- `index.html` - Main HTML structure with all sections
- `style.css` - Complete stylesheet with CSS variables and responsive design
- `script.js` - All JavaScript functionality including animations and auth
- `task.md` - Development task documentation (Korean)

### Main Sections
1. **Navigation** - Fixed header with smooth scroll links
2. **Hero** - Animated landing section with floating tech cards
3. **About** - Company introduction with code window visual
4. **Services** - Grid of service cards with hover effects
5. **Portfolio** - Filterable project showcase
6. **Testimonials** - Auto-rotating customer reviews
7. **Contact** - Contact form with validation
8. **Authentication** - Modal-based login/signup system

## Development Commands

This is a static site with no build process. Common development tasks:

- **Development**: Open `index.html` in a browser or use a local server
- **Live Server**: Use VS Code Live Server extension for hot reload
- **Testing**: Manual testing in browser (no automated tests)
- **Linting**: No specific linting setup (vanilla code)

## Code Organization

### CSS Structure
- CSS variables defined in `:root` for consistent theming
- Responsive breakpoints: 768px (tablet) and 480px (mobile)
- Animations using `@keyframes` for smooth transitions
- Component-based styling (navbar, hero, services, etc.)

### JavaScript Architecture
- Event-driven architecture with `DOMContentLoaded` initialization
- Modular functions for each feature (navigation, animations, auth)
- Mock authentication with localStorage persistence
- Intersection Observer for scroll-triggered animations

### Authentication System
- Mock user data for testing (see `mockUsers` array in script.js)
- Local storage for session persistence
- Modal-based UI for login/signup
- Password validation and strength checking
- 2FA simulation (mock implementation)

## Key Features

### Animations
- Parallax scrolling in hero section
- Intersection Observer for element reveals
- CSS transforms for hover effects
- Smooth scroll navigation

### Authentication Features
- User registration and login
- Password strength validation
- Social login simulation (Google)
- 2FA modal system
- Session management

### Responsive Design
- Mobile-first CSS approach
- Flexible grid layouts
- Touch-friendly interactions
- Collapsible navigation

## Development Notes

### File Structure
```
/
├── index.html      # Main HTML file
├── style.css       # Complete stylesheet
├── script.js       # All JavaScript functionality
├── task.md         # Development tasks (Korean)
└── CLAUDE.md       # This file
```

### Browser Compatibility
- Modern browsers (ES6+ features used)
- CSS Grid and Flexbox support required
- Intersection Observer API support needed

### Testing Credentials
Mock users for testing authentication:
- Email: `minsu@example.com`, Password: `password123`
- Email: `jiyoung@example.com`, Password: `password456` (has 2FA enabled)

## Styling Guidelines

- Use CSS custom properties for consistent theming
- Follow mobile-first responsive design
- Maintain consistent spacing using CSS variables
- Use semantic HTML elements
- Implement accessible form controls

## Common Tasks

### Adding New Sections
1. Add HTML structure to `index.html`
2. Add corresponding CSS styles in `style.css`
3. Add navigation link if needed
4. Update JavaScript for any interactive features

### Modifying Animations
- CSS animations defined in `@keyframes` section
- JavaScript animations use `requestAnimationFrame`
- Intersection Observer triggers are in `initScrollEffects()`

### Extending Authentication
- Modify `mockUsers` array for test data
- Update form validation in corresponding functions
- Add new modal HTML structure if needed
- Implement corresponding JavaScript handlers