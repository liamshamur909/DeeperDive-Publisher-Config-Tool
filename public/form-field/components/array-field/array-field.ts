import { Component } from "../../../interfaces.js";
import { createElementWithClasses } from "../../../utils.js";
import { PrimitiveField } from "../primitive-field/primitive-field.js";
import { FormFieldFactory } from "../object-field/object-field.js";

/**
 * Component for rendering arrays.
 * Handles rendering of list items (primitives or objects) and adding/removing items.
 */
export class ArrayField implements Component {
  /** The parent DOM element where this component will be mounted. */
  rootElement: HTMLElement;
  /** The main DOM element of this component. */
  componentElement: HTMLElement;

  /**
   * Creates an instance of ArrayField.
   * @param rootElement - The container element.
   * @param arrayData - The array to edit.
   * @param onChange - Callback when the array changes.
   * @param fieldFactory - Factory function for recursive fields (for object items).
   * @param isFixedStructure - If true, structure of object items is fixed (but items can be added/removed).
   */
  constructor(
    rootElement: HTMLElement,
    private arrayData: any[],
    private onChange: () => void,
    private fieldFactory: FormFieldFactory,
    private isFixedStructure: boolean
  ) {
    this.rootElement = rootElement;
    this.componentElement = createElementWithClasses("div", [
      "array-container",
    ]);
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
   * Renders the array component.
   */
  render() {
    this.renderArrayItems();
  }

  /**
   * Renders the list of array items and the "Add Item" button.
   */
  private renderArrayItems() {
    this.componentElement.innerHTML = "";

    // Determine template from the first item if possible (for consistent object structures)
    const itemTemplate = this.getItemTemplate();

    this.arrayData.forEach((item, index) => {
      this.renderArrayItem(item, index);
    });

    this.renderAddButton(itemTemplate);
  }

  /**
   * Gets a template for new items based on existing data.
   */
  private getItemTemplate(): any {
    if (this.arrayData.length > 0) {
      return JSON.parse(JSON.stringify(this.arrayData[0]));
    }
    return null;
  }

  /**
   * Renders a single row in the array.
   * @param item - The item value.
   * @param index - The index of the item.
   */
  private renderArrayItem(item: any, index: number) {
    const itemRow = createElementWithClasses("div", ["array-item"]);
    const contentDiv = createElementWithClasses("div", ["array-item-content"]);

    if (typeof item === "object" && item !== null) {
      this.renderNestedItem(contentDiv, index);
    } else {
      this.renderPrimitiveItem(contentDiv, item, index);
    }

    const deleteButton = this.createDeleteButton(index);
    itemRow.appendChild(contentDiv);
    itemRow.appendChild(deleteButton);
    this.componentElement.appendChild(itemRow);
  }

  /**
   * Renders a nested object item using the field factory.
   */
  private renderNestedItem(container: HTMLElement, index: number) {
    const nestedContainer = createElementWithClasses("div", ["nested-group"]);
    this.fieldFactory(
      nestedContainer,
      this.arrayData,
      index,
      this.onChange,
      undefined, // Array items removals handled by button below
      this.isFixedStructure
    );
    container.appendChild(nestedContainer);
  }

  /**
   * Renders a primitive item using PrimitiveField.
   */
  private renderPrimitiveItem(
    container: HTMLElement,
    item: any,
    index: number
  ) {
    new PrimitiveField(container, item, (val) => {
      this.arrayData[index] = val;
      this.onChange();
    });
  }

  /**
   * Creates the delete button for an item.
   */
  private createDeleteButton(index: number): HTMLElement {
    const deleteButton = createElementWithClasses("button", [
      "delete-button",
      "base-button",
    ]);
    deleteButton.textContent = "Remove Item";
    deleteButton.title = "Remove Item";
    deleteButton.addEventListener("click", () => {
      this.arrayData.splice(index, 1);
      this.onChange();
      this.renderArrayItems();
    });
    return deleteButton;
  }

  /**
   * Renders the "Add Item" button logic.
   * @param itemTemplate - The template to use for new items.
   */
  private renderAddButton(itemTemplate: any) {
    const addButton = createElementWithClasses("button", [
      "add-button",
      "base-button",
    ]);
    addButton.textContent = "+ Add Item";
    addButton.addEventListener("click", () => {
      this.handleAddItem(itemTemplate);
    });
    this.componentElement.appendChild(addButton);
  }

  /**
   * Handles adding a new item to the array.
   */
  private handleAddItem(itemTemplate: any) {
    let newItem: any = "";
    let template = null;

    if (this.arrayData.length > 0) {
      template = this.arrayData[this.arrayData.length - 1]; // Use last item as template if available
    } else if (itemTemplate !== null) {
      template = itemTemplate;
    }

    if (template !== null) {
      newItem = this.generateNewItemFromTemplate(template);
    }

    this.arrayData.push(newItem);
    this.onChange();
    this.renderArrayItems();
  }

  /**
   * Generates a new item value based on the template type.
   */
  private generateNewItemFromTemplate(template: any): any {
    if (typeof template === "object" && template !== null) {
      return JSON.parse(JSON.stringify(template));
    } else if (typeof template === "number") {
      return 0;
    } else if (typeof template === "boolean") {
      return false;
    }
    return "";
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
