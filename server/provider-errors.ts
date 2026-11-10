/** A provider responded, but its structured result cannot be used safely. */
export class ProviderResponseError extends Error {
  name = "ProviderResponseError";
  constructor() {
    super("Provider returned an unusable response.");
  }
}
