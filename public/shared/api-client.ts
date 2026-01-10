import { Loader } from "./components/loader/loader.js";
import { HttpMethod } from "./enums.js";

/**
 * Global loader instance used for all API requests.
 */
const loader = new Loader(document.body);

/**
 * A wrapper around the `fetch` API that handles loading states.
 *
 * @param input - The resource URL or Request object.
 * @param init - Optional configuration for the request (headers, method, body, etc.).
 * @returns A Promise resolving to the Response object.
 */
const request = async (
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> => {
  loader.mount();
  try {
    const response = await fetch(input, init);
    return response;
  } finally {
    loader.destroy();
  }
};

/**
 * API utility for making HTTP requests.
 * Automatically handles Content-Type for JSON requests and loading indicators.
 */
export const api = {
  /**
   * Performs a GET request.
   * @param url - The endpoint URL.
   * @param init - Optional request configuration.
   */
  get: (url: string, init?: RequestInit) =>
    request(url, { ...init, method: HttpMethod.GET }),

  /**
   * Performs a POST request with JSON body.
   * @param url - The endpoint URL.
   * @param body - The payload to send.
   * @param init - Optional request configuration.
   */
  post: (url: string, body: any, init?: RequestInit) =>
    request(url, {
      ...init,
      method: HttpMethod.POST,
      headers: { "Content-Type": "application/json", ...init?.headers },
      body: JSON.stringify(body),
    }),

  /**
   * Performs a PUT request with JSON body.
   * @param url - The endpoint URL.
   * @param body - The payload to send.
   * @param init - Optional request configuration.
   */
  put: (url: string, body: any, init?: RequestInit) =>
    request(url, {
      ...init,
      method: HttpMethod.PUT,
      headers: { "Content-Type": "application/json", ...init?.headers },
      body: JSON.stringify(body),
    }),

  /**
   * Performs a DELETE request.
   * @param url - The endpoint URL.
   * @param init - Optional request configuration.
   */
  delete: (url: string, init?: RequestInit) =>
    request(url, { ...init, method: HttpMethod.DELETE }),
};
