#*********************************************************
#             Source management Module
#*********************************************************
library(XML)

#*********************************************************
# Load source modules from an XML for a specific step
# wk.FileName   [INPUT]   [STRING]  workflow file name
# wkStep        [INPUT]   [STRING]  step name
# wkSourcePath  [INPUT]   [STRING]  path of source files
#               [RETURN]  [DATA.FRAME] Data frame with step configuration
#*********************************************************
LoadSources <- function (wk.FileName, wkStep, wkSourcePath)
{
	xml.wk <- xmlTreeParse(wk.FileName, useInternalNodes=TRUE)

	checks <- xpathApply(xml.wk, paste0('//Workflow/', wkStep, '/Check[Status=\"ON\"]'), extractCheckDataFromXml)
	checks.df <- do.call(rbind, checks)

	if (!is.null(checks.df))
	{
	  for (src in 1:nrow(checks.df))
	  {
  	  source.filename <- paste0(wkSourcePath, checks.df[src, "moduleSource"])
	    source( source.filename )
  	}
	}

	# remove xml and df from memory
	rm (xml.wk)

	return (checks.df)
}

#*********************************************************
# Extract from CheckNode the most important data. The
# structure of Check node are :
#
#<Check>
#	<Name>Air Temperature</Name>
#	<Module>AitTemperature_WeakChecks.R</Module>
#	<Method>WeakChecks.CheckAirTemperature</Method>
#</Check>
#*********************************************************
extractCheckDataFromXml <- function(x)
{
	moduleName <- xmlValue(getNodeSet(x, "Name")[[1]])
	moduleSource <- xmlValue(getNodeSet(x, "Module")[[1]])
	moduleMethod <- xmlValue(getNodeSet(x, "Method")[[1]])
	data.frame( moduleName, moduleSource, moduleMethod)
}


#*********************************************************
# Load stations data from an XML file
# st.fileName   [INPUT]   [STRING]  file name with stations data
#               [RETURN]  [DATA.FRAME] Data frame with station data
#*********************************************************
LoadStations <- function (st.fileName)
{
  stCache.fName = paste0(st.fileName, ".rds")
  #st.mTime = file.mtime(st.fileName)

  # Check if cached version exists
  if (file.exists(stCache.fName))
    #& file.mtime(stCache.fName) == st.mTime)
  {
    cat("Loading stations from cache\n");
    stations.df <- readRDS(stCache.fName)
  } else {
    cat("Loading stations from XML");

    stations.xml <- xmlTreeParse(st.fileName, useInternalNodes=TRUE)

    stations.list <- xpathApply(stations.xml, '//STATIONS/STATION', extractStationDataFromXml)
    stations.df <- do.call(rbind, stations.list)

    # remove xml from memory
    rm (stations.xml)

    # Cache version for furuther usage
    cat("Saving stations to data frame cache\n")
    saveRDS(stations.df, file = stCache.fName);
    #Sys.setFileTime(stCache.fName, st.mTime);
  }

  cat(paste0("Loaded ", nrow(stations.df), " stations"));
  return (stations.df)
}

#*********************************************************
# Extract from STATION node the most important data. The
# structure of STATION node are :
#
#<STATION>
#	<STATION_NUMBER>Station number</STATION_NUMBER>
#	<WMO_NO>WMO Station number</WMO_NO>
#	<LATITUDE>Latitude</LATITUDE>
#	<LONGITUDE>Longitude</LONGITUDE>
#	<ALTITUDE>Altitude</ALTITUDE>
#	<ANGSTROM_A>Angstrom A Constant</ANGSTROM_A>
#	<ANGSTROM_B>Angstrom B Constant</ANGSTROM_B>
#	<SUPIT_A>Supit A Constant</SUPIT_A>
#	<SUPIT_B>Supit B Constant</SUPIT_B>
#	<SUPIT_C>Supit C Constant</SUPIT_C>
#	<HARGREAVES_A>Hargreaves A Constant</HARGREAVES_A>
#	<HARGREAVES_B>Hargreaves B Constant</HARGREAVES_B>
#</STATION>
#*********************************************************
extractStationDataFromXml <- function(x)
{
  StationNumber <- as.integer(xmlValue(getNodeSet(x, "STATION_NUMBER")[[1]]))
  WmoNumber <- as.integer(xmlValue(getNodeSet(x, "WMO_NO")[[1]]))
  Latitude <- as.numeric(xmlValue(getNodeSet(x, "LATITUDE")[[1]]))
  Longitude <- as.numeric(xmlValue(getNodeSet(x, "LONGITUDE")[[1]]))
  Altitude <- as.numeric(xmlValue(getNodeSet(x, "ALTITUDE")[[1]]))
  AngstromA <- as.numeric(xmlValue(getNodeSet(x, "ANGSTROM_A")[[1]]))
  AngstromB <- as.numeric(xmlValue(getNodeSet(x, "ANGSTROM_B")[[1]]))
  SupitA <- as.numeric(xmlValue(getNodeSet(x, "SUPIT_A")[[1]]))
  SupitB <- as.numeric(xmlValue(getNodeSet(x, "SUPIT_B")[[1]]))
  SupitC <- as.numeric(xmlValue(getNodeSet(x, "SUPIT_C")[[1]]))
  HargreavesA <- as.numeric(xmlValue(getNodeSet(x, "HARGREAVES_A")[[1]]))
  HargreavesB <- as.numeric(xmlValue(getNodeSet(x, "HARGREAVES_B")[[1]]))
  EULatitude <- as.numeric(xmlValue(getNodeSet(x, "EU_LATITUDE")[[1]]))
  EULongitude <- as.numeric(xmlValue(getNodeSet(x, "EU_LONGITUDE")[[1]]))

  data.frame( StationNumber, WmoNumber, Latitude, Longitude, Altitude, AngstromA, AngstromB, SupitA, SupitB, SupitC, HargreavesA, HargreavesB, EULatitude, EULongitude)
}
