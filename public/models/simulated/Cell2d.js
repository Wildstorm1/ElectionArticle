/*
 * Represents a change in a 2d grid cell
 */
class Cell2d {
  // The row the cell is in
  #i;

  // The column the cell is in
  #j;

  // The district the cell belongs to
  #district;

  /*
   * @param i - the row the cell is in
   * @param j - the column the cell is in
   * @param district - the district the cell is a member of
   */
  constructor(i, j, district) {
    this.#i = i;
    this.#j = j;
    this.#district = district;
  }

  /*
   * @return the row the cell is in
   */
  getRow() {
    return this.#i;
  }

  /*
   * @return the column the cell is in
   */
  getColumn() {
    return this.#j;
  }

  /*
   * @return the district the cell belongs to
   */
  getDistrict() {
    return this.#district;
  }
}