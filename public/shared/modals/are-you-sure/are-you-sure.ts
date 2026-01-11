/**
 * Confirmation Modal
 *
 * A reusable modal dialog for confirming destructive actions or unsaved changes.
 * Features:
 * - Custom title and message.
 * - Confirm and Cancel callbacks.
 * - Backdrop click to close.
 */

import { Component } from "../../interfaces.js";
import { createElementWithClasses } from "../../utils.js";

/**
 * A generic "Are You Sure" confirmation modal.
 */
export class AreYouSure implements Component {
  rootElement: HTMLElement;
  componentElement: HTMLElement;
  onConfirm: () => void;
  title: string;
  message: string;

  /**
   * Creates an instance of AreYouSureModal.
   * @param rootElement - The element to append the modal to (usually document.body).
   * @param onConfirm - The function to call when the user confirms.
   * @param title - The title of the modal.
   * @param message - The message body of the modal.
   */
  constructor(
    rootElement: HTMLElement,
    onConfirm: () => void,
    title: string = "Are you sure?",
    message: string = "Do you want to proceed with this action?"
  ) {
    this.rootElement = rootElement;
    this.onConfirm = onConfirm;
    this.title = title;
    this.message = message;

    this.componentElement = createElementWithClasses("div", [
      "are-you-sure-overlay",
    ]);

    this.init();
  }

  private init() {
    this.render();
    this.mount();
  }

  render() {
    this.componentElement.innerHTML = `
      <div class="are-you-sure-modal">
        <h3 class="are-you-sure-modal__header">${this.title}</h3>
        <div class="are-you-sure-modal__content">${this.message}</div>
        <div class="are-you-sure-modal__footer">
          <button class="are-you-sure-modal__btn base-button are-you-sure-modal__btn--cancel" id="ays-cancel-btn">Cancel</button>
          <button class="are-you-sure-modal__btn base-button are-you-sure-modal__btn--confirm" id="ays-confirm-btn">Confirm</button>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  mount() {
    this.rootElement.appendChild(this.componentElement);
    // Force reflow
    this.componentElement.getBoundingClientRect();
    this.componentElement.classList.add("open");
  }

  attachEvents() {
    const cancelBtn = this.componentElement.querySelector("#ays-cancel-btn");
    const confirmBtn = this.componentElement.querySelector("#ays-confirm-btn");
    const overlay = this.componentElement;

    const closeHandler = () => this.destroy();

    cancelBtn?.addEventListener("click", closeHandler);

    confirmBtn?.addEventListener("click", () => {
      this.onConfirm();
      this.destroy();
    });

    // Close on click outside
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeHandler();
      }
    });
  }

  destroy() {
    this.componentElement.classList.remove("open");
    setTimeout(() => {
      this.componentElement.remove();
    }, 300);
  }
}
