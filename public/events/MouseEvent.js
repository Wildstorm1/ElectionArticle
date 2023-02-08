/*
 * A mouse event triggered when the mouse moves over the SVG image
 */
class MouseEvent {
  // The district the mouse event was triggered under
  #district;

  // The x position the event was triggered at
  #x_pos;

  // The y position the event was triggered at
  #y_pos;

  /*
   * @param x_pos - the x position of the event
   * @param y_pos - the y position of the event
   * @param district - the district of the event
   */
  constructor(x_pos, y_pos, district) {
    if (!x_pos) {
      throw new Error('x position is falsy!');
    }

    if (!y_pos) {
      throw new Error('y position is falsy!');
    }

    if (!district) {
      throw new Error('district is falsy!');
    }

    this.#district = district;
    this.#x_pos = x_pos;
    this.#y_pos = y_pos;
  }

  /*
   * @return the district the mouse event was triggered on
   */
  getDistrict() {
    return this.#district;
  }

  /*
   * @return the x position the event was triggered at
   */
  getX() {
    return this.#x_pos;
  }

  /*
   * @return the y position the event was triggered at
   */
  getY() {
    return this.#y_pos;
  }
}