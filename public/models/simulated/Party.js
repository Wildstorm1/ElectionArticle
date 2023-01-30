/*
 * Represents a political party that voters identify with
 */
class Party {
  // The official party name
  #name;

  /*
   * @param name - the name of the party
   */
  constructor(name) {
    this.#name = name;
  }

  /*
   * @return the name of the party
   */
  getPartyName() {
    return this.#name;
  }
}