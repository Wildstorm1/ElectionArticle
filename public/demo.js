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

function makePopulation(num, pos_obj, noise_obj) {
  let points = new Points();

  for (let i = 0; i < num; i++) {
    let x = pos_obj.random();
    let y = pos_obj.random();
    let party = noise_obj.simplex2(x, y) < 0 ? blue_party : red_party;
    let point = new IdPoint2D(x, y, party);
    points.addPoint(point);
  }

  return points;
}

let population_points = makePopulation(num_points, uniform, noise);
let overall_results = computeVotingStats(population_points);
let district_results = [];
let grids_stats = [];
let groups = [];

for (let i = 0; i < grids.length; i++) {
  groups.push(GroupedGrid.newGridFromArray(grids[i]));
  district_results.push(computeDelegates(groups[i], population_points));
  grids_stats.push(computeDistrictVoterStats(groups[i], population_points));
}

// ---------------------------------- CORE IMAGE ---------------------------------- //

let canvas = d3.select('#demo').append('svg').attr('width', img_size).attr('height', img_size);
let pop_layer = new SVGPopulationGUI(canvas, img_size, img_size, 'svg_population');
let grid_layer = new SVGGridGUI(grid_size, grid_size, img_size / grid_size, canvas, 'svg_grid');

let result_canvas = d3.select('#population_bar').append('svg').attr('width', result_bar_width).attr('height', 2 * result_bar_height + result_bar_padding);
let overall_bar_layer = new SVGResultBar(result_bar_width, result_bar_height, result_canvas, 'svg_bar');
overall_bar_layer.setStyler(electionBarStyler);
let district_bar_layer = new SVGResultBar(result_bar_width, result_bar_height, result_canvas, 'svg_bar').translate(0, result_bar_height + result_bar_padding);
district_bar_layer.setStyler(electionBarStyler);

let population_tip = new PartyAdvantageTooltip('tooltip');
let tooltip_container = new PointedTooltipContainer(d3.select('#tooltip_div'), population_tip, 'tooltip');
tooltip_container.updatePosition(0, 0);

// ---------------------------------- APPLICATION ---------------------------------- //

d3.select('#switch_grid')
  .on('click', () => {
    g_index = (g_index + 1) % groups.length;
    district_bar_layer.updateBar(district_results[g_index]);
    district_bar_layer.sort(partySorter);
    grid_layer.updateBorders(groups[g_index]);
  })
  .on('mouseover', () => {
    d3.select('#button_span').attr('class', 'button_text_hover');
  })
  .on('mouseout', () => {
    d3.select('#button_span').attr('class', 'button_text');
  });

grid_layer.on('mouseover', (event) => {
  tooltip_container.updatePosition(event.pageX, event.pageY);
  tooltip_container.showTooltip();
}).on('mouseout', (event) => {
  tooltip_container.updatePosition(event.pageX, event.pageY);
  tooltip_container.hideTooltip();
}).on('mousemove', (event) => {
  let grid_cell = event.gridCell;
  let district_id = groups[g_index].getCellId(grid_cell.row, grid_cell.column);
  tooltip_container.update(grids_stats[g_index].get(district_id));
  tooltip_container.updatePosition(event.pageX, event.pageY);
});
district_bar_layer.updateBar(district_results[g_index]);
district_bar_layer.sort(partySorter);
overall_bar_layer.updateBar(overall_results);
overall_bar_layer.sort(partySorter);
pop_layer.updatePopulation(population_points, (element, style) => {
  return `${style}_${element.getId().getPartyId()}`;
});
grid_layer.updateBorders(groups[g_index]);