import { Component } from "../../interfaces.js";
import { createElementWithClasses } from "../../utils.js";

/**
 * A full-screen loader component that overlays the page content.
 * Used to indicate loading states during async operations.
 */
export class Loader implements Component {
  /** The parent element to attach the loader to (usually document.body). */
  rootElement: HTMLElement;

  /** The loader DOM element itself. */
  componentElement: HTMLElement;

  /**
   * Creates an instance of the Loader component.
   * Checks for an existing loader in the DOM to avoid duplicates.
   *
   * @param rootElement - The DOM element where the loader will be mounted.
   */
  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;

    let existingLoader = document.getElementById("loader-overlay");
    if (existingLoader) {
      this.componentElement = existingLoader as HTMLElement;
    } else {
      this.componentElement = createElementWithClasses("div", [
        "loader-overlay",
      ]);
      this.componentElement.id = "loader-overlay";
      this.init();
    }
  }

  private init() {
    this.render();
  }

  /**
   * Renders the spinner element within the overlay.
   */
  render(): void {
    const spinner = createElementWithClasses("div", [
      "loader-spinner",
      "visible",
    ]);
    this.componentElement.appendChild(spinner);
  }

  /**
   * Mounts the loader to the DOM.
   */
  mount(): void {
    this.rootElement.appendChild(this.componentElement);
  }

  attachEvents(): void {}

  /**
   * Hides and removes the loader from the DOM.
   */
  destroy(): void {
    this.componentElement.classList.remove("visible");
    this.componentElement.remove();
  }
}
