/*
 * A color function for typical two-party majority US elections
 */
class USATwoPartyColorizer {
  // The democratic party key
  #dem_key;

  // The republican party key
  #rep_key;

  // The colorizer interpolator
  #colorizer;

  /*
   * @param dem_party - the democratic party key
   * @param blue_color - the hex color string for the democratic party
   * @param rep_party - the republican party key
   * @param red_color - the hex color string for the republican party
   */
  constructor(dem_party, blue_color, rep_party, red_color) {
    if (!dem_party) {
      throw new Error('Democrat party key is falsy!');
    }

    if (!blue_color) {
      throw new Error('Democrat color is falsy!');
    }

    if (!rep_party) {
      throw new Error('Republican party key is falsy!');
    }

    if (!red_color) {
      throw new Error('Republican color is falsy!');
    }

    this.#colorizer = d3.interpolateHcl(blue_color, red_color);
    this.#dem_key = dem_party;
    this.#rep_key = rep_party;
  }

  /*
   * @param vote_share - the vote share object to return a color of
   * @requires vote_share to be key'd on dem_party and rep_party and the votes between them are > 0
   */
  getColor(vote_share) {
    if (!vote_share) {
      throw new Error('Vote share is falsy!');
    }

    let dem_votes = vote_share.getPartyAmount(this.#dem_key);
    let rep_votes = vote_share.getPartyAmount(this.#rep_key);
    let votes = dem_votes + rep_votes;

    if (votes <= 0) {
      throw new Error('Total number of votes must be > 0');
    }

    return this.#colorizer(rep_votes / votes);
  }
}