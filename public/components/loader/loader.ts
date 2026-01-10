import { Component } from "../../shared/interfaces.js";
import { createElementWithClasses } from "../../shared/utils.js";

export class Loader implements Component {
  rootElement: HTMLElement;
  componentElement: HTMLElement;

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

  render(): void {
    const spinner = createElementWithClasses("div", [
      "loader-spinner",
      "visible",
    ]);
    this.componentElement.appendChild(spinner);
  }

  mount(): void {
    this.rootElement.appendChild(this.componentElement);
  }

  attachEvents(): void {}

  destroy(): void {
    this.componentElement.classList.remove("visible");
    this.componentElement.remove();
  }
}
