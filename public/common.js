// Why d3? Makes plotting the geographic data easier.
// "Perfection is the enemy of profitability," Cuban said. "Perfection is the enemy of success. You don't need to be perfect, because nobody is."
// Don't feel sorry for yourself (exaggerate your misfortune and experience a sense of hopelessness and helplessness)
// TODO: I need an api that defines how to define a custom image object
// TODO: I also want to create some model objects to abstract away the data a bit
// TODO: The best api would probably be a bind, draw, update pattern

/*
 * @param points - the points which represent a voter located in a geographic region
 */
function computeVotingStats(points) {
  let voters = points.getPointsAsArray();
  let stats = new PartToWhole();

  for (let i = 0; i < voters.length; i++) {
    let voteId = voters[i].getId();
    
    if (!stats.hasPart(voteId)) {
      stats.setPart(voteId, 0);
    }

    stats.setPart(voteId, stats.getPart(voteId) + 1);
  }

  return stats;
}

/*
 * @param grid - the grouped grid representing the districts
 * @param points - the points which represent a voter located in a geographic region
 * @returns a part-to-whole model holding the delegates chosen in the election
 * @requires the points to be in normalized form (ie, x in [0, 1], y in [0, 1])
 */
function computeDelegates(grid, points) {
  let map = new Map();
  let voters = points.getPointsAsArray();
  let columns = grid.getGridColumns();
  let rows = grid.getGridRows();

  for (let i = 0; i < voters.length; i++) {
    let gi = Math.floor(voters[i].getY() * rows);
    let gj = Math.floor(voters[i].getX() * columns);
    let groupId = grid.getCellId(gi, gj);
    let voteId = voters[i].getId();

    if (!map.has(groupId)) {
      map.set(groupId, new Map());
    }

    let groupMap = map.get(groupId);

    if (!groupMap.has(voteId)) {
      groupMap.set(voteId, 0);
    }

    groupMap.set(voteId, groupMap.get(voteId) + 1);
  }

  let results = new PartToWhole();
  let districtKeys = map.keys();

  for (const key of districtKeys) {
    let groupMap = map.get(key);
    let groupKeys = groupMap.keys();
    let maxCount = 0;
    let maxId = null;

    for (const voteKey of groupKeys) {
      let voteCount = groupMap.get(voteKey);

      if (voteCount > maxCount) {
        maxCount = voteCount;
        maxId = voteKey;
      }
    }

    if (!results.hasPart(maxId)) {
      results.setPart(maxId, 0);
    }

    results.setPart(maxId, results.getPart(maxId) + 1);
  }

  return results;
}

/*
 * @param a - the element to attempt to swap during sorting
 * @param b - the element to compare against during sorting
 * @return -1 if a comes before b, 1 if a comes after b, or 0 if order doesn't matter
 */
function partySorter(a, b) {
  // TODO: better way to do this???? Honestly an ordering function might make more sense than "sorting"
  if (a['key'] === 'dem' && b['key'] === 'rep') {
    return -1;
  } else if (a['key'] === 'rep' && b['key'] === 'dem') {
    return 1;
  } else {
    return 0;
  }
}

// ---------------------------------- HELPER FUNCTIONS ---------------------------------- //

function updateDemoTooltip(event, app_tag) {
  d3.select(`#${app_tag}_tooltip`)
    .style('left', `${event.pageX - (demo_tooltip_width / 2)}px`)
    .style('top', `${event.pageY + demo_tooltip_height_padding}px`);
}

function mouseOverSquare(event, app_tag, grid, img_s, g_size) {
  updateDemoTooltip(event, app_tag);

  let i = Math.min(Math.floor((event.offsetX / img_s) * g_size), g_size - 1);
  let j = Math.min(Math.floor((event.offsetY / img_s) * g_size), g_size - 1);

  d3.select(`#${app_tag}_tooltip`)
    .style('display', 'block');

  d3.select(`#${app_tag}_tooltip_label`)
    .style('color', `${text_color}`)
    .text(`District ${grid[j][i]}`);

  d3.select(`#${app_tag}_DistrictNo${grid[j][i]}`)
    .attr('stroke', outline_color);

  d3.select(`#${app_tag}_district_share`)
    .selectAll('rect')
    .sort(function(a, b) {
      if (a['DISTRICT'] === grid[j][i]) {
        return 1;
      } else if (b['DISTRICT'] === grid[j][i]) {
        return -1;
      } else {
        return a['DISTRICT'] < b['DISTRICT'] ? 1 : a['DISTRICT'] === b['DISTRICT'] ? 0 : -1;
      }
    }
  );
}

