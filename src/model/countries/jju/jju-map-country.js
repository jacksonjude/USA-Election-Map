let JJUMapCountry = new MapCountry(
	"JJU",
	"Jacksonia",
	"JJU",
	"assets/jju-flag-10.png",
	() => {
		const mapTypes = {
			[JJUHouseMapType.getID()]: JJUHouseMapType,
			[JJUPresidentMapType.getID()]: JJUPresidentMapType,
			[JJUGovernorMapType.getID()]: JJUGovernorMapType
		}
		
		const defaultMapTypeID = JJUHouseMapType.getID()
		
		const politicalPartyData = {
			politicalParties: {
				[TossupParty.getID()]: TossupParty,
				[JJULabourParty.getID()]: JJULabourParty,
				[JJULiberalParty.getID()]: JJULiberalParty,
				[JJUAllianceParty.getID()]: JJUAllianceParty,
				[JJUProgressiveParty.getID()]: JJUProgressiveParty,
				[JJUWildroseParty.getID()]: JJUWildroseParty,
				[JJUReformParty.getID()]: JJUReformParty,
				[JJUProgressiveLabourParty.getID()]: JJUProgressiveLabourParty,
				[JJUPWPParty.getID()]: JJUPWPParty,
				[JJUFDPParty.getID()]: JJUFDPParty,
				[JJUSolidarityParty.getID()]: JJUSolidarityParty,
				[JJUNationalParty.getID()]: JJUNationalParty,
				[JJUUnitedLeftBloc.getID()]: JJUUnitedLeftBloc,
				[JJUSDPParty.getID()]: JJUSDPParty,
				[JJUGreenParty.getID()]: JJUGreenParty,
				[JJUUCPParty.getID()]: JJUUCPParty,
				[JJULabLibPartyBloc.getID()]: JJULabLibPartyBloc,
				[JJULibConPartyBloc.getID()]: JJULibConPartyBloc,
				[JJULabourConPartyBloc.getID()]: JJULabourConPartyBloc,
				[JJUWatermelonPartyBloc.getID()]: JJUWatermelonPartyBloc,
				[JJUCitrusPartyBloc.getID()]: JJUCitrusPartyBloc,
				[JJUTrafficLightPartyBloc.getID()]: JJUTrafficLightPartyBloc,
				[JJUPeacockPartyBloc.getID()]: JJUPeacockPartyBloc,
				[JJUBurgerPartyBloc.getID()]: JJUBurgerPartyBloc,
				[JJUUnitedLeftBloc.getID()]: JJUUnitedLeftBloc,
				[JJUBOBBloc.getID()]: JJUBOBBloc,
				[JJUSunMoonBloc.getID()]: JJUSunMoonBloc,
				[JJUSunsetBloc.getID()]: JJUSunsetBloc,
				[JJUUnityPartyBloc.getID()]: JJUUnityPartyBloc,
				[IndependentGenericParty.getID()]: IndependentGenericParty
			},
			defaultDropdownPartyIDs: [
				JJUAllianceParty.getID(),
				JJUFDPParty.getID(),
				JJUGreenParty.getID(),
				JJUSDPParty.getID(),
				JJUUCPParty.getID(),
				IndependentGenericParty.getID()
			],
			mainPoliticalPartyIDs: [
				TossupParty.getID(),
				JJULabourParty.getID(),
				JJULiberalParty.getID(),
				JJUAllianceParty.getID(),
				JJUProgressiveParty.getID(),
				JJUWildroseParty.getID(),
				JJUFDPParty.getID(),
				JJUReformParty.getID(),
				JJUProgressiveLabourParty.getID(),
				JJUGreenParty.getID(),
				JJUSDPParty.getID(),
				JJUUCPParty.getID(),
				JJUNationalParty.getID(),
				JJUPWPParty.getID(),
				JJUSolidarityParty.getID(),
				JJULabLibPartyBloc.getID(),
				JJULibConPartyBloc.getID(),
				JJULabourConPartyBloc.getID(),
				JJUWatermelonPartyBloc.getID(),
				JJUCitrusPartyBloc.getID(),
				JJUTrafficLightPartyBloc.getID(),
				JJUPeacockPartyBloc.getID(),
				JJUBurgerPartyBloc.getID(),
				JJUUnitedLeftBloc.getID(),
				JJUBOBBloc.getID(),
				JJUSunMoonBloc.getID(),
				JJUSunsetBloc.getID(),
				JJUUnityPartyBloc.getID(),
				IndependentGenericParty.getID()
			],
			majorThirdPartyCandidateIDs: []
		}
		
		const countdownTimes = {
			"January 2026 General Election": {time: 1769385600000, url: null},
			"February 2026 Midterm Elections": {time: 1772326800000, url: null},
			"April 2026 General Election": {time: 1776474000000, url: null},
			"May 2026 Midterm Elections": {time: 1780182000000, url: null}
		}
		
		return {
			mapTypes,
			defaultMapTypeID,
			politicalPartyData,
			countdownTimes
		}
	}
)

const JJULabourParty = new PoliticalParty(
	"JJULAB",
	["Labour"],
	"Lab",
	"Labour",
	PoliticalPartyColors.red
)

