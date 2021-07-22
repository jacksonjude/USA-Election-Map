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

  getMarginColors()
  {
    return this.marginColors
  }

  getMarginNames()
  {
    return this.marginNames
  }
}

const defaultMarginNames = {current: "Current", safe: "Safe", likely: "Likely", lean: "Lean", tilt: "Tilt"}

// Main Parties

var DemocraticParty = new PoliticalParty(
  "DEM",
  ["Democratic", "Democrat"],
  "Dem",
  "Biden",
  {current: "#10234E", safe: "#1c408c", likely: "#587ccc", lean: "#8aafff", tilt: "#949bb3"},
  defaultMarginNames
)

var RepublicanParty = new PoliticalParty(
  "REP",
  ["Republican"],
  "Rep",
  "Trump",
  {current: "#600E15", safe: "#be1c29", likely: "#ff5864", lean: "#ff8b98", tilt: "#cf8980"},
  defaultMarginNames
)

var TossupParty = new PoliticalParty(
  "Tossup",
  ["Tossup"],
  "Tossup",
  null,
  {safe: "#6c6e74", likely: "#6c6e74", lean: "#6c6e74", tilt: "#6c6e74"},
  defaultMarginNames
)

// var DisabledParty = new PoliticalParty(
//   "Disabled",
//   ["Disabled"],
//   "Disabled",
//   null,
//   {safe: "#28292F", likely: "#28292F", lean: "#28292F", tilt: "#28292F"},
//   defaultMarginNames
// )
// Add disabled tag; Remove -S regions if disabled && tossup party

// Third Parties

var LibertarianParty = new PoliticalParty(
  "LIB",
  ["Libertarian"],
  "Lib",
  "Jorgensen",
  {current: "#725B00", safe: "#FF9D0A", likely: "#e8c84c", lean: "#E6BD5D", tilt: "#c7af59"},
  // {current: "#725B00", safe: "#e6b701", likely: "#e8c84c", lean: "#ffe78a", tilt: "#c7af59"},
  defaultMarginNames
)

var GreenParty = new PoliticalParty(
  "GRN",
  ["Green"],
  "Grn",
  "Hawkins",
  {current: "#0E4714", safe: "#1C8C28", likely: "#50C85D", lean: "#73D57F", tilt: "#8EB293"},
  // {current: "#0E4714", safe: "#1C8C28", likely: "#50C85D", lean: "#8AFF97", tilt: "#8EB293"},
  defaultMarginNames
)

var ReformParty = new PoliticalParty(
  "REF",
  ["Reform"],
  "Ref",
  "Perot",
  {current: "#461C81", safe: "#8A38FF", likely: "#B47BFF", lean: "#D3B2FF", tilt: "#B09CBF"},
  defaultMarginNames
)

var IndependentRNParty = new PoliticalParty(
  "INDRN",
  ["Nader"],
  "Ind",
  "Nader",
  {current: "#461C81", safe: "#8A38FF", likely: "#B47BFF", lean: "#D3B2FF", tilt: "#B09CBF"},
  defaultMarginNames
)

var Independent2016EMParty = new PoliticalParty(
  "IND2016EM",
  ["McMullin"],
  "Ind",
  "McMullin",
  {current: "#461C81", safe: "#8A38FF", likely: "#B47BFF", lean: "#D3B2FF", tilt: "#B09CBF"},
  defaultMarginNames
)

var Independent1980JAParty = new PoliticalParty(
  "IND1980JA",
  ["Anderson"],
  "Ind",
  "Anderson",
  {current: "#461C81", safe: "#8A38FF", likely: "#B47BFF", lean: "#D3B2FF", tilt: "#B09CBF"},
  defaultMarginNames
)

var Independent1976EMParty = new PoliticalParty(
  "IND1976EM",
  ["McCarthy"],
  "Ind",
  "McCarthy",
  {current: "#461C81", safe: "#8A38FF", likely: "#B47BFF", lean: "#D3B2FF", tilt: "#B09CBF"},
  defaultMarginNames
)

