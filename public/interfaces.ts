/**
 * Represents a UI component in the application.
 * All components should implement this interface to ensure a consistent lifecycle.
 */
export interface Component {
  /** The parent DOM element where this component will be mounted. */
  rootElement: HTMLElement;
  /** The main DOM element of this component. */
  componentElement: HTMLElement;

  /** Renders the component's HTML structure. */
  render(): void;
  /** Appends the component's element to the root element. */
  mount(): void;
  /** Attaches event listeners to the component's elements. */
  attachEvents(): void;
  /** Removes the component from the DOM and cleans up resources. */
  destroy(): void;
}
