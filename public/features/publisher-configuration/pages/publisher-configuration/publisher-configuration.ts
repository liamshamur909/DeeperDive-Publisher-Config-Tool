import { navigateToPublishers } from "../../../../index.js";
import { Snackbar } from "../../../../shared/components/snackbar/snackbar.js";
import { api } from "../../../../shared/api-client.js";
import { SnackbarType } from "../../../../shared/enums.js";
import { FormField } from "../../components/form-field/form-field.js";
import { Component } from "../../../../shared/interfaces.js";
import { createElementWithClasses } from "../../../../shared/utils.js";
import { AddField } from "../../components/add-field/add-field.js";
import { CompareConfiguration } from "../../../compare-configuration/modals/compare-configuration/compare-configuration.js";
import { AreYouSure } from "../../../../shared/modals/are-you-sure/are-you-sure.js";

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

  /** Deep copy of the initial configuration for change detection. */
  initialConfig: PublisherConfig | null = null;

  /**
   * Creates an instance of the PublisherConfiguration component.
   * @param rootElement - The HTML element to mount this component into.
   * @param filename - The name of the configuration file to load.
   */
  constructor(rootElement: HTMLElement, filename: string) {
    this.rootElement = rootElement;
    if (!this.rootElement) throw new Error("rootElement is required");
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
        <button id="save-button" class="save-button base-button">Save Changes</button>
        <button id="compare-button" class="compare-button base-button">Version Compare</button>
        <button id="download-button" class="download-button base-button">Download JSON</button>
      </div>
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

    const compareButton =
      this.componentElement.querySelector("#compare-button");
    if (compareButton) {
      compareButton.addEventListener("click", () => this.openCompareModal());
    }
  }

  /**
   * Removes the component from the DOM.
   */
  destroy() {
    this.componentElement.remove();
  }

  /**
   * Fetches the configuration data for the specified file from the API.
   * @param filename - The name of the file to fetch.
   */
  private async loadData(filename: string) {
    try {
      const res = await api.get(`/api/publisher/${filename}`);
      if (!res.ok) throw new Error(`Failed to fetch publishers: ${res.status}`);
      const json = await res.json();
      this.publisherConfig = json;
      this.initialConfig = JSON.parse(JSON.stringify(json));
    } catch (error) {
      console.error("Failed to fetch publishers, using fallback data", error);
      new Snackbar("Failed to fetch publishers", SnackbarType.ERROR);
    }
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
          new Snackbar("Field already exists", SnackbarType.ERROR);
          return false;
        }
        if (requiredFields.includes(key)) {
          new Snackbar(
            "Cannot add a required field manually",
            SnackbarType.ERROR
          );
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
   * Navigates back to the main publishers list.
   */
  private goBack() {
    navigateToPublishers();
  }

  /**
   * Simulates saving the changes (currently just logs to console and shows a status message).
   */
  private async saveChanges() {
    if (
      JSON.stringify(this.publisherConfig) ===
      JSON.stringify(this.initialConfig)
    ) {
      new Snackbar("No changes were made", SnackbarType.INFO);
      return;
    }

    const handleSave = async () => {
      try {
        const res = await api.put(
          `/api/publisher/${this.currentFilename}`,
          this.publisherConfig
        );

        if (!res.ok) throw new Error("Failed to save");

        this.initialConfig = JSON.parse(JSON.stringify(this.publisherConfig));
        new Snackbar("Configuration saved successfully!", SnackbarType.SUCCESS);
      } catch (error) {
        console.error("Save failed", error);
        new Snackbar("Failed to save configuration.", SnackbarType.ERROR);
      }
    };

    new AreYouSure(document.body, handleSave);
  }

  /**
   * Opens the comparison modal to show differences between the initial and current configuration.
   */
  private openCompareModal() {
    new CompareConfiguration(
      document.body, // Mount to body to overlay everything
      this.initialConfig,
      this.publisherConfig,
      this.currentFilename // Pass filename to fetch versions
    );
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
