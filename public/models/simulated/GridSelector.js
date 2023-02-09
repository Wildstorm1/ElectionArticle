/*
 * Builds the main model for the visual
 */
class GridSelectorBuilder {
  /*
   * The state of a voter in the grid
   */
  static #GridVoterState = class {
    // The voter
    #voter;

    // The cell the voter belongs to
    #cell;

    /*
     * @param voter - the voter
     * @param cell - the cell the voter belongs to
     */
    constructor(voter, cell) {
      if (!voter) {
        throw new Error('Voter is falsy!');
      }

      if (!cell) {
        throw new Error('Cell is falsy!');
      }

      this.#voter = voter;
      this.#cell = cell;
    }

    /*
     * @return the voter
     */
    getVoter() {
      return this.#voter;
    }

    /*
     * @return the cell that the voter is within
     */
    getCell() {
      return this.#cell;
    }
  }

  /*
   * The state of a cell in the grid
   */
  static #GridCellState = class {
    // The cell
    #cell;

    /*
     * @param cell - the cell
     */
    constructor(cell) {
      if (!cell) {
        throw new Error('Cell is falsy!');
      }

      this.#cell = cell;
    }

    /*
     * @return the cell
     */
    getCell() {
      return this.#cell;
    }
  }

  /*
   * The main model, a population of voters and a list of grids. This model cycles though a fixed
   * set of grids with a fixed population.
   */
  static #Selector = class extends KeyedProducer {
    // An array containing all grids that can be cycled though
    #grid_array;

    // The index of the current active grid
    #grid_index;

    // The population of voters
    #population;

    /*
     * @param population - the population of voters
     * @param grids - an array of grids the voters will cycle though
     */
    constructor(population, grids) {
      if (!population) {
        throw new Error('Population is falsy!');
      }

      if (!grids) {
        throw new Error('Grids is falsy!');
      }

      super();
      this.registerEventKey('GridCells');
      this.registerEventKey('Voters');

      this.#grid_array = grids;
      this.#grid_index = -1;
      this.#population = population;
    }

    /*
     * @effects advances the model to the next state of interest
     */
    update() {
      this.#grid_index = (this.#grid_index + 1) % this.#grid_array.length;
      let grid = this.#grid_array[this.#grid_index];
      let voter_list = [];

      for (const voter of this.#population) {
        let position = voter.getPosition();
        let cell = grid.computeCell(position.getX(), position.getY());
        let state = new GridSelectorBuilder.#GridVoterState(voter, cell);
        voter_list.push(state);
      }

      let rows = grid.getNumRows();
      let columns = grid.getNumColumns();
      let cell_list = [];

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          let cell = grid.getCell(i, j);
          let state = new GridSelectorBuilder.#GridCellState(cell);
          cell_list.push(state);
        }
      }

      this.sendEvent('Voters', new StateChangeEvent(voter_list));      
      this.sendEvent('GridCells', new StateChangeEvent(cell_list));
    }
  }

  // The population model
  #population;

  // Array of grids
  #grids;

  constructor() {
    this.#population = null;
    this.#grids = [];
  }

  /*
   * @param population - the population to use
   * @return this
   */
  setPopulation(population) {
    if (this.#grids === null) {
      throw new Error('Builder is no longer valid!');
    }

    this.#population = population;
    return this;
  }

  /*
   * @param grid - the grid to add to the list of grids
   * @return this
   */
  addGrid(grid) {
    if (this.#grids === null) {
      throw new Error('Builder is no longer valid!');
    }

    this.#grids.push(grid);
    return this;
  }

  /*
   * @return the new constructed model
   * @requires that population and at least one grid has been set
   * @effects further calls to this builder will throw an error
   */
  build() {
    if (this.#grids === null) {
      throw new Error('Builder is no longer valid!');
    }

    if (this.#grids.length === 0) {
      throw new Error('Must supply at least one grid!');
    }

    if (this.#population === null) {
      throw new Error('Must supply a population!');
    }

    let model = new GridSelectorBuilder.#Selector(this.#population, this.#grids);
    this.#population = null;
    this.#grids = null;
    return model;
  }
}