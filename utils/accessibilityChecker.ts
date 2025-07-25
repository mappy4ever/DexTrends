/**
 * Accessibility checker utility for development
 * Helps identify and fix accessibility issues
 */

import logger from './logger';

interface AccessibilityIssue {
  type: string;
  message: string;
  element?: Element | null;
  severity: 'error' | 'warning' | 'info';
}

interface ColorContrastResult {
  ratio: number;
  passes: {
    aa: boolean;
    aaa: boolean;
  };
}

type AccessibilityCheckFunction = () => void;

class AccessibilityChecker {
  private issues: AccessibilityIssue[];
  private isEnabled: boolean;
  private checks: Set<string>;

  constructor() {
    this.issues = [];
    this.isEnabled = process.env.NODE_ENV === 'development';
    this.checks = new Set();
  }

  /**
   * Run all accessibility checks on the current page
   */
  checkPage(): AccessibilityIssue[] {
    if (!this.isEnabled || typeof window === 'undefined') {
      return [];
    }

    this.issues = [];
    
    this.checkImages();
    this.checkButtons();
    this.checkLinks();
    this.checkForms();
    this.checkHeadings();
    this.checkLandmarks();
    this.checkColorContrast();
    this.checkKeyboardNavigation();
    this.checkFocus();
    this.checkARIALabels();

    if (this.issues.length > 0) {
      logger.warn(`Found ${this.issues.length} accessibility issues:`, this.issues);
    } else {
      logger.info('No accessibility issues found on current page');
    }

    return this.issues;
  }

