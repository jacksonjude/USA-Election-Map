# USA Election Map

An interactive USA presidential, senate, house, and governor election map. Created with HTML/CSS/JS, map svg outlines from [YAPms](https://www.yapms.com) & [US District Shapefiles](https://cdmaps.polisci.ucla.edu), and map data from [MIT Election Lab](https://electionlab.mit.edu/data) & [Dave Leip's Atlas](https://uselectionatlas.org).

## Features

* Interactive and detailed map sources
  * Past results for presidential (1788-2024, counties for 1892-2024), senatorial (1960-2024), house (1976-2024), and gubernatorial (1980-2024) elections, with victory margin and voteshare breakdowns for each state & district
  * Pie chart for electoral vote counts by party and margin, national popular vote totals for past elections
  * Flip states and counties between election cycles
  * Fully editable custom maps that can be downloaded and uploaded as JSON or CSV files
* Comparisons between different map sources
  * Can show shift between elections for states and counties
  * Can show margins of error between projections and election results
* Countdown timer to upcoming elections and important events
* Keyboard controls for advanced usage

## Development

Running a fork locally is simple since this code only uses the base HTML/CSS/JS stack. Just clone the repo and open index.html in your browser to run.

If you run into CORS issues, run a local http server. On Mac (via [Homebrew](https://brew.sh)) you can use:
```
brew install http-server
cd USA-Election-Map
http-server
```
Then, open the address provided in the Terminal window (by default, it seems to be http://localhost:8080).

## TODO List

See the [project issue board](https://github.com/users/jacksonjude/projects/2) for upcoming features.

If you have any questions, suggestions, or feature ideas, feel free to open an issue here on GitHub. Alternatively, you can email **jjcooley0@gmail.com**.
