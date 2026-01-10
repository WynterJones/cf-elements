/**
 * ============================================================================
 * FUNNELWIND WEB COMPONENTS - cf-elements.js
 * ============================================================================
 *
 * A zero-dependency Web Components library that generates ClickFunnels
 * compatible HTML with inline styles. No CSS framework required.
 *
 * USAGE:
 *   <script src="cf-elements.js"></script>
 *
 *   <cf-page bg="#ffffff">
 *     <cf-section pt="80px" pb="80px" bg="#0f172a">
 *       <cf-row width="wide">
 *         <cf-col span="12">
 *           <cf-headline size="48px" color="#ffffff" align="center">
 *             Hello World
 *           </cf-headline>
 *         </cf-col>
 *       </cf-row>
 *     </cf-section>
 *   </cf-page>
 *
 * OUTPUT: Clean HTML with data-type attributes for ClickFunnels conversion
 *
 * ============================================================================
 * CLICKFUNNELS LIMITATIONS (enforced by this library)
 * ============================================================================
 *
 * - NO margin-bottom (only margin-top via mt attribute)
 * - Horizontal padding is unified (px, not pl/pr separately)
 * - FontAwesome OLD format only: "fas fa-check" not "fa-solid fa-check"
 * - Line heights as percentages: 100%, 110%, 120%, 140%, 160%, 180%
 * - FlexContainer always centered (margin: 0 auto)
 * - All borders share same width/style on all sides
 * - Only ONE shadow allowed (no multiple shadows)
 * - Sections always horizontally centered, can use 100% width fullContainer
 *
 * ============================================================================
 */

