/*
 * Builds a model for a population of voters
 */
class PopulationBuilder {
  /*
   * The population data model
   */
  static #Population = class {
    // The population array
    #voters;

    /*
     * @param voters - a 1D array of voters in the population
     * @note takes ownership over voters
     */
    constructor(voters) {
      this.#voters = voters;
    }

    /*
     * @return an iterator over all voters in the population
     */
    [Symbol.iterator]() {
      let index = 0;

      return {
        next: () => {
          if (index >= this.#voters.length) {
            return { done: true };
          }

          let voter = this.#voters[index];
          index++;
          return { done: false, value: voter };
        },

        return: (value) => {
          index = -1;
          return { done: true, value: value };
        },

        throws: (exception) => {
          index = -1;
          return { done: true };
        }
      }
    }
  }

  // An array of voters added to the builder
  #voters;

  constructor() {
    this.#voters = [];
  }

  /*
   * @param voter - a voter to add to the population
   * @return this
   */
  addVoter(voter) {
    if (this.#voters === null) {
      throw new Error('Builder is no longer valid!');
    }

    this.#voters.push(voter);
    return this;
  }

  /*
   * @return a new population model
   * @effects further calls to this builder will throw an error
   */
  build() {
    if (this.#voters === null) {
      throw new Error('Builder is no longer valid!');
    }

    let model = new PopulationBuilder.#Population(this.#voters);
    this.#voters = null;
    return model;
  }
}