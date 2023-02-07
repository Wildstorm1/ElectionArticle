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
   * The event produced when the model changes
   */
  static #GridEvent = class {
    // The array of model state objects
    #state;

    /*
     * @param states - an array of objects containing model state
     */
    constructor(states) {
      if (!states) {
        throw new Error('States is falsy!');
      }

      this.#state = states;
    }

    /*
     * @return an iterator over the state of the grid
     */
    [Symbol.iterator]() {
      let index = 0;

      return {
        next: () => {
          if (index >= this.#state.length) {
            return { done: true };
          }

          let state = this.#state[index];
          index++;
          return { done: false, value: state };
        },

        return: (value) => {
          index = -1;
          return { done: true, value: value };
        },

        throws: (exception) => {
          index = -1;
          return { done: true };
        }
      }
    }
  }

  /*
   * The main model, a population of voters and a list of grids. This model cycles though a fixed
   * set of grids with a fixed population.
   */
  static #Selector = class {
    // An array containing all grids that can be cycled though
    #grid_array;

    // The index of the current active grid
    #grid_index;

    // The population of voters
    #population;

    // A data structure containing the current observers Map[event -> Map[observer -> callback]]
    #observers;

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

      this.#grid_array = grids;
      this.#grid_index = -1;
      this.#population = population;

      let event_map = new Map();
      event_map.set('GridCells', new Map());
      event_map.set('Voters', new Map());

      this.#observers = event_map;
    }

    /*
     * @param event_name - the name defining the handler to invoke
     * @param event - the event object to send
     */
    #sendEvent(event_name, event) {
      let event_map = this.#observers.get(event_name);
      let observers = event_map.keys();

      for (const observer of observers) {
        let callback = event_map.get(observer);
        callback(event);
      }
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

      this.#sendEvent('Voters', new GridSelectorBuilder.#GridEvent(voter_list));      
      this.#sendEvent('GridCells', new GridSelectorBuilder.#GridEvent(cell_list));
    }

    /*
     * @param event - the event to subscribe to
     * @param observer - the object which is interested in consuming events
     * @param callback - the function which will be called on an event
     * @requires event to be 'GridCells', or 'Voters' and callback to be function(event)
     */
    subscribe(event, observer, callback) {
      if (!this.#observers.has(event)) {
        throw new Event('Event identifier is not valid.');
      }

      let event_listeners = this.#observers.get(event);
      event_listeners.set(observer, callback);
    }

    /*
     * @param event - the event to unsubscribe from
     * @param observer - the object which is no longer interested in consuming events
     * @requires event to be 'GridCells', or 'Voters' and observer to be object supplied to subscribe
     */
    unsubscribe(event, observer) {
      if (!this.#observers.has(event)) {
        throw new Event('Event identifier is not valid.');
      }

      let event_listeners = this.#observers.get(event);
      event_listeners.remove(observer);
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