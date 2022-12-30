/*
 * Models a collection of numeric parts that represent a whole amount
 */
class PartToWhole {
  // A hash table containing the parts
  #partsmap;

  // Records the whole amount stored in the container
  #whole;

  /*
   * Creates a new collection of parts
   */
  constructor() {
    this.#partsmap = new Map();
    this.#whole = 0;
  }

  /*
   * @return the number of parts in the collection
   */
  getNumberOfParts() {
    return this.#partsmap.size;
  }

  /*
   * @return an array containing the keys for the parts in the collection
   */
  getPartKeys() {
    let results = [];
    let keys = this.#partsmap.keys();

    for (const key of keys) {
      results.push(key);
    }

    return results;
  }

  /*
   * @param key - the key to search the collection for
   * @return boolean indicating whether the key exists in the collection
   */
  hasPart(key) {
    return this.#partsmap.has(key);
  }

  /*
   * @param key - the key used to identify the part
   * @param amount - the numeric amount of the part to add to the whole
   * @return the old amount associated with the key if it already exists, null otherwise
   */
  setPart(key, amount) {
    // TODO: the amount should be a number
    let result = null;
  
    if (this.#partsmap.has(key)) {
      result = this.#partsmap.get(key);
      this.#whole = this.#whole - result;
    }

    this.#partsmap.set(key, amount);
    this.#whole = this.#whole + amount;
    return result;
  }

  /*
   * @param key - the key used to identify the part
   * @return the part associated with the key, or null if it does not exist
   */
  getPart(key) {
    let result = null;

    if (this.#partsmap.has(key)) {
      result = this.#partsmap.get(key);
    }

    return result;
  }

  /*
   * @return the whole numeric amount that the parts represent
   */
  getWhole() {
    return this.#whole;
  }
}