/**
 * Primitive Field Component
 *
 * Renders a simple input for distinct primitive types:
 * - Strings (text input)
 * - Numbers (number input)

 * Used as a leaf node in the configuration tree.
 */

import { Component } from "../../../../shared/interfaces.js";

type PrimitiveType = string | number;

/**
 * Component for rendering primitive values (String, Number).
 * Renders a text or number input depending on the type.
 */
export class PrimitiveField implements Component {
  /** The parent DOM element where this component will be mounted. */
  rootElement: HTMLElement;
  /** The main DOM element of this component. */
  componentElement: HTMLElement;

  /**
   * Creates an instance of PrimitiveField.
   * @param rootElement - The container where this input will be appended.
   * @param value - The initial value of the field.
   * @param onChange - Callback triggered when the value changes.
   */
  constructor(
    rootElement: HTMLElement,
    private value: PrimitiveType,
    private onChange: (newValue: PrimitiveType) => void
  ) {
    this.rootElement = rootElement;
    if (!this.rootElement) throw new Error("rootElement is required");
    this.componentElement = document.createElement("input");
    this.init();
  }

  /**
   * Initializes the component by rendering and mounting it.
   */
  private init() {
    this.render();
    this.mount();
  }

  /**
   * Renders the input element based on the value type.
   * Sets up event listeners for value changes.
   */
  render() {
    const input = this.componentElement as HTMLInputElement;
    input.className = "form-field__input base-input";
    input.value = String(this.value);
    input.type = typeof this.value === "number" ? "number" : "text";
    input.addEventListener("input", (e) => {
      const val = (e.target as HTMLInputElement).value;
      this.onChange(typeof this.value === "number" ? Number(val) : val);
    });
  }

  /**
   * Appends the component's element to the root element.
   */
  mount() {
    this.rootElement.appendChild(this.componentElement);
  }

  /**
   * Attaches additional event listeners.
   * Note: Main change listeners are attached during render.
   */
  attachEvents() {
    // Events attached in render
  }

  /**
   * Removes the component from the DOM.
   */
  destroy() {
    this.componentElement.remove();
  }
}
