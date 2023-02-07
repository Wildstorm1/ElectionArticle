// ---------------------------------- SETTINGS ---------------------------------- //

let m_grid_size = 10;
let m_img_size = 325;
let m_num_points = 500;
let m_radius = 0.4049;
let m_pop_seed = 15;
let m_bar_width = 374;
let m_bar_height = 40;
let m_bar_padding = 10;

// ---------------------------------- CALCULATED VALUES ---------------------------------- //

let m_square_size = m_img_size / m_grid_size;
let radial_fct = new Radial(m_radius);
let uniform_fct = new Uniform(m_pop_seed);

// ---------------------------------- CREATE DATA ---------------------------------- //

let cracked_grid = [
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

let packed_grid = [
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

// ---------------------------------- CONVERT DATA TO MODEL ---------------------------------- //

let m_parties = [ new Party('Blue'), new Party('Red') ];
let m_population_model_builder = new PopulationBuilder();

for (let i = 0; i < m_num_points; i++) {
  let x = uniform_fct.random();
  let y = uniform_fct.random();
  let point = new Point2d(x * m_img_size, y * m_img_size);
  let party = parties[radial_fct.sample(x, y) < 0 ? 0 : 1];
  m_population_model_builder.addVoter(new Voter(point, party));
}

let m_districts = new Map();
let m_population_model = m_population_model_builder.build();
let packed_model_builder = new GridSelectorBuilder().setPopulation(m_population_model);
let cracked_model_builder = new GridSelectorBuilder().setPopulation(m_population_model);

let cracked_grid_model = convertArrayToModel(cracked_grid, m_square_size, m_districts);
let packed_grid_model = convertArrayToModel(packed_grid, m_square_size, m_districts);
cracked_model_builder.addGrid(cracked_grid_model);
packed_model_builder.addGrid(packed_grid_model);

let cracked_model = cracked_model_builder.build();
let packed_model = packed_model_builder.build();

// ---------------------------------- SET UP CRACKED VIEWS/CONTROLLERS ---------------------------------- //

createWidget(
  cracked_model,
  document.getElementById('cracking_bar'),
  document.getElementById('cracking'),
  document.getElementById('tooltip_div'),
  m_img_size,
  m_grid_size,
  'DemoTooltip',
  m_bar_width,
  m_bar_height,
  m_bar_padding
);

// ---------------------------------- SET UP PACKED VIEWS/CONTROLLERS ---------------------------------- //

createWidget(
  packed_model,
  document.getElementById('packing_bar'),
  document.getElementById('packing'),
  document.getElementById('tooltip_div'),
  m_img_size,
  m_grid_size,
  'DemoTooltip',
  m_bar_width,
  m_bar_height,
  m_bar_padding
);