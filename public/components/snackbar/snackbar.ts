import { Component } from "../../shared/interfaces.js";
import { createElementWithClasses } from "../../shared/utils.js";
import { SnackbarType } from "../../index.js";

export class Snackbar implements Component {
  rootElement: HTMLElement;
  componentElement: HTMLElement;

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
    let existingContainer = document.getElementById("snackbar-container");
    if (existingContainer) {
      this.componentElement = existingContainer as HTMLElement;
    } else {
      this.componentElement = createElementWithClasses("div", []);
      this.componentElement.id = "snackbar-container";
      this.init();
    }
  }

  private init() {
    this.render();
    this.mount();
  }

  render(): void {}

  mount(): void {
    if (!this.rootElement.contains(this.componentElement)) {
      this.rootElement.appendChild(this.componentElement);
    }
  }

  attachEvents(): void {}

  destroy(): void {
    this.componentElement.remove();
  }

  /**
   * Shows a toast notification.
   * @param message The message to display.
   * @param type The type of notification (success, error, info).
   * @param duration Duration in ms before auto-dismissing (default 3000ms).
   */
  public show(
    message: string,
    type: SnackbarType = SnackbarType.INFO,
    duration: number = 3000
  ) {
    const toast = createElementWithClasses("div", [
      "snackbar-toast",
      `snackbar-toast__${type}`,
    ]);
    toast.textContent = message;

    this.componentElement.appendChild(toast);

    setTimeout(() => {
      this.dismiss(toast);
    }, duration);
  }

  private dismiss(toast: HTMLElement) {
    toast.classList.add("hide");
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }
}
