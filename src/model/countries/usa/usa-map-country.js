let USAMapCountry = new MapCountry(
	"USA",
	"United States",
	"USA",
	"assets/usa-flag.png",
	() => {
		const mapTypes = {
			[USAPresidentMapType.getID()]: USAPresidentMapType,
			[USASenateMapType.getID()]: USASenateMapType,
			[USAGovernorMapType.getID()]: USAGovernorMapType,
			[USAHouseMapType.getID()]: USAHouseMapType
		}
		
		const defaultMapTypeID = USASenateMapType.getID()
		
		const politicalPartyData = {
			politicalParties: {
				[TossupParty.getID()]: TossupParty,
				[DemocraticParty.getID()]: DemocraticParty,
				[RepublicanParty.getID()]: RepublicanParty,
				[WhigParty.getID()]: WhigParty,
				[NationalRepublicanParty.getID()]: NationalRepublicanParty,
				[DemocraticRepublicanParty.getID()]: DemocraticRepublicanParty,
				[FederalistParty.getID()]: FederalistParty,
				[LibertarianParty.getID()]: LibertarianParty,
				[GreenParty.getID()]: GreenParty,
				[ReformParty.getID()]: ReformParty,
				[ConservativeParty.getID()]: ConservativeParty,
				[FreeSoilParty.getID()]: FreeSoilParty,
				[IndependentRNParty.getID()]: IndependentRNParty,
				[Independent2024RFKParty.getID()]: Independent2024RFKParty,
				[Independent2016EMParty.getID()]: Independent2016EMParty,
				[Independent2016CPParty.getID()]: Independent2016CPParty,
				[Independent2016BSParty.getID()]: Independent2016BSParty,
				[Independent2016RPParty.getID()]: Independent2016RPParty,
				[Independent2016JKParty.getID()]: Independent2016JKParty,
				[Independent2016SEParty.getID()]: Independent2016SEParty,
				[Independent2004JEParty.getID()]: Independent2004JEParty,
				[Independent1988LBParty.getID()]: Independent1988LBParty,
				[Independent1980JAParty.getID()]: Independent1980JAParty,
				[Independent1976EMParty.getID()]: Independent1976EMParty,
				[Independent1976RRParty.getID()]: Independent1976RRParty,
				[Independent1968GWParty.getID()]: Independent1968GWParty,
				[Independent1960HBParty.getID()]: Independent1960HBParty,
				[Independent1956WJParty.getID()]: Independent1956WJParty,
				[Independent1948SMParty.getID()]: Independent1948SMParty,
				[Independent1948HWParty.getID()]: Independent1948HWParty,
				[Independent1932NTParty.getID()]: Independent1932NTParty,
				[Independent1924RLParty.getID()]: Independent1924RLParty,
				[Independent1920EDParty.getID()]: Independent1920EDParty,
				[Independent1916ABParty.getID()]: Independent1916ABParty,
				[Independent1912TRParty.getID()]: Independent1912TRParty,
				[Independent1912EDParty.getID()]: Independent1912EDParty,
				[Independent1892JWParty.getID()]: Independent1892JWParty,
				[Independent1892JBParty.getID()]: Independent1892JBParty,
				[Independent1888CFParty.getID()]: Independent1888CFParty,
				[Independent1860JohnBreckenridgeParty.getID()]: Independent1860JohnBreckenridgeParty,
				[Independent1860JohnBellParty.getID()]: Independent1860JohnBellParty,
				[Independent1856MFParty.getID()]: Independent1856MFParty,
				[Independent1844JBParty.getID()]: Independent1844JBParty,
				[Independent1836HWParty.getID()]: Independent1836HWParty,
				[Independent1836DWParty.getID()]: Independent1836DWParty,
				[Independent1836WMParty.getID()]: Independent1836WMParty,
				[Independent1832WWParty.getID()]: Independent1832WWParty,
				[Independent1832JFParty.getID()]: Independent1832JFParty,
				[Independent1824AJParty.getID()]: Independent1824AJParty,
				[Independent1824WCParty.getID()]: Independent1824WCParty,
				[Independent1824HCParty.getID()]: Independent1824HCParty,
				[Independent1820JAParty.getID()]: Independent1820JAParty,
				[Independent1808GCParty.getID()]: Independent1808GCParty,
				[IndependentGWParty.getID()]: IndependentGWParty,
				[IndependentGenericParty.getID()]: IndependentGenericParty
			},
			defaultDropdownPartyIDs: [
				DemocraticParty.getID(),
				RepublicanParty.getID()
			],
			mainPoliticalPartyIDs: [
				TossupParty.getID(),
				DemocraticParty.getID(),
				RepublicanParty.getID(),
				LibertarianParty.getID(),
				GreenParty.getID(),
				WhigParty.getID(),
				FreeSoilParty.getID(),
				NationalRepublicanParty.getID(),
				DemocraticRepublicanParty.getID(),
				FederalistParty.getID(),
				IndependentGenericParty.getID()
			],
			majorThirdPartyCandidateIDs: [
				Independent2024RFKParty.getID(),
				Independent2016EMParty.getID(),
				Independent2004JEParty.getID(),
				Independent1988LBParty.getID(),
				Independent1980JAParty.getID(),
				Independent1976EMParty.getID(),
				Independent1976RRParty.getID(),
				Independent1968GWParty.getID(),
				Independent1960HBParty.getID(),
				Independent1956WJParty.getID(),
				Independent1948SMParty.getID(),
				Independent1948HWParty.getID(),
				Independent1932NTParty.getID(),
				Independent1924RLParty.getID(),
				Independent1920EDParty.getID(),
				Independent1916ABParty.getID(),
				Independent1912TRParty.getID(),
				Independent1912EDParty.getID(),
				Independent1892JWParty.getID(),
				Independent1892JBParty.getID(),
				Independent1888CFParty.getID(),
				Independent1860JohnBreckenridgeParty.getID(),
				Independent1860JohnBellParty.getID(),
				Independent1856MFParty.getID(),
				Independent1844JBParty.getID(),
				Independent1836HWParty.getID(),
				Independent1836DWParty.getID(),
				Independent1836WMParty.getID(),
				Independent1832WWParty.getID(),
				Independent1832JFParty.getID(),
				Independent1824AJParty.getID(),
				Independent1824WCParty.getID(),
				Independent1824HCParty.getID(),
				Independent1820JAParty.getID(),
				Independent1808GCParty.getID(),
				IndependentGWParty.getID()
			]
		}
		
		const countdownTimes = {
			// "2020 Presidential Election": {time: 1604444400000, url: "https://en.wikipedia.org/wiki/2020_United_States_presidential_election"},
			// "2021 Inauguration Day": {time: 1611162000000, url: "https://en.wikipedia.org/wiki/Inauguration_of_Joe_Biden"},
			// "2022 Midterm Elections": {time: 1667948400000, url: "https://en.wikipedia.org/wiki/2022_United_States_elections"},
			"2024 Presidential Election": {time: 1730847600000, url: "https://en.wikipedia.org/wiki/2024_United_States_presidential_election"},
			"2025 Inauguration Day": {time: 1737392400000, url: null},
			"2026 Midterm Elections": {time: 1793746800000, url: "https://en.wikipedia.org/wiki/2026_United_States_elections"},
			"2028 Presidential Election": {time: 1857250800000, url: "https://en.wikipedia.org/wiki/2028_United_States_presidential_election"}
		}
		
		return {
			mapTypes,
			defaultMapTypeID,
			politicalPartyData,
			countdownTimes
		}
	}
)

