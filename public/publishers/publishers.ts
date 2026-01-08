import { navigateToPublisherConfigurations } from "../index.js";
import { Component } from "../interfaces.js";
import { createElementWithClasses } from "../utils.js";

/**
 * Represents a Publisher entity fetched from the API.
 */
export interface Publisher {
  id: string;
  alias: string;
  file: string;
}

/**
 * Component responsible for displaying the list of publishers in a table format.
 * Allows navigation to the configuration page for each publisher.
 */
export class Publishers implements Component {
  /** The parent DOM element where this component will be mounted. */
  rootElement: HTMLElement;

  /** The main DOM element of this component (the container). */
  componentElement: HTMLElement;

  /** Static headers for the publishers table. */
  readonly tableHeaders = ["ID", "Alias", "Action"];

  /**
   * Creates an instance of the Publishers component.
   * @param rootId - The ID of the HTML element to mount this component into.
   */
  constructor(rootId: string) {
    const el = document.getElementById(rootId);
    if (!el) throw new Error(`Element with id "${rootId}" not found`);
    this.rootElement = el;
    this.componentElement = createElementWithClasses("div", [
      "publishers-component",
    ]);

    this.init();
  }

  /**
   * Initializes the component by rendering it and mounting it to the DOM.
   */
  private async init() {
    this.render();
    this.mount();
  }

  /**
   * Renders the component's HTML structure, including the table skeleton.
   * Triggers the asynchronous loading of table rows.
   */
  render() {
    this.componentElement.innerHTML = `
      <div class="publishers-table" role="table">
        <div class="publishers-table__header" role="row">
          ${this.tableHeaders
            .map(
              (header) =>
                `<div class="publishers-table__cell header" role="columnheader">${header}</div>`
            )
            .join("")}
        </div>
        <div id="publishers-table-body" class="publishers-table__body"></div>
      </div>
    `;

    this.loadTableRows();
    this.attachEvents();
  }

  /**
   * Appends the component's element to the root element.
   */
  mount() {
    this.rootElement.appendChild(this.componentElement);
  }

  /**
   * Attaches necessary event listeners.
   */
  attachEvents() {
    console.log("Publishers event handlers attached");
  }

  /**
   * Removes the component from the DOM.
   */
  destroy() {
    this.componentElement.remove();
  }

  /**
   * Fetches the list of publishers from the API.
   * @returns A promise that resolves to an array of Publisher objects.
   */
  private async getPublishers() {
    try {
      const res = await fetch("/api/publishers");
      if (!res.ok) throw new Error(`Failed to fetch publishers: ${res.status}`);
      const json = await res.json();
      const publishersArray: Publisher[] = Array.isArray(json.publishers)
        ? json.publishers
        : [];
      return publishersArray;
    } catch (error) {
      console.error("Failed to fetch publishers, using fallback data", error);
      return [];
    }
  }

  /**
   * Fetches data and populates the table body with rows.
   */
  private async loadTableRows() {
    // Remove all current rows of the table
    this.componentElement
      .querySelectorAll<HTMLElement>(".publishers-table__row")
      .forEach((row) => row.remove());

    // Fetch publishers
    const publishers = await this.getPublishers();

    // Create the rows based on the publishers array
    const tableBody = document.getElementById("publishers-table-body");
    if (tableBody) {
      publishers.forEach((publisher) => {
        const row = this.createRow(publisher);
        tableBody.appendChild(row);
      });
    }
  }

  /**
   * Creates a DOM element representing a single row in the publishers table.
   * @param publisher - The publisher data to display.
   * @returns The constructed HTML element for the row.
   */
  private createRow(publisher: Publisher): HTMLElement {
    const row = createElementWithClasses("div", ["publishers-table__row"]);
    row.innerHTML = `
      <div class="publishers-table__cell">${publisher.id}</div>
      <div class="publishers-table__cell">${publisher.alias}</div>
      <div class="publishers-table__cell"></div>
    `;

    const button = createElementWithClasses("button", [
      "files-button",
    ]) as HTMLButtonElement;

    button.textContent = "To File";
    button.onclick = () => this.handleToFile(publisher.file);

    row.children[row.children.length - 1].appendChild(button);

    return row;
  }

  /**
   * Handles the click event for the "To File" button.
   * Navigates to the configuration view for the selected file.
   * @param filename - The filename associated with the publisher.
   */
  private handleToFile(filename: string) {
    navigateToPublisherConfigurations(filename);
  }
}
