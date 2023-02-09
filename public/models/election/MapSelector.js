/*
 * Builds the main model for the visual
 */
class MapSelectorBuilder {
  /*
   * The state of an electoral unit in the state map
   */
  static #ElectoralUnitState = class {
    // The electoral unit
    #unit;

    /*
     * @param unit - the electoral unit
     */
    constructor(unit) {
      if (!unit) {
        throw new Error('Electoral unit is falsy!');
      }

      this.#unit = unit;
    }

    /*
     * @return the electoral unit
     */
    getElectoralUnit() {
      return this.#unit;
    }
  }

  /*
   * The main model, a set of states full of districts composed of precincts
   */
  static #Selector = class extends KeyedProducer {
    // An array containing all states that can be cycled though
    #states_array;

    // The index of the current active state
    #states_index;

    /*
     * @param states - the list of state election models
     */
    constructor(states) {
      if (!states) {
        throw new Error('States is falsy!');
      }

      super();
      this.registerEventKey('Districts');
      this.registerEventKey('Statewide');
      this.registerEventKey('Precincts');

      this.#states_array = states;
      this.#states_index = -1;
    }

    /*
     * @effects advances the model to the next state of interest
     */
    update() {
      this.#states_index = (this.#states_index + 1) % this.#states_array.length;
      let state = this.#states_array[this.#states_index];
      let districts = state.getDistricts();
      let district_events = [];

      for (let i = 0; i < districts.length; i++) {
        district_events.push(new MapSelectorBuilder.#ElectoralUnitState(districts[i]));
      }

      let precincts = state.getPrecincts();
      let precinct_events = [];

      for (let i = 0; i < precincts.length; i++) {
        precinct_events.push(new MapSelectorBuilder.#ElectoralUnitState(precincts[i]));
      }

      let statewide = state.getStatewideResults();
      this.sendEvent('Districts', new StateChangeEvent(district_events));      
      this.sendEvent('Precincts', new StateChangeEvent(precinct_events));
      this.sendEvent('Statewide', new StatewideEvent(statewide));
    }
  }

  // A list of states
  #states;

  constructor() {
    this.#states = [];
  }

  /*
   * @param state - the state to add to the list of states
   * @return this
   */
  addState(state) {
    if (this.#states === null) {
      throw new Error('Builder is no longer valid!');
    }

    this.#states.push(state);
    return this;
  }

  /*
   * @return the new constructed model
   * @requires at least one state has been set
   * @effects further calls to this builder will throw an error
   */
  build() {
    if (this.#states === null) {
      throw new Error('Builder is no longer valid!');
    }

    if (this.#states.length === 0) {
      throw new Error('Must supply at least one state!');
    }

    let model = new MapSelectorBuilder.#Selector(this.#states);
    this.#states = null;
    return model;
  }
}