/**
 * Add Field Component
 *
 * Provides a UI for adding new optional fields to a configuration object.
 * Features:
 * - Text input for the new field key.
 * - Dropdown for selecting value type (unless fixed).
 * - Validation to prevent empty keys or duplicates (handled by parent callback).
 */

import { Component } from "../../../../shared/interfaces.js";
import { createElementWithClasses } from "../../../../shared/utils.js";
import { Snackbar } from "../../../../shared/components/snackbar/snackbar.js";
import { FieldType, SnackbarType } from "../../../../shared/enums.js";

/**
 * Component for adding a new field with a name and a type selector.
 */
export class AddField implements Component {
  /**
   * Parent element where the component is attached.
   */
  rootElement: HTMLElement;
  /**
   * The main container element for the component.
   */
  componentElement: HTMLElement;

  /**
   * Callback to be executed when the add button is clicked.
   * @param key - The name of the new field.
   * @param value - The initial value of the new field.
   * @returns true if the field was successfully added (clears inputs), false otherwise.
   */
  onAdd: (key: string, value: any) => boolean;

  private keyInput!: HTMLInputElement;
  private typeSelect!: HTMLSelectElement;

  /**
   * Placeholder text for the input field.
   */
  private placeholder: string;

  /**
   * Optional fixed type. If set, the type selector is hidden and this type is implied.
   */
  private fixedType?: FieldType;

  /**
   * Creates an instance of the AddField component.
   * @param rootElement - The DOM element to append this component to.
   * @param onAdd - Callback function invoked when adding a field.
   * @param placeholder - Custom placeholder text for the input.
   * @param fixedType - Pre-defined field type (hides type selector).
   */
  constructor(
    rootElement: HTMLElement,
    onAdd: (key: string, value: any) => boolean,
    placeholder: string = "Enter new field name",
    fixedType?: FieldType
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
   * Renders the input, type selector (if not fixed), and add button.
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
   * Currently empty as events are handled inline during creation.
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
   * @returns The constructed input element.
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
   * @returns The constructed select element.
   */
  private createTypeSelect(): HTMLSelectElement {
    const select = createElementWithClasses("select", [
      "add-field__select",
      "base-input",
    ]) as HTMLSelectElement;

    // Use the enum values for options
    const types = [
      { label: "String", value: FieldType.STRING },
      { label: "Number", value: FieldType.NUMBER },
      { label: "Boolean", value: FieldType.BOOLEAN },
      { label: "Array", value: FieldType.ARRAY },
      { label: "Object", value: FieldType.OBJECT },
    ];

    types.forEach((type) => {
      const option = document.createElement("option");
      option.value = type.value;
      option.textContent = type.label;
      select.appendChild(option);
    });
    return select;
  }

  /**
   * Creates the "Add" button.
   * @returns The constructed button element.
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
    // Use type assertion or careful handling since value comes from DOM
    const type = this.fixedType || (this.typeSelect.value as FieldType);

    if (!key) {
      new Snackbar("Field name cannot be empty", SnackbarType.ERROR);
      return;
    }

    let initialValue: any = "";
    switch (type) {
      case FieldType.NUMBER:
        initialValue = 0;
        break;
      case FieldType.BOOLEAN:
        initialValue = false;
        break;
      case FieldType.ARRAY:
        initialValue = [];
        break;
      case FieldType.OBJECT:
        initialValue = {};
        break;
      case FieldType.STRING:
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
