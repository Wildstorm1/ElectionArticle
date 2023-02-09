/*
 * A base class which can be extended to handle allowing objects to be subscribed
 * and unsubscribed to named event handlers.
 */
class KeyedProducer {
  // A data structure containing the current observers Map[event -> Map[observer -> callback]]
  #observers;

  constructor() {
    this.#observers = new Map();
  }

  /*
   * @param event_key - the name defining a new handler
   * @note - for internal use only
   */
  registerEventKey(event_key) {
    if (!this.#observers.has(event_key)) {
      this.#observers.set(event_key, new Map());
    }
  }

  /*
   * @param event_key - the name defining the handler to invoke
   * @param event - the event object to send
   * @note - for internal use only
   */
  sendEvent(event_key, event) {
    let event_map = this.#observers.get(event_key);
    let observers = event_map.keys();

    for (const observer of observers) {
      let callback = event_map.get(observer);
      callback(event);
    }
  }

  /*
   * @param event_key - the event to subscribe to
   * @param observer - the object which is interested in consuming events
   * @param callback - the function which will be called on an event
   * @requires event to be 'GridCells', or 'Voters' and callback to be function(event)
   */
  subscribe(event_key, observer, callback) {
    if (!this.#observers.has(event_key)) {
      throw new Event('Event identifier is not valid.');
    }

    let event_listeners = this.#observers.get(event_key);
    event_listeners.set(observer, callback);
  }

  /*
   * @param event_key - the event to unsubscribe from
   * @param observer - the object which is no longer interested in consuming events
   * @requires event to be 'GridCells', or 'Voters' and observer to be object supplied to subscribe
   */
  unsubscribe(event_key, observer) {
    if (!this.#observers.has(event_key)) {
      throw new Event('Event identifier is not valid.');
    }

    let event_listeners = this.#observers.get(event_key);
    event_listeners.remove(observer);
  }
}