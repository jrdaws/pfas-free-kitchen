/**
 * Utilities for iframe-parent communication via postMessage
 */

import { ElementInfo, EditorMessage } from './types';

export function sendMessageToIframe(iframe: HTMLIFrameElement, message: EditorMessage) {
  iframe.contentWindow?.postMessage(message, '*');
}

export function sendMessageToParent(message: EditorMessage) {
  window.parent.postMessage(message, '*');
}

export function getElementInfo(element: HTMLElement): ElementInfo {
  const rect = element.getBoundingClientRect();
  const computedStyles = window.getComputedStyle(element);

  // Convert CSSStyleDeclaration to plain object
  const styles: Record<string, string> = {};
  for (let i = 0; i < computedStyles.length; i++) {
    const prop = computedStyles[i];
    styles[prop] = computedStyles.getPropertyValue(prop);
  }

  // Get all attributes
  const attributes: Record<string, string> = {};
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    attributes[attr.name] = attr.value;
  }

  // Generate CSS selector path
  const path = getCSSPath(element);

  return {
    id: element.dataset.editorId || generateId(),
    tagName: element.tagName.toLowerCase(),
    textContent: element.textContent || '',
    innerHTML: element.innerHTML,
    styles,
    attributes,
    path,
    rect: {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    },
  };
}

function getCSSPath(element: HTMLElement): string {
  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current.tagName !== 'HTML') {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break;
    } else {
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children);
        const index = siblings.indexOf(current);
        const sameTagSiblings = siblings.filter(s => s.tagName === current!.tagName);
        if (sameTagSiblings.length > 1) {
          selector += `:nth-child(${index + 1})`;
        }
      }
      path.unshift(selector);
    }

    current = current.parentElement;
  }

  return path.join(' > ');
}

function generateId(): string {
  return `el-${Math.random().toString(36).substr(2, 9)}`;
}

export function injectEditorScript(iframe: HTMLIFrameElement, onMessage: (message: EditorMessage) => void) {
  const doc = iframe.contentDocument;
  if (!doc) return;

  const script = doc.createElement('script');
  script.textContent = `
    (function() {
      let selectedElement = null;
      let hoveredElement = null;

      // Add editor IDs to all elements
      document.querySelectorAll('body *').forEach((el, index) => {
        if (!el.dataset.editorId) {
          el.dataset.editorId = 'el-' + index;
        }
      });

      // Handle clicks - select element
      document.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const target = e.target;
        if (!(target instanceof HTMLElement)) return;

        // Remove previous selection
        if (selectedElement) {
          selectedElement.style.outline = '';
        }

        // Highlight new selection
        selectedElement = target;
        selectedElement.style.outline = '2px solid #3b82f6';

        // Send to parent
        window.parent.postMessage({
          type: 'ELEMENT_SELECTED',
          payload: getElementInfo(target)
        }, '*');
      }, true);

      // Handle hover
      document.addEventListener('mouseover', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        if (target === selectedElement) return;

        // Remove previous hover
        if (hoveredElement && hoveredElement !== selectedElement) {
          hoveredElement.style.outline = '';
        }

        // Highlight hover
        hoveredElement = target;
        hoveredElement.style.outline = '1px dashed #3b82f6';

        window.parent.postMessage({
          type: 'ELEMENT_HOVERED',
          payload: getElementInfo(target)
        }, '*');
      }, true);

      document.addEventListener('mouseout', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        if (target === selectedElement) return;

        target.style.outline = '';
      }, true);

      // Listen for updates from parent
      window.addEventListener('message', (event) => {
        if (event.data.type === 'ELEMENT_UPDATED') {
          const { elementId, changes } = event.data.payload;
          const element = document.querySelector('[data-editor-id="' + elementId + '"]');
          if (!element) return;

          if (changes.textContent !== undefined) {
            element.textContent = changes.textContent;
          }
          if (changes.innerHTML !== undefined) {
            element.innerHTML = changes.innerHTML;
          }
          if (changes.styles) {
            Object.assign(element.style, changes.styles);
          }
          if (changes.attributes) {
            Object.entries(changes.attributes).forEach(([key, value]) => {
              element.setAttribute(key, value);
            });
          }
        }
      });

      function getElementInfo(element) {
        const rect = element.getBoundingClientRect();
        const computedStyles = window.getComputedStyle(element);

        const styles = {};
        const importantStyles = ['color', 'backgroundColor', 'fontSize', 'fontWeight', 'fontFamily', 'padding', 'margin', 'width', 'height', 'display', 'position'];
        importantStyles.forEach(prop => {
          styles[prop] = computedStyles[prop];
        });

        const attributes = {};
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          attributes[attr.name] = attr.value;
        }

        return {
          id: element.dataset.editorId,
          tagName: element.tagName.toLowerCase(),
          textContent: element.textContent,
          innerHTML: element.innerHTML,
          styles,
          attributes,
          rect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          },
        };
      }
    })();
  `;

  doc.body.appendChild(script);

  // Listen for messages from iframe
  window.addEventListener('message', (event) => {
    if (event.source === iframe.contentWindow) {
      onMessage(event.data);
    }
  });
}
