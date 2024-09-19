# USA Election Map

An interactive USA presidential, senate, house, and governor election map. Created with HTML/CSS/JS, map svg outlines from [YAPms](https://www.yapms.com) & [US District Shapefiles](https://cdmaps.polisci.ucla.edu), and map data from [MIT Election Lab](https://electionlab.mit.edu/data) & [Dave Leip's Atlas](https://uselectionatlas.org).

## Features

* Interactive and detailed map sources
  * Projection data for the 2024 presidential election from [FiveThirtyEight](https://projects.fivethirtyeight.com/2024-election-forecast/) and [Polymarket](https://polymarket.com/elections)
  * Projection data for the 2024 senate elections from [Polymarket](https://polymarket.com/elections)
  <!-- * Displays projection data for the 2024 governor elections from [FiveThirtyEight](https://projects.fivethirtyeight.com/2024-election-forecast/governor/) -->
  <!-- * Displays projection data for the 2024 house elections from [FiveThirtyEight](https://projects.fivethirtyeight.com/2024-election-forecast/house/) -->
  * Past results for presidential (1788-2020, counties for 1992-2020), senatorial (1960-2020), house (1976-2020), and gubernatorial (1980-2020) elections, with victory margin and voteshare breakdowns for each state & district
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

Since the site uses svg files in the local `svg-sources` folder, your browser might prevent them from loading over the `file://` protocol due to CORS restrictions (this is a well known issue: see [more info](https://stackoverflow.com/a/8456586/) and [solution](https://stackoverflow.com/a/13262673/)).
- For Safari: go to Develop > Developer Settings > Disable local file restrictions.
- For Chrome: open **via command line** to disable CORS:
  - Mac:
    ```
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --allow-file-access-from-files
    ```
  - Windows:
    ```
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files
    ```
- For Firefox: go to `about:config` and set the `security.fileuri.strict_origin_policy` flag to `false`


Another way to address the CORS issue is to run a local http server. On Mac (via [Homebrew](https://brew.sh)):
```
brew install http-server
cd <local repo path>
http-server
```
Then open the address provided in the Terminal window (by default, it seems to be http://localhost:8080).


## TODO List

See the [project issue board](https://github.com/users/jacksonjude/projects/2) for upcoming features.

If you have any questions, suggestions, or feature ideas, feel free to open an issue here on GitHub. Alternatively, you can email **jjcooley0@gmail.com**.
