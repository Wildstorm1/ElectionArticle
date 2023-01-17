/*
 * Represents a GUI for a tooltip which shows statistics about the
 * population of voters inside the political unit being displayed.
 */
class PartyAdvantageTooltip {
  // The tag to include in the elements styling class
  #style_class;

  // The HTML DOM element which is the root (ie, the table)
  #root;

  // The header of the table
  #table_header;

  // The HTML DOM element which acts as the root for all the table rows
  #table_body;

  /*
   * @param parent - the HTML DOM element to attach the statistics tooltip to
   * @param style_class - the styling class to tag the HTML elements with
   */
  constructor(style_class) {
    this.#style_class = style_class;
  }

  /*
   * @effects deletes the root DOM element and everything below it
   */
  #delete() {
    if (this.#root) {
      this.#root.remove();
    }
  }

  /*
   * @effects deletes the current table DOM elements
   */
  #clear() {
    if (this.#table_body) {
      this.#table_body.remove();
    }
  }

  /*
   * @param parent - a HTML DOM element to attach this tooltip to
   * @effects removes the tooltip DOM elements below the previous parent and
   * creates new DOM elements below the given parent
   */
  attach(parent) {
    this.#delete();

    this.#root = parent.append('table')
      .style('class', `${ this.#style_class }_table`);

    this.#table_header = this.#root.append('thead')
      .append('th')
      .attr('class', `${ this.#style_class }_table_header`);
  }

  /*
   * @param data - an object containing voter statistics which may be interesting to display
   * @requires the data object to be appropriate for this tooltip and for
   * the tooltip to have been attached to a DOM element
   * @effects updates the table to reflect the data contained in the supplied data model
   */
  update(data) {
    // TODO: invariants?
    // TODO: should the data object be split up? parttowhole sorta covers part of this already?
    // maybe two objects? A voting group info object, and a parttowhole?
    // This pretty heavily relies on the inside of a party

    if (this.#table_body) {
      this.#clear();
    }

    let district_number = data.getDistrictNumber();    
    let parties = data.getParties();
    parties.sort((a, b) => { return a.getPartyName().localeCompare(b.getPartyName()); });

    this.#table_body = this.#root.append('tbody');
    this.#table_header.text(`District ${ district_number }`);

    for (let i = 0; i < parties.length; i++) {
      let party_id = parties[i];
      let members = data.getPartyVoters(party_id);

      this.#table_body.append('tr')
        .append('td')
        .attr('class', `${this.#style_class}_table_row`)
        .text(`${ party_id.getPartyName() }: ${ members }`);
    }

    let ordered_parties = data.getPartiesByVoters();
    let advantage = (ordered_parties.length == 1) ? data.getPartyVoters(ordered_parties[0]) : data.getPartyVoters(ordered_parties[0]) - data.getPartyVoters(ordered_parties[1]);

    this.#table_body.append('tr')
      .append('td')
      .attr('class', `${ this.#style_class }_table_row`)
      .text(`${ ordered_parties[0].getPartyName() } Advantage: ${ advantage }`);
  }
}