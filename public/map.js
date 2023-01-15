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

// ---------------------------------- SETTINGS ---------------------------------- //

let img_width = 1000;
let img_height = 500;
let bar_width = 1040;
let bar_height = 40;
let bar_padding = 10;
let bar_text_width = 54;
let bar_text_padding = 3;
let min_zoom_factor = 1;
let max_zoom_factor = 5;
let tooltip_width = 180;
let tooltip_height = 120;
let tooltip_height_padding = 20;
let outline_color = '#094067';
let outline_light = '#fffffe';
let text_color = '#094067';

// ---------------------------------- CALCULATED VALUES ---------------------------------- //

let red_color = getComputedStyle(document.documentElement).getPropertyValue('--red');
let blue_color = getComputedStyle(document.documentElement).getPropertyValue('--blue');
let party_color = d3.interpolateHcl(blue_color, red_color);
let path;

// ---------------------------------- HELPER FUNCTIONS ---------------------------------- //

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

// ---------------------------------- CORE IMAGE ---------------------------------- //

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

// ---------------------------------- RESULTS BAR ---------------------------------- //

let result_bar = d3.select('#results_bar')
  .style('display', 'flex')
  .style('align-items', 'center')
  .style('justify-content', 'center')
  .append('svg')
  .attr('width', bar_width + 2 * bar_text_width)
  .attr('height', 2 * bar_height + 3 * bar_padding);
let result_bar_group = result_bar.append('g')
  .attr('transform', `translate(${bar_text_width}, ${bar_padding})`);
let popular_vote = result_bar_group.append('g')
  .attr('transform', `translate(${0},${0})`);
popular_vote.append('rect')
  .attr('id', 'dem_pop_vote')
  .attr('class', 'svg_bar_blue');
popular_vote.append('rect')
  .attr('id', 'rep_pop_vote')
  .attr('class', 'svg_bar_red');
popular_vote.append('rect')
  .attr('id', 'other_pop_vote');
let district_share = result_bar_group.append('g')
  .attr('id', 'district_share')
  .attr('transform', `translate(${0},${bar_padding + bar_height})`);
createResultsTextLabel(result_bar_group, 'dem_overall_text', 0, (bar_height + bar_padding) / 2);
createResultsTextLabel(result_bar_group, 'rep_overall_text', bar_width + bar_text_padding, (bar_height + bar_padding) / 2);
createResultsTextLabel(result_bar_group, 'dem_district_text', 0, 1.5 * (bar_height + bar_padding));
createResultsTextLabel(result_bar_group, 'rep_district_text', bar_width + bar_text_padding, 1.5 * (bar_height + bar_padding));

// ---------------------------------- ZOOM / PAN ---------------------------------- //

let zoom = d3.zoom().scaleExtent([min_zoom_factor, max_zoom_factor]).translateExtent([[0, 0], [img_width, img_height]]).on('zoom', function(event) {
  d3.select('#g_precinct')
    .attr('transform', `translate(${event.transform.x},${event.transform.y}),scale(${event.transform.k})`);

  d3.select('#g_district')
    .attr('transform', `translate(${event.transform.x},${event.transform.y}),scale(${event.transform.k})`);
});
  
svg.call(zoom);

// ---------------------------------- CREATE TOOLTIP ---------------------------------- //

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

// ---------------------------------- HOVER DISTRICT EVENTS ---------------------------------- //

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

// ---------------------------------- LOAD DATA ---------------------------------- //

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

  let district_width = Math.floor((bar_width + 2 * bar_text_padding) / data['Election2012'].Summary[0].districts);
  let available_width = data['Election2012'].Summary[0].districts * district_width;
  let nc_dem_percent = data['Election2012'].Summary[0].dem_percent / 100;
  let nc_rep_percent = data['Election2012'].Summary[0].rep_percent / 100;
  let nc_rescale = nc_dem_percent + nc_rep_percent;
  let dem_width = (nc_dem_percent / nc_rescale) * available_width;
  let rep_width = (nc_rep_percent / nc_rescale) * available_width;
  
  d3.select('#dem_pop_vote')
    .attr('width', dem_width)
    .attr('height', bar_height)
    .attr('x', 0)
    .attr('fill', party_color(0));

  d3.select('#rep_pop_vote')
    .attr('width', rep_width)
    .attr('height', bar_height)
    .attr('x', dem_width)
    .attr('fill', party_color(1));

  d3.select('#dem_overall_text')
    .text(`${Math.round(nc_dem_percent * 1000) / 10}%`);

  d3.select('#rep_overall_text')
    .text(`${Math.round(nc_rep_percent * 1000) / 10}%`);

  let nc_district_results = d3.rollup(data['Election2012'].Districts.features, v => v.length, d => d.properties.Party);

  d3.select('#dem_district_text')
    .text(`${nc_district_results.get('DEM')}`);

  d3.select('#rep_district_text')
    .text(`${nc_district_results.get('REP')}`);

  let overall_label_measures = d3.select('#dem_overall_text').node().getBBox();
  d3.select('#dem_overall_text')
    .attr('transform', `translate(${-overall_label_measures.width - bar_text_padding},${0}),scale(1)`);

  let district_label_measures = d3.select('#dem_district_text').node().getBBox();
  d3.select('#dem_district_text')
    .attr('transform', `translate(${-district_label_measures.width - bar_text_padding},${0}),scale(1)`);

  d3.select('#district_share')
    .selectAll('rect')
    .data(data['Election2012'].Districts.features)
    .enter()
    .append('rect')
    .sort((a, b) => {
      if (a.properties.Party === 'DEM' && b.properties.Party === 'REP') {
        return -1;
      } else if (a.properties.Party === 'REP' && b.properties.Party === 'DEM') {
        return 1;
      } else {
        return a.properties.District < b.properties.District ? -1 : 1;
      }
    })
    .attr('width', district_width)
    .attr('height', bar_height)
    .attr('x', function(e, i) { return i * district_width; })
    .attr('id', function(e) { return `DistrictBlock${e.properties.District}`; })
    .attr('class', function(e) { return `svg_bar_${ e.properties.Party === 'DEM' ? 'blue' : 'red' }`; })
    .attr('stroke-width', 2)
    .attr('stroke', 'transparent')
    .attr('fill', function(e) {
      if (e.properties.Party === 'DEM') {
        return party_color(0);
      } else if (e.properties.Party === 'REP') {
        return party_color(1);
      } else {
        return '#EDD04E';
      }
    });
});