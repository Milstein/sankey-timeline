/**
 * Build object containing summary information of energy flows
 * over time.
 * `flows` are the number of flows moving to and from each box.
 * `totals` are the summed size of the flows to and from each box.
 * `maxes` are the maximum totals for each box over time.
 * `box_tops` are the y-coord placement of the boxes on the right
 *     side of the graph.
 * @returns {{flows: Array, totals: Array, maxes: {}, box_tops: {}}}
 */
const get_summary = function get_summary() {

  let summary = {totals: [], flows: [], maxes: {}, box_tops: {}}
  let _tf = get_totals();
  summary.totals = _tf[0];
  summary.maxes = _tf[1];
  summary.maxes = get_maxes(summary);
  summary.box_tops = get_box_tops(summary);
  return summary;

};

/**
 * Get sum totals of the left and right endpoints of every flow
 * in every year. Get number of flows (greater than 0) beginning
 * or ending in every box.
 * @returns {Array[]}
 */
const get_totals = function get_totals() {

  let totals = [];

  let flows = [];

  // Loop through years
  for (let i = 0; i < DATA.length; ++i) {
    let total = { year: DATA[i].year,
      elec: 0, res: 0, ag: 0, indus: 0, trans: 0,
      solar: 0, nuclear: 0, hydro: 0, wind: 0, geo: 0,
      gas: 0, coal: 0, bio: 0, petro: 0, fuel_height: 0 };
    let flow = { year: DATA[i].year,
      elec: 0, res: 0, ag: 0, indus: 0, trans: 0 };
    // Loop through fuels
    // Skip electricity
    for (let j = 1; j < FUELS.length; ++j) {
      let fuel_name = FUELS[j].fuel;
      let fuel_obj = DATA[i][fuel_name];
      // Loop through boxes
      for (let k = 0; k < BOX_NAMES.length; ++k) {
          // Increment the amount of flows to the box
          if (fuel_obj[BOX_NAMES[k]] > 0) { flow[BOX_NAMES[k]]++; }
          // Add to the box's total
          total[BOX_NAMES[k]] += fuel_obj[BOX_NAMES[k]];
          total[fuel_name] += fuel_obj[BOX_NAMES[k]];
          // FIXME: This is a crummy way to add electricity into
          //  the right-hand boxes.
          if (j === 1 && BOX_NAMES[k] !== 'elec') {
            total[BOX_NAMES[k]] += DATA[i].elec[BOX_NAMES[k]];
          }
      }
      total.fuel_height += total[fuel_name] * SCALE + LEFT_GAP;
    }
    totals.push(total);
    flows.push(flow);
  }
  return [totals, flows];
};

/**
 * Get largest size of each box over every year in the dataset.
 * This is used to determine the maximum space each box will
 * occupy over the length of the animation.
 * @param summary
 */
const get_maxes = function get_maxes(summary) {
  let maxes = {};

  for (let i = 0; i < BOXES.length; ++i) {
    maxes[BOXES[i].box] = Math.max.apply(Math, summary.totals.map(
      function (o) {
        return o[BOXES[i].box];
      }));
  }
  return maxes;
};

/**
 * Get the y-coord position of the tops of each box on the right
 * side of the graph. This is based on the max values returned by
 * `get_totals()`
 * @param summary
 */
const get_box_tops = function get_box_tops(summary) {

  let box_tops = {};
  box_tops.res = ELEC_BOX[1] + 30;
  box_tops.ag = box_tops.res + summary.maxes.res * SCALE + RIGHT_GAP;
  box_tops.indus = box_tops.ag + summary.maxes.ag * SCALE + RIGHT_GAP;
  box_tops.trans = box_tops.indus + summary.maxes.indus * SCALE + RIGHT_GAP;

  return box_tops;
};
