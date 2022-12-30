/*
 * Represents an SVG image layer which plots a set of points
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

  /*
   * @param canvas - the SVG DOM element to attach the grid to
   * @param img_width - the width of the canvas in pixels
   * @param img_height - the height of the canvas in pixels
   * @param style_class - the styling class to tag the SVG elements with
   */
  constructor(canvas, img_width, img_height, style_class) {
    // TODO: Should untie this from the size of the canvas (ie, could be smaller). Provide ability to transform
    this.#width = img_width;
    this.#height = img_height;
    this.#style = style_class;
    this.#svg_group = canvas.append('g');
  }

  /*
   * @param points - a Points collection of 2D points to plot
   * @param classGenerator - a function which a point element and a style tag as arguments
   * @effects - updates the plotted points
   * @requires the points to be normalized 2D cartesian coordinates tagged with an id 
   */
  updatePopulation(points, classGenerator) {
    // TODO: Should the generator be passed in at a different location
    let data = points.getPointsAsArray();

    this.#svg_group.selectAll('circle')
      .data(data)
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
      .attr('cx', (d) => {
        return d.getX() * this.#width;
      })
      .attr('cy', (d) => {
        return d.getY() * this.#height;
      })
      .attr('class', (d) => {
        return classGenerator(d, this.#style);
      });
  }
}