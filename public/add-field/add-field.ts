import { Component } from "../interfaces.js";
import { createElementWithClasses } from "../utils.js";
import { showToast } from "../index.js";

/**
 * Component for adding a new field with a name and a type selector.
 */
export class AddField implements Component {
  rootElement: HTMLElement;
  componentElement: HTMLElement;

  /**
   * Callback to be executed when the add button is clicked.
   * Should return true if the field was successfully added (to clear inputs), false otherwise.
   */
  onAdd: (key: string, value: any) => boolean;

  private keyInput!: HTMLInputElement;
  private typeSelect!: HTMLSelectElement;
  /**
   * Placeholder text for the input field.
   */
  private placeholder: string;

  /**
   * Optional fixed type. If set, the type selector is hidden and this type is used.
   */
  private fixedType?: "string" | "number" | "boolean" | "array" | "object";

  constructor(
    rootElement: HTMLElement,
    onAdd: (key: string, value: any) => boolean,
    placeholder: string = "Enter new field name",
    fixedType?: "string" | "number" | "boolean" | "array" | "object"
  ) {
    this.rootElement = rootElement;
    this.onAdd = onAdd;
    this.placeholder = placeholder;
    this.fixedType = fixedType;
    if (!this.rootElement) throw new Error("rootElement is required");
    this.componentElement = createElementWithClasses("div", ["add-field"]);
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
   * Renders the input, type selector, and add button.
   */
  render() {
    this.keyInput = this.createKeyInput();
    this.componentElement.appendChild(this.keyInput);

    if (!this.fixedType) {
      this.typeSelect = this.createTypeSelect();
      this.componentElement.appendChild(this.typeSelect);
    }

    const addButton = this.createAddButton();
    this.componentElement.appendChild(addButton);
  }

  /**
   * Appends the component's element to the root element.
   */
  mount() {
    this.rootElement.appendChild(this.componentElement);
  }

  /**
   * Attaches additional event listeners.
   */
  attachEvents() {}

  /**
   * Removes the component from the DOM.
   */
  destroy() {
    this.componentElement.remove();
  }

  /**
   * Creates the text input element for the new field name.
   */
  private createKeyInput(): HTMLInputElement {
    const input = createElementWithClasses("input", [
      "add-field__input",
      "base-input",
    ]) as HTMLInputElement;
    input.type = "text";
    input.placeholder = this.placeholder;
    return input;
  }

  /**
   * Creates the dropdown selector for the field type.
   */
  private createTypeSelect(): HTMLSelectElement {
    const select = createElementWithClasses("select", [
      "add-field__select",
      "base-input",
    ]) as HTMLSelectElement;

    const types = ["String", "Number", "Boolean", "Array", "Object"];
    types.forEach((type) => {
      const option = document.createElement("option");
      option.value = type.toLowerCase();
      option.textContent = type;
      select.appendChild(option);
    });
    return select;
  }

  /**
   * Creates the "Add" button.
   */
  private createAddButton(): HTMLButtonElement {
    const button = createElementWithClasses("button", [
      "add-field__button",
      "base-button",
    ]) as HTMLButtonElement;
    button.textContent = "+ Add";
    button.addEventListener("click", () => this.handleAdd());
    return button;
  }

  /**
   * Handles the add button click.
   * Validates input, determines initial value based on type, and triggers the onAdd callback.
   */
  private handleAdd() {
    const key = this.keyInput.value.trim();
    const type = this.fixedType || this.typeSelect.value;

    if (!key) {
      showToast("Field name cannot be empty", "error");
      return;
    }

    let initialValue: any = "";
    switch (type) {
      case "number":
        initialValue = 0;
        break;
      case "boolean":
        initialValue = false;
        break;
      case "array":
        initialValue = [];
        break;
      case "object":
        initialValue = {};
        break;
      case "string":
      default:
        initialValue = "";
        break;
    }

    const success = this.onAdd(key, initialValue);
    if (success) {
      this.keyInput.value = "";
    }
  }
}
