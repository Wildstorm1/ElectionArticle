// TODO: I need an api that defines how to define a custom image object
// TODO: I also want to create some model objects to abstract away the data a bit

// ---------------------------------- GRID GUI ---------------------------------- //

/*
 * Represents a GUI for a grid of configurable squares
 */
class SVGGridGUI {
  // Number of columns in the grid
  #columns;

  // Number of row in the grid
  #rows;

  // The tag to include in the SVG elements styling class
  #style;

  // An array holding references to each square in the grid
  #svg_grid;

  // The SVG DOM group element which contains the SVG image elements
  #svg_group;

  /*
   * @param parent - the SVG element to attach the line to
   * @param style_class - the styling class to tag the SVG element with
   * @param x1 - the x coordinate of the lines starting point
   * @param y1 - the y coordinate of the lines starting point
   * @param x2 - the x coordinate of the lines ending point
   * @param y2 - the y coordinate of the lines ending point
   * @returns a new SVG line element within the given parent SVG DOM element
   */
  static #createLine(parent, style_class, x1, y1, x2, y2) {
    return parent.append('line')
      .attr('class', style_class)
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2);
  }

  /*
   * @param parent - the SVG element to attach the square to
   * @param style_class - the styling class to tag the SVG elements with
   * @param size - the height / width in pixels of the square
   * @param i - the row index of the square within the grid
   * @param j - the column index of the square within the grid
   * @returns a square object containing references to the SVG DOM elements
   */
  static #createSquare(parent, style_class, size, i, j) {
    let square_group = parent.append('g')
      .attr('transform', `translate(${j * size},${i * size})`);
    let square = square_group.append('rect')
      .attr('class', `${style_class}_cell`)
      .attr('width', size)
      .attr('height', size);
    let top_line = SVGGridGUI.#createLine(square_group, `${style_class}_solid_line`, 0, 0, size, 0);
    let right_line = SVGGridGUI.#createLine(square_group, `${style_class}_solid_line`, size, 0, size, size);
    let bottom_line = SVGGridGUI.#createLine(square_group, `${style_class}_solid_line`, size, size, 0, size);
    let left_line = SVGGridGUI.#createLine(square_group, `${style_class}_solid_line`, 0, size, 0, 0);
    return { rect: square, top: top_line, right: right_line, bottom: bottom_line, left: left_line };
  }

  /*
   * @param grid - 2D array filled with cell groupings
   * @param style_class - the styling class to tag the SVG elements with
   * @param group_id - the id to compare the given grid cell against
   * @param i - the row index of the square
   * @param j - the column index of the square
   * @returns the CSS class for the edge between grid[i][j] and a square with id group_id, defaulting
   * to solid if the square is outside the bounds of the grid
   */
  static #getGridLineStyle(grid, style_class, group_id, i, j) {
    if (i < 0 || j < 0 || grid.length === 0 || i >= grid.length || j >= grid[0].length) {
      return `${style_class}_solid_line`;
    }

    if (grid[i][j] === group_id) {
      return `${style_class}_transparent_line`;
    } else {
      return `${style_class}_solid_line`;
    }
  }

  /*
   * @param grid_rows - the number of rows in the grid  
   * @param grid_columns - the number of columns in the grid
   * @param square_size - the size of a square in the grid in pixels
   * @param canvas - the SVG DOM element to attach the grid to
   * @param style_class - the styling class to tag the SVG elements with
   */
  constructor(grid_rows, grid_columns, square_size, canvas, style_class) {
    this.#columns = grid_columns;
    this.#rows = grid_rows;
    this.#style = style_class;
    this.#svg_grid = new Array(grid_rows);
    this.#svg_group = canvas.append('g');

    // TODO: expose the events!
    // TODO: really over the top is a layered api to build up an image built from components (really these objects represent a g element)

    for (let i = 0; i < this.#rows; i++) {
      this.#svg_grid[i] = new Array(this.#columns);

      for (let j = 0; j < this.#columns; j++) {
        this.#svg_grid[i][j] = SVGGridGUI.#createSquare(this.#svg_group, this.#style, square_size, i, j);
      }
    }
  }

  /*
   * @param grid - 2D array filled with cell grouping ids
   * @effects - updates the SVG image to reflect the groupings given in grid
   * @throws - Error if the grid dimensions do not match the dimensions of the SVG image
   */
  updateBorders(grid) {
    if (grid.length !== this.#rows || grid[0].length !== this.#columns) {
      throw new Error(`Invalid grid dimensions! Expected ${this.#rows} x ${this.#columns}`);
    }

    for (let i = 0; i < this.#rows; i++) {
      for (let j = 0; j < this.#columns; j++) {
        this.#svg_grid[i][j].left.attr('class', SVGGridGUI.#getGridLineStyle(grid, this.#style, grid[i][j], i, j - 1));
        this.#svg_grid[i][j].bottom.attr('class', SVGGridGUI.#getGridLineStyle(grid, this.#style, grid[i][j], i + 1, j));
        this.#svg_grid[i][j].right.attr('class', SVGGridGUI.#getGridLineStyle(grid, this.#style, grid[i][j], i, j + 1));
        this.#svg_grid[i][j].top.attr('class', SVGGridGUI.#getGridLineStyle(grid, this.#style, grid[i][j], i - 1, j));
      }
    }
  }
}

// ---------------------------------- POPULATION GUI ---------------------------------- //

/*
 * Represents an SVG image layer which plots a population of points
 */
class SVGPopulationGUI {
  // The width of the area to plot the points in pixels
  #width;

  // The height of the area to plot the points in pixels
  #height;

  // The tag to include in the SVG elements styling class
  #style;

  // The SVG DOM group element which contains the SVG image elements
  #svg_group;

  constructor(canvas, img_width, img_height, style_class) {
    this.#width = img_width;
    this.#height = img_height;
    this.#style = style_class;
    this.#svg_group = canvas.append('g');
  }

  updatePopulation(population) {
    this.#svg_group.selectAll('circle')
      .data(population)
      .join(
        function(enter) {
          return enter.append('circle');
        },
        function(update) {
          return update;
        },
        function(exit) {
          return exit.remove();
        }
      )
      .attr('cx', (d) => { return d.x * this.#width; })
      .attr('cy', (d) => { return d.y * this.#height; })
      .attr('class', (d) => { return d.party === 'DEM' ? `${this.#style}_dem`: `${this.#style}_rep`; }); // TODO: make this more flexible?
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
*/