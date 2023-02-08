/*
 * Builds a grid display UI
 */
class GridDisplayBuilder {
  /*
   * An SVG layer displaying a set of points
   */
  static #PopulationUI = class {
    // The SVG DOM group element which contains the SVG points
    #svg_group;

    // All of the SVG points plotted in the GUI
    #points;

    /*
     * @param canvas - the SVG DOM element to attach the grid to
     */
    constructor(canvas) {
      if (!canvas) {
        throw new Error('Canvas is falsy!');
      }

      this.#svg_group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      this.#points = [];
      canvas.appendChild(this.#svg_group);
    }

    /*
     * @param num - the number of points needed after the resizing
     * @effects - removes or adds new SVG circles prior to drawing
     */
    #resize(num) {
      while (this.#points.length > num) {
        let point = this.#points.pop();

        if (point) {
          point.remove();
        }
      }

      while (this.#points.length < num) {
        let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', 0);
        circle.setAttribute('cy', 0);
  
        this.#svg_group.appendChild(circle);
        this.#points.push(circle);
      }
    }

    /*
     * @param points - an array of { x, y, style } objects describing the points to plot
     * @effects draws each point in points
     */
    #draw(points) {
      for (let i = 0; i < points.length; i++) {
        let element = points[i];
        let circle = this.#points[i];
        circle.setAttribute('class', element.style);
        circle.setAttribute('cx', element.x);
        circle.setAttribute('cy', element.y);
      }
    }

    /*
     * @param points - an array of { x, y, style } objects describing the points to plot
     * @effects draws each point in points
     */
    plotPoints(points) {
      if (!points) {
        throw new Error('Points is falsy');
      }

      this.#resize(points.length);
      this.#draw(points);
    }
  }

  /*
   * An SVG layer displaying configurable cell groupings
   */
  static #Square = class {
    // A cache of points in a square in the order: top, right, bottom, left
    static #sides = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];

    // Each line of the square in the order: top, right, bottom, left
    #lines;

    // The value the square currently represents
    #value;

    /*
     * @param parent - the DOM element to attach the square to
     * @param size - the size of the square in pixels
     * @param i - the row offset of the square
     * @param j - the column offset of the square
     * @requires size > 0 and i, j are integers
     */
    constructor(parent, size, i, j) {
      if (!parent) {
        throw new Error('Parent is falsy');
      }

      if (size <= 0) {
        throw new Error(`Size ${size} must be > 0`);
      }

      this.#lines = [];
      this.#value = null;

      let square_group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      parent.appendChild(square_group);
      square_group.setAttribute('transform', `translate(${j * size},${i * size})`);

      let square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      square_group.appendChild(square);
      square.setAttribute('width', size);
      square.setAttribute('height', size);

      for (let p1 = 0; p1 < GridDisplayBuilder.#Square.#sides.length; p1++) {
        let p2 = (p1 + 1) % GridDisplayBuilder.#Square.#sides.length;
        let point1 = GridDisplayBuilder.#Square.#sides[p1];
        let point2 = GridDisplayBuilder.#Square.#sides[p2];

        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        square_group.appendChild(line);
        line.setAttribute('class', 'Solid');
        line.setAttribute('x1', point1.x * size);
        line.setAttribute('y1', point1.y * size);
        line.setAttribute('x2', point2.x * size);
        line.setAttribute('y2', point2.y * size);
        this.#lines.push(line);
      }
    }

    /*
     * @return the value that the square currently stores
     */
    getValue() {
      return this.#value;
    }

    /*
     * @param value - the value to update the square with
     * @param side_values - an array of values for each neighboring cell [top, right, bottom, left], or undefined if out of grid
     */
    update(value, side_values) {
      this.#value = value;

      for (let i = 0; i < side_values.length; i++) {
        if (this.#value === side_values[i]) {
          this.#lines[i].setAttribute('class', 'Transparent');
        } else {
          this.#lines[i].setAttribute('class', 'Solid');
        }
      }
    }
  }

  /*
   * An SVG layer displaying configurable cell groupings
   */
  static #GridUI = class {
    // An array holding references to each square in the grid
    #svg_grid;

    // The SVG DOM group element which contains the SVG image elements
    #svg_group;

    // The SVG DOM element which serves as the root of the SVG image
    #svg_canvas;

    /*
     * @param canvas - the SVG DOM element to attach the grid to
     * @param grid_rows - the number of rows in the grid  
     * @param grid_columns - the number of columns in the grid
     * @param square_size - the size of a square in the grid in pixels
     * @requires grid_rows, grid_columns, and square_size > 0
     */
    constructor(canvas, grid_rows, grid_columns, square_size) {
      if (!canvas) {
        throw new Error('Canvas is falsy!');
      }

      if (grid_rows <= 0) {
        throw new Error('Invalid number of rows!');
      }

      if (grid_columns <= 0) {
        throw new Error('Invalid number of columns!');
      }

      if (square_size <= 0) {
        throw new Error('Invalid square size given!');
      }

      this.#svg_grid = new Array(grid_rows);
      this.#svg_group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      this.#svg_canvas = canvas;

      this.#svg_canvas.appendChild(this.#svg_group);

      for (let i = 0; i < grid_rows; i++) {
        this.#svg_grid[i] = new Array(grid_columns);

        for (let j = 0; j < grid_columns; j++) {
          this.#svg_grid[i][j] = new GridDisplayBuilder.#Square(this.#svg_group, square_size, i, j);
        }
      }
    }

    /*
     * @param i - the row of the cell
     * @param j - the column of the cell
     * @return the value at cell i, j
     * @requires i >= 0, j >= 0, i < rows, j < columns
     */
    getCellValue(i, j) {
      if (i < 0 || i >= this.#svg_grid.length) {
        throw new Error(`Row ${ i } must be >= 0 and < ${ this.#svg_grid.length }`);
      }

      if (j < 0 || j >= this.#svg_grid[0].length) {
        throw new Error(`Column ${ j } must be >= 0 and < ${ this.#svg_grid[0].length }`);
      }

      return this.#svg_grid[i][j].getValue();
    }

    /*
     * @param grid - a 2d grid of values which each cell uses to defines borders
     * @requires the grid size to match the constructed sizes
     * @effects updates the SVG image to reflect the groupings of values given in the grid
     */
    update(grid) {
      if (!grid) {
        throw new Error('Grid object is falsy!');
      }

      let rows = this.#svg_grid.length;
      let columns = this.#svg_grid[0].length;

      if (grid.length !== rows || grid[0].length !== columns) {
        throw new Error(`Invalid grid dimensions! Expected ${ rows } x ${ columns }`);
      }

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          let square = this.#svg_grid[i][j];
          let top = i - 1 < 0 ? undefined : grid[i - 1][j];
          let right = j + 1 >= columns ? undefined : grid[i][j + 1];
          let bottom = i + 1 >= rows ? undefined : grid[i + 1][j];
          let left = j - 1 < 0 ? undefined : grid[i][j - 1];
          square.update(grid[i][j], [top, right, bottom, left]);
        }
      }
    }
  }

  /*
   * A UI containing districts and points
   */
  static #GridView = class {
    // The number of rows in the grid
    #rows;

    // The number of columns in the grid
    #columns;

    // The height of the grid in pixels
    #height;

    // The width of the grid in pixels
    #width;

    // A map of observers Map[event -> Map[observer, callback]]
    #observers;

    // The GridUI showing districts
    #grid_layer;

    // The PopulationUI layer showing voters
    #population_layer;

    /*
     * @param parent_node - the HTML DOM element to attach the SVG image to
     * @param subject - the subject to subscribe to for model changes
     * @param square_size - the size of a grid cell in pixels
     * @param rows - the number of rows in the grid
     * @param columns - the number of columns in the grid
     * @requires square_size, rows, and columns > 0
     */
    constructor(parent_node, subject, square_size, rows, columns) {
      if (!parent_node) {
        throw new Error('Parent node is falsy');
      }

      if (!subject) {
        throw new Error('Subject is falsy');
      }

      if (square_size <= 0) {
        throw new Error(`Square size ${square_size} is <= 0`);
      }

      if (rows <= 0) {
        throw new Error(`Square size ${rows} is <= 0`);
      }

      if (columns <= 0) {
        throw new Error(`Square size ${columns} is <= 0`);
      }

      this.#columns = columns;
      this.#rows = rows;
      this.#height = rows * square_size;
      this.#width = columns * square_size;

      const svg_canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg_canvas.setAttribute('width', columns * square_size);
      svg_canvas.setAttribute('height', rows * square_size);
      parent_node.appendChild(svg_canvas);

      this.#population_layer = new GridDisplayBuilder.#PopulationUI(svg_canvas);
      this.#grid_layer = new GridDisplayBuilder.#GridUI(svg_canvas, rows, columns, square_size);

      subject.subscribe('Voters', this, (event) => { this.#onVotersUpdate(event); });
      subject.subscribe('GridCells', this, (event) => { this.#onGridUpdate(event); });

      let event_map = new Map();
      event_map.set('MouseMove', new Map());
      event_map.set('MouseOver', new Map());
      event_map.set('MouseOut', new Map());
      this.#observers = event_map;

      svg_canvas.addEventListener('mousemove', (event) => { this.#sendEvent('MouseMove', event); });
      svg_canvas.addEventListener('mouseout', (event) => { this.#sendEvent('MouseOut', event); });
      svg_canvas.addEventListener('mouseover', (event) => { this.#sendEvent('MouseOver', event); });
    }

    /*
     * @param event_name - the event name to send notifications to
     * @param event - the mouse event that triggered us to send a new event
     */
    #sendEvent(event_name, event) {
      let i = Math.min(Math.floor((Math.max(0, event.offsetY) / this.#height) * this.#rows), this.#rows - 1);
      let j = Math.min(Math.floor((Math.max(0, event.offsetX) / this.#width) * this.#columns), this.#columns - 1);
      let district = this.#grid_layer.getCellValue(i, j);
      let mouse_event = new MouseEvent(event.pageX, event.pageY, district);

      let event_map = this.#observers.get(event_name);
      let observers = event_map.keys();

      for (const observer of observers) {
        let callback = event_map.get(observer);
        callback(mouse_event);
      }
    }

    /*
     * @param event - the event received
     */
    #onVotersUpdate(event) {
      let points = [];

      for (const state of event) {
        let voter = state.getVoter();
        let position = voter.getPosition();
        let party = voter.getParty();

        points.push({ x: position.getX(), y: position.getY(), style: party.getPartyName() });
      }

      this.#population_layer.plotPoints(points);
    }

    /*
     * @param event - the event received
     */
    #onGridUpdate(event) {
      let grid = [];

      for (let row = 0; row < this.#rows; row++) {
        let row_array = [];

        for (let col = 0; col < this.#columns; col++) {
          row_array.push(null);
        }

        grid.push(row_array);
      }

      for (const state of event) {
        let cell = state.getCell();
        let i = cell.getRow();
        let j = cell.getColumn();
        let district = cell.getDistrict();
        grid[i][j] = district;
      }

      this.#grid_layer.update(grid);
    }

    /*
     * @param event - the specific event to subscribe to
     * @param observer - the object which is interested in consuming events
     * @param callback - the function which will be called on an event
     * @requires callback to be function(event) and event to be valid
     */
    subscribe(event, observer, callback) {
      if (!this.#observers.has(event)) {
        throw new Event('Event identifier is not valid.');
      }

      let event_listeners = this.#observers.get(event);
      event_listeners.set(observer, callback);
    }

    /*
     * @param event - the specific event to subscribe to
     * @param observer - the object which is no longer interested in consuming events
     */
    unsubscribe(event, observer) {
      if (!this.#observers.has(event)) {
        throw new Event('Event identifier is not valid.');
      }

      let event_listeners = this.#observers.get(event);
      event_listeners.remove(observer);
    }
  }

  // The DOM element to add the grid display under
  #parent;

  // The subject which will produce events when the UI should be redrawn
  #subject;

  // The height and width of a cell in pixels
  #cell_size;

  // The number of rows in the grid
  #rows;

  // The number of columns in the grid
  #columns;

  constructor() {
    this.#parent = null;
    this.#subject = null;
    this.#cell_size = 0;
    this.#columns = 0;
    this.#rows = 0;
  }

  /*
   * @param parent - the DOM element to add this UI under
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
   * @param subject - the subject to subscribe to receive updates to the model
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
   * @param size - the size of a cell in pixels
   * @requires size > 0
   * @return this
   */
  setCellSize(size) {
    if (this.#cell_size === -1) {
      throw new Error('This builder is closed!');
    }

    if (size <= 0) {
      throw new Error(`Cell size ${size} must be > 0`);
    }

    this.#cell_size = size;
    return this;
  }

  /*
   * @param columns - the number of columns in the grid
   * @return this
   * @requires columns > 0
   */
  setColumns(columns) {
    if (this.#columns === -1) {
      throw new Error('This builder is closed!');
    }

    if (columns <= 0) {
      throw new Error(`Columns ${columns} must be > 0`);
    }

    this.#columns = columns;
    return this;
  }

  /*
   * @param rows - the number of rows in the grid
   * @return this
   * @requires rows > 0
   */
  setRows(rows) {
    if (this.#rows === -1) {
      throw new Error('This builder is closed!');
    }

    if (rows <= 0) {
      throw new Error(`Rows ${rows} must be > 0`);
    }

    this.#rows = rows;
    return this;
  }

  /*
   * @return a new grid display
   * @effects further calls to this builder will throw an error
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

    if (this.#cell_size === 0) {
      throw new Error('Must set a cell size!');
    }

    if (this.#columns === 0) {
      throw new Error('Must set columns!');
    }

    if (this.#rows === 0) {
      throw new Error('Must set rows!');
    }

    let grid = new GridDisplayBuilder.#GridView(this.#parent, this.#subject, this.#cell_size, this.#rows, this.#columns);

    this.#parent = -1;
    this.#subject = -1;
    this.#cell_size = -1;
    this.#columns = -1;
    this.#rows = -1;

    return grid;
  }
}