// Main Parties

const DemocraticParty = new PoliticalParty(
	"DEM",
	["Democratic", "Democrat"],
	"Dem",
	"Democratic",
	PoliticalPartyColors.blue
)

const RepublicanParty = new PoliticalParty(
	"REP",
	["Republican"],
	"Rep",
	"Republican",
	PoliticalPartyColors.red
)

// Historic Main Parties

const WhigParty = new PoliticalParty(
	"WIG",
	["Whig"],
	"Whig",
	"Whig",
	PoliticalPartyColors.orange
)

const NationalRepublicanParty = new PoliticalParty(
	"NRP",
	["National Republican"],
	"NRP",
	"National Republican",
	PoliticalPartyColors.orange
)

const DemocraticRepublicanParty = new PoliticalParty(
	"DRP",
	["Democratic Republican", "Democratic-Republican"],
	"DRP",
	"Democratic Republican",
	PoliticalPartyColors.green
)

const FederalistParty = new PoliticalParty(
	"FED",
	["Federalist"],
	"FED",
	"Federalist",
	PoliticalPartyColors.scarlet
)

// Third Parties

const LibertarianParty = new PoliticalParty(
	"LIB",
	["Libertarian"],
	"Lib",
	"Libertarian",
	PoliticalPartyColors.yellow
)

