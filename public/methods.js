// ---------------------------------- SETTINGS ---------------------------------- //

let m_grid_size = 10;
let m_img_size = 325;
let m_num_points = 500;
let m_radius = 0.4049;
let m_pop_seed = 15;
let m_districts = 3;
let m_cracked_tag = 'cracked_tag';
let m_packed_tag = 'packed_tag';
let m_bar_text_width = 54;
let m_bar_text_padding = 3;
let m_bar_width = 374;
let m_bar_height = 40;
let m_bar_padding = 10;
let m_tooltip_width = 180;

// ---------------------------------- CALCULATED VALUES ---------------------------------- //

let m_square_size = m_img_size / m_grid_size;
let radial_fct = new Radial(m_radius);
let uniform_fct = new Uniform(m_pop_seed);

// ---------------------------------- CREATE DATA ---------------------------------- //

let cracked_model_grid = [
  [3, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [3, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [3, 3, 1, 1, 1, 1, 1, 1, 2, 2],
  [3, 3, 1, 1, 1, 1, 1, 1, 2, 2],
  [3, 3, 3, 1, 1, 1, 1, 2, 2, 2],
  [3, 3, 3, 3, 1, 1, 2, 2, 2, 2],
  [3, 3, 3, 3, 3, 2, 2, 2, 2, 2],
  [3, 3, 3, 3, 3, 2, 2, 2, 2, 2],
  [3, 3, 3, 3, 3, 2, 2, 2, 2, 2],
  [3, 3, 3, 3, 3, 2, 2, 2, 2, 2]
];

let packed_model_grid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 2, 2, 2, 2, 2, 2, 1, 1],
  [1, 1, 2, 2, 2, 2, 2, 2, 1, 1],
  [1, 1, 2, 2, 2, 2, 2, 2, 1, 1],
  [3, 3, 2, 2, 2, 2, 2, 2, 3, 3],
  [3, 3, 2, 2, 2, 2, 2, 2, 3, 3],
  [3, 3, 2, 2, 2, 2, 2, 2, 3, 3],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
];

function makeRadialPopulation(num, pos_obj, noise_obj) {
  let points = [ new Points(), new Points() ];

  for (let i = 0; i < num; i++) {
    let x = pos_obj.random();
    let y = pos_obj.random();
    let point = new Point2D(x, y);
    let idx = noise_obj.sample(x, y) < 0 ? 0 : 1;
    points[idx].addPoint(point);
  }

  return points;
}

let methods_population_points = makeRadialPopulation(m_num_points, uniform_fct, radial_fct);

let cracked_model = GroupedGrid.newGridFromArray(cracked_model_grid);
let packed_model = GroupedGrid.newGridFromArray(packed_model_grid);

let cracked_stats = new VoterStats();
let packed_stats = new VoterStats();

let cracked_district_stats = [];
let packed_district_stats = [];

let cracked_num_groups = cracked_model.getNumberUniqueIds();
let packed_num_groups = packed_model.getNumberUniqueIds();

for (let j = 0; j < cracked_num_groups; j++) {
  cracked_district_stats.push(new VoterStats(j + 1));
}

for (let j = 0; j < packed_num_groups; j++) {
  packed_district_stats.push(new VoterStats(j + 1));
}

for (let j = 0; j < methods_population_points.length; j++) {
  appendVoterStats(cracked_model, methods_population_points[j], color_parties[j], cracked_district_stats, cracked_stats);
}

for (let j = 0; j < methods_population_points.length; j++) {
  appendVoterStats(packed_model, methods_population_points[j], color_parties[j], packed_district_stats, packed_stats);
}

let cracked_district_results = computeDelegation(cracked_district_stats);
let packed_district_results = computeDelegation(packed_district_stats);
let cracked_overall_results = convertStatsToPartToWhole(cracked_stats);
let packed_overall_results = convertStatsToPartToWhole(packed_stats);

// ---------------------------------- CORE IMAGE ---------------------------------- //

let cracking_grid = new ElectionGridView(document.getElementById('cracking'), m_img_size / m_grid_size, cracked_model);
cracking_grid.plotPoints(methods_population_points[0], blue_party);
cracking_grid.plotPoints(methods_population_points[1], red_party);

let cracked_bar = new ComparedResultsView(document.getElementById('cracking_bar'), m_bar_width, m_bar_height, m_bar_padding);
cracked_bar.drawOverallResults(cracked_overall_results);
cracked_bar.drawDistrictResults(cracked_district_results);
cracked_bar.orderBars(party_order);

cracking_grid.onMouseOver((event) => {
  tooltip_container.updatePosition(event.pageX, event.pageY);
  tooltip_container.showTooltip();
});

cracking_grid.onMouseOut((event) => {
  tooltip_container.updatePosition(event.pageX, event.pageY);
  tooltip_container.hideTooltip();
});

cracking_grid.onMouseMove((event) => {
  let grid_cell = event.gridCell;
  let district_id = cracked_model.getCellId(grid_cell.row, grid_cell.column);
  tooltip_container.update(cracked_district_stats[district_id - 1]);
  tooltip_container.updatePosition(event.pageX, event.pageY);
});


let packing_grid = new ElectionGridView(document.getElementById('packing'), m_img_size / m_grid_size, packed_model);
packing_grid.plotPoints(methods_population_points[0], blue_party);
packing_grid.plotPoints(methods_population_points[1], red_party);

let packed_bar = new ComparedResultsView(document.getElementById('packing_bar'), m_bar_width, m_bar_height, m_bar_padding);
packed_bar.drawOverallResults(packed_overall_results);
packed_bar.drawDistrictResults(packed_district_results);
packed_bar.orderBars(party_order);

packing_grid.onMouseOver((event) => {
  tooltip_container.updatePosition(event.pageX, event.pageY);
  tooltip_container.showTooltip();
});

packing_grid.onMouseOut((event) => {
  tooltip_container.updatePosition(event.pageX, event.pageY);
  tooltip_container.hideTooltip();
});

packing_grid.onMouseMove((event) => {
  let grid_cell = event.gridCell;
  let district_id = packed_model.getCellId(grid_cell.row, grid_cell.column);
  tooltip_container.update(packed_district_stats[district_id - 1]);
  tooltip_container.updatePosition(event.pageX, event.pageY);
});