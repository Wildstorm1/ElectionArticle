/*
 * Builds a statewide precinct election
 */
class PrecinctElectionBuilder {
  /*
   * The precinct data model
   */
  static #PrecinctElection = class {
    // The path shape of the precinct
    #path;

    // The county the precinct is within
    #county;

    // The precinct id
    #id;

    // The vote share of the precinct
    #votes;

    /*
     * @param path - the shape path of the precinct
     * @param county - the county the precinct is in
     * @param id - the id of the precinct
     * @param votes - the vote distribution in the precinct
     */
    constructor(path, county, id, votes) {
      this.#path = path;
      this.#county = county;
      this.#id = id;
      this.#votes = votes;
    }

    /*
     * @return the shape path
     */
    getShapePath() {
      return this.#path;
    }

    /*
     * @return the county the precinct is within
     */
    getCounty() {
      return this.#county;
    }

    /*
     * @return the id of the precinct
     */
    getId() {
      return this.#id;
    }

    /*
     * @param the vote distribution in the precinct
     */
    getVoteShare() {
      return this.#votes;
    }
  }

  // The path shape of the precinct
  #path;

  // The county of the precinct
  #county;

  // The precinct id
  #id;

  // The vote share of the precinct
  #votes;

  constructor() {
    this.#path = null;
    this.#county = null;
    this.#id = null;
    this.#votes = null;
  }

  /*
   * @param path - the path that forms the shape of the precinct
   * @return this
   */
  setShapePath(path) {
    if (this.#path === -1) {
      throw new Error('Builder is no longer valid!');
    }

    if (!path) {
      throw new Error('Path is falsy!');
    }

    this.#path = path;
    return this;
  }

  /*
   * @param county - the county the precinct is in
   * @return this
   */
  setCounty(county) {
    if (this.#county === -1) {
      throw new Error('Builder is no longer valid!');
    }

    if (!county) {
      throw new Error('County is falsy!');
    }

    this.#county = county;
    return this;
  }

  /*
   * @param id - the id of the precinct
   * @return this
   */
  setId(id) {
    if (this.#id === -1) {
      throw new Error('Builder is no longer valid!');
    }

    if (!id) {
      throw new Error('Id is falsy!');
    }

    this.#id = id;
    return this;
  }

  /*
   * @param votes - the vote distribution in the precinct
   * @return this
   */
  setVoteShare(votes) {
    if (this.#votes === -1) {
      throw new Error('Builder is no longer valid!');
    }

    if (!votes) {
      throw new Error('Votes is falsy!');
    }

    this.#votes = votes;
    return this;
  }

  /*
   * @return a new Precinct object
   * @requires all fields to be set
   * @effects further calls to this builder will throw an error
   */
  build() {
    if (this.#path === -1) {
      throw new Error('Builder is no longer valid!');
    }

    if (this.#path === null) {
      throw new Error('Path must be set!');
    }

    if (this.#county === null) {
      throw new Error('County must be set!');
    }

    if (this.#id === null) {
      throw new Error('Id must be set!');
    }

    if (this.#votes === null) {
      throw new Error('Votes must be set!');
    }

    let precinct = new PrecinctElectionBuilder.#PrecinctElection(this.#path, this.#county, this.#id, this.#votes);

    this.#path = -1;
    this.#county = -1;
    this.#id = -1;
    this.#votes = -1;

    return precinct;
  }
}