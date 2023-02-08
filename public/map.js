// ---------------------------------- SETTINGS ---------------------------------- //

let img_width = 1000;
let img_height = 500;
let bar_width = 1040;
let bar_height = 40;
let bar_padding = 10;
let min_zoom_factor = 1;
let max_zoom_factor = 5;

// ---------------------------------- LOAD MODELS / BUILD APP  ---------------------------------- //

new Promise(function(resolve) {
  let data_file_years = ['2012'];
  let promises = [];
  let data = {};

  data_file_years.forEach((year) => {
    data[`Election${year}`] = { Summary: null, Precincts: null, Districts: null };

    promises.push(d3.json(`data/PrecinctResultsTopo${year}.json`).then(function(json) {
        data[`Election${year}`].Precincts = topojson.feature(json, json.objects[`Precincts${year}`]);
    }));

    promises.push(d3.json(`data/DistrictsTopo${year}.json`).then(function(json) {
      data[`Election${year}`].Districts = topojson.feature(json, json.objects[`Districts${year}`]);
    }));

    promises.push(d3.csv(`data/Summary${year}.csv`).then(function(csv) {
      data[`Election${year}`].Summary = csv;
    }));
  });

  Promise.all(promises).then(function() {
    resolve(data);
  });
}).then(function(data) {
  let major_parties = [ new Party('Democrat'), new Party('Republican') ];
  let nc_2012_builder = new StateElectionBuilder();

  for (let i = 0; i < data[`Election2012`].Precincts.features.length; i++) {
    let precinct_data = data[`Election2012`].Precincts.features[i];

    let votes = new VoteShareBuilder()
      .setPartyAmount(major_parties[0], Number(precinct_data.properties.demvotes))
      .setPartyAmount(major_parties[1], Number(precinct_data.properties.repvotes))
      .build();

    let precinct = new PrecinctElectionBuilder()
      .setCounty(precinct_data.properties.county)
      .setId(precinct_data.properties.precinct)
      .setShapePath(precinct_data.geometry)
      .setVoteShare(votes)
      .build();

    nc_2012_builder.addPrecinct(precinct);
  }

  for (let i = 0; i < data[`Election2012`].Districts.features.length; i++) {
    let district_data = data[`Election2012`].Districts.features[i];

    let votes = new VoteShareBuilder()
      .setPartyAmount(major_parties[0], Number(district_data.properties.demvotes))
      .setPartyAmount(major_parties[1], Number(district_data.properties.repvotes))
      .build();

    let district = new DistrictElectionBuilder()
      .setWinningParty(major_parties[district_data.properties.Party === 'DEM' ? 0 : 1])
      .setDistrictId(new District(district_data.properties.District))
      .setShapePath(district_data.geometry)
      .setVoteShare(votes)
      .build();

    nc_2012_builder.addDistrict(district);
  }

  let nc_2012_votes = new VoteShareBuilder()
    .setPartyAmount(major_parties[0], Number(data[`Election2012`].Summary[0].demvotes))
    .setPartyAmount(major_parties[1], Number(data[`Election2012`].Summary[0].repvotes))
    .build();

  nc_2012_builder.setStatewideResults(nc_2012_votes);
  let nc_2012 = nc_2012_builder.build();

  let model = new MapSelectorBuilder()
    .addState(nc_2012)
    .build();

  let result_aggregator = new MapResultAggregator(model);
  let map_result_bar = new ResultBarBuilder()
    .setBarHeight(bar_height)
    .setBarWidth(bar_width)
    .setBarPadding(bar_padding)
    .setDOMParent(document.getElementById('results_bar'))
    .setSubject(result_aggregator)
    .build();

  let blue_color = getComputedStyle(document.documentElement).getPropertyValue('--blue');
  let red_color = getComputedStyle(document.documentElement).getPropertyValue('--red');
  let map_colorizer = new USATwoPartyColorizer(major_parties[0], blue_color, major_parties[1], red_color);
  let map_image = new MapDisplayBuilder()
    .setDOMParent(d3.select('#chart'))
    .setSubject(model)
    .setColorizer(map_colorizer)
    .setHeight(img_height)
    .setWidth(img_width)
    .setMinZoom(min_zoom_factor)
    .setMaxZoom(max_zoom_factor)
    .build();

  let district_aggregator = new DistrictAggregatorBuilder()
    .setAggregatorSubject(result_aggregator)
    .setDistrictSubject(map_image)
    .build();
  let results_list = new ElectionResultsListBuilder()
    .setSubject(district_aggregator)
    .build();
  let tooltip = new TooltipContainerBuilder()
    .setDOMParent(document.getElementById('tooltip_div'))
    .setInnerContents(results_list)
    .setRootCSSId('Tooltip')
    .setSubject(map_image)
    .build();

  model.update();
});