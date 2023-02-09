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