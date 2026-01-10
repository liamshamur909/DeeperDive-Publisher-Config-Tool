import { Component } from "../../shared/interfaces.js";
import { createElementWithClasses } from "../../shared/utils.js";
import { diffLines, Change } from "diff";
import { DiffType } from "../../shared/enums.js";
import { api } from "../../index.js";

/**
 * A modal component that compares two configuration objects and displays the differences.
 */
export class CompareConfiguration implements Component {
  rootElement: HTMLElement;
  componentElement: HTMLElement;
  baseConfig: any; // The config to compare AGAINST (left side)
  currentConfig: any; // The current edits (right side)
  filename: string;
  availableVersions: number[] = [];

  constructor(
    rootElement: HTMLElement,
    baseConfig: any,
    currentConfig: any,
    filename: string
  ) {
    this.rootElement = rootElement;
    this.baseConfig = baseConfig;
    this.currentConfig = currentConfig;
    this.filename = filename;

    // Create the main modal container immediately so it can be mounted
    this.componentElement = createElementWithClasses("div", [
      "compare-modal-overlay",
    ]);

    this.init();
  }

  private init() {
    this.render();
    this.mount();
    this.loadVersions();
  }

  render() {
    this.componentElement.innerHTML = `
      <div class="compare-modal">
        <header class="compare-modal__header">
          <h2 class="compare-modal__title">Configuration Comparison</h2>
          <div class="compare-modal__controls">
             <label for="version-select">Compare against:</label>
             <select id="version-select" class="version-select">
               <option value="current">Current Saved (Original)</option>
             </select>
          </div>
        </header>
        
        <div class="compare-modal__content">
           <div id="diff-view" class="diff-view"></div>
        </div>
        
        <footer class="compare-modal__footer">
          <button class="compare-modal__btn base-button" id="modal-close-btn">Close</button>
        </footer>
      </div>
    `;

    this.renderDiffs();
    this.attachEvents();
  }

  mount() {
    this.rootElement.appendChild(this.componentElement);
    // Force reflow for transition
    this.componentElement.getBoundingClientRect();
    this.componentElement.classList.add("open");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }

  attachEvents() {
    const footerCloseBtn =
      this.componentElement.querySelector("#modal-close-btn");
    const overlay = this.componentElement;
    const versionSelect =
      this.componentElement.querySelector("#version-select");

    const closeHandler = () => this.destroy();

    footerCloseBtn?.addEventListener("click", closeHandler);

    // Close when clicking outside the modal content (on the overlay)
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeHandler();
      }
    });

    versionSelect?.addEventListener("change", (e) => {
      const target = e.target as HTMLSelectElement;
      this.handleVersionChange(target.value);
    });
  }

  destroy() {
    this.componentElement.classList.remove("open");
    document.body.style.overflow = ""; // Restore scrolling

    // Wait for transition to finish before removing
    setTimeout(() => {
      this.componentElement.remove();
    }, 300);
  }

  /**
   * Fetches the list of available versions for the current file.
   */
  private async loadVersions() {
    try {
      if (!this.filename) return;
      const res = await api.get(`/api/publisher/${this.filename}/versions`);

      if (res.ok) {
        const versions = await res.json();
        if (Array.isArray(versions)) {
          if (versions.length > 0) {
            versions.shift();
          }
          this.availableVersions = versions;
          this.updateVersionSelect();
        }
      }
    } catch (error) {
      console.error("Failed to load versions", error);
    }
  }

  /**
   * Updates the dropdown with available versions.
   */
  private updateVersionSelect() {
    const select = this.componentElement.querySelector(
      "#version-select"
    ) as HTMLSelectElement;
    if (!select) return;

    // Keep the "current" option
    select.innerHTML = `<option value="current">Current Saved (Original)</option>`;

    this.availableVersions.forEach((v) => {
      const option = document.createElement("option");
      option.value = v.toString();
      option.textContent = `Version ${v}`;
      select.appendChild(option);
    });
  }

  /**
   * Handles version selection changes.
   */
  private async handleVersionChange(version: string) {
    if (version === "current") {
      try {
        const res = await api.get(`/api/publisher/${this.filename}`);
        this.baseConfig = await res.json();
        this.renderDiffs();
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        const res = await api.get(
          `/api/publisher/${this.filename}/versions/${version}`
        );
        if (res.ok) {
          this.baseConfig = await res.json();
          this.renderDiffs();
        }
      } catch (error) {
        console.error("Failed to load version content", error);
      }
    }
  }

  /**
   * Generates and renders the unified diff view using the 'diff' library.
   */
  private renderDiffs() {
    const diffContainer = this.componentElement.querySelector("#diff-view");
    if (!diffContainer) return;

    const oldText = JSON.stringify(this.baseConfig, null, 2);
    const newText = JSON.stringify(this.currentConfig, null, 2);

    const diffs: Change[] = diffLines(oldText, newText);
    const diffHtml = this.createDiffHtml(diffs);

    diffContainer.innerHTML = diffHtml;
  }

  /**
   * Creates the HTML string for the diff view.
   */
  private createDiffHtml(diffs: Change[]): string {
    let diffHtml = "";

    // Track line numbers
    let oldLineNum = 1;
    let newLineNum = 1;

    diffs.forEach((part) => {
      // part.value might contain multiple lines
      const lines = part.value.replace(/\n$/, "").split("\n");
      const type = part.added
        ? DiffType.ADDED
        : part.removed
        ? DiffType.REMOVED
        : DiffType.UNCHANGED;
      const contentPrefix = part.added ? "+ " : part.removed ? "- " : "  ";

      lines.forEach((line) => {
        let lineNumDisplay = "";

        if (part.added) {
          lineNumDisplay = `${newLineNum++}`;
        } else if (part.removed) {
          lineNumDisplay = `${oldLineNum++}`;
        } else {
          lineNumDisplay = `${oldLineNum++}  ${newLineNum++}`;
        }

        const escapedContent = line
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        diffHtml += `
          <div class="diff-line ${type}">
            <div class="diff-line__number">${contentPrefix}</div>
            <div class="diff-line__content">${escapedContent}</div>
          </div>
        `;
      });
    });

    return diffHtml;
  }
}
