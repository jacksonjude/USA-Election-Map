class PoliticalParty
{
  constructor(id, names, shortName, defaultCandidateName, marginColors, marginNames)
  {
    this.id = id
    this.names = names
    this.shortName = shortName
    this.defaultCandidateName = defaultCandidateName
    this.candidateName = defaultCandidateName
    this.marginColors = marginColors
    this.marginNames = marginNames
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
}

const defaultMarginNames = {current: "Current", safe: "Safe", likely: "Likely", lean: "Lean", tilt: "Tilt"}

const PoliticalPartyColors = {
  blue: {current: "#10234E", safe: "#1c408c", likely: "#587ccc", lean: "#8aafff", tilt: "#949bb3"},
  red: {current: "#600E15", safe: "#be1c29", likely: "#ff5864", lean: "#ff8b98", tilt: "#cf8980"},
  green: {current: "#32811C", safe: "#499A21", likely: "#7DBF5C", lean: "#ACD896", tilt: "#A8BF9C"},
  orange: {current: "#A36323", safe: "#E57C13", likely: "#E69D54", lean: "#E5BD95", tilt: "#BFAD9C"},
  purple: {current: "#461C81", safe: "#8A38FF", likely: "#B47BFF", lean: "#D3B2FF", tilt: "#B09CBF"},
  yellow: {current: "#B86E00", safe: "#FE9800", likely: "#E8AF44", lean: "#E6BD5D", tilt: "#C7A659"},
  scarlet: {current: "#A82D00", safe: "#DE3B00", likely: "#FF6B36", lean: "#FFA685", tilt: "#BF8977"},
  gray: {current: "#262626", safe: "#404040", likely: "#6C6C6C", lean: "#B0B0B0", tilt: "#D4D4D4"}
}

// Main Parties

var DemocraticParty = new PoliticalParty(
  "DEM",
  ["Democratic", "Democrat"],
  "Dem",
  "Biden",
  cloneObject(PoliticalPartyColors.blue),
  defaultMarginNames
)

var RepublicanParty = new PoliticalParty(
  "REP",
  ["Republican"],
  "Rep",
  "Trump",
  cloneObject(PoliticalPartyColors.red),
  defaultMarginNames
)

var TossupParty = new PoliticalParty(
  "Tossup",
  ["Tossup"],
  "Tossup",
  null,
  {current: "#6c6e74", safe: "#6c6e74", likely: "#6c6e74", lean: "#6c6e74", tilt: "#6c6e74"},
  defaultMarginNames
)

// Historic Main Parties

var WhigParty = new PoliticalParty(
  "WIG",
  ["Whig"],
  "Whig",
  "Harrison",
  cloneObject(PoliticalPartyColors.orange),
  defaultMarginNames
)

var NationalRepublicanParty = new PoliticalParty(
  "NRP",
  ["National Republican"],
  "NRP",
  "Clay",
  cloneObject(PoliticalPartyColors.orange),
  defaultMarginNames
)

var DemocraticRepublicanParty = new PoliticalParty(
  "DRP",
  ["Democratic Republican", "Democratic-Republican"],
  "DRP",
  "Monroe",
  cloneObject(PoliticalPartyColors.green),
  defaultMarginNames
)

var FederalistParty = new PoliticalParty(
  "FED",
  ["Federalist"],
  "FED",
  "Adams",
  cloneObject(PoliticalPartyColors.scarlet),
  defaultMarginNames
)

// Third Parties

var LibertarianParty = new PoliticalParty(
  "LIB",
  ["Libertarian"],
  "Lib",
  "Jorgensen",
  cloneObject(PoliticalPartyColors.yellow),
  defaultMarginNames
)

var GreenParty = new PoliticalParty(
  "GRN",
  ["Green"],
  "Grn",
  "Hawkins",
  cloneObject(PoliticalPartyColors.green),
  defaultMarginNames
)

var ReformParty = new PoliticalParty(
  "REF",
  ["Reform", "Reform Party"],
  "Ref",
  "Perot",
  cloneObject(PoliticalPartyColors.purple),
  defaultMarginNames
)

// Historic Third Parties

var FreeSoilParty = new PoliticalParty(
  "FS",
  ["Free Soil"],
  "FS",
  "Van Buren",
  cloneObject(PoliticalPartyColors.purple),
  defaultMarginNames
)

// Independent Candidates

var IndependentRNParty = new PoliticalParty(
  "INDRN",
  ["Nader"],
  "Ind",
  "Nader",
  cloneObject(PoliticalPartyColors.gray),
  defaultMarginNames
)

var Independent2016EMParty = new PoliticalParty(
  "IND2016EM",
  ["McMullin"],
  "Ind",
  "McMullin",
  cloneObject(PoliticalPartyColors.gray),
  defaultMarginNames
)

var Independent2016CPParty = new PoliticalParty(
  "IND2016CP",
  ["Powell"],
  "Ind",
  "Powell",
  cloneObject(PoliticalPartyColors.purple),
  defaultMarginNames
)

var Independent2016BSParty = new PoliticalParty(
  "IND2016BS",
  ["Sanders"],
  "Ind",
  "Sanders",
  cloneObject(PoliticalPartyColors.gray),
  defaultMarginNames
)

var Independent2016RPParty = new PoliticalParty(
  "IND2016RP",
  ["Paul"],
  "Ind",
  "Paul",
  cloneObject(PoliticalPartyColors.orange),
  defaultMarginNames
)

var Independent2016JKParty = new PoliticalParty(
  "IND2016JK",
  ["Kasich"],
  "Ind",
  "Kasich",
  cloneObject(PoliticalPartyColors.yellow),
  defaultMarginNames
)

var Independent2016SEParty = new PoliticalParty(
  "IND2016SE",
  ["Spotted Eagle"],
  "Ind",
  "Spotted Eagle",
  cloneObject(PoliticalPartyColors.gray),
  defaultMarginNames
)

var Independent2004JEParty = new PoliticalParty(
  "IND2004JE",
  ["Edwards"],
  "Ind",
  "Edwards",
  cloneObject(PoliticalPartyColors.gray),
  defaultMarginNames
)

var Independent1988LBParty = new PoliticalParty(
  "IND1988LB",
  ["Bentsen"],
  "Ind",
  "Bentsen",
  cloneObject(PoliticalPartyColors.gray),
  defaultMarginNames
)

var Independent1980JAParty = new PoliticalParty(
  "IND1980JA",
  ["Anderson"],
  "Ind",
  "Anderson",
  cloneObject(PoliticalPartyColors.orange),
  defaultMarginNames
)

var Independent1976EMParty = new PoliticalParty(
  "IND1976EM",
  ["McCarthy"],
  "Ind",
  "McCarthy",
  cloneObject(PoliticalPartyColors.gray),
  defaultMarginNames
)

var Independent1976RRParty = new PoliticalParty(
  "IND1976RR",
  ["Reagan"],
  "Ind",
  "Reagan",
  cloneObject(PoliticalPartyColors.orange),
  defaultMarginNames
)

var Independent1968GWParty = new PoliticalParty(
  "IND1968GW",
  ["Dixiecrat"],
  "Ind",
  "Wallace",
  cloneObject(PoliticalPartyColors.orange),
  defaultMarginNames
)

var Independent1960HBParty = new PoliticalParty(
  "IND1960HB",
  ["Dixiecrat"],
  "Ind",
  "Byrd",
  cloneObject(PoliticalPartyColors.orange),
  defaultMarginNames
)

var Independent1956WJParty = new PoliticalParty(
  "IND1956WJ",
  ["Dixiecrat"],
  "Ind",
  "Jones",
  cloneObject(PoliticalPartyColors.orange),
  defaultMarginNames
)

var Independent1948SMParty = new PoliticalParty(
  "IND1948SM",
  ["Dixiecrat"],
  "Ind",
  "Thurmond",
  cloneObject(PoliticalPartyColors.orange),
  defaultMarginNames
)

var Independent1948HWParty = new PoliticalParty(
  "IND1948HW",
  ["Progressive"],
  "Ind",
  "Wallace",
  cloneObject(PoliticalPartyColors.green),
  defaultMarginNames
)

var Independent1932NTParty = new PoliticalParty(
  "IND1932NT",
  ["Socialist"],
  "Ind",
  "Thomas",
  cloneObject(PoliticalPartyColors.scarlet),
  defaultMarginNames
)

var Independent1924RLParty = new PoliticalParty(
  "IND1924RL",
  ["Progressive"],
  "Ind",
  "La Follette",
  cloneObject(PoliticalPartyColors.green),
  defaultMarginNames
)

var Independent1920EDParty = new PoliticalParty(
  "IND1920ED",
  ["Socialist"],
  "Ind",
  "Debs",
  cloneObject(PoliticalPartyColors.scarlet),
  defaultMarginNames
)

var Independent1916ABParty = new PoliticalParty(
  "IND1916AB",
  ["Socialist"],
  "Ind",
  "Benson",
  cloneObject(PoliticalPartyColors.scarlet),
  defaultMarginNames
)

var Independent1912TRParty = new PoliticalParty(
  "IND1912TR",
  ["Progressive"],
  "Ind",
  "Roosevelt",
  cloneObject(PoliticalPartyColors.green),
  defaultMarginNames
)

var Independent1912EDParty = new PoliticalParty(
  "IND1912ED",
  ["Socialist"],
  "Ind",
  "Debs",
  cloneObject(PoliticalPartyColors.scarlet),
  defaultMarginNames
)

var Independent1892JWParty = new PoliticalParty(
  "IND1892JW",
  ["Populist"],
  "Ind",
  "Weaver",
  cloneObject(PoliticalPartyColors.green),
  defaultMarginNames
)

var Independent1892JBParty = new PoliticalParty(
  "IND1892JB",
  ["Prohibition"],
  "Ind",
  "Bidwell",
  cloneObject(PoliticalPartyColors.purple),
  defaultMarginNames
)

var Independent1888CFParty = new PoliticalParty(
  "IND1888CF",
  ["Prohibition"],
  "Ind",
  "Fisk",
  cloneObject(PoliticalPartyColors.purple),
  defaultMarginNames
)

var Independent1860JohnBreckenridgeParty = new PoliticalParty(
  "IND1860JohnBreckenridge",
  ["Southern Democratic"],
  "Ind",
  "Breckenridge",
  cloneObject(PoliticalPartyColors.green),
  defaultMarginNames
)

var Independent1860JohnBellParty = new PoliticalParty(
  "IND1860JohnBell",
  ["Constitutional Union"],
  "Ind",
  "Bell",
  cloneObject(PoliticalPartyColors.orange),
  defaultMarginNames
)

var Independent1856MFParty = new PoliticalParty(
  "IND1856MF",
  ["Know Nothing"],
  "Ind",
  "Fillmore",
  cloneObject(PoliticalPartyColors.purple),
  defaultMarginNames
)

var Independent1844JBParty = new PoliticalParty(
  "IND1844JB",
  ["Liberty"],
  "Ind",
  "Birney",
  cloneObject(PoliticalPartyColors.purple),
  defaultMarginNames
)

var Independent1836HWParty = new PoliticalParty(
  "IND1836HW",
  ["Whig"],
  "Ind",
  "White",
  cloneObject(PoliticalPartyColors.purple),
  defaultMarginNames
)

var Independent1836DWParty = new PoliticalParty(
  "IND1836DW",
  ["Whig"],
  "Ind",
  "Webster",
  cloneObject(PoliticalPartyColors.scarlet),
  defaultMarginNames
)

var Independent1836WMParty = new PoliticalParty(
  "IND1836WM",
  ["Whig"],
  "Ind",
  "Magnum",
  cloneObject(PoliticalPartyColors.green),
  defaultMarginNames
)

var Independent1832WWParty = new PoliticalParty(
  "IND1832WW",
  ["Anti Masonic"],
  "Ind",
  "Wirt",
  cloneObject(PoliticalPartyColors.scarlet),
  defaultMarginNames
)

var Independent1832JFParty = new PoliticalParty(
  "IND1832JF",
  ["Nullifier"],
  "Ind",
  "Floyd",
  cloneObject(PoliticalPartyColors.green),
  defaultMarginNames
)

var Independent1832JFParty = new PoliticalParty(
  "IND1832JF",
  ["Nullifier"],
  "Ind",
  "Floyd",
  cloneObject(PoliticalPartyColors.green),
  defaultMarginNames
)

var Independent1824AJParty = new PoliticalParty(
  "IND1824AJ",
  ["Democratic Republican"],
  "Ind",
  "Jackson",
  cloneObject(PoliticalPartyColors.blue),
  defaultMarginNames
)

var Independent1824WCParty = new PoliticalParty(
  "IND1824WC",
  ["Democratic Republican"],
  "Ind",
  "Crawford",
  cloneObject(PoliticalPartyColors.orange),
  defaultMarginNames
)

var Independent1824HCParty = new PoliticalParty(
  "IND1824HC",
  ["Democratic Republican"],
  "Ind",
  "Clay",
  cloneObject(PoliticalPartyColors.scarlet),
  defaultMarginNames
)

var Independent1820JAParty = new PoliticalParty(
  "IND1820JA",
  ["Democratic Republican", "Democratic-Republican"],
  "Ind",
  "Adams",
  cloneObject(PoliticalPartyColors.blue),
  defaultMarginNames
)

var Independent1808GCParty = new PoliticalParty(
  "IND1808GC",
  ["Democratic Republican", "Democratic-Republican"],
  "Ind",
  "Clinton",
  cloneObject(PoliticalPartyColors.blue),
  defaultMarginNames
)

var IndependentGWParty = new PoliticalParty(
  "INDGW",
  ["Washington"],
  "Ind",
  "Washington",
  cloneObject(PoliticalPartyColors.orange),
  defaultMarginNames
)

var IndependentGenericParty = new PoliticalParty(
  "INDGEN",
  ["Independent"],
  "Ind",
  "Generic",
  cloneObject(PoliticalPartyColors.gray),
  defaultMarginNames
)

var politicalParties = {}
politicalParties[DemocraticParty.getID()] = DemocraticParty
politicalParties[RepublicanParty.getID()] = RepublicanParty
politicalParties[TossupParty.getID()] = TossupParty

politicalParties[WhigParty.getID()] = WhigParty
politicalParties[NationalRepublicanParty.getID()] = NationalRepublicanParty
politicalParties[DemocraticRepublicanParty.getID()] = DemocraticRepublicanParty
politicalParties[FederalistParty.getID()] = FederalistParty

politicalParties[LibertarianParty.getID()] = LibertarianParty
politicalParties[GreenParty.getID()] = GreenParty
politicalParties[ReformParty.getID()] = ReformParty

politicalParties[FreeSoilParty.getID()] = FreeSoilParty

politicalParties[IndependentRNParty.getID()] = IndependentRNParty
politicalParties[Independent2016EMParty.getID()] = Independent2016EMParty
politicalParties[Independent2016CPParty.getID()] = Independent2016CPParty
politicalParties[Independent2016BSParty.getID()] = Independent2016BSParty
politicalParties[Independent2016RPParty.getID()] = Independent2016RPParty
politicalParties[Independent2016JKParty.getID()] = Independent2016JKParty
politicalParties[Independent2016SEParty.getID()] = Independent2016SEParty
politicalParties[Independent2004JEParty.getID()] = Independent2004JEParty
politicalParties[Independent1988LBParty.getID()] = Independent1988LBParty
politicalParties[Independent1980JAParty.getID()] = Independent1980JAParty
politicalParties[Independent1976EMParty.getID()] = Independent1976EMParty
politicalParties[Independent1976RRParty.getID()] = Independent1976RRParty
politicalParties[Independent1968GWParty.getID()] = Independent1968GWParty
politicalParties[Independent1960HBParty.getID()] = Independent1960HBParty
politicalParties[Independent1956WJParty.getID()] = Independent1956WJParty
politicalParties[Independent1948SMParty.getID()] = Independent1948SMParty
politicalParties[Independent1948HWParty.getID()] = Independent1948HWParty
politicalParties[Independent1932NTParty.getID()] = Independent1932NTParty
politicalParties[Independent1924RLParty.getID()] = Independent1924RLParty
politicalParties[Independent1920EDParty.getID()] = Independent1920EDParty
politicalParties[Independent1916ABParty.getID()] = Independent1916ABParty
politicalParties[Independent1912TRParty.getID()] = Independent1912TRParty
politicalParties[Independent1912EDParty.getID()] = Independent1912EDParty
politicalParties[Independent1892JWParty.getID()] = Independent1892JWParty
politicalParties[Independent1892JBParty.getID()] = Independent1892JBParty
politicalParties[Independent1888CFParty.getID()] = Independent1888CFParty
politicalParties[Independent1860JohnBreckenridgeParty.getID()] = Independent1860JohnBreckenridgeParty
politicalParties[Independent1860JohnBellParty.getID()] = Independent1860JohnBellParty
politicalParties[Independent1856MFParty.getID()] = Independent1856MFParty
politicalParties[Independent1844JBParty.getID()] = Independent1844JBParty
politicalParties[Independent1836HWParty.getID()] = Independent1836HWParty
politicalParties[Independent1836DWParty.getID()] = Independent1836DWParty
politicalParties[Independent1836WMParty.getID()] = Independent1836WMParty
politicalParties[Independent1832WWParty.getID()] = Independent1832WWParty
politicalParties[Independent1832JFParty.getID()] = Independent1832JFParty
politicalParties[Independent1824AJParty.getID()] = Independent1824AJParty
politicalParties[Independent1824WCParty.getID()] = Independent1824WCParty
politicalParties[Independent1824HCParty.getID()] = Independent1824HCParty
politicalParties[Independent1820JAParty.getID()] = Independent1820JAParty
politicalParties[Independent1808GCParty.getID()] = Independent1808GCParty
politicalParties[IndependentGWParty.getID()] = IndependentGWParty

politicalParties[IndependentGenericParty.getID()] = IndependentGenericParty

var defaultDropdownPoliticalPartyIDs = [DemocraticParty.getID(), RepublicanParty.getID()]
var mainPoliticalPartyIDs = [TossupParty.getID(), DemocraticParty.getID(), RepublicanParty.getID(), LibertarianParty.getID(), GreenParty.getID(), WhigParty.getID(), FreeSoilParty.getID(), NationalRepublicanParty.getID(), DemocraticRepublicanParty.getID(), FederalistParty.getID(), IndependentGenericParty.getID()]
var majorThirdPartyCandidates = [
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
