// Why d3? Makes plotting the geographic data easier.
// "Perfection is the enemy of profitability," Cuban said. "Perfection is the enemy of success. You don't need to be perfect, because nobody is."
// Don't feel sorry for yourself (exaggerate your misfortune and experience a sense of hopelessness and helplessness)
// Neat thing I learned: sometimes if the format of the CSS trait is wrong, nothing will show, and no error is printed.
// I like to style things extreme to verify they are working, then soften it up.
// TODO: I need an api that defines how to define a custom image object
// TODO: I also want to create some model objects to abstract away the data a bit
// TODO: The best api would probably be a bind, draw, update pattern
// Part of what is making this messy is that I am trying to do two things: 1) build a set of "building blocks", 2) build the application.
// Building blocks are nice, but it really requires careful care and design. Me building blocks from other blocks is really just
// making things messy.

// ---------------------------------- HELPER FUNCTIONS ---------------------------------- //

/*
 * @param grid - the grouped grid which represents the geographic boundaries voters live in
 * @param population - a population points which represents voters
 * @param party - the party the population of voters belong to
 * @param district_stats - an array of voter stat objects for each district id in grid
 * @param overall_stats - a voter stat object for the overall grid
 * @effects updates the voting stat objects in district_stats and overall_stats
 * @requires the length of district_stats to match the number of ids in grid and grid ids >= 1
 * @throws Error if length of district_stats is less than the number of ids in grid or id < 1
 */
function appendVoterStats(grid, population, party, district_stats, overall_stats) {
  let voters = population.getPointsAsArray();
  let columns = grid.getGridColumns();
  let rows = grid.getGridRows();

  for (let i = 0; i < voters.length; i++) {
    let gi = Math.floor(voters[i].getY() * rows);
    let gj = Math.floor(voters[i].getX() * columns);
    let district = grid.getCellId(gi, gj);
    
    if (district > district_stats.length || district < 1) {
      throw new Error('Invalid district number');
    }

    district_stats[district - 1].addVoter(party);
    overall_stats.addVoter(party);
  }
}

/*
 * @param district_stats - an array of voter stat objects for each district in a region
 * @return a PartToWhole representing the delegation breakdown
 * @requires district_stats to not be falsy, each district has at least one party, and for each
 * district to have a well defined majority party
 * @throws Error if district_stats is falsy, a district has no parties, or a district has a membership tie
 */
function computeDelegation(district_stats) {
  if (!district_stats) {
    throw new Error('District stats is falsy!');
  }

  let ptw = new PartToWhole();

  for (let i = 0; i < district_stats.length; i++) {
    let parties = district_stats[i].getPartiesByVoters();

    if (parties.length < 1) {
      throw new Error('District has no parties!');
    }

    if (parties.length >= 2 && district_stats[i].getPartyVoters(parties[1]) >= district_stats[i].getPartyVoters(parties[0])) {
      throw new Error('District has a tie for majority party');
    }

    let top = parties[0];
    ptw.setPart(top, ptw.getPart(top) + 1);
  }

  return ptw;
}

/*
 * @param voter_stats - the voter stat object to convert
 * @return a PartToWhole recording the breakdown of voters in voter_stats
 * @requires voter_stats to not be falsy
 */
function convertStatsToPartToWhole(voter_stats) {
  if (!voter_stats) {
    throw new Error('Voter stats is falsy!');
  }

  let parties = voter_stats.getPartiesByVoters();
  let ptw = new PartToWhole();

  for (let i = 0; i < parties.length; i++) {
    ptw.setPart(parties[i], voter_stats.getPartyVoters(parties[i]));
  }

  return ptw;
}

/*
 * @param a - the element to attempt to swap during sorting
 * @param b - the element to compare against during sorting
 * @return -1 if a comes before b, 1 if a comes after b, or 0 if order doesn't matter
 */
function partySorter(a, b) {
  // TODO: better way to do this???? Honestly an ordering function might make more sense than "sorting"
  if (a['key'].getPartyId() === 'blue' && b['key'].getPartyId() === 'red') {
    return -1;
  } else if (a['key'].getPartyId() === 'red' && b['key'].getPartyId() === 'blue') {
    return 1;
  } else {
    return 0;
  }
}

/*
 * @param element - the partition id assigned to the bar
 * @return the class to assign to the bar
 */
function electionBarStyler(barId) {
  return `svg_bar_${ barId.getPartyId() }`;
}