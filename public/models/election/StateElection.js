/*
 * Builds results for a state
 */
class StateElectionBuilder {
  /*
   * A data model for districted state results
   */
  static #StateElection = class {
    // The statewide election results
    #statewide;

    // An array of district election results
    #districts;

    // An array of precinct election results
    #precincts;

    /*
     * @param state_wide - the state wide election results
     * @param districts - an array of districts
     * @param precincts - an array of precincts
     */
    constructor(state_wide, districts, precincts) {
      this.#statewide = state_wide;
      this.#districts = districts;
      this.#precincts = precincts;
    }

    /*
     * @return an array of district elections
     */
    getDistricts() {
      return this.#districts;
    }

    /*
     * @return an array of precinct elections
     */
    getPrecincts() {
      return this.#precincts;
    }

    /*
     * @param a vote share of overall state results
     */
    getStatewideResults() {
      return this.#statewide;
    }
  }

  // Statewide election results
  #statewide;

  // Map of districts in the state
  #districts;

  // Array of precincts in the state
  #precincts;

  constructor() {
    this.#statewide = null;
    this.#districts = new Map();
    this.#precincts = [];
  }

  /*
   * @param vote_share - the statewide vote share of the election
   * @return this
   */
  setStatewideResults(vote_share) {
    if (this.#statewide === -1) {
      throw new Error('Builder is no longer valid!');
    }

    if (!vote_share) {
      throw new Error('Vote share is falsy!');
    }

    this.#statewide = vote_share;
    return this;
  }

  /*
   * @param district - a district in the state
   * @return this
   */
  addDistrict(district) {
    if (this.#districts === -1) {
      throw new Error('Builder is no longer valid!');
    }

    if (!district) {
      throw new Error('District is falsy!');
    }

    let districtId = district.getDistrictId();
    this.#districts.set(districtId, district);
    return this;
  }

  /*
   * @param precinct - a single political unit within the state
   * @return this
   */
  addPrecinct(precinct) {
    if (this.#precincts === -1) {
      throw new Error('Builder is no longer valid!');
    }

    if (!precinct) {
      throw new Error('Precinct is falsy!');
    }

    this.#precincts.push(precinct);
    return this;
  }

  /*
   * @return a new StateElection
   * @effects further calls to this builder will throw an error
   */
  build() {
    if (this.#statewide === -1) {
      throw new Error('Builder is no longer valid!');
    }

    if (this.#statewide === null) {
      throw new Error('Must set statewide results!');
    }

    let district_array = [];

    for (const district_id of this.#districts.keys()) {
      district_array.push(this.#districts.get(district_id));
    }

    let election = new StateElectionBuilder.#StateElection(this.#statewide, district_array, this.#precincts);
    
    this.#districts = -1;
    this.#precincts = -1;
    this.#statewide = -1;

    return election;
  }
}