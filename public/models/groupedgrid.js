/*
 * The data-model for a grouped grid
 */
class GroupedGrid {
  // Map of all id's in the grid
  #keys;

  // Number of columns in the grid
  #columns;

  // Number of row in the grid
  #rows;

  // 2D array of cell ids
  #grid;

  /*
   * @param grid_rows - the number of rows in the grid  
   * @param grid_columns - the number of columns in the grid
   * @effects - creates a grid with all cells defaulting to group 0
   * @requires grid_rows and grid_columns > 0
   * @throws Error if grid_rows or grid_columns <= 0
   */
  constructor(grid_rows, grid_columns) {
    if (grid_rows <= 0) {
      throw new Error('Grid rows <= 0');
    }

    if (grid_columns <= 0) {
      throw new Error('Grid columns <= 0');
    }

    this.#columns = grid_columns;
    this.#rows = grid_rows;
    this.#grid = new Array(grid_rows);
    this.#keys = new Map();

    for (let i = 0; i < this.#rows; i++) {
      this.#grid[i] = new Array(this.#columns);

      for (let j = 0; j < this.#columns; j++) {
        this.#grid[i][j] = 0;
      }
    }

    this.#keys.set(0, grid_rows * grid_columns);
  }

  /*
   * @param grid - a 2D array filled with initial cell group ids
   * @returns a new GroupedGrid initialized with the contents of grid
   * @requires grid to be a 2D array with at least 1 row and 1 column
   * @throws Error if grid is not a valid 2D array
   */
  static newGridFromArray(grid) {
    if (!grid) {
      throw new Error('Grid is falsy');
    }

    if (!grid.length || grid.length == 0) {
      throw new Error('Grid is invalid or has invalid number of rows');
    }

    if (!grid[0].length || grid[0].length == 0) {
      throw new Error('Grid is invalid or has invalid number of columns');
    }

    let groupings = new GroupedGrid(grid.length, grid[0].length);

    for (let r = 0; r < groupings.getGridRows(); r++) {
      for (let c = 0; c < groupings.getGridColumns(); c++) {
        groupings.setCellId(r, c, grid[r][c]);
      }
    }

    return groupings;
  }

  /*
   * @param i - the row index of the cell
   * @param j - the column index of the cell
   * @param id - the id to assign to the cell
   * @return the previous id assigned to the cell
   */
  setCellId(i, j, id) {
    let val = this.getCellId(i, j);
    this.#keys.set(val, this.#keys.get(val) - 1);
    this.#keys.set(id, this.#keys.has(id) ? this.#keys.get(id) + 1 : 1 );

    if (this.#keys.get(val) === 0) {
      this.#keys.delete(val);
    }

    this.#grid[i][j] = id;
    return val;
  }

  /*
   * @param i - the row index of the cell
   * @param j - the column index of the cell
   * @return the id assigned to the cell
   */
  getCellId(i, j) {
    return this.#grid[i][j];
  }

  /*
   * @return the number of rows in the grid
   */
  getGridRows() {
    return this.#rows;
  }

  /*
   * @return the number of columns in the grid
   */
  getGridColumns() {
    return this.#columns;
  }

  /*
   * @return the number of unique ids that are contained inside the grid
   */
  getNumberUniqueIds() {
    return this.#keys.size;
  }
}