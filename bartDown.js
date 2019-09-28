// Parse the URL search paramters into an object
var urlParams = window.location.search
  .substring(1)
  .split('&')
  .reduce((params, urlParam) => {
    let param = urlParam.split('=');
    params[param[0]] = param[1];
    return params;
  }, {});

// number of trains to display in either direction
const limit = parseInt(urlParams.limit) || 3;
// station of origin abbreviation - https://api.bart.gov/docs/overview/abbrev.aspx
const station = urlParams.station || '19th';
// departure times below the cutoff will not be displayed
const minute_cutoff = parseInt(urlParams.minute_cutoff) || 3;

// TODO:
// Have font size be related to number of stations
// displayed

var fontWidth = 100 / (limit * 1.4);

$('body').css('font-size', `${fontWidth}vw`);

// TODO:
// Allow user to pick station from a dropdown form

const BASE_URL = 'http://api.bart.gov/api/etd.aspx';

async function fetchTimesAsync() {
  // await response of fetch call
  let response = await fetch(`${BASE_URL}?key=${BART_API_KEY}&cmd=etd&orig=${station}&json=y`);
  // only proceed once promise is resolved
  let data = await response.json();
  // only proceed once second promise is resolved
  return data;
}

fetchTimesAsync()
  .then(bartDown)
  .catch(logError);

setInterval(() => {
  fetchTimesAsync()
    .then(bartDown)
    .catch(logError);
}, 10000);

function bartDown(data) {
  console.log('updating...');

  $('#disconnected').hide();
  $('#lines').show();

  let directionCount = {
    north: 0,
    south: 0,
  };

  // Get an array of estimated departures from the response data
  var estimates = data.root.station[0].etd.reduce((acc, etd) => {
    return acc.concat(etd.estimate);
  }, []);

  // TODO:
  // filter out any destinations we aren't interested in.
  // Destination is a parent of estimates, so needs to be done
  // above

  // Filter estimates that don't match criteria
  estimates = estimates.filter((estimate) => estimate.minutes >= minute_cutoff);

  // Transform 'Leaving' to 00 and ensure all times are double digits
  estimates.forEach((estimate) => {
    estimate.minutes = estimate.minutes === 'Leaving' ? '00' : estimate.minutes;
    estimate.minutes = estimate.minutes.length < 2 ? '0' + estimate.minutes : estimate.minutes;
  });

  // Sort departures by times
  estimates.sort((a, b) => a.minutes - b.minutes);

  // Remove existing estimates from DOM
  $('.line').empty();

  estimates.forEach((estimate) => {
    var direction = estimate.direction.toLowerCase();
    if (directionCount[direction] < limit) {
      $(`#${direction}`).append(
        `<div class="estimate ${estimate.color.toLowerCase()}">${estimate.minutes}</div>`,
      );
      directionCount[direction]++;
    }
  });
}

// Display an icon on error
function logError(error) {
  console.log(error);
  $('#lines').hide();
  $('#disconnected img').css('width', `${fontWidth * 2}vw`);
  $('#disconnected').show();
}
