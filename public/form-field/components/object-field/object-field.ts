import { Component } from "../../../interfaces.js";
import { createElementWithClasses } from "../../../utils.js";
import { AddField } from "../../../add-field/add-field.js";

// Factory for creating child FormFields to avoid circular dependency
export type FormFieldFactory = (
  container: HTMLElement,
  data: any,
  key: string | number,
  onChange: () => void,
  onRemove?: () => void,
  isFixedStructure?: boolean
) => void;

/**
 * Component for rendering nested object structures.
 * Recursively creates fields for object properties and handles adding new properties.
 */
export class ObjectField implements Component {
  /** The parent DOM element where this component will be mounted. */
  rootElement: HTMLElement;
  /** The main DOM element of this component. */
  componentElement: HTMLElement;

  /**
   * Creates an instance of ObjectField.
   * @param rootElement - The container element.
   * @param data - The object data to edit.
   * @param onChange - Callback when any property changes.
   * @param fieldFactory - Factory function to create recursive form fields.
   * @param isFixedStructure - If true, properties cannot be added or removed.
   */
  constructor(
    rootElement: HTMLElement,
    private data: any,
    private onChange: () => void,
    private fieldFactory: FormFieldFactory,
    private isFixedStructure: boolean
  ) {
    this.rootElement = rootElement;
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
    const fieldsContainer = createElementWithClasses("div", [
      "fields-container",
    ]);
    this.componentElement.appendChild(fieldsContainer);

    const renderFields = () => {
      fieldsContainer.innerHTML = "";
      Object.keys(this.data).forEach((k) => {
        const onRemoveCallback = this.isFixedStructure
          ? undefined
          : () => {
              delete this.data[k];
              this.onChange();
              renderFields();
            };

        this.fieldFactory(
          fieldsContainer,
          this.data,
          k,
          this.onChange,
          onRemoveCallback,
          this.isFixedStructure
        );
      });
    };

    renderFields();

    if (!this.isFixedStructure) {
      new AddField(
        this.componentElement,
        (key: string, initialValue: any) => {
          if (key in this.data) {
            alert("Property already exists");
            return false;
          }

          this.data[key] = initialValue;
          this.onChange();
          renderFields();
          return true;
        },
        "New property name"
      );
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
}
