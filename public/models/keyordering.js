/*
 * Used to order a set of keys [0..n)
 */
class KeyOrdering {
  // The array containing index-to-key mappings
  #array;

  // The maximum number of keys in the ordering
  #size;

  /*
   * @param n - the number of keys in the ordering
   * @requires n > 0
   * @throws Error if n <= 0
   */
  constructor(n) {
    if (n <= 0) {
      throw new Error('n is <= 0');
    }

    this.#array = [];
    this.#size = n;

    for (let i = 0; i < n; i++) {
      this.#array.push(null);
    }
  }

  /*
   * @param i - the index to get the key of
   * @returns the key at this index in the ordering
   * @requires i >= 0 and i < size()
   * @throws Error if i < 0 or i >= size(), or if the index has not been mapped
   */
  getBarKey(i) {
    if (i < 0) {
      throw new Error('i < 0');
    }
    
    if (i >= this.#size) {
      throw new Error('i >= size');
    }

    if (!this.#array[i]) {
      throw new Error('The index i has not been mapped!');
    }

    return this.#array[i];
  }

  /*
   * @param i - the index to set the key for
   * @param key - the key to tie to the given index
   * @requires i >= 0 and i < size() and key is not falsy
   * @throws Error if i < 0 or i >= size() or key is falsy
   */
  setBarKey(i, key) {
    if (i < 0) {
      throw new Error('i < 0');
    }
    
    if (i >= this.#size) {
      throw new Error('i >= size');
    }

    if (!key) {
      throw new Error('Key is falsy!');
    }

    this.#array[i] = key;
  }

  /*
   * @return the number of keys which can be ordered
   */
  size() {
    return this.#size;
  }
}