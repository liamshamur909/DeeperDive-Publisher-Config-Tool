import { Component } from "../../shared/interfaces.js";
import { createElementWithClasses } from "../../shared/utils.js";
import { SnackbarType } from "../../index.js";

/**
 * A toast notification component.
 * Displays temporary messages to the user.
 */
export class Snackbar implements Component {
  rootElement: HTMLElement;
  componentElement: HTMLElement;
  message: string;
  type: SnackbarType;
  duration: number;

  /**
   * Creates a new Snackbar instance.
   *
   * @param message - The text message to display.
   * @param type - The type of snackbar (success, error, info).
   * @param duration - Duration in milliseconds before auto-dismissing. Default is 3000ms.
   */
  constructor(
    message: string,
    type: SnackbarType = SnackbarType.INFO,
    duration: number = 3000
  ) {
    this.message = message;
    this.type = type;
    this.duration = duration;

    // The root is always the container, forcing it to exist if not
    let container = document.getElementById("snackbar-container");
    if (!container) {
      container = createElementWithClasses("div", []);
      container.id = "snackbar-container";
      document.body.appendChild(container);
    }
    this.rootElement = container as HTMLElement;
    this.componentElement = document.createElement("div"); // Placeholder, set in render

    this.init();
  }

  private init() {
    this.render();
    this.mount();
    this.attachEvents();
  }

  /**
   * Renders the snackbar element with appropriate classes for styling.
   */
  render(): void {
    this.componentElement = createElementWithClasses("div", [
      "snackbar-toast",
      `snackbar-toast__${this.type}`,
    ]);
    this.componentElement.textContent = this.message;
  }

  /**
   * Appends the snackbar to the container.
   */
  mount(): void {
    this.rootElement.appendChild(this.componentElement);
  }

  /**
   * Sets the auto-dismiss timer.
   */
  attachEvents(): void {
    // Auto-destroy after duration
    setTimeout(() => {
      this.destroy();
    }, this.duration);
  }

  /**
   * Triggers the exit animation and removes the element.
   */
  destroy(): void {
    this.componentElement.classList.add("hide");
    this.componentElement.addEventListener("animationend", () => {
      this.componentElement.remove();
      // Optional: If container is empty, we could remove it, but keeping it is fine.
    });
  }
}
