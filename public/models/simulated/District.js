/*
 * Represents an electoral district
 */
class District {
  // The district number
  #number;

  /*
   * @param number - the district number
   * @requires number >= 1
   */
  constructor(number) {
    this.#number = number;
  }

  /*
   * @return the district number
   */
  getDistrictNumber() {
    return this.#number;
  }
}