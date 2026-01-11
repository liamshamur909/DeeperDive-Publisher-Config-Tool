/**
 * Shared Utilities
 *
 * General helper functions used throughout the application.
 */

/**
 * Creates an HTML element with one or more class names.
 *
 * @param elementName - The tag name of the element to create (e.g., 'div', 'span').
 * @param classList - An array of class names to apply to the element.
 * @returns The created HTML element with the specified class(es).
 */
export function createElementWithClasses(
  elementName: string,
  classList: string[]
) {
  const element = document.createElement(elementName);
  for (const cls of classList) {
    if (cls) element.classList.add(cls);
  }
  return element;
}
