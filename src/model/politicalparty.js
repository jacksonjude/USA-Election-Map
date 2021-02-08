class PoliticalParty
{
  constructor(id, names, defaultCandidateName, marginColors, marginNames)
  {
    this.id = id
    this.names = names
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

const defaultMarginNames = {safe: "Safe", likely: "Likely", lean: "Lean", tilt: "Tilt"}

// Main Parties

var DemocraticParty = new PoliticalParty(
  "DEM",
  ["Democratic", "Democrat"],
  "Biden",
  {safe: "#1c408c", likely: "#587ccc", lean: "#8aafff", tilt: "#949bb3"},
  defaultMarginNames
)

var RepublicanParty = new PoliticalParty(
  "REP",
  ["Republican"],
  "Trump",
  {safe: "#be1c29", likely: "#ff5864", lean: "#ff8b98", tilt: "#cf8980"},
  defaultMarginNames
)

var TossupParty = new PoliticalParty(
  "Tossup",
  ["Tossup"],
  null,
  {safe: "#6c6e74", likely: "#6c6e74", lean: "#6c6e74", tilt: "#6c6e74"},
  defaultMarginNames
)

// Third Parties

var LibertarianParty = new PoliticalParty(
  "LIB",
  ["Libertarian"],
  "Jorgensen",
  {safe: "#e6b701", likely: "#e8c84c", lean: "#ffe78a", tilt: "#c7af59"},
  defaultMarginNames
)

var GreenParty = new PoliticalParty(
  "GRN",
  ["Green"],
  "Hawkins",
  {safe: "#1C8C28", likely: "#50C85D", lean: "#8AFF97", tilt: "#8EB293"},
)

var ReformParty = new PoliticalParty(
  "REF",
  ["Reform"],
  "Perot",
  {safe: "#B18CFE", likely: "#B18CFE", lean: "#B18CFE", tilt: "#B18CFE"},
  defaultMarginNames
)

var IndependentRNParty = new PoliticalParty(
  "INDRN",
  ["Independent"],
  "Nader",
  {safe: "#B18CFE", likely: "#B18CFE", lean: "#B18CFE", tilt: "#B18CFE"},
  defaultMarginNames
)

var Independent2016EMParty = new PoliticalParty(
  "IND2016EM",
  ["Independent"],
  "McMullin",
  {safe: "#B18CFE", likely: "#B18CFE", lean: "#B18CFE", tilt: "#B18CFE"},
  defaultMarginNames
)

var Independent1980JAParty = new PoliticalParty(
  "IND1980JA",
  ["Independent"],
  "Anderson",
  {safe: "#B18CFE", likely: "#B18CFE", lean: "#B18CFE", tilt: "#B18CFE"},
  defaultMarginNames
)

var Independent1976EMParty = new PoliticalParty(
  "IND1976EM",
  ["Independent"],
  "McCarthy",
  {safe: "#B18CFE", likely: "#B18CFE", lean: "#B18CFE", tilt: "#B18CFE"},
  defaultMarginNames
)

var politicalParties = {}
politicalParties[DemocraticParty.getID()] = DemocraticParty
politicalParties[RepublicanParty.getID()] = RepublicanParty
politicalParties[TossupParty.getID()] = TossupParty

politicalParties[LibertarianParty.getID()] = LibertarianParty
politicalParties[GreenParty.getID()] = GreenParty
politicalParties[ReformParty.getID()] = ReformParty
politicalParties[Independent2016EMParty.getID()] = Independent2016EMParty
politicalParties[Independent1980JAParty.getID()] = Independent1980JAParty


var politicalPartyIDs = [DemocraticParty.getID(), TossupParty.getID(), RepublicanParty.getID()]
