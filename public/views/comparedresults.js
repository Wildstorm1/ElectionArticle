/*
 * Represents a horizontal bar GUI which displays a part-to-whole relationship
 */
class SVGHorizontalBar {
  // The width of the bar in pixels
  #width;

  // The height of the bar in pixels
  #height;

  // The SVG DOM group element which contains the SVG rect elements
  #svg_group;

  // Array of SVG rect and text elements representing the labeled bars in the GUI
  #svg_bars;

  // Array which contains the specification for the bar (sizes, text, and ordering)
  #bar_spec;

  /*
   * @param canvas - the SVG DOM element to attach the bars to
   * @param bar_width - the width of the bar in pixels
   * @param bar_height - the height of the bar in pixels
   * @requires canvas to be a valid SVG element, bar_width and bar_height > 0
   * @throws Error if canvas is invalid or bar_width / bar_height <= 0
   */
  constructor(canvas, bar_width, bar_height) {
    if (!canvas) {
      throw new Error('Canvas is falsy');
    }

    if (bar_width <= 0) {
      throw new Error('Bar width is <= 0');
    }

    if (bar_height <= 0) {
      throw new Error('Bar height is <= 0');
    }

    this.#width = bar_width;
    this.#height = bar_height;
    this.#svg_bars = [];
    this.#bar_spec = [];
    this.#svg_group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    canvas.appendChild(this.#svg_group);
  }

  /*
   * @effects - removes the currently drawn bar segments
   */
  #clear() {
    for (let i = 0; i < this.#svg_bars.length; i++) {
      this.#svg_bars[i].Parent.remove();
    }

    this.#svg_bars = [];
  }

  /*
   * @param specification - an array of { key, percent, text } objects in the order to render them
   * @effects draws each of the segments given in specification
   */
  #draw(specification) {
    let offset = 0;

    for (let i = 0; i < specification.length; i++) {
      let segment = specification[i];
      let segment_width = this.#width * segment.percent;

      let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', segment_width);
      rect.setAttribute('height', this.#height);
      rect.setAttribute('x', offset);

      let label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', offset + 0.5 * segment_width);
      label.setAttribute('y', 0.5 * this.#height);
      label.textContent = segment.text;

      this.#svg_group.appendChild(g);
      g.appendChild(rect);
      g.appendChild(label);
      this.#svg_bars.push({ Parent: g, Rect: rect, Text: label });

      offset = offset + segment_width;
    }
  }

  /*
   * @param breakdown - a part-to-whole model holding the distribution which should be displayed
   * @effects clears and redraws the current bar to reflect the distribution, any previously applied
   * styling or ordering will be reset. Each bar has text containing the raw value of the bar
   */
  drawBreakdownRaw(breakdown) {
    if (!breakdown) {
      throw new Error('Breakdown is falsy');
    }

    this.#clear();
    
    let bar_keys = breakdown.getPartKeys();
    let whole = breakdown.getWhole();
    let specification = [];

    for (let i = 0; i < bar_keys.length; i++) {
      let key = bar_keys[i];
      let amount = breakdown.getPart(key);
      specification.push({ key: key, percent: amount / whole, text: `${ Math.floor(amount * 10) / 10 }` });
    }

    this.#draw(specification);
    this.#bar_spec = specification;
  }

  /*
   * @param breakdown - a part-to-whole model holding the distribution which should be displayed
   * @effects clears and redraws the current bar to reflect the distribution, any previously applied
   * styling or ordering will be reset. Each bar has text containing the percent value of the bar
   */
  drawBreakdownAsPercents(breakdown) {
    if (!breakdown) {
      throw new Error('Breakdown is falsy');
    }

    this.#clear();

    let bar_keys = breakdown.getPartKeys();
    let whole = breakdown.getWhole();
    let specification = [];

    for (let i = 0; i < bar_keys.length; i++) {
      let key = bar_keys[i];
      let amount = breakdown.getPart(key);
      specification.push({ key: key, percent: amount / whole, text: `${ (Math.floor((amount / whole) * 1000) / 10) }%` });
    }

    this.#draw(specification);
    this.#bar_spec = specification;
  }

  /*
   * @param styling - the styling object used to style individual bar segments
   * @effects obtains the styling class based on the keys tied to each bar
   * @requires styling to be a valid styling object and for keys to match 1-to-1
   * @throws Error if styling is invalid or styling keys do not match 1-to-1
   */
  applyBarStyling(styling) {
    if (!styling) {
      throw new Error('Styling is falsy!');
    }

    for (let i = 0; i < this.#svg_bars.length; i++) {
      let key = this.#bar_spec[i].key;

      if (!styling.hasMapping(key)) {
        throw new Error('Styling does not have mapping for bar key!');
      }

      let class_name = styling.getClassName(key);
      this.#svg_bars[i].Rect.setAttribute('class', class_name);
    }
  }

  /*
   * @param ordering - an ordering object describing the order to render the bars in
   * @effects redraws the bars to be in the given order. this will clear any applied styling
   * @requires ordering to be a valid ordering object and for the order keys to match 1-to-1
   * with breakdown keys
   * @throws Error if ordering is invalid, or ordering keys do not match 1-to-1
   */
  applyBarOrdering(ordering) {
    if (!ordering) {
      throw new Error('Ordering is falsy');
    }

    let map = new Map();

    for (let i = 0; i < this.#bar_spec.length; i++) {
      let segment = this.#bar_spec[i];
      map.set(segment.key, segment);
    }

    if (map.size != ordering.size()) {
      throw new Error('Ordering size does not match number of bar segments');
    }

    let specification = [];

    for (let i = 0; i < this.#bar_spec.length; i++) {
      let key = ordering.getBarKey(i);

      if (!map.has(key)) {
        throw new Error('Bar does not contain key!');
      }

      specification.push(map.get(key));
    }

    this.#clear();
    this.#draw(specification);
    this.#bar_spec = specification;
  }

  /*
   * @param transform - the transform string to apply to the bar
   * @effects applies the given transform string to the bar
   * @requires transform to be a valid transform string
   * @throws Error if transform is invalid
   */
  transform(transform) {
    if (!transform) {
      throw new Error('Transform is falsy!');
    }

    this.#svg_group.setAttribute('transform', transform);
  }
}

