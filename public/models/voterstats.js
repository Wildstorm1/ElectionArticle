/*
 * The data-model for a group of voters
 */
class VoterStats {
  // The district number these voters belong to
  #district;

  // A map containing partyid -> members
  #voters_map;

  // A map containing partyid -> party name
  #party_map;

  /*
   * @param district - the district number these voters belong to
   */
  constructor(district) {
    this.#district = district;
    this.#party_map = new Map();
    this.#voters_map = new Map();
  }

  /*
   * @return an ordered list of parties by the number of members they have
   */
  #getPartyStats() {
    let results = [];
    let keys = this.#voters_map.keys();

    for (const key of keys) {
      results.push({ Key: key, Voters: this.#voters_map.get(key) });
    }

    results.sort((a, b) => {
      if (a.Voters > b.Voters) {
        return -1;
      } else if (a.Voters == b.Voters) {
        return 0;
      } else {
        return 1;
      }
    });

    return results;
  }

  /*
   * @return the district number these voters belong to
   */
  getDistrictNumber() {
    return this.#district;
  }

  /*
   * @return an array of all party_ids which voters in this pool may belong to
   */
  getPartyIds() {
    let results = [];
    let keys = this.#party_map.keys();

    for (const key of keys) {
      results.push(key);
    }

    return results;
  }

  /*
   * @param party_id - the id of the party to get information about
   * @return the name of the given party, or null if it is not found among these voters
   */
  getPartyName(party_id) {
    return this.#party_map.get(party_id);
  }

  /*
   * @param party_id - the id of the party to get information about
   * @return the number of members in this voting block which identify with the given party
   */
  getPartyVoters(party_id) {
    let members = this.#voters_map.get(party_id);

    if (!members) {
      return 0;
    }

    return members;
  }

  /*
   * @param party_id - the id of the party we are adding information about
   * @param party_name - the name of the party with the given party_id
   * @param members - the number of members which belong to the given party_id in this voting block
   * @effects updates the information for the given party_id if it already exists
   */
  addVotingBlock(party_id, party_name, members) {
    this.#party_map.set(party_id, party_name);
    this.#voters_map.set(party_id, members);
  }

  /*
   * @return the key of the top party in this voting block by members
   */
  getTopParty() {
    let parties = this.#getPartyStats();
    return parties[0].Key;
  }

  /*
   * @return the numerical advantage the top party has over the next largest party
   * in terms of members within this voting block, or all voters if there is only one party
   */
  getTopPartyAdvantage() {
    let parties = this.#getPartyStats();

    if (parties.length == 1) {
      return parties[0].Voters;
    }

    let v1 = parties[0].Voters;
    let v2 = parties[1].Voters;
    return v1 - v2;
  }
}