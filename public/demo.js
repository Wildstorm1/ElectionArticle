// ---------------------------------- SETTINGS ---------------------------------- //

let button_width = 225;
let button_height = 25;
let button_height_padding = 15;
let result_bar_text_width = 54;
let result_bar_text_padding = 3;
let result_bar_width = 496;
let result_bar_height = 40;
let result_bar_padding = 10;
let demo_tooltip_width = 180;
let demo_tooltip_height = 120;
let demo_tooltip_height_padding = 20;
let img_size = 396;
let grid_size = 6;
let num_points = 500;
let circle_radius = 4;
let noise_seed = 17;
let pop_seed = 12;
let line_color = '#094067';
let hover_text_color = '#fffffe';
let normal_text_color = '#5f6c7b';
let demo_app_tag = 'demo_tag';

// ---------------------------------- CALCULATED VALUES ---------------------------------- //

let square_size = img_size / grid_size;
let noise = new Noise(noise_seed);
let uniform = new Uniform(pop_seed);

// ---------------------------------- CREATE DATA ---------------------------------- //

let g_index = 0;
let grids = [
  [
    [6, 6, 3, 3, 3, 3],
    [6, 6, 6, 3, 4, 4],
    [1, 6, 1, 3, 4, 4],
    [1, 1, 1, 5, 4, 4],
    [2, 1, 2, 5, 5, 5],
    [2, 2, 2, 2, 5, 5]
  ],
  [
    [6, 6, 6, 3, 3, 3],
    [6, 6, 1, 3, 3, 3],
    [6, 2, 1, 1, 1, 4],
    [2, 2, 1, 1, 4, 4],
    [2, 5, 5, 5, 4, 4],
    [2, 2, 5, 5, 5, 4]
  ],
  [
    [1, 1, 1, 5, 4, 4],
    [1, 1, 5, 5, 4, 4],
    [1, 5, 5, 2, 4, 4],
    [6, 6, 5, 2, 2, 2],
    [6, 6, 3, 3, 3, 2],
    [6, 6, 3, 3, 3, 2]
  ],
];

let population_points = [];

for (let i = 0; i < num_points; i++) {
  let x = uniform.random();
  let y = uniform.random();
  let party = noise.simplex2(x, y) < 0 ? 'DEM' : 'REP';
  population_points.push({ 'x': x * img_size, 'y': y * img_size, 'party': party });
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
    });
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

function getDistrictLineColor(grid, g_size, l_color, district_num, i, j) {
  if (i >= 0 && i < g_size && j >= 0 && j < g_size) {
    return grid[j][i] === district_num ? 'transparent' : l_color;
  } else {
    return l_color;
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

function plotPopulation(gpid, color_fct, c_radius, population) {
  d3.select(`#${gpid}`)
    .selectAll('circle')
    .data(population)
    .enter()
    .append('circle')
    .attr('cx', (d) => { return d.x; })
    .attr('cy', (d) => { return d.y; })
    .attr('r', c_radius)
    .attr('fill', (d) => { return d.party === 'DEM' ? color_fct(0) : color_fct(1); }
  );
}

function performCensus(grid, g_size, num_districts, i_size, population) {
  let district_count = [];

  for (let i = 0; i <= num_districts; i++) {
    district_count.push({ 'DEM': 0, 'REP': 0, 'TOTAL': 0, 'DISTRICT': i });
  }

  for (let i = 0; i < population.length; i++) {
    let party = population[i].party;
    let gi = Math.floor(population[i].x / (i_size / g_size));
    let gj = Math.floor(population[i].y / (i_size / g_size));
    district_count[grid[gj][gi]][party]++;
    district_count[0][party]++;
  }

  for (let i = 0; i <= num_districts; i++) {
    district_count[i]['TOTAL'] = district_count[i]['DEM'] + district_count[i]['REP'];
  }

  return district_count;
}

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

// ---------------------------------- CORE IMAGE ---------------------------------- //

let button_bar = d3.select('#button_bar')
  .append('div')
  .style('height', `${button_height + button_height_padding}px`)
  .style('display', 'flex')
  .style('align-items', 'center')
  .style('justify-content', 'center');
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

createToolTip('demo', demo_app_tag, demo_tooltip_width);
createGrid(demo_app_tag, g_grid, line_color, grid_size, square_size);
createResultsBar('population_bar', demo_app_tag, result_bar_height, result_bar_width, result_bar_text_width, result_bar_padding);

// ---------------------------------- APPLICATION ---------------------------------- //

let switch_grid = button_bar.append('button')
  .attr('id', 'switch_grid')
  .attr('class', 'button-selected')
  .style('width', `${button_width}px`)
  .style('height', 'auto')
  .on('click', () => {
    g_index = (g_index + 1) % grids.length;
    updateResultsBar(demo_app_tag, grids[g_index], grid_size, grid_size, img_size, population_points, result_bar_height, result_bar_width, result_bar_text_padding, party_color);
    updateBorders(demo_app_tag, grids[g_index], grid_size, line_color);
  })
  .on('mouseover', () => {
    d3.select('#button-text').attr('style', `color: ${hover_text_color}`);
  })
  .on('mouseout', () => {
    d3.select('#button-text').attr('style', `color: ${normal_text_color}`);
  })
  .append('span')
  .attr('id', 'button-text')
  .text('Change Districts');

updateResultsBar(demo_app_tag, grids[g_index], grid_size, grid_size, img_size, population_points, result_bar_height, result_bar_width, result_bar_text_padding, party_color);
updateBorders(demo_app_tag, grids[g_index], grid_size, line_color);
plotPopulation('g_population', party_color, circle_radius, population_points);