/*
 * An SVG image showing a comparison of an elections overall results to its elected delegation
 */
class ComparedResultsView {
  // The bar showing overall election results
  #overall_bar;

  // The cached overall bars styling
  #overall_style;

  // The bar showing the delegation breakdown of the election
  #district_bar;

  // The cached district bars styling
  #district_style;

  /*
   * @param parent_node - the DOM element to attach the SVG visual to
   * @param bar_width - the width of a bar in pixels
   * @param bar_height - the height of a bar in pixels 
   * @param bar_padding - the padding vertically between bars in pixels
   * @requires bar_width, bar_height, bar_padding > 0 and parent_node is a valid node
   * @throws Error if bar_width, bar_height, bar_padding <= 0 or parent_node is invalid
   */
  constructor(parent_node, bar_width, bar_height, bar_padding) {
    if (!parent_node) {
      throw new Error('Parent node is falsy');
    }

    if (bar_width <= 0) {
      throw new Error('');
    }

    if (bar_height <= 0) {
      throw new Error('');
    }

    if (bar_padding <= 0) {
      throw new Error('');
    }

    let width = bar_width;
    let height = 2 * bar_height + bar_padding;

    const svg_canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg_canvas.setAttribute('width', width);
    svg_canvas.setAttribute('height', height);
    parent_node.appendChild(svg_canvas);

    this.#overall_bar = new SVGHorizontalBar(svg_canvas, bar_width, bar_height);
    this.#district_bar = new SVGHorizontalBar(svg_canvas, bar_width, bar_height);
    this.#district_bar.transform(`translate(0,${bar_height + bar_padding})`);
  }

  /*
   * @param results - a part-to-whole relationship to display
   * @return a styling object keyed by party objects mapping class names to party id
   * @requires results to be a valid part-to-whole and for results to be keyed by Party
   * @throws Error if results is invalid
   */
  #getStyleObject(results) {
    if (!results) {
      throw new Error('Results is falsy');
    }

    let keys = results.getPartKeys();
    let styling = new KeyStyling();

    for (let i = 0; i < keys.length; i++) {
      styling.setMapping(keys[i], keys[i].getPartyId());
    }

    return styling;
  }

  /*
   * @param results - a part-to-whole relationship to display
   * @effects updates the overall results bar of the visual to match the given distribution
   * @requires results to be a valid part-to-whole and for results to be keyed by Party
   * @throws Error if results is invalid
   */
  drawOverallResults(results) {
    if (!results) {
      throw new Error('Results is falsy');
    }

    let styling = this.#getStyleObject(results);
    this.#overall_bar.drawBreakdownAsPercents(results);
    this.#overall_bar.applyBarStyling(styling);
    this.#overall_style = styling;
  }

  /*
   * @param results - a part-to-whole relationship to display
   * @effects updates the district results bar of the visual to match the given distribution
   * @requires results to be a valid part-to-whole and for results to be keyed by Party
   * @throws Error if results is invalid
   */
  drawDistrictResults(results) {
    if (!results) {
      throw new Error('Results is falsy');
    }

    let styling = this.#getStyleObject(results);
    this.#district_bar.drawBreakdownRaw(results);
    this.#district_bar.applyBarStyling(styling);
    this.#district_style = styling;
  }

  /*
   * @param - ordering an ordering object used to order the bars
   * @effects updates the visuals such that the bars are in the given order
   * @requires ordering to be keyed by Party objects and for all bar ids be be mapped and for
   * both bars to have previously been drawn
   * @throws Error if ordering is invalid
   */
  orderBars(ordering) {
    if (!ordering) {
      throw new Error('Ordering is falsy');
    }

    this.#overall_bar.applyBarOrdering(ordering);
    this.#district_bar.applyBarOrdering(ordering);

    if (this.#overall_style) {
      this.#overall_bar.applyBarStyling(this.#overall_style);
    }

    if (this.#district_style) {
      this.#district_bar.applyBarStyling(this.#district_style);
    }
  }
}