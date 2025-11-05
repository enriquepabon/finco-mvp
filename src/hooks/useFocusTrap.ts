/**
 * Focus Trap Hook
 *
 * Custom hook that implements a focus trap for modal dialogs and other
 * interactive overlays. Ensures keyboard users can only tab through
 * focusable elements within the trapped container.
 *
 * Features:
 * - Traps focus within the specified container
 * - Cycles focus when reaching the first/last focusable element
 * - Restores focus to the triggering element when trap is deactivated
 * - Supports both Tab and Shift+Tab navigation
 *
 * @module hooks/useFocusTrap
 */

import { useEffect, useRef } from 'react';

/**
 * List of selectors for focusable elements
 */
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
].join(',');

/**
 * Custom hook to trap focus within a container element
 *
 * @param {boolean} isActive - Whether the focus trap is active
 * @returns {React.RefObject<HTMLDivElement>} Ref to attach to the container element
 *
 * @example
 * function Modal({ isOpen, onClose }) {
 *   const trapRef = useFocusTrap(isOpen);
 *
 *   return (
 *     <div ref={trapRef}>
 *       <button onClick={onClose}>Close</button>
 *       <input type="text" />
 *     </div>
 *   );
 * }
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the element that had focus before the trap activated
    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;

    /**
     * Get all focusable elements within the container
     */
    const getFocusableElements = (): HTMLElement[] => {
      const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
      return Array.from(elements).filter((element) => {
        // Filter out elements with negative tabindex or that are not visible
        return (
          element.tabIndex !== -1 &&
          !element.hasAttribute('hidden') &&
          element.offsetParent !== null
        );
      });
    };

    /**
     * Handle Tab key press to trap focus within container
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // Shift+Tab on first element: go to last
      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      // Tab on last element: go to first
      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
        return;
      }
    };

    // Focus the first focusable element when trap activates
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Add event listener
    container.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the element that had it before the trap
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}