const GreenParty = new PoliticalParty(
	"GRN",
	["Green"],
	"Grn",
	"Green",
	PoliticalPartyColors.green
)

const ReformParty = new PoliticalParty(
	"REF",
	["Reform", "Reform Party"],
	"Ref",
	"Reform",
	PoliticalPartyColors.purple
)

const ConservativeParty = new PoliticalParty(
	"CON",
	["Conservative"],
	"Con",
	"Conservative",
	PoliticalPartyColors.scarlet
)

// Historic Third Parties

const FreeSoilParty = new PoliticalParty(
	"FS",
	["Free Soil"],
	"FS",
	"Free Soil",
	PoliticalPartyColors.purple
)

// Independent Candidates

const IndependentRNParty = new PoliticalParty(
	"INDRN",
	["Nader"],
	"Ind",
	"Nader",
	PoliticalPartyColors.gray
)

const Independent2024RFKParty = new PoliticalParty(
	"IND2024RFK",
	["Kennedy"],
	"Ind",
	"Kennedy",
	PoliticalPartyColors.gray
)

const Independent2016EMParty = new PoliticalParty(
	"IND2016EM",
	["McMullin"],
	"Ind",
	"McMullin",
	PoliticalPartyColors.gray
)

const Independent2016CPParty = new PoliticalParty(
	"IND2016CP",
	["Powell"],
	"Ind",
	"Powell",
	PoliticalPartyColors.purple
)

const Independent2016BSParty = new PoliticalParty(
	"IND2016BS",
	["Sanders"],
	"Ind",
	"Sanders",
	PoliticalPartyColors.gray
)

const Independent2016RPParty = new PoliticalParty(
	"IND2016RP",
	["Paul"],
	"Ind",
	"Paul",
	PoliticalPartyColors.orange
)

const Independent2016JKParty = new PoliticalParty(
	"IND2016JK",
	["Kasich"],
	"Ind",
	"Kasich",
	PoliticalPartyColors.yellow
)

const Independent2016SEParty = new PoliticalParty(
	"IND2016SE",
	["Spotted Eagle"],
	"Ind",
	"Spotted Eagle",
	PoliticalPartyColors.gray
)

const Independent2004JEParty = new PoliticalParty(
	"IND2004JE",
	["Edwards"],
	"Ind",
	"Edwards",
	PoliticalPartyColors.gray
)

const Independent1988LBParty = new PoliticalParty(
	"IND1988LB",
	["Bentsen"],
	"Ind",
	"Bentsen",
	PoliticalPartyColors.gray
)

const Independent1980JAParty = new PoliticalParty(
	"IND1980JA",
	["Anderson"],
	"Ind",
	"Anderson",
	PoliticalPartyColors.orange
)

const Independent1976EMParty = new PoliticalParty(
	"IND1976EM",
	["McCarthy"],
	"Ind",
	"McCarthy",
	PoliticalPartyColors.gray
)

const Independent1976RRParty = new PoliticalParty(
	"IND1976RR",
	["Reagan"],
	"Ind",
	"Reagan",
	PoliticalPartyColors.orange
)

const Independent1968GWParty = new PoliticalParty(
	"IND1968GW",
	["Dixiecrat"],
	"Ind",
	"Wallace",
	PoliticalPartyColors.orange
)

const Independent1960HBParty = new PoliticalParty(
	"IND1960HB",
	["Dixiecrat"],
	"Ind",
	"Byrd",
	PoliticalPartyColors.orange
)

const Independent1956WJParty = new PoliticalParty(
	"IND1956WJ",
	["Dixiecrat"],
	"Ind",
	"Jones",
	PoliticalPartyColors.orange
)

const Independent1948SMParty = new PoliticalParty(
	"IND1948SM",
	["Dixiecrat"],
	"Ind",
	"Thurmond",
	PoliticalPartyColors.orange
)

const Independent1948HWParty = new PoliticalParty(
	"IND1948HW",
	["Progressive"],
	"Ind",
	"Wallace",
	PoliticalPartyColors.green
)

const Independent1932NTParty = new PoliticalParty(
	"IND1932NT",
	["Socialist"],
	"Ind",
	"Thomas",
	PoliticalPartyColors.scarlet
)

