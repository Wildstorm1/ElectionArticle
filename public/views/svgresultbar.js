/*
 * Represents a GUI for a bar which displays a part-to-whole relationship
 */
class SVGResultBar {
  // The width of the bar in pixels
  #width;

  // The height of the bar in pixels
  #height;

  // The tag to include in the SVG elements styling class
  #style_class;

  // An array containing the ordering and percentages being displayed on the bar
  #parray;

  // An array containing references to the SVG elements
  #svg_array;

  // The SVG group containing the elements making up the display
  #svg_group;

  /*
   * @param ordering - an array of { key, amount, percent } objects in the order to render them
   * @effects - draws the given parts onto a full results bar
   */
  #draw(ordering) {
    this.#parray = ordering;
    let offset = 0;

    for (let i = 0; i < this.#parray.length; i++) {
      let part = this.#parray[i];

      let element = this.#svg_group.append('rect')
        .attr('class', `${ this.#style_class }_${ part.key }`)
        .attr('width', this.#width * part.percent)
        .attr('height', this.#height)
        .attr('x', offset);

      this.#svg_array.push(element);
      offset = offset + this.#width * part.percent;
    }
  }

  /*
   * @effects - removes the currently drawn segments from the results bar
   */
  #clear() {
    for (let i = 0; i < this.#svg_array.length; i++) {
      this.#svg_array[i].remove();
    }

    this.#parray = [];
    this.#svg_array = [];
  }

  /*
   * @param width - the width of the bar in pixels
   * @param height - the height of the bar in pixels
   * @param canvas - the SVG DOM element to attach the grid to
   * @param style_class - the styling class to tag the SVG elements with
   */
  constructor(width, height, canvas, style_class) {
    this.#width = width;
    this.#height = height;
    this.#style_class = style_class;
    this.#parray = [];
    this.#svg_array = [];
    this.#svg_group = canvas.append('g');
  }
 
  /*
   * @param partitions - a part-to-whole model holding the distribution which should be displayed
   * @effects - clears and redraws the current bar to reflect the new distribution
   */
  updateBar(partitions) {
    // TODO: Invariants?
    // TODO: This undoes a previous sort
    let ordering = [];
    let keys = partitions.getPartKeys();
    let whole = partitions.getWhole();
    this.#clear();

    for (let i = 0; i < keys.length; i++) {
      let amount = partitions.getPart(keys[i]);
      ordering.push({ key: keys[i], amount: amount, percent: amount / whole });
    }

    this.#draw(ordering);
  }

  /*
   * @param comparator - a sorting comparator function which takes { key, amount, percent } objects to sort
   * @effects - clears and redraws the current bar to reflect the ordering provided by sorting with the given function
   */
  sort(comparator) {
    let ordering = this.#parray;
    this.#clear();
    ordering.sort(comparator);
    this.#draw(ordering);
  }

  /*
   * @param x - the number of pixels to offset the SVG component
   * @param y - the number of pixels to offset the SVG component
   * @effects translates the component to 0, 0 then applies the given offsets
   * @return the result bar to allow for chaining
   */
  translate(x, y) {
    // TODO: invariants
    this.#svg_group.attr('transform', `translate(${x},${y})`);
    return this;
  }
}