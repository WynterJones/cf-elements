# cf-elements

Zero-dependency markup library that renders ClickFunnels-style HTML with inline styles.

It is intended use is for building "ClickFunnels mockups" in LLMs like Claude/ChatGPT/etc, which then can be converted to ClickFunnels ready JSON via the `cf-pagetree-parser` package.

## Installation

### CDN (recommended)

```html
<script src="https://cdn.jsdelivr.net/npm/cf-elements@latest/cf-elements.js"></script>
```

Or with a specific version:

```html
<script src="https://cdn.jsdelivr.net/npm/cf-elements@1.0.0/cf-elements.js"></script>
```

### npm

```bash
npm install cf-elements
```

## Usage

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/cf-elements@latest/cf-elements.js"></script>
</head>
<body>
  <cf-page bg="#ffffff">
    <cf-section pt="80px" pb="80px" bg="#0f172a">
      <cf-row width="wide">
        <cf-col span="12">
          <cf-headline size="48px" color="#ffffff" align="center">
            Hello World
          </cf-headline>
        </cf-col>
      </cf-row>
    </cf-section>
  </cf-page>
</body>
</html>
```

## Available Components

### Layout
- `<cf-page>` - Page container with background
- `<cf-section>` - Section with padding and background
- `<cf-row>` - Row container (narrow, medium, wide, full)
- `<cf-col>` - Column with span (1-12)
- `<cf-flex>` - Flexbox container

### Typography
- `<cf-headline>` - Main headlines (h1-h6)
- `<cf-subheadline>` - Subheadlines
- `<cf-paragraph>` - Body text
- `<cf-list>` - Bulleted/numbered lists

### Media
- `<cf-image>` - Images with sizing options
- `<cf-video>` - Video embeds
- `<cf-icon>` - FontAwesome icons

### Interactive
- `<cf-button>` - Buttons with actions
- `<cf-input>` - Form inputs
- `<cf-textarea>` - Text areas
- `<cf-select>` - Dropdowns

### Decorative
- `<cf-divider>` - Horizontal dividers
- `<cf-progress-bar>` - Progress indicators
- `<cf-countdown>` - Countdown timers

## ClickFunnels Compatibility

This library enforces ClickFunnels limitations:

- No margin-bottom (use `mt` for spacing)
- Unified horizontal padding (`px` not `pl`/`pr`)
- FontAwesome OLD format: `fas fa-check` not `fa-solid fa-check`
- Line heights as percentages: 100%, 110%, 120%, 140%, 160%, 180%
- Single shadow only (no multiple shadows)

## Output

Components render to clean HTML with `data-type` attributes for ClickFunnels conversion:

```html
<div data-type="FlexContainer" style="...">
  <div data-type="Headline" style="...">
    <h2>Hello World</h2>
  </div>
</div>
```

## License

MIT
