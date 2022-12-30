/*
 * The data-model for a grouped grid
 */
class GroupedGrid {
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
   */
  constructor(grid_rows, grid_columns) {
    // TODO: check some invariants (ie, rows / cols should be > 0)

    this.#columns = grid_columns;
    this.#rows = grid_rows;
    this.#grid = new Array(grid_rows);

    for (let i = 0; i < this.#rows; i++) {
      this.#grid[i] = new Array(this.#columns);

      for (let j = 0; j < this.#columns; j++) {
        this.#grid[i][j] = 0;
      }
    }
  }

  /*
   * @param grid - a 2D array filled with initial cell group ids
   * @returns a new GroupedGrid initialized with the contents of grid
   */
  static newGridFromArray(grid) {
    // TODO: check it is a 2D grid
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
}