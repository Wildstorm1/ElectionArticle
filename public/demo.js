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

function makePopulation(num, pos_obj, noise_obj) {
  let points = [];

  for (let i = 0; i < num; i++) {
    let x = pos_obj.random();
    let y = pos_obj.random();
    let party = noise_obj.simplex2(x, y) < 0 ? 'DEM' : 'REP';
    points.push({ 'x': x, 'y': y, 'party': party });
  }

  return points;
}

let population_points = makePopulation(num_points, uniform, noise);

// ---------------------------------- CORE IMAGE ---------------------------------- //

let canvas = d3.select('#demo').append('svg').attr('width', img_size).attr('height', img_size);
let pop_layer = new SVGPopulationGUI(canvas, img_size, img_size, 'svg_population');
let grid_layer = new SVGGridGUI(grid_size, grid_size, img_size / grid_size, canvas, 'svg_grid');

createToolTip('demo', demo_app_tag, demo_tooltip_width);
createResultsBar('population_bar', demo_app_tag, result_bar_height, result_bar_width, result_bar_text_width, result_bar_padding);

// ---------------------------------- APPLICATION ---------------------------------- //

d3.select('#switch_grid')
  .on('click', () => {
    g_index = (g_index + 1) % grids.length;
    updateResultsBar(demo_app_tag, grids[g_index], grid_size, grid_size, img_size, population_points, result_bar_height, result_bar_width, result_bar_text_padding, party_color);
    grid_layer.updateBorders(grids[g_index]);
  })
  .on('mouseover', () => {
    d3.select('#button_span').attr('class', 'button_text_hover');
  })
  .on('mouseout', () => {
    d3.select('#button_span').attr('class', 'button_text');
  });

updateResultsBar(demo_app_tag, grids[g_index], grid_size, grid_size, img_size, population_points, result_bar_height, result_bar_width, result_bar_text_padding, party_color);
pop_layer.updatePopulation(population_points);
grid_layer.updateBorders(grids[g_index]);
//plotPopulation('g_population', party_color, circle_radius, population_points);