var USAPresidentMapType = new MapType(
  "USA-President",
  "President",
  "P",
  "assets/usa-pres.png",
  "svg-sources/usa-presidential-map.svg",
  538,
  function(decade, regionID, regionData, isUpdatingMapText)
  {
    const splitStates = {"ME": ["ME-AL", "ME-D1", "ME-D2"], "NE": ["NE-AL", "NE-D1", "NE-D2", "NE-D3"]}
    if (splitStates[regionID] && regionEVArray[decade])
    {
      // determine if CDs exist in given state for that decade
      // if so, don't double count them when summing party totals
      if (regionEVArray[decade][splitStates[regionID][1]] >= 0 && !isUpdatingMapText) return this.getEV(decade, splitStates[regionID][0], displayRegionDataArray[regionID])
      
      return splitStates[regionID].reduce((total, regionID) => total + this.getEV(decade, regionID, displayRegionDataArray[regionID]), 0) // otherwise, sum state totals
    }
    if (currentMapSource.isCustom() && regionID in overrideRegionEVs) return overrideRegionEVs[regionID]
    if (currentMapSource.getShouldSetDisabledWorthToZero() && regionData && regionData.disabled) return 0
    return (regionEVArray[decade] || regionEVArray[2020])[regionID]
  },
  true,
  5,
  true,
  true,
  false,
  false,
  {"AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware","DC":"District of Columbia","FL":"Florida","GA":"Georgia","HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME-D1":"ME-1","ME-D2":"ME-2","ME-AL":"Maine","ME":"Maine","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana","NE-D1":"NE-1","NE-D2":"NE-2","NE-D3":"NE-3","NE-AL":"Nebraska","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming"},
  [],
  [
    {id: "presViewingType", title: "👁️ Viewing Type", type: MapSettingType.optionCycle, options:
      [
        {id: "popularVotes", title: "State Votes", value: false},
        {id: "electoralVotes", title: "Official EVs", value: true}
      ],
      shouldShowActive: (value) => {
        return value
      },
    defaultValue: "popularVotes", reloadType: MapSettingReloadType.custom, customReloadFunction: (value) => {
      currentViewingState = value ? ViewingState.splitVote : ViewingState.viewing
      if (showingDataMap)
      {
        displayDataMap()
      }
    }},
    {id: "evDecadeOverrideSelection", title: "🕰️ EV Decade", type: MapSettingType.optionCycle, options:
    Object.keys(regionEVArray).map((decade) => {
      return {id: decade, title: decade, value: parseInt(decade)}
    }),
    defaultValue: Object.keys(regionEVArray).reverse()[0], reloadType: MapSettingReloadType.display},
    {id: "evDecadeOverrideToggle", title: "☑️ Override Decade", type: MapSettingType.optionCycle, options:
      [
        {id: "enabled", title: "Enabled", value: true},
        {id: "disabled", title: "Disabled", value: false}
      ],
      shouldShowActive: (value) => {
        return value
      },
    defaultValue: "disabled", reloadType: MapSettingReloadType.display}
  ],
  () => {
    const partyCandiateLastNames = {2020: {"Biden":DemocraticParty.getID(), "Trump":RepublicanParty.getID()}, 2024: {"Harris":DemocraticParty.getID(), "Trump":RepublicanParty.getID(), "Kennedy":Independent2024RFKParty.getID()}}
    const partyCandiateFullNames = {2020: {"Joseph R. Biden Jr.":DemocraticParty.getID(), "Donald Trump":RepublicanParty.getID()}, 2024: {"Harris":DemocraticParty.getID(), "Trump":RepublicanParty.getID(), "Kennedy":Independent2024RFKParty.getID()}}

    const partyIDToCandidateLastNames = {2020: {}, 2024: {}}
    partyIDToCandidateLastNames[2020][DemocraticParty.getID()] = "Biden"
    partyIDToCandidateLastNames[2020][RepublicanParty.getID()] = "Trump"
    partyIDToCandidateLastNames[2024][DemocraticParty.getID()] = "Harris"
    partyIDToCandidateLastNames[2024][RepublicanParty.getID()] = "Trump"
    partyIDToCandidateLastNames[2024][Independent2024RFKParty.getID()] = "Kennedy"

    const currentCycleYear = 2024
    
    const countyToCityMap = {
      "RI": {"Bristol": ["Barrington","Bristol","Warren"],"Kent": ["Coventry","East Greenwich","Warwick","West Greenwich","West Warwick"],"Newport": ["Jamestown","Little Compton","Middletown","Newport","Portsmouth","Tiverton"],"Providence": ["Burrillville","Central Falls","Cranston","Cumberland","East Providence","Foster","Glocester","Johnston","Lincoln","North Providence","North Smithfield","Pawtucket","Providence","Scituate","Smithfield","Woonsocket"],"Washington": ["Charlestown","Exeter","Hopkinton","Narragansett","New Shoreham","North Kingstown","Richmond","South Kingstown","Westerly"]},
      "MA": {"Barnstable": ["Barnstable","Bourne","Brewster","Chatham","Dennis","Eastham","Falmouth","Harwich","Mashpee","Orleans","Provincetown","Sandwich","Truro","Wellfleet","Yarmouth"],"Berkshire": ["Adams","Alford","Becket","Cheshire","Clarksburg","Dalton","Egremont","Florida","Great Barrington","Hancock","Hinsdale","Lanesborough","Lee","Lenox","Monterey","Mount Washington","New Ashford","New Marlborough","North Adams","Otis","Peru","Pittsfield","Richmond","Sandisfield","Savoy","Sheffield","Stockbridge","Tyringham","Washington","West Stockbridge","Williamstown","Windsor"],"Bristol": ["Acushnet","Attleboro","Berkley","Dartmouth","Dighton","Easton","Fairhaven","Fall River","Freetown","Mansfield","New Bedford","North Attleborough","Norton","Raynham","Rehoboth","Seekonk","Somerset","Swansea","Taunton","Westport"],"Dukes": ["Aquinnah","Chilmark","Edgartown","Gosnold","Oak Bluffs","Tisbury","West Tisbury"],"Essex": ["Amesbury","Andover","Beverly","Boxford","Danvers","Essex","Georgetown","Gloucester","Groveland","Hamilton","Haverhill","Ipswich","Lawrence","Lynn","Lynnfield","Manchester","Marblehead","Merrimac","Methuen","Middleton","Nahant","Newbury","Newburyport","North Andover","Peabody","Rockport","Rowley","Salem","Salisbury","Saugus","Swampscott","Topsfield","Wenham","West Newbury"],"Franklin": ["Ashfield","Bernardston","Buckland","Charlemont","Colrain","Conway","Deerfield","Erving","Gill","Greenfield","Hawley","Heath","Leverett","Leyden","Monroe","Montague","New Salem","Northfield","Orange","Rowe","Shelburne","Shutesbury","Sunderland","Warwick","Wendell","Whately"],"Hampden": ["Agawam","Blandford","Brimfield","Chester","Chicopee","East Longmeadow","Granville","Hampden","Holland","Holyoke","Longmeadow","Ludlow","Monson","Montgomery","Palmer","Russell","Southwick","Springfield","Tolland","Wales","Westfield","West Springfield","Wilbraham"],"Hampshire": ["Amherst","Belchertown","Chesterfield","Cummington","Easthampton","Goshen","Granby","Hadley","Hatfield","Huntington","Middlefield","Northampton","Pelham","Plainfield","Southampton","South Hadley","Ware","Westhampton","Williamsburg","Worthington"],"Middlesex": ["Acton","Arlington","Ashby","Ashland","Ayer","Bedford","Belmont","Billerica","Boxborough","Burlington","Cambridge","Carlisle","Chelmsford","Concord","Dracut","Dunstable","Everett","Framingham","Groton","Holliston","Hopkinton","Hudson","Lexington","Lincoln","Littleton","Lowell","Malden","Marlborough","Maynard","Medford","Melrose","Natick","Newton","North Reading","Pepperell","Reading","Sherborn","Shirley","Somerville","Stoneham","Stow","Sudbury","Tewksbury","Townsend","Tyngsborough","Wakefield","Waltham","Watertown","Wayland","Westford","Weston","Wilmington","Winchester","Woburn"],"Nantucket": ["Nantucket"],"Norfolk": ["Avon","Bellingham","Braintree","Brookline","Canton","Cohasset","Dedham","Dover","Foxborough","Franklin","Holbrook","Medfield","Medway","Millis","Milton","Needham","Norfolk","Norwood","Plainville","Quincy","Randolph","Sharon","Stoughton","Walpole","Wellesley","Westwood","Weymouth","Wrentham"],"Plymouth": ["Abington","Bridgewater","Brockton","Carver","Duxbury","East Bridgewater","Halifax","Hanover","Hanson","Hingham","Hull","Kingston","Lakeville","Marion","Marshfield","Mattapoisett","Middleborough","Norwell","Pembroke","Plymouth","Plympton","Rochester","Rockland","Scituate","Wareham","West Bridgewater","Whitman"],"Suffolk": ["Boston","Chelsea","Revere","Winthrop"],"Worcester": ["Ashburnham","Athol","Auburn","Barre","Berlin","Blackstone","Bolton","Boylston","Brookfield","Charlton","Clinton","Douglas","Dudley","East Brookfield","Fitchburg","Gardner","Grafton","Hardwick","Harvard","Holden","Hopedale","Hubbardston","Lancaster","Leicester","Leominster","Lunenburg","Mendon","Milford","Millbury","Millville","New Braintree","Northborough","Northbridge","North Brookfield","Oakham","Oxford","Paxton","Petersham","Phillipston","Princeton","Royalston","Rutland","Shrewsbury","Southborough","Southbridge","Spencer","Sterling","Sturbridge","Sutton","Templeton","Upton","Uxbridge","Warren","Webster","Westborough","West Boylston","West Brookfield","Westminster","Winchendon","Worcester"]},
      "VT": {"Addison": ["Addison","Bridport","Bristol","Cornwall","Ferrisburg","Goshen","Granville","Hancock","Leicester","Lincoln","Middlebury","Monkton","New Haven","Orwell","Panton","Ripton","Salisbury","Shoreham","Starksboro","Vergennes","Waltham","Weybridge","Whiting"],"Bennington": ["Arlington","Bennington","Dorset","Glastenbury","Landgrove","Manchester","Peru","Pownal","Readsboro","Rupert","Sandgate","Searsburg","Shaftsbury","Stamford","Sunderland","Winhall","Woodford"],"Caledonia": ["Barnet","Burke","Danville","Groton","Hardwick","Kirby","Lyndon","Newark","Peacham","Ryegate","Sheffield","Stannard","St Johnsbury","Sutton","Walden","Waterford","Wheelock"],"Chittenden": ["Bolton","Buel s Gore","Burlington","Charlotte","Colchester","Essex","Essex Junction","Hinesburg","Huntington","Jericho","Milton","Richmond","Shelburne","South Burlington","St George","Underhill","Westford","Williston","Winooski"],"Essex": ["Averill","Avery s Gore","Bloomfield","Brighton","Brunswick","Canaan","Concord","East Haven","Ferdinand","Granby","Guildhall","Lemington","Lewis","Lunenburg","Maidstone","Norton","Victory","Warner s Grant","Warren s Gore"],"Franklin": ["Bakersfield","Berkshire","Enosburgh","Fairfax","Fairfield","Fletcher","Franklin","Georgia","Highgate","Montgomery","Richford","Sheldon","St Albans","St Albans Town","Swanton"],"Grand Isle": ["Alburgh","Grand Isle","Isle La Motte","North Hero","South Hero"],"Lamoille": ["Belvidere","Cambridge","Eden","Elmore","Hyde Park","Johnson","Morristown","Stowe","Waterville","Wolcott"],"Orange": ["Bradford","Braintree","Brookfield","Chelsea","Corinth","Fairlee","Newbury","Orange","Randolph","Strafford","Thetford","Topsham","Tunbridge","Vershire","Washington","West Fairlee","Williamstown"],"Orleans": ["Albany","Barton","Brownington","Charleston","Coventry","Craftsbury","Derby","Glover","Greensboro","Holland","Irasburg","Jay","Lowell","Morgan","Newport","Newport Town","Troy","Westfield","Westmore"],"Rutland": ["Benson","Brandon","Castleton","Chittenden","Clarendon","Danby","Fair Haven","Hubbardton","Ira","Killington","Mendon","Middletown Springs","Mount Holly","Mount Tabor","Pawlet","Pittsfield","Pittsford","Poultney","Proctor","Rutland","Rutland Town","Shrewsbury","Sudbury","Tinmouth","Wallingford","Wells","West Haven","West Rutland"],"Washington": ["Barre","Barre Town","Berlin","Cabot","Calais","Duxbury","East Montpelier","Fayston","Marshfield","Middlesex","Montpelier","Moretown","Northfield","Plainfield","Roxbury","Waitsfield","Warren","Waterbury","Woodbury","Worcester"],"Windham": ["Athens","Brattleboro","Brookline","Dover","Dummerston","Grafton","Guilford","Halifax","Jamaica","Londonderry","Marlboro","Newfane","Putney","Rockingham","Somerset","Stratton","Townshend","Vernon","Wardsboro","Westminster","Whitingham","Wilmington","Windham"],"Windsor": ["Andover","Baltimore","Barnard","Bethel","Bridgewater","Cavendish","Chester","Hartford","Hartland","Ludlow","Norwich","Plymouth","Pomfret","Reading","Rochester","Royalton","Sharon","Springfield","Stockbridge","Weathersfield","Weston","West Windsor","Windsor","Woodstock"]},
      "NH": {"Belknap": ["Alton","Barnstead","Belmont","Center Harbor","Gilford","Gilmanton","Laconia","Meredith","New Hampton","Sanbornton","Tilton"],"Carroll": ["Albany","Bartlett","Brookfield","Chatham","Conway","Eaton","Effingham","Freedom","Hale s Location","Hart s Location","Jackson","Madison","Moultonborough","Ossipee","Sandwich","Tamworth","Tuftonboro","Wakefield","Wolfeboro"],"Cheshire": ["Alstead","Chesterfield","Dublin","Fitzwilliam","Gilsum","Harrisville","Hinsdale","Jaffrey","Keene","Marlborough","Marlow","Nelson","Richmond","Rindge","Roxbury","Stoddard","Sullivan","Surry","Swanzey","Troy","Walpole","Westmoreland","Winchester"],"Coos": ["Atkinson and Gilmanton Academy Grant","Bean s Grant","Bean s Purchase","Berlin","Cambridge","Carroll","Chandler s Purchase","Clarksville","Colebrook","Columbia","Crawford s Purchase","Cutt s Grant","Dalton","Dix s Grant","Dixville","Dummer","Errol","Erving s Location","Gorham","Green s Grant","Hadley s Purchase","Jefferson","Kilkenny","Lancaster","Low and Burbank s Grant","Martin s Location","Milan","Millsfield","Northumberland","Odell","Pinkhams Grant","Pittsburg","Randolph","Sargent s Purchase","Second College Grant","Shelburne","Stark","Stewartstown","Stratford","Success","Thompson and Meserve s Purchase","Wentworth s Location","Whitefield"],"Grafton": ["Alexandria","Ashland","Bath","Benton","Bethlehem","Bridgewater","Bristol","Campton","Canaan","Dorchester","Easton","Ellsworth","Enfield","Franconia","Grafton","Groton","Hanover","Haverhill","Hebron","Holderness","Landaff","Lebanon","Lincoln","Lisbon","Littleton","Livermore","Lyman","Lyme","Monroe","Orange","Orford","Piermont","Plymouth","Rumney","Sugar Hill","Thornton","Warren","Waterville","Wentworth","Woodstock"],"Hillsborough": ["Amherst","Antrim","Bedford","Bennington","Brookline","Deering","Francestown","Goffstown","Greenfield","Greenville","Hancock","Hillsborough","Hollis","Hudson","Litchfield","Lyndeborough","Manchester","Mason","Merrimack","Milford","Mont Vernon","Nashua","New Boston","New Ipswich","Pelham","Peterborough","Sharon","Temple","Weare","Wilton","Windsor"],"Merrimack": ["Allenstown","Andover","Boscawen","Bow","Bradford","Canterbury","Chichester","Concord","Danbury","Dunbarton","Epsom","Franklin","Henniker","Hill","Hooksett","Hopkinton","Loudon","Newbury","New London","Northfield","Pembroke","Pittsfield","Salisbury","Sutton","Warner","Webster","Wilmot"],"Rockingham": ["Atkinson","Auburn","Brentwood","Candia","Chester","Danville","Deerfield","Derry","East Kingston","Epping","Exeter","Fremont","Greenland","Hampstead","Hampton","Hampton Falls","Kensington","Kingston","Londonderry","New Castle","Newfields","Newington","Newmarket","Newton","North Hampton","Northwood","Nottingham","Plaistow","Portsmouth","Raymond","Rye","Salem","Sandown","Seabrook","South Hampton","Stratham","Windham"],"Strafford": ["Barrington","Dover","Durham","Farmington","Lee","Madbury","Middleton","Milton","New Durham","Rochester","Rollinsford","Somersworth","Strafford"],"Sullivan": ["Acworth","Charlestown","Claremont","Cornish","Croydon","Goshen","Grantham","Langdon","Lempster","Newport","Plainfield","Springfield","Sunapee","Unity","Washington"]},
      "ME": {"Androscoggin": ["Auburn","Durham","Greene","Leeds","Lewiston","Lisbon","Livermore","Livermore Falls","Mechanic Falls","Minot","Poland","Sabattus","Turner","Wales"],"Aroostook": ["Allagash","Amity","Ashland","Bancroft","Blaine","Bridgewater","Caribou","Castle Hill","Caswell","Central Aroostook","Chapman","Connor","Crystal","Cyr Plt","Dyer Brook","Eagle Lake","Easton","Fort Fairfield","Fort Kent","Frenchville","Garfield Plt","Glenwood Plt","Grand Isle","Hamlin","Hammond","Haynesville","Hersey","Hodgdon","Houlton","Island Falls","Limestone","Linneus","Littleton","Ludlow","Macwahoc Plt","Madawaska","Mapleton","Mars Hill","Masardis","Merrill","Monticello","Moro Plt","Nashville Plt","New Canada","New Limerick","New Sweden","Northwest Aroostook","Oakfield","Orient","Penobscot Indian Island Reservation","Perham","Portage Lake","Presque Isle","Reed Plt","Sherman","Smyrna","South Aroostook","Square Lake","St Agatha","St Francis","St John Plt","Stockholm","Van Buren","Wade","Wallagrass","Washburn","Westfield","Westmanland","Weston","Winterville Plt","Woodland", "Aroostook Cty Townships", "Cary Plt", "Oxbow Plt"],"Cumberland": ["Baldwin","Bridgton","Brunswick","Cape Elizabeth","Casco","Chebeague Island","Cumberland","Falmouth","Freeport","Frye Island","Gorham","Gray","Harpswell","Harrison","Long Island","Naples","New Gloucester","North Yarmouth","Portland","Pownal","Raymond","Scarborough","Sebago","South Portland","Standish","Westbrook","Windham","Yarmouth"],"Franklin": ["Avon","Carrabassett Valley","Carthage","Chesterville","Coplin Plt","Dallas Plt","East Central Franklin","Eustis","Farmington","Industry","Jay","Kingfield","New Sharon","New Vineyard","North Franklin","Phillips","Rangeley","Rangeley Plt","Sandy River Plt","South Franklin","Strong","Temple","Weld","West Central Franklin","Wilton","Wyman"],"Hancock": ["Amherst","Aurora","Bar Harbor","Blue Hill","Brooklin","Brooksville","Bucksport","Castine","Central Hancock","Cranberry Isles","Dedham","Deer Isle","Eastbrook","East Hancock","Ellsworth","Franklin","Frenchboro","Gouldsboro","Great Pond","Hancock","Lamoine","Mariaville","Marshall Island","Mount Desert","Northwest Hancock","Orland","Osborn","Otis","Penobscot","Sedgwick","Sorrento","Southwest Harbor","Stonington","Sullivan","Surry","Swan s Island","Tremont","Trenton","Verona","Waltham","Winter Harbor", "Franklin Cty Townships", "Hancock Cty Townships"],"Kennebec": ["Albion","Augusta","Belgrade","Benton","Chelsea","China","Clinton","Farmingdale","Fayette","Gardiner","Hallowell","Litchfield","Manchester","Monmouth","Mount Vernon","Oakland","Pittston","Randolph","Readfield","Rome","Sidney","Unity","Vassalboro","Vienna","Waterville","Wayne","West Gardiner","Windsor","Winslow","Winthrop"],"Knox": ["Appleton","Camden","Criehaven","Cushing","Friendship","Hope","Isle Au Haut","Matinicus Isle Plt","Muscle Ridge Islands","North Haven","Owl s Head","Rockland","Rockport","South Thomaston","St George","Thomaston","Union","Vinalhaven","Warren","Washington","Washington Cty Townships"],"Lincoln": ["Alna","Boothbay","Boothbay Harbor","Bremen","Bristol","Damariscotta","Dresden","Edgecomb","Hibbert s Gore","Jefferson","Louds Island","Monhegan Plt","Newcastle","Nobleboro","Somerville","South Bristol","Southport","Waldoboro","Westport","Whitefield","Wiscasset"],"Oxford": ["Andover","Bethel","Brownfield","Buckfield","Byron","Canton","Denmark","Dixfield","Fryeburg","Gilead","Greenwood","Hanover","Hartford","Hebron","Hiram","Lincoln Plt","Lovell","Mexico","Milton","Newry","North Oxford","Norway","Otisfield","Oxford","Paris","Peru","Porter","Roxbury","Rumford","South Oxford","Stoneham","Stow","Sumner","Sweden","Upton","Waterford","West Paris","Woodstock", "Magalloway Plt", "Oxford Cty Townships"],"Penobscot": ["Alton","Argyle","Bangor","Bradford","Bradley","Brewer","Burlington","Carmel","Carroll Plt","Charleston","Chester","Clifton","Corinna","Corinth","Dexter","Dixmont","Drew Plt","East Central Penobscot","East Millinocket","Eddington","Edinburg","Enfield","Etna","Exeter","Garland","Glenburn","Greenbush","Hampden","Hermon","Holden","Howland","Hudson","Kenduskeag","Kingman","LaGrange","Lakeville","Lee","Levant","Lincoln","Lowell","Mattawamkeag","Maxfield","Medway","Milford","Millinocket","Mount Chase","Newburgh","Newport","North Penobscot","Old Town","Orono","Orrington","Passadumkeag","Patten","Penobscot Indian Island Reservation","Plymouth","Prentiss","Seboeis Plt","Springfield","Stacyville","Stetson","Twombly Ridge","Veazie","Webster Plt","Whitney","Winn","Woodville", "Penobscot Cty Townships", "Penobscot Nation Vot Dst"],"Piscataquis": ["Abbot","Beaver Cove","Blanchard","Bowerbank","Brownville","Dover-Foxcroft","Greenville","Guilford","Kingsbury Plt","Lake View Plt","Medford","Milo","Monson","Northeast Piscataquis","Northwest Piscataquis","Parkman","Sangerville","Sebec","Shirley","Southeast Piscataquis","Wellington","Willimantic","Atkinson", "Piscataquis Cty Townships"],"Sagadahoc": ["Arrowsic","Bath","Bowdoin","Bowdoinham","Georgetown","Perkins","Phippsburg","Richmond","Topsham","West Bath","Woolwich"],"Somerset": ["Anson","Athens","Bingham","Brighton Plt","Cambridge","Canaan","Caratunk","Central Somerset","Cornville","Dennistown Plt","Detroit","Embden","Fairfield","Harmony","Hartland","Highland Plt","Jackman","Madison","Mercer","Moose River","Moscow","New Portland","Norridgewock","Northeast Somerset","Northwest Somerset","Palmyra","Pittsfield","Pleasant Ridge Plt","Ripley","Seboomook Lake","Skowhegan","Smithfield","Solon","St Albans","Starks","The Forks Plt","West Forks Plt", "Somerset Cty Townships"],"Waldo": ["Belfast","Belmont","Brooks","Burnham","Frankfort","Freedom","Islesboro","Jackson","Knox","Liberty","Lincolnville","Monroe","Montville","Morrill","Northport","Palermo","Prospect","Searsmont","Searsport","Stockton Springs","Swanville","Thorndike","Troy","Unity","Waldo","Winterport"],"Washington": ["Addison","Alexander","Baileyville","Baring Plt","Beals","Beddington","Calais","Charlotte","Cherryfield","Codyville Plt","Columbia","Columbia Falls","Cooper","Crawford","Cutler","Danforth","Deblois","Dennysville","East Central Washington","East Machias","Eastport","Grand Lake Stream Plt","Harrington","Jonesboro","Jonesport","Lubec","Machias","Machiasport","Marshfield","Meddybemps","Milbridge","Northfield","North Washington","Passamaquoddy Indian Township Reservation","Passamaquoddy Pleasant Point Reservation","Pembroke","Perry","Princeton","Robbinston","Roque Bluffs","Steuben","Talmadge","Topsfield","Vanceboro","Waite","Wesley","Whiting","Whitneyville", "Pleasant Point Votng Dst", "Indian Township Vtng Dst"],"York": ["Acton","Alfred","Arundel","Berwick","Biddeford","Buxton","Cornish","Dayton","Eliot","Hollis","Kennebunk","Kennebunkport","Kittery","Lebanon","Limerick","Limington","Lyman","Newfield","North Berwick","Ogunquit","Old Orchard Beach","Parsonsfield","Saco","Sanford","Shapleigh","South Berwick","Waterboro","Wells","York"]},
      "CT": {"Fairfield":["Bethel","Bridgeport","Brookfield","Danbury","Darien","Easton","Fairfield","Greenwich","Monroe","New Canaan","New Fairfield","Newtown","Norwalk","Redding","Ridgefield","Shelton","Sherman","Stamford","Stratford","Trumbull","Weston","Westport","Wilton"],"Hartford":["Avon","Berlin","Bloomfield","Bristol","Burlington","Canton","East Granby","East Hartford","East Windsor","Enfield","Farmington","Glastonbury","Granby","Hartford","Hartland","Manchester","Marlborough","New Britain","Newington","Plainville","Rocky Hill","Simsbury","Southington","South Windsor","Suffield","West Hartford","Wethersfield","Windsor","Windsor Locks"],"Litchfield":["Barkhamsted","Bethlehem","Bridgewater","Canaan","Colebrook","Cornwall","Goshen","Harwinton","Kent","Litchfield","Morris","New Hartford","New Milford","Norfolk","North Canaan","Plymouth","Roxbury","Salisbury","Sharon","Thomaston","Torrington","Warren","Washington","Watertown","Winchester","Woodbury"],"Middlesex":["Chester","Clinton","Cromwell","Deep River","Durham","East Haddam","East Hampton","Essex","Haddam","Killingworth","Middlefield","Middletown","Old Saybrook","Portland","Westbrook"],"New Haven":["Ansonia","Beacon Falls","Bethany","Branford","Cheshire","Derby","East Haven","Guilford","Hamden","Madison","Meriden","Middlebury","Milford","Naugatuck","New Haven","North Branford","North Haven","Orange","Oxford","Prospect","Seymour","Southbury","Wallingford","Waterbury","West Haven","Wolcott","Woodbridge"],"New London":["Bozrah","Colchester","East Lyme","Franklin","Griswold","Groton","Lebanon","Ledyard","Lisbon","Lyme","Montville","New London","North Stonington","Norwich","Old Lyme","Preston","Salem","Sprague","Stonington","Voluntown","Waterford"],"Tolland":["Andover","Bolton","Columbia","Coventry","Ellington","Hebron","Mansfield","Somers","Stafford","Tolland","Union","Vernon","Willington"],"Windham":["Ashford","Brooklyn","Canterbury","Chaplin","Eastford","Hampton","Killingly","Plainfield","Pomfret","Putnam","Scotland","Sterling","Thompson","Windham","Woodstock"]},
      "MO": {"Jackson":["Jackson","Kansas City"]}
    }

    var singleLineMarginFilterFunction = function(rawMapData, mapDates, columnMap, cycleYear, candidateNameToPartyIDMap, regionNameToID)
    {
      var filteredMapData = {}

      for (var dateNum in mapDates)
      {
        var rawDateData = rawMapData[mapDates[dateNum]]
        var filteredDateData = {}

        var regionNames = Object.keys(regionNameToID)
        for (var regionNum in regionNames)
        {
          var regionToFind = regionNames[regionNum]
          var regionRow = rawDateData.find(row => (row[columnMap.region] == regionToFind))

          var margin = columnMap.margin ? parseFloat(regionRow[columnMap.margin]) : null

          if (margin == null && columnMap.percentIncumbent && columnMap.percentChallenger)
          {
            margin = parseFloat(regionRow[columnMap.percentIncumbent]) - parseFloat(regionRow[columnMap.percentChallenger])
          }

          var winChance = columnMap.winChance ? parseFloat(regionRow[columnMap.winChance]) : null

          var incumbentWinChance
          var challengerWinChance

          if (winChance)
          {
            if (Math.sign(margin) == -1)
            {
              challengerWinChance = winChance
              incumbentWinChance = 100-winChance
            }
            else
            {
              challengerWinChance = 100-winChance
              incumbentWinChance = winChance
            }
          }
          else
          {
            incumbentWinChance = columnMap.incumbentWinChance ? regionRow[columnMap.incumbentWinChance] : null
            challengerWinChance = columnMap.challengerWinChance ? regionRow[columnMap.challengerWinChance] : null
          }

          var greaterMarginPartyID = (Math.sign(margin) == 0 ? null : (Math.sign(margin) == -1 ? incumbentChallengerPartyIDs.challenger : incumbentChallengerPartyIDs.incumbent))

          var partyIDToCandidateNames = {}
          for (var partyCandidateName in candidateNameToPartyIDMap)
          {
            partyIDToCandidateNames[candidateNameToPartyIDMap[partyCandidateName]] = partyCandidateName
          }

          filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], margin: Math.abs(margin), partyID: greaterMarginPartyID, candidateName: partyIDToCandidateLastNames[cycleYear][greaterMarginPartyID], candidateMap: partyIDToCandidateNames, chanceIncumbent: incumbentWinChance, chanceChallenger: challengerWinChance}
        }

        filteredMapData[mapDates[dateNum]] = filteredDateData
      }

      return {mapData: filteredMapData}
    }

    var doubleLineMarginFilterFunction = function(rawMapData, mapDates, columnMap, cycleYear, candidateNameToPartyIDMap, regionNameToID, heldRegionMap, shouldFilterOutDuplicateRows)
    {
      var filteredMapData = {}
      var candidateNameData = {}

      for (var dateNum in mapDates)
      {
        var rawDateData = rawMapData[mapDates[dateNum]]
        var filteredDateData = {}

        var currentMapDate = new Date(mapDates[dateNum])

        var regionNames = Object.keys(regionNameToID)
        for (var regionNum in regionNames)
        {
          var regionToFind = regionNames[regionNum]

          var isMultipleElections = false
          var candidateArrayToTest = Object.keys(candidateNameToPartyIDMap)
          if (candidateArrayToTest.includes(currentMapDate.getFullYear().toString()))
          {
            isMultipleElections = true
            candidateArrayToTest = Object.keys(candidateNameToPartyIDMap[currentMapDate.getFullYear()])
          }

          var mapDataRows = rawDateData.filter(row => {
            return row[columnMap.region] == regionToFind && candidateArrayToTest.includes(row[columnMap.candidateName])
          })

          if (shouldFilterOutDuplicateRows)
          {
            // cuz JHK is stupid for a third time and has duplicate rows sometimes
            mapDataRows = mapDataRows.filter((row1, index, self) =>
              index === self.findIndex((row2) => (
                row1[columnMap.candidateName] === row2[columnMap.candidateName]
              ))
            )
          }

          var marginSum = 0
          if (mapDataRows.length <= 0 && heldRegionMap)
          {
            marginSum = heldRegionMap[regionNameToID[regionToFind]] == incumbentChallengerPartyIDs.challenger ? -100 : 100
          }

          var incumbentWinChance
          var challengerWinChance

          var partyVotesharePercentages = null

          for (var rowNum in mapDataRows)
          {
            var partyID = candidateNameToPartyIDMap[mapDataRows[rowNum][columnMap.candidateName]]
            if (Object.keys(candidateNameToPartyIDMap).includes(currentMapDate.getFullYear().toString()))
            {
              partyID = candidateNameToPartyIDMap[currentMapDate.getFullYear().toString()][mapDataRows[rowNum][columnMap.candidateName]]
            }

            if (mapDataRows[rowNum][columnMap.percentAdjusted] >= 1)
            {
              if (partyVotesharePercentages == null)
              {
                partyVotesharePercentages = []
              }
              partyVotesharePercentages.push({partyID: partyID, candidate: mapDataRows[rowNum][columnMap.candidateName], voteshare: mapDataRows[rowNum][columnMap.percentAdjusted]})
            }

            if (!(mapDates[dateNum] in candidateNameData))
            {
              candidateNameData[mapDates[dateNum]] = {}
            }
            if (!(partyID in candidateNameData[mapDates[dateNum]]))
            {
              var candidateNameToAdd
              if ("partyCandidateName" in columnMap)
              {
                candidateNameToAdd = mapDataRows[rowNum][columnMap.partyCandidateName]
              }
              else
              {
                candidateNameToAdd = mapDataRows[rowNum][columnMap.candidateName]
              }
              candidateNameData[mapDates[dateNum]][partyID] = candidateNameToAdd
            }

            if (partyID == incumbentChallengerPartyIDs.incumbent)
            {
              marginSum += parseFloat(mapDataRows[rowNum][columnMap.percentAdjusted])
              incumbentWinChance = columnMap.winChance ? mapDataRows[rowNum][columnMap.winChance] : null
            }
            else if (partyID == incumbentChallengerPartyIDs.challenger)
            {
              marginSum -= parseFloat(mapDataRows[rowNum][columnMap.percentAdjusted])
              challengerWinChance = columnMap.winChance ? mapDataRows[rowNum][columnMap.winChance] : null
            }
          }

          // if (marginSum == 0 && heldRegionMap) //cuz JHK is stupid and made pollAvg = 0 if there are no polls with no any other indication of such fact
          // {
          //   marginSum = heldRegionMap[regionNameToID[regionToFind]] == partyIDs.challenger ? -100 : 100
          // }

          //cuz JHK is stupid again and used % chances as 100x the size they should be instead of putting them in decimal form like everyone else does it
          challengerWinChance = (incumbentWinChance > 1 || challengerWinChance > 1) ? challengerWinChance/100 : challengerWinChance
          incumbentWinChance = (incumbentWinChance > 1 || challengerWinChance > 1) ? incumbentWinChance/100 : incumbentWinChance

          var greaterMarginPartyID = incumbentChallengerPartyIDs.tossup
          if (Math.sign(marginSum) == -1)
          {
            greaterMarginPartyID = incumbentChallengerPartyIDs.challenger
          }
          else if (Math.sign(marginSum) == 1)
          {
            greaterMarginPartyID = incumbentChallengerPartyIDs.incumbent
          }

          var compactPartyVotesharePercentages
          if (partyVotesharePercentages && marginSum != 0)
          {
            compactPartyVotesharePercentages = []
            partyVotesharePercentages.forEach(voteData => {
              var compactVoteDataIndex
              var compactVoteData = compactPartyVotesharePercentages.find((compactVoteData, index) => {
                if (compactVoteData.candidate == voteData.candidate)
                {
                  compactVoteDataIndex = index
                  return true
                }
                return false
              })
              if (compactVoteData)
              {
                compactVoteData.voteshare = parseInt(compactVoteData.voteshare)+parseInt(voteData.voteshare)
                compactPartyVotesharePercentages[compactVoteDataIndex] = compactVoteData
              }
              else
              {
                compactPartyVotesharePercentages.push(voteData)
              }
            })

            compactPartyVotesharePercentages.sort((voteData1, voteData2) => {
              return voteData2.voteshare - voteData1.voteshare
            })

            marginSum = compactPartyVotesharePercentages[0].voteshare - (compactPartyVotesharePercentages[1] || {voteshare: 0.0}).voteshare
            greaterMarginPartyID = compactPartyVotesharePercentages[0].partyID
          }

          var candidateName
          var candidateNameArray = electionYearToCandidateData[cycleYear || currentMapDate.getFullYear().toString()]
          if (candidateNameArray)
          {
            candidateName = getKeyByValue(candidateNameArray, greaterMarginPartyID)
          }

          var thisElectionCandidateNameToPartyIDMap = isMultipleElections ? candidateNameToPartyIDMap[currentMapDate.getFullYear()] : candidateNameToPartyIDMap
          var partyIDToCandidateNames = {}
          for (var partyCandidateName in thisElectionCandidateNameToPartyIDMap)
          {
            partyIDToCandidateNames[thisElectionCandidateNameToPartyIDMap[partyCandidateName]] = partyCandidateName
          }

          filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], margin: Math.abs(marginSum), partyID: greaterMarginPartyID, candidateName: candidateName, candidateMap: partyIDToCandidateNames, chanceIncumbent: incumbentWinChance, chanceChallenger: challengerWinChance, partyVotesharePercentages: compactPartyVotesharePercentages}
        }

        filteredMapData[mapDates[dateNum]] = filteredDateData
      }

      return {mapData: filteredMapData, candidateNameData: candidateNameData}
    }

    var doubleLineVoteshareFilterFunction = function(rawMapData, mapDates, columnMap, _, candidateNameToPartyIDMap, regionNameToID, __, ____, isCustomMap, voteshareCutoffMargin, shouldIncludeVoteshare)
    {
      var filteredMapData = {}
      var partyNameData = {}

      var regionNames = Object.keys(regionNameToID)

      for (var dateNum in mapDates)
      {
        var rawDateData = rawMapData[mapDates[dateNum]]
        var filteredDateData = {}

        var currentMapDate = new Date(mapDates[dateNum])
        var currentDatePartyNameArray = {}

        for (var regionNum in regionNames)
        {
          var regionToFind = regionNames[regionNum]

          var mapDataRows = rawDateData.filter(row => {
            return row[columnMap.region] == regionToFind
          })

          if (mapDataRows.length == 0)
          {
            let partyIDToCandidateNames = invertObject(candidateNameToPartyIDMap)
            if (isCustomMap)
            {
              filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], margin: 0, partyID: TossupParty.getID(), candidateMap: partyIDToCandidateNames}
            }
            else
            {
              filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], margin: 0, partyID: TossupParty.getID(), disabled: true, candidateMap: partyIDToCandidateNames}
            }
            continue
          }

          var candidateData = {}

          var currentCandidateToPartyIDMap = candidateNameToPartyIDMap
          if (Object.keys(currentCandidateToPartyIDMap).includes(currentMapDate.getFullYear().toString()))
          {
            currentCandidateToPartyIDMap = currentCandidateToPartyIDMap[currentMapDate.getFullYear()]
          }

          for (var rowNum in mapDataRows)
          {
            var row = mapDataRows[rowNum]

            var candidateName = row[columnMap.candidateName]
            var currentPartyName = row[columnMap.partyID]
            var currentVoteshare = parseFloat(row[columnMap.percentAdjusted])
            var currentCandidateVotes = row[columnMap.candidateVotes] ? parseInt(row[columnMap.candidateVotes]) : null
            var currentElectoralVotes = row[columnMap.electoralVotes] ? parseInt(row[columnMap.electoralVotes]) : null
            var currentOrder = row[columnMap.order] ? parseInt(row[columnMap.order]) : null

            var foundParty = currentCandidateToPartyIDMap[candidateName] ? politicalParties[currentCandidateToPartyIDMap[candidateName]] : null

            if (!foundParty)
            {
              foundParty = Object.values(politicalParties).find(party => {
                var partyNames = cloneObject(party.getNames())
                for (var nameNum in partyNames)
                {
                  partyNames[nameNum] = partyNames[nameNum].toLowerCase()
                }
                return partyNames.includes(currentPartyName)
              })
            }

            if (!foundParty && Object.keys(politicalParties).includes(currentPartyName))
            {
              foundParty = politicalParties[currentPartyName]
            }

            if (!foundParty || foundParty.getID() == IndependentGenericParty.getID())
            {
              var foundPartyID = majorThirdPartyCandidates.find(partyID => {
                return politicalParties[partyID].getDefaultCandidateName() == candidateName
              })
              foundParty = politicalParties[foundPartyID]
            }

            var currentPartyID
            if (foundParty)
            {
              currentPartyID = foundParty.getID()
            }
            else
            {
              currentPartyID = IndependentGenericParty.getID()
            }

            if (Object.keys(candidateData).includes(candidateName))
            {
              if (currentVoteshare > candidateData[candidateName].voteshare)
              {
                candidateData[candidateName].partyID = currentPartyID
              }

              candidateData[candidateName].voteshare += currentVoteshare
              if (currentCandidateVotes != null)
              {
                if (!candidateData[candidateName].votes) candidateData[candidateName].votes = 0
                candidateData[candidateName].votes += currentCandidateVotes
              }
              if (candidateData[candidateName].electoralVotes != null)
              {
                candidateData[candidateName].electoralVotes += currentElectoralVotes ? currentElectoralVotes : 0
              }
            }
            else
            {
              candidateData[candidateName] = {candidate: candidateName, partyID: currentPartyID, voteshare: currentVoteshare, votes: currentCandidateVotes, electoralVotes: currentElectoralVotes, order: currentOrder}
            }
          }

          var voteshareSortedCandidateData = Object.values(candidateData).map(singleCandidateData => {
            return {candidate: singleCandidateData.candidate, partyID: singleCandidateData.partyID, voteshare: singleCandidateData.voteshare, votes: singleCandidateData.votes, order: singleCandidateData.order}
          })
          voteshareSortedCandidateData = voteshareSortedCandidateData.filter((candData) => !isNaN(candData.voteshare))
          voteshareSortedCandidateData.sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
          if (!isCustomMap && voteshareCutoffMargin != null)
          {
            voteshareSortedCandidateData = voteshareSortedCandidateData.filter(candData => candData.voteshare >= voteshareCutoffMargin)
          }

          if (voteshareSortedCandidateData.length == 0)
          {
            console.log("No candidate data!", currentMapDate.getFullYear().toString(), regionToFind)
            continue
          }

          var electoralVoteSortedCandidateData = Object.values(candidateData).map(singleCandidateData => {
            return {candidate: singleCandidateData.candidate, partyID: singleCandidateData.partyID, votes: singleCandidateData.electoralVotes}
          }).filter(candVotes => candVotes.votes != null)
          electoralVoteSortedCandidateData.sort((cand1, cand2) => cand2.votes - cand1.votes)

          var greatestMarginPartyID
          var greatestMarginCandidateName
          var topTwoMargin

          if (voteshareSortedCandidateData[0].voteshare != 0)
          {
            let topCandidateData = voteshareSortedCandidateData.filter(candidateData => candidateData.order == 0 || candidateData.order == 1).sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
            if (topCandidateData.length == 0)
            {
              topCandidateData = [voteshareSortedCandidateData[0]]
              if (voteshareSortedCandidateData[1])
              {
                topCandidateData.push(voteshareSortedCandidateData[1])
              }
            }

            greatestMarginPartyID = topCandidateData[0].partyID
            greatestMarginCandidateName = topCandidateData[0].candidate
            topTwoMargin = topCandidateData[0].voteshare - (topCandidateData[1] ? topCandidateData[1].voteshare : 0)
          }
          else
          {
            greatestMarginPartyID = TossupParty.getID()
            greatestMarginCandidateName = null
            topTwoMargin = 0
          }

          for (var candidateDataNum in voteshareSortedCandidateData)
          {
            var mainPartyID = voteshareSortedCandidateData[candidateDataNum].partyID
            if (!Object.keys(partyNameData).includes(mainPartyID) && mainPartyID != IndependentGenericParty.getID())
            {
              currentDatePartyNameArray[mainPartyID] = voteshareSortedCandidateData[candidateDataNum].candidate
            }
          }

          var partyIDToCandidateNames = {}
          for (let partyCandidateName in candidateData)
          {
            partyIDToCandidateNames[candidateData[partyCandidateName].partyID] = partyCandidateName
          }

          for (let candidateElectoralVote of electoralVoteSortedCandidateData)
          {
            if (candidateElectoralVote.partyID == IndependentGenericParty.getID()) { continue }
            currentDatePartyNameArray[candidateElectoralVote.partyID] = candidateElectoralVote.candidate
          }

          var mostRecentParty = mostRecentWinner(filteredMapData, currentMapDate.getTime(), regionNameToID[regionToFind])
          filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, disabled: mapDataRows[0][columnMap.disabled] == "TRUE", candidateMap: partyIDToCandidateNames, partyVotesharePercentages: shouldIncludeVoteshare ? voteshareSortedCandidateData : null, voteSplits: electoralVoteSortedCandidateData, flip: mapDataRows[0][columnMap.flip] == "TRUE" || (mostRecentParty != greatestMarginPartyID && mostRecentParty != TossupParty.getID())}
        }

        filteredMapData[mapDates[dateNum]] = filteredDateData
        partyNameData[mapDates[dateNum]] = currentDatePartyNameArray
      }

      return {mapData: filteredMapData, candidateNameData: partyNameData, mapDates: mapDates}
    }
    
    var jsonVoteshareCNNFilterFunction = function(rawMapData, _, columnMap, __, ___, regionNameToID, heldRegionMap, ____, _____, voteshareCutoffMargin, ______, useCountyIDs = false)
    {
      let racesToIgnore = []
      let candidateExceptions = {"None of these candidates": "None"}
      let overrideRegionMap = {"NE": "NE-AL", "ME": "ME-AL"}
      
      let overrideCountyMap = {
        "DeBaca": "De_Baca",
        "LeFlore": "Le_Flore",
        "St. Louis": "Saint_Louis",
        "Jackson Suburbs": "Jackson",
        "LaClede": "Laclede",
        "St. Louis County": "St_Louis_County",
        "LaRue": "Larue",
        "Manhattan": {value: "New_York", state: "NY"},
        "Brooklyn": {value: "Kings", state: "NY"},
        "Staten Island": "Richmond",
        "Franklin County": "Franklin_Co",
        "Fairfax County": "Fairfax_Co",
        "Fairfax City": "Fairfax",
        "Richmond County": "Richmond_Co",
        "Richmond City": "Richmond",
        "Roanoke County": "Roanoke_Co",
        "Roanoke City": "Roanoke",
      }
      
      let overrideRawRegionData = [
        {[columnMap.region]: "NE-D1", [columnMap.totalVotes]: 317605, [columnMap.reportingPercent]: "--", [columnMap.candidates]: [
          {[columnMap.candidateName]: "Trump", [columnMap.partyID]: RepublicanParty.getID(), [columnMap.candidateVotes]: 177266},
          {[columnMap.candidateName]: "Harris", [columnMap.partyID]: DemocraticParty.getID(), [columnMap.candidateVotes]: 135869},
          {[columnMap.candidateName]: "Oliver", [columnMap.partyID]: LibertarianParty.getID(), [columnMap.candidateVotes]: 2412},
          {[columnMap.candidateName]: "West", [columnMap.partyID]: IndependentGenericParty.getID(), [columnMap.candidateVotes]: 1049},
          {[columnMap.candidateName]: "Stein", [columnMap.partyID]: GreenParty.getID(), [columnMap.candidateVotes]: 1009},
        ]},
        {[columnMap.region]: "NE-D2", [columnMap.totalVotes]: 315939, [columnMap.reportingPercent]: "--", [columnMap.candidates]: [
          {[columnMap.candidateName]: "Harris", [columnMap.partyID]: DemocraticParty.getID(), [columnMap.candidateVotes]: 163214},
          {[columnMap.candidateName]: "Trump", [columnMap.partyID]: RepublicanParty.getID(), [columnMap.candidateVotes]: 148495},
          {[columnMap.candidateName]: "Oliver", [columnMap.partyID]: LibertarianParty.getID(), [columnMap.candidateVotes]: 1999},
          {[columnMap.candidateName]: "West", [columnMap.partyID]: IndependentGenericParty.getID(), [columnMap.candidateVotes]: 1129},
          {[columnMap.candidateName]: "Stein", [columnMap.partyID]: GreenParty.getID(), [columnMap.candidateVotes]: 1102},
        ]},
        {[columnMap.region]: "NE-D3", [columnMap.totalVotes]: 312061, [columnMap.reportingPercent]: "--", [columnMap.candidates]: [
          {[columnMap.candidateName]: "Trump", [columnMap.partyID]: RepublicanParty.getID(), [columnMap.candidateVotes]: 238160},
          {[columnMap.candidateName]: "Harris", [columnMap.partyID]: DemocraticParty.getID(), [columnMap.candidateVotes]: 70282},
          {[columnMap.candidateName]: "Oliver", [columnMap.partyID]: LibertarianParty.getID(), [columnMap.candidateVotes]: 1978},
          {[columnMap.candidateName]: "West", [columnMap.partyID]: IndependentGenericParty.getID(), [columnMap.candidateVotes]: 875},
          {[columnMap.candidateName]: "Stein", [columnMap.partyID]: GreenParty.getID(), [columnMap.candidateVotes]: 766},
        ]},
        {[columnMap.region]: "ME-D1", [columnMap.totalVotes]: 431189, [columnMap.reportingPercent]: "--", [columnMap.candidates]: [
          {[columnMap.candidateName]: "Harris", [columnMap.partyID]: DemocraticParty.getID(), [columnMap.candidateVotes]: 256570},
          {[columnMap.candidateName]: "Trump", [columnMap.partyID]: RepublicanParty.getID(), [columnMap.candidateVotes]: 165322},
          {[columnMap.candidateName]: "Stein", [columnMap.partyID]: GreenParty.getID(), [columnMap.candidateVotes]: 4836},
          {[columnMap.candidateName]: "Oliver", [columnMap.partyID]: LibertarianParty.getID(), [columnMap.candidateVotes]: 2809},
          {[columnMap.candidateName]: "West", [columnMap.partyID]: IndependentGenericParty.getID(), [columnMap.candidateVotes]: 1652},
        ]},
        {[columnMap.region]: "ME-D2", [columnMap.totalVotes]: 393518, [columnMap.reportingPercent]: "--", [columnMap.candidates]: [
          {[columnMap.candidateName]: "Trump", [columnMap.partyID]: RepublicanParty.getID(), [columnMap.candidateVotes]: 209650},
          {[columnMap.candidateName]: "Harris", [columnMap.partyID]: DemocraticParty.getID(), [columnMap.candidateVotes]: 174225},
          {[columnMap.candidateName]: "Oliver", [columnMap.partyID]: LibertarianParty.getID(), [columnMap.candidateVotes]: 4232},
          {[columnMap.candidateName]: "Stein", [columnMap.partyID]: GreenParty.getID(), [columnMap.candidateVotes]: 4177},
          {[columnMap.candidateName]: "West", [columnMap.partyID]: IndependentGenericParty.getID(), [columnMap.candidateVotes]: 1234},
        ]},
      ]
    
      let mapDate = new Date(rawMapData[0][columnMap.date]).getTime()
    
      let mapData = {[mapDate]: {}}
    
      for (let raceData of useCountyIDs ? rawMapData : [...rawMapData, ...overrideRawRegionData])
      {
        let raceKey = raceData[columnMap.raceKey]
        if (racesToIgnore.includes(raceKey)) continue
    
        let regionID = raceData[columnMap.region]
        
        let stateID = regionID
        let countyName = raceData[columnMap.county]
        if (overrideCountyMap[countyName])
        {
          const overrideData = overrideCountyMap[countyName]
          countyName = isString(overrideData) ? overrideData : (overrideData.state == stateID ? overrideData.value : countyName)
        }
        else if (countyName)
        {
          countyName = countyName
            .replace(/[\s']/g, "_")
            .replace('St.', "St")
            .replace('Ste.', "Ste")
            .replace('Plt.', "Plt")
            .replace(/_County$/, "")
        }
        
        if (overrideRegionMap[regionID] && !useCountyIDs) regionID = overrideRegionMap[regionID]
        if (useCountyIDs) regionID = `${regionID}${subregionSeparator}${countyName}`
    
        let totalVotes = raceData[columnMap.totalVotes]
        let reportingPercent = raceData[columnMap.reportingPercent]
    
        let formattedCandidatesArray = []
    
        let candiatesArray = raceData[columnMap.candidates]
        for (let candidateData of candiatesArray)
        {
          let candidateName = candidateData[columnMap.candidateName]
          let partyID = candidateData[columnMap.partyID]
          let candidateVotes = candidateData[columnMap.candidateVotes]
    
          if (candidateExceptions[candidateName])
          {
            candidateName = candidateExceptions[candidateName]
          }
          if (!politicalParties[partyID])
          {
            partyID = IndependentGenericParty.getID()
          }
    
          formattedCandidatesArray.push({candidate: candidateName, partyID: partyID, voteshare: totalVotes > 0 ? candidateVotes/totalVotes*100 : 0, votes: candidateVotes})
        }
    
        let voteshareSortedCandidateData = formattedCandidatesArray.sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
        voteshareSortedCandidateData = voteshareSortedCandidateData.filter(candData => candData.voteshare >= voteshareCutoffMargin)
    
        if (voteshareSortedCandidateData.length == 0)
        {
          console.log("No candidate data!", new Date(mapDate).getFullYear().toString(), regionID)
          continue
        }
    
        let greatestMarginPartyID
        let greatestMarginCandidateName
        let topTwoMargin
    
        if (voteshareSortedCandidateData[0].voteshare != 0)
        {
          greatestMarginPartyID = voteshareSortedCandidateData[0].partyID
          greatestMarginCandidateName = voteshareSortedCandidateData[0].candidate
          topTwoMargin = voteshareSortedCandidateData[0].voteshare - (voteshareSortedCandidateData[1] ? voteshareSortedCandidateData[1].voteshare : 0)
        }
        else
        {
          greatestMarginPartyID = TossupParty.getID()
          greatestMarginCandidateName = null
          topTwoMargin = 0
        }
    
        let partyIDToCandidateNames = {}
        for (let candidateData of voteshareSortedCandidateData)
        {
          partyIDToCandidateNames[candidateData.partyID] = candidateData.candidate
        }
    
        mapData[mapDate][regionID] = {region: regionID, state: useCountyIDs ? stateID : null, county: useCountyIDs ? countyName : null, margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, flip: !useCountyIDs && heldRegionMap[regionID] != greatestMarginPartyID, reportingPercent: reportingPercent, totalVotes: totalVotes}
      }
      
      if (!useCountyIDs)
      {
        if (!mapData[mapDate][nationalPopularVoteID])
        {
          let npvCandidates = {}
          let totalVotes = 0
          
          for (let regionID in mapData[mapDate])
          {
            if (/-D\d+$/.test(regionID)) continue
            
            for (let candidateData of mapData[mapDate][regionID].partyVotesharePercentages)
            {
              if (!npvCandidates[candidateData.candidate])
              {
                npvCandidates[candidateData.candidate] = {candidate: candidateData.candidate, partyID: candidateData.partyID, votes: 0}
              }
              npvCandidates[candidateData.candidate].votes += candidateData.votes
            }
            
            totalVotes += mapData[mapDate][regionID].totalVotes
          }
          
          let npvCandidateData = Object.values(npvCandidates)
          npvCandidateData.forEach(c => c.voteshare = c.votes/totalVotes*100)
          npvCandidateData.sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
          
          let npvData = {}
          npvData.partyVotesharePercentages = npvCandidateData
          npvData.partyID = npvCandidateData[0].partyID
          npvData.candidateName = npvCandidateData[0].candidate
          npvData.margin = npvCandidateData[0].voteshare - (npvCandidateData[1] ? npvCandidateData[1].voteshare : 0)
          
          mapData[mapDate][nationalPopularVoteID] = npvData
        }
        
        for (let regionID of Object.values(regionNameToID))
        {
          if (regionID == nationalPopularVoteID) continue
          
          if (!mapData[mapDate][regionID])
          {
            mapData[mapDate][regionID] = {region: regionID, margin: 101, disabled: true, partyID: heldRegionMap[regionID]}
          }
        }
      }
    
      return {mapData: mapData, mapDates: [mapDate]}
    }
    
    var jsonVoteshare538FilterFunction = function(rawMapData, _, columnMap, __, candidateNameToPartyIDMap, regionIDMap, heldRegionMap)
    {
      let filteredMapData = {}
      let mapDates = []
    
      let partyIDToCandidateNames = invertObject(candidateNameToPartyIDMap)
      let partyObjects = Object.keys(partyIDToCandidateNames).map(partyID => politicalParties[partyID])
    
      for (let regionData of rawMapData)
      {
        let region = regionIDMap[regionData.latest[columnMap.region]]
        
        for (let dateData of regionData.timeseries)
        {
          let date = new Date(`${dateData[columnMap.date]} 12:00`).getTime()
          if (!mapDates.includes(date))
          {
            mapDates.push(date)
          }
          
          if (!filteredMapData[date])
          {
            filteredMapData[date] = {}
          }
          
          let voteshareSortedCandidateData = []
          
          for (let party of partyObjects)
          {
            voteshareSortedCandidateData.push({candidate: partyIDToCandidateNames[party.getID()], partyID: party.getID(), voteshare: dateData[party.getShortName().toLowerCase()]?.[columnMap.voteshare], winPercentage: dateData[columnMap.winprob]?.[party.getShortName().toLowerCase()]})
          }
          
          let blankCandidateData = voteshareSortedCandidateData.filter((candData) => isNaN(candData.voteshare))
          voteshareSortedCandidateData = voteshareSortedCandidateData.filter((candData) => !isNaN(candData.voteshare))
          
          if (blankCandidateData.length == 1)
          {
            blankCandidateData[0].voteshare = 100-voteshareSortedCandidateData.reduce((agg, curr) => agg += curr.voteshare, 0)
            voteshareSortedCandidateData.push(blankCandidateData[0])
          }
          
          voteshareSortedCandidateData.sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
          
          let greatestMarginPartyID
          let greatestMarginCandidateName
          let topTwoMargin
          
          // console.log(region, date, dateData)
          
          if (voteshareSortedCandidateData[0].voteshare != 0 && (!voteshareSortedCandidateData[1] || voteshareSortedCandidateData[0].voteshare != voteshareSortedCandidateData[1].voteshare))
          {
            greatestMarginPartyID = voteshareSortedCandidateData[0].partyID
            greatestMarginCandidateName = voteshareSortedCandidateData[0].candidate
            topTwoMargin = voteshareSortedCandidateData[0].voteshare - (voteshareSortedCandidateData[1] ? voteshareSortedCandidateData[1].voteshare : 0)
          }
          else
          {
            greatestMarginPartyID = TossupParty.getID()
            greatestMarginCandidateName = null
            topTwoMargin = 0
          }
          
          filteredMapData[date][region] = {region: region, margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, flip: heldRegionMap[region] != greatestMarginPartyID}
        }
      }
      
      return {mapData: filteredMapData, mapDates: mapDates.sort()}
    }
    
    var jsonPricesFilterFunction = function(rawMapData, _, columnMap, __, candidateNameToPartyIDMap, regionNameToIDMap, heldRegionMap)
    {
      let filteredMapData = {}
      let mapDates = []
      
      const relativePositiveParty = DemocraticParty.getID()
      const relativeNegativeParty = RepublicanParty.getID()
    
      let partyIDToCandidateNames = invertObject(candidateNameToPartyIDMap)
      let partyObjects = Object.keys(partyIDToCandidateNames).map(partyID => politicalParties[partyID])
    
      for (let regionName in rawMapData)
      {
        let region = regionNameToIDMap[regionName]
        
        for (let dateData of rawMapData[regionName])
        {
          let date = dateData[columnMap.time]*1000
          date -= date % (1000*60*60)
          if (!mapDates.includes(date))
          {
            mapDates.push(date)
          }
          
          if (!filteredMapData[date])
          {
            filteredMapData[date] = {}
          }
          
          let voteshareSortedCandidateData = []
          
          for (let party of partyObjects)
          {
            const partyID = party.getID()
            if (partyID != relativePositiveParty && partyID != relativeNegativeParty) { continue }
            
            const voteshare = dateData[columnMap.price]*100*(partyID == relativeNegativeParty ? -1 : 1)+(partyID == relativeNegativeParty ? 100 : 0)
            voteshareSortedCandidateData.push({candidate: partyIDToCandidateNames[partyID], partyID: partyID, voteshare: voteshare, winPercentage: voteshare})
          }
          
          voteshareSortedCandidateData.sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
          
          let greatestValuePartyID
          let greatestValueCandidateName
          let topValue
          
          if (voteshareSortedCandidateData[0].voteshare != 0)
          {
            greatestValuePartyID = voteshareSortedCandidateData[0].partyID
            greatestValueCandidateName = voteshareSortedCandidateData[0].candidate
            topValue = voteshareSortedCandidateData[0].voteshare
          }
          else
          {
            greatestValuePartyID = TossupParty.getID()
            greatestValueCandidateName = null
            topValue = 50
          }
          
          if ((voteshareSortedCandidateData[0].voteshare*2)%2 == 1)
          {
            voteshareSortedCandidateData[1].voteshare -= 0.00001
          }
          
          filteredMapData[date][region] = {region: region, margin: topValue, partyID: greatestValuePartyID, candidateName: greatestValueCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, flip: heldRegionMap[region] != greatestValuePartyID}
        }
      }
      
      const totalRegions = Object.keys(filteredMapData).reduce((prev, curr) => Math.max(Object.keys(filteredMapData[curr]).length, prev), 0)
      for (const date in filteredMapData)
      {
        if (Object.keys(filteredMapData[date]).length < totalRegions)
        {
          delete filteredMapData[date]
          
          const dateIndex = mapDates.indexOf(parseInt(date))
          if (dateIndex > -1)
          {
            mapDates.splice(dateIndex, 1)
          }
        }
      }
      
      return {mapData: filteredMapData, mapDates: mapDates.sort()}
    }

    var countyFilterFunction = function(rawMapData, mapDates, columnMap, _, __, regionNameToID)
    {
      var filteredMapData = {}
      var partyNameData = {}

      var regionIDs = Object.keys(regionNameToID)

      for (let currentMapDate of mapDates)
      {
        let rawDateData = rawMapData[currentMapDate]
        let filteredDateData = {}

        let currentDatePartyNameArray = {}

        for (let regionID of regionIDs)
        {
          let fullStateRows = rawDateData.filter(row => {
            return row[columnMap.region] == regionID
          })

          if (fullStateRows.length == 0)
          {
            continue
          }

          let stateCountyMap = {}

          for (let countyRow of fullStateRows)
          {
            let countyID = countyRow[columnMap.county]
            if (!stateCountyMap[countyID])
            {
              stateCountyMap[countyID] = []
            }
            stateCountyMap[countyID].push(countyRow)
          }

          filteredDateData[regionID] = stateCountyMap
        }

        filteredMapData[currentMapDate] = filteredDateData
        partyNameData[currentMapDate] = currentDatePartyNameArray
      }

      return {mapData: filteredMapData, candidateNameData: partyNameData, mapDates: mapDates}
    }

    var stateCountyVoteshareFilterFunction = function(stateID, stateCountyRows, currentMapDate, previousMapDateData, columnMap, isCustomMap, voteshareCutoffMargin)
    {
      let filteredStateData = {}

      for (let stateCounty in stateCountyRows)
      {
        let countyRows = stateCountyRows[stateCounty]
        let fullRegionName = stateID + (stateID != nationalPopularVoteID ? "__" + stateCounty : "")

        var candidateData = {}
        var totalVoteshare = 0

        var totalCountyVotes = parseFloat(countyRows[0][columnMap.totalVotes])

        for (var rowNum in countyRows)
        {
          var row = countyRows[rowNum]

          var candidateName = row[columnMap.candidateName]
          var candidateVotes = Math.round(parseFloat(row[columnMap.candidateVotes]))
          var currentVoteshare = candidateVotes/totalCountyVotes*100
          var currentOrder = row[columnMap.order] ? parseInt(row[columnMap.order]) : null

          var currentPartyName = row[columnMap.partyID]
          var foundParty = Object.values(politicalParties).find(party => {
            var partyNames = cloneObject(party.getNames())
            for (var nameNum in partyNames)
            {
              partyNames[nameNum] = partyNames[nameNum].toLowerCase()
            }
            return partyNames.includes(currentPartyName)
          })

          if (!foundParty && Object.keys(politicalParties).includes(currentPartyName))
          {
            foundParty = politicalParties[currentPartyName]
          }

          var currentPartyID
          if (foundParty)
          {
            currentPartyID = foundParty.getID()
          }
          else
          {
            currentPartyID = IndependentGenericParty.getID()
          }

          if (Object.keys(candidateData).includes(candidateName))
          {
            if (currentVoteshare > candidateData[candidateName].voteshare)
            {
              candidateData[candidateName].partyID = currentPartyID
            }

            candidateData[candidateName].voteshare += currentVoteshare
            candidateData[candidateName].votes += candidateVotes
          }
          else
          {
            candidateData[candidateName] = {candidate: candidateName, partyID: currentPartyID, voteshare: currentVoteshare, votes: candidateVotes, order: currentOrder}
          }

          totalVoteshare += currentVoteshare
        }

        if (totalVoteshare > 100.1)
        {
          console.log("Overflow voteshare!", currentMapDate?.getFullYear()?.toString(), fullRegionName)
        }

        var voteshareSortedCandidateData = Object.values(candidateData)
        voteshareSortedCandidateData = voteshareSortedCandidateData.filter((candData) => !isNaN(candData.voteshare))
        voteshareSortedCandidateData.sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
        if (!isCustomMap && voteshareCutoffMargin != null)
        {
          voteshareSortedCandidateData = voteshareSortedCandidateData.filter(candData => candData.voteshare >= voteshareCutoffMargin)
        }

        if (voteshareSortedCandidateData.length == 0)
        {
          console.log("No candidate data!", currentMapDate?.getFullYear()?.toString(), fullRegionName)
          continue
        }

        var greatestMarginPartyID
        var greatestMarginCandidateName
        var topTwoMargin

        if (voteshareSortedCandidateData[0].voteshare != 0)
        {
          let topCandidateData = voteshareSortedCandidateData.filter(candidateData => candidateData.order == 0 || candidateData.order == 1).sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
          if (topCandidateData.length == 0)
          {
            topCandidateData = [voteshareSortedCandidateData[0]]
            if (voteshareSortedCandidateData[1])
            {
              topCandidateData.push(voteshareSortedCandidateData[1])
            }
          }
          
          greatestMarginPartyID = topCandidateData[0].partyID
          greatestMarginCandidateName = topCandidateData[0].candidate
          topTwoMargin = topCandidateData[0].voteshare - (topCandidateData[1] ? topCandidateData[1].voteshare : 0)
        }
        else
        {
          greatestMarginPartyID = TossupParty.getID()
          greatestMarginCandidateName = null
          topTwoMargin = 0
        }

        var partyIDToCandidateNames = {}
        for (let partyCandidateName in candidateData)
        {
          partyIDToCandidateNames[candidateData[partyCandidateName].partyID] = partyCandidateName
        }

        var mostRecentParty = previousMapDateData?.[fullRegionName]?.partyID
        filteredStateData[fullRegionName] = {region: fullRegionName, state: stateID, county: stateCounty, margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, totalVotes: totalCountyVotes, disabled: countyRows[0][columnMap.disabled] == "TRUE", flip: countyRows[0][columnMap.flip] == "TRUE" || (mostRecentParty != null && mostRecentParty != greatestMarginPartyID && mostRecentParty != TossupParty.getID())}
      }

      return filteredStateData
    }

    function mostRecentWinner(mapData, dateToStart, regionID)
    {
      var reversedMapDates = cloneObject(Object.keys(mapData)).reverse()

      var startYear = (new Date(parseInt(dateToStart))).getFullYear()

      for (var dateNum in reversedMapDates)
      {
        if (reversedMapDates[dateNum] >= parseInt(dateToStart)) { continue }

        var currentYear = (new Date(parseInt(reversedMapDates[dateNum]))).getFullYear()

        if (startYear-currentYear > 4)
        {
          return TossupParty.getID()
        }

        var mapDataFromDate = mapData[reversedMapDates[dateNum]]
        if (regionID in mapDataFromDate)
        {
          return mapDataFromDate[regionID].partyID
        }
      }

      return TossupParty.getID()
    }

    function customMapConvertMapDataToCSVFunction(columnKey, mapDateString, regionID, regionNameToID, candidateName, partyID, regionData, shouldUseVoteshare)
    {
      let voteshareData
      switch (columnKey)
      {
        case "date":
        return mapDateString

        case "candidateName":
        return candidateName

        case "partyID":
        return partyID || electionYearToCandidateData[currentCycleYear || 2020][candidateName]

        case "percentAdjusted":
        voteshareData = shouldUseVoteshare && regionData.partyVotesharePercentages ? regionData.partyVotesharePercentages.find(partyVoteshare => candidateName == partyVoteshare.candidate) : null
        if (voteshareData)
        {
          return voteshareData.voteshare
        }
        else if (regionData.partyID == partyID)
        {
          return regionData.margin
        }
        return 0

        case "order":
        voteshareData = regionData.partyVotesharePercentages ? regionData.partyVotesharePercentages.find(partyVoteshare => candidateName == partyVoteshare.candidate) : null
        if (voteshareData)
        {
          return voteshareData.order
        }
        return ""

        case "region":
        if (regionNameToID)
        {
          return getKeyByValue(regionNameToID, regionID) ?? regionID
        }
        else
        {
          return regionID
        }

        case "disabled":
        return (regionData.disabled ?? false).toString().toUpperCase()
        
        case "flip":
        return (regionData.flip ?? false).toString().toUpperCase()
      }
    }
    
    function customCountyMapConvertMapDataToCSVFunction(columnKey, mapDateString, regionID, _, candidateName, partyID, regionData, shouldUseVoteshare)
    {
      switch (columnKey)
      {
        case "date":
        return mapDateString
    
        case "candidateName":
        return candidateName
    
        case "partyID":
        return partyID || electionYearToCandidateData[currentCycleYear || 2020][candidateName]
    
        case "candidateVotes":
        voteshareData = shouldUseVoteshare && regionData.partyVotesharePercentages ? regionData.partyVotesharePercentages.find(partyVoteshare => candidateName == partyVoteshare.candidate) : null
        if (voteshareData)
        {
          return voteshareData.voteshare*100
        }
        else if (regionData.partyID == partyID)
        {
          return regionData.margin
        }
        return 0
        
        case "totalVotes":
        return 100*100
        
        case "order":
        voteshareData = regionData.partyVotesharePercentages ? regionData.partyVotesharePercentages.find(partyVoteshare => candidateName == partyVoteshare.candidate) : null
        if (voteshareData)
        {
          return voteshareData.order
        }
        return ""
    
        case "county":
        return regionID.split(subregionSeparator)[1]
        
        case "region": // state
        return regionID.split(subregionSeparator)[0]
    
        case "disabled":
        return (regionData.disabled ?? false).toString().toUpperCase()
        
        case "flip":
        return (regionData.flip ?? false).toString().toUpperCase()
      }
    }

    const electionYearToCandidateData = {
      1788: {"Washington":IndependentGWParty.getID()},
      1792: {"Washington":IndependentGWParty.getID()},
      1796: {"Jefferson":DemocraticRepublicanParty.getID(), "Adams":FederalistParty.getID()},
      1800: {"Jefferson":DemocraticRepublicanParty.getID(), "Adams":FederalistParty.getID()},
      1804: {"Jefferson":DemocraticRepublicanParty.getID(), "Pinckney":FederalistParty.getID()},
      1808: {"Madison":DemocraticRepublicanParty.getID(), "Pinckney":FederalistParty.getID(), "Clinton":Independent1808GCParty.getID()},
      1812: {"Madison":DemocraticRepublicanParty.getID(), "Clinton":FederalistParty.getID()},
      1816: {"Monroe":DemocraticRepublicanParty.getID(), "King":FederalistParty.getID()},
      1820: {"Monroe":DemocraticRepublicanParty.getID(), "Adams":Independent1820JAParty.getID()},
      1824: {"Adams":DemocraticRepublicanParty.getID(), "Jackson":Independent1824AJParty.getID(), "Crawford":Independent1824WCParty.getID(), "Clay":Independent1824HCParty.getID(), "Other":IndependentGenericParty.getID()},
      1828: {"Jackson":DemocraticParty.getID(), "Adams":NationalRepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1832: {"Jackson":DemocraticParty.getID(), "Clay":NationalRepublicanParty.getID(), "Wirt":Independent1832WWParty.getID(), "Floyd":Independent1832JFParty.getID(), "Other":IndependentGenericParty.getID()},
      1836: {"Van Buren":DemocraticParty.getID(), "Harrison":WhigParty.getID(), "White":Independent1836HWParty.getID(), "Webster":Independent1836DWParty.getID(), "Magnum":Independent1836WMParty.getID(), "Other":IndependentGenericParty.getID()},
      1840: {"Van Buren":DemocraticParty.getID(), "Harrison":WhigParty.getID(), "Other":IndependentGenericParty.getID()},
      1844: {"Polk":DemocraticParty.getID(), "Clay":WhigParty.getID(), "Birney":Independent1844JBParty.getID(), "Other":IndependentGenericParty.getID()},
      1848: {"Cass":DemocraticParty.getID(), "Taylor":WhigParty.getID(), "Van Buren":FreeSoilParty.getID(), "Other":IndependentGenericParty.getID()},
      1852: {"Pierce":DemocraticParty.getID(), "Scott":WhigParty.getID(), "Hale":FreeSoilParty.getID(), "Other":IndependentGenericParty.getID()},
      1856: {"Buchanan":DemocraticParty.getID(), "Fremont":RepublicanParty.getID(), "Fillmore":Independent1856MFParty.getID(), "Other":IndependentGenericParty.getID()},
      1860: {"Douglas":DemocraticParty.getID(), "Lincoln":RepublicanParty.getID(), "Breckenridge":Independent1860JohnBreckenridgeParty.getID(), "Bell":Independent1860JohnBellParty.getID(), "Other":IndependentGenericParty.getID()},
      1864: {"McClellan":DemocraticParty.getID(), "Lincoln":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1868: {"Seymour":DemocraticParty.getID(), "Grant":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1872: {"Greeley":DemocraticParty.getID(), "Grant":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1876: {"Tilden":DemocraticParty.getID(), "Hayes":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1880: {"Hancock":DemocraticParty.getID(), "Garfield":RepublicanParty.getID(), "Weaver":Independent1892JWParty.getID(), "Other":IndependentGenericParty.getID()},
      1884: {"Cleveland":DemocraticParty.getID(), "Blaine":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1888: {"Cleveland":DemocraticParty.getID(), "Harrison":RepublicanParty.getID(), "Fisk":Independent1888CFParty.getID(), "Other":IndependentGenericParty.getID()},
      1892: {"Cleveland":DemocraticParty.getID(), "Harrison":RepublicanParty.getID(), "Weaver":Independent1892JWParty.getID(), "Bidwell":Independent1892JBParty.getID(), "Other":IndependentGenericParty.getID()},
      1896: {"Bryan":DemocraticParty.getID(), "McKinley":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1900: {"Bryan":DemocraticParty.getID(), "McKinley":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1904: {"Parker":DemocraticParty.getID(), "Roosevelt":RepublicanParty.getID(), "Debs":Independent1912EDParty.getID(), "Other":IndependentGenericParty.getID()},
      1908: {"Bryan":DemocraticParty.getID(), "Taft":RepublicanParty.getID(), "Debs":Independent1912EDParty.getID(), "Other":IndependentGenericParty.getID()},
      1912: {"Wilson":DemocraticParty.getID(), "Taft":RepublicanParty.getID(), "Roosevelt":Independent1912TRParty.getID(), "Debs":Independent1912EDParty.getID(), "Other":IndependentGenericParty.getID()},
      1916: {"Wilson":DemocraticParty.getID(), "Hughes":RepublicanParty.getID(), "Benson":Independent1916ABParty.getID(), "Other":IndependentGenericParty.getID()},
      1920: {"Cox":DemocraticParty.getID(), "Harding":RepublicanParty.getID(), "Debs":Independent1920EDParty.getID(), "Other":IndependentGenericParty.getID()},
      1924: {"Davis":DemocraticParty.getID(), "Coolidge":RepublicanParty.getID(), "La Follette":Independent1924RLParty.getID(), "Other":IndependentGenericParty.getID()},
      1928: {"Smith":DemocraticParty.getID(), "Hoover":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1932: {"Roosevelt":DemocraticParty.getID(), "Hoover":RepublicanParty.getID(), "Thomas":Independent1932NTParty.getID(), "Other":IndependentGenericParty.getID()},
      1936: {"Roosevelt":DemocraticParty.getID(), "Landon":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1940: {"Roosevelt":DemocraticParty.getID(), "Willkie":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1944: {"Roosevelt":DemocraticParty.getID(), "Dewey":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1948: {"Truman":DemocraticParty.getID(), "Dewey":RepublicanParty.getID(), "Thurmond":Independent1948SMParty.getID(), "Wallace":Independent1948HWParty.getID(), "Other":IndependentGenericParty.getID()},
      1952: {"Stevenson":DemocraticParty.getID(), "Eisenhower":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1956: {"Stevenson":DemocraticParty.getID(), "Eisenhower":RepublicanParty.getID(), "Jones":Independent1956WJParty.getID(), "Other":IndependentGenericParty.getID()},
      1960: {"Kennedy":DemocraticParty.getID(), "Nixon":RepublicanParty.getID(), "Byrd":Independent1960HBParty.getID(), "Other":IndependentGenericParty.getID()},
      1964: {"Johnson":DemocraticParty.getID(), "Goldwater":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1968: {"Humphrey":DemocraticParty.getID(), "Nixon":RepublicanParty.getID(), "Wallace":Independent1968GWParty.getID(), "Other":IndependentGenericParty.getID()},
      1972: {"McGovern":DemocraticParty.getID(), "Nixon":RepublicanParty.getID(), "Other":IndependentGenericParty.getID(), "Hospers":LibertarianParty.getID()},
      1976: {"Carter":DemocraticParty.getID(), "Ford":RepublicanParty.getID(), "McCarthy":Independent1976EMParty.getID(), "Reagan": Independent1976RRParty.getID()},
      1980: {"Carter":DemocraticParty.getID(), "Reagan":RepublicanParty.getID(), "Anderson":Independent1980JAParty.getID(), "Clark":LibertarianParty.getID()},
      1984: {"Mondale":DemocraticParty.getID(), "Reagan":RepublicanParty.getID(), "Bergland":LibertarianParty.getID()},
      1988: {"Dukakis":DemocraticParty.getID(), "Bush":RepublicanParty.getID(), "Paul":LibertarianParty.getID(), "Bentsen": Independent1988LBParty.getID()},
      1992: {"Clinton":DemocraticParty.getID(), "Bush":RepublicanParty.getID(), "Perot":ReformParty.getID(), "Marrou":LibertarianParty.getID()},
      1996: {"Clinton":DemocraticParty.getID(), "Dole":RepublicanParty.getID(), "Perot":ReformParty.getID(), "Nader":GreenParty.getID(), "Browne":LibertarianParty.getID()},
      2000: {"Gore":DemocraticParty.getID(), "Bush":RepublicanParty.getID(), "Nader":GreenParty.getID(), "Buchanan":ReformParty.getID(), "Browne":LibertarianParty.getID()},
      2004: {"Kerry":DemocraticParty.getID(), "Bush":RepublicanParty.getID(), "Nader":IndependentRNParty.getID(), "Badnarik":LibertarianParty.getID(), "Edwards": Independent2004JEParty.getID()},
      2008: {"Obama":DemocraticParty.getID(), "McCain":RepublicanParty.getID(), "Nader":IndependentRNParty.getID(), "Barr":LibertarianParty.getID()},
      2012: {"Obama":DemocraticParty.getID(), "Romney":RepublicanParty.getID(), "Johnson":LibertarianParty.getID(), "Stein":GreenParty.getID()},
      2016: {"Clinton":DemocraticParty.getID(), "Trump":RepublicanParty.getID(), "Johnson":LibertarianParty.getID(), "Stein":GreenParty.getID(), "McMullin":Independent2016EMParty.getID(), "Powell":Independent2016CPParty.getID(), "Sanders":Independent2016BSParty.getID(), "Paul":Independent2016RPParty.getID(), "Kasich":Independent2016JKParty.getID(), "Spotted Eagle":Independent2016SEParty.getID()},
      2020: {"Biden":DemocraticParty.getID(), "Trump":RepublicanParty.getID(), "Jorgensen":LibertarianParty.getID(), "Hawkins":GreenParty.getID()},
      2024: {"Harris":DemocraticParty.getID(), "Trump":RepublicanParty.getID(), "Kennedy":Independent2024RFKParty.getID()}
    }
    
    const ev2016Values = {"AL":2, "AK":2, "AZ":2, "AR":2, "CA":1, "CO":1, "CT":1, "DE":1, "DC":1, "FL":2, "GA":2, "HI":1, "ID":2, "IL":1, "IN":2, "IA":2, "KS":2, "KY":2, "LA":2, "ME-D1":1, "ME-D2":2, "ME-AL":1, "MD":1, "MA":1, "MI":2, "MN":1, "MS":2, "MO":2, "MT":2, "NE-D1":2, "NE-D2":2, "NE-D3":2, "NE-AL":2, "NV":1, "NH":1, "NJ":1, "NM":1, "NY":1, "NC":2, "ND":2, "OH":2, "OK":2, "OR":1, "PA":2, "RI":1, "SC":2, "SD":2, "TN":2, "TX":2, "UT":2, "VT":1, "VA":1, "WA":1, "WV":2, "WI":2, "WY":2}
    const ev2016 = {}
    Object.keys(ev2016Values).forEach((state) => {
      ev2016[state] = [DemocraticParty.getID(), RepublicanParty.getID()][ev2016Values[state]-1]
    })
    
    const ev2020Values = {"AL":2, "AK":2, "AZ":1, "AR":2, "CA":1, "CO":1, "CT":1, "DE":1, "DC":1, "FL":2, "GA":1, "HI":1, "ID":2, "IL":1, "IN":2, "IA":2, "KS":2, "KY":2, "LA":2, "ME-D1":1, "ME-D2":2, "ME-AL":1, "MD":1, "MA":1, "MI":1, "MN":1, "MS":2, "MO":2, "MT":2, "NE-D1":2, "NE-D2":1, "NE-D3":2, "NE-AL":2, "NV":1, "NH":1, "NJ":1, "NM":1, "NY":1, "NC":2, "ND":2, "OH":2, "OK":2, "OR":1, "PA":1, "RI":1, "SC":2, "SD":2, "TN":2, "TX":2, "UT":2, "VT":1, "VA":1, "WA":1, "WV":2, "WI":1, "WY":2}
    const ev2020 = {}
    Object.keys(ev2020Values).forEach((state) => {
      ev2020[state] = [DemocraticParty.getID(), RepublicanParty.getID()][ev2020Values[state]-1]
    })

    const regionNameToIDFiveThirtyEight = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "ME-1":"ME-D1", "ME-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "NE-1":"NE-D1", "NE-2":"NE-D2", "NE-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}
    const regionIDToIDFiveThirtyEight = {"AL":"AL", "AK":"AK", "AZ":"AZ", "AR":"AR", "CA":"CA", "CO":"CO", "CT":"CT", "DE":"DE", "DC":"DC", "FL":"FL", "GA":"GA", "HI":"HI", "ID":"ID", "IL":"IL", "IN":"IN", "IA":"IA", "KS":"KS", "KY":"KY", "LA":"LA", "ME-01":"ME-D1", "ME-02":"ME-D2", "ME":"ME-AL", "MD":"MD", "MA":"MA", "MI":"MI", "MN":"MN", "MS":"MS", "MO":"MO", "MT":"MT", "NE-01":"NE-D1", "NE-02":"NE-D2", "NE-03":"NE-D3", "NE":"NE-AL", "NV":"NV", "NH":"NH", "NJ":"NJ", "NM":"NM", "NY":"NY", "NC":"NC", "ND":"ND", "OH":"OH", "OK":"OK", "OR":"OR", "PA":"PA", "RI":"RI", "SC":"SC", "SD":"SD", "TN":"TN", "TX":"TX", "UT":"UT", "VT":"VT", "VA":"VA", "WA":"WA", "WV":"WV", "WI":"WI", "WY":"WY"}
    const regionNameToIDCook = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "Washington DC":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine 1st CD":"ME-D1", "Maine 2nd CD":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska 1st CD":"NE-D1", "Nebraska 2nd CD":"NE-D2", "Nebraska 3rd CD":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}
    const regionNameToIDPolymarket = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "Washington DC":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "ME-1":"ME-D1", "ME-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "NE-1":"NE-D1", "NE-2":"NE-D2", "NE-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY", "National":nationalPopularVoteID}
    const regionNameToIDHistorical = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine":"ME-AL", "Maine 1st CD":"ME-D1", "Maine 2nd CD":"ME-D2", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska":"NE-AL", "Nebraska 1st CD":"NE-D1", "Nebraska 2nd CD": "NE-D2", "Nebraska 3rd CD":"NE-D3", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY", "National Popular Vote":nationalPopularVoteID}
    const regionNameToIDCounty = {"AL":"AL", "AK":"AK", "AZ":"AZ", "AR":"AR", "CA":"CA", "CO":"CO", "CT":"CT", "DE":"DE", "DC":"DC", "FL":"FL", "GA":"GA", "HI":"HI", "ID":"ID", "IL":"IL", "IN":"IN", "IA":"IA", "KS":"KS", "KY":"KY", "LA":"LA", "ME":"ME", "MD":"MD", "MA":"MA", "MI":"MI", "MN":"MN", "MS":"MS", "MO":"MO", "MT":"MT", "NE":"NE", "NV":"NV", "NH":"NH", "NJ":"NJ", "NM":"NM", "NY":"NY", "NC":"NC", "ND":"ND", "OH":"OH", "OK":"OK", "OR":"OR", "PA":"PA", "RI":"RI", "SC":"SC", "SD":"SD", "TN":"TN", "TX":"TX", "UT":"UT", "VT":"VT", "VA":"VA", "WA":"WA", "WV":"WV", "WI":"WI", "WY":"WY", [nationalPopularVoteID]:nationalPopularVoteID}
    const regionNameToIDCustom = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "ME-1":"ME-D1", "ME-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "NE-1":"NE-D1", "NE-2":"NE-D2", "NE-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY", "National Popular Vote":nationalPopularVoteID}
    
    const regionIDToLinkCNN = {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME-AL":"maine", "ME-D1":"maine", "ME-D2":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE-AL":"nebraska", "NE-D1":"nebraska", "NE-D2":"nebraska", "NE-D3":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"}
    const regionIDToLinkFiveThirtyEightPolls = {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "DC":"district-of-columbia", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME-D1":"maine/1", "ME-D2":"maine/2", "ME-AL":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE-D1":"nebraska/1", "NE-D2":"nebraska/2", "NE-D3":"nebraska/3", "NE-AL":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"}
    const regionIDToLinkFiveThirtyEight = {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "DC":"district-of-columbia", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME-D1":"maine-1", "ME-D2":"maine-2", "ME-AL":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE-D1":"nebraska-1", "NE-D2":"nebraska-2", "NE-D3":"nebraska-3", "NE-AL":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"}
    const regionIDToLinkPolymarket = {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":["delaware", "-2024"], "DC":"washington-dc", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME-D1":"congressional-district-1st-maine", "ME-D2":"congressional-district-2nd-maine", "ME-AL":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE-D1":"congressional-district-1st-nebraska", "NE-D2":"congressional-district-2nd-nebraska", "NE-D3":"congressional-district-3rd-nebraska", "NE-AL":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":["new-mexico", "-2024"], "NY":["new-york", "-2024"], "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"}
    const regionIDToLinkHistorical = {"AL":"Alabama", "AK":"Alaska", "AZ":"Arizona", "AR":"Arkansas", "CA":"California", "CO":"Colorado", "CT":"Connecticut", "DE":"Delaware", "DC":"the_District_of_Columbia", "FL":"Florida", "GA":"Georgia", "HI":"Hawaii", "ID":"Idaho", "IL":"Illinois", "IN":"Indiana", "IA":"Iowa", "KS":"Kansas", "KY":"Kentucky", "LA":"Louisiana", "ME-D1":"Maine", "ME-D2":"Maine", "ME-AL":"Maine", "ME":"Maine", "MD":"Maryland", "MA":"Massachusetts", "MI":"Michigan", "MN":"Minnesota", "MS":"Mississippi", "MO":"Missouri", "MT":"Montana", "NE-D1":"Nebraska", "NE-D2":"Nebraska", "NE-D3":"Nebraska", "NE-AL":"Nebraska", "NE":"Nebraska", "NV":"Nevada", "NH":"New_Hampshire", "NJ":"New_Jersey", "NM":"New_Mexico", "NY":"New_York", "NC":"North_Carolina", "ND":"North_Dakota", "OH":"Ohio", "OK":"Oklahoma", "OR":"Oregon", "PA":"Pennsylvania", "RI":"Rhode_Island", "SC":"South_Carolina", "SD":"South_Dakota", "TN":"Tennessee", "TX":"Texas", "UT":"Utah", "VT":"Vermont", "VA":"Virginia", "WA":"Washington_(state)", "WV":"West_Virginia", "WI":"Wisconsin", "WY":"Wyoming"}

    var countyFormattedRegionName = (regionID) => {
      if (!regionID.includes(subregionSeparator)) { return regionID }
      
      let state = regionID.split(subregionSeparator)[0]
      let county = regionID.split(subregionSeparator)[1].replace(/_s$/, "'s").replaceAll("_", " ")
      
      return county + ", " + state
    }
    
    var getCNNCountyData = async (mapDateData, zoomRegion, isZoomCheck, date) => {
      if (isZoomCheck) return true
      if (!zoomRegion) return
      
      if (zoomRegion == "DC")
      {
        const stateID = "DC"
        const countyName = "District_of_Columbia"
        
        const countyData = cloneObject(mapDateData[zoomRegion])
        countyData.region = `${stateID}${subregionSeparator}${countyName}`
        countyData.state = stateID
        countyData.county = countyName
        countyData.voteWorth = 1
        
        return {[countyData.region]: countyData}
      }
      
      addLoader(LoaderType.standard)
      
      const countyLink = `https://politics.api.cnn.io/results/county-races/2024-PG-${zoomRegion}.json`
      const countyZoomData = await $.getJSON(countyLink)
      
      removeLoader(LoaderType.standard)
      
      const { mapData } = await CNNResults2024MapSource.executeFilter(countyZoomData, [date], undefined, true)
      let countyDateData = Object.values(mapData)[0]
      
      if (countyToCityMap[zoomRegion])
      {
        const cityDateData = cloneObject(countyDateData)
        countyDateData = {}
        for (const city in cityDateData)
        {
          const plaintextCity = city.split(subregionSeparator)[1].replace(/_/g, " ")
          const countyName = Object.keys(countyToCityMap[zoomRegion]).find(county => countyToCityMap[zoomRegion][county].includes(plaintextCity))?.replace(/ /g, "_")
          const countyID = `${zoomRegion}${subregionSeparator}${countyName ?? city.split(subregionSeparator)[1]}`
          
          if (!countyDateData[countyID])
          {
            countyDateData[countyID] = cloneObject(cityDateData[city])
            countyDateData[countyID].region = countyID
          }
          else
          {
            countyDateData[countyID].partyVotesharePercentages.forEach(candidateData => {
              const cityCandidateData = cityDateData[city].partyVotesharePercentages.find(candidateData2 => candidateData2.candidate == candidateData.candidate)
              if (!cityCandidateData) return
              
              candidateData.votes += cityCandidateData.votes
            })
            countyDateData[countyID].totalVotes += cityDateData[city].totalVotes
          }
        }
        
        for (const countyID in countyDateData)
        {
          const voteshareSortedCandidateData = countyDateData[countyID].partyVotesharePercentages
          const countyTotalVotes = countyDateData[countyID].totalVotes
          voteshareSortedCandidateData.forEach(candidateData => {
            candidateData.voteshare = countyTotalVotes > 0 ? candidateData.votes/countyDateData[countyID].totalVotes*100 : 0
          })
          voteshareSortedCandidateData.sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
          
          let greatestMarginPartyID
          let greatestMarginCandidateName
          let topTwoMargin
          
          if (voteshareSortedCandidateData[0].voteshare != 0)
          {
            greatestMarginPartyID = voteshareSortedCandidateData[0].partyID
            greatestMarginCandidateName = voteshareSortedCandidateData[0].candidate
            topTwoMargin = voteshareSortedCandidateData[0].voteshare - (voteshareSortedCandidateData[1] ? voteshareSortedCandidateData[1].voteshare : 0)
          }
          else
          {
            greatestMarginPartyID = TossupParty.getID()
            greatestMarginCandidateName = null
            topTwoMargin = 0
          }
          
          countyDateData[countyID].margin = topTwoMargin
          countyDateData[countyID].partyID = greatestMarginPartyID
          countyDateData[countyID].candidateName = greatestMarginCandidateName
        }
      }
      
      let popularVoteRegionIDToUse = zoomRegion
      if (popularVoteRegionIDToUse == "NE" || popularVoteRegionIDToUse == "ME")
      {
        popularVoteRegionIDToUse += "-AL"
      }
      countyDateData[nationalPopularVoteID] = cloneObject(mapDateData[popularVoteRegionIDToUse])
      
      Object.keys(countyDateData).forEach(regionID => countyDateData[regionID].voteWorth = 1)
      return countyDateData
    }

    var CNNResults2024MapSource = new MapSource(
      "CNN-2024-Presidential-Results", // id
      "CNN Results", // name
      {url: "https://politics.api.cnn.io/results/national-races/2024-PG.json", type: jsonSourceType}, // dataURL
      "https://www.cnn.com/election/2024/results/", // homepageURL
      {regular: "./assets/cnn-large.png", mini: "./assets/cnn.png"}, // iconURL
      {
        date: "extractedAt",
        raceKey: "ecKey",
        region: "stateAbbreviation",
        county: "countyName",
        special: "raceType",
        totalVotes: "totalVote",
        reportingPercent: "percentReporting",
        candidates: "candidates",
        candidateName: "lastName",
        partyID: "majorParty",
        candidateVotes: "voteNum"
      }, // columnMap
      2024, // cycleYear
      partyCandiateFullNames, // candidateNameToPartyIDMap
      partyIDToCandidateLastNames, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      regionIDToLinkCNN, // regionIDToLinkMap
      ev2020, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      jsonVoteshareCNNFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      getCNNCountyData, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      countyFormattedRegionName, // getFormattedRegionName
      function(homepageURL, regionID, regionIDToLinkMap, _, shouldOpenHomepage, __)
      {
        if (!shouldOpenHomepage && !regionID) return
        
        if (regionID && regionID.includes(subregionSeparator))
        {
          regionID = regionID.split(subregionSeparator)[0]
        }
    
        let linkToOpen = homepageURL
        if (shouldOpenHomepage)
        {
          linkToOpen += "president"
        }
        else
        {
          linkToOpen += regionIDToLinkMap[regionID] + "/" + "president"
        }
    
        return linkToOpen
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      0.0, // voteshareCutoffMargin
      () => {
        if (currentViewingState == ViewingState.zooming)
        {
          return ["svg-sources/usa-counties-map.svg", currentMapZoomRegion]
        }
        
        return "svg-sources/usa-presidential-map.svg"
      }, // overrideSVGPath
      null, // shouldSetDisabledWorthToZero
      null, // shouldUseOriginalMapDataForTotalsPieChart
      ViewingState.zooming, // shouldForcePopularVoteDisplay
    )
    
    var FiveThirtyEightPollAverage2020MapSource = new MapSource(
      "538-2020-Presidential-PollAvg", // id
      "538 Poll Avg", // name
      "./csv-sources/538/2020_presidential_poll_averages.csv", // dataURL
      "https://web.archive.org/web/20250307184126/https://projects.fivethirtyeight.com/polls/president-general/", // homepageURL
      {regular: "./assets/fivethirtyeight-large.png", mini: "./assets/fivethirtyeight.png"}, // iconURL
      {
        date: "modeldate",
        region: "state",
        candidateName: "candidate_name",
        percentAdjusted: "pct_trend_adjusted"
      }, // columnMap
      2020, // cycleYear
      partyCandiateFullNames, // candidateNameToPartyIDMap
      partyIDToCandidateLastNames, // shortCandidateNameOverride
      regionNameToIDFiveThirtyEight, // regionNameToIDMap
      regionIDToLinkFiveThirtyEightPolls, // regionIDToLinkMap
      ev2016, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      doubleLineMarginFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      null, // customOpenRegionLinkFunction
      null // updateCustomMapFunction
    )
    
    var FiveThirtyEightProjection2020MapSource = new MapSource(
      "538-2020-Presidential-Projection", // id
      "538 Projection", // name
      "./csv-sources/538/2020_presidential_state_toplines.csv", // dataURL
      "https://web.archive.org/web/20250305142028/https://projects.fivethirtyeight.com/2020-election-forecast/", // homepageURL
      {regular: "./assets/fivethirtyeight-large.png", mini: "./assets/fivethirtyeight.png"}, // iconURL
      {
        date: "modeldate",
        region: "state",
        margin: "margin",
        incumbentWinChance: "winstate_inc",
        challengerWinChance: "winstate_chal"
      }, // columnMap
      2020, // cycleYear
      partyCandiateLastNames, // candidateNameToPartyIDMap
      partyIDToCandidateLastNames, // shortCandidateNameOverride
      regionNameToIDFiveThirtyEight, // regionNameToIDMap
      regionIDToLinkFiveThirtyEight, // regionIDToLinkMap
      ev2016, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      singleLineMarginFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      null, // customOpenRegionLinkFunction
      null // updateCustomMapFunction
    )

    var FiveThirtyEightProjection2024MapSource = new MapSource(
      "538-2024-Presidential-Projection", // id
      "538 Projection", // name
      {url: "./csv-sources/538/2024_pres_states_timeseries.json", type: jsonSourceType}, // dataURL
      "https://web.archive.org/web/20250306102133/https://projects.fivethirtyeight.com/2024-election-forecast/", // homepageURL
      {regular: "./assets/fivethirtyeight-large.png", mini: "./assets/fivethirtyeight.png"}, // iconURL
      {
        date: "date",
        region: "state",
        voteshare: "median",
        winprob: "winprob"
      }, // columnMap
      2024, // cycleYear
      partyCandiateLastNames, // candidateNameToPartyIDMap
      partyIDToCandidateLastNames, // shortCandidateNameOverride
      regionIDToIDFiveThirtyEight, // regionNameToIDMap
      regionIDToLinkFiveThirtyEight, // regionIDToLinkMap
      ev2020, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      jsonVoteshare538FilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      null, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
    )

    var CookProjection2020MapSource = new MapSource(
      "Cook-2020-Presidential", // id
      "Cook Political", // name
      "./csv-sources/cook-pres-2020/cook-latest.csv", // dataURL
      "./csv-sources/cook-pres-2020/", // homepageURL
      {regular: "./assets/cookpolitical-large.png", mini: "./assets/cookpolitical.png"}, // iconURL
      {
        date: "date",
        region: "region",
        margin: "margin"
      }, // columnMap
      2020, // cycleYear
      partyCandiateLastNames, // candidateNameToPartyIDMap
      partyIDToCandidateLastNames, // shortCandidateNameOverride
      regionNameToIDCook, // regionNameToIDMap
      null, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      false, // addDecimalPadding
      singleLineMarginFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      function(homepageURL, _, __, mapDate, ___)
      {
        if (mapDate == null) { return }
        return homepageURL + mapDate.getFullYear() + zeroPadding(mapDate.getMonth()+1) + mapDate.getDate() + ".pdf"
      }, // customOpenRegionLinkFunction
      null // updateCustomMapFunction
    )
    
    var PolymarketPrices2024MapSource = new MapSource(
      "Polymarket-2024-Presidential", // id
      "Polymarket", // name
      {url: "https://jacksonjude.com/USA-Election-Map-Data/data/2024-president-polymarket-prices.json", type: jsonSourceType}, // dataURL
      "https://polymarket.com", // homepageURL
      {regular: "./assets/polymarket-large.png", mini: "./assets/polymarket.png"}, // iconURL
      {
        time: "t",
        price: "p"
      }, // columnMap
      2024, // cycleYear
      partyCandiateLastNames, // candidateNameToPartyIDMap
      partyIDToCandidateLastNames, // shortCandidateNameOverride
      regionNameToIDPolymarket, // regionNameToIDMap
      regionIDToLinkPolymarket, // regionIDToLinkMap
      ev2020, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      jsonPricesFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      function(homepageURL, regionID, regionIDToLinkMap, _, shouldOpenHomepage)
      {
        var linkToOpen = homepageURL
        if (shouldOpenHomepage)
        {
          linkToOpen += "/elections"
        }
        else
        {
          const linkData = regionIDToLinkMap[regionID]
          const dataIsArray = Array.isArray(linkData)
          
          linkToOpen += "/event/" + (dataIsArray ? linkData[0] : linkData) + "-presidential-election-winner" + (dataIsArray && linkData.length > 1 ? linkData[1] : "")
        }
        return linkToOpen
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      false, // shouldShowVoteshare
      null, // voteshareCutoffMargin,
      null, // overrideSVGPath,
      null, // shouldSetDisabledWorthToZero
      null, // shouldUseOriginalMapDataForTotalsPieChart
      null, // shouldForcePopularVoteDisplay
      {safe: 90, likely: 75, lean: 55, tilt: Number.MIN_VALUE}, // customDefaultMargins
      '', // customVotesharePrefix
      '¢', // customVoteshareSuffix
    )

    var getPresidentialSVGFromDate = async function(dateTime)
    {
      var dateYear = (new Date(dateTime)).getFullYear()

      if (currentViewingState == ViewingState.zooming || currentMapType.getMapSettingValue("showAllDistricts"))
      {
        if (await PastElectionResultMapSource.canZoom(PastElectionResultMapSource.getMapData(), currentMapZoomRegion))
        {
          return ["svg-sources/usa-counties-map.svg", currentMapZoomRegion]
        }
        else
        {
          return ["svg-sources/usa-governor-map.svg", currentMapZoomRegion]
        }
      }

      if (dateYear < 1820)
      {
        return "svg-sources/usa-presidential-pre-1820-map.svg"
      }
      else if (dateYear < 1864)
      {
        return "svg-sources/usa-presidential-pre-1864-map.svg"
      }
      else if (dateYear < 1960)
      {
        return "svg-sources/usa-presidential-pre-1960-map.svg"
      }
      else if (dateYear < 1972)
      {
        return "svg-sources/usa-presidential-pre-1972-map.svg"
      }
      else  if (dateYear < 1992)
      {
        return "svg-sources/usa-presidential-pre-1992-map.svg"
      }
      else
      {
        return "svg-sources/usa-presidential-map.svg"
      }
    }

    var pastElectoralVoteCounts = async (mapDateData) => {
      if (new Date(getCurrentDateOrToday()).getFullYear() >= 1824 && currentMapType.getMapSettingValue("presViewingType") === false && currentViewingState == ViewingState.splitVote)
      {
        currentViewingState = ViewingState.viewing
        return mapDateData
      }

      let voteSplitMapDateData = {}

      for (let regionID in mapDateData)
      {
        let regionData = cloneObject(mapDateData[regionID])
        voteSplitMapDateData[regionID] = regionData
        if (mapDateData[regionID].disabled) { continue }
        if (!regionData.voteSplits || !regionData.voteSplits[0])
        {
          let currentRegionEV = currentMapType.getEV(getCurrentDecade(), regionID, regionData)
          regionData.voteSplits = [{partyID: regionData.partyID, candidate: regionData.candidateMap && regionData.candidateMap[regionData.partyID], votes: currentRegionEV}]
        }
        regionData.margin = 100
        regionData.partyID = regionData.voteSplits[0].partyID
      }

      if (Object.keys(voteSplitMapDateData).length == 0) { return mapDateData }

      return voteSplitMapDateData
    }

    var countyViewingDataFunction = async (organizedCountyData) => {
      let stateCandidateData = {}
      let stateTotalVotes = {}

      for (let state in organizedCountyData)
      {
        let mapDateData = stateCountyVoteshareFilterFunction(state, organizedCountyData[state], null, null, CountyElectionResultMapSource.columnMap, false, CountyElectionResultMapSource.voteshareCutoffMargin)
        
        stateCandidateData[state] = {}
        stateTotalVotes[state] = 0
        
        for (let regionData of Object.values(mapDateData))
        {
          stateTotalVotes[state] += regionData.totalVotes
          
          regionData.partyVotesharePercentages.forEach(candidateData => {
            if (!stateCandidateData[state][candidateData.candidate])
            {
              stateCandidateData[state][candidateData.candidate] = {...candidateData}
            }
            else
            {
              stateCandidateData[state][candidateData.candidate].votes += candidateData.votes
            }
          })
        }
      }

      let aggregatedMapDateData = {}
      for (let state in stateCandidateData)
      {
        let voteshareSortedCandidateData = Object.values(stateCandidateData[state]).map(candidateData => {
          return {...candidateData, voteshare: candidateData.votes/stateTotalVotes[state]*100}
        })
        
        voteshareSortedCandidateData = voteshareSortedCandidateData.filter((candData) => !isNaN(candData.voteshare))
        voteshareSortedCandidateData.sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
        if (CountyElectionResultMapSource.voteshareCutoffMargin != null)
        {
          voteshareSortedCandidateData = voteshareSortedCandidateData.filter(candData => candData.voteshare >= CountyElectionResultMapSource.voteshareCutoffMargin)
        }
        
        if (voteshareSortedCandidateData.length == 0)
        {
          console.log("No candidate data!", currentMapDate?.getFullYear()?.toString(), fullRegionName)
          continue
        }
        
        var greatestMarginPartyID
        var greatestMarginCandidateName
        var topTwoMargin
        
        if (voteshareSortedCandidateData[0].voteshare > 0)
        {
          greatestMarginPartyID = voteshareSortedCandidateData[0].partyID
          greatestMarginCandidateName = voteshareSortedCandidateData[0].candidate
          topTwoMargin = voteshareSortedCandidateData[0].voteshare - (voteshareSortedCandidateData[1] ? voteshareSortedCandidateData[1].voteshare : 0)
        }
        else
        {
          greatestMarginPartyID = TossupParty.getID()
          greatestMarginCandidateName = null
          topTwoMargin = 0
        }
        
        var partyIDToCandidateNames = {}
        for (let candidateData of voteshareSortedCandidateData)
        {
          partyIDToCandidateNames[candidateData.partyID] = candidateData.candidate
        }
        
        aggregatedMapDateData[state] = {region: state, margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, totalVotes: stateTotalVotes[state]}
      }

      return aggregatedMapDateData
    }

    var countyZoomingDataFunction = async (presidentialMapDateData, regionID, isZoomCheck, date, mapSource = CountyElectionResultMapSource) => {
      if (!mapSource.getMapData() || (!isZoomCheck && !(await CSVDatabase.isSourceUpdated(mapSource.getID()))))
      {
        if (isZoomCheck) { return false }

        await mapSource.loadMap()
      }
      let organizedCountyData = mapSource.getMapData()[date ?? currentSliderDate.getTime()]

      if (isZoomCheck) { return (organizedCountyData != null && (!regionID || organizedCountyData[regionID] != null) ) || (showingCompareMap && currentMapSource.isCompare()) }

      let previousMapDateIndex = mapSource.getMapDates().findIndex(mapDate => mapDate == date ?? currentSliderDate.getTime())-1
      let previousMapDateData
      if (previousMapDateIndex >= 0)
      {
        let previousDate = mapSource.getMapDates()[previousMapDateIndex]
        let previousOrganizedCountyData = mapSource.getMapData()[previousDate]
        previousMapDateData = stateCountyVoteshareFilterFunction(currentMapZoomRegion, previousOrganizedCountyData[currentMapZoomRegion], new Date(previousDate), null, mapSource.columnMap, false, mapSource.voteshareCutoffMargin)
      }

      let mapDateData = organizedCountyData != null && (!regionID || organizedCountyData[regionID] != null) ? stateCountyVoteshareFilterFunction(currentMapZoomRegion, organizedCountyData[currentMapZoomRegion], new Date(date) ?? currentSliderDate, previousMapDateData, mapSource.columnMap, false, mapSource.voteshareCutoffMargin) : null

      let countyZoomData = {}

      let popularVoteRegionIDToUse = currentMapZoomRegion
      if (popularVoteRegionIDToUse == "NE" || popularVoteRegionIDToUse == "ME")
      {
        popularVoteRegionIDToUse += "-AL"
      }

      if (presidentialMapDateData[popularVoteRegionIDToUse])
      {
        let statePopularVoteID = currentMapZoomRegion + subregionSeparator + statePopularVoteDistrictID
        countyZoomData[statePopularVoteID] = cloneObject(presidentialMapDateData[popularVoteRegionIDToUse])
        countyZoomData[statePopularVoteID].region = statePopularVoteID
      }

      if (mapDateData != null)
      {
        for (let regionID in mapDateData)
        {
          if (mapDateData[regionID].state == currentMapZoomRegion)
          {
            countyZoomData[regionID] = mapDateData[regionID]
            countyZoomData[regionID].voteWorth = 1
          }
        }
      }
      else
      {
        countyZoomData[currentMapZoomRegion] = cloneObject(presidentialMapDateData[popularVoteRegionIDToUse])
        countyZoomData[currentMapZoomRegion].region = currentMapZoomRegion
      }

      return countyZoomData
    }

    var PastElectionResultMapSource = new MapSource(
      "Past-Presidential-Elections", // id
      "Past Elections", // name
      "./csv-sources/past-president.csv", // dataURL
      "https://en.wikipedia.org/wiki/", // homepageURL
      {regular: "./assets/wikipedia-large.png", mini: "./assets/wikipedia-large.png", getOverlayText: () => {
        let currentYear = currentSliderDate.getFullYear()
        return currentYear
      }}, // iconURL
      {
        date: "date",
        region: "region",
        percentAdjusted: "voteshare",
        candidateVotes: "candidatevotes",
        electoralVotes: "ev",
        partyID: "party",
        partyCandidateName: "candidate",
        candidateName: "candidate"
      }, // columnMap
      null, // cycleYear
      electionYearToCandidateData, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      regionIDToLinkHistorical, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      async (rawMapData, mapDates, columnMap, _, candidateNameToPartyIDMap, regionNameToID, __, ___, isCustomMap, voteshareCutoffMargin, shouldIncludeVoteshare) => {
        if (currentViewingState == ViewingState.zooming) {
          await CountyElectionResultMapSource.loadMap()
        } else {
          CountyElectionResultMapSource.loadMap()
        }
        
        return doubleLineVoteshareFilterFunction(rawMapData, mapDates, columnMap, _, candidateNameToPartyIDMap, regionNameToID, __, ___, isCustomMap, voteshareCutoffMargin, shouldIncludeVoteshare)
      }, // organizeMapDataFunction
      null, // viewingDataFunction
      countyZoomingDataFunction, // zoomingDataFunction
      pastElectoralVoteCounts, // splitVoteDataFunction
      {showSplitVotesOnCanZoom: false, showSplitVoteBoxes: false}, // splitVoteDisplayOptions
      countyFormattedRegionName, // getFormattedRegionName
      function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage)
      {
        if (mapDate == null) { return }

        if (regionID && regionID.includes(subregionSeparator))
        {
          regionID = regionID.split(subregionSeparator)[0]
        }

        var linkToOpen = homepageURL + mapDate.getFullYear() + "_United_States_presidential_election"
        if (!shouldOpenHomepage)
        {
          linkToOpen += "_in_" + regionIDToLinkMap[regionID]
        }
        return linkToOpen
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      1.0, // voteshareCutoffMargin
      getPresidentialSVGFromDate, // overrideSVGPath
      null, // shouldSetDisabledWorthToZero
      null, // shouldUseOriginalMapDataForTotalsPieChart
      ViewingState.zooming // shouldForcePopularVoteDisplay
    )

    var HistoricalElectionResultMapSource = new MapSource(
      "Historical-Presidential-Elections", // id
      "Older Elections", // name
      "./csv-sources/historical-president.csv", // dataURL
      "https://en.wikipedia.org/wiki/", // homepageURL
      {regular: "./assets/wikipedia-large.png", mini: "./assets/wikipedia-large.png", getOverlayText: () => {
        let currentYear = currentSliderDate.getFullYear()
        return currentYear
      }}, // iconURL
      {
        date: "date",
        region: "region",
        percentAdjusted: "voteshare",
        electoralVotes: "ev",
        partyCandidateName: "candidate",
        partyID: "party",
        candidateName: "candidate"
      }, // columnMap
      null, // cycleYear
      electionYearToCandidateData, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      regionIDToLinkHistorical, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      doubleLineVoteshareFilterFunction, // organizeMapDataFunction
      async (mapDateData) => {
        if (new Date(getCurrentDateOrToday()).getFullYear() >= 1824)
        {
          return mapDateData
        }
        else
        {
          currentViewingState = ViewingState.splitVote
          return await pastElectoralVoteCounts(mapDateData)
        }
      }, // viewingDataFunction
      null, // zoomingDataFunction
      pastElectoralVoteCounts, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage)
      {
        if (mapDate == null) { return }

        var linkToOpen = homepageURL + mapDate.getFullYear() + "_United_States_presidential_election"
        if (!shouldOpenHomepage)
        {
          linkToOpen += "_in_" + regionIDToLinkMap[regionID]
        }
        return linkToOpen
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      1.0, // voteshareCutoffMargin
      getPresidentialSVGFromDate, // overrideSVGPath
      true // shouldSetDisabledWorthToZero
    )

    var CountyElectionResultMapSource = new MapSource(
      "Presidential-Counties", // id
      "County Results", // name
      "./csv-sources/past-president-county.csv", // dataURL
      "https://en.wikipedia.org/wiki/", // homepageURL
      "./assets/wikipedia-large.png", // iconURL
      {
        date: "date",
        region: "state",
        candidateVotes: "candidatevotes",
        totalVotes: "totalvotes",
        partyID: "party",
        candidateName: "candidate",
        county: "county"
      }, // columnMap
      null, // cycleYear
      electionYearToCandidateData, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDCounty, // regionNameToIDMap
      regionIDToLinkHistorical, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      countyFilterFunction, // organizeMapDataFunction
      countyViewingDataFunction, // viewingDataFunction
      countyZoomingDataFunction, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      (regionID) => {
        if (!regionID.includes(subregionSeparator)) { return regionID }

        let state = regionID.split(subregionSeparator)[0]
        let county = regionID.split(subregionSeparator)[1].replace(/_s$/, "'s").replaceAll("_", " ")

        return county + ", " + state
      }, // getFormattedRegionName
      function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage)
      {
        if (mapDate == null || !regionID.includes(subregionSeparator)) { return }

        var linkToOpen = homepageURL + mapDate.getFullYear() + "_United_States_presidential_election"
        if (!shouldOpenHomepage)
        {
          linkToOpen += "_in_" + regionIDToLinkMap[regionID.split(subregionSeparator)[0]]
        }
        return linkToOpen
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      1.0, // voteshareCutoffMargin
      () => {
        if (currentViewingState == ViewingState.viewing)
        {
          return "svg-sources/usa-governor-map.svg"
        }

        return ["svg-sources/usa-counties-map.svg", currentMapZoomRegion]
      } // overrideSVGPath
    )

    var idsToPartyNames = {}
    var partyNamesToIDs = {}
    for (var partyNum in mainPoliticalPartyIDs)
    {
      if (mainPoliticalPartyIDs[partyNum] == TossupParty.getID()) { continue }

      partyNamesToIDs[politicalParties[mainPoliticalPartyIDs[partyNum]].getNames()[0]] = mainPoliticalPartyIDs[partyNum]
      idsToPartyNames[mainPoliticalPartyIDs[partyNum]] = politicalParties[mainPoliticalPartyIDs[partyNum]].getNames()[0]
    }

    var CustomMapSource = new MapSource(
      "Custom-Presidential", // id
      "Custom", // name
      null, // dateURL
      null, // homepageURL
      {getOverlayText: () => {
        const isPastElectionCompare = showingCompareMap && compareMapSourceIDArray.every(sourceID => 
          sourceID == PastElectionResultMapSource.getID() ||
          sourceID == CountyElectionResultMapSource.getID() ||
          sourceID == HistoricalElectionResultMapSource.getID() ||
          sourceID == CNNResults2024MapSource.getID()
        )
        if (!isPastElectionCompare) { return null }
        
        let compareYears = [$("#firstCompareDataMapDateSlider"), $("#secondCompareDataMapDateSlider")]
          .map(slider => slider.val()-1)
          .map((dateIndex, i) => presidentialMapSources[compareMapSourceIDArray[i]].getMapDates()[dateIndex])
          .map(dateTime => new Date(dateTime).getFullYear())
        
        let compareYearsText = [compareYears[0], "↕️", compareYears[1]]
          .map(text => `<div>${text}</div>`)
          .join("")
        
        return compareYearsText
      }}, // iconURL
      {
        date: "date",
        region: "region",
        disabled: "disabled",
        candidateName: "candidate",
        partyID: "party",
        percentAdjusted: "percent",
        order: "order",
        flip: "flip"
      }, // columnMap
      null, // cycleYear
      partyNamesToIDs, // candidateNameToPartyIDMap
      idsToPartyNames, // shortCandidateNameOverride
      regionNameToIDCustom, // regionNameToIDMap
      null, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      doubleLineVoteshareFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      async (mapDateData, regionID, isZoomCheck, date) => {
        const allSourcesCanZoom = 
          showingCompareMap
          && compareMapSourceIDArray[0] != "Custom-Presidential"
          && compareMapSourceIDArray[1] != "Custom-Presidential"
          && await presidentialMapSources[compareMapSourceIDArray[0]].canZoom(null, regionID)
          && await presidentialMapSources[compareMapSourceIDArray[1]].canZoom(null, regionID)
        
        if (isZoomCheck)
        {
          return allSourcesCanZoom
        }
        else if (showingCompareMap)
        {
          if (!allSourcesCanZoom)
          {
            zoomOutMap()
            return null
          }
          
          if (compareResultCustomMapSource?.getID() != CustomCountyMapSource.getID())
          {
            compareResultCustomMapSource = CustomCountyMapSource
            shouldSetCompareMapSource = false
            await updateCompareMapSources([true, true], true, false, [$("#firstCompareDataMapDateSlider").val(), $("#secondCompareDataMapDateSlider").val()])
            
            shouldSetCompareMapSource = true
          }
        }
        
        let countyZoomingData = await countyZoomingDataFunction(mapDateData, regionID, isZoomCheck, date, CustomCountyMapSource)
        if (showingCompareMap)
        {
          delete countyZoomingData[regionID + subregionSeparator + statePopularVoteDistrictID]
        }
        return countyZoomingData
      }, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      (regionID) => {
        if (!regionID.includes(subregionSeparator)) { return regionID }
      
        let state = regionID.split(subregionSeparator)[0]
        let county = regionID.split(subregionSeparator)[1].replace(/_s$/, "'s").replaceAll("_", " ")
      
        return county + ", " + state
      }, // getFormattedRegionName
      null, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      customMapConvertMapDataToCSVFunction, // convertMapDataRowToCSVFunction
      true, // isCustomMap
      false, // shouldClearDisabled
      null, // shouldShowVoteshare
      null, // voteshareCutoffMargin
      getPresidentialSVGFromDate, // overrideSVGPath
      true // shouldSetDisabledWorthToZero
    )
    
    var CustomCountyMapSource = new MapSource(
      "Custom-Presidential-Counties", // id
      "Custom County", // name
      null, // dataURL
      null, // homepageURL
      null, // iconURL
      {
        date: "date",
        region: "state",
        candidateVotes: "candidatevotes",
        totalVotes: "totalvotes",
        partyID: "party",
        candidateName: "candidate",
        county: "county",
        order: "order",
        disabled: "disabled",
        flip: "flip"
      }, // columnMap
      null, // cycleYear
      partyNamesToIDs, // candidateNameToPartyIDMap
      idsToPartyNames, // shortCandidateNameOverride
      regionNameToIDCounty, // regionNameToIDMap
      null, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      countyFilterFunction, // organizeMapDataFunction
      countyViewingDataFunction, // viewingDataFunction
      (presidentialMapDateData, regionID, isZoomCheck, date) => {
        return countyZoomingDataFunction(presidentialMapDateData, regionID, isZoomCheck, date, CustomCountyMapSource)
      }, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      (regionID) => {
        if (!regionID.includes(subregionSeparator)) { return regionID }
      
        let state = regionID.split(subregionSeparator)[0]
        let county = regionID.split(subregionSeparator)[1].replace(/_s$/, "'s").replaceAll("_", " ")
      
        return county + ", " + state
      }, // getFormattedRegionName
      null, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      customCountyMapConvertMapDataToCSVFunction, // convertMapDataRowToCSVFunction
      true, // isCustomMap
      false, // shouldClearDisabled
      null, // shouldShowVoteshare
      null, // voteshareCutoffMargin
      () => {
        if (currentViewingState == ViewingState.viewing)
        {
          return "svg-sources/usa-governor-map.svg"
        }
    
        return ["svg-sources/usa-counties-map.svg", currentMapZoomRegion]
      }, // overrideSVGPath
      true // shouldSetDisabledWorthToZero
    )

    var todayDate = new Date()
    CustomMapSource.setTextMapData("date\n" + (todayDate.getMonth()+1) + "/" + todayDate.getDate() + "/" + todayDate.getFullYear())

    var presidentialMapSources = {}
    presidentialMapSources[CNNResults2024MapSource.getID()] = CNNResults2024MapSource
    presidentialMapSources[FiveThirtyEightPollAverage2020MapSource.getID()] = FiveThirtyEightPollAverage2020MapSource
    presidentialMapSources[FiveThirtyEightProjection2020MapSource.getID()] = FiveThirtyEightProjection2020MapSource
    presidentialMapSources[FiveThirtyEightProjection2024MapSource.getID()] = FiveThirtyEightProjection2024MapSource
    presidentialMapSources[CookProjection2020MapSource.getID()] = CookProjection2020MapSource
    presidentialMapSources[PolymarketPrices2024MapSource.getID()] = PolymarketPrices2024MapSource
    presidentialMapSources[PastElectionResultMapSource.getID()] = PastElectionResultMapSource
    presidentialMapSources[HistoricalElectionResultMapSource.getID()] = HistoricalElectionResultMapSource
    presidentialMapSources[CountyElectionResultMapSource.getID()] = CountyElectionResultMapSource
    presidentialMapSources[CustomMapSource.getID()] = CustomMapSource
    presidentialMapSources[CustomCountyMapSource.getID()] = CustomCountyMapSource

    const presidentialMapCycles = [2024, 2020]
    const presidentialMapSourceIDs = {
      2024: [FiveThirtyEightProjection2024MapSource.getID(), PolymarketPrices2024MapSource.getID()],
      2020: [FiveThirtyEightPollAverage2020MapSource.getID(), FiveThirtyEightProjection2020MapSource.getID(), CookProjection2020MapSource.getID()],
      [allYearsCycle]: [PastElectionResultMapSource.getID(), HistoricalElectionResultMapSource.getID(), CustomMapSource.getID()]
    }
    
    const kPastElectionsVsPastElections = 1
    const kPastElectionsVs538Projection = 2

    var defaultPresidentialCompareSourceIDs = {}
    defaultPresidentialCompareSourceIDs[kPastElectionsVsPastElections] = [PastElectionResultMapSource.getID(), PastElectionResultMapSource.getID()]
    defaultPresidentialCompareSourceIDs[kPastElectionsVs538Projection] = [PastElectionResultMapSource.getID(), FiveThirtyEightProjection2024MapSource.getID()]

    return {mapSources: presidentialMapSources, mapSourceIDs: presidentialMapSourceIDs, mapCycles: presidentialMapCycles, defaultCompareSourceIDs: defaultPresidentialCompareSourceIDs, customSourceID: CustomMapSource.getID()}
  }
)

const incumbentChallengerPartyIDs = {incumbent: RepublicanParty.getID(), challenger: DemocraticParty.getID(), tossup: TossupParty.getID()}
