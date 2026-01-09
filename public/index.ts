import { Publishers } from "./publishers/publishers.js";
import { PublisherConfiguration } from "./publisher-configuration/publisher-configuration.js";
import { Snackbar } from "./snackbar/snackbar.js";
export { api } from "./api-client.js";

const appElement = document.getElementById("app");

/**
 * Navigates to the Publishers list view.
 * Clears the current app content and initializes the Publishers component.
 */
export function navigateToPublishers() {
  if (appElement) {
    appElement.innerHTML = "";
    new Publishers(appElement);
  } else {
    console.error("App element not found");
  }
}

/**
 * Navigates to the Publisher Configuration view for a specific file.
 * Clears the current app content and initializes the PublisherConfiguration component.
 *
 * @param filename - The name of the configuration file to load.
 */
export function navigateToPublisherConfigurations(filename: string) {
  if (appElement) {
    appElement.innerHTML = "";
    new PublisherConfiguration(appElement, filename);
  } else {
    console.error("App element not found");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  navigateToPublishers();
});

const appSnackbar = new Snackbar(document.body);

export function showToast(
  message: string,
  type: "success" | "error" | "info" = "info"
) {
  appSnackbar.show(message, type);
}