const Independent1924RLParty = new PoliticalParty(
	"IND1924RL",
	["Progressive"],
	"Ind",
	"La Follette",
	PoliticalPartyColors.green
)

const Independent1920EDParty = new PoliticalParty(
	"IND1920ED",
	["Socialist"],
	"Ind",
	"Debs",
	PoliticalPartyColors.scarlet
)

const Independent1916ABParty = new PoliticalParty(
	"IND1916AB",
	["Socialist"],
	"Ind",
	"Benson",
	PoliticalPartyColors.scarlet
)

const Independent1912TRParty = new PoliticalParty(
	"IND1912TR",
	["Progressive"],
	"Ind",
	"Roosevelt",
	PoliticalPartyColors.green
)

const Independent1912EDParty = new PoliticalParty(
	"IND1912ED",
	["Socialist"],
	"Ind",
	"Debs",
	PoliticalPartyColors.scarlet
)

const Independent1892JWParty = new PoliticalParty(
	"IND1892JW",
	["Populist"],
	"Ind",
	"Weaver",
	PoliticalPartyColors.green
)

const Independent1892JBParty = new PoliticalParty(
	"IND1892JB",
	["Prohibition"],
	"Ind",
	"Bidwell",
	PoliticalPartyColors.purple
)

const Independent1888CFParty = new PoliticalParty(
	"IND1888CF",
	["Prohibition"],
	"Ind",
	"Fisk",
	PoliticalPartyColors.purple
)

const Independent1860JohnBreckenridgeParty = new PoliticalParty(
	"IND1860JohnBreckenridge",
	["Southern Democratic"],
	"Ind",
	"Breckenridge",
	PoliticalPartyColors.green
)

const Independent1860JohnBellParty = new PoliticalParty(
	"IND1860JohnBell",
	["Constitutional Union"],
	"Ind",
	"Bell",
	PoliticalPartyColors.orange
)

const Independent1856MFParty = new PoliticalParty(
	"IND1856MF",
	["Know Nothing"],
	"Ind",
	"Fillmore",
	PoliticalPartyColors.purple
)

const Independent1844JBParty = new PoliticalParty(
	"IND1844JB",
	["Liberty"],
	"Ind",
	"Birney",
	PoliticalPartyColors.purple
)

const Independent1836HWParty = new PoliticalParty(
	"IND1836HW",
	["Whig"],
	"Ind",
	"White",
	PoliticalPartyColors.purple
)

const Independent1836DWParty = new PoliticalParty(
	"IND1836DW",
	["Whig"],
	"Ind",
	"Webster",
	PoliticalPartyColors.scarlet
)

const Independent1836WMParty = new PoliticalParty(
	"IND1836WM",
	["Whig"],
	"Ind",
	"Magnum",
	PoliticalPartyColors.green
)

const Independent1832WWParty = new PoliticalParty(
	"IND1832WW",
	["Anti Masonic"],
	"Ind",
	"Wirt",
	PoliticalPartyColors.scarlet
)

const Independent1832JFParty = new PoliticalParty(
	"IND1832JF",
	["Nullifier"],
	"Ind",
	"Floyd",
	PoliticalPartyColors.green
)

const Independent1824AJParty = new PoliticalParty(
	"IND1824AJ",
	["Democratic Republican"],
	"Ind",
	"Jackson",
	PoliticalPartyColors.blue
)

const Independent1824WCParty = new PoliticalParty(
	"IND1824WC",
	["Democratic Republican"],
	"Ind",
	"Crawford",
	PoliticalPartyColors.orange
)

const Independent1824HCParty = new PoliticalParty(
	"IND1824HC",
	["Democratic Republican"],
	"Ind",
	"Clay",
	PoliticalPartyColors.scarlet
)

const Independent1820JAParty = new PoliticalParty(
	"IND1820JA",
	["Democratic Republican", "Democratic-Republican"],
	"Ind",
	"Adams",
	PoliticalPartyColors.blue
)

const Independent1808GCParty = new PoliticalParty(
	"IND1808GC",
	["Democratic Republican", "Democratic-Republican"],
	"Ind",
	"Clinton",
	PoliticalPartyColors.blue
)

const IndependentGWParty = new PoliticalParty(
	"INDGW",
	["Washington"],
	"Ind",
	"Washington",
	PoliticalPartyColors.orange
)