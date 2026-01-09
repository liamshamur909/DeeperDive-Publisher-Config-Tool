import { Component } from "../../../interfaces.js";
import { createElementWithClasses } from "../../../utils.js";
import { PrimitiveField } from "../primitive-field/primitive-field.js";
import { ObjectField } from "../object-field/object-field.js";

/**
 * Component for rendering arrays.
 * Handles rendering of list items (primitives or objects) and adding/removing items.
 */
export class ArrayField implements Component {
  /** The parent DOM element where this component will be mounted. */
  rootElement: HTMLElement;
  /** The main DOM element of this component. */
  componentElement: HTMLElement;
  /** Template for new items, ensuring structure persistence. */
  private itemTemplate: any = null;

  /**
   * Creates an instance of ArrayField.
   * @param rootElement - The container element.
   * @param arrayData - The array to edit.
   * @param onChange - Callback when the array changes.
   */
  constructor(
    rootElement: HTMLElement,
    private arrayData: any[],
    private onChange: () => void
  ) {
    this.rootElement = rootElement;
    if (!this.rootElement) throw new Error("rootElement is required");
    this.componentElement = createElementWithClasses("div", [
      "array-container",
    ]);

    if (this.arrayData.length > 0) {
      this.itemTemplate = this.createTemplate(this.arrayData[0]);
    }

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
   * Renders the list of array items and the "Add Item" button.
   */
  private renderArrayItems() {
    this.componentElement.innerHTML = "";

    this.arrayData.forEach((item, index) => {
      this.renderArrayItem(item, index);
    });

    this.renderAddButton();
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
   * Renders the "Add Item" button logic.
   */
  private renderAddButton() {
    const addButton = createElementWithClasses("button", [
      "add-button",
      "base-button",
    ]);
    addButton.textContent = "+ Add Item";
    addButton.addEventListener("click", () => {
      this.handleAddItem();
    });
    this.componentElement.appendChild(addButton);
  }

  /**
   * Renders a nested object item.
   */
  private renderNestedItem(container: HTMLElement, index: number) {
    new ObjectField(
      container,
      this.arrayData[index],
      () => {
        this.onChange();
      },
      true // isFixedStructure = true
    );
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
   * Handles adding a new item to the array.
   */
  private handleAddItem() {
    let newItem: any = "";

    if (this.itemTemplate !== null) {
      if (typeof this.itemTemplate === "object") {
        newItem = JSON.parse(JSON.stringify(this.itemTemplate));
      } else {
        newItem = this.itemTemplate;
      }
    } else if (this.arrayData.length > 0) {
      newItem = this.createTemplate(this.arrayData[this.arrayData.length - 1]);
      this.itemTemplate = newItem;
    }

    this.arrayData.push(newItem);
    this.onChange();
    this.renderArrayItems();
  }

  /**
   * Creates a template from an item, clearing string values.
   */
  private createTemplate(item: any): any {
    if (typeof item === "object" && item !== null) {
      const template: any = {};
      Object.keys(item).forEach((key) => {
        if (typeof item[key] === "object" && item[key] !== null) {
          template[key] = "";
        } else {
          template[key] = "";
        }
      });
      return template;
    }
    return "";
  }
}
