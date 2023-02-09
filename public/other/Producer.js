/*
 * A base class which can be extended to handle allowing objects to be subscribed
 * and unsubscribed to.
 */
class Producer {
  // A data structure containing the current observers Map[observer -> callback]
  #observers;

  constructor() {
    this.#observers = new Map();
  }

  /*
   * @param event - the event to send
   * @effects sends an update to all observers
   * @note - for internal use only
   */
  sendEvent(event) {
    let observers = this.#observers.keys();

    for (const observer of observers) {
      let callback = this.#observers.get(observer);
      callback(event);
    }
  }

  /*
   * @param observer - the object which is interested in consuming events
   * @param callback - the function which will be called on an event
   * @requires callback to be function(event)
   */
  subscribe(observer, callback) {
    this.#observers.set(observer, callback);
  }

  /*
   * @param observer - the object which is no longer interested in consuming events
   */
  unsubscribe(observer) {
    this.#observers.delete(observer);
  }
}