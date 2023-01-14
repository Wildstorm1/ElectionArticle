/*
 * Represents a tooltip GUI which has a pointer added to it to point at the mouse
 */
class PointedTooltipContainer {
  // The correction factor in pixels to make the tooltip float below the cursor
  static #cursor_factor = 30;

  // The tag to include in the elements styling class
  #style_class;

  // The top level HTML DOM element containing the tooltip elements
  #root;

  // The pointer DOM element
  #pointer;

  // The measured width of the tooltip with its contents in pixels
  #width;

  // An object wrapping the contents of the tooltip
  #contents;

  /*
   * @param parent - the HTML DOM element to attach the tooltip to
   * @param contents - the tooltip GUI object which should be displayed
   * @param style_class - the styling class to tag the HTML elements with
   * @requires - the parent DOM element should be a div wrapping everything the tooltip
   * can hover over
   */
  constructor(parent, contents, style_class) {
    this.#contents = contents;
    this.#style_class = style_class;

    this.#root = parent.append('div')
      .attr('class', `${this.#style_class}_root_visible`);

    this.#pointer = this.#root.append('div')
      .attr('class', `${this.#style_class}_div_pointer`);

    let body = this.#root.append('div')
      .attr('class', `${this.#style_class}_div_wrapper`);

    contents.attach(body);
    this.hideTooltip();
  }

  /*
   * @effects - makes the tooltip to be visible on the webpage
   */
  showTooltip() {
    this.#root.attr('class', `${this.#style_class}_root_visible`);
  }

  /*
   * @effects - hides the tooltip from being visible on the webpage
   */
  hideTooltip() {
    this.#root.attr('class', `${this.#style_class}_root_invisible`);
  }

  /*
   * @param pageX - the x position on the page to move the tooltip to in pixels
   * @param pageY - the y position on the page to move the tooltip to in pixels
   * @requires update to have been called before this if changes are to be incorporated (TODO?)
   */
  updatePosition(pageX, pageY) {
    this.#root.style('left', `${ pageX - (this.#width / 2) }px`)
      .style('top', `${ pageY + PointedTooltipContainer.#cursor_factor }px`);
  }

  /*
   * @param data - an object containing data to update the tooltip with
   * @requires the data object to be appropriate for the tooltip contents
   */
  update(data) {
    this.#contents.update(data);

    let measures = this.#root.node().getBoundingClientRect();
    this.#width = measures.width;

    // The 20 comes from the width of the pointer, the 6 is the shadow width
    this.#pointer.style('left', `${ (this.#width - Math.sqrt(2) * 20) / 2 + 6 }px`)
      .style('top', `${ -(Math.sqrt(2) * 20) / 2 + 6 }px`);
  }
}