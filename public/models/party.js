/*
 * The data-model for a registered party
 */
class Party {
  // The id of the party
  #party_id;

  // The name of the party
  #party_name;

  /*
   * @param id - the id of the party
   * @param name - the name of the party
   * @requires id to be immutable
   */
  constructor(id, name) {
    this.#party_id = id;
    this.#party_name = name;
  }

  /*
   * @return the id of the party
   */
  getPartyId() {
    return this.#party_id;
  }

  /*
   * @return the name of the party
   */
  getPartyName() {
    return this.#party_name;
  }
}