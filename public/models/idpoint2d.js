/*
 * The data-model for a single 2D cartesian point with an associated identifier
 */
class IdPoint2D {
  // Number of columns in the grid
  #x;

  // Number of row in the grid
  #y;

  // 2D array of cell ids
  #id;

  /*
   * @param x - the x coordinate of the point
   * @param y - the y coordinate of the point
   * @param id - the id value attached to the point
   */
  constructor(x, y, id) {
    this.#x = x;
    this.#y = y;
    this.#id = id;
  }

  /*
   * @returns the x coordinate of the point
   */
  getX() {
    return this.#x;
  }

  /*
   * @returns the y coordinate of the point
   */
  getY() {
    return this.#y;
  }

  /*
   * @returns the id value attached to the point
   */
  getId() {
    return this.#id;
  }

  /*
   * @returns a new point which is an identical copy of the point object
   */
  copy() {
    return new IdPoint2D(this.#x, this.#y, this.#id);
  }
}