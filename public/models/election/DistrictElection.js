/*
 * Builds a statewide district election
 */
class DistrictElectionBuilder {
  /*
   * Represents a statewide district election
   */
  static #DistrictElection = class {
    // The shape path of the district
    #path;

    // The vote share of the district
    #vote_share;

    // The id of the district
    #id;

    // The winning party
    #winner;

    /*
     * @param path - the shape path of the district
     * @param id - the id of the district
     * @param vote_share - the vote share of the election
     * @param winner - the winning party
     */
    constructor(path, id, vote_share, winner) {
      this.#path = path;
      this.#id = id;
      this.#vote_share = vote_share;
      this.#winner = winner;
    }

    /*
     * @return the shape path of the district
     */
    getShapePath() {
      return this.#path;
    }

    /*
     * @return the id of the district
     */
    getDistrictId() {
      return this.#id;
    }

    /*
     * @return the vote share of the district
     */
    getVoteShare() {
      return this.#vote_share;
    }

    /*
     * @return the winning party
     */
    getWinningParty() {
      return this.#winner;
    }
  }

  // The shape path of the district
  #path;

  // The vote share of the district
  #vote_share;

  // The id of the district
  #id;

  // The winning party
  #winner;

  constructor() {
    this.#path = null;
    this.#vote_share = null;
    this.#id = null;
    this.#winner = null;
  }

  /*
   * @param path - the path that forms the shape of the district
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
   * @param vote_share - the vote share of the district
   * @return this
   */
  setVoteShare(vote_share) {
    if (this.#vote_share === -1) {
      throw new Error('Builder is no longer valid!');
    }

    if (!vote_share) {
      throw new Error('Vote share is falsy!');
    }

    this.#vote_share = vote_share;
    return this;
  }

  /*
   * @param id - the id of the district
   * @return this
   */
  setDistrictId(id) {
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
   * @param party - the party of the winner
   * @return this
   */
  setWinningParty(party) {
    if (this.#winner === -1) {
      throw new Error('Builder is no longer valid!');
    }

    if (!party) {
      throw new Error('Party is falsy!');
    }

    this.#winner = party;
    return this;
  }

  /*
   * @return a new DistrictElection object
   * @requires all fields to be set
   * @effects further calls to this builder will throw an error
   */
  build() {
    if (this.#path === -1) {
      throw new Error('Builder is no longer valid!');
    }

    if (this.#path === null) {
      throw new Error('Must set path!');
    }

    if (this.#vote_share === null) {
      throw new Error('Must set vote share!');
    }

    if (this.#id === null) {
      throw new Error('Must set district id!');
    }

    if (this.#winner === null) {
      throw new Error('Must set party!');
    }

    let election = new DistrictElectionBuilder.#DistrictElection(this.#path, this.#id, this.#vote_share, this.#winner);

    this.#id = -1;
    this.#path = -1;
    this.#vote_share = -1;
    this.#winner = -1;

    return election;
  }
}