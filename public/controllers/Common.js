// Why d3? Makes plotting the geographic data easier.
// "Perfection is the enemy of profitability," Cuban said. "Perfection is the enemy of success. You don't need to be perfect, because nobody is."
// Don't feel sorry for yourself (exaggerate your misfortune and experience a sense of hopelessness and helplessness)
// Neat thing I learned: sometimes if the format of the CSS trait is wrong, nothing will show, and no error is printed.
// I like to style things extreme to verify they are working, then soften it up.
// Part of what is making this messy is that I am trying to do two things: 1) build a set of "building blocks", 2) build the application.
// Building blocks are nice, but it really requires careful care and design. Me building blocks from other blocks is really just
// making things messy. Instead, build reusable 'widgets' where appropriate, each widget is self contained (draw wise).
// Do I really need models which wrap really simple data-structures?
// Rounding should be done higher up than in the GUI. (ie, it should be done in the model)
// Styling should happen up towards the top. You can apply some simple class names when you have the same element
// in the same location but want to differentiate it, but otherwise selection should be enough
// Remember, this (selector) can be really specific, its outgoing api though should not be!
// 1 population, multiple grids (next switches grids) (remember, this IS the model)
// Changes are announced as Voter [voter_info, position, district, party]
// Add / change / remove are the events (the the general api)
// For the events, I do wonder 2 things : should the event directly contain the objects?, is it ok to send lots of events for?
// One thing to point out, the events are great in the sense that the abstraction doesn't need to be named, but you could instead
// just call a method on the observer. Either way, an API has to be defined and adhered to.
// Think about patterns, open / closed, and law of demeter
// Remember that some of the issues are because Javascript isn't the best (in terms of map working the same as Java IE hash / equal function)
// For an API that attempts to allow you to handle the individual changes to data in the model, this ends up causing us to have to write
// the change we are interested into the model api (thus, we are taking an interest in what people do with our data), and secondly we
// end up having to allow observers to identify individual elements. In the long run this means the observers have to save copies or a record
// of individual elements, which starts to duplicate memory.
// ASSUMPTION: The aggregator assumes there is no tie.. (This whole thing assumes there is no tie). Also assumes there is at least one voter.
// MORE VIEWS: The feeling of needing more views is really that I want multiple interfaces, javascript just makes this feel less formal
// TECHNICALLY: The 'results' is really more of a 'census'
// NOTE: Somebody else should pass us the winner in each district! (ie, subscribe to a different view)
// GOAL: Lift the computation out of the result bar
// SUGGESTION: Add it as data to the event
// NOTE: This should be reusable for the generic map too
// GOAL: Allow this to be reusable simply by passing in a different subject
// SUGGESTION: We should receive percents for the overall, and total seats won for districts (remember, the view is doing the computation)
// BUILDER: For the result bar builder, add a bar by adding a subject?
// ASSUMPTION: I am assuming the size of a grid won't change. This is fine, but hypothetically it could! (ie, the canvas needs resizing)
// NOTE: The adaptor/decorator pattern exist. These might help alleviate lower levels relying on specific higher level types if you
// want something at the lower level to be reusable.
// NOTE: Code reuse on subscribe / observer pattern?
// https://github.com/veltman/d3-stateplane
// https://zia207.github.io/geospatial-r-github.io/map-projection-coordinate-reference-systems.html
// https://d3-wiki.readthedocs.io/zh_CN/master/Geo-Projections/
// http://ogre.adc4gis.com/
// https://pureinfotech.com/extract-tar-gz-files-windows-11/
// https://github.com/d3/d3-geo
// https://github.com/d3/d3/blob/main/API.md#geographies-d3-geo
// https://gdal.org/programs/ogr2ogr.html
// https://www.d3indepth.com/enterexit/
// https://observablehq.com/@d3/u-s-map-canvas
// https://www.d3indepth.com/shapes/
// https://datawanderings.com/2018/08/23/changing-dataset-projection-with-ogr2ogr/
// 2018 Texas
// 2012 Pennsylvania
// 2014 Maryland

// ---------------------------------- HELPER FUNCTIONS ---------------------------------- //

function convertArrayToModel(grid_array, square_size, district_cache) {
  let rows = grid_array.length;
  let cols = grid_array[0].length;

  let grid_model_builder = new GridBuilder()
    .setRows(rows)
    .setColumns(cols)
    .setHeight(rows * square_size)
    .setWidth(cols * square_size);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let district_num = grid_array[r][c];

      if (!district_cache.has(district_num)) {
        district_cache.set(district_num, new District(district_num));
      }

      let district = district_cache.get(district_num);
      let cell = new Cell2d(r, c, district);
      grid_model_builder.setCell(cell);
    }
  }

  return grid_model_builder.build();
}

function createWidget(model, bar_parent, grid_parent, tooltip_parent, img_size, grid_size, root_id, bar_width, bar_height, bar_padding) {
  let aggregator = new GridResultAggregator(model);
  let results_bar = new ResultBarBuilder()
    .setDOMParent(bar_parent)
    .setSubject(aggregator)
    .setBarWidth(bar_width)
    .setBarHeight(bar_height)
    .setBarPadding(bar_padding)
    .build();
  let grid_ui = new GridDisplayBuilder()
    .setDOMParent(grid_parent)
    .setSubject(model)
    .setCellSize(img_size / grid_size)
    .setColumns(grid_size)
    .setRows(grid_size)
    .build();
  let district_aggregator = new DistrictAggregatorBuilder()
    .setAggregatorSubject(aggregator)
    .setDistrictSubject(grid_ui)
    .build();
  let party_list = new PartyAdvantageListBuilder()
    .setSubject(district_aggregator)
    .build();
  let tooltip = new TooltipContainerBuilder()
    .setDOMParent(tooltip_parent)
    .setInnerContents(party_list)
    .setRootCSSId(root_id)
    .setSubject(grid_ui)
    .build();

  model.update();
}