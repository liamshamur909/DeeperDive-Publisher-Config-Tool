import { Component } from "../interfaces.js";
import { createElementWithClasses } from "../utils.js";

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
    this.mount();
  }

  render(): void {
    const spinner = createElementWithClasses("div", ["loader-spinner"]);
    this.componentElement.appendChild(spinner);
  }

  mount(): void {
    if (!this.rootElement.contains(this.componentElement)) {
      this.rootElement.appendChild(this.componentElement);
    }
  }

  attachEvents(): void {}

  destroy(): void {
    this.componentElement.remove();
  }

  public show() {
    this.componentElement.classList.add("visible");
  }

  public hide() {
    this.componentElement.classList.remove("visible");
  }
}
