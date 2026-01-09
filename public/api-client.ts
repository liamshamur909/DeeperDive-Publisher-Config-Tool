import { Loader } from "./loader/loader.js";

const loader = new Loader(document.body);

const request = async (
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> => {
  loader.show();
  try {
    const response = await fetch(input, init);
    return response;
  } finally {
    loader.hide();
  }
};

export const api = {
  get: (url: string, init?: RequestInit) =>
    request(url, { ...init, method: "GET" }),
  post: (url: string, body: any, init?: RequestInit) =>
    request(url, {
      ...init,
      method: "POST",
      headers: { "Content-Type": "application/json", ...init?.headers },
      body: JSON.stringify(body),
    }),
  put: (url: string, body: any, init?: RequestInit) =>
    request(url, {
      ...init,
      method: "PUT",
      headers: { "Content-Type": "application/json", ...init?.headers },
      body: JSON.stringify(body),
    }),
  delete: (url: string, init?: RequestInit) =>
    request(url, { ...init, method: "DELETE" }),
};