const JJULiberalParty = new PoliticalParty(
	"JJULIB",
	["Liberal"],
	"Lib",
	"Liberal",
	PoliticalPartyColors.yellow
)

const JJUAllianceParty = new PoliticalParty(
	"JJUALL",
	["Alliance", "Conservative"],
	"All",
	"Alliance",
	PoliticalPartyColors.blue
)

const JJUProgressiveParty = new PoliticalParty(
	"JJUPRO",
	["Progressive"],
	"Pro",
	"Progressive",
	PoliticalPartyColors.green
)

const JJUWildroseParty = new PoliticalParty(
	"JJUWIL",
	["Wildrose"],
	"Wil",
	"Wildrose",
	PoliticalPartyColors.magenta
)

const JJUReformParty = new PoliticalParty(
	"JJUREF",
	["Renewal"],
	"Ren",
	"Renewal",
	PoliticalPartyColors.scarlet
)

const JJUPWPParty = new PoliticalParty(
	"JJUPWP",
	["PWP"],
	"PWP",
	"PWP",
	PoliticalPartyColors.purple
)

const JJUUCPParty = new PoliticalParty(
	"JJUUCP",
	["UCP"],
	"UCP",
	"UCP",
	PoliticalPartyColors.purple,
	[JJUPWPParty]
)

const JJUNationalParty = new PoliticalParty(
	"JJUNAT",
	["National", "JNP", "Coalition", "National Coalition", "Jacksonian National Party"],
	"Nat",
	"National",
	PoliticalPartyColors.brown
)

const JJUSolidarityParty = new PoliticalParty(
	"JJUSOL",
	["Solidarity"],
	"Sol",
	"Solidarity",
	PoliticalPartyColors.orange
)

const JJUFDPParty = new PoliticalParty(
	"JJUFDP",
	["FDP"],
	"FDP",
	"FDP",
	PoliticalPartyColors.orange,
	[JJUSolidarityParty, JJUNationalParty]
)

const JJUProgressiveLabourParty = new PoliticalParty(
	"JJUPLU",
	["ProgLab"],
	"PLU",
	"ProgLab",
	{current: "#54081F", safe: "#A81039", likely: "#FF2667", lean: "#D35084", tilt: "#FFB2C9"},
	[JJULabourParty, JJUProgressiveParty]
)

const JJUGreenParty = new PoliticalParty(
	"JJUGRE",
	["Greens", "Green"],
	"GRE",
	"Greens",
	PoliticalPartyColors.green
)

const JJUSDPParty = new PoliticalParty(
	"JJUSDP",
	["SDP"],
	"SDP",
	"SDP",
	PoliticalPartyColors.red,
	[JJUProgressiveLabourParty]
)

const JJULabLibPartyBloc = new PoliticalParty(
	"JJULAL",
	["LabLib"],
	"LAL",
	"LabLib",
	PoliticalPartyColors.scarlet
)

const JJULibConPartyBloc = new PoliticalParty(
	"JJULIC",
	["LibCon"],
	"LIC",
	"LibCon",
	PoliticalPartyColors.cyan
)

const JJULabourConPartyBloc = new PoliticalParty(
	"JJULAC",
	["LabourCon"],
	"LAC",
	"LabourCon",
	PoliticalPartyColors.purple
)

const JJUWatermelonPartyBloc = new PoliticalParty(
	"JJUWAT",
	["Watermelon"],
	"Wat",
	"Watermelon",
	PoliticalPartyColors.magenta
)

const JJUCitrusPartyBloc = new PoliticalParty(
	"JJUCIT",
	["Citrus"],
	"Cit",
	"Citrus",
	PoliticalPartyColors.orange
)

const JJUTrafficLightPartyBloc = new PoliticalParty(
	"JJUTRA",
	["Traffic Light", "Traffic"],
	"Tra",
	"Traffic",
	PoliticalPartyColors.red
)

const JJUUnityPartyBloc = new PoliticalParty(
	"JJUUTY",
	["Unity"],
	"UTY",
	"Unity",
	PoliticalPartyColors.lime
)

const JJUPeacockPartyBloc = new PoliticalParty(
	"JJUPEA",
	["Peacock"],
	"PEA",
	"Peacock",
	PoliticalPartyColors.cyan
)

const JJUBurgerPartyBloc = new PoliticalParty(
	"JJUBUR",
	["Burger"],
	"Bur",
	"Burger",
	PoliticalPartyColors.orange
)

const JJUUnitedLeftBloc = new PoliticalParty(
	"JJUUNL",
	["United Left"],
	"UNL",
	"United Left",
	PoliticalPartyColors.magenta
)

const JJUBOBBloc = new PoliticalParty(
	"JJUBOB",
	["BOB"],
	"BOB",
	"BOB",
	PoliticalPartyColors.brown
)

const JJUSunMoonBloc = new PoliticalParty(
	"JJUSunMoon",
	["Sun & Moon", "SunMoon"],
	"Sun & Moon",
	"Sun & Moon",
	PoliticalPartyColors.brown
)

const JJUSunsetBloc = new PoliticalParty(
	"JJUSunset",
	["Sunset"],
	"Sunset",
	"Sunset",
	PoliticalPartyColors.orange
)