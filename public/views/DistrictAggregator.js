/*
 * Handles switching between aggregated districts
 */
class DistrictAggregatorBuilder {
  /*
   * The aggregator
   */
  static #DistrictAggregator = class extends Producer {
    // The current district being displayed
    #district;

    // The current district data
    #district_map;

    /*
     * @param district_subject - the subject to subscribe to for what district to display
     * @param aggregator_subject - the subject to subscribe to for data about each district
     */
    constructor(district_subject, aggregator_subject) {
      if (!district_subject) {
        throw new Error('District subject falsy!');
      }

      if (!aggregator_subject) {
        throw new Error('Aggregator subject falsy!');
      }

      super();
      this.#district = null;
      this.#district_map = new Map();

      district_subject.subscribe('MouseMove', this, (event) => { this.#onMouseEvent(event); });
      district_subject.subscribe('MouseOver', this, (event) => { this.#onMouseEvent(event); });
      district_subject.subscribe('MouseOut', this, (event) => { this.#onMouseEvent(event); });
      aggregator_subject.subscribe(this, (event) => { this.#onPopulationEvent(event); });
    }

    /*
     * @effects sends an update to all observers
     */
    #invokeEvent() {
      if (this.#district && this.#district_map.size > 0) {
        let event = new DistrictEvent(this.#district, this.#district_map.get(this.#district));
        this.sendEvent(event);
      }
    }

    /*
     * @param event - the event produced
     */
    #onPopulationEvent(event) {
      this.#district_map = new Map();

      for (const district of event.getDistricts()) {
        let map = new Map();
        this.#district_map.set(district, map);

        for (const party of event.getParties()) {
          map.set(party, event.getDistrictVotersByParty(district, party));
        }
      }

      this.#invokeEvent();
    }

    /*
     * @param event - the event produced
     */
    #onMouseEvent(event) {
      let district = event.getDistrict();

      if (district !== this.#district) {
        this.#district = district;
        this.#invokeEvent();
      }
    }
  }

  // The subject to subscribe to for what district to display
  #district_subject;

  // The subject to subscribe to for data about each district
  #aggregator_subject;

  constructor() {
    this.#aggregator_subject = null;
    this.#district_subject = null;
  }

  /*
   * @param subject - the subject to subscribe to for updates in which district to display
   * @return this
   */
  setDistrictSubject(subject) {
    if (this.#district_subject === -1) {
      throw new Error('This builder is closed!');
    }

    if (!subject) {
      throw new Error('The given subject is falsy!');
    }

    this.#district_subject = subject;
    return this;
  }

  /*
   * @param subject - the subject to subscribe to for data about each district
   * @return this
   */
  setAggregatorSubject(subject) {
    if (this.#aggregator_subject === -1) {
      throw new Error('This builder is closed!');
    }

    if (!subject) {
      throw new Error('The given subject is falsy!');
    }

    this.#aggregator_subject = subject;
    return this;
  }

  /*
   * @return the new list
   * @requires that both subjects have been set
   * @effects further calls to this builder will throw an error
   */
  build() {
    if (this.#aggregator_subject === -1) {
      throw new Error('This builder is closed!');
    }

    if (this.#district_subject === null) {
      throw new Error('The district subject must be set!');
    }

    if (this.#aggregator_subject === null) {
      throw new Error('The aggregator subject must be set!');
    }

    let list = new DistrictAggregatorBuilder.#DistrictAggregator(this.#district_subject, this.#aggregator_subject);

    this.#aggregator_subject = -1;
    this.#district_subject = -1;

    return list;
  }
}