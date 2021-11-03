# USA Election Map

An interactive USA presidential, senatorial, house, and governor election map. Created with HTML/CSS/JS (+[JQuery](https://jquery.com)), [chart.js](https://www.chartjs.org), and map svg outlines from [YAPms](https://www.yapms.com).

## Features

* Interactive and detailed map sources
  * Displays projection data for the 2020 presidential election from [FiveThirtyEight](https://projects.fivethirtyeight.com/polls/president-general/), [JHK](https://projects.jhkforecasts.com/presidential-forecast/), and [The Cook Political Report](https://cookpolitical.com)
  * Displays projection data for the 2022 senate elections from [Let's Talk Elections](https://www.youtube.com/channel/UCZ0H9_lidl67AqiC9-RxfvA), [Political Analysis](https://www.youtube.com/channel/UC4bC-T3iypwMjLd-teG-sgQ), and [The Cook Political Report](https://cookpolitical.com)
  * Displays projection data for the 2022 governor elections from [Let's Talk Elections](https://www.youtube.com/channel/UCZ0H9_lidl67AqiC9-RxfvA) and [The Cook Political Report](https://cookpolitical.com)
  * Displays presidential (1856-2020), senatorial (1960-2020), house (1976-2020), and gubernatorial (1980-2020) election results, showing both victory margin and voteshare percentages for each state & district
  * Pie chart to show electoral vote counts by party and by margin, as well as national popular vote totals for past elections
  * View states that flipped between election cycles on both the map and pie chart
  * Fully editable custom maps that can be downloaded and uploaded as JSON or CSV files
* Comparisons between different map sources
  * Can be used to show shift between elections
  * Can be used to show margins of error between projections and election results
* Countdown timer to upcoming elections and important events
* Keyboard controls for advanced usage

## Development

Running a fork locally is simple since this code only uses the base HTML/CSS/JS stack (+ JQuery & chart.js, which are included locally). Just clone the repo and open index.html to run.

Since the site uses separate svg files for the map, Chrome and Safari might prevent them from loading over the file protocol due to CORS restrictions (this is a well known issue: see [more info](https://stackoverflow.com/a/8456586/) and [solution](https://stackoverflow.com/a/13262673/)).
- Fixing this CORS issue on Safari is fairly simple: go to Develop > Disable Cross-Origin Restrictions.
- Chrome is a little more complicated, as it needs to be opened via command line to disable CORS:
  - Mac:
    ```
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --allow-file-access-from-files
    ```
  - Windows:
    ```
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files
    ```
- Alternatively, Firefox can be used without issue since it does not enforce CORS restrictions over the file protocol in the same way.


Another way to address the CORS issue is to run a local http server. On Mac (via [Homebrew](https://brew.sh)):
```
brew install http-server
cd <local repo path>
http-server
```
Then open the address provided in the Terminal window (by default, it seems to be http://localhost:8080).


## TODO List
- [x] Past senate election results & 2022 senate projections
  - [x] More past senate election results (1960-1974)
- [x] More past election results
  - [x] 1960-1972 presidential elections
  - [x] 1912-1956 presidential elections
  - [x] 1856-1908 presidential elections
- [x] Past governor elections & 2022 governor projections (1980-2020)
- [ ] Full third-party support in past results and custom maps
  - [x] Display in voteshare
  - [x] Display on pie chart
  - [x] Display in past result maps
  - [x] Add & Edit parties in custom map
  - [ ] Shift & compare modes for multiple parties
- [ ] Custom map improvements
  - [x] Directly editable margins
  - [x] Direct electoral vote editing
  - [x] Set map-wide electoral votes from decade
  - [ ] Add multiple dates, edit dates, create & remove dates
  - [ ] Split electoral votes between multiple candidates
- [x] National popular vote totals for past elections
- [x] Past house election results
- [ ] Presidential election results by county
- [ ] Profiles and custom map sharing
- [ ] Popularity rating source (by state)
- [ ] Custom countdown timer events
- [ ] 2024 presidential primaries
  - [ ] Past presidential primaries?

If you have any questions, suggestions, or feature ideas, feel free to open an issue here on GitHub. Alternatively, you can email **jjcooley0@gmail.com**.
