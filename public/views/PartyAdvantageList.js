/*
 * A table displaying counts of voters by party in a population of voters
 * with an extra row dedicated to the difference between the top two parties
 */
class PartyAdvantageListBuilder {
  /*
   * The UI to build
   */
  static #PartyAdvantageList = class {
    // The root DOM element of this UI
    #root;

    // The header of the table
    #table_header;

    // The body of the table
    #table_body;

    // The rows in the table
    #rows;

    /*
     * @param subject - the subject to subscribe to for what district to display
     */
    constructor(subject) {
      if (!subject) {
        throw new Error('Subject is falsy!');
      }

      this.#rows = [];

      let table = document.createElement('table');
      let thead = document.createElement('thead');
      let tbody = document.createElement('tbody');
      let th = document.createElement('th');
      this.#root = table;
      this.#table_header = th;
      this.#table_body = tbody;

      table.appendChild(thead);
      table.appendChild(tbody);
      thead.appendChild(th);

      subject.subscribe(this, (event) => { this.#onDistrictUpdate(event); });
    }

    /*
     * @param event - the event received
     */
    #onDistrictUpdate(event) {
      while (this.#rows.length > 0) {
        this.#rows.pop().remove();
      }

      let parties = [];

      for (const party of event.getParties()) {
        parties.push(party);
      }

      let district = event.getDistrict();
      parties.sort((a, b) => { return a.getPartyName().localeCompare(b.getPartyName()); });
      this.#table_header.textContent = `District ${ district.getDistrictNumber() }`;

      let top_parties = [{ party: null, voters: -1 }, { party: null, voters: -2 }];

      for (let i = 0; i < parties.length; i++) {
        let party = parties[i];
        let voters = event.getVotersByParty(party);

        if (voters !== 0) {
          let tr = document.createElement('tr');
          let td = document.createElement('td');
          td.textContent = `${ party.getPartyName() }: ${ voters }`;

          this.#table_body.appendChild(tr);
          tr.appendChild(td);
          this.#rows.push(tr);

          if (top_parties[0].voters < voters) {
            top_parties[1].party = top_parties[0].party;
            top_parties[1].voters = top_parties[0].voters;
            top_parties[0].party = party;
            top_parties[0].voters = voters;
          } else if (top_parties[1].voters < voters) {
            top_parties[1].party = party;
            top_parties[1].voters = voters;
          }
        }
      }

      let advantage = (top_parties[1].party) ? top_parties[0].voters - top_parties[1].voters : top_parties[0].voters;
      let tr = document.createElement('tr');
      let td = document.createElement('td');
      td.textContent = `${ top_parties[0].party.getPartyName() } Advantage: ${ advantage }`;

      this.#table_body.appendChild(tr);
      tr.appendChild(td);
      this.#rows.push(tr);
    }

    /*
     * @return the HTML DOM element that serves as the root of this UI
     */
    getDOMRoot() {
      return this.#root;
    }
  }

  // The subject to subscribe to for the district data to display
  #subject;

  constructor() {
    this.#subject = null;
  }

  /*
   * @param subject - the subject to subscribe to for updates in the district data to display
   * @return this
   */
  setSubject(subject) {
    if (this.#subject === -1) {
      throw new Error('This builder is closed!');
    }

    if (!subject) {
      throw new Error('The given subject is falsy!');
    }

    this.#subject = subject;
    return this;
  }

  /*
   * @return the new list
   * @requires that both subjects have been set
   * @effects further calls to this builder will throw an error
   */
  build() {
    if (this.#subject === -1) {
      throw new Error('This builder is closed!');
    }

    if (this.#subject === null) {
      throw new Error('The subject must be set!');
    }

    let list = new PartyAdvantageListBuilder.#PartyAdvantageList(this.#subject);
    this.#subject = -1;
    return list;
  }
}