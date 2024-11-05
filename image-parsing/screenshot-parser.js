const { Jimp } = require("jimp");
const ColorConvert = require("color-convert");
const CSVConverter = require('json-2-csv');
const fs = require('fs');
const path = require('path');

const yapmsRegionCoords = {
	"AK": [227,118],
	"AL": [618,145],
	"AR": [567,206],
	"AZ": [249,207],
	"CA": [183,245],
	"CO": [343,271],
	"CT": [833,236],
	"DC": [833,79],
	"DE": [833,153],
	"FL": [709,115],
	"GA": [674,146],
	"HI": [335,36],
	"IA": [516,316],
	"ID": [284,360],
	"IL": [575,288],
	"IN": [626,269],
	"KS": [494,253],
	"KY": [639,244],
	"LA": [562,115],
	"MA": [815,152],
	"MD": [833,110],
	"ME-AL": [778,467],
	"ME-D1": [778,451],
	"ME-D2": [778,434],
	"MI": [659,348],
	"MN": [528,364],
	"MO": [566,245],
	"MS": [597,186],
	"MT": [375,410],
	"NC": [724,228],
	"ND": [467,412],
	"NE-AL": [700,470],
	"NE-D1": [700,453],
	"NE-D2": [700,435],
	"NE-D3": [700,416],
	"NH": [833,312],
	"NJ": [833,196],
	"NM": [329,172],
	"NV": [226,269],
	"NY": [750,361],
	"OH": [658,301],
	"OK": [503,208],
	"OR": [215,399],
	"PA": [717,324],
	"RI": [815,119],
	"SC": [705,197],
	"SD": [420,363],
	"TN": [614,214],
	"TX": [492,130],
	"UT": [304,269],
	"VA": [726,260],
	"VT": [833,273],
	"WA": [229,449],
	"WI": [560,369],
	"WV": [694,265],
	"WY": [374,336]
};

const jacksonjudeRegionCoords = {
	"AK": [199,119],
	"AL": [815,240],
	"AR": [726,296],
	"AZ": [288,252],
	"CA": [149,344],
	"CO": [458,390],
	"CT": [1111,327],
	"DC": [1111,201],
	"DE": [1111,263],
	"FL": [954,156],
	"GA": [941,214],
	"HI": [335,42],
	"IA": [640,477],
	"ID": [289,542],
	"IL": [762,469],
	"IN": [821,464],
	"KS": [616,380],
	"KY": [839,360],
	"LA": [732,155],
	"MA": [1097,550],
	"MD": [1021,444],
	"ME-AL": [1031,703],
	"ME-D1": [952,680],
	"ME-D2": [952,646],
	"MI": [867,517],
	"MN": [673,631],
	"MO": [664,382],
	"MS": [749,197],
	"MT": [412,620],
	"NC": [970,334],
	"ND": [493,628],
	"NE-AL": [753,712],
	"NE-D1": [847,712],
	"NE-D2": [758,681],
	"NE-D3": [846,681],
	"NH": [1102,583],
	"NJ": [1067,469],
	"NM": [427,251],
	"NV": [199,398],
	"NY": [1004,534],
	"OH": [922,465],
	"OK": [552,302],
	"OR": [171,567],
	"PA": [1027,486],
	"RI": [1111,358],
	"SC": [989,282],
	"SD": [491,548],
	"TN": [792,311],
	"TX": [616,170],
	"UT": [316,411],
	"VA": [977,381],
	"VT": [1111,421],
	"WA": [199,683],
	"WI": [713,570],
	"WV": [926,390],
	"WY": [425,513]
};

const twoSeventyRegionCoords = {
	"AK": [,],
	"AL": [,],
	"AR": [,],
	"AZ": [,],
	"CA": [,],
	"CO": [,],
	"CT": [,],
	"DC": [,],
	"DE": [,],
	"FL": [,],
	"GA": [,],
	"HI": [,],
	"IA": [,],
	"ID": [,],
	"IL": [,],
	"IN": [,],
	"KS": [,],
	"KY": [,],
	"LA": [,],
	"MA": [,],
	"MD": [,],
	"ME-AL": [,],
	"ME-D1": [,],
	"ME-D2": [,],
	"MI": [,],
	"MN": [,],
	"MO": [,],
	"MS": [,],
	"MT": [,],
	"NC": [,],
	"ND": [,],
	"NE-AL": [,],
	"NE-D1": [,],
	"NE-D2": [,],
	"NE-D3": [,],
	"NH": [,],
	"NJ": [,],
	"NM": [,],
	"NV": [,],
	"NY": [,],
	"OH": [,],
	"OK": [,],
	"OR": [,],
	"PA": [,],
	"RI": [,],
	"SC": [,],
	"SD": [,],
	"TN": [,],
	"TX": [,],
	"UT": [,],
	"VA": [,],
	"VT": [,],
	"WA": [,],
	"WI": [,],
	"WV": [,],
	"WY": [,]
};

const regionCoordsMap = {
	'yapms': {coords: yapmsRegionCoords, size: {w: 960, h: 546}},
	'jacksonjude': {coords: jacksonjudeRegionCoords, size: {w: 1195, h: 756}},
	'270': {coords: twoSeventyRegionCoords}
}

