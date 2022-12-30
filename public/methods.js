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

let points_model = new Points();

for (let i = 0; i < m_num_points; i++) {
  let x = uniform_fct.random();
  let y = uniform_fct.random();
  let party = radial_fct.sample(x, y) < 0 ? 'dem' : 'rep';
  let point = new IdPoint2D(x, y, party);
  points_model.addPoint(point);
}

let cracked_model = GroupedGrid.newGridFromArray(cracked_model_grid);
let packed_model = GroupedGrid.newGridFromArray(packed_model_grid);

let methods_overall_results = computeVotingStats(points_model);
let cracked_district_results = computeDelegates(cracked_model, points_model);
let packed_district_results = computeDelegates(packed_model, points_model);

// ---------------------------------- CORE IMAGE ---------------------------------- //

let cracking_canvas = d3.select('#cracking').append('svg').attr('width', m_img_size).attr('height', m_img_size);
let cracked_pop = new SVGPopulationGUI(cracking_canvas, m_img_size, m_img_size, 'svg_population');
let cracked_grid = new SVGGridGUI(m_grid_size, m_grid_size, m_img_size / m_grid_size, cracking_canvas, 'svg_grid');
let cracked_canvas = d3.select('#cracking_bar').append('svg').attr('width', m_bar_width).attr('height', 2 * m_bar_height + m_bar_padding);
let cracked_overall_bar_layer = new SVGResultBar(m_bar_width, m_bar_height, cracked_canvas, 'svg_bar');
let cracked_district_bar_layer = new SVGResultBar(m_bar_width, m_bar_height, cracked_canvas, 'svg_bar').translate(0, m_bar_height + m_bar_padding);
cracked_pop.updatePopulation(points_model, (element, style) => {
  return `${style}_${element.getId()}`;
});
cracked_grid.updateBorders(cracked_model);
cracked_overall_bar_layer.updateBar(methods_overall_results);
cracked_overall_bar_layer.sort(partySorter);
cracked_district_bar_layer.updateBar(cracked_district_results);
cracked_district_bar_layer.sort(partySorter);

let packing_canvas = d3.select('#packing').append('svg').attr('width', m_img_size).attr('height', m_img_size);
let packed_pop = new SVGPopulationGUI(packing_canvas, m_img_size, m_img_size, 'svg_population');
let packed_grid = new SVGGridGUI(m_grid_size, m_grid_size, m_img_size / m_grid_size, packing_canvas, 'svg_grid');
let packed_canvas = d3.select('#packing_bar').append('svg').attr('width', m_bar_width).attr('height', 2 * m_bar_height + m_bar_padding);
let packed_overall_bar_layer = new SVGResultBar(m_bar_width, m_bar_height, packed_canvas, 'svg_bar');
let packed_district_bar_layer = new SVGResultBar(m_bar_width, m_bar_height, packed_canvas, 'svg_bar').translate(0, m_bar_height + m_bar_padding);
packed_pop.updatePopulation(points_model, (element, style) => {
  return `${style}_${element.getId()}`;
});
packed_grid.updateBorders(packed_model);
packed_overall_bar_layer.updateBar(methods_overall_results);
packed_overall_bar_layer.sort(partySorter);
packed_district_bar_layer.updateBar(packed_district_results);
packed_district_bar_layer.sort(partySorter);

// Go and tie text padding properly (measure the bar group size)
//createToolTip('cracking', m_cracked_tag, m_tooltip_width);
//createToolTip('packing', m_packed_tag, m_tooltip_width);