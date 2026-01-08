import { navigateToPublishers } from "../index.js";
import { FormField } from "../form-field/form-field.js";
import { Component } from "../interfaces.js";
import { createElementWithClasses } from "../utils.js";
import { AddField } from "../add-field/add-field.js";

/**
 * Represents the configuration for a specific page within a publisher's setup.
 */
interface PageConfig {
  pageType: string;
  selector: string;
  position: string;
}

/**
 * Represents the full configuration object for a publisher.
 */
interface PublisherConfig {
  publisherId: string;
  aliasName: string;
  pages: PageConfig[];
  publisherDashboard: string;
  monitorDashboard: string;
  qaStatusDashboard: string;
  [key: string]: any;
}

/** List of keys that are considered mandatory for the configuration. */
const requiredFields = [
  "publisherId",
  "aliasName",
  "pages",
  "publisherDashboard",
  "monitorDashboard",
  "qaStatusDashboard",
];

/**
 * Component responsible for editing the configuration of a specific publisher.
 * Provides a form interface for editing and a JSON preview.
 */
export class PublisherConfiguration implements Component {
  /** The parent DOM element where this component will be mounted. */
  rootElement: HTMLElement;

  /** The main DOM element of this component. */
  componentElement: HTMLElement;

  /** The current Publisher configuration object being edited. */
  publisherConfig: PublisherConfig | null = null;

  /** The name of the file currently being edited, used for saving/downloading. */
  currentFilename: string = "";

  /**
   * Creates an instance of the PublisherConfiguration component.
   * @param rootId - The ID of the HTML element to mount this component into.
   * @param filename - The name of the configuration file to load.
   */
  constructor(rootId: string, filename: string) {
    const el = document.getElementById(rootId);
    if (!el) throw new Error(`Element with id "${rootId}" not found`);
    this.rootElement = el;
    this.componentElement = createElementWithClasses("div", [
      "publisher-config-component",
    ]);

    this.currentFilename = filename;

    this.init(filename);
  }

  /**
   * Initializes the component by loading data, rendering, and mounting.
   * @param filename - The file to load.
   */
  private async init(filename: string) {
    await this.loadData(filename);

    // render after data loaded
    this.render();
    this.mount();
  }

  /**
   * Renders the component's HTML structure, including controls, form container, and JSON display.
   */
  render() {
    this.componentElement.innerHTML = `
      <div class="controls">
        <button id="back-button" class="back-button base-button">Back</button>
        <button id="save-button" class="save-button base-button">Save & Validate</button>
        <button id="download-button" class="download-button base-button">Download JSON</button>
      </div>
      <div id="status-msg" class="status-msg"></div>
      <div class="content-wrapper">
        <div id="form-container" class="form-container"></div>
        <pre id="json-display" class="json-display"></pre>
      </div>
    `;

    if (this.publisherConfig) {
      this.generateForm(this.publisherConfig);
      this.updateJsonDisplay();
    }
    this.attachEvents();
  }

  /**
   * Appends the component's element to the root element.
   */
  mount() {
    // Add the component to the father element
    this.rootElement.appendChild(this.componentElement);
  }

  /**
   * Attaches event listeners to the control buttons (Back, Save, Download).
   */
  attachEvents() {
    const backButton = this.componentElement.querySelector("#back-button");
    if (backButton) {
      backButton.addEventListener("click", () => this.goBack());
    }

    const saveButton = this.componentElement.querySelector("#save-button");
    if (saveButton) {
      saveButton.addEventListener("click", () => this.saveChanges());
    }

    const downloadButton =
      this.componentElement.querySelector("#download-button");
    if (downloadButton) {
      downloadButton.addEventListener("click", () => this.downloadJson());
    }
  }

  /**
   * Removes the component from the DOM.
   */
  destroy() {
    // Remove content and let browser garbage collect event listeners attached to removed elements
    this.componentElement.remove();
  }

  /**
   * Fetches the configuration data for the specified file from the API.
   * @param filename - The name of the file to fetch.
   */
  private async loadData(filename: string) {
    try {
      const res = await fetch(`/api/publisher/${filename}`);
      if (!res.ok) throw new Error(`Failed to fetch publishers: ${res.status}`);
      const json = await res.json();
      this.publisherConfig = json;
    } catch (error) {
      console.error("Failed to fetch publishers, using fallback data", error);
    }
  }

