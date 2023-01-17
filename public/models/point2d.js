/*
 * The data-model for a single 2D cartesian point
 */
class Point2D {
  // The x coordinate of the point
  #x;

  // The y coordinate of the point
  #y;

  /*
   * @param x - the x coordinate of the point
   * @param y - the y coordinate of the point
   */
  constructor(x, y) {
    this.#x = x;
    this.#y = y;
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
   * @returns a new point which is an identical copy of the point object
   */
  copy() {
    return new Point2D(this.#x, this.#y);
  }
}