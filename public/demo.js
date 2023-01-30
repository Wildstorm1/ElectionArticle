// ---------------------------------- SETTINGS ---------------------------------- //

let result_bar_width = 496;
let result_bar_height = 40;
let result_bar_padding = 10;
let img_size = 396;
let grid_size = 6;
let num_points = 500;
let noise_seed = 17;
let pop_seed = 12;

// ---------------------------------- CALCULATED VALUES ---------------------------------- //

let square_size = img_size / grid_size;
let noise = new Noise(noise_seed);
let uniform = new Uniform(pop_seed);

// ---------------------------------- CREATE DATA ---------------------------------- //

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

// ---------------------------------- CONVERT DATA TO MODEL ---------------------------------- //

let parties = [ new Party('Blue'), new Party('Red') ];
let population_model_builder = new PopulationBuilder();

for (let i = 0; i < num_points; i++) {
  let x = uniform.random();
  let y = uniform.random();
  let point = new Point2d(x * img_size, y * img_size);
  let party = parties[noise.simplex2(x, y) < 0 ? 0 : 1];
  population_model_builder.addVoter(new Voter(point, party));
}

let population_model = population_model_builder.build();
let selector_model_builder = new SelectorBuilder().setPopulation(population_model);
let districts = new Map();

for (let i = 0; i < grids.length; i++) {
  let grid_model = convertArrayToModel(grids[i], square_size, districts);
  selector_model_builder.addGrid(grid_model);
}

let model = selector_model_builder.build();

// ---------------------------------- SET UP VIEWS/CONTROLLERS ---------------------------------- //

createWidget(
  model,
  document.getElementById('population_bar'),
  document.getElementById('demo'),
  document.getElementById('tooltip_div'),
  img_size,
  grid_size,
  'DemoTooltip',
  result_bar_width,
  result_bar_height,
  result_bar_padding
);

let button = document.getElementById('GridButton');
let button_span = document.getElementById('GridButtonSpan');
button.addEventListener('click', () => { model.update(); });
button.addEventListener('mouseover', () => { button_span.setAttribute('class', 'Hover'); });
button.addEventListener('mouseout', () => { button_span.setAttribute('class', 'NoHover'); });