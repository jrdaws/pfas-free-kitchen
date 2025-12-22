/**
 * Iframe Selection Injector
 * This script is injected into the preview iframe to handle element selection
 */

export function getInjectionScript(): string {
  return `
    (function() {
      let selectedElement = null;
      let hoveredElement = null;
      let elementIdCounter = 0;
      const elementIdMap = new WeakMap();

      // Generate unique ID for elements
      function getElementId(element) {
        if (!elementIdMap.has(element)) {
          elementIdMap.set(element, 'element-' + (elementIdCounter++));
        }
        return elementIdMap.get(element);
      }

      // Get computed styles for an element
      function getElementStyles(element) {
        const computed = window.getComputedStyle(element);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          fontFamily: computed.fontFamily,
          padding: computed.padding,
          margin: computed.margin,
          borderRadius: computed.borderRadius,
        };
      }

      // Get element position relative to iframe
      function getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        };
      }

      // Generate CSS selector path for element
      function getElementPath(element) {
        const path = [];
        let current = element;

        while (current && current !== document.body) {
          let selector = current.tagName.toLowerCase();

          if (current.id) {
            selector += '#' + current.id;
            path.unshift(selector);
            break;
          } else if (current.className) {
            const classes = Array.from(current.classList).join('.');
            if (classes) selector += '.' + classes;
          }

          path.unshift(selector);
          current = current.parentElement;
        }

        return path.join(' > ');
      }

      // Create element data object
      function createElementData(element) {
        return {
          id: getElementId(element),
          tagName: element.tagName,
          textContent: element.textContent?.trim().substring(0, 100) || '',
          position: getElementPosition(element),
          styles: getElementStyles(element),
          attributes: Array.from(element.attributes).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {}),
          path: getElementPath(element),
        };
      }

      // Build element tree
      function buildElementTree(element, depth = 0) {
        const children = Array.from(element.children).map(child =>
          buildElementTree(child, depth + 1)
        );

        return {
          id: getElementId(element),
          tagName: element.tagName,
          textContent: element.childNodes.length === 1 &&
                       element.childNodes[0].nodeType === 3
            ? element.textContent?.trim().substring(0, 50)
            : undefined,
          children,
          depth,
        };
      }

      // Handle hover
      function handleMouseOver(e) {
        e.stopPropagation();
        const element = e.target;

        if (element === hoveredElement) return;
        hoveredElement = element;

        // Add hover outline
        element.style.outline = '2px dashed #3b82f6';
        element.style.outlineOffset = '2px';

        window.parent.postMessage({
          type: 'hover',
          payload: createElementData(element),
        }, '*');
      }

      function handleMouseOut(e) {
        e.stopPropagation();
        const element = e.target;

        if (element === selectedElement) {
          element.style.outline = '2px solid #3b82f6';
        } else {
          element.style.outline = '';
          element.style.outlineOffset = '';
        }

        hoveredElement = null;
        window.parent.postMessage({
          type: 'unhover',
          payload: null,
        }, '*');
      }

      // Handle click selection
      function handleClick(e) {
        e.preventDefault();
        e.stopPropagation();

        const element = e.target;

        // Clear previous selection
        if (selectedElement) {
          selectedElement.style.outline = '';
          selectedElement.style.outlineOffset = '';
        }

        selectedElement = element;

        // Add selection outline
        element.style.outline = '2px solid #3b82f6';
        element.style.outlineOffset = '2px';

        window.parent.postMessage({
          type: 'selection',
          payload: createElementData(element),
        }, '*');
      }

      // Handle updates from parent
      function handleMessage(event) {
        const message = event.data;

        if (!message.type) return;

        switch (message.type) {
          case 'update': {
            const { elementId, type, updates, content } = message.payload;

            // Find element by ID
            let targetElement = null;
            document.querySelectorAll('*').forEach(el => {
              if (getElementId(el) === elementId) {
                targetElement = el;
              }
            });

            if (!targetElement) return;

            if (type === 'style') {
              Object.entries(updates).forEach(([prop, value]) => {
                targetElement.style[prop] = value;
              });
            } else if (type === 'content') {
              targetElement.textContent = content;
            } else if (type === 'delete') {
              targetElement.remove();
              selectedElement = null;
            } else if (type === 'duplicate') {
              const clone = targetElement.cloneNode(true);
              targetElement.parentNode.insertBefore(clone, targetElement.nextSibling);
            }

            // After any update, send the new HTML for history tracking
            window.parent.postMessage({
              type: 'html',
              payload: { html: document.body.innerHTML },
            }, '*');
            break;
          }
          case 'getTree': {
            const tree = buildElementTree(document.body);
            window.parent.postMessage({
              type: 'tree',
              payload: tree,
            }, '*');
            break;
          }
          case 'selectById': {
            const { elementId } = message.payload;

            // Find element by ID
            let targetElement = null;
            document.querySelectorAll('*').forEach(el => {
              if (getElementId(el) === elementId) {
                targetElement = el;
              }
            });

            if (!targetElement) return;

            // Clear previous selection
            if (selectedElement) {
              selectedElement.style.outline = '';
              selectedElement.style.outlineOffset = '';
            }

            selectedElement = targetElement;

            // Add selection outline
            targetElement.style.outline = '2px solid #3b82f6';
            targetElement.style.outlineOffset = '2px';

            // Scroll element into view
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Send selection event
            window.parent.postMessage({
              type: 'selection',
              payload: createElementData(targetElement),
            }, '*');
            break;
          }
          case 'getHtml': {
            // Return current HTML for history tracking
            window.parent.postMessage({
              type: 'html',
              payload: { html: document.body.innerHTML },
            }, '*');
            break;
          }
          case 'setHtml': {
            // Restore HTML from history (for undo/redo)
            const { html } = message.payload;
            document.body.innerHTML = html;

            // Clear selection
            if (selectedElement) {
              selectedElement = null;
            }

            // Rebuild tree
            const tree = buildElementTree(document.body);
            window.parent.postMessage({
              type: 'tree',
              payload: tree,
            }, '*');
            break;
          }
          case 'getElementPosition': {
            // Return element position for collaborative editing indicators
            const { elementId } = message.payload;

            // Find element by ID
            let targetElement = null;
            document.querySelectorAll('*').forEach(el => {
              if (getElementId(el) === elementId) {
                targetElement = el;
              }
            });

            if (targetElement) {
              const position = getElementPosition(targetElement);
              window.parent.postMessage({
                type: 'elementPosition',
                payload: { elementId, position },
              }, '*');
            } else {
              // Element not found, send null position
              window.parent.postMessage({
                type: 'elementPosition',
                payload: { elementId, position: null },
              }, '*');
            }
            break;
          }
        }
      }

      // Initialize
      function init() {
        // Add event listeners to all elements
        document.addEventListener('mouseover', handleMouseOver, true);
        document.addEventListener('mouseout', handleMouseOut, true);
        document.addEventListener('click', handleClick, true);

        // Listen for messages from parent
        window.addEventListener('message', handleMessage);

        // Send ready signal
        window.parent.postMessage({ type: 'ready' }, '*');

        // Send initial tree
        const tree = buildElementTree(document.body);
        window.parent.postMessage({
          type: 'tree',
          payload: tree,
        }, '*');
      }

      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
    })();
  `;
}
