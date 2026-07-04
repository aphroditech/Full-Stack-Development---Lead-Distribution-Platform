/** Application error carrying an HTTP status code and optional machine-readable code. */
export class HttpError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }

  static badRequest(message: string, code?: string) {
    return new HttpError(400, message, code);
  }
  static unauthorized(message = "Unauthorized", code?: string) {
    return new HttpError(401, message, code);
  }
  static forbidden(message = "Forbidden", code?: string) {
    return new HttpError(403, message, code);
  }
  static notFound(message = "Not found", code?: string) {
    return new HttpError(404, message, code);
  }
  static conflict(message: string, code?: string) {
    return new HttpError(409, message, code);
  }
}
