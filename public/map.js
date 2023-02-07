// ---------------------------------- SETTINGS ---------------------------------- //

let img_width = 1000;
let img_height = 500;
let bar_width = 1040;
let bar_height = 40;
let bar_padding = 10;

//let min_zoom_factor = 1;
//let max_zoom_factor = 5;
//let tooltip_width = 180;
//let tooltip_height = 120;
//let tooltip_height_padding = 20;

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

  model.update();
});

// ---------------------------------- CALCULATED VALUES ---------------------------------- //

// let red_color = getComputedStyle(document.documentElement).getPropertyValue('--red');
// let blue_color = getComputedStyle(document.documentElement).getPropertyValue('--blue');
// let party_color = d3.interpolateHcl(blue_color, red_color);
// let path;

// ---------------------------------- HELPER FUNCTIONS ---------------------------------- //

/*
function selectColor(element) {
  let votes = element.properties.demvotes + element.properties.repvotes;
  let rper = element.properties.repvotes / votes;
  return party_color(rper);
}

function createResultsTextLabel(parent, id, xt, yt) {
  parent.append('g')
    .attr('id', `${id}_g`)
    .attr('transform', `translate(${xt},${yt})`)
    .append('text')
    .attr('id', id)
    .attr('fill', text_color)
    .text('xx.x%');
}
*/

// ---------------------------------- CORE IMAGE ---------------------------------- //

/*
let svg = d3.select('#chart')
  .style('display', 'flex')
  .style('align-items', 'center')
  .style('justify-content', 'center')
  .append('svg')
  .attr('width', img_width)
  .attr('height', img_height);
let g_precinct = svg.append('g')
  .attr('id', 'g_precinct');
let g_district = svg.append('g')
  .attr('id', 'g_district');
*/

// ---------------------------------- RESULTS BAR ---------------------------------- //

// let result_bar = new ComparedResultsView(document.getElementById('results_bar'), bar_width, bar_height, bar_padding);

// ---------------------------------- ZOOM / PAN ---------------------------------- //

/*
let zoom = d3.zoom().scaleExtent([min_zoom_factor, max_zoom_factor]).translateExtent([[0, 0], [img_width, img_height]]).on('zoom', function(event) {
  d3.select('#g_precinct')
    .attr('transform', `translate(${event.transform.x},${event.transform.y}),scale(${event.transform.k})`);

  d3.select('#g_district')
    .attr('transform', `translate(${event.transform.x},${event.transform.y}),scale(${event.transform.k})`);
});
  
svg.call(zoom);
*/

// ---------------------------------- CREATE TOOLTIP ---------------------------------- //

/*
let tooltip = d3.select('#chart').append('div').attr('id', 'tooltip')
  .style('position', 'absolute')
  .style('left', '0px')
  .style('top', '0px')
  .style('display', 'none')
  .style('pointer-events', 'none')
  .style('background-color', 'rgba(255, 255, 254, 0.9)')
  .style('box-shadow', '0px 0px 6px 2px rgba(0, 0, 0, 0.28)');
let tooltip_table = tooltip.append('table')
  .style('width', `${tooltip_width}px`);
tooltip_table.append('tr')
  .append('thead')
  .append('th')
  .style('border-bottom', '2px solid #ccc')
  .attr('id', 'tooltip_label');
*/

// ---------------------------------- HOVER DISTRICT EVENTS ---------------------------------- //

/*
function updateToolTipPosition(event) {
  d3.select('#tooltip')
    .style('left', `${event.pageX - (tooltip_width / 2)}px`)
    .style('top', `${event.pageY + tooltip_height_padding}px`);
}

function onMouseMove(event, element) {
  updateToolTipPosition(event);
}

function onMouseOverDistrict(event, element) {
  updateToolTipPosition(event);

  d3.select('#tooltip')
    .style('display', 'block');

  d3.select('#tooltip_label')
    .style('color', `${text_color}`)
    .text(`District ${element.properties.District}`);

  d3.select(`#District${element.properties.District}`)
    .attr('stroke', outline_light);

  d3.select(`#DistrictBlock${element.properties.District}`)
    .attr('stroke', outline_color);

  d3.select('#g_district')
    .selectAll('path')
    .sort(function(a, b) {
      if (a.properties.District === element.properties.District) {
        return 1;
      } else if (b.properties.District === element.properties.District) {
        return -1;
      } else {
        return a.properties.District < b.properties.District ? 1 : a.properties.District === b.properties.District ? 0 : -1;
      }
    });

  d3.select('#district_share')
    .selectAll('rect')
    .sort(function(a, b) {
      if (a.properties.District === element.properties.District) {
        return 1;
      } else if (b.properties.District === element.properties.District) {
        return -1;
      } else {
        return a.properties.District < b.properties.District ? 1 : a.properties.District === b.properties.District ? 0 : -1;
      }
    });
}

function onMouseExitDistrict(event, element) {
  d3.select('#tooltip')
    .style('display', 'none');

  d3.select(`#District${element.properties.District}`)
    .attr('stroke', outline_color);

  d3.select(`#DistrictBlock${element.properties.District}`)
    .attr('stroke', 'transparent');
}
*/

// ---------------------------------- LOAD DATA ---------------------------------- //

/*
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
  let projection = d3.geoAlbers().fitSize([img_width, img_height], data['Election2012'].Precincts);
  path = d3.geoPath().projection(projection);

  d3.select('#g_precinct')
    .selectAll('path')
    .data(data['Election2012'].Precincts.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', selectColor)
    .attr('stroke', outline_light)
    .attr('stroke-width', '0.1')
    .attr('transform', `translate(0,0),scale(1)`);

  d3.select('#g_district')
    .selectAll('path')
    .data(data['Election2012'].Districts.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('id', function(e) { return `District${e.properties.District}`; })
    .attr('fill', 'transparent')
    .attr('stroke', outline_color)
    .attr('stroke-width', '1')
    .attr('transform', `translate(0,0),scale(1)`)
    .on('mouseover', function(event, element) { onMouseOverDistrict(event, element); })
    .on('mouseout', function(event, element) { onMouseExitDistrict(event, element); })
    .on('mousemove', function(event, element) { onMouseMove(event, element); });

  let nc_district_results = d3.rollup(data['Election2012'].Districts.features, v => v.length, d => d.properties.Party);
  let delegation_part_to_whole = new PartToWhole();
  delegation_part_to_whole.setPart(blue_party, nc_district_results.get('DEM'));
  delegation_part_to_whole.setPart(red_party, nc_district_results.get('REP'));

  // TODO : these election results are not a full amount....? Does this matter? Is rescaling fine?
  let nc_dem_percent = Number(data['Election2012'].Summary[0].dem_percent);
  let nc_rep_percent = Number(data['Election2012'].Summary[0].rep_percent);
  let results_part_to_whole = new PartToWhole();
  results_part_to_whole.setPart(blue_party, nc_dem_percent);
  results_part_to_whole.setPart(red_party, nc_rep_percent);

  result_bar.drawOverallResults(results_part_to_whole);
  result_bar.drawDistrictResults(delegation_part_to_whole);
  result_bar.orderBars(party_order);
});
*/