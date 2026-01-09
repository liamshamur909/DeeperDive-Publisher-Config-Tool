import { Component } from "../../../interfaces.js";
import { createElementWithClasses } from "../../../utils.js";
import { AddField } from "../../../add-field/add-field.js";
import { PrimitiveField } from "../primitive-field/primitive-field.js";

/**
 * Component for rendering nested object structures.
 * Recursively creates fields for object properties and handles adding new properties.
 */
export class ObjectField implements Component {
  /** The parent DOM element where this component will be mounted. */
  rootElement: HTMLElement;
  /** The main DOM element of this component. */
  componentElement: HTMLElement;
  /** Container for the list of fields. */
  private fieldsContainer!: HTMLElement;

  /**
   * Creates an instance of ObjectField.
   * @param rootElement - The container element.
   * @param data - The object data to edit.
   * @param onChange - Callback when any property changes.
   * @param isFixedStructure - If true, properties cannot be added or removed.
   */
  constructor(
    rootElement: HTMLElement,
    private data: any,
    private onChange: () => void,
    private isFixedStructure: boolean
  ) {
    this.rootElement = rootElement;
    if (!this.rootElement) throw new Error("rootElement is required");
    this.componentElement = createElementWithClasses("div", ["nested-group"]);
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
   * Renders the nested group and the list of properties.
   * Also renders the "Add Property" component if structure is not fixed.
   */
  render() {
    this.fieldsContainer = createElementWithClasses("div", [
      "fields-container",
    ]);
    this.componentElement.appendChild(this.fieldsContainer);

    this.renderFieldsList();

    if (!this.isFixedStructure) {
      this.renderAddField();
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
   * Renders the list of all fields in the data object.
   */
  private renderFieldsList() {
    this.fieldsContainer.innerHTML = "";
    Object.keys(this.data).forEach((key) => {
      this.renderFieldRow(key);
    });
  }

  /**
   * Renders the "Add Property" component.
   */
  private renderAddField() {
    new AddField(
      this.componentElement,
      (key: string, initialValue: any) => {
        if (key in this.data) {
          alert("Property already exists");
          return false;
        }

        this.data[key] = initialValue;
        this.onChange();
        this.renderFieldsList();
        return true;
      },
      "New property name",
      "string" // Enforce string type
    );
  }

  /**
   * Renders a single field row (label, remove button, and input).
   * @param key - The property name.
   */
  private renderFieldRow(key: string) {
    const fieldContainer = createElementWithClasses("div", ["form-field"]);

    // Header with Label and Remove Button
    const header = this.createHeader(key);
    fieldContainer.appendChild(header);

    // Value Field (Primitive Only)
    new PrimitiveField(fieldContainer, this.data[key], (newVal) => {
      this.data[key] = newVal;
      this.onChange();
    });

    this.fieldsContainer.appendChild(fieldContainer);
  }

  /**
   * Creates the header element for a field row.
   * @param key - The property name.
   */
  private createHeader(key: string): HTMLElement {
    const header = createElementWithClasses("div", ["form-field__header"]);
    const label = document.createElement("label");
    label.textContent = key;
    label.classList.add("form-field__label");
    header.appendChild(label);

    if (!this.isFixedStructure) {
      const removeButton = this.createRemoveButton(key);
      header.appendChild(removeButton);
    }

    return header;
  }

  /**
   * Creates a remove button for a field.
   * @param key - The property name to remove.
   */
  private createRemoveButton(key: string): HTMLElement {
    const removeButton = createElementWithClasses("button", [
      "delete-button",
      "base-button",
    ]);
    removeButton.textContent = "Remove Field";
    removeButton.title = "Remove Field";
    removeButton.addEventListener("click", () => {
      delete this.data[key];
      this.onChange();
      this.renderFieldsList();
    });
    return removeButton;
  }
}
