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

let blue_party = new Party('blue', 'Blue');
let red_party = new Party('red', 'Red');
let color_parties = [ blue_party, red_party ];
let party_order = new KeyOrdering(2);
party_order.setBarKey(0, blue_party);
party_order.setBarKey(1, red_party);

function makePopulation(num, pos_obj, noise_obj) {
  let points = [ new Points(), new Points() ];

  for (let i = 0; i < num; i++) {
    let x = pos_obj.random();
    let y = pos_obj.random();
    let point = new Point2D(x, y);
    let idx = noise_obj.simplex2(x, y) < 0 ? 0 : 1;
    points[idx].addPoint(point);
  }

  return points;
}

let population_points = makePopulation(num_points, uniform, noise);

let overall_results = [];
let district_results = [];
let grids_stats = [];
let groups = [];

for (let i = 0; i < grids.length; i++) {
  groups.push(GroupedGrid.newGridFromArray(grids[i]));

  let num_groups = groups[i].getNumberUniqueIds();
  let overall_stats = new VoterStats(); // TODO: this has an argument!!!!!
  let district_stats = [];

  for (let j = 0; j < num_groups; j++) {
    district_stats.push(new VoterStats(j + 1));
  }

  for (let j = 0; j < population_points.length; j++) {
    appendVoterStats(groups[i], population_points[j], color_parties[j], district_stats, overall_stats);
  }

  district_results.push(computeDelegation(district_stats));
  grids_stats.push(district_stats);
  overall_results.push(convertStatsToPartToWhole(overall_stats));
}

// ---------------------------------- CORE IMAGE ---------------------------------- //

let election_grid = new ElectionGridView(document.getElementById('demo'), img_size / grid_size, groups[0]);
election_grid.plotPoints(population_points[0], blue_party);
election_grid.plotPoints(population_points[1], red_party);

let results_bar = new ComparedResultsView(document.getElementById('population_bar'), result_bar_width, result_bar_height, result_bar_padding);
results_bar.drawOverallResults(overall_results[0]);
results_bar.drawDistrictResults(district_results[0]);
results_bar.orderBars(party_order);

let population_tip = new PartyAdvantageTooltip('tooltip');
let tooltip_container = new PointedTooltipContainer(d3.select('#tooltip_div'), population_tip, 'tooltip');
tooltip_container.updatePosition(0, 0);

// ---------------------------------- APPLICATION ---------------------------------- //

d3.select('#switch_grid')
  .on('click', () => {
    g_index = (g_index + 1) % groups.length;
    results_bar.drawOverallResults(overall_results[g_index]);
    results_bar.drawDistrictResults(district_results[g_index]);
    results_bar.orderBars(party_order);
    election_grid.plotBorders(groups[g_index]);
  })
  .on('mouseover', () => {
    d3.select('#button_span').attr('class', 'button_text_hover');
  })
  .on('mouseout', () => {
    d3.select('#button_span').attr('class', 'button_text');
  });

election_grid.onMouseOver((event) => {
  tooltip_container.updatePosition(event.pageX, event.pageY);
  tooltip_container.showTooltip();
});

election_grid.onMouseOut((event) => {
  tooltip_container.updatePosition(event.pageX, event.pageY);
  tooltip_container.hideTooltip();
});

election_grid.onMouseMove((event) => {
  let grid_cell = event.gridCell;
  let district_id = groups[g_index].getCellId(grid_cell.row, grid_cell.column);
  tooltip_container.update(grids_stats[g_index][district_id - 1]);
  tooltip_container.updatePosition(event.pageX, event.pageY);
});