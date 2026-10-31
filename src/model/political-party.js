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

const TossupParty = new PoliticalParty(
  "Tossup",
  ["Tossup"],
  "Tossup",
  null,
  {current: "#6c6e74", safe: "#6c6e74", likely: "#6c6e74", lean: "#6c6e74", tilt: "#6c6e74"}
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
