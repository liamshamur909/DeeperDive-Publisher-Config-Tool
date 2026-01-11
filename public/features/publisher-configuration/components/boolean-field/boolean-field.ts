/**
 * Boolean Field Component
 *
 * Renders a radio button group for boolean values (True / False).
 * Replaces the previous checkbox implementation to align with
 * the form's visual structure.
 */

import { Component } from "../../../../shared/interfaces.js";
import { createElementWithClasses } from "../../../../shared/utils.js";

export class BooleanField implements Component {
  rootElement: HTMLElement;
  componentElement: HTMLElement;
  private value: boolean;
  private onChange: (newValue: boolean) => void;
  private static idCounter = 0;
  private name: string;

  constructor(
    rootElement: HTMLElement,
    value: boolean,
    onChange: (newValue: boolean) => void
  ) {
    this.rootElement = rootElement;
    this.value = value;
    this.onChange = onChange;
    this.name = `boolean-field-${BooleanField.idCounter++}`;

    if (!this.rootElement) throw new Error("rootElement is required");

    this.componentElement = createElementWithClasses("div", ["boolean-field"]);
    this.init();
  }

  private init() {
    this.render();
    this.mount();
  }

  render() {
    this.componentElement.innerHTML = "";

    // Create Radio Group
    const radioGroup = createElementWithClasses("div", ["radio-group"]);

    // True Option
    const trueLabel = this.createRadioOption(true);
    const falseLabel = this.createRadioOption(false);

    radioGroup.appendChild(trueLabel);
    radioGroup.appendChild(falseLabel);

    this.componentElement.appendChild(radioGroup);
  }

  private createRadioOption(value: boolean): HTMLElement {
    const label = createElementWithClasses("label", ["radio-option"]);

    const input = document.createElement("input");
    input.type = "radio";
    input.name = this.name;
    input.checked = this.value === value;
    input.addEventListener("change", () => {
      if (input.checked) {
        this.onChange(value);
      }
    });

    const span = document.createElement("span");
    span.textContent = value ? "True" : "False";

    label.appendChild(input);
    label.appendChild(span);

    return label;
  }

  mount() {
    this.rootElement.appendChild(this.componentElement);
  }

  attachEvents() {
    // Events attached during render
  }

  destroy() {
    this.componentElement.remove();
  }
}
