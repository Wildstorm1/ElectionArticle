/*
 * The data-model for a group of voters
 */
class VoterStats {
  // The district number these voters belong to
  #district;

  // A map containing party -> members
  #voters_map;

  /*
   * @param district - the district number these voters belong to
   */
  constructor(district) {
    this.#district = district;
    this.#voters_map = new Map();
  }

  /*
   * @return the district number these voters belong to
   */
  getDistrictNumber() {
    return this.#district;
  }

  /*
   * @return an array of all parties which voters in this pool belong to
   */
  getParties() {
    let results = [];
    let keys = this.#voters_map.keys();

    for (const key of keys) {
      results.push(key);
    }

    return results;
  }

  /*
   * @return an array of all parties which voters belong to sorted by number of members
   */
  getPartiesByVoters() {
    let results = [];
    let keys = this.#voters_map.keys();

    for (const key of keys) {
      results.push(key);
    }

    results.sort((a, b) => {
      return this.#voters_map.get(b) - this.#voters_map.get(a);
    });

    return results;
  }

  /*
   * @param party - the party to get the numbers of members of
   * @return the number of members identify with the given party
   * @requires party to be comparable via === and non-falsy
   * @throws Error if party is falsy
   */
  getPartyVoters(party) {
    if (!party) {
      throw new Error('Party is falsy!');
    }

    let members = this.#voters_map.get(party);

    if (!members) {
      return 0;
    }

    return members;
  }

  /*
   * @param party - the party whose members should be incremented
   * @effects updates the number of members belonging to the given party
   * @requires party to be comparable via === and non-falsy
   * @throws Error if party is falsy
   */
  addVoter(party) {
    if (!party) {
      throw new Error('Party is falsy!');
    }

    if (!this.#voters_map.has(party)) {
      this.#voters_map.set(party, 0);
    }

    this.#voters_map.set(party, this.#voters_map.get(party) + 1);
  }
}