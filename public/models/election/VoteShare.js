/*
 * Builds a vote share
 */
class VoteShareBuilder {
  /*
   * The vote share data model
   */
  static #VoteShare = class {
    // The map of party -> amount
    #vote_map;

    // The cumulative sum of all amounts
    #total;

    /*
     * @param vote_map - a map of party -> amount
     */
    constructor(vote_map) {
      this.#total = 0;

      for (const party of vote_map.keys()) {
        this.#total += vote_map.get(party);
      }

      this.#vote_map = vote_map;
    }

    /*
     * @return an iterable of the parties in the vote share
     */
    getParties() {
      return this.#vote_map.keys();
    }

    /*
     * @param party - the party in the vote share
     * @return the amount for the party, or 0 if the party does not exist
     */
    getPartyAmount(party) {
      let amount = 0;

      if (this.#vote_map.has(party)) {
        amount = this.#vote_map.get(party);
      }

      return amount;
    }

    /*
     * @param party - the party in the vote share
     * @return the percentage of the party, or 0 if the party does not exist
     */
    getPartyPercent(party) {
      let amount = 0;

      if (this.#vote_map.has(party)) {
        amount = this.#vote_map.get(party);
      }

      return amount / this.#total;
    }
  }

  // A map of party -> amount
  #party_map;

  constructor() {
    this.#party_map = new Map();
  }

  /*
   * @param party - the party to set the amount for
   * @param amount - the amount to set
   * @requires amount >= 0
   * @return this
   */
  setPartyAmount(party, amount) {
    if (this.#party_map === null) {
      throw new Error('Builder is no longer valid!');
    }

    if (!party) {
      throw new Error('Party is falsy!');
    }

    if (amount < 0) {
      throw new Error('Amount must be >= 0!');
    }

    this.#party_map.set(party, amount);
    return this;
  }

  /*
   * @return a new VoteShare object
   * @effects further calls to this builder will throw an error
   */
  build() {
    if (this.#party_map === null) {
      throw new Error('Builder is no longer valid!');
    }

    let share = new VoteShareBuilder.#VoteShare(this.#party_map);
    this.#party_map = null;
    return share;
  }
}