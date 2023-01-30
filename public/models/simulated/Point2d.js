/*
 * Represents a point on a 2D plane
 */
class Point2d {
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
   * @return the x position of the point
   */
  getX() {
    return this.#x;
  }

  /*
   * @return the y position of the point
   */
  getY() {
    return this.#y;
  }
}