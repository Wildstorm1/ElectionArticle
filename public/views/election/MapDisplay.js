/*
 * Builds a map display UI
 */
class MapDisplayBuilder {
  /*
   * An SVG layer displaying a set of state districts
   */
  static #DistrictUI = class extends KeyedProducer {
    // The district layer group
    #g_district;

    // An array of district SVG elements
    #districts;

    /*
     * @param parent_node - the DOM element to attach the map to
     */
    constructor(parent_node) {
      if (!parent_node) {
        throw new Error('Parent node is falsy!');
      }

      super();
      this.registerEventKey('MouseOut');
      this.registerEventKey('MouseMove');
      this.registerEventKey('MouseOver');

      this.#g_district = parent_node.append('g');
      this.#districts = [];
    }

    /*
     * @param event_name - the event name to send notifications to
     * @param event - the mouse event that triggered us to send a new event
     */
    #invokeEvent(event_name, event, district) {
      let mouse_event = new MouseEvent(event.pageX, event.pageY, district);
      this.sendEvent(event_name, mouse_event);
    }

    /*
     * @param districts - an array of district objects to display
     * @param generator - a path generator function used to transform data to the visual plane
     * @effects redraws the districts
     */
    update(districts, generator) {
      while (this.#districts.length > 0) {
        this.#districts.pop().remove();
      }

      for (let i = 0; i < districts.length; i++) {
        let district = districts[i];
        let shape_data = district.getShapePath();
        let id = district.getDistrictId();

        let path = this.#g_district.append('path')
          .attr('id', 'District')
          .attr('class', 'NoHover')
          .attr('d', generator(shape_data))
          .on('mouseover', (event) => {
            path.raise();
            path.attr('class', 'Hover');
            this.#invokeEvent('MouseOver', event, id);
          })
          .on('mouseout', (event) => {
            path.attr('class', 'NoHover');
            this.#invokeEvent('MouseOut', event, id);
          })
          .on('mousemove', (event) => { this.#invokeEvent('MouseMove', event, id); });

        this.#districts.push(path);
      }
    }

    /*
     * @param x - the x transform offset
     * @param y - the y transform offset
     * @param scale - the scale factor
     * @effects scales and transforms the layer
     */
    zoom(x, y, scale) {
      this.#g_district.attr('transform', `translate(${ x },${ y }),scale(${ scale })`);
    }
  }

  /*
   * An SVG layer displaying a set of state precincts
   */
  static #PrecinctUI = class {
    // The precinct layer group
    #g_precinct;

    // An array of precinct SVG elements
    #precincts;

    // An interpolator object used to color a precinct
    #colorizer;

    /*
     * @param parent_node - the DOM element to attach the map to
     * @param colorizer - the color object used to color the map
     */
    constructor(parent_node, colorizer) {
      if (!parent_node) {
        throw new Error('Parent node is falsy!');
      }

      if (!colorizer) {
        throw new Error('Colorizer is falsy!');
      }

      this.#colorizer = colorizer;
      this.#g_precinct = parent_node.append('g');
      this.#precincts = [];
    }

    /*
     * @param precincts - an array of precinct objects to display
     * @param generator - a path generator function used to transform data to the visual plane
     * @effects redraws the precincts
     */
    update(precincts, generator) {
      while (this.#precincts.length > 0) {
        this.#precincts.pop().remove();
      }

      for (let i = 0; i < precincts.length; i++) {
        let precinct = precincts[i];
        let votes = precinct.getVoteShare();
        let shape_data = precinct.getShapePath();

        let path = this.#g_precinct.append('path')
          .attr('class', 'Precinct')
          .attr('d', generator(shape_data))
          .attr('fill', this.#colorizer.getColor(votes));

        this.#precincts.push(path);
      }
    }

    /*
     * @param x - the x transform offset
     * @param y - the y transform offset
     * @param scale - the scale factor
     * @effects scales and transforms the layer
     */
    zoom(x, y, scale) {
      this.#g_precinct.attr('transform', `translate(${ x },${ y }),scale(${ scale })`);
    }
  }

  /*
   * A UI containing districts and precincts
   */
  static #MapView = class extends KeyedProducer {
    // The svg canvas
    #svg;

    // The precinct UI layer
    #precinct_layer;

    // The district UI layer
    #district_layer;

    // The width of the image in pixels
    #width;

    // The height of the image in pixels
    #height;

    /*
     * @param parent_node - the DOM element to attach the map to
     * @param subject - the object to listen for model changes from
     * @param colorizer - the color object used to color the map
     * @param width - the width of the image in pixels
     * @param height - the height of the image in pixels
     * @param min_zoom - the minimum zoom factor
     * @param max_zoom - the maximum zoom factor
     * @requires width > 0, height > 0, min_zoom >= 1, max_zoom >= 1
     */
    constructor(parent_node, subject, colorizer, width, height, min_zoom, max_zoom) {
      if (!parent_node) {
        throw new Error('Parent node is falsy!');
      }

      if (!subject) {
        throw new Error('Subject is falsy!');
      }

      if (!colorizer) {
        throw new Error('Colorizer is falsy!');
      }

      if (width <= 0) {
        throw new Error('Width must be > 0!');
      }

      if (height <= 0) {
        throw new Error('Height must be > 0!');
      }

      if (min_zoom < 1) {
        throw new Error('Min zoom must be >= 1!');
      }

      if (max_zoom < 1) {
        throw new Error('Max zoom must be >= 1!');
      }

      super();
      this.registerEventKey('MouseMove');
      this.registerEventKey('MouseOver');
      this.registerEventKey('MouseOut');

      this.#svg = parent_node.append('svg')
        .attr('width', width)
        .attr('height', height);

      this.#precinct_layer = new MapDisplayBuilder.#PrecinctUI(this.#svg, colorizer);
      this.#district_layer = new MapDisplayBuilder.#DistrictUI(this.#svg);
      this.#height = height;
      this.#width = width;

      this.#district_layer.subscribe('MouseMove', this, (event) => { this.sendEvent('MouseMove', event); });
      this.#district_layer.subscribe('MouseOver', this, (event) => { this.sendEvent('MouseOver', event); });
      this.#district_layer.subscribe('MouseOut', this, (event) => { this.sendEvent('MouseOut', event); });
      subject.subscribe('Districts', this, (event) => { this.#updateLayer(event, this.#district_layer); });
      subject.subscribe('Precincts', this, (event) => { this.#updateLayer(event, this.#precinct_layer); });

      let zoom = d3.zoom().scaleExtent([min_zoom, max_zoom]).translateExtent([[0, 0], [width, height]]).on('zoom', (event) => {
        this.#precinct_layer.zoom(event.transform.x, event.transform.y, event.transform.k);
        this.#district_layer.zoom(event.transform.x, event.transform.y, event.transform.k);
      });

      this.#svg.call(zoom);
    }

    /*
     * @param event - the event produced on a model update
     * @param layer - the UI layer to update
     */
    #updateLayer(event, layer) {
      let feature_collection = { type: "FeatureCollection", features: [] };
      let units = [];

      for (const state_event of event) {
        let unit = state_event.getElectoralUnit();
        feature_collection.features.push({ type: "Feature", geometry: unit.getShapePath(), properties: {} });
        units.push(unit);
      }

      let projection = d3.geoAlbers().fitSize([this.#width, this.#height], feature_collection);
      let generator = d3.geoPath().projection(projection);

      layer.update(units, generator);
    }
  }

  // The parent node to attach the image to
  #parent;

  // The subject to receive model updates from
  #subject;

  // The width of the image in pixels
  #width;

  // The height of the image in pixels
  #height;

  // The minimum zoom level
  #min_zoom;

  // The maximum zoom level
  #max_zoom;

  // The colorizer function used to paint the map
  #colorizer;

  constructor() {
    this.#parent = null;
    this.#subject = null;
    this.#colorizer = null;
    this.#width = 0;
    this.#height = 0;
    this.#min_zoom = 1;
    this.#max_zoom = 1;
  }

  /*
   * @param parent - the DOM element to add this UI under
   * @return this
   */
  setDOMParent(parent) {
    if (this.#parent === -1) {
      throw new Error('This builder is closed!');
    }

    if (!parent) {
      throw new Error('The given parent is falsy!');
    }

    this.#parent = parent;
    return this;
  }

  /*
   * @param subject - the subject to subscribe to receive updates to the model
   * @return this
   */
  setSubject(subject) {
    if (this.#subject === -1) {
      throw new Error('This builder is closed!');
    }

    if (!subject) {
      throw new Error('The given subject is falsy!');
    }

    this.#subject = subject;
    return this;
  }

  /*
   * @param width - the width of the image in pixels
   * @requires width > 0
   * @return this
   */
  setWidth(width) {
    if (this.#width === -1) {
      throw new Error('This builder is closed!');
    }

    if (width <= 0) {
      throw new Error('The given width must be > 0!');
    }

    this.#width = width;
    return this;
  }

  /*
   * @param height - the height of the image in pixels
   * @requires height > 0
   * @return this
   */
  setHeight(height) {
    if (this.#height === -1) {
      throw new Error('This builder is closed!');
    }

    if (height <= 0) {
      throw new Error('The given height must be > 0!');
    }

    this.#height = height;
    return this;
  }

  /*
   * @param zoom - the minimum zoom factor
   * @requires zoom >= 1, defaults to 1
   * @return this
   */
  setMinZoom(zoom) {
    if (this.#min_zoom === -1) {
      throw new Error('This builder is closed!');
    }

    if (zoom < 1) {
      throw new Error('The given zoom must be >= 1!');
    }

    this.#min_zoom = zoom;
    return this;
  }

  /*
   * @param zoom - the maximum zoom factor
   * @requires zoom >= 1, defaults to 1
   * @return this
   */
  setMaxZoom(zoom) {
    if (this.#max_zoom === -1) {
      throw new Error('This builder is closed!');
    }

    if (zoom < 1) {
      throw new Error('The given zoom must be >= 1!');
    }

    this.#max_zoom = zoom;
    return this;
  }

  /*
   * @param colorizer - the colorizer object used to paint the map
   * @return this
   */
  setColorizer(colorizer) {
    if (this.#colorizer === -1) {
      throw new Error('This builder is closed!');
    }

    if (!colorizer) {
      throw new Error('The given colorizer is falsy!');
    }

    this.#colorizer = colorizer;
    return this;
  }

  /*
   * @return a new grid display
   * @effects further calls to this builder will throw an error
   */
  build() {
    if (this.#parent === -1) {
      throw new Error('This builder is closed!');
    }

    if (this.#parent === null) {
      throw new Error('The parent must be set!');
    }

    if (this.#subject === null) {
      throw new Error('The subject must be set!');
    }

    if (this.#width === 0) {
      throw new Error('The width must be set!');
    }

    if (this.#height === 0) {
      throw new Error('The height must be set!');
    }

    if (this.#colorizer === null) {
      throw new Error('The colorizer must be set!');
    }

    let map = new MapDisplayBuilder.#MapView(this.#parent, this.#subject, this.#colorizer, this.#width, this.#height, this.#min_zoom, this.#max_zoom);

    this.#parent = -1;
    this.#subject = -1;
    this.#colorizer = -1;
    this.#width = -1;
    this.#height = -1;
    this.#min_zoom = -1;
    this.#max_zoom = -1;

    return map;
  }
}