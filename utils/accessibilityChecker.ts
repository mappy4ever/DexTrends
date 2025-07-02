/**
 * Accessibility checker utility for development
 * Helps identify and fix accessibility issues
 */

import logger from './logger';

class AccessibilityChecker {
  constructor() {
    this.issues = [];
    this.isEnabled = process.env.NODE_ENV === 'development';
    this.checks = new Set();
  }

  /**
   * Run all accessibility checks on the current page
   */
  checkPage() {
    if (!this.isEnabled || typeof window === 'undefined') {
      return;
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
  checkImages() {
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
  checkButtons() {
    const buttons = document.querySelectorAll('button, [role="button"]');
    buttons.forEach((button, index) => {
      // Check for accessible text
      const text = this.getAccessibleText(button);
      if (!text) {
        this.addIssue('button-no-text', `Button at index ${index} has no accessible text`, button);
      }

      // Check if disabled buttons are properly labeled
      if (button.disabled && !button.hasAttribute('aria-label') && !button.hasAttribute('title')) {
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
  checkLinks() {
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
        if (!link.hasAttribute('rel') || !link.getAttribute('rel').includes('noopener')) {
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
  checkForms() {
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
  checkHeadings() {
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
  checkLandmarks() {
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
  checkColorContrast() {
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
  checkKeyboardNavigation() {
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
      if (element.disabled) {
        return; // Skip disabled elements
      }

      // Elements that should be focusable but aren't
      if (tabIndex === '-1' && ['A', 'BUTTON'].includes(element.tagName)) {
        this.addIssue('unfocusable-interactive', `Interactive element at index ${index} is not focusable`, element);
      }
    });
  }

  /**
   * Check focus management
   */
  checkFocus() {
    // Check for visible focus indicators
    const style = document.createElement('style');
    style.textContent = `
      .a11y-focus-test:focus {
        outline: 2px solid red !important;
      }
    `;
    document.head.appendChild(style);
    
    // This would be better implemented with actual focus testing
    // For now, just check if there are any custom focus styles
    const stylesheets = Array.from(document.styleSheets);
    let hasFocusStyles = false;
    
    try {
      stylesheets.forEach(sheet => {
        if (sheet.cssRules) {
          Array.from(sheet.cssRules).forEach(rule => {
            if (rule.selectorText && rule.selectorText.includes(':focus')) {
              hasFocusStyles = true;
            }
          });
        }
      });
    } catch (e) {
      // Cross-origin stylesheets can't be accessed
    }

    if (!hasFocusStyles) {
      this.addIssue('no-focus-styles', 'Page appears to have no custom focus styles');
    }

    document.head.removeChild(style);
  }

  /**
   * Check ARIA labels and attributes
   */
  checkARIALabels() {
    // Check for invalid ARIA attributes
    const elementsWithAria = document.querySelectorAll('[aria-labelledby], [aria-describedby]');
    
    elementsWithAria.forEach((element, index) => {
      const labelledBy = element.getAttribute('aria-labelledby');
      const describedBy = element.getAttribute('aria-describedby');
      
      if (labelledBy) {
        const labelElement = document.getElementById(labelledBy);
        if (!labelElement) {
          this.addIssue('invalid-aria-labelledby', `Element at index ${index} references non-existent ID: ${labelledBy}`, element);
        }
      }
      
      if (describedBy) {
        const descElement = document.getElementById(describedBy);
        if (!descElement) {
          this.addIssue('invalid-aria-describedby', `Element at index ${index} references non-existent ID: ${describedBy}`, element);
        }
      }
    });

    // Check for proper ARIA roles
    const elementsWithRoles = document.querySelectorAll('[role]');
    const validRoles = [
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'checkbox', 
      'columnheader', 'combobox', 'complementary', 'contentinfo', 'dialog', 'directory',
      'document', 'form', 'grid', 'gridcell', 'group', 'heading', 'img', 'link', 'list',
      'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'menu', 'menubar', 
      'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'note', 'option',
      'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup',
      'rowheader', 'scrollbar', 'search', 'separator', 'slider', 'spinbutton', 'status',
      'tab', 'tablist', 'tabpanel', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree',
      'treegrid', 'treeitem'
    ];

    elementsWithRoles.forEach((element, index) => {
      const role = element.getAttribute('role');
      if (!validRoles.includes(role)) {
        this.addIssue('invalid-aria-role', `Element at index ${index} has invalid ARIA role: ${role}`, element);
      }
    });
  }

  /**
   * Get accessible text content from element
   */
  getAccessibleText(element) {
    return (
      element.getAttribute('aria-label') ||
      element.getAttribute('title') ||
      element.textContent?.trim() ||
      element.querySelector('img')?.getAttribute('alt') ||
      ''
    );
  }

  /**
   * Add an accessibility issue
   */
  addIssue(type, message, element = null) {
    this.issues.push({
      type,
      message,
      element,
      timestamp: Date.now()
    });
  }

  /**
   * Get issues by type
   */
  getIssuesByType(type) {
    return this.issues.filter(issue => issue.type === type);
  }

  /**
   * Get all unique issue types
   */
  getIssueTypes() {
    return [...new Set(this.issues.map(issue => issue.type))];
  }

  /**
   * Generate accessibility report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalIssues: this.issues.length,
      issuesByType: {},
      recommendations: []
    };

    this.getIssueTypes().forEach(type => {
      const issues = this.getIssuesByType(type);
      report.issuesByType[type] = {
        count: issues.length,
        issues: issues.map(issue => ({ message: issue.message }))
      };
    });

    // Add recommendations based on issues found
    if (report.issuesByType['missing-alt']) {
      report.recommendations.push('Add alt attributes to all images');
    }
    if (report.issuesByType['no-skip-links']) {
      report.recommendations.push('Add skip links for keyboard navigation');
    }
    if (report.issuesByType['heading-level-skip']) {
      report.recommendations.push('Fix heading hierarchy - don\'t skip heading levels');
    }

    return report;
  }

  /**
   * Auto-fix some common issues (use with caution)
   */
  autoFix() {
    if (!this.isEnabled) return;

    // Add missing alt attributes with placeholder text
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    imagesWithoutAlt.forEach(img => {
      img.setAttribute('alt', 'Image'); // Placeholder - should be replaced with meaningful text
      logger.info('Auto-fixed: Added placeholder alt attribute to image');
    });

    // Add type="button" to buttons without type
    const buttonsWithoutType = document.querySelectorAll('button:not([type])');
    buttonsWithoutType.forEach(button => {
      if (button.closest('form')) {
        button.setAttribute('type', 'submit');
        logger.info('Auto-fixed: Added type="submit" to form button');
      } else {
        button.setAttribute('type', 'button');
        logger.info('Auto-fixed: Added type="button" to button');
      }
    });
  }

  /**
   * Monitor page for accessibility issues
   */
  startMonitoring() {
    if (!this.isEnabled) return;

    // Check on page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.checkPage());
    } else {
      this.checkPage();
    }

    // Re-check when content changes
    const observer = new MutationObserver(() => {
      clearTimeout(this.checkTimeout);
      this.checkTimeout = setTimeout(() => this.checkPage(), 1000);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-label', 'aria-labelledby', 'aria-describedby', 'role', 'alt']
    });

    return observer;
  }
}

// Global instance
const accessibilityChecker = new AccessibilityChecker();

// React hook for accessibility checking
export const useAccessibilityChecker = () => {
  return {
    checkPage: accessibilityChecker.checkPage.bind(accessibilityChecker),
    getIssues: () => accessibilityChecker.issues,
    generateReport: accessibilityChecker.generateReport.bind(accessibilityChecker),
    autoFix: accessibilityChecker.autoFix.bind(accessibilityChecker),
    startMonitoring: accessibilityChecker.startMonitoring.bind(accessibilityChecker)
  };
};

export default accessibilityChecker;