  /**
   * Generates the HTML container for required fields.
   * @param fields - The configuration object containing the data.
   * @returns The constructed HTML element for required fields.
   */
  private getRequiredFieldsElement(fields: PublisherConfig) {
    const requiredFieldsContainer = createElementWithClasses("div", [
      "required-fields",
    ]);
    requiredFieldsContainer.innerHTML = `
      <h3 class="required-fields__header">
        Required Fields
      </h3>
      <section id="required-fields-section" class="required-fields__form-fields"></section>
    `;

    const requiredFieldsSection = requiredFieldsContainer.querySelector(
      "#required-fields-section"
    ) as HTMLElement;

    requiredFields.forEach((key) => {
      if (key in fields) {
        new FormField(
          requiredFieldsSection,
          fields,
          key,
          () => this.updateJsonDisplay(),
          undefined,
          true // isFixedStructure: true for required fields
        );
      }
    });

    return requiredFieldsContainer;
  }

  /**
   * Generates the HTML container for optional fields.
   * @param fields - The configuration object containing the data.
   * @param optionalFieldsKeys - The list of keys considered optional.
   * @returns The constructed HTML element for optional fields.
   */
  private getOptionalFieldsElement(
    fields: PublisherConfig,
    optionalFieldsKeys: string[]
  ) {
    const optionalFieldsContainer = createElementWithClasses("div", [
      "optional-fields",
    ]);
    optionalFieldsContainer.innerHTML = `
      <h3 class="optional-fields__header">
        Optional Fields
      </h3>
      <section id="optional-fields-section" class="optional-fields__form-fields"></section>
    `;

    const optionalFieldsSection = optionalFieldsContainer.querySelector(
      "#optional-fields-section"
    ) as HTMLElement;

    optionalFieldsKeys.forEach((key) => {
      new FormField(
        optionalFieldsSection,
        fields,
        key,
        () => this.updateJsonDisplay(),
        () => {
          delete fields[key];
          this.render();
        }
      );
    });

    this.createAddFieldUI(optionalFieldsContainer, fields);

    return optionalFieldsContainer;
  }

  /**
   * Creates the UI for adding a new optional field.
   * @param container - The parent element to mount the add field component.
   * @param fields - The configuration object to add the field to.
   */
  private createAddFieldUI(container: HTMLElement, fields: PublisherConfig) {
    new AddField(
      container,
      (key: string, initialValue: any) => {
        if (key in fields) {
          alert("Field already exists");
          return false;
        }
        if (requiredFields.includes(key)) {
          alert("Cannot add a required field manually");
          return false;
        }

        fields[key] = initialValue;
        this.render();
        return true;
      },
      "Enter new field name"
    );
  }

  /**
   * Orchestrates the generation of the entire form, splitting it into required and optional sections.
   * @param fields - The configuration object to generate the form for.
   */
  private generateForm(fields: PublisherConfig) {
    const formContainer = this.componentElement.querySelector(
      "#form-container"
    ) as HTMLElement;

    const requiredFieldsElement = this.getRequiredFieldsElement(fields);
    formContainer.appendChild(requiredFieldsElement);

    const optionalFields = Object.keys(fields).filter(
      (key) => !requiredFields.includes(key)
    );

    const divider = createElementWithClasses("div", ["divider"]);
    formContainer.appendChild(divider);

    const optionalFieldsElement = this.getOptionalFieldsElement(
      fields,
      optionalFields
    );
    formContainer.appendChild(optionalFieldsElement);
  }

  /**
   * Updates the JSON preview area with the current state of the configuration object.
   */
  private updateJsonDisplay() {
    const pre = this.componentElement.querySelector("#json-display");
    if (pre) {
      pre.textContent = JSON.stringify(this.publisherConfig, null, 2);
    }
  }

  /**
   * Navigates back to the main publishers list.
   */
  private goBack() {
    navigateToPublishers();
  }

  /**
   * Simulates saving the changes (currently just logs to console and shows a status message).
   */
  private saveChanges() {
    const statusMsg = this.componentElement.querySelector(
      "#status-msg"
    ) as HTMLElement;
    // Data is already updated in this.publisherConfig via event listeners
    console.log("Saving config:", this.publisherConfig);
    statusMsg.textContent = "Configuration saved successfully!";
    statusMsg.style.color = "green";
  }

  /**
   * Triggers a browser download of the current configuration as a JSON file.
   */
  private downloadJson() {
    if (!this.publisherConfig) return;
    const blob = new Blob([JSON.stringify(this.publisherConfig, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = this.currentFilename || "publisher-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
