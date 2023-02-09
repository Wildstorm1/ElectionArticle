/*
 * This view aggregates overall and per-district results
 */
class MapResultAggregator extends Producer {
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

    super();
    this.#overall_results = new Map();
    this.#district_results = new Map();

    subject.subscribe('Districts', this, (event) => { this.#onDistrictsUpdate(event); });
    subject.subscribe('Statewide', this, (event) => { this.#onStatewideUpdate(event); });
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

    let agg_event = new ResultEvent(this.#district_results, this.#overall_results);
    this.sendEvent(agg_event);
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
      let district = district_event.getElectoralUnit();
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

    let agg_event = new ResultEvent(this.#district_results, this.#overall_results);
    this.sendEvent(agg_event);
  }
}