// Number of departures we want to display for each direction
const limit = 3;
const station = "19th"

$.get(`http://api.bart.gov/api/etd.aspx?key=${API_KEY}&cmd=etd&orig=${station}&json=y`, bartDown);

setInterval(() => {
  $.get(`http://api.bart.gov/api/etd.aspx?key=${API_KEY}&cmd=etd&orig=${station}&json=y`, bartDown);
}, 30000);

function bartDown(data) {
  console.log("updating...")

  let directionCount = {
    'north': 0,
    'south': 0
  };

  // Get an array of estimated departures from the response data
  var estimates = data.root.station[0].etd.reduce((acc, etd) => {
    return acc.concat(etd.estimate);
  }, []);

  // Transform 'Leaving' to 00 and ensure all times are double digits
  estimates.forEach(estimate => {
    estimate.minutes = estimate.minutes === "Leaving" ? "00" : estimate.minutes;
    estimate.minutes = estimate.minutes.length < 2 ? "0" + estimate.minutes : estimate.minutes;
  });

  // Sort departures by times
  estimates.sort((a, b) => a.minutes - b.minutes);

  // Remove existing estimates from DOM
  $('.line').empty();

  estimates.forEach(estimate => {
    var direction = estimate.direction.toLowerCase();
    if(directionCount[direction] < limit) {
      $(`#${direction}`).append(`<div class="estimate ${estimate.color.toLowerCase()}">${estimate.minutes}</div>`);
      directionCount[direction]++;
    }
  });
}