var Independent1968GWParty = new PoliticalParty(
  "IND1968GW",
  ["Wallace"],
  "Ind",
  "Wallace",
  {current: "#461C81", safe: "#8A38FF", likely: "#B47BFF", lean: "#D3B2FF", tilt: "#B09CBF"},
  defaultMarginNames
)

var Independent1948SMParty = new PoliticalParty(
  "IND1948SM",
  ["Thurmond"],
  "Ind",
  "Thurmond",
  {current: "#461C81", safe: "#8A38FF", likely: "#B47BFF", lean: "#D3B2FF", tilt: "#B09CBF"},
  defaultMarginNames
)

var Independent1948HWParty = new PoliticalParty(
  "IND1948HW",
  ["Wallace"],
  "Ind",
  "Wallace",
  {current: "#461C81", safe: "#8A38FF", likely: "#B47BFF", lean: "#D3B2FF", tilt: "#B09CBF"},
  defaultMarginNames
)

var Independent1932NTParty = new PoliticalParty(
  "IND1932NT",
  ["Thomas"],
  "Ind",
  "Thomas",
  {current: "#461C81", safe: "#8A38FF", likely: "#B47BFF", lean: "#D3B2FF", tilt: "#B09CBF"},
  defaultMarginNames
)

var Independent1924RLParty = new PoliticalParty(
  "IND1924RL",
  ["La Follette"],
  "Ind",
  "La Follette",
  {current: "#461C81", safe: "#8A38FF", likely: "#B47BFF", lean: "#D3B2FF", tilt: "#B09CBF"},
  defaultMarginNames
)

var Independent1920EDParty = new PoliticalParty(
  "IND1920ED",
  ["Debs"],
  "Ind",
  "Debs",
  {current: "#461C81", safe: "#8A38FF", likely: "#B47BFF", lean: "#D3B2FF", tilt: "#B09CBF"},
  defaultMarginNames
)

var Independent1916ABParty = new PoliticalParty(
  "IND1916AB",
  ["Benson"],
  "Ind",
  "Benson",
  {current: "#461C81", safe: "#8A38FF", likely: "#B47BFF", lean: "#D3B2FF", tilt: "#B09CBF"},
  defaultMarginNames
)

var Independent1912TRParty = new PoliticalParty(
  "IND1912TR",
  ["Roosevelt"],
  "Ind",
  "Roosevelt",
  {current: "#461C81", safe: "#8A38FF", likely: "#B47BFF", lean: "#D3B2FF", tilt: "#B09CBF"},
  defaultMarginNames
)

var Independent1912EDParty = new PoliticalParty(
  "IND1912ED",
  ["Debs"],
  "Ind",
  "Debs",
  {current: "#461C81", safe: "#8A38FF", likely: "#B47BFF", lean: "#D3B2FF", tilt: "#B09CBF"},
  defaultMarginNames
)

var IndependentGenericParty = new PoliticalParty(
  "INDGEN",
  ["Independent"],
  "Ind",
  "Generic",
  {current: "#461C81", safe: "#8A38FF", likely: "#B47BFF", lean: "#D3B2FF", tilt: "#B09CBF"},
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
politicalParties[Independent1948SMParty.getID()] = Independent1948SMParty
politicalParties[Independent1948HWParty.getID()] = Independent1948HWParty
politicalParties[Independent1932NTParty.getID()] = Independent1932NTParty
politicalParties[Independent1924RLParty.getID()] = Independent1924RLParty
politicalParties[Independent1920EDParty.getID()] = Independent1920EDParty
politicalParties[Independent1916ABParty.getID()] = Independent1916ABParty
politicalParties[Independent1912TRParty.getID()] = Independent1912TRParty
politicalParties[Independent1912EDParty.getID()] = Independent1912EDParty

politicalParties[IndependentGenericParty.getID()] = IndependentGenericParty

var selectablePoliticalPartyIDs = [DemocraticParty.getID(), TossupParty.getID(), RepublicanParty.getID()]
var mainPoliticalPartyIDs = [TossupParty.getID(), DemocraticParty.getID(), RepublicanParty.getID(), LibertarianParty.getID(), GreenParty.getID(), IndependentGenericParty.getID()]
