/*
 * The event that will be sent when the selected district changes or district data changes
 */
class DistrictEvent {
  // The district the results are from
  #district;

  // A Map[party -> voters] for each party in the district
  #party_map;

  /*
   * @param district - the district the results are of
   * @param party_map - the number of voters for each party in the district
   */
  constructor(district, party_map) {
    if (!district) {
      throw new Error('District is falsy!');
    }

    if (!party_map) {
      throw new Error('Party map is falsy!');
    }

    this.#district = district;
    this.#party_map = party_map;
  }

  /*
   * @return the district the results are in
   */
  getDistrict() {
    return this.#district;
  }

  /*
   * @return an iterable of parties in the district
   */
  getParties() {
    return this.#party_map.keys();
  }

  /*
   * @param party - the party whose results to obtain
   * @return the number of voters in this district of the given party, or 0 if the party doesn't exist
   */
  getVotersByParty(party) {
    if (!this.#party_map.has(party)) {
      return 0;
    }

    return this.#party_map.get(party);
  }
}