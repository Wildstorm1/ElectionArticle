/*
 * Builds a double result bar UI
 */
class ResultBarBuilder {
  /*
   * Represents a horizontal bar GUI which displays percent based bars
   */
  static #SVGHorizontalBar = class {
    // The width of the bar in pixels
    #width;

    // The height of the bar in pixels
    #height;

    // The SVG DOM group element which contains the SVG rect elements
    #svg_group;

    // Array of SVG rect and text elements representing the labeled bars in the GUI
    #svg_bars;

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
      this.#svg_group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      canvas.appendChild(this.#svg_group);
    }

    /*
     * @param num - the number of bars needed after the resizing
     * @effects - removes or adds new SVG rectangles prior to drawing
     */
    #resize(num) {
      while (this.#svg_bars.length > num) {
        let bar = this.#svg_bars.pop();

        if (bar) {
          bar.Parent.remove();
        }
      }

      while (this.#svg_bars.length < num) {
        let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', 0);
        rect.setAttribute('height', this.#height);
        rect.setAttribute('x', 0);

        let label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', 0);
        label.setAttribute('y', 0.5 * this.#height);
        label.textContent = '';

        this.#svg_group.appendChild(g);
        g.appendChild(rect);
        g.appendChild(label);
        this.#svg_bars.push({ Parent: g, Rect: rect, Text: label });
      }
    }

    /*
     * @param breakdown - an array of { style, percent, text } objects in the order to render them
     * @effects draws each of the segments given in breakdown
     */
    #draw(breakdown) {
      let offset = 0;

      for (let i = 0; i < breakdown.length; i++) {
        let segment = breakdown[i];
        let segment_width = this.#width * segment.percent;

        this.#svg_bars[i].Rect.setAttribute('width', segment_width);
        this.#svg_bars[i].Rect.setAttribute('x', offset);
        this.#svg_bars[i].Rect.setAttribute('class', segment.style);
        this.#svg_bars[i].Text.setAttribute('x', offset + 0.5 * segment_width);
        this.#svg_bars[i].Text.textContent = segment.display;

        offset = offset + segment_width;
      }
    }

    /*
     * @param breakdown - an array containing { style, percent, text } objects for each sub-bar to render
     * @effects redraws the current bar to reflect the new breakdown distribution in the order of the given array
     */
    drawBreakdown(breakdown) {
      if (!breakdown) {
        throw new Error('Breakdown is falsy');
      }

      this.#resize(breakdown.length);
      this.#draw(breakdown);
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
   * An SVG image showing a comparison of an elections overall results to its elected delegation.
   * Bar segments are assigned a CSS class of the name of the party it represents.
   */
  static #ResultBar = class {
    // The bar showing overall election results
    #overall_bar;

    // The bar showing the delegation breakdown of the election
    #district_bar;

    /*
     * @param parent_node - the DOM element to attach the SVG visual to
     * @param subject - the subject to subscribe to for updates
     * @param bar_width - the width of a bar in pixels
     * @param bar_height - the height of a bar in pixels 
     * @param bar_padding - the padding vertically between bars in pixels
     * @requires bar_width, bar_height > 0, bar_padding >= 0
     */
    constructor(parent_node, subject, bar_width, bar_height, bar_padding) {
      if (!parent_node) {
        throw new Error('Parent node is falsy!');
      }

      if (!subject) {
        throw new Error('Subject is falsy!');
      }

      if (bar_width <= 0) {
        throw new Error(`Bar width ${bar_width} must be > 0`);
      }

      if (bar_height <= 0) {
        throw new Error(`Bar height ${bar_height} must be > 0`);
      }

      if (bar_padding < 0) {
        throw new Error(`Bar padding ${bar_padding} must be >= 0`);
      }

      let width = bar_width;
      let height = 2 * bar_height + bar_padding;

      const svg_canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg_canvas.setAttribute('width', width);
      svg_canvas.setAttribute('height', height);
      parent_node.appendChild(svg_canvas);

      this.#overall_bar = new ResultBarBuilder.#SVGHorizontalBar(svg_canvas, bar_width, bar_height);
      this.#district_bar = new ResultBarBuilder.#SVGHorizontalBar(svg_canvas, bar_width, bar_height);
      this.#district_bar.transform(`translate(0,${bar_height + bar_padding})`);

      subject.subscribe(this, (event) => { this.#onModelUpdate(event); });
    }

    /*
     * @param event - the event received
     */
    #onModelUpdate(event) {
      let districts = event.getNumDistricts();
      let overall_bar_data = [];
      let district_bar_data = [];

      for (const party of event.getParties()) {
        let style = party.getPartyName();
        let percent = event.getPartyPercent(party);
        let reps = event.getRepresentatives(party);

        if (percent !== 0) {
          overall_bar_data.push({ style: style, percent: percent, display: `${ Math.floor((percent * 1000)) / 10 }%` });
        }

        if (reps !== 0) {
          district_bar_data.push({ style: style, percent: reps / districts, display: `${ reps }` });
        }
      }

      overall_bar_data.sort((a, b) => { return a.style.localeCompare(b.style); });
      district_bar_data.sort((a, b) => { return a.style.localeCompare(b.style); });

      this.#overall_bar.drawBreakdown(overall_bar_data);
      this.#district_bar.drawBreakdown(district_bar_data);
    }
  }

  // The DOM element to add the result bar under
  #parent;

  // The subject which will produce events when the UI should be redrawn
  #subject;

  // The width of the result bar in pixels
  #width;

  // The height of the result bar in pixels
  #height;

  // The pixel padding between result bar
  #padding;

  constructor() {
    this.#parent = null;
    this.#subject = null;
    this.#width = 0;
    this.#height = 0;
    this.#padding = 0;
  }

  /*
   * @param parent - the HTML DOM element to attach this UI to
   * @return this
   */
  setDOMParent(parent) {
    if (this.#parent === -1) {
      throw new Error('This builder is closed!');
    }

    if (!parent) {
      throw new Error('The given parent is falsy!');
    }

    this.#parent = parent;
    return this;
  }

  /*
   * @param subject - the subject to subscribe to receive update events from
   * @return this
   */
  setSubject(subject) {
    if (this.#subject === -1) {
      throw new Error('This builder is closed!');
    }

    if (!subject) {
      throw new Error('The given subject is falsy!');
    }

    this.#subject = subject;
    return this;
  }

  /*
   * @param width - the width of the result bar in pixels
   * @requires width > 0
   * @return this
   */
  setBarWidth(width) {
    if (this.#width === -1) {
      throw new Error('This builder is closed!');
    }

    if (width <= 0) {
      throw new Error(`The given width ${width} is <= 0`);
    }

    this.#width = width;
    return this;
  }

  /*
   * @param height - the height of the result bar in pixels
   * @requires height > 0
   * @return this
   */
  setBarHeight(height) {
    if (this.#height === -1) {
      throw new Error('This builder is closed!');
    }

    if (height <= 0) {
      throw new Error(`The given height ${height} is <= 0`);
    }

    this.#height = height;
    return this;
  }

  /*
   * @param padding - the padding between the bars
   * @requires padding >= 0
   * @return this
   */
  setBarPadding(padding) {
    if (this.#padding === -1) {
      throw new Error('This builder is closed!');
    }

    if (padding < 0) {
      throw new Error(`The given padding ${padding} is < 0`);
    }

    this.#padding = padding;
    return this;
  }

  /*
   * @return a new result bar UI
   */
  build() {
    if (this.#parent === -1) {
      throw new Error('This builder is closed!');
    }

    if (this.#parent === null) {
      throw new Error('Must set a DOM parent!');
    }

    if (this.#subject === null) {
      throw new Error('Must set a subject!');
    }

    if (this.#height === 0) {
      throw new Error('Must set bar height!');
    }

    if (this.#width === 0) {
      throw new Error('Must set bar width!');
    }

    let result_bar = new ResultBarBuilder.#ResultBar(this.#parent, this.#subject, this.#width, this.#height, this.#padding);

    this.#padding = -1;
    this.#height = -1;
    this.#parent = -1;
    this.#subject = -1;
    this.#width = -1;

    return result_bar;
  }
}