function mouseOutSquare(event, app_tag, grid, g_size) {
  d3.select(`#${app_tag}_tooltip`)
    .style('display', 'none');

  for (let i = 0; i < g_size; i++) {
    for (let j = 0; j < g_size; j++) {
    d3.select(`#${app_tag}_DistrictNo${grid[j][i]}`)
        .attr('stroke', 'transparent');
    }
  }
}

function mouseMoveSquare(event, app_tag, grid, img_s, g_size) {
  mouseOutSquare(event, app_tag, grid, g_size);
  mouseOverSquare(event, app_tag, grid, img_s, g_size);
}

/*
function createLine(parent, id, l_color, x1, y1, x2, y2) {
  parent.append('line')
    .attr('id', id)
    .attr('x1', x1)
    .attr('y1', y1)
    .attr('x2', x2)
    .attr('y2', y2)
    .attr('stroke', l_color)
    .attr('stroke-width', 2);
}
  
function createSquare(app_tag, parent, l_color, size, i, j) {
  let sg = parent.append('g')
    .attr('transform', `translate(${i * size},${j * size})`);
  sg.append('rect')
    .attr('id', `${app_tag}_S_${i}_${j}`)
    .attr('width', size)
    .attr('height', size)
    .attr('fill', 'transparent')
    .attr('stroke-width', '0');
  createLine(sg, `${app_tag}_TL_${i}_${j}`, l_color, 0, 0, size, 0);
  createLine(sg, `${app_tag}_RL_${i}_${j}`, l_color, size, 0, size, size);
  createLine(sg, `${app_tag}_BL_${i}_${j}`, l_color, size, size, 0, size);
  createLine(sg, `${app_tag}_LL_${i}_${j}`, l_color, 0, size, 0, 0);
}

function createGrid(app_tag, parent, l_color, g_size, s_size) {
  for (let i = 0; i < g_size; i++) {
    for (let j = 0; j < g_size; j++) {
      createSquare(app_tag, parent, l_color, s_size, i, j)
    }
  }
}

function updateBorders(app_tag, grid, g_size, l_color) {
  for (let i = 0; i < g_size; i++) {
    for (let j = 0; j < g_size; j++) {
    let district = grid[j][i];
    d3.select(`#${app_tag}_TL_${i}_${j}`)
        .attr('stroke', () => { return getDistrictLineColor(grid, g_size, l_color, district, i, j - 1); });
    d3.select(`#${app_tag}_RL_${i}_${j}`)
        .attr('stroke', () => { return getDistrictLineColor(grid, g_size, l_color, district, i + 1, j); });
    d3.select(`#${app_tag}_BL_${i}_${j}`)
        .attr('stroke', () => { return getDistrictLineColor(grid, g_size, l_color, district, i, j + 1); });
    d3.select(`#${app_tag}_LL_${i}_${j}`)
        .attr('stroke', () => { return getDistrictLineColor(grid, g_size, l_color, district, i - 1, j); });
    }
  }
}

function getDistrictLineColor(grid, g_size, l_color, district_num, i, j) {
  if (i >= 0 && i < g_size && j >= 0 && j < g_size) {
    return grid[j][i] === district_num ? 'transparent' : l_color;
  } else {
    return l_color;
  }
}

function plotPopulation(gpid, color_fct, c_radius, population) {
  d3.select(`#${gpid}`)
    .selectAll('circle')
    .data(population)
    .enter()
    .append('circle')
    .attr('cx', (d) => { return d.x; })
    .attr('cy', (d) => { return d.y; })
    .attr('r', c_radius)
    .attr('fill', (d) => { return d.party === 'DEM' ? color_fct(0) : color_fct(1); });
}

let svg_grid = d3.select('#demo')
  .style('display', 'flex')
  .style('align-items', 'center')
  .style('justify-content', 'center')
  .append('svg')
  .attr('width', img_size)
  .attr('height', img_size);
let g_population = svg_grid.append('g')
  .attr('id', 'g_population');
let g_grid = svg_grid.append('g')
  .attr('id', 'g_grid')
  .on('mouseover', (event) => { mouseOverSquare(event, demo_app_tag, grids[g_index], img_size, grid_size); })
  .on('mouseout', (event) => { mouseOutSquare(event, demo_app_tag, grids[g_index], grid_size); })
  .on('mousemove', (event) => { mouseMoveSquare(event, demo_app_tag, grids[g_index], img_size, grid_size); });

let svg_crack_grid = d3.select('#cracking')
  .style('display', 'flex')
  .style('align-items', 'center')
  .style('justify-content', 'center')
  .append('svg')
  .attr('width', m_img_size)
  .attr('height', m_img_size)
  .on('mouseover', (event) => { mouseOverSquare(event, m_cracked_tag, cracked_model_grid, m_img_size, m_grid_size); })
  .on('mouseout', (event) => { mouseOutSquare(event, m_cracked_tag, cracked_model_grid, m_grid_size); })
  .on('mousemove', (event) => { mouseMoveSquare(event, m_cracked_tag, cracked_model_grid, m_img_size, m_grid_size); });
let svg_pack_grid = d3.select('#packing')
  .style('display', 'flex')
  .style('align-items', 'center')
  .style('justify-content', 'center')
  .append('svg')
  .attr('width', m_img_size)
  .attr('height', m_img_size)
  .on('mouseover', (event) => { mouseOverSquare(event, m_packed_tag, packed_model_grid, m_img_size, m_grid_size); })
  .on('mouseout', (event) => { mouseOutSquare(event, m_packed_tag, packed_model_grid, m_grid_size); })
  .on('mousemove', (event) => { mouseMoveSquare(event, m_packed_tag, packed_model_grid, m_img_size, m_grid_size); });
let g_crack_population = svg_crack_grid.append('g')
  .attr('id', 'g_crack_population');
let g_pack_population = svg_pack_grid.append('g')
  .attr('id', 'g_pack_population');

function updateResultsBar(app_tag, grid, g_size, districts_num, i_size, population, bar_h, bar_w, text_pad, color_fct) {
  let census = performCensus(grid, g_size, districts_num, i_size, population);

  let district_width = Math.floor(bar_w / districts_num);
  let available_width = districts_num * district_width;
  let dem_percent = census[0]['DEM'] / census[0]['TOTAL'];
  let rep_percent = census[0]['REP'] / census[0]['TOTAL'];
  let dem_width = dem_percent * available_width;
  let rep_width = rep_percent * available_width;

  d3.select(`#${app_tag}_dem_pop_vote`)
    .attr('width', dem_width)
    .attr('height', bar_h)
    .attr('x', 0)
    .attr('fill', color_fct(0));

  d3.select(`#${app_tag}_rep_pop_vote`)
    .attr('width', rep_width)
    .attr('height', bar_h)
    .attr('x', dem_width)
    .attr('fill', color_fct(1));

  d3.select(`#${app_tag}_dem_overall_text`)
    .text(`${Math.round(dem_percent * 1000) / 10}%`);

  d3.select(`#${app_tag}_rep_overall_text`)
    .text(`${Math.round(rep_percent * 1000) / 10}%`);

  let district_results = d3.rollup(census.slice(1), v => v.length, d => { return d['DEM'] >= d['REP'] ? 'DEM' : 'REP'; });

  d3.select(`#${app_tag}_dem_district_text`)
    .text(`${district_results.get('DEM')}`);

  d3.select(`#${app_tag}_rep_district_text`)
    .text(`${district_results.get('REP')}`);

  let label_overall_measures = d3.select(`#${app_tag}_dem_overall_text`).node().getBBox();
  d3.select(`#${app_tag}_dem_overall_text`)
    .attr('transform', `translate(${-label_overall_measures.width - text_pad},${0}),scale(1)`);

  let label_district_measures = d3.select(`#${app_tag}_dem_district_text`).node().getBBox();
  d3.select(`#${app_tag}_dem_district_text`)
    .attr('transform', `translate(${-label_district_measures.width - text_pad},${0}),scale(1)`);

  d3.select(`#${app_tag}_district_share`)
    .selectAll('rect')
    .data(census.slice(1))
    .join(
      function(enter) {
        return enter.append('rect');
      },
      function(update) {
        return update;
      },
      function(exit) {
        return exit.remove();
      }
    )
    .sort((a, b) => {
      if (a['DEM'] >= a['REP'] && b['REP'] > b['DEM']) {
        return -1;
      } else if (a['REP'] > a['DEM'] && b['DEM'] >= b['REP']) {
        return 1;
      } else {
        return a['DISTRICT'] < b['DISTRICT'] ? -1 : 1;
      }
    })
    .attr('width', district_width)
    .attr('height', bar_h)
    .attr('x', function(e, i) { return i * district_width; })
    .attr('id', function(e) { return `${app_tag}_DistrictNo${e['DISTRICT']}`; })
    .attr('stroke-width', 2)
    .attr('stroke', 'transparent')
    .attr('fill', function(e) {
      if (e['DEM'] >= e['REP']) {
        return color_fct(0);
      } else {
        return color_fct(1);
      }
    });
}

function performCensus(grid, g_size, num_districts, i_size, population) {
  let district_count = [];

  for (let i = 0; i <= num_districts; i++) {
    district_count.push({ 'DEM': 0, 'REP': 0, 'TOTAL': 0, 'DISTRICT': i });
  }

  for (let i = 0; i < population.length; i++) {
    let party = population[i].party;
    let gi = Math.floor(population[i].x * g_size);
    let gj = Math.floor(population[i].y * g_size);
    district_count[grid[gj][gi]][party]++;
    district_count[0][party]++;
  }

  for (let i = 0; i <= num_districts; i++) {
    district_count[i]['TOTAL'] = district_count[i]['DEM'] + district_count[i]['REP'];
  }

  return district_count;
}

function createResultsBar(div_id, demo_app_tag, bar_h, bar_w, text_w, bar_pad) {
  let result_bar = d3.select(`#${div_id}`)
    .append('div')
    .style('display', 'flex')
    .style('align-items', 'center')
    .style('justify-content', 'center')
    .append('svg')
    .attr('width', bar_w + 2 * text_w)
    .attr('height', 2 * bar_h + 3 * bar_pad);
  let bar_group = result_bar.append('g')
    .attr('transform', `translate(${text_w},${bar_pad})`);
  let popular_vote = bar_group.append('g');
  popular_vote.append('rect')
    .attr('id', `${demo_app_tag}_dem_pop_vote`);
    popular_vote.append('rect')
    .attr('id', `${demo_app_tag}_rep_pop_vote`);
  let district_share = bar_group.append('g')
    .attr('id', `${demo_app_tag}_district_share`)
    .attr('transform', `translate(0,${bar_pad + bar_h})`);

  createResultsTextLabel(bar_group, `${demo_app_tag}_dem_overall_text`, 0, (bar_h + bar_pad) / 2);
  createResultsTextLabel(bar_group, `${demo_app_tag}_rep_overall_text`, bar_w, (bar_h + bar_pad) / 2);
  createResultsTextLabel(bar_group, `${demo_app_tag}_dem_district_text`, 0, 1.5 * (bar_h + bar_pad));
  createResultsTextLabel(bar_group, `${demo_app_tag}_rep_district_text`, bar_w, 1.5 * (bar_h + bar_pad));
}

function createToolTip(divid, app_tag, tooltip_w) {
  let demo_tooltip = d3.select(`#${divid}`).append('div').attr('id', `${app_tag}_tooltip`)
    .style('position', 'absolute')
    .style('left', '0px')
    .style('top', '0px')
    .style('display', 'none')
    .style('pointer-events', 'none')
    .style('background-color', 'rgba(255, 255, 254, 0.9)')
    .style('box-shadow', '0px 0px 6px 2px rgba(0, 0, 0, 0.28)');
  let demo_tooltip_table = demo_tooltip.append('table')
    .style('width', `${tooltip_w}px`);
  demo_tooltip_table.append('tr')
    .append('thead')
    .append('th')
    .style('border-bottom', '2px solid #ccc')
    .attr('id', `${app_tag}_tooltip_label`);
}
*/