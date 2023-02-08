/*
 * The state of overall statewide election results
 */
class StatewideEvent {
  // The statewide results
  #results;

  /*
   * @param results - the statewide results
   */
  constructor(results) {
    if (!results) {
      throw new Error('Results is falsy!');
    }

    this.#results = results;
  }

  /*
   * @return the results
   */
  getStatewideResults() {
    return this.#results;
  }
}