const regionEVs = {"AL":9,"AK":3,"AZ":11,"AR":6,"CA":54,"CO":10,"CT":7,"DE":3,"DC":3,"FL":30,"GA":16,"HI":4,"ID":4,"IL":19,"IN":11,"IA":6,"KS":6,"KY":8,"LA":8,"ME":4,"ME-D1":1,"ME-D2":1,"ME-AL":2,"MD":10,"MA":11,"MI":15,"MN":10,"MS":6,"MO":10,"MT":4,"NE":5,"NE-D1":1,"NE-D2":1,"NE-D3":1,"NE-AL":2,"NV":6,"NH":4,"NJ":14,"NM":5,"NY":28,"NC":16,"ND":3,"OH":17,"OK":7,"OR":8,"PA":19,"RI":4,"SC":9,"SD":3,"TN":11,"TX":40,"UT":6,"VT":3,"VA":13,"WA":12,"WV":4,"WI":10,"WY":3}

const margins = {
	demSafe: '263F88',
	demLikely: '5F7BC7',
	demLean: '91AEF7',
	demTilt: '959AAE',
	repSafe: 'AE3031',
	repLikely: 'EE636A',
	repLean: 'EE9199',
	repTilt: 'C58C85'
};

const marginToValue = {
	demSafe: ['dem', 15],
	demLikely: ['dem', 5],
	demLean: ['dem', 1],
	demTilt: ['dem', 0.01],
	repSafe: ['rep', 15],
	repLikely: ['rep', 5],
	repLean: ['rep', 1],
	repTilt:['rep', 0.01]
};

(async () => {
	const imagePath = process.argv[2] ?? __dirname;
	const mapType = process.argv[3] ?? 'yapms'
	const verbose = process.argv[4] ?? false;
	
	let imageFiles = [imagePath];
	if (fs.lstatSync(imagePath).isDirectory()) {
		imageFiles = fs.readdirSync(imagePath)
			.map(file => path.join(imagePath, file))
			.filter(file => fs.lstatSync(file).isFile() && path.extname(file) == '.png');
	}
	
	for (let imageFile of imageFiles) {
		processImage(imageFile, mapType, verbose);
	}
})();

async function processImage(imageFilename, mapType, verbose) {
	const {coords, size} = regionCoordsMap[mapType]
	
	const image = await Jimp.read(imageFilename);
	image.resize(size);
	
	const regionResults = parseImageMargins(image, coords, size);
	verbose && console.log(regionResults);
	
	verbose && await writeDotsImage(image, imageFilename, coords, size);
	
	const evByRegion = Object.keys(regionResults)
		.reduce((results, region) => {
			const marginData = marginToValue[regionResults[region]];
			const party = marginData[0];
			const margin = marginData[1];
			
			results[region] = (party == 'dem' ? -1 : 1) * margin;
			return results;
		}, {});
	verbose && console.log(evByRegion);
	
	const evTotals = Object.keys(regionResults)
		.reduce((totals, region) => {
			const party = marginToValue[regionResults[region]][0];
			if (!totals[party]) totals[party] = 0;
			totals[party] += regionEVs[region];
			return totals;
		}, {});
	
	console.log("Processed image:", imageFilename, evTotals);
	
	const csvJSON = await CSVConverter.json2csvAsync([evByRegion]);
	fs.writeFileSync(`${imageFilename}-results.csv`, csvJSON);
}

function parseImageMargins(image, regionCoords, size) {
	let regionResults = {}
	
	for (let region in regionCoords) {
		if (regionCoords[region].length != 2) continue;
		
		const pixelColorHex = image.getPixelColor(regionCoords[region][0], size.h-regionCoords[region][1]).toString(16).toUpperCase();
		// console.log(pixelColorHex)
		const margin = Object.keys(margins).reduce((bestMargin, currMargin) =>
			!bestMargin || colorDistance(margins[bestMargin], pixelColorHex) > colorDistance(margins[currMargin], pixelColorHex) ? currMargin : bestMargin
		);
		
		regionResults[region] = margin;
	}
	
	return regionResults;
}

async function writeDotsImage(image, imageFilename, regionCoords, size) {
	image.greyscale();
	
	for (let region in regionCoords) {
		const centerX = regionCoords[region][0];
		const centerY = size.h-regionCoords[region][1];
		const diameter = 5;
		
		for (let x = centerX-Math.floor(diameter/2); x < centerX+Math.floor(diameter/2); x += 1) {
			for (let y = centerY-Math.floor(diameter/2); y < centerY+Math.floor(diameter/2); y += 1) {
				image.setPixelColor(0xff0000ff, x, y);
			}
		}
	}
	
	await image.write(`${imageFilename}-dots.png`);
}

function colorDistance(hex1, hex2) {
	const hslMaxValues = [360, null, null];
	
	const hsl1 = ColorConvert.hex.hsl(hex1);
	const hsl2 = ColorConvert.hex.hsl(hex2);
	// console.log(hex1, hsl1, hex2, hsl2, euclidianDistance(hsl1, hsl2, hslMaxValues));
	return euclidianDistance(hsl1, hsl2, hslMaxValues);
}

function euclidianDistance(arr1, arr2, maxValues) {
	let sum = 0;
	for (let i=0; i < Math.min(arr1.length, arr2.length); i++) {
		const val1 = arr1[i];
		const val2 = arr2[i];
		const minDiff = maxValues?.[i] != null ? Math.min.apply(null, [val2-val1, val2-(maxValues[i]-val1), (maxValues[i]-val2)-val1].map(Math.abs)) : val2-val1;
		// console.log(minDiff, val2-val1)
		
		sum += Math.pow(minDiff, 2)
	}
	return Math.sqrt(sum);
}