  /**
   * Check images for alt text
   */
  private checkImages(): void {
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.hasAttribute('alt')) {
        this.addIssue('missing-alt', `Image at index ${index} missing alt attribute`, img);
      } else if (img.alt.trim() === '') {
        // Empty alt is okay for decorative images, but check if it's intentional
        if (!img.hasAttribute('role') || img.getAttribute('role') !== 'presentation') {
          this.addIssue('empty-alt', `Image at index ${index} has empty alt text without presentation role`, img);
        }
      }
    });
  }

  /**
   * Check buttons for accessibility
   */
  private checkButtons(): void {
    const buttons = document.querySelectorAll('button, [role="button"]');
    buttons.forEach((button, index) => {
      // Check for accessible text
      const text = this.getAccessibleText(button);
      if (!text) {
        this.addIssue('button-no-text', `Button at index ${index} has no accessible text`, button);
      }

      // Check if disabled buttons are properly labeled
      if ((button as HTMLButtonElement).disabled && !button.hasAttribute('aria-label') && !button.hasAttribute('title')) {
        this.addIssue('disabled-button-no-label', `Disabled button at index ${index} should have aria-label or title`, button);
      }

      // Check button type for form buttons
      if (button.tagName === 'BUTTON' && button.closest('form') && !button.hasAttribute('type')) {
        this.addIssue('button-no-type', `Form button at index ${index} should have explicit type attribute`, button);
      }
    });
  }

  /**
   * Check links for accessibility
   */
  private checkLinks(): void {
    const links = document.querySelectorAll('a');
    links.forEach((link, index) => {
      const text = this.getAccessibleText(link);
      
      if (!text) {
        this.addIssue('link-no-text', `Link at index ${index} has no accessible text`, link);
      } else if (text.toLowerCase().includes('click here') || text.toLowerCase().includes('read more')) {
        this.addIssue('generic-link-text', `Link at index ${index} uses generic text: "${text}"`, link);
      }

      // Check for proper href
      if (!link.hasAttribute('href') && !link.hasAttribute('role')) {
        this.addIssue('link-no-href', `Link at index ${index} has no href and no role`, link);
      }

      // Check external links
      if (link.hasAttribute('target') && link.getAttribute('target') === '_blank') {
        if (!link.hasAttribute('rel') || !link.getAttribute('rel')?.includes('noopener')) {
          this.addIssue('external-link-security', `External link at index ${index} should include rel="noopener"`, link);
        }
        
        if (!text.includes('opens in new') && !link.hasAttribute('aria-label')) {
          this.addIssue('external-link-no-warning', `External link at index ${index} should indicate it opens in new tab`, link);
        }
      }
    });
  }

  /**
   * Check forms for accessibility
   */
  private checkForms(): void {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      // Check for labels
      const id = input.getAttribute('id');
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');

      if (!label && !ariaLabel && !ariaLabelledby) {
        this.addIssue('input-no-label', `Input at index ${index} has no associated label`, input);
      }

      // Check required fields
      if (input.hasAttribute('required') && !input.hasAttribute('aria-required')) {
        this.addIssue('required-field-not-marked', `Required input at index ${index} should have aria-required="true"`, input);
      }

      // Check for error states
      if (input.hasAttribute('aria-invalid') && input.getAttribute('aria-invalid') === 'true') {
        const describedBy = input.getAttribute('aria-describedby');
        if (!describedBy) {
          this.addIssue('invalid-input-no-description', `Invalid input at index ${index} should have aria-describedby pointing to error message`, input);
        }
      }
    });
  }

  /**
   * Check heading structure
   */
  private checkHeadings(): void {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
    let lastLevel = 0;
    
    headings.forEach((heading, index) => {
      const level = heading.tagName ? parseInt(heading.tagName.charAt(1)) : 
                   parseInt(heading.getAttribute('aria-level') || '1');
      
      // Check for skipped levels
      if (level > lastLevel + 1) {
        this.addIssue('heading-level-skip', `Heading at index ${index} skips from h${lastLevel} to h${level}`, heading);
      }

      // Check for empty headings
      const text = this.getAccessibleText(heading);
      if (!text) {
        this.addIssue('empty-heading', `Heading at index ${index} is empty`, heading);
      }

      lastLevel = level;
    });

    // Check for multiple h1s
    const h1s = document.querySelectorAll('h1');
    if (h1s.length > 1) {
      this.addIssue('multiple-h1', `Page has ${h1s.length} h1 elements, should have only one`);
    } else if (h1s.length === 0) {
      this.addIssue('no-h1', 'Page has no h1 element');
    }
  }

  /**
   * Check landmarks and page structure
   */
  private checkLandmarks(): void {
    const main = document.querySelectorAll('main, [role="main"]');
    if (main.length === 0) {
      this.addIssue('no-main-landmark', 'Page has no main landmark');
    } else if (main.length > 1) {
      this.addIssue('multiple-main-landmarks', `Page has ${main.length} main landmarks`);
    }

    // Check for navigation
    const nav = document.querySelectorAll('nav, [role="navigation"]');
    if (nav.length === 0) {
      this.addIssue('no-navigation', 'Page has no navigation landmarks');
    }

    // Check for skip links
    const skipLinks = document.querySelectorAll('a[href^="#"], .skip-link');
    if (skipLinks.length === 0) {
      this.addIssue('no-skip-links', 'Page should have skip links for keyboard navigation');
    }
  }

  /**
   * Check color contrast (basic check)
   */
  private checkColorContrast(): void {
    // This is a simplified check - in production, you'd use a proper contrast checking library
    const textElements = document.querySelectorAll('p, span, div, a, button, label, h1, h2, h3, h4, h5, h6');
    
    textElements.forEach((element, index) => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      // Very basic check for transparent or similar colors
      if (color === backgroundColor) {
        this.addIssue('poor-color-contrast', `Element at index ${index} may have poor color contrast`, element);
      }
    });
  }

  /**
   * Check keyboard navigation
   */
  private checkKeyboardNavigation(): void {
    const interactiveElements = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex], [role="button"], [role="link"]'
    );

    interactiveElements.forEach((element, index) => {
      const tabIndex = element.getAttribute('tabindex');
      
      // Check for positive tabindex (anti-pattern)
      if (tabIndex && parseInt(tabIndex) > 0) {
        this.addIssue('positive-tabindex', `Element at index ${index} uses positive tabindex (${tabIndex})`, element);
      }

      // Check if element is focusable
      if ((element as HTMLInputElement).disabled) {
        return; // Skip disabled elements
      }

      // Elements that should be focusable but aren't
      if (tabIndex === '-1' && ['A', 'BUTTON'].includes(element.tagName)) {
        this.addIssue('unfocusable-interactive', `Interactive element at index ${index} is not focusable`, element);
      }
    });
  }

  /**
   * Check focus indicators
   */
  private checkFocus(): void {
    const style = document.createElement('style');
    style.textContent = ':focus { outline: 3px solid red !important; }';
    document.head.appendChild(style);

    // Remove after a short delay
    setTimeout(() => {
      style.remove();
    }, 100);

    // Check for outline: none without alternative
    const styleSheets = Array.from(document.styleSheets);
    
    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach((rule: CSSRule) => {
          if (rule instanceof CSSStyleRule && rule.selectorText?.includes(':focus')) {
            const style = rule.style;
            if (style.outline === 'none' || style.outline === '0') {
              // Check if there's an alternative focus indicator
              if (!style.boxShadow && !style.border && !style.backgroundColor) {
                this.addIssue('focus-indicator-removed', `Focus indicator removed without alternative: ${rule.selectorText}`);
              }
            }
          }
        });
      } catch (e) {
        // Can't access cross-origin stylesheets
      }
    });
  }

  /**
   * Check ARIA labels and roles
   */
  private checkARIALabels(): void {
    // Check for proper ARIA roles
    const elementsWithRoles = document.querySelectorAll('[role]');
    const validRoles = [
      'button', 'link', 'navigation', 'main', 'banner', 'contentinfo',
      'complementary', 'search', 'form', 'region', 'alert', 'dialog',
      'tab', 'tabpanel', 'tablist', 'menu', 'menuitem', 'menubar',
      'tree', 'treeitem', 'grid', 'gridcell', 'heading', 'img',
      'list', 'listitem', 'table', 'row', 'cell', 'presentation', 'none'
    ];

    elementsWithRoles.forEach((element, index) => {
      const role = element.getAttribute('role');
      if (role && !validRoles.includes(role)) {
        this.addIssue('invalid-aria-role', `Element at index ${index} has invalid ARIA role: ${role}`, element);
      }
    });

    // Check for aria-label on non-interactive elements
    const elementsWithAriaLabel = document.querySelectorAll('[aria-label]');
    elementsWithAriaLabel.forEach((element, index) => {
      if (!this.isInteractive(element) && !element.hasAttribute('role')) {
        this.addIssue('aria-label-on-non-interactive', 
          `Non-interactive element at index ${index} has aria-label without role`, element);
      }
    });

    // Check for conflicting ARIA attributes
    const elementsWithAriaHidden = document.querySelectorAll('[aria-hidden="true"]');
    elementsWithAriaHidden.forEach((element, index) => {
      if (element.querySelector('a, button, input, select, textarea')) {
        this.addIssue('interactive-in-hidden', 
          `Element at index ${index} marked as aria-hidden contains interactive elements`, element);
      }
    });
  }

  /**
   * Add an issue to the list
   */
  private addIssue(type: string, message: string, element?: Element | null): void {
    this.issues.push({
      type,
      message,
      element: element || null,
      severity: this.getSeverity(type)
    });
  }

  /**
   * Get severity level for issue type
   */
  private getSeverity(type: string): 'error' | 'warning' | 'info' {
    const errors = [
      'missing-alt', 'button-no-text', 'link-no-text', 'input-no-label',
      'no-h1', 'no-main-landmark', 'interactive-in-hidden'
    ];
    
    const warnings = [
      'empty-alt', 'generic-link-text', 'external-link-security',
      'heading-level-skip', 'positive-tabindex', 'focus-indicator-removed'
    ];

    if (errors.includes(type)) return 'error';
    if (warnings.includes(type)) return 'warning';
    return 'info';
  }

  /**
   * Get accessible text for an element
   */
  private getAccessibleText(element: Element): string {
    // Check aria-label first
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Check aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labels = labelledBy.split(' ')
        .map(id => document.getElementById(id))
        .filter(Boolean)
        .map(el => el!.textContent)
        .join(' ');
      if (labels) return labels;
    }

    // Check for text content
    const text = element.textContent?.trim();
    if (text) return text;

    // Check for title attribute
    const title = element.getAttribute('title');
    if (title) return title;

    // Check for img alt within element
    const img = element.querySelector('img[alt]') as HTMLImageElement;
    if (img) return img.alt;

    return '';
  }

  /**
   * Check if element is interactive
   */
  private isInteractive(element: Element): boolean {
    const interactiveTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    const interactiveRoles = ['button', 'link', 'textbox', 'combobox', 'listbox'];
    
    return interactiveTags.includes(element.tagName) ||
           interactiveRoles.includes(element.getAttribute('role') || '') ||
           element.hasAttribute('onclick') ||
           element.hasAttribute('tabindex');
  }

  /**
   * Calculate color contrast ratio (simplified)
   */
  private calculateContrastRatio(color1: string, color2: string): number {
    // This is a simplified calculation - in production use a proper library
    // Returns a dummy value for now
    return 4.5;
  }

  /**
   * Run specific check by name
   */
  runCheck(checkName: string): AccessibilityIssue[] {
    if (!this.isEnabled) return [];

    this.issues = [];
    
    const checkMethod = (this as any)[`check${checkName}`];
    if (typeof checkMethod === 'function') {
      checkMethod.call(this);
    } else {
      logger.warn(`Unknown accessibility check: ${checkName}`);
    }

    return this.issues;
  }

  /**
   * Get summary of issues by severity
   */
  getSummary(): Record<string, number> {
    const summary = {
      error: 0,
      warning: 0,
      info: 0,
      total: this.issues.length
    };

    this.issues.forEach(issue => {
      summary[issue.severity]++;
    });

    return summary;
  }

  /**
   * Generate report
   */
  generateReport(): string {
    if (this.issues.length === 0) {
      return 'No accessibility issues found.';
    }

    const summary = this.getSummary();
    let report = `Accessibility Report\n`;
    report += `====================\n\n`;
    report += `Total Issues: ${summary.total}\n`;
    report += `Errors: ${summary.error}\n`;
    report += `Warnings: ${summary.warning}\n`;
    report += `Info: ${summary.info}\n\n`;

    report += `Details:\n`;
    report += `--------\n`;

    this.issues.forEach((issue, index) => {
      report += `\n${index + 1}. [${issue.severity.toUpperCase()}] ${issue.type}\n`;
      report += `   ${issue.message}\n`;
      if (issue.element) {
        report += `   Element: ${this.getElementSelector(issue.element)}\n`;
      }
    });

    return report;
  }

  /**
   * Get CSS selector for element
   */
  private getElementSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      return `${element.tagName.toLowerCase()}.${element.className.split(' ').join('.')}`;
    }
    
    return element.tagName.toLowerCase();
  }

  /**
   * Clear all issues
   */
  clear(): void {
    this.issues = [];
  }

  /**
   * Enable/disable checker
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// Export singleton instance
const accessibilityChecker = new AccessibilityChecker();

export default accessibilityChecker;
export { AccessibilityChecker };
export type { AccessibilityIssue };