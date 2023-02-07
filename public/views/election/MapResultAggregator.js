/*
 * This view aggregates overall and per-district results
 */
class MapResultAggregator {
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

  // A map of overall results Map[party -> { vote_percent, num_winners }]
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

    subject.subscribe('Districts', this, (event) => { this.#onDistrictsUpdate(event); });
    subject.subscribe('Statewide', this, (event) => { this.#onStatewideUpdate(event); });
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
   * @param event - the event received
   */
  #onStatewideUpdate(event) {
    let overall = event.getStatewideResults();
    let exists = new Set();

    for (const party of overall.getParties()) {
      if (!this.#overall_results.has(party)) {
        this.#overall_results.set(party, { vote_percent: 0, num_winners: 0 });
      }

      this.#overall_results.get(party).vote_percent = overall.getPartyPercent(party);
      exists.add(party);
    }

    for (const party of this.#overall_results.keys()) {
      if (!exists.has(party)) {
        this.#overall_results.delete(party);
      }
    }

    let agg_event = new MapResultAggregator.#ResultEvent(this.#district_results, this.#overall_results);
    this.#sendEvent(agg_event);
  }

  /*
   * @param event - the event received
   */
  #onDistrictsUpdate(event) {
    this.#district_results = new Map();

    for (const party of this.#overall_results.keys()) {
      this.#overall_results.get(party).num_winners = 0;
    }

    for (const district_event of event) {
      let district = district_event.getDistrict();
      let id = district.getDistrictId();
      let winner = district.getWinningParty();
      let election = district.getVoteShare();

      if (!this.#overall_results.has(winner)) {
        this.#overall_results.set(winner, { vote_percent: 0, num_winners: 0 });
      }

      this.#overall_results.get(winner).num_winners++;

      let counts = new Map();
      this.#district_results.set(id, counts);

      for (const party of election.getParties()) {
        counts.set(party, election.getPartyAmount(party));
      }
    }

    let agg_event = new MapResultAggregator.#ResultEvent(this.#district_results, this.#overall_results);
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