import { Publishers } from "./publishers/publishers.js";
import { PublisherConfiguration } from "./publisher-configuration/publisher-configuration.js";

// The main application container element.
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

// Initialize the application by loading the Publishers view when the DOM is ready.
document.addEventListener("DOMContentLoaded", () => {
  navigateToPublishers();
});
