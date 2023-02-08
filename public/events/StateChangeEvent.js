/*
  * The event produced when a model changes
  */
class StateChangeEvent {
  // The array of model state update objects
  #state;

  /*
   * @param states - an array of objects containing model state
   */
  constructor(states) {
    if (!states) {
      throw new Error('States is falsy!');
    }

    this.#state = states;
  }

  /*
   * @return an iterator over the model states
   */
  [Symbol.iterator]() {
    let index = 0;

    return {
      next: () => {
        if (index >= this.#state.length) {
          return { done: true };
        }

        let state = this.#state[index];
        index++;
        return { done: false, value: state };
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