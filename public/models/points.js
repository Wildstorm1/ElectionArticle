/*
 * The data-model for a collection of points
 */
class Points {
  // Array backing the collection of points
  #parray;

  /*
   * Creates a new empty point collection
   */
  constructor() {
    this.#parray = [];
  }

  /*
   * @param list - an array of points to add to the collection
   * @returns a new point collection initialized with the copies of the given points
   */
  static new2DPointsFromArray(list) {
    let collection = new Points();

    for (let i = 0; i < list.length; i++) {
      collection.addPoint(list[i].copy());
    }

    return collection;
  }

  /*
   * @param point - a point to add to the collection
   * @effects adds the given point to the collection
   * @requires point to be a valid point object
   * @throws Error if the point is falsy
   */
  addPoint(point) {
    if (!point) {
      throw new Error('Point is falsy!');
    }

    this.#parray.push(point);
  }

  /*
   * @returns an array containing a copy of each point within the collection
   */
  getPointsAsArray() {
    let result = [];

    for (let i = 0; i < this.#parray.length; i++) {
      result.push(this.#parray[i].copy())
    }

    return result;
  }
}