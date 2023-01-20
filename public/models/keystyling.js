/*
 * Used to map keys to CSS class names
 */
class KeyStyling {
  // The map containing key -> class mappings
  #map;

  /*
   * @effects creates a new empty key styling
   */
  constructor() {
    this.#map = new Map();
  }

  /*
   * @param key - the key to check existence of
   * @return true if the key exists in the styling set, false otherwise
   * @requires key != falsy and is comparable with ===
   * @throws Error if key is not valid
   */
  hasMapping(key) {
    if (!key) {
      throw new Error('Key is falsy!');
    }

    return this.#map.has(key);
  }

  /*
   * @param key - the key to add a mapping for
   * @param class_name - the CSS class name to tie to the key
   * @effects maps the given key to the given class name and replaces the mapping if
   * it one already exists
   * @requires key != falsy and is comparable with === and for class_name to be a string
   * @throws Error if key is not valid or class_name is not valid
   */
  setMapping(key, class_name) {
    if (!key) {
      throw new Error('Key is falsy!');
    }

    if (!class_name) {
      throw new Error('Class name is falsy!');
    }

    this.#map.set(key, class_name);
  }

  /*
   * @param key - the key to get the class name mapping for
   * @return the class name for the given key, or undefined if no mapping exists
   * @requires key != falsy and is comparable with ===
   * @throws Error if key is not valid
   */
  getClassName(key) {
    if (!key) {
      throw new Error('Key is falsy!');
    }

    return this.#map.get(key);
  }
}