(function () {
  "use strict";

  // ==========================================================================
  // LOADING STATE - Prevent Flash of Unstyled Content (FOUC)
  // ==========================================================================

  // Inject loading state CSS immediately to hide content until rendered
  (function injectLoadingStyles() {
    const style = document.createElement('style');
    style.id = 'cf-loading-styles';
    style.textContent = `
      /* Hide cf-page until rendered to prevent FOUC */
      cf-page:not([data-rendered="true"]) {
        opacity: 0 !important;
      }
      cf-page[data-rendered="true"] {
        opacity: 1;
        transition: opacity 0.1s ease-in;
      }
    `;
    // Insert at the start of head to ensure it's applied immediately
    if (document.head) {
      document.head.insertBefore(style, document.head.firstChild);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.head.insertBefore(style, document.head.firstChild);
      });
    }
  })();

  // ==========================================================================
  // BACKGROUND STYLES - Inject CSS for background image classes
  // ==========================================================================

  // Inject background styles immediately
  (function injectBgStyles() {
    const style = document.createElement('style');
    style.id = 'cf-bg-styles';
    style.textContent = `
      /* Background style classes - matches ClickFunnels options */
      .bgCover { background-size: cover !important; background-repeat: no-repeat !important; }
      .bgCoverCenter { background-size: cover !important; background-position: center center !important; background-repeat: no-repeat !important; }
      .bgCoverV2 { background-attachment: fixed !important; background-size: cover !important; background-position: center center !important; background-repeat: no-repeat !important; }
      .bgW100 { background-size: 100% auto !important; background-repeat: no-repeat !important; }
      .bgW100H100 { background-size: 100% 100% !important; background-repeat: no-repeat !important; }
      .bgNoRepeat { background-repeat: no-repeat !important; }
      .bgRepeat { background-repeat: repeat !important; }
      .bgRepeatX { background-repeat: repeat-x !important; }
      .bgRepeatY { background-repeat: repeat-y !important; }
    `;
    if (document.head) {
      document.head.appendChild(style);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.head.appendChild(style);
      });
    }
  })();

  // ==========================================================================
  // GOOGLE FONTS - Auto-load fonts from font attributes
  // ==========================================================================

  // System fonts that don't need to be loaded from Google
  const SYSTEM_FONTS = new Set([
    'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
    'ui-sans-serif', 'ui-serif', 'ui-monospace', 'ui-rounded',
    'arial', 'helvetica', 'times new roman', 'times', 'courier new', 'courier',
    'verdana', 'georgia', 'palatino', 'garamond', 'bookman', 'tahoma',
    'trebuchet ms', 'arial black', 'impact', 'comic sans ms', 'inherit'
  ]);

  // Track which fonts have been loaded to avoid duplicates
  const loadedFonts = new Set();

  /**
   * Extract Google Font names from the document
   * Scans font attributes on cf-* elements and styleguide data
   */
  function extractFontsFromDocument() {
    const fonts = new Set();

    // 1. Extract from font attributes on elements
    document.querySelectorAll('[font]').forEach(el => {
      const font = el.getAttribute('font');
      if (font) {
        // Clean and add font name
        const cleanFont = font.replace(/["']/g, '').split(',')[0].trim();
        if (cleanFont && !SYSTEM_FONTS.has(cleanFont.toLowerCase())) {
          fonts.add(cleanFont);
        }
      }
    });

    // 2. Extract from styleguide data if present
    const styleguideEl = document.getElementById('cf-styleguide-data');
    if (styleguideEl) {
      try {
        const data = JSON.parse(styleguideEl.textContent);
        if (data.typography) {
          const { headlineFont, subheadlineFont, contentFont } = data.typography;
          [headlineFont, subheadlineFont, contentFont].forEach(font => {
            if (font && !SYSTEM_FONTS.has(font.toLowerCase())) {
              fonts.add(font);
            }
          });
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    // 3. Extract from inline font-family styles in cf-* elements
    document.querySelectorAll('cf-headline, cf-subheadline, cf-paragraph, cf-button').forEach(el => {
      const style = el.getAttribute('style') || '';
      const match = style.match(/font-family:\s*["']?([^"';,]+)/i);
      if (match) {
        const font = match[1].trim();
        if (font && !SYSTEM_FONTS.has(font.toLowerCase())) {
          fonts.add(font);
        }
      }
    });

    return fonts;
  }

  /**
   * Inject Google Fonts stylesheet into document head
   */
  function injectGoogleFonts(fonts) {
    if (!fonts || fonts.size === 0) return;

    // Filter out already loaded fonts
    const newFonts = Array.from(fonts).filter(f => !loadedFonts.has(f));
    if (newFonts.length === 0) return;

    // Mark as loaded
    newFonts.forEach(f => loadedFonts.add(f));

    // Build Google Fonts URL
    const fontParams = newFonts
      .map(font => font.replace(/ /g, '+'))
      .join('&family=');

    const url = `https://fonts.googleapis.com/css2?family=${fontParams}:wght@300;400;500;600;700;800;900&display=swap`;

    // Check if already loaded
    if (document.querySelector(`link[href^="https://fonts.googleapis.com"][href*="${newFonts[0].replace(/ /g, '+')}"]`)) {
      return;
    }

    // Inject link tag
    const link = document.createElement('link');
    link.id = 'cf-google-fonts';
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }

  /**
   * Auto-load Google Fonts from document
   * Called before element rendering
   */
  function loadGoogleFonts() {
    const fonts = extractFontsFromDocument();
    injectGoogleFonts(fonts);
  }

  // ==========================================================================
  // CONSTANTS & MAPPINGS
  // ==========================================================================

  /**
   * Shadow presets matching ClickFunnels
   */
  const SHADOWS = {
    none: "none",
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    default: "0 1px 3px rgba(0,0,0,0.1)",
    md: "0 4px 6px rgba(0,0,0,0.1)",
    lg: "0 10px 15px rgba(0,0,0,0.1)",
    xl: "0 20px 25px rgba(0,0,0,0.1)",
    "2xl": "0 25px 50px rgba(0,0,0,0.25)",
  };

  /**
   * Border radius presets
   */
  const RADIUS = {
    none: "0",
    sm: "4px",
    default: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "32px",
    full: "9999px",
  };

  /**
   * Line height presets (percentages for ClickFunnels)
   */
  const LINE_HEIGHTS = {
    none: "100%",
    tight: "110%",
    snug: "120%",
    normal: "140%",
    relaxed: "160%",
    loose: "180%",
  };

  /**
   * Font weight mappings
   */
  const FONT_WEIGHTS = {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  };

  /**
   * Font size presets for text elements
   * xl = extra large (headlines), l = large, m = medium, s = small
   */
  const FONT_SIZES = {
    xs: "12px",
    s: "14px",
    sm: "14px",
    m: "16px",
    md: "16px",
    l: "20px",
    lg: "20px",
    xl: "24px",
    "2xl": "32px",
    "3xl": "40px",
    "4xl": "48px",
    "5xl": "64px",
  };

  /**
   * Row width presets
   */
  const ROW_WIDTHS = {
    narrow: "800px",
    medium: "960px",
    wide: "1170px",
    extra: "1400px",
  };

  /**
   * Container width presets
   */
  const CONTAINER_WIDTHS = {
    small: "550px",
    mid: "720px",
    midWide: "960px",
    wide: "1170px",
    full: "100%",
  };

  /**
   * Border width mappings
   */
  const BORDER_WIDTHS = {
    0: "0",
    1: "1px",
    2: "2px",
    3: "3px",
    4: "4px",
    6: "6px",
    8: "8px",
  };

  const BG_STYLE_CLASSES = {
    cover: "bgCover",
    "cover-center": "bgCoverCenter",
    parallax: "bgCoverV2",
    w100: "bgW100",
    w100h100: "bgW100H100",
    "no-repeat": "bgNoRepeat",
    repeat: "bgRepeat",
    "repeat-x": "bgRepeatX",
    "repeat-y": "bgRepeatY",
  };

  /**
   * Animation types available in ClickFunnels
   */
  const ANIMATION_TYPES = [
    'fade-in', 'glide-in', 'expand-in', 'bounce-in', 'fold-in', 'puff-in',
    'spin-in', 'flip-in', 'slide-in', 'turn-in', 'float-in', 'blink',
    'reveal', 'rocking', 'bouncing', 'wooble', 'elevate',
  ];

  // ==========================================================================
  // STYLEGUIDE MANAGER
  // ==========================================================================

  /**
   * StyleguideManager - Handles styleguide CSS generation and attribute mapping
   *
   * Reads styleguide data from embedded JSON or external source and generates
   * CSS for paint themes, buttons, shadows, borders, and corners.
   */
  class StyleguideManager {
    constructor() {
      this.data = null;
      this.styleElement = null;
    }

    /**
     * Initialize from embedded JSON or external data
     * @param {Object} styleguideData - Optional styleguide data object
     */
    init(styleguideData = null) {
      if (styleguideData) {
        this.data = styleguideData;
      } else {
        // Try to load from embedded script
        const scriptEl = document.getElementById("cf-styleguide-data");
        if (scriptEl) {
          try {
            this.data = JSON.parse(scriptEl.textContent);
          } catch (e) {
            console.warn("FunnelWind: Failed to parse styleguide data:", e);
            return;
          }
        }
      }

      if (this.data) {
        this.injectCSS();
      }
    }

    /**
     * Generate and inject CSS for browser preview
     */
    injectCSS() {
      if (!this.data) return;

      const css = this.generateCSS();

      // Remove existing styleguide styles
      if (this.styleElement) {
        this.styleElement.remove();
      }

      // Inject new styles
      this.styleElement = document.createElement("style");
      this.styleElement.id = "cf-styleguide-styles";
      this.styleElement.textContent = css;
      document.head.appendChild(this.styleElement);

      // Apply font data attributes to elements for pagetree parsing
      this.applyFontDataAttributes();
    }

    /**
     * Apply font and color data attributes to elements for pagetree parsing.
     * This allows the parser to capture styleguide fonts and paint theme colors.
     */
    applyFontDataAttributes() {
      if (!this.data) return;

      const { typography, paintThemes } = this.data;

      // Apply typography fonts to elements without explicit fonts
      if (typography) {
        const { headlineFont, subheadlineFont, contentFont } = typography;

        // Apply headline font to headlines without explicit font
        if (headlineFont) {
          document.querySelectorAll('[data-type="Headline/V1"]:not([data-font])').forEach(el => {
            el.setAttribute('data-font', headlineFont);
          });
        }

        // Apply subheadline font to subheadlines without explicit font
        if (subheadlineFont) {
          document.querySelectorAll('[data-type="SubHeadline/V1"]:not([data-font])').forEach(el => {
            el.setAttribute('data-font', subheadlineFont);
          });
        }

        // Apply content font to paragraphs without explicit font
        if (contentFont) {
          document.querySelectorAll('[data-type="Paragraph/V1"]:not([data-font])').forEach(el => {
            el.setAttribute('data-font', contentFont);
          });
        }
      }

      // Helper to check if element's closest paint-themed ancestor is the given container
      // This prevents applying colors to elements inside nested non-paint containers
      const isDirectPaintDescendant = (el, paintContainer) => {
        const closestPaint = el.closest('[data-paint-colors]');
        return closestPaint === paintContainer;
      };

      // Apply paint theme colors to elements for pagetree parsing
      // IMPORTANT: Paint themes OVERRIDE inline colors (CSS uses !important), so we must
      // override data attributes too for the parser to capture the correct colors
      // Only apply to elements whose closest paint ancestor is this container
      if (paintThemes?.length) {
        paintThemes.forEach(theme => {
          const containers = document.querySelectorAll(`[data-paint-colors="${theme.id}"]`);
          containers.forEach(container => {
            const headlineColor = this.getColorHex(theme.headlineColorId);
            const subheadlineColor = this.getColorHex(theme.subheadlineColorId);
            const contentColor = this.getColorHex(theme.contentColorId);
            const iconColor = this.getColorHex(theme.iconColorId);
            const linkColor = theme.linkColorId ? this.getColorHex(theme.linkColorId) : null;

            // Apply headline color (only to direct paint descendants)
            container.querySelectorAll('[data-type="Headline/V1"]').forEach(el => {
              if (isDirectPaintDescendant(el, container)) {
                if (!el.hasAttribute('data-color-explicit')) {
                  el.setAttribute('data-color', headlineColor);
                }
                if (linkColor) el.setAttribute('data-link-color', linkColor);
              }
            });

            // Apply subheadline color (only to direct paint descendants)
            container.querySelectorAll('[data-type="SubHeadline/V1"]').forEach(el => {
              if (isDirectPaintDescendant(el, container)) {
                if (!el.hasAttribute('data-color-explicit')) {
                  el.setAttribute('data-color', subheadlineColor);
                }
                if (linkColor) el.setAttribute('data-link-color', linkColor);
              }
            });

            // Apply content/paragraph color (only to direct paint descendants)
            container.querySelectorAll('[data-type="Paragraph/V1"]').forEach(el => {
              if (isDirectPaintDescendant(el, container)) {
                if (!el.hasAttribute('data-color-explicit')) {
                  el.setAttribute('data-color', contentColor);
                }
                if (linkColor) el.setAttribute('data-link-color', linkColor);
              }
            });

            // Apply icon color (only to direct paint descendants)
            container.querySelectorAll('[data-type="Icon/V1"]').forEach(el => {
              if (isDirectPaintDescendant(el, container)) {
                if (!el.hasAttribute('data-color-explicit')) {
                  el.setAttribute('data-color', iconColor);
                }
              }
            });

            // Apply text color to bullet lists (only to direct paint descendants)
            container.querySelectorAll('[data-type="BulletList/V1"]').forEach(el => {
              if (isDirectPaintDescendant(el, container)) {
                if (!el.hasAttribute('data-text-color-explicit')) {
                  el.setAttribute('data-text-color', contentColor);
                }
                if (!el.hasAttribute('data-icon-color-explicit')) {
                  el.setAttribute('data-icon-color', iconColor);
                }
                if (linkColor) el.setAttribute('data-link-color', linkColor);
              }
            });
          });
        });
      }
    }

    /**
     * Get hex color by ID from the color palette
     */
    getColorHex(colorId) {
      if (!this.data?.colors) return "#000000";
      const color = this.data.colors.find((c) => c.id === colorId);
      return color ? color.hex : "#000000";
    }

    /**
     * Get typescale sizes calculated from baseSize and scaleRatio
     * Returns object with scales for each element type (headline, subheadline, paragraph)
     *
     * The scale is designed so that within each size category (xl, l, m, s):
     * - Headlines use the largest size
     * - Subheadlines use one step down
     * - Paragraphs use two steps down
     *
     * This matches StyleguideEditor.tsx preview layout
     */
    getTypescale() {
      if (!this.data?.typography) return null;

      const { baseSize = 16, scaleRatio = 1.25 } = this.data.typography;

      // Calculate the base scale steps
      const r = scaleRatio;
      const b = baseSize;

      // Scale values (each is one step apart)
      // With base=16, ratio=1.25: ~10, 13, 16, 20, 25, 31, 39, 49, 61, 76, 95
      const scale = {
        n3: Math.round(b / Math.pow(r, 3)),  // ~8
        n2: Math.round(b / Math.pow(r, 2)),  // ~10
        n1: Math.round(b / r),               // ~13
        base: b,                              // 16
        p1: Math.round(b * r),               // ~20
        p2: Math.round(b * Math.pow(r, 2)),  // ~25
        p3: Math.round(b * Math.pow(r, 3)),  // ~31
        p4: Math.round(b * Math.pow(r, 4)),  // ~39
        p5: Math.round(b * Math.pow(r, 5)),  // ~49
        p6: Math.round(b * Math.pow(r, 6)),  // ~61
        p7: Math.round(b * Math.pow(r, 7)),  // ~76
        p8: Math.round(b * Math.pow(r, 8)),  // ~95
      };

      return {
        // Headlines get largest sizes
        headline: {
          "5xl": `${scale.p8}px`,
          "4xl": `${scale.p7}px`,
          "3xl": `${scale.p6}px`,
          "2xl": `${scale.p5}px`,
          xl: `${scale.p4}px`,
          l: `${scale.p3}px`,
          lg: `${scale.p3}px`,
          m: `${scale.p2}px`,
          md: `${scale.p2}px`,
          s: `${scale.p1}px`,
          sm: `${scale.p1}px`,
          xs: `${scale.base}px`,
        },
        // Subheadlines get one step smaller
        subheadline: {
          "5xl": `${scale.p7}px`,
          "4xl": `${scale.p6}px`,
          "3xl": `${scale.p5}px`,
          "2xl": `${scale.p4}px`,
          xl: `${scale.p3}px`,
          l: `${scale.p2}px`,
          lg: `${scale.p2}px`,
          m: `${scale.p1}px`,
          md: `${scale.p1}px`,
          s: `${scale.base}px`,
          sm: `${scale.base}px`,
          xs: `${scale.n1}px`,
        },
        // Paragraphs get two steps smaller
        paragraph: {
          "5xl": `${scale.p6}px`,
          "4xl": `${scale.p5}px`,
          "3xl": `${scale.p4}px`,
          "2xl": `${scale.p3}px`,
          xl: `${scale.p2}px`,
          l: `${scale.p1}px`,
          lg: `${scale.p1}px`,
          m: `${scale.base}px`,
          md: `${scale.base}px`,
          s: `${scale.n1}px`,
          sm: `${scale.n1}px`,
          xs: `${scale.n2}px`,
        },
      };
    }

    /**
     * Resolve a size preset (xl, l, m, s, xs) to pixel value using typescale
     * Falls back to static FONT_SIZES if no styleguide or not a preset
     *
     * @param {string} size - Size preset (xl, l, m, s, xs) or pixel value
     * @param {string} elementType - Element type: 'headline', 'subheadline', or 'paragraph'
     */
    resolveSize(size, elementType = 'headline') {
      // First try styleguide typescale
      const typescale = this.getTypescale();
      if (typescale) {
        const elementScale = typescale[elementType] || typescale.headline;
        if (elementScale && elementScale[size]) {
          return elementScale[size];
        }
      }
      // Return null to let caller use static fallback
      return null;
    }

    /**
     * Check if a value is a styleguide reference
     * @param {string} value - The attribute value to check
     * @param {string} type - Type of styleguide reference (paint, shadow, border, corner, button)
     */
    isStyleguideRef(value, type) {
      if (!value || !this.data) return false;

      switch (type) {
        case "paint":
          return this.data.paintThemes?.some((t) => t.id === value);
        case "shadow":
          return this.data.shadows?.some((s) => s.id === value);
        case "border":
          return this.data.borders?.some((b) => b.id === value);
        case "corner":
          return this.data.corners?.some((c) => c.id === value);
        case "button":
          return this.data.buttons?.some((b) => b.id === value);
        default:
          return false;
      }
    }

    /**
     * Generate CSS from styleguide data
     */
    generateCSS() {
      const { colors, paintThemes, shadows, borders, corners, buttons, typography } =
        this.data;
      let css = "/* FunnelWind Styleguide CSS */\n\n";

      // 1. CSS Variables for colors
      if (colors?.length) {
        css += ":root {\n";
        colors.forEach((color) => {
          css += `  --sg-color-${color.id}: ${color.hex};\n`;
        });
        css += "}\n\n";
      }

      // 1.5 Typography styles (fonts for headline, subheadline, content)
      // Only apply when element doesn't have explicit data-font attribute
      if (typography) {
        css += "/* Typography styles */\n";
        const { headlineFont, subheadlineFont, contentFont, headlineWeight, subheadlineWeight, contentWeight } = typography;

        // Headline font (when no explicit font set)
        if (headlineFont) {
          css += `[data-type="Headline/V1"]:not([data-font]) h1,\n`;
          css += `[data-type="Headline/V1"]:not([data-font]) h2 {\n`;
          css += `  font-family: "${headlineFont}", sans-serif !important;\n`;
          css += "}\n";
        }

        // Subheadline font (when no explicit font set)
        if (subheadlineFont) {
          css += `[data-type="SubHeadline/V1"]:not([data-font]) h2,\n`;
          css += `[data-type="SubHeadline/V1"]:not([data-font]) h3 {\n`;
          css += `  font-family: "${subheadlineFont}", sans-serif !important;\n`;
          css += "}\n";
        }

        // Content/paragraph font (when no explicit font set)
        if (contentFont) {
          css += `[data-type="Paragraph/V1"]:not([data-font]) p {\n`;
          css += `  font-family: "${contentFont}", sans-serif !important;\n`;
          css += "}\n";

          // Also apply to bullet lists (they use content font)
          css += `[data-type="BulletList/V1"] li {\n`;
          css += `  font-family: "${contentFont}", sans-serif !important;\n`;
          css += "}\n";
        }
        css += "\n";
      }

      // 2. Paint theme styles (for sections/rows)
      if (paintThemes?.length) {
        paintThemes.forEach((theme) => {
          const bgColor = this.getColorHex(theme.backgroundColorId);
          const headlineColor = this.getColorHex(theme.headlineColorId);
          const subheadlineColor = this.getColorHex(theme.subheadlineColorId);
          const contentColor = this.getColorHex(theme.contentColorId);
          const linkColor = this.getColorHex(theme.linkColorId);
          const iconColor = this.getColorHex(theme.iconColorId);

          // Container styles - set CSS variables for this paint theme
          css += `[data-paint-colors="${theme.id}"] {\n`;
          css += `  background-color: ${bgColor} !important;\n`;
          css += `  --sg-headline-color: ${headlineColor};\n`;
          css += `  --sg-subheadline-color: ${subheadlineColor};\n`;
          css += `  --sg-content-color: ${contentColor};\n`;
          css += `  --sg-link-color: ${linkColor};\n`;
          css += `  --sg-icon-color: ${iconColor};\n`;
          css += "}\n\n";
        });

        // Text color rules using CSS variables - these inherit from CLOSEST paint ancestor
        // Only one rule needed per element type (no theme-specific selectors)
        css += `/* Paint theme text colors - inherit from closest paint ancestor */\n`;

        // Headline
        css += `[data-paint-colors] [data-type="Headline/V1"] h1,\n`;
        css += `[data-paint-colors] [data-type="Headline/V1"] h2 {\n`;
        css += `  color: var(--sg-headline-color) !important;\n`;
        css += "}\n";

        // Subheadline
        css += `[data-paint-colors] [data-type="SubHeadline/V1"] h2,\n`;
        css += `[data-paint-colors] [data-type="SubHeadline/V1"] h3 {\n`;
        css += `  color: var(--sg-subheadline-color) !important;\n`;
        css += "}\n";

        // Paragraph
        css += `[data-paint-colors] [data-type="Paragraph/V1"] p {\n`;
        css += `  color: var(--sg-content-color) !important;\n`;
        css += "}\n";

        // Links (not buttons)
        css += `[data-paint-colors] a:not([data-type="Button/V1"] a) {\n`;
        css += `  color: var(--sg-link-color) !important;\n`;
        css += "}\n";

        // Icons and bullet list icons
        css += `[data-paint-colors] [data-type="Icon/V1"] i,\n`;
        css += `[data-paint-colors] [data-type="BulletList/V1"] .fa_icon {\n`;
        css += `  color: var(--sg-icon-color) !important;\n`;
        css += "}\n";

        // Bullet list text (target both li and span for proper inheritance)
        css += `[data-paint-colors] [data-type="BulletList/V1"] li,\n`;
        css += `[data-paint-colors] [data-type="BulletList/V1"] li span {\n`;
        css += `  color: var(--sg-content-color) !important;\n`;
        css += "}\n\n";
      }

      // 3. Shadow styles
      if (shadows?.length) {
        shadows.forEach((shadow) => {
          const value = `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
          css += `[data-style-guide-shadow="${shadow.id}"] {\n`;
          css += `  box-shadow: ${value} !important;\n`;
          css += "}\n";
        });
        css += "\n";
      }

      // 4. Border styles
      if (borders?.length) {
        borders.forEach((border) => {
          css += `[data-style-guide-border="${border.id}"] {\n`;
          css += `  border: ${border.width}px ${border.style} ${border.color} !important;\n`;
          css += "}\n";
        });
        css += "\n";
      }

      // 5. Corner styles
      if (corners?.length) {
        corners.forEach((corner) => {
          css += `[data-style-guide-corner="${corner.id}"] {\n`;
          css += `  border-radius: ${corner.radius}px !important;\n`;
          css += "}\n";
        });
        css += "\n";
      }

      // 6. Button styles
      if (buttons?.length) {
        buttons.forEach((btn) => {
          // Base button style
          css += `[data-style-guide-button="${btn.id}"] a {\n`;
          css += `  background-color: ${
            btn.regular?.bg || "#3b82f6"
          } !important;\n`;
          if (btn.borderRadius)
            css += `  border-radius: ${btn.borderRadius}px !important;\n`;
          if (btn.borderWidth > 0) {
            css += `  border: ${btn.borderWidth}px ${
              btn.borderStyle || "solid"
            } ${btn.borderColor || "transparent"} !important;\n`;
          }
          if (btn.shadow?.enabled) {
            const s = btn.shadow;
            css += `  box-shadow: ${s.x || 0}px ${s.y || 0}px ${
              s.blur || 0
            }px ${s.spread || 0}px ${
              s.color || "rgba(0,0,0,0.1)"
            } !important;\n`;
          }
          css += "}\n";

          // Button text color
          css += `[data-style-guide-button="${btn.id}"] a span {\n`;
          css += `  color: ${btn.regular?.color || "#ffffff"} !important;\n`;
          css += "}\n";

          // Hover state
          if (btn.hover) {
            css += `[data-style-guide-button="${btn.id}"] a:hover {\n`;
            css += `  background-color: ${
              btn.hover.bg || btn.regular?.bg || "#3b82f6"
            } !important;\n`;
            css += "}\n";
            css += `[data-style-guide-button="${btn.id}"] a:hover span {\n`;
            css += `  color: ${
              btn.hover.color || btn.regular?.color || "#ffffff"
            } !important;\n`;
            css += "}\n";
          }

          // Active state
          if (btn.active) {
            css += `[data-style-guide-button="${btn.id}"] a:active {\n`;
            css += `  background-color: ${
              btn.active.bg || btn.regular?.bg || "#3b82f6"
            } !important;\n`;
            css += "}\n";
          }
        });
      }

      return css;
    }
  }

  // Create global instance
  const styleguideManager = new StyleguideManager();

  // ==========================================================================
  // BRAND ASSETS MANAGER
  // ==========================================================================

  /**
   * Manages brand assets for dynamic image swapping
   * Brand assets can be attached to cf-image elements using the brand-asset attribute
   * Also supports bg-image on cf-section, cf-row, cf-col
   * Valid types: logo, logo_light, logo_dark, background, pattern, icon, product_image
   */
  class BrandAssetsManager {
    constructor() {
      this.data = null;
    }

    /**
     * Initialize from embedded JSON or external data
     * @param {Object} brandAssets - Optional brand assets data object
     */
    init(brandAssets = null) {
      if (brandAssets) {
        this.data = brandAssets;
      } else {
        // Try to load from embedded script
        const scriptEl = document.getElementById("cf-brand-assets");
        if (scriptEl) {
          try {
            this.data = JSON.parse(scriptEl.textContent);
          } catch (e) {
            console.warn("FunnelWind: Failed to parse brand assets data:", e);
            return;
          }
        }
      }
    }

    /**
     * Get the first active asset URL for a given type
     * @param {string} assetType - Type of asset: logo, background, pattern, icon, product_image
     * @returns {string|null} - The URL of the first active asset or null
     */
    getAssetUrl(assetType) {
      if (
        !this.data ||
        !this.data[assetType] ||
        this.data[assetType].length === 0
      ) {
        return null;
      }
      return this.data[assetType][0];
    }

    /**
     * Get all active asset URLs for a given type
     * @param {string} assetType - Type of asset
     * @returns {string[]} - Array of URLs
     */
    getAssetUrls(assetType) {
      if (!this.data || !this.data[assetType]) {
        return [];
      }
      return this.data[assetType];
    }

    /**
     * Check if we have any assets of a given type
     * @param {string} assetType - Type of asset
     * @returns {boolean}
     */
    hasAsset(assetType) {
      return (
        this.data && this.data[assetType] && this.data[assetType].length > 0
      );
    }
  }

  // Create global instance
  const brandAssetsManager = new BrandAssetsManager();

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================

  /**
   * Get attribute with fallback
   */
  function attr(el, name, fallback = null) {
    const val = el.getAttribute(name);
    return val !== null ? val : fallback;
  }

  /**
   * Resolve a value - check if it's a preset key or use as-is
   */
  function resolve(value, presets) {
    if (!value) return null;
    return presets[value] || value;
  }

  /**
   * Build inline style string from object
   */
  function buildStyle(styleObj) {
    return Object.entries(styleObj)
      .filter(([_, v]) => v !== null && v !== undefined && v !== "")
      .map(([k, v]) => `${k}: ${v}`)
      .join("; ");
  }

  /**
   * Parse content with slot handling for Web Components
   */
  function getContent(el) {
    return el.innerHTML;
  }

  function getBgStyleClass(bgStyle) {
    if (!bgStyle) return "bgCoverCenter";
    return BG_STYLE_CLASSES[bgStyle] || bgStyle;
  }

  /**
   * Helper to extract YouTube video ID from URL
   */
  function extractYouTubeVideoId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/);
    return match ? match[1] : null;
  }

  /**
   * Build animation data attributes string from element attributes
   * Returns empty string if no animation specified
   */
  function buildAnimationAttrs(el) {
    const animation = attr(el, 'animation');
    if (!animation) return '';

    const time = attr(el, 'animation-time', '1000');
    const delay = attr(el, 'animation-delay', '0');
    const trigger = attr(el, 'animation-trigger', 'load');
    const timing = attr(el, 'animation-timing', 'ease');
    const direction = attr(el, 'animation-direction', 'normal');
    const once = attr(el, 'animation-once', 'true');
    const loop = attr(el, 'animation-loop', 'false');

    return ` data-skip-animation-settings="false" data-animation-type="${animation}" data-animation-time="${time}" data-animation-delay="${delay}" data-animation-trigger="${trigger}" data-animation-timing-function="${timing}" data-animation-direction="${direction}" data-animation-once="${once === 'true'}" data-animation-loop="${loop === 'true'}"`;
  }

  // ==========================================================================
  // BASE COMPONENT CLASS
  // ==========================================================================

  class CFElement extends HTMLElement {
    constructor() {
      super();
      this._rendered = false;
    }

    connectedCallback() {
      // Defer rendering to allow children to be parsed
      if (!this._rendered) {
        requestAnimationFrame(() => {
          // Check if element is still in DOM before rendering
          // (parent may have already replaced itself via outerHTML)
          if (this.parentNode) {
            this.render();
            this._rendered = true;
          }
        });
      }
    }

    render() {
      // Override in subclasses
    }
  }

  // ==========================================================================
  // LAYOUT COMPONENTS
  // ==========================================================================

  /**
   * <cf-page> - Root content node
   *
   * Attributes:
   *   bg          - Background color
   *   bg-image    - Background image URL
   *   bg-style    - Background image style: cover, cover-center (default), parallax, w100, w100h100, no-repeat, repeat, repeat-x, repeat-y
   *   gradient    - CSS gradient
   *   overlay     - Overlay color (rgba)
   *   text-color  - Default text color
   *   link-color  - Default link color
   *   font-family - Default font family (e.g., '"Roboto", sans-serif')
   *   font-weight - Default font weight
   *   header-code - Custom header HTML/scripts
   *   footer-code - Custom footer HTML/scripts
   *   css         - Custom CSS
   */
  class CFPage extends CFElement {
    render() {
      const bg = attr(this, "bg", "#ffffff");
      const bgImage = attr(this, "bg-image");
      const bgStyle = attr(this, "bg-style");
      const gradient = attr(this, "gradient");
      const overlay = attr(this, "overlay");
      const textColor = attr(this, "text-color", "#334155");
      const linkColor = attr(this, "link-color", "#3b82f6");
      const fontFamily = attr(this, "font-family");
      const fontWeight = attr(this, "font-weight");
      const headerCode = attr(this, "header-code");
      const footerCode = attr(this, "footer-code");
      const customCss = attr(this, "css");

      const styles = {
        width: "100%",
        "min-height": "100vh",
        position: "relative",
      };

      if (gradient) {
        styles["background"] = gradient;
      } else if (bg) {
        styles["background-color"] = bg;
      }
      if (bgImage) {
        styles["background-image"] = `url(${bgImage})`;
        // Don't set bg-size/position/repeat inline - let CSS class handle it
      }

      // Determine background style class
      const bgStyleClass = bgImage ? getBgStyleClass(bgStyle) : "bgCoverCenter";

      // Build overlay element and content wrapper if overlay specified
      let overlayHtml = "";
      let overlayDataAttr = "";
      let contentHtml = getContent(this);
      if (overlay) {
        overlayHtml = `<div class="cf-overlay" style="position:absolute;inset:0;background:${overlay};pointer-events:none;z-index:1;"></div>`;
        overlayDataAttr = ` data-overlay="${overlay}"`;
        contentHtml = `<div style="position:relative;z-index:2;">${contentHtml}</div>`;
      }

      // Build optional data attributes for settings
      let optionalAttrs = "";
      if (fontFamily) optionalAttrs += ` data-font-family="${fontFamily}"`;
      if (fontWeight) optionalAttrs += ` data-font-weight="${fontWeight}"`;
      if (headerCode)
        optionalAttrs += ` data-header-code="${encodeURIComponent(
          headerCode
        )}"`;
      if (footerCode)
        optionalAttrs += ` data-footer-code="${encodeURIComponent(
          footerCode
        )}"`;
      if (customCss)
        optionalAttrs += ` data-custom-css="${encodeURIComponent(customCss)}"`;

      // Build custom CSS style tag for live preview
      const customCssStyle = customCss
        ? `<style id="custom-css">${customCss}</style>`
        : `<style id="custom-css"></style>`;

      this.outerHTML = `
        <div
          class="content-node ${bgStyleClass}"
          data-type="ContentNode"
          data-text-color="${textColor}"
          data-link-color="${linkColor}"
          data-bg-style="${bgStyleClass}"${overlayDataAttr}${optionalAttrs}
          style="${buildStyle(styles)}"
        >${overlayHtml}${contentHtml}</div>${customCssStyle}
      `;
    }
  }

  /**
   * <cf-section> - Section container
   *
   * Attributes:
   *   container   - Width: small, mid, midWide, wide, full
   *   bg          - Background color
   *   bg-image    - Background image URL
   *   brand-asset - Brand asset type for bg-image: background, pattern
   *   gradient    - CSS gradient
   *   overlay     - Overlay color
   *   paint       - Styleguide paint theme: lightest, light, colored, dark, darkest
   *   pt          - Padding top (e.g., "80px", "64px")
   *   pb          - Padding bottom
   *   mt          - Margin top (NO margin-bottom!)
   *   shadow      - Shadow preset, styleguide ref (style1-3), or custom
   *   rounded     - Border radius preset or value
   *   corner      - Styleguide corner ref (style1-3)
   *   border      - Border width or styleguide ref (style1-3)
   *   border-style - Border style (solid, dashed, dotted)
   *   border-color - Border color
   *   show        - Visibility: desktop, mobile
   *   video-bg    - YouTube URL for video background
   *   video-bg-overlay - Overlay color for video (rgba format, defaults to bg if rgba)
   *   video-bg-hide-mobile - Hide video on mobile (true/false, default true)
   *   video-bg-style - Video style: fill (default), fit
   */
  class CFSection extends CFElement {
    render() {
      const elementId = attr(this, "element-id");
      const container = attr(this, "container", "full");
      const bg = attr(this, "bg");
      let bgImage = attr(this, "bg-image");
      const bgStyle = attr(this, "bg-style");
      const gradient = attr(this, "gradient");
      const overlay = attr(this, "overlay");
      const paint = attr(this, "paint");
      const pt = attr(this, "pt", "64px");
      const pb = attr(this, "pb", "64px");
      const px = attr(this, "px", "0");
      const mt = attr(this, "mt");
      const shadow = attr(this, "shadow");
      // Check for popup-rounded (inherited from parent cf-popup) if no explicit rounded
      const popupRounded = attr(this, "data-popup-rounded");
      const rounded = attr(this, "rounded") || popupRounded;
      const corner = attr(this, "corner");
      const border = attr(this, "border");
      const borderStyle = attr(this, "border-style", "solid");
      const borderColor = attr(this, "border-color");
      const show = attr(this, "show");
      const brandAsset = attr(this, "brand-asset");

      // Video background attributes
      const videoBg = attr(this, "video-bg");
      const videoBgOverlay = attr(this, "video-bg-overlay");
      const videoBgHideMobile = attr(this, "video-bg-hide-mobile", "true");
      const videoBgStyle = attr(this, "video-bg-style", "fill");

      // If brand-asset is specified, try to get the asset URL from brand assets manager
      if (brandAsset && brandAssetsManager.hasAsset(brandAsset)) {
        const brandAssetUrl = brandAssetsManager.getAssetUrl(brandAsset);
        if (brandAssetUrl) {
          bgImage = brandAssetUrl;
        }
      }

      const containerWidth = resolve(container, CONTAINER_WIDTHS) || "1170px";

      // Check if shadow/border/corner are styleguide references
      const isShadowStyleguide =
        shadow && styleguideManager.isStyleguideRef(shadow, "shadow");
      const isBorderStyleguide =
        border && styleguideManager.isStyleguideRef(border, "border");
      const isCornerStyleguide =
        corner && styleguideManager.isStyleguideRef(corner, "corner");

      const styles = {
        width: "100%",
        "max-width": containerWidth,
        "margin-left": "auto",
        "margin-right": "auto",
        position: "relative",
        "padding-top": pt,
        "padding-bottom": pb,
        "padding-left": px,
        "padding-right": px,
        "box-sizing": "border-box",
      };

      // Only apply bg if not using paint (styleguide handles paint backgrounds)
      if (!paint) {
        if (gradient) {
          styles["background"] = gradient;
        } else if (bg) {
          styles["background-color"] = bg;
        }
      }
      if (bgImage) {
        styles["background-image"] = `url(${bgImage})`;
        // Don't set bg-size/position/repeat inline - let CSS class handle it
      }
      if (mt) styles["margin-top"] = mt;

      // Shadow: use inline if not styleguide ref
      if (shadow && !isShadowStyleguide) {
        styles["box-shadow"] = resolve(shadow, SHADOWS) || shadow;
      }

      // Rounded/corner: prefer corner styleguide ref, fallback to rounded
      if (corner && isCornerStyleguide) {
        // Styleguide CSS will handle it
      } else if (rounded) {
        styles["border-radius"] = resolve(rounded, RADIUS) || rounded;
      }

      // Border: use inline if not styleguide ref
      if (border && !isBorderStyleguide) {
        styles["border-width"] = resolve(border, BORDER_WIDTHS) || border;
        styles["border-style"] = borderStyle;
      }
      if (borderColor) styles["border-color"] = borderColor;

      // Determine background style class
      const bgStyleClass = bgImage ? getBgStyleClass(bgStyle) : "";

      let dataAttrs = 'data-type="SectionContainer/V1"';
      dataAttrs += ` data-container="${container}"`;
      if (show) dataAttrs += ` data-show="${show}"`;
      if (bgStyleClass) dataAttrs += ` data-bg-style="${bgStyleClass}"`;
      if (overlay) dataAttrs += ` data-overlay="${overlay}"`;
      // Store original bg-image for conversion (not the swapped brand asset URL)
      const originalBgImage = attr(this, "bg-image");
      if (originalBgImage) dataAttrs += ` data-bg-image="${originalBgImage}"`;
      if (brandAsset) dataAttrs += ` data-brand-asset="${brandAsset}"`;

      // Styleguide data attributes
      if (paint) dataAttrs += ` data-paint-colors="${paint}"`;
      if (isShadowStyleguide)
        dataAttrs += ` data-style-guide-shadow="${shadow}"`;
      if (isBorderStyleguide)
        dataAttrs += ` data-style-guide-border="${border}"`;
      if (isCornerStyleguide)
        dataAttrs += ` data-style-guide-corner="${corner}"`;

      // Video background handling
      if (videoBg) {
        const videoId = extractYouTubeVideoId(videoBg);
        if (videoId) {
          const videoThumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          dataAttrs += ` data-video-bg-url="${videoBg}"`;
          dataAttrs += ` data-video-bg-type="youtube"`;
          dataAttrs += ` data-video-bg-thumbnail="${videoThumbnailUrl}"`;
          dataAttrs += ` data-video-bg-hide-mobile="${videoBgHideMobile === "true" || videoBgHideMobile === true}"`;
          dataAttrs += ` data-video-bg-style="${videoBgStyle}"`;

          // Determine overlay color for video - use explicit overlay, video-bg-overlay, or bg if rgba
          let videoOverlayColor = videoBgOverlay || overlay;
          if (!videoOverlayColor && bg && bg.startsWith("rgba")) {
            videoOverlayColor = bg;
          }
          if (videoOverlayColor) {
            dataAttrs += ` data-video-bg-overlay="${videoOverlayColor}"`;
          }
        }
      }

      // Build overlay element and content wrapper if overlay specified
      let overlayHtml = "";
      let contentHtml = getContent(this);
      if (overlay) {
        overlayHtml = `<div class="cf-overlay" style="position:absolute;inset:0;background:${overlay};pointer-events:none;z-index:1;border-radius:inherit;"></div>`;
        contentHtml = `<div style="position:relative;z-index:2;">${contentHtml}</div>`;
      }

      // Build class attribute (apply bg-style class for CSS effect)
      const classAttr = bgStyleClass ? ` class="${bgStyleClass}"` : "";

      // Build ID attribute for scroll-to and show-hide targeting
      const idAttr = elementId ? ` id="${elementId}"` : "";

      this.outerHTML = `
        <section${idAttr}${classAttr} ${dataAttrs} style="${buildStyle(styles)}">
          ${overlayHtml}${contentHtml}
        </section>
      `;
    }
  }

  /**
   * <cf-row> - Row container for columns
   *
   * Attributes:
   *   width       - Max width: narrow, medium, wide, extra, or px value
   *   bg          - Background color
   *   bg-image    - Background image URL
   *   brand-asset - Brand asset type for bg-image: background, pattern
   *   bg-style    - Background image style: cover, cover-center, parallax, etc.
   *   gradient    - CSS gradient
   *   overlay     - Overlay color
   *   paint       - Styleguide paint theme: lightest, light, colored, dark, darkest
   *   pt          - Padding top
   *   pb          - Padding bottom
   *   px          - Padding horizontal (left & right)
   *   mt          - Margin top
   *   shadow      - Shadow preset, styleguide ref (style1-3), or custom
   *   rounded     - Border radius
   *   corner      - Styleguide corner ref (style1-3)
   *   border      - Border width or styleguide ref (style1-3)
   *   border-style - Border style
   *   border-color - Border color
   */
  class CFRow extends CFElement {
    render() {
      const elementId = attr(this, "element-id");
      const width = attr(this, "width", "wide");
      const bg = attr(this, "bg");
      let bgImage = attr(this, "bg-image");
      const bgStyle = attr(this, "bg-style");
      const gradient = attr(this, "gradient");
      const overlay = attr(this, "overlay");
      const paint = attr(this, "paint");
      const pt = attr(this, "pt");
      const pb = attr(this, "pb");
      const px = attr(this, "px");
      const mt = attr(this, "mt");
      const shadow = attr(this, "shadow");
      const rounded = attr(this, "rounded");
      const corner = attr(this, "corner");
      const border = attr(this, "border");
      const borderStyle = attr(this, "border-style", "solid");
      const borderColor = attr(this, "border-color");
      const brandAsset = attr(this, "brand-asset");
      const show = attr(this, "show");

      // If brand-asset is specified, try to get the asset URL from brand assets manager
      if (brandAsset && brandAssetsManager.hasAsset(brandAsset)) {
        const brandAssetUrl = brandAssetsManager.getAssetUrl(brandAsset);
        if (brandAssetUrl) {
          bgImage = brandAssetUrl;
        }
      }

      const maxWidth = resolve(width, ROW_WIDTHS) || width;

      // Check if shadow/border/corner are styleguide references
      const isShadowStyleguide =
        shadow && styleguideManager.isStyleguideRef(shadow, "shadow");
      const isBorderStyleguide =
        border && styleguideManager.isStyleguideRef(border, "border");
      const isCornerStyleguide =
        corner && styleguideManager.isStyleguideRef(corner, "corner");

      const styles = {
        display: "flex",
        "flex-wrap": "wrap",
        width: maxWidth,
        "max-width": "100%",
        "margin-left": "auto",
        "margin-right": "auto",
        position: "relative",
        "box-sizing": "border-box",
        "margin-top": mt || "0",
      };

      // Only apply bg if not using paint (styleguide handles paint backgrounds)
      if (!paint) {
        if (gradient) {
          styles["background"] = gradient;
        } else if (bg) {
          styles["background-color"] = bg;
        }
      }
      if (bgImage) {
        styles["background-image"] = `url(${bgImage})`;
        // Don't set bg-size/position/repeat inline - let CSS class handle it
      }
      if (pt) styles["padding-top"] = pt;
      if (pb) styles["padding-bottom"] = pb;
      if (px) {
        styles["padding-left"] = px;
        styles["padding-right"] = px;
      }

      // Shadow: use inline if not styleguide ref
      if (shadow && !isShadowStyleguide) {
        styles["box-shadow"] = resolve(shadow, SHADOWS) || shadow;
      }

      // Rounded/corner: prefer corner styleguide ref, fallback to rounded
      if (corner && isCornerStyleguide) {
        // Styleguide CSS will handle it
      } else if (rounded) {
        styles["border-radius"] = resolve(rounded, RADIUS) || rounded;
      }

      // Border: use inline if not styleguide ref
      if (border && !isBorderStyleguide) {
        styles["border-width"] = resolve(border, BORDER_WIDTHS) || border;
        styles["border-style"] = borderStyle;
      }
      if (borderColor) styles["border-color"] = borderColor;

      // Determine background style class
      const bgStyleClass = bgImage ? getBgStyleClass(bgStyle) : "";

      let dataAttrs = 'data-type="RowContainer/V1"';
      dataAttrs += ` data-width="${width}"`;
      if (show) dataAttrs += ` data-show="${show}"`;
      if (bgStyleClass) dataAttrs += ` data-bg-style="${bgStyleClass}"`;
      if (overlay) dataAttrs += ` data-overlay="${overlay}"`;
      // Store original bg-image for conversion (not the swapped brand asset URL)
      const originalBgImage = attr(this, "bg-image");
      if (originalBgImage) dataAttrs += ` data-bg-image="${originalBgImage}"`;
      if (brandAsset) dataAttrs += ` data-brand-asset="${brandAsset}"`;

      // Styleguide data attributes
      if (paint) dataAttrs += ` data-paint-colors="${paint}"`;
      if (isShadowStyleguide)
        dataAttrs += ` data-style-guide-shadow="${shadow}"`;
      if (isBorderStyleguide)
        dataAttrs += ` data-style-guide-border="${border}"`;
      if (isCornerStyleguide)
        dataAttrs += ` data-style-guide-corner="${corner}"`;

      // Animation attributes
      const animationAttrs = buildAnimationAttrs(this);
      dataAttrs += animationAttrs;

      // Build overlay element and content wrapper if overlay specified
      let overlayHtml = "";
      let contentHtml = getContent(this);
      if (overlay) {
        overlayHtml = `<div class="cf-overlay" style="position:absolute;inset:0;background:${overlay};pointer-events:none;z-index:1;border-radius:inherit;"></div>`;
        contentHtml = `<div style="position:relative;z-index:2;display:flex;flex-wrap:wrap;width:100%;">${contentHtml}</div>`;
      }

      // Build class attribute (apply bg-style class for CSS effect)
      const classAttr = bgStyleClass ? ` class="${bgStyleClass}"` : "";

      // Build ID attribute for scroll-to and show-hide targeting
      const idAttr = elementId ? ` id="${elementId}"` : "";

      this.outerHTML = `
        <div${idAttr}${classAttr} ${dataAttrs} style="${buildStyle(styles)}">
          ${overlayHtml}${contentHtml}
        </div>
      `;
    }
  }

  /**
   * <cf-col> - Column container (12-column grid)
   *
   * Attributes:
   *   span        - Column width 1-12 (default: 12)
   *   align       - Column alignment: left, center, right (default: left)
   *   bg          - Background color
   *   bg-image    - Background image URL
   *   brand-asset - Brand asset type for bg-image: background, pattern
   *   bg-style    - Background image style: cover, cover-center (default), parallax, etc.
   *   gradient    - CSS gradient
   *   overlay     - Overlay color
   *   pt          - Padding top
   *   pb          - Padding bottom
   *   px          - Padding horizontal (left & right unified)
   *   mx          - Margin horizontal (creates column gaps)
   *   shadow      - Shadow
   *   rounded     - Border radius (all corners)
   *   rounded-tl  - Border radius top-left
   *   rounded-tr  - Border radius top-right
   *   rounded-bl  - Border radius bottom-left
   *   rounded-br  - Border radius bottom-right
   *   border      - Border width
   *   border-style - Border style
   *   border-color - Border color
   */
  class CFCol extends CFElement {
    render() {
      const elementId = attr(this, "element-id");
      const span = parseInt(attr(this, "span", "12"), 10);
      const align = attr(this, "align", "left");
      const show = attr(this, "show");
      const widthPercent = ((span / 12) * 100).toFixed(6) + "%";

      // Col-inner styling attributes
      const bg = attr(this, "bg");
      let bgImage = attr(this, "bg-image");
      const bgStyle = attr(this, "bg-style");
      const gradient = attr(this, "gradient");
      const overlay = attr(this, "overlay");
      const paint = attr(this, "paint");
      const pt = attr(this, "pt");
      const pb = attr(this, "pb");
      const px = attr(this, "px");
      const mx = attr(this, "mx", "16px");
      const shadow = attr(this, "shadow");
      const rounded = attr(this, "rounded");
      const corner = attr(this, "corner");
      const roundedTl = attr(this, "rounded-tl");
      const roundedTr = attr(this, "rounded-tr");
      const roundedBl = attr(this, "rounded-bl");
      const roundedBr = attr(this, "rounded-br");
      const border = attr(this, "border");
      const borderStyle = attr(this, "border-style", "solid");
      const borderColor = attr(this, "border-color");
      const brandAsset = attr(this, "brand-asset");

      // If brand-asset is specified, try to get the asset URL from brand assets manager
      if (brandAsset && brandAssetsManager.hasAsset(brandAsset)) {
        const brandAssetUrl = brandAssetsManager.getAssetUrl(brandAsset);
        if (brandAssetUrl) {
          bgImage = brandAssetUrl;
        }
      }

      // Check if shadow/border/corner are styleguide references
      const isShadowStyleguide =
        shadow && styleguideManager.isStyleguideRef(shadow, "shadow");
      const isBorderStyleguide =
        border && styleguideManager.isStyleguideRef(border, "border");
      const isCornerStyleguide =
        corner && styleguideManager.isStyleguideRef(corner, "corner");

      // Check if any col-inner styling is present
      const hasColInnerStyling =
        bg ||
        bgImage ||
        gradient ||
        overlay ||
        paint ||
        pt ||
        pb ||
        px ||
        mx ||
        shadow ||
        rounded ||
        corner ||
        roundedTl ||
        roundedTr ||
        roundedBl ||
        roundedBr ||
        border ||
        borderColor;

      const colStyles = {
        width: widthPercent,
        position: "relative",
        "min-height": "1px",
        "box-sizing": "border-box",
        "z-index": "2",
      };

      // Build col-inner styles
      const innerStyles = {
        height: "100%",
        position: "relative",
        "text-align": align,
        "box-sizing": "border-box",
      };

      if (pt) innerStyles["padding-top"] = pt;
      if (pb) innerStyles["padding-bottom"] = pb;
      if (px) {
        innerStyles["padding-left"] = px;
        innerStyles["padding-right"] = px;
      }
      if (mx) {
        innerStyles["margin-left"] = mx;
        innerStyles["margin-right"] = mx;
      }

      // Only apply bg/gradient if not using paint (styleguide handles paint backgrounds)
      if (!paint) {
        if (gradient) {
          innerStyles["background"] = gradient;
        } else if (bg) {
          innerStyles["background-color"] = bg;
        }
      }
      if (bgImage) {
        innerStyles["background-image"] = `url(${bgImage})`;
      }

      // Apply shadow (styleguide refs handled via CSS variables)
      if (shadow && !isShadowStyleguide) {
        innerStyles["box-shadow"] = resolve(shadow, SHADOWS) || shadow;
      }

      // Handle border radius - styleguide corner refs handled via CSS variables
      if (corner && isCornerStyleguide) {
        // Styleguide corner - handled by CSS
      } else if (rounded) {
        innerStyles["border-radius"] = resolve(rounded, RADIUS) || rounded;
      }
      if (roundedTl)
        innerStyles["border-top-left-radius"] =
          resolve(roundedTl, RADIUS) || roundedTl;
      if (roundedTr)
        innerStyles["border-top-right-radius"] =
          resolve(roundedTr, RADIUS) || roundedTr;
      if (roundedBl)
        innerStyles["border-bottom-left-radius"] =
          resolve(roundedBl, RADIUS) || roundedBl;
      if (roundedBr)
        innerStyles["border-bottom-right-radius"] =
          resolve(roundedBr, RADIUS) || roundedBr;

      // Apply border (styleguide refs handled via CSS variables)
      if (border && !isBorderStyleguide) {
        innerStyles["border-width"] = resolve(border, BORDER_WIDTHS) || border;
        innerStyles["border-style"] = borderStyle;
      }
      if (borderColor) innerStyles["border-color"] = borderColor;

      // Determine background style class
      const bgStyleClass = bgImage ? getBgStyleClass(bgStyle) : "";

      // Build class attribute for col-inner
      const classes = ["col-inner"];
      if (bgStyleClass) classes.push(bgStyleClass);
      // Add styleguide CSS classes
      if (isShadowStyleguide) classes.push(`sg-shadow-${shadow}`);
      if (isBorderStyleguide) classes.push(`sg-border-${border}`);
      if (isCornerStyleguide) classes.push(`sg-corner-${corner}`);
      const classAttr = `class="${classes.join(" ")}"`;

      // Build data attributes for parser
      let dataAttrs = classAttr;
      if (overlay) dataAttrs += ` data-overlay="${overlay}"`;
      if (bg && !paint) dataAttrs += ` data-bg="${bg}"`;
      // Store original bg-image for conversion (not the swapped brand asset URL)
      const originalBgImage = attr(this, "bg-image");
      if (originalBgImage) dataAttrs += ` data-bg-image="${originalBgImage}"`;
      if (brandAsset) dataAttrs += ` data-brand-asset="${brandAsset}"`;
      if (bgStyleClass) dataAttrs += ` data-bg-style="${bgStyleClass}"`;
      // Add paint attribute for ClickFunnels export
      if (paint) dataAttrs += ` data-paint-colors="${paint}"`;
      // Add styleguide data attributes for ClickFunnels export
      if (isShadowStyleguide)
        dataAttrs += ` data-style-guide-shadow="${shadow}"`;
      if (isBorderStyleguide)
        dataAttrs += ` data-style-guide-border="${border}"`;
      if (isCornerStyleguide)
        dataAttrs += ` data-style-guide-corner="${corner}"`;

      // Check if we have separate corners
      const hasSeparateCorners =
        roundedTl || roundedTr || roundedBl || roundedBr;
      if (hasSeparateCorners) dataAttrs += ' data-separate-corners="true"';

      // Build overlay element and content wrapper if overlay specified
      let overlayHtml = "";
      let contentHtml = getContent(this);
      if (overlay) {
        overlayHtml = `<div class="cf-overlay" style="position:absolute;inset:0;background:${overlay};pointer-events:none;z-index:1;border-radius:inherit;"></div>`;
        contentHtml = `<div style="position:relative;z-index:2;">${contentHtml}</div>`;
      }

      // Build ID attribute for scroll-to and custom CSS targeting
      // ID goes on col-inner so custom CSS targets the styled element, not the structural wrapper
      const idAttr = elementId ? ` id="${elementId}"` : "";
      const showAttr = show ? ` data-show="${show}"` : "";

      // Only render col-inner if there's styling, otherwise just wrap content
      let innerHtml;
      if (hasColInnerStyling) {
        innerHtml = `<div${idAttr} ${dataAttrs} style="${buildStyle(
          innerStyles
        )}">${overlayHtml}${contentHtml}</div>`;
      } else {
        innerHtml = `<div${idAttr} class="col-inner" style="${buildStyle(
          innerStyles
        )}">${contentHtml}</div>`;
      }

      this.outerHTML = `
        <div data-type="ColContainer/V1" data-span="${span}" data-col-direction="${align}"${showAttr} style="${buildStyle(
        colStyles
      )}">
          ${innerHtml}
        </div>
      `;
    }
  }

  /**
   * <cf-col-inner> - Inner column wrapper (required inside cf-col)
   *
   * Attributes:
   *   bg          - Background color
   *   bg-image    - Background image URL
   *   gradient    - CSS gradient
   *   overlay     - Overlay color
   *   pt          - Padding top
   *   pb          - Padding bottom
   *   px          - Padding horizontal (left & right unified)
   *   mx          - Margin horizontal (creates column gaps)
   *   align       - Text alignment: left, center, right
   *   shadow      - Shadow
   *   rounded     - Border radius
   *   border      - Border width
   *   border-style - Border style
   *   border-color - Border color
   */
  class CFColInner extends CFElement {
    render() {
      const bg = attr(this, "bg");
      const bgImage = attr(this, "bg-image");
      const bgStyle = attr(this, "bg-style");
      const gradient = attr(this, "gradient");
      const overlay = attr(this, "overlay");
      const pt = attr(this, "pt", "20px");
      const pb = attr(this, "pb", "20px");
      const px = attr(this, "px");
      const mx = attr(this, "mx", "16px");
      const align = attr(this, "align", "left");
      const shadow = attr(this, "shadow");
      const rounded = attr(this, "rounded");
      const roundedTl = attr(this, "rounded-tl");
      const roundedTr = attr(this, "rounded-tr");
      const roundedBl = attr(this, "rounded-bl");
      const roundedBr = attr(this, "rounded-br");
      const border = attr(this, "border");
      const borderStyle = attr(this, "border-style", "solid");
      const borderColor = attr(this, "border-color");

      const styles = {
        height: "100%",
        position: "relative",
        "background-size": "cover",
        "background-position": "center",
        "background-repeat": "no-repeat",
        "padding-top": pt,
        "padding-bottom": pb,
        "text-align": align,
        "box-sizing": "border-box",
        "margin-left": mx,
        "margin-right": mx,
      };

      if (gradient) {
        styles["background"] = gradient;
      } else if (bg) {
        styles["background-color"] = bg;
      }
      if (bgImage) styles["background-image"] = `url(${bgImage})`;
      if (px) {
        styles["padding-left"] = px;
        styles["padding-right"] = px;
      }
      if (shadow) styles["box-shadow"] = resolve(shadow, SHADOWS) || shadow;

      if (rounded)
        styles["border-radius"] = resolve(rounded, RADIUS) || rounded;
      if (roundedTl)
        styles["border-top-left-radius"] =
          resolve(roundedTl, RADIUS) || roundedTl;
      if (roundedTr)
        styles["border-top-right-radius"] =
          resolve(roundedTr, RADIUS) || roundedTr;
      if (roundedBl)
        styles["border-bottom-left-radius"] =
          resolve(roundedBl, RADIUS) || roundedBl;
      if (roundedBr)
        styles["border-bottom-right-radius"] =
          resolve(roundedBr, RADIUS) || roundedBr;

      if (border) {
        styles["border-width"] = resolve(border, BORDER_WIDTHS) || border;
        styles["border-style"] = borderStyle;
      }
      if (borderColor) styles["border-color"] = borderColor;

      const bgStyleClass = bgImage ? getBgStyleClass(bgStyle) : "";
      const classes = ["col-inner"];
      if (bgStyleClass) classes.push(bgStyleClass);
      let dataAttrs = `class="${classes.join(" ")}" data-type="ColInner/V1"`;
      if (overlay) dataAttrs += ` data-overlay="${overlay}"`;
      if (bg) dataAttrs += ` data-bg="${bg}"`;
      if (bgImage) dataAttrs += ` data-bg-image="${bgImage}"`;
      if (bgStyleClass) dataAttrs += ` data-bg-style="${bgStyleClass}"`;
      const hasSeparateCorners =
        roundedTl || roundedTr || roundedBl || roundedBr;
      if (hasSeparateCorners) dataAttrs += ' data-separate-corners="true"';

      let overlayHtml = "";
      let contentHtml = getContent(this);
      if (overlay) {
        overlayHtml = `<div class="cf-overlay" style="position:absolute;inset:0;background:${overlay};pointer-events:none;z-index:1;border-radius:inherit;"></div>`;
        contentHtml = `<div style="position:relative;z-index:2;">${contentHtml}</div>`;
      }

      this.outerHTML = `
        <div ${dataAttrs} style="${buildStyle(styles)}">
          ${overlayHtml}${contentHtml}
        </div>
      `;
    }
  }

  /**
   * <cf-flex> - Flex container for advanced layouts
   *
   * Attributes:
   *   direction   - row, col, row-reverse, col-reverse
   *   justify     - start, center, end, between, around, evenly
   *   items       - start, center, end, stretch, baseline
   *   wrap        - true/false
   *   gap         - Gap between items (e.g., "16px")
   *   bg          - Background color
   *   gradient    - CSS gradient
   *   p           - Padding all sides
   *   px          - Padding horizontal
   *   py          - Padding vertical
   *   pt          - Padding top
   *   pb          - Padding bottom
   *   mt          - Margin top (NO margin-bottom!)
   *   shadow      - Shadow preset or styleguide ref (style1-3)
   *   rounded     - Border radius
   *   corner      - Styleguide corner ref (style1-3)
   *   border      - Border width or styleguide ref (style1-3)
   *   border-style - Border style
   *   border-color - Border color
   *   width       - Width (percentage or px)
   *   height      - Height (px)
   *   paint       - Styleguide paint theme: lightest, light, colored, dark, darkest
   */
  class CFFlex extends CFElement {
    render() {
      const elementId = attr(this, "element-id");
      const direction = attr(this, "direction", "row");
      const justify = attr(this, "justify", "start");
      const items = attr(this, "items", "start");
      const wrap = attr(this, "wrap");
      const gap = attr(this, "gap");
      const bg = attr(this, "bg");
      const gradient = attr(this, "gradient");
      const paint = attr(this, "paint");
      const p = attr(this, "p");
      const px = attr(this, "px");
      const py = attr(this, "py");
      const pt = attr(this, "pt");
      const pb = attr(this, "pb");
      const mt = attr(this, "mt");
      const shadow = attr(this, "shadow");
      const rounded = attr(this, "rounded");
      const corner = attr(this, "corner");
      const border = attr(this, "border");
      const borderStyle = attr(this, "border-style", "solid");
      const borderColor = attr(this, "border-color");
      const width = attr(this, "width");
      const height = attr(this, "height");
      const show = attr(this, "show");

      // Check if shadow/border/corner are styleguide references
      const isShadowStyleguide =
        shadow && styleguideManager.isStyleguideRef(shadow, "shadow");
      const isBorderStyleguide =
        border && styleguideManager.isStyleguideRef(border, "border");
      const isCornerStyleguide =
        corner && styleguideManager.isStyleguideRef(corner, "corner");

      // Map direction
      const flexDirection =
        {
          row: "row",
          col: "column",
          "row-reverse": "row-reverse",
          "col-reverse": "column-reverse",
        }[direction] || "row";

      // Map justify
      const justifyContent =
        {
          start: "flex-start",
          center: "center",
          end: "flex-end",
          between: "space-between",
          around: "space-around",
          evenly: "space-evenly",
        }[justify] || "flex-start";

      // Map align items
      const alignItems =
        {
          start: "flex-start",
          center: "center",
          end: "flex-end",
          stretch: "stretch",
          baseline: "baseline",
        }[items] || "center";

      // NOTE: Always centered horizontally with margin-left/right auto
      const styles = {
        display: "flex",
        "flex-direction": flexDirection,
        "justify-content": justifyContent,
        "align-items": alignItems,
        "box-sizing": "border-box",
        "margin-left": "auto",
        "margin-right": "auto",
      };

      if (wrap === "true" || wrap === "") styles["flex-wrap"] = "wrap";
      // Convert gap to em (16px = 1em), default to 1.5em (ClickFunnels default)
      if (gap) {
        if (gap.endsWith("px")) {
          const pxValue = parseFloat(gap);
          styles["gap"] = pxValue / 16 + "em";
        } else {
          styles["gap"] = gap;
        }
      } else {
        styles["gap"] = "1.5em";
      }
      // Only apply bg if not using paint (styleguide handles paint backgrounds)
      if (!paint) {
        if (gradient) {
          styles["background"] = gradient;
        } else if (bg) {
          styles["background-color"] = bg;
        }
      }
      // Handle padding - always use individual properties for parser compatibility
      if (p) {
        styles["padding-top"] = p;
        styles["padding-bottom"] = p;
        styles["padding-left"] = p;
        styles["padding-right"] = p;
      }
      if (px) {
        styles["padding-left"] = px;
        styles["padding-right"] = px;
      }
      if (py) {
        styles["padding-top"] = py;
        styles["padding-bottom"] = py;
      }
      if (pt) styles["padding-top"] = pt;
      if (pb) styles["padding-bottom"] = pb;
      if (mt) styles["margin-top"] = mt;

      // Shadow: use inline if not styleguide ref
      if (shadow && !isShadowStyleguide) {
        styles["box-shadow"] = resolve(shadow, SHADOWS) || shadow;
      }

      // Rounded/corner: prefer corner styleguide ref, fallback to rounded
      if (!isCornerStyleguide && (rounded || corner)) {
        styles["border-radius"] = resolve(rounded || corner, RADIUS) || rounded || corner;
      }

      // Border: use inline if not styleguide ref
      if (border && !isBorderStyleguide) {
        styles["border-width"] = resolve(border, BORDER_WIDTHS) || border;
        styles["border-style"] = borderStyle;
      }
      if (borderColor) styles["border-color"] = borderColor;
      // Only set width if explicitly provided - let flex shrink to fit content by default
      if (width) styles["width"] = width;
      if (height) styles["height"] = height;

      // Data attributes - include all flex properties for pagetree parser
      let dataAttrs = 'data-type="FlexContainer/V1"';
      if (show) dataAttrs += ` data-show="${show}"`;
      dataAttrs += ` data-direction="${direction}"`;
      dataAttrs += ` data-justify="${justify}"`;
      dataAttrs += ` data-items="${items}"`;
      if (wrap === "true" || wrap === "") dataAttrs += ' data-wrap="true"';
      // Store gap in em format for parser
      const gapValue = styles["gap"];
      dataAttrs += ` data-gap="${gapValue}"`;
      // Store width/height with units for proper roundtrip
      if (width) dataAttrs += ` data-width="${width}"`;
      if (height) dataAttrs += ` data-height="${height}"`;

      // Add styleguide data attributes
      if (paint) dataAttrs += ` data-paint-colors="${paint}"`;
      if (isShadowStyleguide) dataAttrs += ` data-style-guide-shadow="${shadow}"`;
      if (isBorderStyleguide) dataAttrs += ` data-style-guide-border="${border}"`;
      if (isCornerStyleguide) dataAttrs += ` data-style-guide-corner="${corner}"`;

      // Build ID attribute for scroll-to and show-hide targeting
      const idAttr = elementId ? ` id="${elementId}"` : "";

      this.outerHTML = `
        <div${idAttr} ${dataAttrs} style="${buildStyle(styles)}">
          ${getContent(this)}
        </div>
      `;
    }
  }

  /**
   * <cf-popup> - Popup/Modal container
   *
   * Each ClickFunnels page can have one popup that can be triggered to show.
   * Renders as ModalContainer/V1 in pagetree.
   *
   * Attributes:
   *   width       - Modal width (default: 750px)
   *   overlay     - Overlay background color (default: rgba(0,0,0,0.5))
   *   rounded     - Border radius for modal (default: 16px)
   *   border      - Border width
   *   border-color - Border color
   *   shadow      - Box shadow
   *   mt          - Margin top (default: 45px)
   *   mb          - Margin bottom (default: 10px)
   *   px          - Horizontal padding on overlay wrapper
   *
   * Children: cf-section elements that form the popup content
   */
  class CFPopup extends CFElement {
    render() {
      const width = attr(this, "width", "750px");
      const overlay = attr(this, "overlay", "rgba(0,0,0,0.5)");
      const rounded = attr(this, "rounded", "16px");
      const border = attr(this, "border");
      const borderColor = attr(this, "border-color", "#000000");
      const shadow = attr(this, "shadow");
      const mt = attr(this, "mt", "45px");
      const mb = attr(this, "mb", "10px");
      const px = attr(this, "px", "0");

      // Modal container styles (the actual popup box)
      const modalStyles = {
        "max-width": "100%",
        "margin-top": mt,
        "margin-bottom": mb,
        "margin-left": "auto",
        "margin-right": "auto",
        "border-radius": resolve(rounded, RADIUS) || rounded,
        "background-color": "#ffffff",
        "position": "relative",
        "box-sizing": "border-box",
      };

      if (border) {
        modalStyles["border-width"] = resolve(border, BORDER_WIDTHS) || border;
        modalStyles["border-style"] = "solid";
        modalStyles["border-color"] = borderColor;
      }
      if (shadow) {
        modalStyles["box-shadow"] = resolve(shadow, SHADOWS) || shadow;
      }

      // Inner container styles (holds the width)
      const innerStyles = {
        width: width,
        "max-width": "100%",
        "margin-left": "auto",
        "margin-right": "auto",
      };

      // Wrapper styles (overlay background)
      const wrapperStyles = {
        position: "fixed",
        inset: "0",
        "background-color": overlay,
        display: "none",
        "align-items": "flex-start",
        "justify-content": "center",
        "overflow-y": "auto",
        "z-index": "9999",
        "padding-left": px,
        "padding-right": px,
      };

      // Build data attributes
      let dataAttrs = 'data-type="ModalContainer/V1"';
      dataAttrs += ` data-popup-width="${width}"`;
      dataAttrs += ` data-popup-overlay="${overlay}"`;
      dataAttrs += ` data-popup-rounded="${rounded}"`;
      if (border) dataAttrs += ` data-popup-border="${border}"`;
      if (borderColor) dataAttrs += ` data-popup-border-color="${borderColor}"`;
      if (shadow) dataAttrs += ` data-popup-shadow="${shadow}"`;

      // Get the resolved border radius value for the first section
      const resolvedRounded = resolve(rounded, RADIUS) || rounded;

      // Process content to add rounded to first cf-section
      let content = getContent(this);
      // Add data attribute to pass rounded value to first section
      const contentWithRounded = content.replace(
        /<cf-section/i,
        `<cf-section data-popup-rounded="${resolvedRounded}"`
      );

      this.outerHTML = `
        <div class="cf-popup-wrapper" ${dataAttrs} style="${buildStyle(wrapperStyles)}">
          <div class="cf-popup-modal containerModal" style="${buildStyle(modalStyles)}">
            <button class="cf-popup-close" style="position:absolute;top:-12px;right:-12px;width:28px;height:28px;border:none;background:#000000;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;box-shadow:0 2px 8px rgba(0,0,0,0.3);" onclick="this.closest('.cf-popup-wrapper').style.display='none'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div class="elModalInnerContainer" style="${buildStyle(innerStyles)}">
              ${contentWithRounded}
            </div>
          </div>
        </div>
      `;
    }
  }

  // ==========================================================================
  // TEXT ELEMENTS
  // ==========================================================================

  /**
   * <cf-headline> - Primary heading
   *
   * Attributes:
   *   size        - Font size (e.g., "48px", "36px")
   *   weight      - Font weight: thin, light, normal, medium, semibold, bold, extrabold, black
   *   color       - Text color
   *   align       - Text alignment: left, center, right
   *   leading     - Line height: none, tight, snug, normal, relaxed, loose, or percentage
   *   tracking    - Letter spacing (e.g., "-0.02em", "0.05em")
   *   transform   - Text transform: uppercase, lowercase, capitalize
   *   pt          - Wrapper padding top
   *   pb          - Wrapper padding bottom
   *   mt          - Wrapper margin top
   *   tag         - HTML tag: h1, h2, h3, span (default: h1)
   *   icon        - FontAwesome icon (e.g., "fas fa-star") - OLD format only
   *   icon-align  - Icon position: left, right (default: left)
   */
  class CFHeadline extends CFElement {
    render() {
      const size = attr(this, "size", "48px");
      const weight = attr(this, "weight", "bold");
      const font = attr(this, "font");
      const color = attr(this, "color");
      const hasExplicitColor = this.hasAttribute("color");
      const align = attr(this, "align", "center");
      const leading = attr(this, "leading", "tight");
      const tracking = attr(this, "tracking");
      const transform = attr(this, "transform");
      const pt = attr(this, "pt", "0");
      const pb = attr(this, "pb", "0");
      const mt = attr(this, "mt", "0");
      const tag = attr(this, "tag", "h1");
      const icon = attr(this, "icon");
      const iconAlign = attr(this, "icon-align", "left");

      // NOTE: No width set - allows flex layout to work properly
      // In columns, block elements naturally take 100% width
      // In flex containers, they'll size to content
      const wrapperStyles = {
        "padding-top": pt,
        "padding-bottom": pb,
        "margin-top": mt || "20px",
        "box-sizing": "border-box",
      };

      // Resolve size preset to pixel value for CSS, keep original for data attr
      // First try styleguide typescale, then static FONT_SIZES, then use as-is
      const resolvedSize = styleguideManager.resolveSize(size, 'headline') || resolve(size, FONT_SIZES) || size;

      const textStyles = {
        margin: "0",
        "font-size": resolvedSize,
        "font-weight": resolve(weight, FONT_WEIGHTS) || weight,
        "text-align": align,
        "line-height": resolve(leading, LINE_HEIGHTS) || leading,
      };
      if (hasExplicitColor && color) textStyles.color = `${color} !important`;
      if (font) textStyles["font-family"] = font;
      if (tracking) textStyles["letter-spacing"] = tracking;
      if (transform) textStyles["text-transform"] = transform;

      // Build data attributes for round-trip conversion
      // Store original size (preset or px) for reliable roundtrip
      let dataAttrs = 'data-type="Headline/V1"';
      dataAttrs += ` data-size="${size}"`;
      dataAttrs += ` data-weight="${weight}"`;
      if (hasExplicitColor && color) {
        dataAttrs += ` data-color="${color}" data-color-explicit="true"`;
      }
      dataAttrs += ` data-align="${align}"`;
      dataAttrs += ` data-leading="${leading}"`;
      if (font) dataAttrs += ` data-font="${font}"`;
      if (tracking) dataAttrs += ` data-tracking="${tracking}"`;
      if (transform) dataAttrs += ` data-transform="${transform}"`;
      if (pt !== "0") dataAttrs += ` data-pt="${pt}"`;
      if (pb !== "0") dataAttrs += ` data-pb="${pb}"`;
      if (mt !== "0") dataAttrs += ` data-mt="${mt}"`;
      if (icon) dataAttrs += ` data-icon="${icon}"`;
      if (icon && iconAlign !== "left") dataAttrs += ` data-icon-align="${iconAlign}"`;

      // Build icon HTML if present
      let iconHtml = "";
      if (icon) {
        const iconSpacing = iconAlign === "left" ? "margin-right: 8px;" : "margin-left: 8px;";
        iconHtml = `<i class="${icon}" style="${iconSpacing}"></i>`;
      }

      // Combine text with icon
      const textWithIcon = iconAlign === "left"
        ? iconHtml + getContent(this)
        : getContent(this) + iconHtml;

      // Animation attributes
      const animationAttrs = buildAnimationAttrs(this);
      dataAttrs += animationAttrs;

      this.outerHTML = `
        <div ${dataAttrs} style="${buildStyle(wrapperStyles)}">
          <${tag} style="${buildStyle(textStyles)}">${textWithIcon}</${tag}>
        </div>
      `;
    }
  }

  /**
   * <cf-subheadline> - Secondary heading
   * Same attributes as cf-headline (including icon and icon-align)
   */
  class CFSubheadline extends CFElement {
    render() {
      const size = attr(this, "size", "24px");
      const weight = attr(this, "weight", "normal");
      const font = attr(this, "font");
      const color = attr(this, "color");
      const hasExplicitColor = this.hasAttribute("color");
      const align = attr(this, "align", "center");
      const leading = attr(this, "leading", "relaxed");
      const tracking = attr(this, "tracking");
      const transform = attr(this, "transform");
      const pt = attr(this, "pt", "0");
      const pb = attr(this, "pb", "0");
      const mt = attr(this, "mt", "0");
      const tag = attr(this, "tag", "h2");
      const icon = attr(this, "icon");
      const iconAlign = attr(this, "icon-align", "left");

      // NOTE: No width set - allows flex layout to work properly
      const wrapperStyles = {
        "padding-top": pt,
        "padding-bottom": pb,
        "margin-top": mt,
        "box-sizing": "border-box",
      };

      // Resolve size preset to pixel value for CSS, keep original for data attr
      // First try styleguide typescale, then static FONT_SIZES, then use as-is
      const resolvedSize = styleguideManager.resolveSize(size, 'subheadline') || resolve(size, FONT_SIZES) || size;

      const textStyles = {
        margin: "0",
        "font-size": resolvedSize,
        "font-weight": resolve(weight, FONT_WEIGHTS) || weight,
        "text-align": align,
        "line-height": resolve(leading, LINE_HEIGHTS) || leading,
      };
      if (hasExplicitColor && color) textStyles.color = `${color} !important`;
      if (font) textStyles["font-family"] = font;
      if (tracking) textStyles["letter-spacing"] = tracking;
      if (transform) textStyles["text-transform"] = transform;

      // Build data attributes for round-trip conversion
      // Store original size (preset or px) for reliable roundtrip
      let dataAttrs = 'data-type="SubHeadline/V1"';
      dataAttrs += ` data-size="${size}"`;
      dataAttrs += ` data-weight="${weight}"`;
      if (hasExplicitColor && color) {
        dataAttrs += ` data-color="${color}" data-color-explicit="true"`;
      }
      dataAttrs += ` data-align="${align}"`;
      dataAttrs += ` data-leading="${leading}"`;
      if (font) dataAttrs += ` data-font="${font}"`;
      if (tracking) dataAttrs += ` data-tracking="${tracking}"`;
      if (transform) dataAttrs += ` data-transform="${transform}"`;
      if (pt !== "0") dataAttrs += ` data-pt="${pt}"`;
      if (pb !== "0") dataAttrs += ` data-pb="${pb}"`;
      if (mt !== "0") dataAttrs += ` data-mt="${mt}"`;
      if (icon) dataAttrs += ` data-icon="${icon}"`;
      if (icon && iconAlign !== "left") dataAttrs += ` data-icon-align="${iconAlign}"`;

      // Build icon HTML if present
      let iconHtml = "";
      if (icon) {
        const iconSpacing = iconAlign === "left" ? "margin-right: 8px;" : "margin-left: 8px;";
        iconHtml = `<i class="${icon}" style="${iconSpacing}"></i>`;
      }

      // Combine text with icon
      const textWithIcon = iconAlign === "left"
        ? iconHtml + getContent(this)
        : getContent(this) + iconHtml;

      // Animation attributes
      const animationAttrs = buildAnimationAttrs(this);
      dataAttrs += animationAttrs;

      this.outerHTML = `
        <div ${dataAttrs} style="${buildStyle(wrapperStyles)}">
          <${tag} style="${buildStyle(textStyles)}">${textWithIcon}</${tag}>
        </div>
      `;
    }
  }

  /**
   * <cf-paragraph> - Body text
   * Same attributes as cf-headline (including icon and icon-align)
   */
  class CFParagraph extends CFElement {
    render() {
      const size = attr(this, "size", "16px");
      const weight = attr(this, "weight", "normal");
      const font = attr(this, "font");
      const color = attr(this, "color");
      const hasExplicitColor = this.hasAttribute("color");
      const align = attr(this, "align", "center");
      const leading = attr(this, "leading", "relaxed");
      const tracking = attr(this, "tracking");
      const transform = attr(this, "transform");
      const pt = attr(this, "pt", "0");
      const pb = attr(this, "pb", "0");
      const px = attr(this, "px");
      const mt = attr(this, "mt", "0");
      const bg = attr(this, "bg");
      const icon = attr(this, "icon");
      const iconAlign = attr(this, "icon-align", "left");

      // NOTE: No width set - allows flex layout to work properly
      const wrapperStyles = {
        "padding-top": pt,
        "padding-bottom": pb,
        "margin-top": mt,
        "box-sizing": "border-box",
      };
      if (bg) {
        wrapperStyles["background-color"] = bg;
      }
      if (px) {
        wrapperStyles["padding-left"] = px;
        wrapperStyles["padding-right"] = px;
      }

      // Resolve size preset to pixel value for CSS, keep original for data attr
      // First try styleguide typescale, then static FONT_SIZES, then use as-is
      const resolvedSize = styleguideManager.resolveSize(size, 'paragraph') || resolve(size, FONT_SIZES) || size;

      const textStyles = {
        margin: "0",
        "font-size": resolvedSize,
        "font-weight": resolve(weight, FONT_WEIGHTS) || weight,
        "text-align": align,
        "line-height": resolve(leading, LINE_HEIGHTS) || leading,
      };
      if (hasExplicitColor && color) textStyles.color = `${color} !important`;
      if (font) textStyles["font-family"] = font;
      if (tracking) textStyles["letter-spacing"] = tracking;
      if (transform) textStyles["text-transform"] = transform;

      // Build data attributes for round-trip conversion
      // Store original size (preset or px) for reliable roundtrip
      let dataAttrs = 'data-type="Paragraph/V1"';
      dataAttrs += ` data-size="${size}"`;
      dataAttrs += ` data-weight="${weight}"`;
      if (hasExplicitColor && color) {
        dataAttrs += ` data-color="${color}" data-color-explicit="true"`;
      }
      dataAttrs += ` data-align="${align}"`;
      dataAttrs += ` data-leading="${leading}"`;
      if (font) dataAttrs += ` data-font="${font}"`;
      if (tracking) dataAttrs += ` data-tracking="${tracking}"`;
      if (transform) dataAttrs += ` data-transform="${transform}"`;
      if (pt !== "0") dataAttrs += ` data-pt="${pt}"`;
      if (pb !== "0") dataAttrs += ` data-pb="${pb}"`;
      if (mt !== "0") dataAttrs += ` data-mt="${mt}"`;
      if (px) dataAttrs += ` data-px="${px}"`;
      if (bg) dataAttrs += ` data-bg="${bg}"`;
      if (icon) dataAttrs += ` data-icon="${icon}"`;
      if (icon && iconAlign !== "left") dataAttrs += ` data-icon-align="${iconAlign}"`;

      // Build icon HTML if present
      let iconHtml = "";
      if (icon) {
        const iconSpacing = iconAlign === "left" ? "margin-right: 8px;" : "margin-left: 8px;";
        iconHtml = `<i class="${icon}" style="${iconSpacing}"></i>`;
      }

      // Combine text with icon
      const textWithIcon = iconAlign === "left"
        ? iconHtml + getContent(this)
        : getContent(this) + iconHtml;

      // Animation attributes
      const animationAttrs = buildAnimationAttrs(this);
      dataAttrs += animationAttrs;

      this.outerHTML = `
        <div ${dataAttrs} style="${buildStyle(wrapperStyles)}">
          <p style="${buildStyle(textStyles)}">${textWithIcon}</p>
        </div>
      `;
    }
  }

  // ==========================================================================
  // INTERACTIVE ELEMENTS
  // ==========================================================================

  /**
   * <cf-button> - CTA Button
   *
   * Attributes:
   *   href        - Link URL
   *   style       - Styleguide button style: style1, style2, style3
   *   bg          - Background color (ignored if style is set)
   *   color       - Text color (ignored if style is set)
   *   size        - Font size
   *   weight      - Font weight
   *   px          - Horizontal padding
   *   py          - Vertical padding
   *   pt          - Wrapper padding top
   *   pb          - Wrapper padding bottom
   *   mt          - Wrapper margin top
   *   rounded     - Border radius (ignored if style is set)
   *   shadow      - Box shadow (ignored if style is set)
   *   align       - Button alignment: left, center, right
   *   full-width  - Full width button (true/false)
   *   subtext     - Optional subtext below main text
   *   subtext-color - Subtext color
   *   icon        - FontAwesome icon (e.g., "fas fa-arrow-right")
   *   icon-position - Icon position: left, right
   */
  class CFButton extends CFElement {
    render() {
      const action = attr(this, "action", "link");
      const target = attr(this, "target", "_self");
      let href = attr(this, "href", "#");

      // Action-specific attributes
      const scrollTarget = attr(this, "scroll-target");
      const showIds = attr(this, "show-ids");
      const hideIds = attr(this, "hide-ids");

      // Map action to href
      if (action === "submit") {
        href = "#submit-form";
      } else if (action === "popup") {
        href = "#open-popup";
      } else if (action === "scroll" && scrollTarget) {
        href = `#scroll-${scrollTarget}`;
      } else if (action === "show-hide") {
        href = "#show-hide";
      } else if (action === "next-step") {
        href = "?next_funnel_step=true";
      } else if (action === "oto" || action === "one-click-upsell") {
        href = "#submit-oto";
      }

      const buttonStyleRef = attr(this, "style");
      const isStyleguideButton =
        buttonStyleRef &&
        styleguideManager.isStyleguideRef(buttonStyleRef, "button");

      // Always read attribute values - we need them for data attributes even if using styleguide
      const bg = attr(this, "bg", "#3b82f6");
      const color = attr(this, "color", "#ffffff");
      const size = attr(this, "size", "20px");
      const weight = attr(this, "weight", "bold");
      const px = attr(this, "px", "32px");
      const py = attr(this, "py", "16px");
      const pt = attr(this, "pt", "0");
      const pb = attr(this, "pb");
      const mt = attr(this, "mt", "0");
      const rounded = attr(this, "rounded", "default");
      const shadow = attr(this, "shadow");
      const borderColor = attr(this, "border-color");
      const borderWidth = attr(this, "border-width", "0");
      const align = attr(this, "align", "center");
      const fullWidth = attr(this, "full-width");
      const subtext = attr(this, "subtext");
      const subtextColor = attr(this, "subtext-color", "rgba(255,255,255,0.8)");
      const icon = attr(this, "icon");
      const iconPosition = attr(this, "icon-position", "left");
      const iconColor = attr(this, "icon-color", color);

      // NOTE: No width set - allows flex layout to work properly
      const wrapperStyles = {
        "text-align": align,
        "padding-top": pt,
        "margin-top": mt,
        "box-sizing": "border-box",
      };
      if (pb) wrapperStyles["padding-bottom"] = pb;

      const buttonStyles = {
        display: "inline-flex",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        "text-decoration": "none",
        cursor: "pointer",
        "padding-left": px,
        "padding-right": px,
        "padding-top": py,
        "padding-bottom": py,
        "box-sizing": "border-box",
      };

      // Only add inline styling if not using styleguide button
      if (!isStyleguideButton) {
        if (bg) buttonStyles["background-color"] = bg;
        if (rounded)
          buttonStyles["border-radius"] = resolve(rounded, RADIUS) || rounded;
        buttonStyles["border-style"] = "solid";
        buttonStyles["border-width"] = borderWidth;
        buttonStyles["border-color"] = borderColor || "transparent";
        if (shadow)
          buttonStyles["box-shadow"] = resolve(shadow, SHADOWS) || shadow;
      }

      if (fullWidth === "true" || fullWidth === "")
        buttonStyles["width"] = "100%";

      const textStyles = {
        display: "inline-flex",
        "align-items": "center",
        "justify-content": "center",
        "font-size": size,
        "font-weight": resolve(weight, FONT_WEIGHTS) || weight,
      };

      // Only add color if not using styleguide button
      if (!isStyleguideButton && color) {
        textStyles.color = color;
      }

      const iconStyles = {};
      if (!isStyleguideButton && iconColor) {
        iconStyles.color = iconColor;
      }

      const subtextStyles = {
        display: "block",
        "text-align": "center",
        "font-size": "14px",
        "margin-top": "4px",
      };
      if (!isStyleguideButton) {
        subtextStyles.color = subtextColor;
      }

      // Build icon HTML with margin
      let iconLeftHtml = "";
      let iconRightHtml = "";
      if (icon && iconPosition === "left") {
        const iconStyle = Object.keys(iconStyles).length
          ? `style="${buildStyle(iconStyles)}; margin-right: 10px;"`
          : 'style="margin-right: 10px;"';
        iconLeftHtml = `<i class="${icon}" ${iconStyle}></i>`;
      }
      if (icon && iconPosition === "right") {
        const iconStyle = Object.keys(iconStyles).length
          ? `style="${buildStyle(iconStyles)}; margin-left: 10px;"`
          : 'style="margin-left: 10px;"';
        iconRightHtml = `<i class="${icon}" ${iconStyle}></i>`;
      }

      const subtextHtml = subtext
        ? `<span style="${buildStyle(subtextStyles)}">${subtext}</span>`
        : "";

      // Build data attributes - include all styling values for round-trip conversion
      let wrapperDataAttrs = `data-type="Button/V1" data-href="${href}" data-target="${target}" data-action="${action}"`;

      // Styling data attributes (for parser to read back)
      // Always include styling attrs so parser can output them
      if (isStyleguideButton) {
        wrapperDataAttrs += ` data-style-guide-button="${buttonStyleRef}"`;
      }
      if (bg) wrapperDataAttrs += ` data-bg="${bg}"`;
      if (color) wrapperDataAttrs += ` data-color="${color}"`;
      if (rounded) wrapperDataAttrs += ` data-rounded="${rounded}"`;
      if (shadow) wrapperDataAttrs += ` data-shadow="${shadow}"`;
      if (borderColor) wrapperDataAttrs += ` data-border-color="${borderColor}"`;
      if (borderWidth !== "0") wrapperDataAttrs += ` data-border-width="${borderWidth}"`;
      if (iconColor && iconColor !== color) wrapperDataAttrs += ` data-icon-color="${iconColor}"`;

      // Common attributes
      wrapperDataAttrs += ` data-size="${size}"`;
      wrapperDataAttrs += ` data-weight="${weight}"`;
      wrapperDataAttrs += ` data-px="${px}"`;
      wrapperDataAttrs += ` data-py="${py}"`;
      if (align !== "center") wrapperDataAttrs += ` data-align="${align}"`;
      if (fullWidth === "true" || fullWidth === "") wrapperDataAttrs += ` data-full-width="true"`;
      if (subtext) wrapperDataAttrs += ` data-subtext="${subtext}"`;
      if (subtextColor !== "rgba(255,255,255,0.8)") wrapperDataAttrs += ` data-subtext-color="${subtextColor}"`;
      if (icon) {
        wrapperDataAttrs += ` data-icon="${icon}"`;
        wrapperDataAttrs += ` data-icon-position="${iconPosition}"`;
      }

      // Action-specific data attributes for parser
      if (action === "show-hide") {
        wrapperDataAttrs += ` data-elbuttontype="showHide"`;
        if (showIds) wrapperDataAttrs += ` data-show-ids="${showIds}"`;
        if (hideIds) wrapperDataAttrs += ` data-hide-ids="${hideIds}"`;
      }
      if (action === "scroll" && scrollTarget) {
        wrapperDataAttrs += ` data-scroll-target="${scrollTarget}"`;
      }

      // Animation attributes
      const animationAttrs = buildAnimationAttrs(this);
      wrapperDataAttrs += animationAttrs;

      this.outerHTML = `
        <div ${wrapperDataAttrs} style="${buildStyle(wrapperStyles)}">
          <a href="${href}" target="${target}" style="${buildStyle(
        buttonStyles
      )}">
            <span style="${buildStyle(textStyles)}">
              ${iconLeftHtml}${getContent(this)}${iconRightHtml}
            </span>
            ${subtextHtml}
          </a>
        </div>
      `;
    }
  }

  // ==========================================================================
  // MEDIA ELEMENTS
  // ==========================================================================

  /**
   * <cf-image> - Image element
   *
   * Attributes:
   *   src         - Image URL (required)
   *   alt         - Alt text
   *   width       - Width (e.g., "400px", "100%")
   *   height      - Height
   *   align       - Alignment: left, center, right
   *   rounded     - Border radius
   *   corner      - Styleguide corner ref (style1-3)
   *   shadow      - Box shadow or styleguide ref (style1-3)
   *   border      - Border width or styleguide ref (style1-3)
   *   border-style - Border style
   *   border-color - Border color
   *   object-fit  - Object fit: cover, contain, fill
   *   pt          - Wrapper padding top
   *   pb          - Wrapper padding bottom
   *   mt          - Wrapper margin top
   *   brand-asset - Brand asset type to use: logo, background, pattern, icon, product_image
   *                 When set, the src will be replaced with the active brand asset URL if available
   */
  class CFImage extends CFElement {
    render() {
      let src = attr(this, "src", "");
      const alt = attr(this, "alt", "");
      const width = attr(this, "width", "100%");
      const height = attr(this, "height");
      const align = attr(this, "align", "center");
      const rounded = attr(this, "rounded");
      const corner = attr(this, "corner");
      const shadow = attr(this, "shadow");
      const border = attr(this, "border");
      const borderStyle = attr(this, "border-style", "solid");
      const borderColor = attr(this, "border-color");
      const objectFit = attr(this, "object-fit");
      const pt = attr(this, "pt", "0");
      const pb = attr(this, "pb", "0");
      const mt = attr(this, "mt", "0");
      const brandAsset = attr(this, "brand-asset");

      // Check if shadow/border/corner are styleguide references
      const isShadowStyleguide =
        shadow && styleguideManager.isStyleguideRef(shadow, "shadow");
      const isBorderStyleguide =
        border && styleguideManager.isStyleguideRef(border, "border");
      const isCornerStyleguide =
        corner && styleguideManager.isStyleguideRef(corner, "corner");

      // If brand-asset is specified, try to get the asset URL from brand assets manager
      if (brandAsset && brandAssetsManager.hasAsset(brandAsset)) {
        const brandAssetUrl = brandAssetsManager.getAssetUrl(brandAsset);
        if (brandAssetUrl) {
          src = brandAssetUrl;
        }
      }

      // NOTE: No width set - allows flex layout to work properly
      const wrapperStyles = {
        "text-align": align,
        "padding-top": pt,
        "padding-bottom": pb,
        "margin-top": mt,
        "box-sizing": "border-box",
      };

      // When shadow + rounded/corner are both present with inline styles, use inner container
      // This ensures box-shadow follows the border-radius properly
      const hasInlineRadius = !isCornerStyleguide && (rounded || corner);
      const hasInlineShadow = shadow && !isShadowStyleguide;
      const needsInnerContainer = hasInlineRadius && hasInlineShadow;

      const resolvedRadius = (rounded || corner) ? (resolve(rounded || corner, RADIUS) || rounded || corner) : null;
      const resolvedShadow = shadow ? (resolve(shadow, SHADOWS) || shadow) : null;

      const innerContainerStyles = needsInnerContainer ? {
        display: "inline-block",
        "border-radius": resolvedRadius,
        overflow: "hidden",
        "box-shadow": resolvedShadow,
        "max-width": "100%",
      } : null;

      const imgStyles = {
        display: needsInnerContainer ? "block" : "inline-block",
        "vertical-align": "top",
        "max-width": "100%",
        width: width,
      };
      if (height) imgStyles["height"] = height;

      // Rounded/corner: apply to img only if no inner container
      if (!needsInnerContainer && !isCornerStyleguide && (rounded || corner)) {
        imgStyles["border-radius"] = resolvedRadius;
      }

      // Shadow: apply to img only if no inner container (and not styleguide ref)
      if (!needsInnerContainer && shadow && !isShadowStyleguide) {
        imgStyles["box-shadow"] = resolvedShadow;
      }

      // Border: use inline if not styleguide ref
      if (border && !isBorderStyleguide) {
        imgStyles["border-width"] = resolve(border, BORDER_WIDTHS) || border;
        imgStyles["border-style"] = borderStyle;
      }
      if (borderColor) imgStyles["border-color"] = borderColor;
      if (objectFit) imgStyles["object-fit"] = objectFit;

      // Build data attributes for roundtrip conversion
      // Note: We store the original src, not the swapped brand asset URL
      const originalSrc = attr(this, "src", "");
      let dataAttrs = 'data-type="Image/V2"';
      dataAttrs += ` data-src="${originalSrc}"`;
      if (alt) dataAttrs += ` data-alt="${alt}"`;
      if (width !== "100%") dataAttrs += ` data-width="${width}"`;
      if (height) dataAttrs += ` data-height="${height}"`;
      if (align !== "center") dataAttrs += ` data-align="${align}"`;
      if (rounded) dataAttrs += ` data-rounded="${rounded}"`;
      if (corner) dataAttrs += ` data-corner="${corner}"`;
      if (shadow) dataAttrs += ` data-shadow="${shadow}"`;
      if (border) dataAttrs += ` data-border="${border}"`;
      if (borderStyle !== "solid")
        dataAttrs += ` data-border-style="${borderStyle}"`;
      if (borderColor) dataAttrs += ` data-border-color="${borderColor}"`;
      if (objectFit) dataAttrs += ` data-object-fit="${objectFit}"`;
      if (brandAsset) dataAttrs += ` data-brand-asset="${brandAsset}"`;

      // Add styleguide data attributes
      if (isShadowStyleguide) dataAttrs += ` data-style-guide-shadow="${shadow}"`;
      if (isBorderStyleguide) dataAttrs += ` data-style-guide-border="${border}"`;
      if (isCornerStyleguide) dataAttrs += ` data-style-guide-corner="${corner}"`;

      // Animation attributes
      const animationAttrs = buildAnimationAttrs(this);
      dataAttrs += animationAttrs;

      const imgHtml = `<img src="${src}" alt="${alt}" style="${buildStyle(imgStyles)}" />`;
      const innerHtml = needsInnerContainer
        ? `<span style="${buildStyle(innerContainerStyles)}">${imgHtml}</span>`
        : imgHtml;

      this.outerHTML = `
        <div ${dataAttrs} style="${buildStyle(wrapperStyles)}">
          ${innerHtml}
        </div>
      `;
    }
  }

  /**
   * <cf-icon> - FontAwesome icon
   *
   * IMPORTANT: Use OLD FontAwesome format: "fas fa-check" NOT "fa-solid fa-check"
   *
   * Attributes:
   *   icon        - FontAwesome classes (e.g., "fas fa-rocket")
   *   size        - Font size
   *   color       - Icon color
   *   align       - Alignment: left, center, right (default: center)
   *   opacity     - Opacity value 0-1 (e.g., "0.5", "0.8")
   *   pt          - Padding top
   *   pb          - Padding bottom
   *   mt          - Margin top
   */
  class CFIcon extends CFElement {
    render() {
      const icon = attr(this, "icon", "fas fa-star");
      const size = attr(this, "size", "48px");
      const color = attr(this, "color");
      const hasExplicitColor = this.hasAttribute("color");
      const align = attr(this, "align", "center");
      const opacity = attr(this, "opacity");
      const pt = attr(this, "pt", "12px");
      const pb = attr(this, "pb", "12px");
      const mt = attr(this, "mt", "0");

      // NOTE: No width set - allows flex layout to work properly
      const wrapperStyles = {
        "text-align": align,
        "padding-top": pt,
        "padding-bottom": pb,
        "margin-top": mt,
        "box-sizing": "border-box",
      };

      const iconStyles = {
        display: "inline-block",
        "font-size": size,
      };
      if (hasExplicitColor && color) iconStyles.color = `${color} !important`;
      if (opacity) iconStyles["opacity"] = opacity;

      // Build data attributes for roundtrip conversion
      let dataAttrs = 'data-type="Icon/V1"';
      dataAttrs += ` data-icon="${icon}"`;
      if (size !== "48px") dataAttrs += ` data-size="${size}"`;
      if (hasExplicitColor && color)
        dataAttrs += ` data-color="${color}" data-color-explicit="true"`;
      if (align !== "center") dataAttrs += ` data-align="${align}"`;
      if (opacity) dataAttrs += ` data-opacity="${opacity}"`;
      // Store padding/margin for reliable roundtrip
      if (pt !== "12px") dataAttrs += ` data-pt="${pt}"`;
      if (pb !== "12px") dataAttrs += ` data-pb="${pb}"`;
      if (mt !== "0") dataAttrs += ` data-mt="${mt}"`;

      // Animation attributes
      const animationAttrs = buildAnimationAttrs(this);
      dataAttrs += animationAttrs;

      this.outerHTML = `
        <div ${dataAttrs} style="${buildStyle(wrapperStyles)}">
          <i class="${icon}" style="${buildStyle(iconStyles)}"></i>
        </div>
      `;
    }
  }

  /**
   * <cf-video> - YouTube video embed
   *
   * Attributes:
   *   url         - Full YouTube URL
   *   rounded     - Border radius
   *   corner      - Styleguide corner ref (style1-3)
   *   shadow      - Box shadow or styleguide ref (style1-3)
   *   border      - Border width or styleguide ref (style1-3)
   *   border-style - Border style
   *   border-color - Border color
   *   bg          - Background color (before video loads)
   *   pt          - Padding top (default: 0)
   *   pb          - Padding bottom (default: 0)
   *   px          - Padding horizontal (left + right)
   *   mt          - Margin top (default: 0)
   */
  class CFVideo extends CFElement {
    render() {
      const url = attr(this, "url", "");
      const rounded = attr(this, "rounded", "lg");
      const corner = attr(this, "corner");
      const shadow = attr(this, "shadow", "lg");
      const border = attr(this, "border");
      const borderStyle = attr(this, "border-style", "solid");
      const borderColor = attr(this, "border-color");
      const bg = attr(this, "bg", "#000");
      const pt = attr(this, "pt", "0");
      const pb = attr(this, "pb", "0");
      const px = attr(this, "px");
      const mt = attr(this, "mt", "0");

      // Check if shadow/border/corner are styleguide references
      const isShadowStyleguide =
        shadow && styleguideManager.isStyleguideRef(shadow, "shadow");
      const isBorderStyleguide =
        border && styleguideManager.isStyleguideRef(border, "border");
      const isCornerStyleguide =
        corner && styleguideManager.isStyleguideRef(corner, "corner");

      // Extract YouTube video ID
      const match = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
      );
      const videoId = match ? match[1] : "";
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;

      // NOTE: No width on wrapper - allows flex layout to work properly
      const wrapperStyles = {
        "padding-top": pt,
        "padding-bottom": pb,
        "margin-top": mt,
        "box-sizing": "border-box",
      };
      if (px) {
        wrapperStyles["padding-left"] = px;
        wrapperStyles["padding-right"] = px;
      }

      const containerStyles = {
        width: "100%",
        "aspect-ratio": "16/9",
        position: "relative",
        overflow: "hidden",
        "background-color": bg,
      };

      // Rounded/corner: prefer corner styleguide ref, fallback to rounded
      if (!isCornerStyleguide && (rounded || corner)) {
        containerStyles["border-radius"] = resolve(rounded || corner, RADIUS) || rounded || corner;
      }

      // Shadow: use inline if not styleguide ref
      if (shadow && !isShadowStyleguide) {
        containerStyles["box-shadow"] = resolve(shadow, SHADOWS) || shadow;
      }

      // Border: use inline if not styleguide ref
      if (border && !isBorderStyleguide) {
        containerStyles["border-width"] =
          resolve(border, BORDER_WIDTHS) || border;
        containerStyles["border-style"] = borderStyle;
      }
      if (borderColor) containerStyles["border-color"] = borderColor;

      // Build data attributes for roundtrip conversion
      let dataAttrs = 'data-type="Video/V1" data-video-type="youtube"';
      dataAttrs += ` data-video-url="${url}"`;
      if (rounded !== "lg") dataAttrs += ` data-rounded="${rounded}"`;
      if (corner) dataAttrs += ` data-corner="${corner}"`;
      if (shadow !== "lg") dataAttrs += ` data-shadow="${shadow}"`;
      if (border) dataAttrs += ` data-border="${border}"`;
      if (borderStyle !== "solid")
        dataAttrs += ` data-border-style="${borderStyle}"`;
      if (borderColor) dataAttrs += ` data-border-color="${borderColor}"`;
      if (bg !== "#000") dataAttrs += ` data-bg="${bg}"`;

      // Add styleguide data attributes
      if (isShadowStyleguide) dataAttrs += ` data-style-guide-shadow="${shadow}"`;
      if (isBorderStyleguide) dataAttrs += ` data-style-guide-border="${border}"`;
      if (isCornerStyleguide) dataAttrs += ` data-style-guide-corner="${corner}"`;

      this.outerHTML = `
        <div ${dataAttrs} style="${buildStyle(wrapperStyles)}">
          <div style="${buildStyle(containerStyles)}">
            <iframe
              src="${embedUrl}"
              style="width: 100%; height: 100%; border: none;"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      `;
    }
  }

  /**
   * <cf-divider> - Horizontal line separator
   *
   * Attributes:
   *   color       - Line color (default: "#e2e8f0")
   *   width       - Width (e.g., "100%", "200px", "50%")
   *   thickness   - Border thickness (e.g., "1px", "3px")
   *   style       - Border style: solid, dashed, dotted (default: solid)
   *   align       - Alignment: left, center, right (default: center)
   *   shadow      - Box shadow preset or custom
   *   pt          - Padding top
   *   pb          - Padding bottom
   *   px          - Padding horizontal
   *   mt          - Margin top
   */
  class CFDivider extends CFElement {
    render() {
      const color = attr(this, "color", "#e2e8f0");
      const width = attr(this, "width", "100%");
      const thickness = attr(this, "thickness", "1px");
      const borderStyle = attr(this, "style", "solid");
      const align = attr(this, "align", "center");
      const shadow = attr(this, "shadow");
      const pt = attr(this, "pt", "16px");
      const pb = attr(this, "pb", "16px");
      const px = attr(this, "px");
      const mt = attr(this, "mt");

      // NOTE: No width set - allows flex layout to work properly
      const wrapperStyles = {
        "padding-top": pt,
        "padding-bottom": pb,
        "box-sizing": "border-box",
      };
      if (px) {
        wrapperStyles["padding-left"] = px;
        wrapperStyles["padding-right"] = px;
      }
      if (mt) wrapperStyles["margin-top"] = mt;

      // Alignment determines margin
      const alignMargin =
        {
          left: "0 auto 0 0",
          center: "0 auto",
          right: "0 0 0 auto",
        }[align] || "0 auto";

      const lineStyles = {
        "border-top": `${thickness} ${borderStyle} ${color}`,
        "border-right": "none",
        "border-bottom": "none",
        "border-left": "none",
        width: width,
        margin: alignMargin,
      };
      if (shadow) lineStyles["box-shadow"] = resolve(shadow, SHADOWS) || shadow;

      // Build data attributes for roundtrip conversion
      let dataAttrs = 'data-type="Divider/V1"';
      if (color !== "#e2e8f0") dataAttrs += ` data-color="${color}"`;
      if (width !== "100%") dataAttrs += ` data-width="${width}"`;
      if (thickness !== "1px") dataAttrs += ` data-thickness="${thickness}"`;
      if (borderStyle !== "solid") dataAttrs += ` data-style="${borderStyle}"`;
      if (align !== "center") dataAttrs += ` data-align="${align}"`;
      if (shadow) dataAttrs += ` data-shadow="${shadow}"`;
      dataAttrs += ` data-skip-shadow-settings="${shadow ? "false" : "true"}"`;

      this.outerHTML = `
        <div ${dataAttrs} style="${buildStyle(wrapperStyles)}">
          <div style="${buildStyle(lineStyles)}"></div>
        </div>
      `;
    }
  }

  // ==========================================================================
  // FORM ELEMENTS
  // ==========================================================================

  /**
   * <cf-input> - Text input field
   *
   * Attributes:
   *   type        - Input type: email, name, first_name, last_name, phone_number,
   *                 shipping_address, shipping_city, shipping_zip, shipping_state,
   *                 shipping_country, custom_type
   *   name        - Custom field name (required when type="custom_type")
   *   required    - Required field (true/false)
   *   bg          - Background color
   *   color       - Text color
   *   border-color - Border color
   *   rounded     - Border radius
   *   shadow      - Box shadow
   *   border      - Border width
   *   border-style - Border style
   *   px          - Horizontal padding
   *   py          - Vertical padding
   *   width       - Width percentage
   *   align       - Alignment: left, center, right
   *   pt          - Wrapper padding top
   *   mt          - Wrapper margin top
   */
  class CFInput extends CFElement {
    render() {
      const type = attr(this, "type", "email");
      const name = attr(this, "name");
      const placeholder = attr(this, "placeholder", "");
      const required = attr(this, "required");
      const bg = attr(this, "bg", "#ffffff");
      const color = attr(this, "color");
      const fontSize = attr(this, "font-size", "16px");
      const borderColor = attr(this, "border-color", "#d1d5db");
      const rounded = attr(this, "rounded", "lg");
      const shadow = attr(this, "shadow");
      const border = attr(this, "border", "1");
      const borderStyle = attr(this, "border-style", "solid");
      const px = attr(this, "px", "16px");
      const py = attr(this, "py", "12px");
      const inputWidth = attr(this, "width");
      const align = attr(this, "align", "center");
      const pt = attr(this, "pt");
      const mt = attr(this, "mt");

      // Build data attributes
      let dataAttrs = `data-type="Input/V1" data-input-type="${type}" data-align="${align}"`;
      dataAttrs += ` data-font-size="${fontSize}"`;
      if (color) dataAttrs += ` data-color="${color}"`;
      if (type === "custom_type" && name)
        dataAttrs += ` data-input-name="${name}"`;
      if (required === "true" || required === "")
        dataAttrs += ' data-required="true"';
      if (inputWidth) dataAttrs += ` data-width="${inputWidth}"`;
      if (placeholder) dataAttrs += ` data-placeholder="${placeholder}"`;

      const wrapperStyles = {
        width: "100%",
        "box-sizing": "border-box",
      };
      if (pt) wrapperStyles["padding-top"] = pt;
      if (mt) wrapperStyles["margin-top"] = mt;

      const containerStyles = {
        width: inputWidth ? `${inputWidth}%` : "100%",
        display: "block",
        "background-color": bg,
        "padding-left": px,
        "padding-right": px,
        "padding-top": py,
        "padding-bottom": py,
        "border-radius": resolve(rounded, RADIUS) || rounded,
        "border-width": resolve(border, BORDER_WIDTHS) || border,
        "border-style": borderStyle,
        "border-color": borderColor,
        "box-sizing": "border-box",
      };
      if (shadow)
        containerStyles["box-shadow"] = resolve(shadow, SHADOWS) || shadow;
      if (inputWidth && align === "center") {
        containerStyles["margin-left"] = "auto";
        containerStyles["margin-right"] = "auto";
      } else if (inputWidth && align === "right") {
        containerStyles["margin-left"] = "auto";
      }

      const fieldStyles = {
        width: "100%",
        border: "none",
        outline: "none",
        background: "transparent",
        "font-family": "inherit",
        "font-size": fontSize,
      };
      if (color) fieldStyles["color"] = color;

      const htmlType = { email: "email", phone_number: "tel" }[type] || "text";
      const placeholderAttr = placeholder ? ` placeholder="${placeholder}"` : "";

      this.outerHTML = `
        <div ${dataAttrs} style="${buildStyle(wrapperStyles)}">
          <div style="${buildStyle(containerStyles)}">
            <input type="${htmlType}"${placeholderAttr} style="${buildStyle(fieldStyles)}" />
          </div>
        </div>
      `;
    }
  }

  /**
   * <cf-textarea> - Multi-line text input
   *
   * Attributes:
   *   name        - Field name
   *   required    - Required field
   *   bg          - Background color
   *   color       - Text color
   *   border-color - Border color
   *   rounded     - Border radius
   *   shadow      - Box shadow
   *   border      - Border width
   *   border-style - Border style
   *   px          - Horizontal padding
   *   py          - Vertical padding
   *   width       - Width percentage
   *   height      - Height (e.g., "150px")
   *   align       - Alignment
   *   pt          - Wrapper padding top
   *   mt          - Wrapper margin top
   */
  class CFTextarea extends CFElement {
    render() {
      const name = attr(this, "name", "message");
      const placeholder = attr(this, "placeholder", "");
      const required = attr(this, "required");
      const bg = attr(this, "bg", "#ffffff");
      const color = attr(this, "color");
      const fontSize = attr(this, "font-size", "16px");
      const borderColor = attr(this, "border-color", "#d1d5db");
      const rounded = attr(this, "rounded", "lg");
      const shadow = attr(this, "shadow");
      const border = attr(this, "border", "1");
      const borderStyle = attr(this, "border-style", "solid");
      const px = attr(this, "px", "16px");
      const py = attr(this, "py", "12px");
      const textareaWidth = attr(this, "width");
      const height = attr(this, "height", "120px");
      const align = attr(this, "align", "center");
      const pt = attr(this, "pt");
      const mt = attr(this, "mt");

      let dataAttrs = `data-type="TextArea/V1" data-textarea-name="${name}" data-align="${align}"`;
      dataAttrs += ` data-font-size="${fontSize}"`;
      if (color) dataAttrs += ` data-color="${color}"`;
      if (required === "true" || required === "")
        dataAttrs += ' data-required="true"';
      if (textareaWidth) dataAttrs += ` data-width="${textareaWidth}"`;
      if (height) dataAttrs += ` data-height="${height.replace("px", "")}"`;
      if (placeholder) dataAttrs += ` data-placeholder="${placeholder}"`;

      const wrapperStyles = {
        width: "100%",
        "box-sizing": "border-box",
      };
      if (pt) wrapperStyles["padding-top"] = pt;
      if (mt) wrapperStyles["margin-top"] = mt;

      const containerStyles = {
        width: textareaWidth ? `${textareaWidth}%` : "100%",
        display: "block",
        "background-color": bg,
        "padding-left": px,
        "padding-right": px,
        "padding-top": py,
        "padding-bottom": py,
        "border-radius": resolve(rounded, RADIUS) || rounded,
        "border-width": resolve(border, BORDER_WIDTHS) || border,
        "border-style": borderStyle,
        "border-color": borderColor,
        "box-sizing": "border-box",
      };
      if (shadow)
        containerStyles["box-shadow"] = resolve(shadow, SHADOWS) || shadow;
      if (textareaWidth && align === "center") {
        containerStyles["margin-left"] = "auto";
        containerStyles["margin-right"] = "auto";
      } else if (textareaWidth && align === "right") {
        containerStyles["margin-left"] = "auto";
      }

      const fieldStyles = {
        width: "100%",
        height: height,
        border: "none",
        outline: "none",
        background: "transparent",
        "font-family": "inherit",
        "font-size": fontSize,
        resize: "vertical",
      };
      if (color) fieldStyles["color"] = color;

      const placeholderAttr = placeholder ? ` placeholder="${placeholder}"` : "";

      this.outerHTML = `
        <div ${dataAttrs} style="${buildStyle(wrapperStyles)}">
          <div style="${buildStyle(containerStyles)}">
            <textarea${placeholderAttr} style="${buildStyle(fieldStyles)}"></textarea>
          </div>
        </div>
      `;
    }
  }

  /**
   * <cf-select> - Dropdown select
   *
   * Attributes:
   *   name        - Field name
   *   placeholder - Placeholder text
   *   required    - Required field
   *   bg          - Background color
   *   color       - Text color
   *   border-color - Border color
   *   rounded     - Border radius
   *   shadow      - Box shadow
   *   border      - Border width
   *   border-style - Border style
   *   px          - Horizontal padding
   *   py          - Vertical padding
   *   width       - Width percentage
   *   align       - Alignment
   *   pt          - Wrapper padding top
   *   mt          - Wrapper margin top
   *
   * Children: <option value="...">Label</option>
   */
  class CFSelect extends CFElement {
    render() {
      const type = attr(this, "type", "custom_type");
      const name = attr(this, "name", "option");
      const placeholder = attr(this, "placeholder", "Select an option...");
      const required = attr(this, "required");
      const bg = attr(this, "bg", "#ffffff");
      const color = attr(this, "color");
      const fontSize = attr(this, "font-size", "16px");
      const borderColor = attr(this, "border-color", "#d1d5db");
      const rounded = attr(this, "rounded", "lg");
      const shadow = attr(this, "shadow");
      const border = attr(this, "border", "1");
      const borderStyle = attr(this, "border-style", "solid");
      const px = attr(this, "px", "16px");
      const py = attr(this, "py", "12px");
      const selectWidth = attr(this, "width");
      const align = attr(this, "align", "center");
      const pt = attr(this, "pt");
      const mt = attr(this, "mt", "0");

      let dataAttrs = `data-type="SelectBox/V1" data-select-name="${name}" data-select-type="${type}" data-align="${align}"`;
      dataAttrs += ` data-font-size="${fontSize}"`;
      if (color) dataAttrs += ` data-color="${color}"`;
      if (required === "true" || required === "")
        dataAttrs += ' data-required="true"';
      if (selectWidth) dataAttrs += ` data-width="${selectWidth}"`;
      if (placeholder) dataAttrs += ` data-placeholder="${placeholder}"`;

      const wrapperStyles = {
        width: selectWidth ? `${selectWidth}%` : "100%",
        "margin-top": mt,
        "box-sizing": "border-box",
      };
      if (pt) wrapperStyles["padding-top"] = pt;
      if (selectWidth && align === "center") {
        wrapperStyles["margin-left"] = "auto";
        wrapperStyles["margin-right"] = "auto";
      } else if (selectWidth && align === "right") {
        wrapperStyles["margin-left"] = "auto";
      }

      const containerStyles = {
        width: "100%",
        display: "block",
        "background-color": bg,
        "padding-left": px,
        "padding-right": px,
        "padding-top": py,
        "padding-bottom": py,
        "border-radius": resolve(rounded, RADIUS) || rounded,
        "border-width": resolve(border, BORDER_WIDTHS) || border,
        "border-style": borderStyle,
        "border-color": borderColor,
        "box-sizing": "border-box",
      };
      if (shadow)
        containerStyles["box-shadow"] = resolve(shadow, SHADOWS) || shadow;

      const fieldStyles = {
        width: "100%",
        border: "none",
        outline: "none",
        background: "transparent",
        "font-family": "inherit",
        "font-size": fontSize,
        cursor: "pointer",
      };
      if (color) fieldStyles["color"] = color;

      // Get option elements from children
      const options = getContent(this);

      this.outerHTML = `
        <div ${dataAttrs} style="${buildStyle(wrapperStyles)}">
          <div style="${buildStyle(containerStyles)}">
            <select style="${buildStyle(fieldStyles)}">
              <option value="">${placeholder}</option>
              ${options}
            </select>
          </div>
        </div>
      `;
    }
  }

  /**
   * <cf-checkbox> - Checkbox with label
   *
   * Attributes:
   *   name        - Field name
   *   checked     - Pre-checked (true/false)
   *   required    - Required field
   *   label-color - Label text color
   *   label-size  - Label font size
   *   box-size    - Checkbox box size
   *   box-bg      - Box background color
   *   box-border-color - Box border color
   *   check-color - Check mark color
   *   gap         - Gap between box and label
   *   mt          - Margin top
   *
   * Content: Label text (supports HTML)
   */
  class CFCheckbox extends CFElement {
    render() {
      const name = attr(this, "name", "agree");
      const checked = attr(this, "checked");
      const required = attr(this, "required");
      const labelColor = attr(this, "label-color", "#334155");
      const labelSize = attr(this, "label-size", "16px");
      const boxSize = attr(this, "box-size", "20px");
      const boxBg = attr(this, "box-bg", "#ffffff");
      const boxBorderColor = attr(this, "box-border-color", "#d1d5db");
      const checkColor = attr(this, "check-color", "#ffffff");
      const gap = attr(this, "gap", "12px");
      const mt = attr(this, "mt");

      let dataAttrs = `data-type="Checkbox/V1" data-name="${name}"`;
      if (checked === "true" || checked === "")
        dataAttrs += ' data-checked="true"';
      if (required === "true" || required === "")
        dataAttrs += ' data-required="true"';

      const wrapperStyles = {
        width: "100%",
        "box-sizing": "border-box",
      };
      if (mt) wrapperStyles["margin-top"] = mt;

      const labelStyles = {
        display: "flex",
        "align-items": "center",
        gap: gap,
        cursor: "pointer",
      };

      const boxStyles = {
        "flex-shrink": "0",
        width: boxSize,
        height: boxSize,
        border: `2px solid ${boxBorderColor}`,
        "border-radius": "4px",
        "background-color": boxBg,
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
      };

      const textStyles = {
        "font-size": labelSize,
        "line-height": "1.5",
        color: labelColor,
      };

      const isChecked = checked === "true" || checked === "";

      this.outerHTML = `
        <div ${dataAttrs} style="${buildStyle(wrapperStyles)}">
          <label style="${buildStyle(labelStyles)}">
            <input type="checkbox" style="position: absolute; opacity: 0; width: 0; height: 0;" ${
              isChecked ? "checked" : ""
            } />
            <span style="${buildStyle(boxStyles)}">
              <i class="fas fa-check" style="color: ${checkColor}; font-size: calc(${boxSize} * 0.6); display: none;"></i>
            </span>
            <span style="${buildStyle(textStyles)}">${getContent(this)}</span>
          </label>
        </div>
      `;
    }
  }

  // ==========================================================================
  // LIST ELEMENTS
  // ==========================================================================

  /**
   * <cf-bullet-list> - List with icons
   *
   * IMPORTANT: All items share the SAME icon and color
   *
   * Attributes:
   *   icon        - FontAwesome icon (OLD format: "fas fa-check")
   *   icon-color  - Icon color
   *   text-color  - Text color
   *   icon-size   - Icon size
   *   size        - Text size preset (s, m, l, xl) - uses paragraph typescale
   *   gap         - Gap between icon and text
   *   item-gap    - Gap between list items
   *   pt          - Padding top
   *   pb          - Padding bottom
   *   mt          - Margin top
   *
   * Children: <li>Item text</li>
   */
  class CFBulletList extends CFElement {
    render() {
      const icon = attr(this, "icon", "fas fa-check");
      const iconColor = attr(this, "icon-color");
      const hasExplicitIconColor = this.hasAttribute("icon-color");
      const textColor = attr(this, "text-color"); // No default - allows paint inheritance
      const hasExplicitTextColor = this.hasAttribute("text-color");
      const iconSize = attr(this, "icon-size", "16px");
      const size = attr(this, "size", "m"); // Size preset (s, m, l, xl) - uses paragraph scale
      const gap = attr(this, "gap", "12px");
      const itemGap = attr(this, "item-gap", "8px");
      const align = attr(this, "align", "left");
      const pt = attr(this, "pt", "0");
      const pb = attr(this, "pb", "0");
      const mt = attr(this, "mt", "0");

      // Resolve size preset to pixel value using paragraph scale (bullet lists are body text)
      const resolvedSize = styleguideManager.resolveSize(size, 'paragraph') || resolve(size, FONT_SIZES) || size;

      // Map align to justify-content
      const justifyMap = {
        left: "flex-start",
        center: "center",
        right: "flex-end",
      };
      const justifyContent = justifyMap[align] || "flex-start";

      const wrapperStyles = {
        width: "100%",
        "padding-top": pt,
        "padding-bottom": pb,
        "margin-top": mt,
        "box-sizing": "border-box",
      };

      const listStyles = {
        "list-style": "none",
        padding: "0",
        margin: "0",
        display: "flex",
        "flex-direction": "column",
        gap: itemGap,
      };

      const itemStyles = {
        display: "flex",
        "align-items": "flex-start",
        "justify-content": justifyContent,
      };

      const iconStyles = {
        "flex-shrink": "0",
        "font-size": iconSize,
        "line-height": "1.5",
        "margin-top": "2px",
        "margin-right": gap,
      };
      if (hasExplicitIconColor && iconColor) {
        iconStyles.color = `${iconColor} !important`;
      }

      const textStyles = {
        "font-size": resolvedSize,
        "line-height": "1.5",
      };
      // Only apply inline color if explicitly set - allows paint inheritance
      if (hasExplicitTextColor && textColor) {
        textStyles.color = `${textColor} !important`;
      }

      // Parse list items
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = getContent(this);
      const items = tempDiv.querySelectorAll("li");

      let listContent = "";
      items.forEach((item) => {
        listContent += `
          <li style="${buildStyle(itemStyles)}">
            <i class="${icon} fa_icon" style="${buildStyle(iconStyles)}"></i>
            <span style="${buildStyle(textStyles)}">${item.innerHTML}</span>
          </li>
        `;
      });

      // Build data attributes for roundtrip conversion
      let dataAttrs = 'data-type="BulletList/V1"';
      dataAttrs += ` data-icon="${icon}"`;
      if (hasExplicitIconColor && iconColor)
        dataAttrs += ` data-icon-color="${iconColor}" data-icon-color-explicit="true"`;
      if (hasExplicitTextColor && textColor)
        dataAttrs += ` data-text-color="${textColor}" data-text-color-explicit="true"`;
      dataAttrs += ` data-icon-size="${iconSize}"`;
      dataAttrs += ` data-size="${size}"`; // Store preset for roundtrip
      dataAttrs += ` data-gap="${gap}"`;
      dataAttrs += ` data-item-gap="${itemGap}"`;
      if (align !== "left") dataAttrs += ` data-align="${align}"`;

      this.outerHTML = `
        <div ${dataAttrs} style="${buildStyle(wrapperStyles)}">
          <ul style="${buildStyle(listStyles)}">
            ${listContent}
          </ul>
        </div>
      `;
    }
  }

  // ==========================================================================
  // INTERACTIVE ELEMENTS
  // ==========================================================================

  /**
   * <cf-progress-bar> - Progress bar with optional label
   *
   * Attributes:
   *   progress    - Progress percentage 0-100 (default: 50)
   *   text        - Label text (default: "")
   *   text-outside - Show text outside bar (default: false)
   *   width       - Bar width (default: 100%)
   *   height      - Bar height (default: 24px)
   *   bg          - Background/track color (default: #e2e8f0)
   *   fill        - Fill/progress color (default: #3b82f6)
   *   text-color  - Label text color
   *   rounded     - Border radius (default: full)
   *   shadow      - Box shadow
   *   border      - Border width
   *   border-color - Border color
   *   pt          - Padding top
   *   pb          - Padding bottom
   *   mt          - Margin top
   *   align       - Alignment: left, center, right (default: center)
   */
  class CFProgressBar extends CFElement {
    render() {
      const progress = parseInt(attr(this, 'progress', '50'), 10);
      const text = attr(this, 'text', '');
      const textOutside = attr(this, 'text-outside', 'false') === 'true';
      const width = attr(this, 'width', '100%');
      const height = attr(this, 'height', '24px');
      const bg = attr(this, 'bg', '#e2e8f0');
      const fill = attr(this, 'fill', '#3b82f6');
      const textColor = attr(this, 'text-color', textOutside ? '#334155' : '#ffffff');
      const rounded = attr(this, 'rounded', 'full');
      const shadow = attr(this, 'shadow');
      const border = attr(this, 'border');
      const borderColor = attr(this, 'border-color', '#000000');
      const pt = attr(this, 'pt', '0');
      const pb = attr(this, 'pb', '0');
      const mt = attr(this, 'mt', '0');
      const alignAttr = attr(this, 'align', 'center');

      const wrapperStyles = {
        'width': '100%',
        'text-align': alignAttr,
        'padding-top': pt,
        'padding-bottom': pb,
        'margin-top': mt,
        'box-sizing': 'border-box',
      };

      const trackStyles = {
        'width': width,
        'height': height,
        'background-color': bg,
        'border-radius': resolve(rounded, RADIUS) || rounded,
        'overflow': 'hidden',
        'position': 'relative',
        'display': 'inline-block',
      };
      if (shadow) trackStyles['box-shadow'] = resolve(shadow, SHADOWS) || shadow;
      if (border) {
        trackStyles['border-width'] = border;
        trackStyles['border-style'] = 'solid';
        trackStyles['border-color'] = borderColor;
      }

      const fillStyles = {
        'width': `${progress}%`,
        'height': '100%',
        'background-color': fill,
        'border-radius': 'inherit',
        'transition': 'width 0.3s ease',
      };

      const labelInsideStyles = {
        'position': 'absolute',
        'top': '50%',
        'left': '50%',
        'transform': 'translate(-50%, -50%)',
        'color': textColor,
        'font-size': '14px',
        'font-weight': '600',
        'white-space': 'nowrap',
      };

      const labelOutsideStyles = {
        'display': 'block',
        'color': textColor,
        'font-size': '14px',
        'font-weight': '500',
        'margin-bottom': '8px',
      };

      // Build data attributes
      let dataAttrs = 'data-type="ProgressBar/V1"';
      dataAttrs += ` data-progress="${progress}"`;
      if (text) dataAttrs += ` data-text="${text}"`;
      dataAttrs += ` data-text-outside="${textOutside}"`;
      dataAttrs += ` data-bg="${bg}"`;
      dataAttrs += ` data-fill="${fill}"`;
      dataAttrs += ` data-height="${height}"`;
      if (rounded !== 'full') dataAttrs += ` data-rounded="${rounded}"`;
      if (shadow) dataAttrs += ` data-shadow="${shadow}"`;
      if (border) dataAttrs += ` data-border="${border}"`;
      if (borderColor !== '#000000') dataAttrs += ` data-border-color="${borderColor}"`;

      // Build label HTML
      let labelHtml = '';
      if (text && textOutside) {
        labelHtml = `<span class="progress-label" style="${buildStyle(labelOutsideStyles)}">${text}</span>`;
      } else if (text) {
        labelHtml = `<span class="progress-label" style="${buildStyle(labelInsideStyles)}">${text}</span>`;
      }

      this.outerHTML = `
        <div ${dataAttrs} style="${buildStyle(wrapperStyles)}">
          ${textOutside ? labelHtml : ''}
          <div class="progress" style="${buildStyle(trackStyles)}">
            <div class="progress-bar" style="${buildStyle(fillStyles)}"></div>
            ${!textOutside ? labelHtml : ''}
          </div>
        </div>
      `;
    }
  }

  /**
   * <cf-video-popup> - Clickable thumbnail that opens video in modal
   *
   * Attributes:
   *   url         - YouTube video URL (required)
   *   thumbnail   - Custom thumbnail URL (auto-generated from YouTube if not provided)
   *   alt         - Alt text for thumbnail
   *   width       - Thumbnail width (default: 100%)
   *   align       - Alignment: left, center, right (default: center)
   *   rounded     - Border radius (default: lg)
   *   shadow      - Box shadow (default: lg)
   *   border      - Border width
   *   border-color - Border color
   *   overlay-bg  - Modal overlay background (default: rgba(0,0,0,0.8))
   *   play-icon   - Show play icon overlay (default: true)
   *   play-icon-size - Play icon size (default: 64px)
   *   play-icon-color - Play icon color (default: #ffffff)
   *   pt          - Padding top
   *   pb          - Padding bottom
   *   mt          - Margin top
   */
  class CFVideoPopup extends CFElement {
    render() {
      const url = attr(this, 'url', '');
      let thumbnail = attr(this, 'thumbnail', '');
      const alt = attr(this, 'alt', 'Video thumbnail');
      const width = attr(this, 'width', '100%');
      const alignAttr = attr(this, 'align', 'center');
      const rounded = attr(this, 'rounded', 'lg');
      const shadow = attr(this, 'shadow', 'lg');
      const border = attr(this, 'border');
      const borderColor = attr(this, 'border-color', '#000000');
      const overlayBg = attr(this, 'overlay-bg', 'rgba(0,0,0,0.8)');
      const playIcon = attr(this, 'play-icon', 'true') !== 'false';
      const playIconSize = attr(this, 'play-icon-size', '64px');
      const playIconColor = attr(this, 'play-icon-color', '#ffffff');
      const pt = attr(this, 'pt', '0');
      const pb = attr(this, 'pb', '0');
      const mt = attr(this, 'mt', '0');

      // Extract YouTube video ID and generate thumbnail if not provided
      const videoId = extractYouTubeVideoId(url);
      if (!thumbnail && videoId) {
        thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }

      const wrapperStyles = {
        'width': '100%',
        'text-align': alignAttr,
        'padding-top': pt,
        'padding-bottom': pb,
        'margin-top': mt,
        'box-sizing': 'border-box',
      };

      const imageWrapperStyles = {
        'display': 'inline-block',
        'position': 'relative',
        'cursor': 'pointer',
        'width': width,
        'max-width': '100%',
      };

      const imgStyles = {
        'display': 'block',
        'width': '100%',
        'height': 'auto',
        'border-radius': resolve(rounded, RADIUS) || rounded,
      };
      if (shadow) imgStyles['box-shadow'] = resolve(shadow, SHADOWS) || shadow;
      if (border) {
        imgStyles['border-width'] = border;
        imgStyles['border-style'] = 'solid';
        imgStyles['border-color'] = borderColor;
      }

      const playIconStyles = {
        'position': 'absolute',
        'top': '50%',
        'left': '50%',
        'transform': 'translate(-50%, -50%)',
        'font-size': playIconSize,
        'color': playIconColor,
        'opacity': '0.9',
        'text-shadow': '0 2px 8px rgba(0,0,0,0.3)',
        'pointer-events': 'none',
      };

      // Build data attributes
      let dataAttrs = 'data-type="VideoPopup/V1"';
      dataAttrs += ` data-video-url="${url}"`;
      dataAttrs += ` data-video-type="youtube"`;
      dataAttrs += ` data-thumbnail="${thumbnail}"`;
      dataAttrs += ` data-overlay-bg="${overlayBg}"`;
      if (rounded !== 'lg') dataAttrs += ` data-rounded="${rounded}"`;
      if (shadow && shadow !== 'lg') dataAttrs += ` data-shadow="${shadow}"`;
      if (border) dataAttrs += ` data-border="${border}"`;
      if (borderColor !== '#000000') dataAttrs += ` data-border-color="${borderColor}"`;

      const playIconHtml = playIcon
        ? `<i class="fas fa-play-circle" style="${buildStyle(playIconStyles)}"></i>`
        : '';

      this.outerHTML = `
        <div ${dataAttrs} style="${buildStyle(wrapperStyles)}">
          <div class="elImageWrapper" style="${buildStyle(imageWrapperStyles)}">
            <img class="elImage" src="${thumbnail}" alt="${alt}" style="${buildStyle(imgStyles)}" />
            ${playIconHtml}
          </div>
        </div>
      `;
    }
  }

  /**
   * <cf-countdown> - Countdown timer to a specific date/time
   *
   * Attributes:
   *   end-date    - Target date (YYYY-MM-DD format, required)
   *   end-time    - Target time (HH:MM:SS format, default: 00:00:00)
   *   timezone    - Timezone (default: America/New_York)
   *   show-days   - Show days (default: true)
   *   show-hours  - Show hours (default: true)
   *   show-minutes - Show minutes (default: true)
   *   show-seconds - Show seconds (default: true)
   *   redirect    - URL to redirect when countdown ends
   *   number-bg   - Background color for number boxes (default: #1C65E1)
   *   number-color - Number text color (default: #ffffff)
   *   label-color - Label text color (default: #164EAD)
   *   number-size - Number font size (default: 28px)
   *   label-size  - Label font size (default: 11px)
   *   rounded     - Border radius for number boxes (default: lg)
   *   gap         - Gap between countdown units (default: 0.65em)
   *   align       - Alignment: left, center, right (default: center)
   *   pt          - Padding top
   *   pb          - Padding bottom
   *   mt          - Margin top
   */
  class CFCountdown extends CFElement {
    render() {
      const endDate = attr(this, 'end-date', '');
      const endTime = attr(this, 'end-time', '00:00:00');
      const timezone = attr(this, 'timezone', 'America/New_York');
      const showDays = attr(this, 'show-days', 'true') === 'true';
      const showHours = attr(this, 'show-hours', 'true') === 'true';
      const showMinutes = attr(this, 'show-minutes', 'true') === 'true';
      const showSeconds = attr(this, 'show-seconds', 'true') === 'true';
      const redirect = attr(this, 'redirect', '');
      const numberBg = attr(this, 'number-bg', '#1C65E1');
      const numberColor = attr(this, 'number-color', '#ffffff');
      const labelColor = attr(this, 'label-color', '#164EAD');
      const numberSize = attr(this, 'number-size', '28px');
      const labelSize = attr(this, 'label-size', '11px');
      const rounded = attr(this, 'rounded', 'lg');
      const gap = attr(this, 'gap', '0.65em');
      const alignAttr = attr(this, 'align', 'center');
      const pt = attr(this, 'pt', '0');
      const pb = attr(this, 'pb', '0');
      const mt = attr(this, 'mt', '0');

      const wrapperStyles = {
        'width': '100%',
        'padding-top': pt,
        'padding-bottom': pb,
        'margin-top': mt,
        'box-sizing': 'border-box',
      };

      const rowStyles = {
        'display': 'flex',
        'justify-content': alignAttr === 'left' ? 'flex-start' : alignAttr === 'right' ? 'flex-end' : 'center',
        'gap': gap,
        'flex-wrap': 'wrap',
      };

      const columnStyles = {
        'display': 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        'gap': '0.5em',
      };

      const numberContainerStyles = {
        'background-color': numberBg,
        'padding': '14px',
        'border-radius': resolve(rounded, RADIUS) || rounded,
        'min-width': '60px',
        'text-align': 'center',
      };

      const numberStyles = {
        'color': numberColor,
        'font-size': numberSize,
        'font-weight': '700',
        'line-height': '100%',
      };

      const labelStyles = {
        'color': labelColor,
        'font-size': labelSize,
        'font-weight': '600',
        'text-transform': 'uppercase',
      };

      // Build data attributes
      let dataAttrs = 'data-type="Countdown/V1"';
      dataAttrs += ` data-end-date="${endDate}"`;
      dataAttrs += ` data-end-time="${endTime}"`;
      dataAttrs += ` data-timezone="${timezone}"`;
      dataAttrs += ` data-show-days="${showDays}"`;
      dataAttrs += ` data-show-hours="${showHours}"`;
      dataAttrs += ` data-show-minutes="${showMinutes}"`;
      dataAttrs += ` data-show-seconds="${showSeconds}"`;
      if (redirect) dataAttrs += ` data-redirect="${redirect}"`;
      dataAttrs += ` data-number-bg="${numberBg}"`;
      dataAttrs += ` data-number-color="${numberColor}"`;
      dataAttrs += ` data-label-color="${labelColor}"`;

      // Build countdown units
      const units = [];
      if (showDays) units.push({ value: '00', label: 'Days', unitClass: 'days' });
      if (showHours) units.push({ value: '00', label: 'Hours', unitClass: 'hours' });
      if (showMinutes) units.push({ value: '00', label: 'Minutes', unitClass: 'minutes' });
      if (showSeconds) units.push({ value: '00', label: 'Seconds', unitClass: 'seconds' });

      const unitsHtml = units.map(unit => `
        <div class="elCountdownColumn" style="${buildStyle(columnStyles)}">
          <div class="elCountdownAmountContainer" style="${buildStyle(numberContainerStyles)}">
            <span class="elCountdownAmount" data-unit="${unit.unitClass}" style="${buildStyle(numberStyles)}">${unit.value}</span>
          </div>
          <span class="elCountdownPeriod" style="${buildStyle(labelStyles)}">${unit.label}</span>
        </div>
      `).join('');

      this.outerHTML = `
        <div ${dataAttrs} style="${buildStyle(wrapperStyles)}">
          <div class="elCountdownRow" style="${buildStyle(rowStyles)}">
            ${unitsHtml}
          </div>
        </div>
      `;
    }
  }

  // ==========================================================================
  // REGISTER ALL CUSTOM ELEMENTS
  // ==========================================================================

  // ==========================================================================
  // PLACEHOLDER COMPONENTS
  // ==========================================================================

  /**
   * <cf-checkout-placeholder> - Placeholder for ClickFunnels checkout form
   * Outputs: Checkout/V2
   */
  class CFCheckoutPlaceholder extends CFElement {
    render() {
      const width = attr(this, "width", "100%");
      const minHeight = attr(this, "min-height", "400px");
      const mt = attr(this, "mt");

      const containerStyles = {
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        width: width,
        "min-height": minHeight,
        "background": "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
        "border": "3px dashed #f59e0b",
        "border-radius": "16px",
        padding: "32px",
        "box-sizing": "border-box",
        "text-align": "center",
        gap: "16px",
      };

      if (mt) containerStyles["margin-top"] = mt;

      this.outerHTML = `
        <div
          data-type="CheckoutPlaceholder"
          class="cf-placeholder cf-checkout-placeholder"
          style="${buildStyle(containerStyles)}"
        >
          <div style="display:inline-flex;align-items:center;gap:6px;background-color:#fbbf24;color:#78350f;padding:6px 12px;border-radius:9999px;font-size:12px;font-weight:600;">
            <i class="fas fa-info-circle"></i>
            <span>Checkout/V2</span>
          </div>
          <i class="fas fa-credit-card" style="font-size:48px;color:#d97706;"></i>
          <h3 style="font-size:20px;font-weight:700;color:#92400e;margin:0;">Checkout Form</h3>
          <p style="font-size:14px;color:#b45309;margin:0;max-width:400px;line-height:1.5;">
            This placeholder outputs a Checkout/V2 element. The checkout form collects
            payment information and processes orders in your funnel.
          </p>
        </div>
      `;
    }
  }

  /**
   * <cf-order-summary-placeholder> - Placeholder for order summary display
   * Outputs: CheckoutOrderSummary/V1
   */
  class CFOrderSummaryPlaceholder extends CFElement {
    render() {
      const width = attr(this, "width", "100%");
      const minHeight = attr(this, "min-height", "200px");
      const mt = attr(this, "mt");

      const containerStyles = {
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        width: width,
        "min-height": minHeight,
        "background": "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
        "border": "3px dashed #6366f1",
        "border-radius": "16px",
        padding: "32px",
        "box-sizing": "border-box",
        "text-align": "center",
        gap: "16px",
      };

      if (mt) containerStyles["margin-top"] = mt;

      this.outerHTML = `
        <div
          data-type="OrderSummaryPlaceholder"
          class="cf-placeholder cf-order-summary-placeholder"
          style="${buildStyle(containerStyles)}"
        >
          <div style="display:inline-flex;align-items:center;gap:6px;background-color:#818cf8;color:#1e1b4b;padding:6px 12px;border-radius:9999px;font-size:12px;font-weight:600;">
            <i class="fas fa-info-circle"></i>
            <span>CheckoutOrderSummary/V1</span>
          </div>
          <i class="fas fa-list-alt" style="font-size:48px;color:#4f46e5;"></i>
          <h3 style="font-size:20px;font-weight:700;color:#3730a3;margin:0;">Order Summary</h3>
          <p style="font-size:14px;color:#4338ca;margin:0;max-width:400px;line-height:1.5;">
            This placeholder outputs a CheckoutOrderSummary/V1 element. It displays
            the cart items, prices, and totals linked to your checkout form.
          </p>
        </div>
      `;
    }
  }

  /**
   * <cf-confirmation-placeholder> - Placeholder for order confirmation/receipt
   * Outputs: OrderConfirmation/V1
   */
  class CFConfirmationPlaceholder extends CFElement {
    render() {
      const width = attr(this, "width", "100%");
      const minHeight = attr(this, "min-height", "300px");
      const mt = attr(this, "mt");

      const containerStyles = {
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        width: width,
        "min-height": minHeight,
        "background": "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
        "border": "3px dashed #10b981",
        "border-radius": "16px",
        padding: "32px",
        "box-sizing": "border-box",
        "text-align": "center",
        gap: "16px",
      };

      if (mt) containerStyles["margin-top"] = mt;

      this.outerHTML = `
        <div
          data-type="ConfirmationPlaceholder"
          class="cf-placeholder cf-confirmation-placeholder"
          style="${buildStyle(containerStyles)}"
        >
          <div style="display:inline-flex;align-items:center;gap:6px;background-color:#34d399;color:#064e3b;padding:6px 12px;border-radius:9999px;font-size:12px;font-weight:600;">
            <i class="fas fa-info-circle"></i>
            <span>OrderConfirmation/V1</span>
          </div>
          <i class="fas fa-receipt" style="font-size:48px;color:#059669;"></i>
          <h3 style="font-size:20px;font-weight:700;color:#065f46;margin:0;">Order Confirmation</h3>
          <p style="font-size:14px;color:#047857;margin:0;max-width:400px;line-height:1.5;">
            This placeholder outputs an OrderConfirmation/V1 element. It shows
            purchase details and receipt information on thank you pages.
          </p>
        </div>
      `;
    }
  }

  const elements = {
    "cf-page": CFPage,
    "cf-section": CFSection,
    "cf-row": CFRow,
    "cf-col": CFCol,
    // "cf-col-inner": CFColInner,
    "cf-flex": CFFlex,
    "cf-popup": CFPopup,
    "cf-headline": CFHeadline,
    "cf-subheadline": CFSubheadline,
    "cf-paragraph": CFParagraph,
    "cf-button": CFButton,
    "cf-image": CFImage,
    "cf-icon": CFIcon,
    "cf-video": CFVideo,
    "cf-divider": CFDivider,
    "cf-input": CFInput,
    "cf-textarea": CFTextarea,
    "cf-select": CFSelect,
    "cf-checkbox": CFCheckbox,
    "cf-bullet-list": CFBulletList,
    "cf-progress-bar": CFProgressBar,
    "cf-video-popup": CFVideoPopup,
    "cf-countdown": CFCountdown,
    // Placeholders
    "cf-checkout-placeholder": CFCheckoutPlaceholder,
    "cf-order-summary-placeholder": CFOrderSummaryPlaceholder,
    "cf-confirmation-placeholder": CFConfirmationPlaceholder,
  };

  // Register elements
  Object.entries(elements).forEach(([name, constructor]) => {
    if (!customElements.get(name)) {
      customElements.define(name, constructor);
    }
  });

  // ==========================================================================
  // ANIMATIONS - Apply animate.css animations to elements
  // ==========================================================================

  // Map ClickFunnels animation names to animate.css classes
  const ANIMATION_MAP = {
    // Entrance animations
    'fade-in': 'fadeIn',
    'glide-in': 'fadeInUp',
    'slide-in': 'slideInLeft',
    'bounce-in': 'bounceIn',
    'expand-in': 'zoomIn',
    'fold-in': 'fadeInDown',
    'puff-in': 'zoomInUp',
    'spin-in': 'rotateIn',
    'flip-in': 'flipInX',
    'turn-in': 'rotateInDownLeft',
    'float-in': 'fadeInUp',
    'reveal': 'fadeIn',

    // Looping/attention animations (using subtle custom versions)
    'blink': 'flash',
    'rocking': 'subtleSwing',
    'bouncing': 'subtleBounce',
    'wooble': 'subtleWobble',
    'elevate': 'subtlePulse',
    'shake': 'shakeX',
    'pulse': 'subtlePulse',
    'tada': 'tada',
    'jello': 'jello',
    'heartbeat': 'heartBeat',
    'rubber-band': 'rubberBand',
  };

  // Load animate.css from CDN and inject custom subtle animations
  function loadAnimateCSS() {
    if (document.querySelector('link[href*="animate.css"]')) {
      injectCustomAnimations();
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
      link.onload = () => {
        injectCustomAnimations();
        resolve();
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  // Inject custom subtle animation keyframes
  function injectCustomAnimations() {
    if (document.getElementById('funnelwind-custom-animations')) return;

    const style = document.createElement('style');
    style.id = 'funnelwind-custom-animations';
    style.textContent = `
      /* Subtle wobble - less rotation than default */
      @keyframes subtleWobble {
        0%, 100% { transform: translateX(0); }
        15% { transform: translateX(-3px) rotate(-1deg); }
        30% { transform: translateX(2px) rotate(0.5deg); }
        45% { transform: translateX(-2px) rotate(-0.5deg); }
        60% { transform: translateX(1px) rotate(0.25deg); }
        75% { transform: translateX(-1px) rotate(-0.25deg); }
      }
      .animate__subtleWobble {
        animation-name: subtleWobble;
      }

      /* Subtle bounce - less dramatic vertical movement */
      @keyframes subtleBounce {
        0%, 20%, 53%, 100% {
          animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
          transform: translateY(0);
        }
        40%, 43% {
          animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
          transform: translateY(-8px);
        }
        70% {
          animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
          transform: translateY(-4px);
        }
        80% {
          transform: translateY(0);
        }
        90% {
          transform: translateY(-2px);
        }
      }
      .animate__subtleBounce {
        animation-name: subtleBounce;
        transform-origin: center bottom;
      }

      /* Subtle pulse - less scale change */
      @keyframes subtlePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.03); }
      }
      .animate__subtlePulse {
        animation-name: subtlePulse;
      }

      /* Subtle swing/rocking - less rotation */
      @keyframes subtleSwing {
        0%, 100% { transform: rotate(0deg); }
        20% { transform: rotate(3deg); }
        40% { transform: rotate(-2deg); }
        60% { transform: rotate(1deg); }
        80% { transform: rotate(-1deg); }
      }
      .animate__subtleSwing {
        animation-name: subtleSwing;
        transform-origin: top center;
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize animations when DOM is ready
  function initAnimations() {
    // Find all elements with animation attributes
    const animatedElements = document.querySelectorAll('[data-animation-type]');

    animatedElements.forEach(element => {
      const animationType = element.getAttribute('data-animation-type');
      const animationTime = parseInt(element.getAttribute('data-animation-time') || '1000', 10);
      const animationDelay = parseInt(element.getAttribute('data-animation-delay') || '0', 10);
      const animationTrigger = element.getAttribute('data-animation-trigger') || 'load';
      const animationLoop = element.getAttribute('data-animation-loop') === 'true';
      const animationOnce = element.getAttribute('data-animation-once') !== 'false';
      const animationTiming = element.getAttribute('data-animation-timing-function') || 'ease';

      // Get animate.css class name
      const animateClass = ANIMATION_MAP[animationType] || animationType;

      // Set CSS custom properties for duration and delay
      element.style.setProperty('--animate-duration', `${animationTime}ms`);
      element.style.setProperty('animation-timing-function', animationTiming);

      // Initially hide element (unless it's a looping animation)
      if (!animationLoop) {
        element.style.opacity = '0';
      }

      // Handle different triggers
      switch (animationTrigger) {
        case 'scroll':
          setupScrollTrigger(element, animateClass, animationDelay, animationLoop, animationOnce);
          break;
        case 'hover':
          setupHoverTrigger(element, animateClass, animationLoop);
          break;
        case 'load':
        default:
          setupLoadTrigger(element, animateClass, animationDelay, animationLoop);
          break;
      }
    });
  }

  // Trigger animation on page load
  function setupLoadTrigger(element, animateClass, delay, loop) {
    setTimeout(() => {
      element.style.opacity = '1';
      element.classList.add('animate__animated', `animate__${animateClass}`);

      if (loop) {
        element.classList.add('animate__infinite');
      }
    }, delay);
  }

  // Trigger animation when element scrolls into view
  function setupScrollTrigger(element, animateClass, delay, loop, once) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            element.style.opacity = '1';
            element.classList.add('animate__animated', `animate__${animateClass}`);

            if (loop) {
              element.classList.add('animate__infinite');
            }
          }, delay);

          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          // Reset animation when out of view
          element.style.opacity = '0';
          element.classList.remove('animate__animated', `animate__${animateClass}`);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    observer.observe(element);
  }

  // Trigger animation on hover
  function setupHoverTrigger(element, animateClass, loop) {
    // Show element initially for hover animations
    element.style.opacity = '1';

    element.addEventListener('mouseenter', () => {
      element.classList.add('animate__animated', `animate__${animateClass}`);
      if (loop) {
        element.classList.add('animate__infinite');
      }
    });

    element.addEventListener('mouseleave', () => {
      element.classList.remove('animate__animated', `animate__${animateClass}`, 'animate__infinite');
    });

    // Also handle animation end for non-looping
    element.addEventListener('animationend', () => {
      if (!loop) {
        element.classList.remove('animate__animated', `animate__${animateClass}`);
      }
    });
  }

  // ==========================================================================
  // VIDEO BACKGROUND INITIALIZATION
  // ==========================================================================

  /**
   * Extract YouTube video ID from URL
   */
  function extractYouTubeVideoIdForBackground(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/);
    return match ? match[1] : null;
  }

  /**
   * Initialize video backgrounds on all sections with video-bg-url attribute
   */
  function initVideoBackgrounds() {
    const sections = document.querySelectorAll('[data-video-bg-url]');

    sections.forEach(section => {
      const videoUrl = section.getAttribute('data-video-bg-url');
      const videoId = extractYouTubeVideoIdForBackground(videoUrl);

      if (!videoId) return;

      const overlay = section.getAttribute('data-video-bg-overlay') || section.getAttribute('data-overlay');
      const hideMobile = section.getAttribute('data-video-bg-hide-mobile') !== 'false';

      // Create video background container
      const videoContainer = document.createElement('div');
      videoContainer.className = 'cf-video-background';
      videoContainer.style.cssText = `
        position: absolute;
        inset: 0;
        overflow: hidden;
        z-index: 0;
        pointer-events: none;
      `;

      // Create iframe wrapper for scaling/positioning
      const iframeWrapper = document.createElement('div');
      iframeWrapper.className = 'cf-video-background-wrapper';
      iframeWrapper.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        transform: translateY(-50%) scale(1.5);
        top: 50%;
      `;

      // Create YouTube iframe with autoplay, mute, loop
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100vw;
        height: 100vh;
        min-width: 100%;
        min-height: 100%;
        transform: translate(-50%, -50%);
        object-fit: cover;
        border: none;
      `;

      iframeWrapper.appendChild(iframe);
      videoContainer.appendChild(iframeWrapper);

      // Create overlay if specified
      if (overlay) {
        const overlayEl = document.createElement('div');
        overlayEl.className = 'cf-video-background-overlay';
        overlayEl.style.cssText = `
          position: absolute;
          inset: 0;
          background: ${overlay};
          z-index: 1;
          pointer-events: none;
        `;
        videoContainer.appendChild(overlayEl);
      }

      // Ensure section has relative positioning
      const sectionStyle = window.getComputedStyle(section);
      if (sectionStyle.position === 'static') {
        section.style.position = 'relative';
      }

      // Insert video container as first child
      section.insertBefore(videoContainer, section.firstChild);

      // Ensure content is above video
      const contentWrapper = section.querySelector(':scope > div:not(.cf-video-background):not(.cf-overlay)');
      if (contentWrapper) {
        contentWrapper.style.position = 'relative';
        contentWrapper.style.zIndex = '2';
      }

      // Handle mobile visibility
      if (hideMobile) {
        const style = document.createElement('style');
        style.textContent = `
          @media (max-width: 768px) {
            .cf-video-background {
              display: none;
            }
          }
        `;
        if (!document.getElementById('cf-video-bg-mobile-styles')) {
          style.id = 'cf-video-bg-mobile-styles';
          document.head.appendChild(style);
        }
      }
    });
  }

  /**
   * Inject CSS for video background styling
   */
  function injectVideoBackgroundStyles() {
    if (document.getElementById('funnelwind-video-bg-styles')) return;

    const style = document.createElement('style');
    style.id = 'funnelwind-video-bg-styles';
    style.textContent = `
      /* Video background container */
      .cf-video-background {
        position: absolute;
        inset: 0;
        overflow: hidden;
        z-index: 0;
        pointer-events: none;
      }

      .cf-video-background iframe {
        border: none;
      }

      /* Ensure section content stays above video */
      [data-video-bg-url] > *:not(.cf-video-background):not(.cf-overlay) {
        position: relative;
        z-index: 2;
      }
    `;
    document.head.appendChild(style);
  }

  // ==========================================================================
  // INITIALIZATION - Process elements in correct order (leaf-first)
  // ==========================================================================

  /**
   * Initialize FunnelWind - transforms all cf-* elements
   * Call this after DOM is ready or after dynamic content is added
   */
  function initFunnelWind() {
    // Process from innermost to outermost (reverse order)
    const tagOrder = [
      // Elements first (innermost)
      "cf-icon",
      "cf-divider",
      "cf-image",
      "cf-video",
      "cf-headline",
      "cf-subheadline",
      "cf-paragraph",
      "cf-button",
      "cf-input",
      "cf-textarea",
      "cf-select",
      "cf-checkbox",
      "cf-bullet-list",
      "cf-progress-bar",
      "cf-video-popup",
      "cf-countdown",
      // Placeholders
      "cf-checkout-placeholder",
      "cf-order-summary-placeholder",
      "cf-confirmation-placeholder",
      // Then containers
      "cf-flex",
      "cf-col-inner",
      "cf-col",
      "cf-row",
      "cf-section",
      "cf-popup",
      "cf-page",
    ];

    tagOrder.forEach((tag) => {
      document.querySelectorAll(tag).forEach((el) => {
        if (el.render && !el._rendered) {
          el.render();
          el._rendered = true;
        }
      });
    });

    // Mark all cf-page elements as rendered to show content (FOUC prevention)
    document.querySelectorAll('cf-page').forEach((page) => {
      page.setAttribute('data-rendered', 'true');
    });

    // Initialize animations, popup, and other functionality after elements are rendered
    // Small delay to ensure DOM is fully updated
    requestAnimationFrame(() => {
      loadAnimateCSS().then(initAnimations);
      initPopup();
    });
  }

  /**
   * Initialize popup functionality
   * - Buttons with action="show-popup" open the popup
   * - Close button and overlay click close the popup
   * - Escape key closes the popup
   */
  function initPopup() {
    const popup = document.querySelector('.cf-popup-wrapper');
    if (!popup) return;

    // Show popup function
    const showPopup = () => {
      popup.style.display = 'flex';
    };

    // Hide popup function
    const hidePopup = () => {
      popup.style.display = 'none';
    };

    // Set up buttons with action="popup" (data attribute after rendering)
    document.querySelectorAll('[data-action="popup"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showPopup();
      });
    });

    // Close on overlay click (but not modal itself)
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        hidePopup();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popup.style.display === 'flex') {
        hidePopup();
      }
    });

    // Expose popup control functions globally
    window.FunnelWindPopup = {
      show: showPopup,
      hide: hidePopup,
      toggle: () => {
        if (popup.style.display === 'flex') {
          hidePopup();
        } else {
          showPopup();
        }
      }
    };
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      loadGoogleFonts();  // Load fonts before rendering
      styleguideManager.init();
      brandAssetsManager.init();
      initFunnelWind();
      // Initialize video backgrounds after rendering
      requestAnimationFrame(() => {
        injectVideoBackgroundStyles();
        initVideoBackgrounds();
      });
    });
  } else {
    // DOM already ready, use requestAnimationFrame to ensure all elements are parsed
    requestAnimationFrame(() => {
      loadGoogleFonts();  // Load fonts before rendering
      styleguideManager.init();
      brandAssetsManager.init();
      initFunnelWind();
      // Initialize video backgrounds after rendering
      requestAnimationFrame(() => {
        injectVideoBackgroundStyles();
        initVideoBackgrounds();
      });
    });
  }

  // Expose for manual re-initialization and styleguide management
  window.FunnelWind = {
    init: initFunnelWind,
    initAnimations: initAnimations,
    loadAnimateCSS: loadAnimateCSS,
    loadGoogleFonts: loadGoogleFonts,
    initVideoBackgrounds: initVideoBackgrounds,
    elements: elements,
    StyleguideManager: styleguideManager,
    BrandAssetsManager: brandAssetsManager,
    initStyleguide: (data) => {
      styleguideManager.init(data);
      loadGoogleFonts();  // Load fonts from styleguide
      initFunnelWind();
    },
    initBrandAssets: (data) => {
      brandAssetsManager.init(data);
      initFunnelWind();
    },
  };

  // Also expose StyleguideManager globally for direct access
  window.StyleguideManager = styleguideManager;
  window.BrandAssetsManager = brandAssetsManager;
})();
