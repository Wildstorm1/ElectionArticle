/*
 * Represents a GUI for a grid of configurable squares
 */
class SVGGridGUI {
  // Number of columns in the grid
  #columns;

  // Number of row in the grid
  #rows;

  // The tag to include in the SVG elements styling class
  #style;

  // An array holding references to each square in the grid
  #svg_grid;

  // The SVG DOM group element which contains the SVG image elements
  #svg_group;

  /*
   * @param parent - the SVG element to attach the line to
   * @param style_class - the styling class to tag the SVG element with
   * @param x1 - the x coordinate of the lines starting point
   * @param y1 - the y coordinate of the lines starting point
   * @param x2 - the x coordinate of the lines ending point
   * @param y2 - the y coordinate of the lines ending point
   * @returns a new SVG line element within the given parent SVG DOM element
   */
  static #createLine(parent, style_class, x1, y1, x2, y2) {
    return parent.append('line')
      .attr('class', style_class)
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2);
  }

  /*
   * @param parent - the SVG element to attach the square to
   * @param style_class - the styling class to tag the SVG elements with
   * @param size - the height / width in pixels of the square
   * @param i - the row index of the square within the grid
   * @param j - the column index of the square within the grid
   * @returns a square object containing references to the SVG DOM elements
   */
  static #createSquare(parent, style_class, size, i, j) {
    let square_group = parent.append('g')
      .attr('transform', `translate(${j * size},${i * size})`);
    let square = square_group.append('rect')
      .attr('class', `${style_class}_cell`)
      .attr('width', size)
      .attr('height', size);
    let top_line = SVGGridGUI.#createLine(square_group, `${style_class}_solid_line`, 0, 0, size, 0);
    let right_line = SVGGridGUI.#createLine(square_group, `${style_class}_solid_line`, size, 0, size, size);
    let bottom_line = SVGGridGUI.#createLine(square_group, `${style_class}_solid_line`, size, size, 0, size);
    let left_line = SVGGridGUI.#createLine(square_group, `${style_class}_solid_line`, 0, size, 0, 0);
    return { rect: square, top: top_line, right: right_line, bottom: bottom_line, left: left_line };
  }

  /*
   * @param grid - a model object which represents a grouped grid
   * @param style_class - the styling class to tag the SVG elements with
   * @param group_id - the id to compare the given grid cell against
   * @param i - the row index of the square
   * @param j - the column index of the square
   * @returns the CSS class for the edge between grid[i][j] and a square with id group_id, defaulting
   * to solid if the square is outside the bounds of the grid
   */
  static #getGridLineStyle(grid, style_class, group_id, i, j) {
    if (i < 0 || j < 0 || i >= grid.getGridRows() || j >= grid.getGridColumns()) {
      return `${style_class}_solid_line`;
    }

    if (grid.getCellId(i, j) === group_id) {
      return `${style_class}_transparent_line`;
    } else {
      return `${style_class}_solid_line`;
    }
  }

  /*
   * @param grid_rows - the number of rows in the grid  
   * @param grid_columns - the number of columns in the grid
   * @param square_size - the size of a square in the grid in pixels
   * @param canvas - the SVG DOM element to attach the grid to
   * @param style_class - the styling class to tag the SVG elements with
   */
  constructor(grid_rows, grid_columns, square_size, canvas, style_class) {
    // TODO: check some invariants (ie, rows / cols should be > 0)

    this.#columns = grid_columns;
    this.#rows = grid_rows;
    this.#style = style_class;
    this.#svg_grid = new Array(grid_rows);
    this.#svg_group = canvas.append('g');

    // TODO: expose the events!
    // TODO: really over the top is a layered api to build up an image built from components (really these objects represent a g element)

    for (let i = 0; i < this.#rows; i++) {
      this.#svg_grid[i] = new Array(this.#columns);

      for (let j = 0; j < this.#columns; j++) {
        this.#svg_grid[i][j] = SVGGridGUI.#createSquare(this.#svg_group, this.#style, square_size, i, j);
      }
    }
  }

  /*
   * @param grid - a model object which represents a grouped grid
   * @effects - updates the SVG image to reflect the groupings given in grid
   * @throws - Error if the grid dimensions do not match the dimensions of the SVG image
   */
  updateBorders(grid) {
    if (grid.getGridRows === null || grid.getGridColumns === null || grid.getCellId === null) {
      throw new Error(`Invalid grid object!`);
    }

    if (grid.getGridRows() !== this.#rows || grid.getGridColumns() !== this.#columns) {
      throw new Error(`Invalid grid dimensions! Expected ${this.#rows} x ${this.#columns}`);
    }

    for (let i = 0; i < this.#rows; i++) {
      for (let j = 0; j < this.#columns; j++) {
        this.#svg_grid[i][j].left.attr('class', SVGGridGUI.#getGridLineStyle(grid, this.#style, grid.getCellId(i, j), i, j - 1));
        this.#svg_grid[i][j].bottom.attr('class', SVGGridGUI.#getGridLineStyle(grid, this.#style, grid.getCellId(i, j), i + 1, j));
        this.#svg_grid[i][j].right.attr('class', SVGGridGUI.#getGridLineStyle(grid, this.#style, grid.getCellId(i, j), i, j + 1));
        this.#svg_grid[i][j].top.attr('class', SVGGridGUI.#getGridLineStyle(grid, this.#style, grid.getCellId(i, j), i - 1, j));
      }
    }
  }
}