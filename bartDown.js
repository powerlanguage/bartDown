const urlParams = window.location.search
  .substring(1)
  .split('&')
  .reduce((params, urlParam) => {
    let param = urlParam.split('=');
    params[param[0]] = param[1];
    return params;
  }, {});

// number of trains to display in either direction
const MAX_TRAINS_PER_DIRECTION = parseInt(urlParams.limit) || 3;
// station of origin abbreviation - https://api.bart.gov/docs/overview/abbrev.aspx
const STATION_CODE = urlParams.station || '19th';
// departure times below the cutoff will not be displayed
const MINUTE_CUTOFF = parseInt(urlParams.minute_cutoff) || 3;
// How often to poll for updates
const UPDATE_MS = 10000;
// See https://api.bart.gov/docs/etd/etd.aspx
const BASE_URL = 'http://api.bart.gov/api/etd.aspx';

// Scale content
const fontWidth = 100 / (MAX_TRAINS_PER_DIRECTION * 1.4);
document.body.style.fontSize = `${fontWidth}vw`;

// TODO:
// Allow user to pick station from a dropdown form

async function bartDown() {
  const response = await fetch(
    `${BASE_URL}?key=${BART_API_KEY}&cmd=etd&orig=${STATION_CODE}&json=y`,
  );

  const data = await response.json();

  // Get an array of estimated departures from the response data
  const estimatesForStation = data.root.station[0].etd.reduce((acc, etd) => {
    return acc.concat(etd.estimate);
  }, []);

  const estimates = estimatesForStation
    // Filter estimates that don't match criteria
    .filter((estimate) => estimate.minutes >= MINUTE_CUTOFF)
    // Transform 'Leaving' to 00 and ensure all times are double digits
    // Note that we're mutating here :P
    .map((estimate) => {
      estimate.minutes = estimate.minutes === 'Leaving' ? '00' : estimate.minutes;
      estimate.minutes = estimate.minutes.length < 2 ? '0' + estimate.minutes : estimate.minutes;
      return estimate;
    })
    // Sort departures from soonest to latest
    .sort((a, b) => a.minutes - b.minutes);

  // Hide the error state
  document.getElementById('disconnected').style.display = 'none';

  // Remove existing estimates from DOM
  Array.from(document.getElementsByClassName('estimate')).forEach((line) => {
    line.remove();
  });

  let directionCount = {
    north: 0,
    south: 0,
  };

  // Add the new estimates to the DOM
  estimates.forEach((estimate) => {
    const direction = estimate.direction.toLowerCase();
    if (directionCount[direction] < MAX_TRAINS_PER_DIRECTION) {
      document
        .getElementById(direction)
        .insertAdjacentHTML(
          'beforeEnd',
          `<div class="estimate ${estimate.color.toLowerCase()}">${estimate.minutes}</div>`,
        );

      directionCount[direction]++;
    }
  });
}

// Display an icon on error
function displayErrorState(error) {
  console.log(error);
  document.getElementById('disconnected').style.display = 'flex';
}

// Kick it off!
bartDown().catch(displayErrorState);

// Set up recurring call
setInterval(() => {
  bartDown().catch(displayErrorState);
}, UPDATE_MS);
