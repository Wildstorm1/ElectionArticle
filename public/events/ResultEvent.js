/*
 * The event that is created when aggregated results change
 */
class ResultEvent {
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