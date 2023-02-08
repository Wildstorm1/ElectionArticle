/*
 * Builds the main model for the visual
 */
class MapSelectorBuilder {
  /*
   * The state of a precinct in the state
   */
  static #PrecinctState = class {
    // The precinct
    #precinct;

    /*
     * @param precinct - the precinct
     */
    constructor(precinct) {
      if (!precinct) {
        throw new Error('Precinct is falsy!');
      }

      this.#precinct = precinct;
    }

    /*
     * @return the precinct
     */
    getPrecinct() {
      return this.#precinct;
    }
  }

  /*
   * The state of a district in the state
   */
  static #DistrictState = class {
    // The district
    #district;

    /*
     * @param district - the district
     */
    constructor(district) {
      if (!district) {
        throw new Error('District is falsy!');
      }

      this.#district = district;
    }

    /*
     * @return the district
     */
    getDistrict() {
      return this.#district;
    }
  }

  /*
   * The main model, a set of states full of districts composed of precincts
   */
  static #Selector = class {
    // An array containing all states that can be cycled though
    #states_array;

    // The index of the current active state
    #states_index;

    // A data structure containing the current observers Map[event -> Map[observer -> callback]]
    #observers;

    /*
     * @param states - the list of state election models
     */
    constructor(states) {
      if (!states) {
        throw new Error('States is falsy!');
      }

      this.#states_array = states;
      this.#states_index = -1;

      let event_map = new Map();
      event_map.set('Districts', new Map());
      event_map.set('Precincts', new Map());
      event_map.set('Statewide', new Map());

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
      this.#states_index = (this.#states_index + 1) % this.#states_array.length;
      let state = this.#states_array[this.#states_index];
      let districts = state.getDistricts();
      let district_events = [];

      for (let i = 0; i < districts.length; i++) {
        district_events.push(new MapSelectorBuilder.#DistrictState(districts[i]));
      }

      let precincts = state.getPrecincts();
      let precinct_events = [];

      for (let i = 0; i < precincts.length; i++) {
        precinct_events.push(new MapSelectorBuilder.#PrecinctState(precincts[i]));
      }

      let statewide = state.getStatewideResults();
      this.#sendEvent('Districts', new StateChangeEvent(district_events));      
      this.#sendEvent('Precincts', new StateChangeEvent(precinct_events));
      this.#sendEvent('Statewide', new StatewideEvent(statewide));
    }

    /*
     * @param event - the event to subscribe to
     * @param observer - the object which is interested in consuming events
     * @param callback - the function which will be called on an event
     * @requires event to be 'Districts', 'Precincts' or 'Statewide and callback to be function(event)
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
     * @requires event to be 'Districts', 'Precincts' or 'Statewide and observer to be object supplied to subscribe
     */
    unsubscribe(event, observer) {
      if (!this.#observers.has(event)) {
        throw new Event('Event identifier is not valid.');
      }

      let event_listeners = this.#observers.get(event);
      event_listeners.remove(observer);
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