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
  yellow: {current: "#725B00", safe: "#FF9D0A", likely: "#e8c84c", lean: "#E6BD5D", tilt: "#c7af59"},
  green: {current: "#32811C", safe: "#499A21", likely: "#7DBF5C", lean: "#ACD896", tilt: "#A8BF9C"},
  purple: {current: "#461C81", safe: "#8A38FF", likely: "#B47BFF", lean: "#D3B2FF", tilt: "#B09CBF"},
  orange: {current: "#814E1C", safe: "#E58B31", likely: "#E6AB6F", lean: "#E5BD95", tilt: "#BFAD9C"},
  scarlet: {current: "#A82D00", safe: "#DE3B00", likely: "#FF6B36", lean: "#FFA685", tilt: "#BF8977"},
  gray: {current: "#363636", safe: "#6A6A6A", likely: "#979797", lean: "#C0C0C0", tilt: "#A2A2A2"}
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
  ["Reform"],
  "Ref",
  "Perot",
  cloneObject(PoliticalPartyColors.purple),
  defaultMarginNames
)

var IndependentRNParty = new PoliticalParty(
  "INDRN",
  ["None"],
  "Ind",
  "Nader",
  cloneObject(PoliticalPartyColors.gray),
  defaultMarginNames
)

var Independent2016EMParty = new PoliticalParty(
  "IND2016EM",
  ["None"],
  "Ind",
  "McMullin",
  cloneObject(PoliticalPartyColors.gray),
  defaultMarginNames
)

var Independent1980JAParty = new PoliticalParty(
  "IND1980JA",
  ["None"],
  "Ind",
  "Anderson",
  cloneObject(PoliticalPartyColors.gray),
  defaultMarginNames
)

var Independent1976EMParty = new PoliticalParty(
  "IND1976EM",
  ["None"],
  "Ind",
  "McCarthy",
  cloneObject(PoliticalPartyColors.gray),
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

politicalParties[LibertarianParty.getID()] = LibertarianParty
politicalParties[GreenParty.getID()] = GreenParty
politicalParties[ReformParty.getID()] = ReformParty
politicalParties[IndependentRNParty.getID()] = IndependentRNParty
politicalParties[Independent2016EMParty.getID()] = Independent2016EMParty
politicalParties[Independent1980JAParty.getID()] = Independent1980JAParty
politicalParties[Independent1976EMParty.getID()] = Independent1976EMParty
politicalParties[Independent1968GWParty.getID()] = Independent1968GWParty
politicalParties[Independent1960HBParty.getID()] = Independent1960HBParty
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

politicalParties[IndependentGenericParty.getID()] = IndependentGenericParty

var defaultDropdownPoliticalPartyIDs = [DemocraticParty.getID(), RepublicanParty.getID()]
var mainPoliticalPartyIDs = [TossupParty.getID(), DemocraticParty.getID(), RepublicanParty.getID(), LibertarianParty.getID(), GreenParty.getID(), IndependentGenericParty.getID()]
var majorThirdPartyCandidates = [
  Independent2016EMParty.getID(),
  Independent1980JAParty.getID(),
  Independent1976EMParty.getID(),
  Independent1968GWParty.getID(),
  Independent1960HBParty.getID(),
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
  Independent1856MFParty.getID()
]
