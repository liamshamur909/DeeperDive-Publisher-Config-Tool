import { Component } from "../interfaces.js";
import { createElementWithClasses } from "../utils.js";
import { PrimitiveField } from "./components/primitive-field/primitive-field.js";
import { ObjectField } from "./components/object-field/object-field.js";
import { ArrayField } from "./components/array-field/array-field.js";

/**
 * Component responsible for rendering a single form field.
 * Acts as a controller that delegates rendering to PrimitiveField, ArrayField, or ObjectField
 * based on the data type of the field value.
 */
export class FormField implements Component {
  /** The parent DOM element where this component will be mounted. */
  rootElement: HTMLElement;
  /** The main DOM element of this component. */
  componentElement: HTMLElement;
  /** The data object containing the field to be edited. */
  parentData: any;
  /** The key of the field within parentData. */
  key: string | number;
  /** Callback function triggered when the field value changes. */
  onChange: () => void;
  /** Optional callback triggered when the remove button is clicked. */
  onRemove?: () => void;
  /** If true, structure of objects (properties) cannot be changed. */
  private isFixedStructure: boolean;

  /**
   * Creates an instance of the FormField component.
   */
  constructor(
    rootElement: HTMLElement,
    parentData: any,
    key: string | number,
    onChange: () => void,
    onRemove?: () => void,
    isFixedStructure: boolean = false
  ) {
    this.rootElement = rootElement;
    this.parentData = parentData;
    this.key = key;
    this.onChange = onChange;
    this.onRemove = onRemove;
    this.isFixedStructure = isFixedStructure;

    this.componentElement = createElementWithClasses("div", ["form-field"]);

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
   * Factory callback passed to children components to create recursive FormFields.
   * @param container - The container for the new field.
   * @param data - The data object.
   * @param key - The key of the field.
   * @param onChange - Change callback.
   * @param onRemove - Remove callback.
   * @param isFixedStructure - Fixed structure flag.
   */
  private createFormField(
    container: HTMLElement,
    data: any,
    key: string | number,
    onChange: () => void,
    onRemove?: () => void,
    isFixedStructure: boolean = false
  ) {
    new FormField(container, data, key, onChange, onRemove, isFixedStructure);
  }

  /**
   * Renders the field based on the type of value (boolean, array, object, or primitive).
   */
  render() {
    const value = this.parentData[this.key];

    // Determine type and render appropriate component
    if (typeof value === "boolean") {
      this.componentElement.classList.add("form-field--checkbox");

      // PrimitiveField for boolean is just the checkbox input
      new PrimitiveField(this.componentElement, value, (newVal) => {
        this.parentData[this.key] = newVal;
        this.onChange();
      });

      // Label handling
      this.componentElement.appendChild(this.createLabel(true));

      // Remove button for boolean field
      if (this.onRemove) {
        const removeButton = this.createRemoveButton();
        removeButton.style.marginLeft = "auto";
        this.componentElement.appendChild(removeButton);
      }
    } else if (Array.isArray(value)) {
      this.componentElement.appendChild(this.createLabel());
      new ArrayField(
        this.componentElement,
        value,
        this.onChange,
        this.createFormField.bind(this),
        this.isFixedStructure
      );
    } else if (typeof value === "object" && value !== null) {
      this.componentElement.appendChild(this.createLabel());
      new ObjectField(
        this.componentElement,
        value,
        this.onChange,
        this.createFormField.bind(this),
        this.isFixedStructure
      );
    } else {
      // Number or String
      this.componentElement.appendChild(this.createLabel());
      new PrimitiveField(this.componentElement, value, (newVal) => {
        this.parentData[this.key] = newVal;
        this.onChange();
      });
    }
  }

  /**
   * Creates the label element, optionally wrapped in a header with a remove button.
   * @param isCheckbox - Whether this label is for a checkbox input.
   * @returns The label element (or header wrapper).
   */
  private createLabel(isCheckbox: boolean = false): HTMLElement {
    const label = document.createElement("label");
    label.textContent = String(this.key);

    if (isCheckbox) {
      label.classList.add("form-field-checkbox-label");
      return label;
    }

    label.classList.add("form-field__label");

    if (this.onRemove) {
      const header = createElementWithClasses("div", ["form-field__header"]);
      label.style.marginBottom = "0";
      header.appendChild(label);
      header.appendChild(this.createRemoveButton());
      return header;
    }

    return label;
  }

  /**
   * Creates the "Remove Field" button.
   * @returns The button element.
   */
  private createRemoveButton(): HTMLButtonElement {
    const button = createElementWithClasses("button", [
      "delete-button",
      "base-button",
    ]);
    button.textContent = "Remove Field";
    button.title = "Remove Field";
    button.addEventListener("click", () => {
      if (this.onRemove) this.onRemove();
    });
    return button as HTMLButtonElement;
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
}
