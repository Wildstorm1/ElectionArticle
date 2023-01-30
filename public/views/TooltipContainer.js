/*
 * A flexible container for a tooltip
 */
class TooltipContainerBuilder {
  /*
   * A pointed tooltip container
   */
  static #PointedTooltipContainer = class {
    // The correction factor in pixels to make the tooltip float below the cursor
    static #cursor_factor = 30;

    // The top level HTML DOM element containing the tooltip elements
    #root;

    // The pointer DOM element
    #pointer;

    // The measured width of the tooltip with its contents in pixels
    #width;

    // The current x position
    #x_pos;

    // The current y position
    #y_pos;

    /*
     * @param parent - the DOM element to attach the tooltip under
     * @param subject - the subject to subscribe to for position updates
     * @param contents - the contents of the tooltip
     * @param id - the css id for the root of tooltip
     */
    constructor(parent, subject, contents, id = null) {
      if (!parent) {
        throw new Error('Parent is falsy!');
      }

      if (!subject) {
        throw new Error('Subject is falsy!');
      }

      if (!contents) {
        throw new Error('Contents is falsy!');
      }

      this.#x_pos = 0;
      this.#y_pos = 0;
      this.#width = 0;
      this.#root = document.createElement('div');

      if (id) {
        this.#root.setAttribute('id', id);
      }

      let pointer = document.createElement('div');
      pointer.setAttribute('class', 'Pointer');
      let body = document.createElement('div');
      body.setAttribute('class', 'Wrapper');

      parent.appendChild(this.#root);
      this.#root.appendChild(pointer);
      this.#root.appendChild(body);
      body.appendChild(contents.getDOMRoot());
      this.#pointer = pointer;

      subject.subscribe('MouseMove', this, (event) => {
        this.#onMouseUpdate(event);
      });

      subject.subscribe('MouseOver', this, (event) => {
        this.#onMouseUpdate(event);
        this.#showTooltip();
      });

      subject.subscribe('MouseOut', this, (event) => {
        this.#onMouseUpdate(event);
        this.#hideTooltip();
      });

      this.#hideTooltip();
    }

    /*
     * @effects - makes the tooltip visible on the webpage
     */
    #showTooltip() {
      this.#root.setAttribute('class', 'Visible');
    }

    /*
     * @effects - hides the tooltip from being visible on the webpage
     */
    #hideTooltip() {
      this.#root.setAttribute('class', 'Invisible');
    }

    /*
     * @effects - updates the positioning of the tooltip based on position / width
     */
    #updatePosition() {
      // TODO: The 20 comes from the width of the pointer, the 12 is twice the shadow width. CSS constants?
      this.#root.style.left = `${ this.#x_pos - (this.#width / 2) }px`;
      this.#root.style.top = `${ this.#y_pos + TooltipContainerBuilder.#PointedTooltipContainer.#cursor_factor }px`;
      this.#pointer.style.left = `${ 4 + ((this.#width - (Math.sqrt(2) * 20)) / 2) }px`;
      this.#pointer.style.top = `${ -(Math.sqrt(2) * 20) / 2 + 6 }px`;
    }

    /*
     * @param event - the event received
     */
    #onMouseUpdate(event) {
      let measures = this.#root.getBoundingClientRect();
      this.#width = measures.width;
      this.#x_pos = event.getX();
      this.#y_pos = event.getY();
      this.#updatePosition();
    }
  }

  // The HTML DOM element to attach the tooltip to
  #parent;

  // The subject to receive position updates from
  #subject;

  // The inner contents of the UI container
  #contents;

  // The id of the root
  #css_id;

  constructor() {
    this.#parent = null;
    this.#subject = null;
    this.#contents = null;
    this.#css_id = null;
  }

  /*
   * @param parent - the DOM element to add this tooltip under
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
   * @param subject - the subject to subscribe to for position updates
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
   * @param contents - the contents to place inside this container
   * @return this
   */
  setInnerContents(contents) {
    if (this.#contents === -1) {
      throw new Error('This builder is closed!');
    }

    if (!contents) {
      throw new Error('The given contents are falsy!');
    }

    this.#contents = contents;
    return this;
  }

  /*
   * @param id - the id of the root HTML element for the tooltip
   * @return this
   */
  setRootCSSId(id) {
    if (this.#css_id === -1) {
      throw new Error('This builder is closed!');
    }

    if (!id) {
      throw new Error('The given id is falsy!');
    }

    this.#css_id = id;
    return this;
  }

  /*
   * @return the new tooltip
   * @requires that parent, subject and contents have been set
   * @effects further calls to this builder will throw an error
   */
  build() {
    if (this.#parent === -1) {
      throw new Error('This builder is closed!');
    }

    if (this.#parent === null) {
      throw new Error('Parent must be set!');
    }

    if (this.#subject === null) {
      throw new Error('Subject must be set!');
    }

    if (this.#contents === null) {
      throw new Error('Contents must be set!');
    }

    let tooltip = new TooltipContainerBuilder.#PointedTooltipContainer(this.#parent, this.#subject, this.#contents, this.#css_id);

    this.#contents = -1;
    this.#css_id = -1;
    this.#parent = -1;
    this.#subject = -1;

    return tooltip;
  }
}