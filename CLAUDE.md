# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a digital cannabis production process documentation system built as a React SPA with SurveyJS integration. The system digitizes the paper-based cannabis production process (GACP to GMP transition) for cleanroom staff using a tablet-optimized web application.

## Architecture

### Frontend Stack (Planned)
- **React SPA** - Main application framework
- **SurveyJS** - Core survey/questionnaire framework for the production process catalog
- **Tablet-optimized UI** - Responsive design for touch interaction
- **Client-side only** - No backend, all processing in browser

### Core Components Structure (To Be Implemented)
- `App` - Main application component, route management
- `ProductionOrderManager` - Create/select production orders
- `SurveyComponent` - Main questionnaire using SurveyJS
- `Navigation/Layout` - Tablet-optimized navigation and layout
- `ExportComponent` - JSON and PDF export functionality

### Data Flow
1. Production order selection/creation (JSON-based)
2. Survey initialization with order data
3. Progressive form completion with local storage
4. Export to JSON/PDF (client-side only)

## Key Features

### Production Process Coverage
- **Hierarchical questionnaire** - Process steps > Sub-steps > Questions
- **Conditional logic** - Questions appear based on material type (GACP/GMP) and previous answers
- **Four-eyes principle** - Dual confirmation fields for critical checkpoints
- **Multi-format inputs** - Checkboxes, text, numeric, date/time, signatures
- **Repeatable sections** - Dynamic panels for bulk bag processing

### Material Type Logic
- **GACP Material** - Shows additional quality control questions (IPK, sorting, etc.)
- **GMP Material** - Streamlined process, skips GACP-specific sections
- Controlled via `visibleIf` conditions in SurveyJS JSON

### Data Persistence
- **Local storage** - Progress saved in browser
- **No backend** - All data client-side only
- **Export formats** - JSON (structured) and PDF (human-readable)

## File Structure (To Be Created)

```
/src
  /components
    App.jsx
    ProductionOrderManager.jsx
    SurveyComponent.jsx
    Navigation.jsx
    ExportComponent.jsx
  /data
    surveyDefinition.json     # Main questionnaire structure
    productionOrders.json     # Sample production orders
  /utils
    surveyLogic.js           # Conditional visibility logic
    exportUtils.js           # PDF/JSON export functions
  /styles
    tablet-optimized.css     # Touch-friendly styling
package.json
```

## Development Commands

Since this is a new project, the following commands will need to be set up:

```bash
# Project initialization (not yet done)
npm init -y
npm install react react-dom
npm install survey-react survey-pdf-generator
npm install react-scripts  # or vite

# Development
npm start                   # Start development server
npm run build              # Build for production
npm test                   # Run tests
npm run lint               # Code linting
```

## SurveyJS Integration

### Survey Definition Structure
- **Pages** - Each page typically represents a sub-step
- **Panels** - Group related questions or repeatable sections
- **Elements** - Individual questions with various input types
- **Conditional Logic** - `visibleIf` conditions based on material type and previous answers

### Key Survey Features Used
- Dynamic panels for bulk bag processing
- Conditional visibility for GACP/GMP material types
- Custom validation for required fields
- Multi-format question types (boolean, text, numeric, date)

## Development Guidelines

### Material Type Handling
- Use `{materialType} == 'GACP'` conditions for GACP-specific questions
- GMP material skips sorting, IPK, and additional quality checks
- Implement in `visibleIf` properties of SurveyJS elements

### Tablet Optimization
- Minimum 44px touch targets
- Large fonts (minimum 16px)
- Adequate spacing for touch interaction
- Keyboard-aware scrolling for text inputs

### Data Validation
- Mark critical questions as `isRequired: true`
- Numeric fields with appropriate ranges
- Date/time format validation
- Two-person confirmation fields for quality checkpoints

### Export Requirements
- PDF must include all answered questions with clear formatting
- JSON export for structured data processing
- Client-side generation only (no server calls)
- Filename format: `Protokoll_{orderNumber}_{date}.{extension}`

## Testing Strategy

### Critical Test Areas
- Survey logic with different material types (GACP vs GMP)
- Conditional question display/hiding
- Multi-bulk bag processing flows
- Export functionality (PDF/JSON)
- Tablet responsiveness and touch interaction
- Local storage persistence

### Test Data
- Sample production orders with GACP and GMP materials
- Various bulk bag quantities for testing repeatable sections
- Edge cases for conditional logic

## Compliance Considerations

### GxP Requirements
- Complete audit trail in exported data
- Two-person verification for critical steps
- Proper signature/initial capture
- Timestamp recording for all process steps

### Data Security
- All processing client-side (no server transmission)
- Local storage encryption considerations for production use
- PDF/JSON export security (local download only)

## Known Limitations (MVP)

- No SAP integration (static data only)
- No backend/database persistence
- Simplified signatures (text fields, not digital signatures)
- No user authentication/role management
- No real-time notifications to production management
- German language only

## Future Enhancements (Out of MVP Scope)

- SAP integration for production order data
- Database persistence and user management
- Digital signature compliance (21 CFR Part 11)
- Real-time notifications and workflow integration
- Multi-language support
- Advanced data validation and calculations