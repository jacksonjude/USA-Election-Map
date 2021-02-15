# USA Election Map

An interactive electoral vote map for US presidential elections. Created with HTML/CSS/JS (+[JQuery](https://jquery.com)), [chart.js](https://www.chartjs.org), and map svg outlines from [YAPMS](https://www.yapms.com/app/?t=USA_2020_presidential).

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

Running a fork locally is simple since this code only uses the base HTML/CSS/JS stack (+JQuery, which is included locally). Just clone the repo and open index.html to run.

Since the site loads svg files for the map, Chrome (and Safari) might not load them due to CORS restrictions.
- Fixing this CORS issue on Safari is somewhat simple: go to Develop > Disable Cross-Origin Restrictions.
- Chrome is a little more complicated: Run `"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir=~/chromeTemp` on Windows or `open -a <chrome executable path> --args --disable-web-security --user-data-dir` on Mac in the command prompt / Terminal. 
- Alternatively, you can try running it on Firefox, which does not enforce these CORS restrictions.

## TODO List
- [ ] Past senate election results & 2022 senate projections
- [ ] National popular vote totals for past elections
- [ ] Full third-party support in past results and custom maps
- [ ] More past presidential election results
- [ ] Presidential election results by county
