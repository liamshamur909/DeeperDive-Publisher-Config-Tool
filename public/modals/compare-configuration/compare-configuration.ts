import { Component } from "../../shared/interfaces.js";
import { createElementWithClasses } from "../../shared/utils.js";
import { diffLines, Change } from "diff";
import { DiffType } from "../../shared/enums.js";

/**
 * A modal component that compares two configuration objects and displays the differences.
 */
export class CompareConfiguration implements Component {
  rootElement: HTMLElement;
  componentElement: HTMLElement;
  oldConfig: any;
  newConfig: any;

  constructor(rootElement: HTMLElement, oldConfig: any, newConfig: any) {
    this.rootElement = rootElement;
    this.oldConfig = oldConfig;
    this.newConfig = newConfig;

    // Create the main modal container immediately so it can be mounted
    this.componentElement = createElementWithClasses("div", [
      "compare-modal-overlay",
    ]);

    this.init();
  }

  private init() {
    this.render();
    this.mount();
  }

  render() {
    this.componentElement.innerHTML = `
      <div class="compare-modal">
        <header class="compare-modal__header">
          <h2 class="compare-modal__title">Configuration Comparison</h2>
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

    const closeHandler = () => this.destroy();

    footerCloseBtn?.addEventListener("click", closeHandler);

    // Close when clicking outside the modal content (on the overlay)
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeHandler();
      }
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
   * Generates and renders the unified diff view using the 'diff' library.
   */
  private renderDiffs() {
    const diffContainer = this.componentElement.querySelector("#diff-view");
    if (!diffContainer) return;

    const oldText = JSON.stringify(this.oldConfig, null, 2);
    const newText = JSON.stringify(this.newConfig, null, 2);

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
