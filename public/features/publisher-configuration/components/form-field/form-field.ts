/**
 * Form Field Component
 *
 * A controller component that manages the rendering of a single field in the configuration form.
 * It determines the type of the value (boolean, array, object, primitive) and renders the
 * appropriate sub-component. It also handles field removal and collapsing.
 */

import { Component } from "../../../../shared/interfaces.js";
import { createElementWithClasses } from "../../../../shared/utils.js";
import { PrimitiveField } from "../primitive-field/primitive-field.js";
import { ObjectField } from "../object-field/object-field.js";
import { ArrayField } from "../array-field/array-field.js";

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
  /** If true, the field content is hidden. Applies to non-boolean fields. */
  private isCollapsed: boolean = true;

  /**
   * Creates an instance of the FormField component.
   *
   * @param rootElement - The parent element to attach to.
   * @param parentData - The object containing the data.
   * @param key - The key of the field in `parentData`.
   * @param onChange - Callback for value changes.
   * @param onRemove - Optional callback for removing the field.
   * @param isFixedStructure - Valid for object fields: prevents structure changes if true.
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

    if (!this.rootElement) throw new Error("rootElement is required");

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
   * Renders the field based on the type of value (boolean, array, object, or primitive).
   * Dispatches to specific sub-components.
   */
  render() {
    const value = this.parentData[this.key];
    const fieldType = this.getFieldType(value);

    switch (fieldType) {
      case "boolean":
        this.renderBoolean(value);
        break;
      default:
        this.renderNonBoolean(
          value,
          fieldType as "array" | "object" | "primitive"
        );
        break;
    }
  }

  /**
   * Determines the type of the field based on its value.
   * @param value - The value to check.
   * @returns The type of the field ('boolean', 'array', 'object', or 'primitive').
   */
  private getFieldType(
    value: any
  ): "boolean" | "array" | "object" | "primitive" {
    if (typeof value === "boolean") return "boolean";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object" && value !== null) return "object";
    return "primitive";
  }

  /**
   * Renders a boolean field (checkbox).
   * @param value - The boolean value.
   */
  private renderBoolean(value: boolean) {
    this.componentElement.classList.add("form-field--checkbox");

    new PrimitiveField(this.componentElement, value, (newVal) => {
      this.parentData[this.key] = newVal;
      this.onChange();
    });

    this.componentElement.appendChild(this.createLabel(true));

    if (this.onRemove) {
      const removeButton = this.createRemoveButton();
      this.componentElement.appendChild(removeButton);
    }
  }

  /**
   * Renders non-boolean fields (Array, Object, or Primitive).
   * @param value - The field value.
   * @param fieldType - The determined type of the field.
   */
  private renderNonBoolean(
    value: any,
    fieldType: "array" | "object" | "primitive"
  ) {
    // For non-boolean fields, we use a collapsible structure
    this.componentElement.appendChild(this.createLabel(false, true));

    const contentContainer = createElementWithClasses("div", [
      "form-field__content",
    ]);

    if (this.isCollapsed) {
      contentContainer.classList.add("collapsed");
    }
    this.componentElement.appendChild(contentContainer);

    switch (fieldType) {
      case "array":
        new ArrayField(contentContainer, value, this.onChange);
        break;
      case "object":
        new ObjectField(
          contentContainer,
          value,
          this.onChange,
          this.isFixedStructure
        );
        break;
      case "primitive":
        new PrimitiveField(contentContainer, value, (newVal) => {
          this.parentData[this.key] = newVal;
          this.onChange();
        });
        break;
    }
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
   * Creates the label element, optionally wrapped in a header with a remove button and toggle button.
   * @param isCheckbox - Whether this label is for a checkbox input (affects styling).
   * @param isCollapsible - Whether the field supports collapsing (adds toggle button).
   * @returns The label element (or header wrapper).
   */
  private createLabel(
    isCheckbox: boolean = false,
    isCollapsible: boolean = false
  ): HTMLElement {
    const label = document.createElement("label");
    label.textContent = String(this.key);

    if (isCheckbox) {
      label.classList.add("form-field-checkbox-label");
      return label;
    }

    label.classList.add("form-field__label");

    // For collapsible fields or fields with remove button, we use a header
    const header = createElementWithClasses("div", ["form-field__header"]);

    if (isCollapsible) {
      const toggleBtn = this.createToggleButton();
      header.appendChild(toggleBtn);
    }

    header.appendChild(label);

    if (this.onRemove) {
      header.appendChild(this.createRemoveButton());
    }

    return header;
  }

  /**
   * Creates the toggle button for collapsing/expanding content.
   */
  private createToggleButton(): HTMLButtonElement {
    const button = createElementWithClasses("button", [
      "toggle-button",
      "base-button",
    ]) as HTMLButtonElement;
    // Use a span for the icon to allow rotation without rotating the button/shadow
    button.innerHTML = '<span class="toggle-icon">\u25B6</span>';
    button.type = "button";

    if (!this.isCollapsed) {
      button.classList.add("expanded");
      // Initially set rotation if not collapsed (handled by CSS via class)
    }

    button.addEventListener("click", () => {
      this.isCollapsed = !this.isCollapsed;

      const content = this.componentElement.querySelector(
        ".form-field__content"
      );
      if (content) {
        if (this.isCollapsed) {
          content.classList.add("collapsed");
          button.classList.remove("expanded");
        } else {
          content.classList.remove("collapsed");
          button.classList.add("expanded");
        }
      }
    });

    return button as HTMLButtonElement;
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
}
