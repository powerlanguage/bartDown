# bartDown

![bartDown](/screenshots/bartDown.png)

_bartDown_ displays the estimated departure times for a [BART station](http://www.bart.gov/).  It aims to make functional information aesthetically pleasing so it can be displayed in the home.  Colors denote the Bart line and North and South-bound depatures are on the top and bottom row respectively.

See it in action: http://powerlanguage.co.uk/bartDown/

## Configuration:

_bartDown_ can be customized using the following url parameters:

* `?station=woak` - [station of origin abbreviation](https://api.bart.gov/docs/overview/abbrev.aspx), default 19th St Oakland
* `?limit=5` - number of trains to display in either direction, default 3
* `?minute_cutoff=2` - departure times below the cutoff will not be displayed, default 3
* You can chain multiple parameters together using `&` E.g. http://powerlanguage.co.uk/bartDown/?station=hayw&limit=5&minute_cutoff=5

## Misc:

* You can [get a BART API key here](https://api.bart.gov/docs/overview/index.aspx).
* This project uses: [offline by Stéphanie Rusch from the Noun Project](https://thenounproject.com/term/offline/90580)
