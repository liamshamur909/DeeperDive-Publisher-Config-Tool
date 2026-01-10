import { navigateToPublisherConfigurations } from "../../index.js";
import { Snackbar } from "../snackbar/snackbar.js";
import { api } from "../../shared/api-client.js";
import { SnackbarType } from "../../shared/enums.js";
import { Component } from "../../shared/interfaces.js";
import { createElementWithClasses } from "../../shared/utils.js";

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
   * @param rootElement - The HTML element to mount this component into.
   */
  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
    if (!this.rootElement) throw new Error("rootElement is required");
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
  attachEvents() {}

  /**
   * Removes the component from the DOM.
   */
  destroy() {
    this.componentElement.remove();
  }

  /**
   * Fetches data and populates the table body with rows.
   */
  private async loadTableRows() {
    this.componentElement
      .querySelectorAll<HTMLElement>(".publishers-table__row")
      .forEach((row) => row.remove());

    const publishers = await this.getPublishers();

    const tableBody = document.getElementById("publishers-table-body");
    if (tableBody) {
      publishers.forEach((publisher) => {
        const row = this.createRow(publisher);
        tableBody.appendChild(row);
      });
    }
  }

  /**
   * Fetches the list of publishers from the API.
   * @returns A promise that resolves to an array of Publisher objects.
   */
  private async getPublishers() {
    try {
      const res = await api.get("/api/publishers");
      if (!res.ok) throw new Error(`Failed to fetch publishers: ${res.status}`);
      const json = await res.json();
      const publishersArray: Publisher[] = Array.isArray(json.publishers)
        ? json.publishers
        : [];
      return publishersArray;
    } catch (error) {
      console.error("Failed to fetch publishers, using fallback data", error);
      new Snackbar("Failed to fetch publishers", SnackbarType.ERROR);
      return [];
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
      "base-button",
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
