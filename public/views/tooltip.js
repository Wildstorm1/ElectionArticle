/*
 * Represents a GUI for a tooltip which shows the results of an election
 */
class ElectionInfoTooltip {

  // The top level HTML DOM element containing the tooltip elements
  #root;

  // The top level header on the tooltip
  #header_label;

  /*
   * @param parent - the HTML DOM element to attach the tooltip to
   * @param style_class - the styling class to tag the HTML elements with
   * @requires - the parent DOM element should be a div wrapping everything the tooltip
   * can hover over
   */
  constructor(parent, style_class) {
    this.#root = parent.append('div')
      .attr('class', `${style_class}_wrapper`)
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('display', 'none');

    this.#header_label = this.#root.append('table')
      .append('tr')
      .append('thead')
      .append('th')
      .text('TEST');
  }

  /*
   * @effects - makes the tooltip to be visible on the webpage
   */
  showTooltip() {
    this.#root.style('display', 'block');
  }

  /*
   * @effects - hides the tooltip from being visible on the webpage
   */
  hideTooltip() {
    this.#root.style('display', 'none');
  }

  /*
   * @param pageX - the x position on the page to move the tooltip to in pixels
   * @param pageY - the y position on the page to move the tooltip to in pixels
   */
  updatePosition(pageX, pageY) {
    this.#root.style('left', `${ pageX }px`)
      .style('top', `${ pageY }px`);
  }

  /*
   * 
   */
  updateElectionResults() {}
}