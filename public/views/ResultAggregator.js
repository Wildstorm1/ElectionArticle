/*
 * This view aggregates overall and per-district results
 */
class ResultAggregator {
  /*
   * The event that is created when aggregated results change
   */
  static #ResultEvent = class {
    // A map of district results
    #districts;

    // A map of overall results
    #overall;

    /*
     * @param district_map - a map of district results Map[district -> Map[party -> count]]
     * @param overall_map - a map of overall results Map[party -> { vote_percent, num_winners }]
     */
    constructor(district_map, overall_map) {
      if (!district_map) {
        throw new Error('District map is falsy!');
      }

      if (!overall_map) {
        throw new Error('Overall map is falsy!');
      }

      this.#districts = district_map;
      this.#overall = overall_map;
    }

    /*
     * @return an iterable of parties in the results
     */
    getParties() {
      return this.#overall.keys();
    }

    /*
     * @return an iterable of districts in the results
     */
    getDistricts() {
      return this.#districts.keys();
    }

    /*
     * @return the number of districts
     */
    getNumDistricts() {
      return this.#districts.size;
    }

    /*
     * @param party - the party to get percent results of
     * @return the overall percentage this party captures
     */
    getPartyPercent(party) {
      if (!this.#overall.has(party)) {
        return 0;
      }

      return this.#overall.get(party).vote_percent;
    }

    /*
     * @param party - the party to get the number of representatives for
     * @return the number of representatives from this party
     */
    getRepresentatives(party) {
      if (!this.#overall.has(party)) {
        return 0;
      }

      return this.#overall.get(party).num_winners;
    }

    /*
     * @param district - the district to get voters for
     * @param party - the party to get voters of
     * @return the number of voters of the given party in the given district, or 0 if party or district doesn't exist
     */
    getDistrictVotersByParty(district, party) {
      if (!this.#districts.has(district)) {
        return 0;
      }

      let district_map = this.#districts.get(district);

      if (!district_map.has(party)) {
        return 0;
      }

      return district_map.get(party);
    }
  }

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

    let agg_event = new ResultAggregator.#ResultEvent(this.#district_results, this.#overall_results);
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