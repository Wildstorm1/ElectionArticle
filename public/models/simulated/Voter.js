/*
 * Represents a voter
 */
class Voter {
  // The position the voter is located at
  #position;

  // The party the voter belongs to
  #party;

  /*
   * @param position - the position the voter is located at
   * @param party - the party the voter belongs to
   */
  constructor(position, party) {
    this.#position = position;
    this.#party = party;
  }

  /*
   * @return the position the voter is located at
   */
  getPosition() {
    return this.#position;
  }

  /*
   * @return the party the voter belongs to
   */
  getParty() {
    return this.#party;
  }
}