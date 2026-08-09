class PoliticalParty
{
  constructor(id, names, shortName, defaultCandidateName, marginColors, ancestorParties)
  {
    this.id = id
    this.names = names
    this.shortName = shortName
    this.defaultCandidateName = defaultCandidateName
    this.candidateName = defaultCandidateName
    this.marginColors = cloneObject(marginColors)
    this.ancestorParties = ancestorParties
    
    this.marginNames = defaultMarginNames
  }

  getID()
  {
    return this.id
  }

  getNames()
  {
    return this.names
  }

  getShortName()
  {
    return this.shortName
  }

  setCandidateName(newCandidateName)
  {
    if (newCandidateName != null)
    {
      this.candidateName = newCandidateName
    }
    else
    {
      this.candidateName = this.defaultCandidateName
    }
  }

  getCandidateName()
  {
    return this.candidateName
  }

  getDefaultCandidateName()
  {
    return this.defaultCandidateName
  }

  getMarginColors()
  {
    return this.marginColors
  }

  setMarginColors(marginColors)
  {
    this.marginColors = marginColors
  }

  getMarginNames()
  {
    return this.marginNames
  }
  
  getAncestors()
  {
    const direct = this.ancestorParties ?? []
    return [...new Set([...direct, ...direct.flatMap(p => p.getAncestors())])]
  }
  
  isDescendant(otherParty)
  {
    return this.getAncestors().some(p => p.getID() == otherParty.getID()) ?? false
  }
}

const defaultMarginNames = {current: "Current", safe: "Safe", likely: "Likely", lean: "Lean", tilt: "Tilt"}

const PoliticalPartyColors = {
  blue: {current: "#10234E", safe: "#1c408c", likely: "#587ccc", lean: "#8aafff", tilt: "#949bb3"},
  red: {current: "#600E15", safe: "#be1c29", likely: "#ff5864", lean: "#ff8b98", tilt: "#cf8980"},
  green: {current: "#32811C", safe: "#499A21", likely: "#7DBF5C", lean: "#ACD896", tilt: "#A8BF9C"},
  orange: {current: "#A36323", safe: "#E57C13", likely: "#E69D54", lean: "#E5BD95", tilt: "#c8ad93"},
  purple: {current: "#461C81", safe: "#8A38FF", likely: "#B47BFF", lean: "#D3B2FF", tilt: "#B09CBF"},
  scarlet: {current: "#A82D00", safe: "#DE3B00", likely: "#FF6B36", lean: "#FFAE85", tilt: "#C39A74"},
  cyan: {current: "#1A595D", safe: "#1F767A", likely: "#31A7AF", lean: "#6CD2D9", tilt: "#84B2B5"},
  yellow: {current: "#B86E00", safe: "#FE9800", likely: "#e8a43e", lean: "#eab86e", tilt: "#C7A659"},
  magenta: {current: "#700036", safe: "#AB0354", likely: "#E8026E", lean: "#FE62AD", tilt: "#B87F9C"},
  lime: {current: "#60801B", safe: "#89B30E", likely: "#A1BF47", lean: "#ADBF7C", tilt: "#ACB392"},
  brown: {current: "#2E1500", safe: "#542E11", likely: "#A86234", lean: "#D88856", tilt: "#F7C2A6"},
  gray: {current: "#2A2822", safe: "#474339", likely: "#77705F", lean: "#B9B4A7", tilt: "#D8D6CF"}
}

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

const TossupParty = new PoliticalParty(
  "Tossup",
  ["Tossup"],
  "Tossup",
  null,
  {current: "#6c6e74", safe: "#6c6e74", likely: "#6c6e74", lean: "#6c6e74", tilt: "#6c6e74"}
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

const IndependentGenericParty = new PoliticalParty(
  "INDGEN",
  ["Independent"],
  "Ind",
  "Independent",
  PoliticalPartyColors.gray
)

let politicalParties = {}
let defaultDropdownPoliticalPartyIDs = []
let mainPoliticalPartyIDs = []
let majorThirdPartyCandidates = []
