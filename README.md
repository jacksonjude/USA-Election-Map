# USA Election Map

An interactive electoral vote map for US presidential elections. Created with HTML/CSS/JS (+[JQuery](https://jquery.com)), [chart.js](https://www.chartjs.org), and map svg outlines from [YAPMS](https://www.yapms.com).

## Features

* Interactive and detailed map sources
  * Displays projection data for the 2020 election from [FiveThirtyEight](https://projects.fivethirtyeight.com/polls/president-general/), [JHK](https://projects.jhkforecasts.com/presidential-forecast/), and [The Cook Political Report](https://cookpolitical.com)
  * Displays presidential election results from 1976-2020, showing both victory margin and voteshare percentages for each state / district
  * Pie chart to show electoral vote counts by party and by margin
  * Custom maps that can be downloaded and uploaded
* Comparisons between different map sources
  * Can show shift between elections
  * Can show margins of error between projections and election results
* Countdown timer to upcoming elections and important events
* Keyboard controls for advanced usage

## Development

Running a fork locally is simple since this code only uses the base HTML/CSS/JS stack (+ JQuery & chart.js, which are included locally). Just clone the repo and open index.html to run.

Since the site uses separate svg files for the map, Chrome and Safari might prevent them from loading over the file protocol due to CORS restrictions (see [more info](https://stackoverflow.com/a/8456586/) and [solution](https://stackoverflow.com/a/13262673/)).
- Fixing this CORS issue on Safari is somewhat simple: go to Develop > Disable Cross-Origin Restrictions.
- Chrome is a little more complicated: 
  - Mac: 
    ```
    open -a "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --allow-file-access-from-files
    ```
  - Windows: 
    ```
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files
    ```
- Alternatively, Firefox can be used without issue since it does not enforce CORS restrictions over the file protocol in the same way.


Another way to address the CORS issue is to run a local http server. On Mac (via [Homebrew](https://brew.sh)):
```
brew install http-server
http-server
```
Then open the address provided in the Terminal window (by default, it seems to be http://localhost:8080).


## TODO List
- [x] Past senate election results & 2022 senate projections
- [ ] National popular vote totals for past elections
- [ ] Full third-party support in past results and custom maps
- [ ] More past presidential election results
- [ ] Presidential election results by county

If you have any questions / suggestions / feature ideas, feel free to open an issue, and it will be marked accordingly. Alternatively, you can email **jjcooley0@gmail.com**.
