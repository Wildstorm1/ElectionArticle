/*
 * This view aggregates overall and per-district results
 */
class GridResultAggregator {
  // A data structure containing the current observers Map[observer -> callback]
  #observers;

  // A map of overall results Map[party -> count]
  #overall_results;

  // A map of district results Map[district -> Map[party -> count]]
  #district_results

  /*
   * @param subject - the subject to consume events from
   */
  constructor(subject) {
    if (!subject) {
      throw new Error('Subject is falsy!');
    }

    this.#observers = new Map();
    this.#overall_results = new Map();
    this.#district_results = new Map();

    subject.subscribe('Voters', this, (event) => { this.#onModelUpdate(event); });
  }

  /*
   * @param event - the event to send
   */
  #sendEvent(event) {
    let observers = this.#observers.keys();

    for (const observer of observers) {
      let callback = this.#observers.get(observer);
      callback(event);
    }
  }

  /*
   * @param map - the map to modify
   * @param party - the party to add / increment
   */
  #incrementParty(map, party) {
    if (!map.has(party)) {
      map.set(party, 0);
    }

    map.set(party, map.get(party) + 1);
  }

  /*
   * @param event - the event received
   */
  #onModelUpdate(event) {
    let district_counts = new Map();
    let overall_counts = new Map();
    let voters = 0;

    for (const state of event) {
      let voter = state.getVoter();
      let cell = state.getCell();
      let party = voter.getParty();
      let district = cell.getDistrict();

      this.#incrementParty(overall_counts, party);

      if (!district_counts.has(district)) {
        district_counts.set(district, new Map());
      }
  
      let district_map = district_counts.get(district);
      this.#incrementParty(district_map, party);
      voters++;
    }

    this.#overall_results = new Map();
    this.#district_results = district_counts;

    for (const party of overall_counts.keys()) {
      this.#overall_results.set(party, { vote_percent: overall_counts.get(party) / voters, num_winners: 0 });
    }

    for (const district of district_counts.keys()) {
      let district_map = district_counts.get(district);
      let max_voters = -1;
      let max_party = null;

      for (const party of district_map.keys()) {
        let voters = district_map.get(party);

        if (voters > max_voters) {
          max_voters = voters;
          max_party = party;
        }
      }

      this.#overall_results.get(max_party).num_winners++;
    }

    let agg_event = new ResultEvent(this.#district_results, this.#overall_results);
    this.#sendEvent(agg_event);
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