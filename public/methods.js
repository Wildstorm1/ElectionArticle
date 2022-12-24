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

let cracking_points = [];
let packing_points = [];

for (let i = 0; i < m_num_points; i++) {
  let x = uniform_fct.random();
  let y = uniform_fct.random();
  let party = radial_fct.sample(x, y) < 0 ? 'DEM' : 'REP';
  cracking_points.push({ 'x': x, 'y': y, 'party': party });
  packing_points.push({ 'x': x, 'y': y, 'party': party });
}

// ---------------------------------- CORE IMAGE ---------------------------------- //

let cracking_canvas = d3.select('#cracking').append('svg').attr('width', m_img_size).attr('height', m_img_size);
let cracked_pop = new SVGPopulationGUI(cracking_canvas, m_img_size, m_img_size, 'svg_population');
let cracked_grid = new SVGGridGUI(m_grid_size, m_grid_size, m_img_size / m_grid_size, cracking_canvas, 'svg_grid');
cracked_pop.updatePopulation(cracking_points);
cracked_grid.updateBorders(cracked_model_grid);

let packing_canvas = d3.select('#packing').append('svg').attr('width', m_img_size).attr('height', m_img_size);
let packed_pop = new SVGPopulationGUI(packing_canvas, m_img_size, m_img_size, 'svg_population');
let packed_grid = new SVGGridGUI(m_grid_size, m_grid_size, m_img_size / m_grid_size, packing_canvas, 'svg_grid');
packed_pop.updatePopulation(packing_points);
packed_grid.updateBorders(packed_model_grid);

/*
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
*/

// Go and tie text padding properly (measure the bar group size)
createResultsBar('cracking_bar', m_cracked_tag, m_bar_height, m_bar_width, m_bar_text_width, m_bar_padding);
createResultsBar('packing_bar', m_packed_tag, m_bar_height, m_bar_width, m_bar_text_width, m_bar_padding);
updateResultsBar(m_cracked_tag, cracked_model_grid, m_grid_size, m_districts, m_img_size, cracking_points, m_bar_height, m_bar_width, m_bar_text_padding, party_color);
updateResultsBar(m_packed_tag, packed_model_grid, m_grid_size, m_districts, m_img_size, packing_points, m_bar_height, m_bar_width, m_bar_text_padding, party_color);

createToolTip('cracking', m_cracked_tag, m_tooltip_width);
createToolTip('packing', m_packed_tag, m_tooltip_width);
//createGrid('cracking', svg_crack_grid, line_color, m_grid_size, m_square_size);
//createGrid('packing', svg_pack_grid, line_color, m_grid_size, m_square_size);

//updateBorders('cracking', cracked_model_grid, m_grid_size, line_color);
//updateBorders('packing', packed_model_grid, m_grid_size, line_color);
//plotPopulation('g_crack_population', party_color, circle_radius, cracking_points);
//plotPopulation('g_pack_population', party_color, circle_radius, packing_points);