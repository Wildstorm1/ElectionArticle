/*
 * Builds the model for a grid cut into districts
 */
class GridBuilder {
  /*
   * The grid data model
   */
  static #Grid = class {
    // The number of rows in the grid
    #rows;

    // The number of columns in the grid
    #columns;

    // The width of the grid
    #width;

    // The height of the grid
    #height;

    // A 2D array holding the cells of the grid
    #grid2d;

    /*
     * @param rows - the number of rows in the grid
     * @param columns - the number of columns in the grid
     * @param width - the width of the grid
     * @param height - the height of the grid
     * @param cells - a 2D array containing every cell in the grid
     * @requires rows >= 1, columns >= 1, width > 0, height > 0, and cells has size rows x columns
     * @note takes ownership of cells
     */
    constructor(rows, columns, width, height, cells) {
      this.#rows = rows;
      this.#columns = columns;
      this.#width = width;
      this.#height = height;
      this.#grid2d = cells;
    }

    /*
     * @param i - the index of the row
     * @param j - the index of the column
     * @return the cell at i, j
     * @requires 0 <= i < getNumRows(), 0 <= j < getNumColumns()
     */
    getCell(i, j) {
      if (i < 0 || i >= this.getNumRows()) {
        throw new Error(`Invalid i: ${i}`);
      }

      if (j < 0 || j >= this.getNumColumns()) {
        throw new Error(`Invalid j: ${j}`);
      }

      return this.#grid2d[i][j];
    }

    /*
     * @param x - the x coordinate to locate
     * @param y - the y coordinate to locate
     * @return the cell that the point x, y is located within
     * @requires 0 <= x < width, 0 <= y < height
     */
    computeCell(x, y) {
      if (x < 0 || x >= this.#width) {
        throw new Error(`Invalid x: ${x}`);
      }

      if (y < 0 || y >= this.#height) {
        throw new Error(`Invalid y: ${y}`);
      }

      let gi = Math.floor((y / this.#height) * this.#rows);
      let gj = Math.floor((x / this.#width) * this.#columns);

      return this.#grid2d[gi][gj];
    }

    /*
     * @return the number of rows in the grid
     */
    getNumRows() {
      return this.#rows;
    }

    /*
     * @return the number of columns in the grid
     */
    getNumColumns() {
      return this.#columns;
    }

    /*
     * @return the height of the grid
     */
    getHeight() {
      return this.#height;
    }

    /*
     * @return the width of the grid
     */
    getWidth() {
      return this.#width;
    }
  }

  // A map of maps which track the row, column pairs assigned so far
  #build_map;

  // The number of rows
  #rows;

  // The number of columns
  #columns;

  // The height of the grid
  #height;

  // The width of the grid
  #width;

  constructor() {
    this.#build_map = new Map();
    this.#columns = -1;
    this.#rows = -1;
    this.#height = -1;
    this.#width = -1;
  }

  /*
   * @param cell - the cell to set
   * @return this
   * @requires cell.getRow() >= 0, cell.getColumn >= 0
   */
  setCell(cell) {
    if (this.#build_map === null) {
      throw new Error('Builder is no longer valid!');
    }

    if (!cell) {
      throw new Error('Cell is falsy');
    }

    let i = cell.getRow();
    let j = cell.getColumn();

    if (i < 0) {
      throw new Error(`Invalid i < 0: i = ${i}`);
    }

    if (j < 0) {
      throw new Error(`Invalid j < 0: j = ${j}`);
    }

    if (!this.#build_map.has(i)) {
      this.#build_map.set(i, new Map());
    }

    let row_map = this.#build_map.get(i);
    row_map.set(j, cell);

    return this;
  }

  /*
   * @param width - the width of the grid
   * @return this
   * @requires width > 0
   */
  setWidth(width) {
    if (this.#build_map === null) {
      throw new Error('Builder is no longer valid!');
    }

    if (width <= 0) {
      throw new Error(`Width <= 0: width = ${width}`);
    }

    this.#width = width;
    return this;
  }

  /*
   * @param height - the height of the grid
   * @return this
   * @requires height > 0
   */
  setHeight(height) {
    if (this.#build_map === null) {
      throw new Error('Builder is no longer valid!');
    }

    if (height <= 0) {
      throw new Error(`Height <= 0: height = ${height}`);
    }

    this.#height = height;
    return this;
  }

  /*
   * @param columns - the number of columns in the grid
   * @return this
   * @requires columns >= 1
   */
  setColumns(columns) {
    if (this.#build_map === null) {
      throw new Error('Builder is no longer valid!');
    }

    if (columns < 1) {
      throw new Error(`Columns < 1: columns = ${columns}`);
    }

    this.#columns = columns;
    return this;
  }

  /*
   * @param rows - the number of rows in the grid
   * @return this
   * @requires rows >= 1
   */
  setRows(rows) {
    if (this.#build_map === null) {
      throw new Error('Builder is no longer valid!');
    }

    if (rows < 1) {
      throw new Error(`Rows < 1: rows = ${rows}`);
    }

    this.#rows = rows;
    return this;
  }

  /*
   * @return a new Grid object
   * @requires all cells within the specified size are assigned and no extraneous cells were set
   * @effects further calls to this builder will throw an error
   */
  build() {
    if (this.#build_map === null) {
      throw new Error('Builder is no longer valid!');
    }

    if (this.#rows === -1) {
      throw new Error('Rows not set.');
    }

    if (this.#columns === -1) {
      throw new Error('Columns not set.');
    }

    if (this.#height === -1) {
      throw new Error('Height not set.');
    }

    if (this.#width === -1) {
      throw new Error('Width not set.');
    }

    let cells = [];

    for (let i = 0; i < this.#rows; i++) {
      let row = [];

      for (let j = 0; j < this.#columns; j++) {
        row.push(null);
      }

      cells.push(row);
    }

    let count = 0;
    let rows = this.#build_map.keys();

    for (const i of rows) {
      if (i < 0 || i >= this.#rows) {
        throw new Error(`Invalid row index given: ${i}`);
      }

      let row_map = this.#build_map.get(i);
      let columns = row_map.keys();

      for (const j of columns) {
        if (j < 0 || j >= this.#columns) {
          throw new Error(`Invalid column index given: ${j}`);
        }

        let cell = row_map.get(j);
        cells[i][j] = cell;
        count++;
      }
    }

    if (count !== this.#rows * this.#columns) {
      throw new Error('Missing cells, not all cells assigned!');
    }

    this.#build_map = null;
    return new GridBuilder.#Grid(this.#rows, this.#columns, this.#width, this.#height, cells);
  }
}