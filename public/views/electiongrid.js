/*
 * Represents a GUI for a grid of configurable squares
 */
class SVGGridGUI {
  // Number of columns in the grid
  #columns;

  // Number of row in the grid
  #rows;

  // The size of a grid cell in pixels
  #square_size;

  // An array holding references to each square in the grid
  #svg_grid;

  // The SVG DOM group element which contains the SVG image elements
  #svg_group;

  // The SVG DOM element which serves as the root of the SVG image
  #svg_canvas;

  /*
   * @param parent - the SVG element to attach the line to
   * @param x1 - the x coordinate of the lines starting point
   * @param y1 - the y coordinate of the lines starting point
   * @param x2 - the x coordinate of the lines ending point
   * @param y2 - the y coordinate of the lines ending point
   * @returns a new SVG line element parented to the given SVG DOM element
   */
  static #createLine(parent, x1, y1, x2, y2) {
    let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    parent.appendChild(line);
    line.setAttribute('class', 'solid_line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    return line;
  }

  /*
   * @param parent - the SVG element to attach the square to
   * @param size - the height / width in pixels of the square
   * @param i - the row index of the square within the grid
   * @param j - the column index of the square within the grid
   * @returns a square object containing references to the SVG DOM elements
   */
  static #createSquare(parent, size, i, j) {
    let square_group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    parent.appendChild(square_group);
    square_group.setAttribute('transform', `translate(${j * size},${i * size})`);

    let square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    square_group.appendChild(square);
    square.setAttribute('width', size);
    square.setAttribute('height', size);

