import { Loader } from "../components/loader/loader.js";
import { HttpMethod } from "./enums.js";

const loader = new Loader(document.body);

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

export const api = {
  get: (url: string, init?: RequestInit) =>
    request(url, { ...init, method: HttpMethod.GET }),
  post: (url: string, body: any, init?: RequestInit) =>
    request(url, {
      ...init,
      method: HttpMethod.POST,
      headers: { "Content-Type": "application/json", ...init?.headers },
      body: JSON.stringify(body),
    }),
  put: (url: string, body: any, init?: RequestInit) =>
    request(url, {
      ...init,
      method: HttpMethod.PUT,
      headers: { "Content-Type": "application/json", ...init?.headers },
      body: JSON.stringify(body),
    }),
  delete: (url: string, init?: RequestInit) =>
    request(url, { ...init, method: HttpMethod.DELETE }),
};
