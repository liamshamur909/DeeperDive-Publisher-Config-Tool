/**
 * Supported field types for the configuration form.
 */
export enum FieldType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  ARRAY = "array",
  OBJECT = "object",
}

/**
 * Types of snackbar notifications.
 */
export enum SnackbarType {
  SUCCESS = "success",
  ERROR = "error",
  INFO = "info",
}

/**
 * Standard HTTP methods used in API requests.
 */
export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}