    let top_line = SVGGridGUI.#createLine(square_group, 0, 0, size, 0);
    let right_line = SVGGridGUI.#createLine(square_group, size, 0, size, size);
    let bottom_line = SVGGridGUI.#createLine(square_group, size, size, 0, size);
    let left_line = SVGGridGUI.#createLine(square_group, 0, size, 0, 0);
    return { rect: square, top: top_line, right: right_line, bottom: bottom_line, left: left_line };
  }

  /*
   * @param grid - a model object which represents a grouped grid
   * @param group_id - the id to compare the given grid cell against
   * @param i - the row index of the square
   * @param j - the column index of the square
   * @returns the CSS class for the edge between grid[i][j] and a square with id group_id, defaulting
   * to solid if the square is outside the bounds of the grid
   */
  static #getGridLineClass(grid, group_id, i, j) {
    if (i < 0 || j < 0 || i >= grid.getGridRows() || j >= grid.getGridColumns()) {
      return 'solid_line';
    }

    if (grid.getCellId(i, j) === group_id) {
      return 'transparent_line';
    }

    return 'solid_line';
  }

  /*
   * @param canvas - the SVG DOM element to attach the grid to
   * @param grid_rows - the number of rows in the grid  
   * @param grid_columns - the number of columns in the grid
   * @param square_size - the size of a square in the grid in pixels
   * @requires grid_rows, grid_columns, and square_size > 0
   * @throws Error if grid_rows, grid_columns, or square_size <= 0
   */
  constructor(canvas, grid_rows, grid_columns, square_size) {
    if (grid_rows <= 0) {
      throw new Error('Invalid number of rows!');
    }

    if (grid_columns <= 0) {
      throw new Error('Invalid number of columns!');
    }

    if (square_size <= 0) {
      throw new Error('Invalid square size given!');
    }

    this.#columns = grid_columns;
    this.#rows = grid_rows;
    this.#square_size = square_size;
    this.#svg_grid = new Array(grid_rows);
    this.#svg_group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.#svg_canvas = canvas;

    this.#svg_canvas.appendChild(this.#svg_group);

    for (let i = 0; i < this.#rows; i++) {
      this.#svg_grid[i] = new Array(this.#columns);

      for (let j = 0; j < this.#columns; j++) {
        this.#svg_grid[i][j] = SVGGridGUI.#createSquare(this.#svg_group, this.#square_size, i, j);
      }
    }
  }

  /*
   * @param grid - a model object which represents a grouped grid
   * @requires the grid size to match the constructed sizes
   * @effects updates the SVG image to reflect the groupings given in grid
   * @throws Error if the grid dimensions do not match the dimensions of the SVG image
   */
  plotBorders(grid) {
    if (!grid) {
      throw new Error('Grid object is falsy!');
    }

    if (grid.getGridRows() !== this.#rows || grid.getGridColumns() !== this.#columns) {
      throw new Error(`Invalid grid dimensions! Expected ${this.#rows} x ${this.#columns}`);
    }

    for (let i = 0; i < this.#rows; i++) {
      for (let j = 0; j < this.#columns; j++) {
        this.#svg_grid[i][j].left.setAttribute('class', SVGGridGUI.#getGridLineClass(grid, grid.getCellId(i, j), i, j - 1));
        this.#svg_grid[i][j].bottom.setAttribute('class', SVGGridGUI.#getGridLineClass(grid, grid.getCellId(i, j), i + 1, j));
        this.#svg_grid[i][j].right.setAttribute('class', SVGGridGUI.#getGridLineClass(grid, grid.getCellId(i, j), i, j + 1));
        this.#svg_grid[i][j].top.setAttribute('class', SVGGridGUI.#getGridLineClass(grid, grid.getCellId(i, j), i - 1, j));
      }
    }
  }

  /*
   * @param event - the event object produced after the event is triggered
   * @param callback - the function to call when the event is triggered
   */
  #handleMouseEvent(event, callback) {
    let height = this.#rows * this.#square_size;
    let width = this.#columns * this.#square_size;

    let i = Math.min(Math.floor((Math.max(0, event.offsetY) / height) * this.#rows), this.#rows - 1);
    let j = Math.min(Math.floor((Math.max(0, event.offsetX) / width) * this.#columns), this.#columns - 1);

    event.gridCell = { row: i, column: j };
    callback(event);
  }

  /*
   * @param callback - the function to call when the event is fired
   * @effects adds a mouse over event handler. When fired, the event will include
   * a gridCell field containing { row: i, column: j } of the cell the event was fired over
   * @requires callback to be a function which accepts a single argument
   */
  onMouseOver(callback) {
    this.#svg_canvas.addEventListener('mouseover', (e) => { this.#handleMouseEvent(e, callback); });
  }

  /*
   * @param callback - the function to call when the event is fired
   * @effects adds a mouse out event handler. When fired, the event will include
   * a gridCell field containing { row, column } of the cell the event was fired over
   * @requires callback to be a function which accepts a single argument
   */
  onMouseOut(callback) {
    this.#svg_canvas.addEventListener('mouseout', (e) => { this.#handleMouseEvent(e, callback); });
  }

  /*
   * @param callback - the function to call when the event is fired
   * @effects adds a mouse move event handler. When fired, the event will include
   * a gridCell field containing { row, column } of the cell the event was fired over
   * @requires callback to be a function which accepts a single argument
   */
  onMouseMove(callback) {
    this.#svg_canvas.addEventListener('mousemove', (e) => { this.#handleMouseEvent(e, callback); });
  }
}

/*
 * Represents an SVG image layer which plots a set of points
 */
class SVGPopulationGUI {
  // The width of the area to plot the points in pixels
  #width;

  // The height of the area to plot the points in pixels
  #height;

  // The SVG DOM group element which contains the SVG image elements
  #svg_group;

  // All of the points plotted in the GUI
  #points;

  /*
   * @param canvas - the SVG DOM element to attach the grid to
   */
  constructor(canvas) {
    this.#width = canvas.getAttribute('width');
    this.#height = canvas.getAttribute('height');
    this.#svg_group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.#points = [];
    canvas.appendChild(this.#svg_group);
  }

  /*
   * @param points - a Points collection of 2D points to plot
   * @effects - updates the plotted points
   * @requires each point to be a IdPoint2D tagged with a Party and for the coordinates to be normalized
   * @throws Error if a point is invalid
   */
  plotPopulation(points) {
    for (let i = 0; i < this.#points.length; i++) {
      this.#points[i].remove();
    }

    this.#points = [];
    let data = points.getPointsAsArray();

    for (let i = 0; i < data.length; i++) {
      let element = data[i];

      if (element.getX() < 0 || element.getX() > 1) {
        throw new Error('X coordinate not normalized');
      }

      if (element.getY() < 0 || element.getY() > 1) {
        throw new Error('Y coordinate not normalized');
      }

      if (!element.getId || !element.getId().getPartyId) {
        throw new Error('Point type or id type invalid');
      }

      let id = element.getId();
      let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('class', id.getPartyId()); // TODO: Maybe just ensure it has toString?
      circle.setAttribute('cx', element.getX() * this.#width);
      circle.setAttribute('cy', element.getY() * this.#height);

      this.#svg_group.appendChild(circle);
      this.#points.push(circle);
    }
  }
}

/*
 * An SVG image showing voters living in a grid of districts
 */
class ElectionGridView {
  // The SVGGridGUI base layer showing districts
  #grid_layer;

  // The SVGPopulationGUI layer showing voters
  #population_layer;

  /*
   * @param parent_node - the HTML DOM element to attach the SVG image to
   * @param square_size - the size of a grid cell in pixels
   * @param grid_model - a model describing the borders of the grid
   * @param population_model - a model describing the points to plot onto the grid
   * @requires square_size > 0
   */
  constructor(parent_node, square_size, grid_model, population_model) {
    const rows = grid_model.getGridRows();
    const columns = grid_model.getGridColumns();

    const svg_canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg_canvas.setAttribute('width', columns * square_size);
    svg_canvas.setAttribute('height', rows * square_size);
    parent_node.appendChild(svg_canvas);

    this.#population_layer = new SVGPopulationGUI(svg_canvas);
    this.#grid_layer = new SVGGridGUI(svg_canvas, rows, columns, square_size);

    this.#grid_layer.plotBorders(grid_model);
    this.#population_layer.plotPopulation(population_model);
  }

  /*
   * @param grid_model - a model object which represents a grouped grid
   * @requires the grid_model size to match the constructed sizes
   * @effects updates the SVG image to reflect the groupings given in grid
   * @throws Error if the grid dimensions do not match the dimensions of the SVG image
   */
  plotBorders(grid_model) {
    this.#grid_layer.plotBorders(grid_model);
  }

  /*
   * @param population_model - a Points collection of 2D points to plot
   * @effects - updates the plotted points
   * @requires each point to be a IdPoint2D tagged with a Party and for the coordinates to be normalized
   * @throws Error if a point is invalid
   */
  plotPopulation(population_model) {
    this.#population_layer.updatePopulation(population_model);
  }

  /*
   * @param callback - the function to call when the event is fired
   * @effects adds a mouse over event handler. When fired, the event will include
   * a gridCell field containing { row, column } of the cell the event was fired over
   * @requires callback to be a function which accepts a single argument
   */
  onMouseOver(callback) {
    this.#grid_layer.onMouseOver(callback);
  }

  /*
   * @param callback - the function to call when the event is fired
   * @effects adds a mouse out event handler. When fired, the event will include
   * a gridCell field containing { row, column } of the cell the event was fired over
   * @requires callback to be a function which accepts a single argument
   */
  onMouseOut(callback) {
    this.#grid_layer.onMouseOut(callback);
  }

  /*
   * @param callback - the function to call when the event is fired
   * @effects adds a mouse move event handler. When fired, the event will include
   * a gridCell field containing { row, column } of the cell the event was fired over
   * @requires callback to be a function which accepts a single argument
   */
  onMouseMove(callback) {
    this.#grid_layer.onMouseMove(callback);
  }
}