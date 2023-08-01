#*********************************************************
#             Main Workflow of Aggregation Step
#*********************************************************

#*********************************************************
rm(list=objects())

# Libraries
library (XML)
library(foreach)
library(doParallel)
library(stringr)
library(suncalc)

#*********************************************************
#            Run the main application
#*********************************************************
rm(list=objects())

# get the source path to know from which path to include sources
currentPath <- paste0(getwd() , '/')
print (currentPath)

# Import Modules
source(paste0(currentPath, "ParallelMethods.R"))
source(paste0(currentPath, "Data.Management.R"))
source(paste0(currentPath, "XML.Management.R"))
source(paste0(currentPath, "OptionParsing.R"))
source(paste0(currentPath, "Converters.R"))
source(paste0(currentPath, "Source.Management.R"))
source(paste0(currentPath, "MathMethods_WeakChecks.R"))
source(paste0(currentPath, "Aggregation/AggregationByStation.R"))
source(paste0(currentPath, "Aggregation/Aggregation.Formulas.R"))

# Set UTC time zone
Sys.setenv(TZ = "UTC")

# parse the command line options
options <- Aggregation.Command.Parse()

# define the level
checks.level <- 'Aggregation'

# create the log file and log the input options
log.file <- file( paste0(options[1, ]$LogPath, checks.level, format(Sys.time(), "%Y%m%d%H%M"), '.log'), open="a")
Log.Options (options, log.file)

# Read input file to a data table
input.filename <- paste0(options[1, "InputPath"], options[1, "InputFile"])
input.data <- read.table(input.filename, header=TRUE)
cat(paste0('[', Sys.time(), ']I| Input data converted to data.table.'), file = log.file, sep="\n")

# retrieve the elaboration date from file name with the structure O.WeakChecks.<date>.dat
input.file <- toString(options[1, "InputFile"])
current.date <- strptime(unlist(strsplit(input.file, "[.]"))[3], "%Y%m%d")

hourly.flags <- NULL
# read the flags file for current day
hourly.flags.file <- paste0(options[1, "InputPath"], "Flags.WeakChecks.", format(current.date, "%Y%m%d"), ".dat")
if (file.exists(hourly.flags.file))
{
  hourly.flags <- read.table(hourly.flags.file, header = TRUE)
  cat(paste0('[', Sys.time(), ']I| Hourly flags data read to data.table.'), file = log.file, sep="\n")
}

# read flags for previous day
hourly.flags.file <- paste0(options[1, "HistoryPath"], "H.Flags.", format(current.date - 24 * 3600, "%Y%m%d"), ".hist")
if (file.exists(hourly.flags.file))
{
  hourly.flags.hist <- read.table(hourly.flags.file, header = TRUE)
  cat(paste0('[', Sys.time(), ']I| Hourly flags data read to data.table for date .', format(current.date - 24 * 3600, "%Y%m%d")), file = log.file, sep="\n")
  hourly.flags <- merge(x = hourly.flags,
                        y = hourly.flags.hist,
                        by.x = colnames(hourly.flags),
                        by.y = colnames(hourly.flags.hist),
                        all = TRUE)
}

# read flags for next day
hourly.flags.file <- paste0(options[1, "HistoryPath"], "H.Flags.", format(current.date + 24 * 3600, "%Y%m%d"), ".hist")
if (file.exists(hourly.flags.file))
{
  hourly.flags.hist <- read.table(hourly.flags.file, header = TRUE)
  cat(paste0('[', Sys.time(), ']I| Hourly flags data read to data.table for date .', format(current.date + 24 * 3600, "%Y%m%d")), file = log.file, sep="\n")
  hourly.flags <- merge(x = hourly.flags,
                        y = hourly.flags.hist,
                        by.x = colnames(hourly.flags),
                        by.y = colnames(hourly.flags.hist),
                        all = TRUE)
}


# Get the unique station codes for which input file contains observations
input.stations <- unique(input.data[,"Station"])

# station filter
#input.stations <- input.stations[ input.stations == 1223]

# Load the station data from CONFIG path
station.file <- paste0(options[1, "ConfigPath"], "Stations.xml")
stations.df <- LoadStations(station.file)
cat(paste0('[', Sys.time(), ']I| Station data loaded.'), file = log.file, sep="\n")

# Step 1: read the aggregation configuration
agg.config <- saveXML(xmlParse(paste0(options[1, "ConfigPath"], "Aggregation.xml")))
cat(paste0('[', Sys.time(), ']I| Aggregation configurations load.'), file = log.file, sep="\n")

#retrieve aggregation columns
agg.columns <- RetrieveAggregationColumnNames(agg.config)
agg.columns <- c("Station", "DayTime", agg.columns)

# Step 2: detect number of cores (processor) to be used for the cluster
# iF exists less than 2 cores than will use 1 core for the cluster
no_cores <- detectCores()
tryCatch(
  {
    if (no_cores <= 0) no_cores <- 1

    if (is.na(options[1, "CoreNumber"]))
    {
      if (no_cores > 2) no_cores <- no_cores - 2
    }
    else if (!is.na(options[1, "CoreNumber"]))
    {
      options_core = as.integer(as.character(options[1, "CoreNumber"]))
      if (no_cores >= options_core) no_cores <- options_core
    }
  }
  ,error = function (err)
  {
    stop('Error detecting cores: ', err)
  })


cat(paste0('[', Sys.time(), ']I| ', no_cores, ' cores used for parallel ellaboration.'), file = log.file, sep="\n")

# start elaboration for current date
cat(paste0('[', Sys.time(), ']I| Manage observations for date:', format(current.date, "%Y%m%d")), file = log.file, sep="\n")

# load the history file of the previous day
history.file <- paste0(options[1, "HistoryPath"], 'H.', format(current.date  - 3600 * 24, "%Y%m%d"), ".hist")
history.data.db <- data.frame()
if (file.exists(history.file)) {
  history.data.db <- read.table (history.file,
                           header=TRUE,
                           col.names = c("Station", "DayTime", "TT",  "TD", "TX1", "TN1", "TX6", "TN6", "TX12", "TN12", "PREC", "PR24", "PR06", "RR", "TR", "SNOW", "DIR", "FF", "N", "L","RD", "RD24", "AP", "QFF", "SH", "SH24", "VIS", "RH", "D_E", "D_RH", "D_VPD", "D_SLOPE", "SOIL"))
  cat(paste0('[', Sys.time(), ']I|  Loaded history file:', history.file), file = log.file, sep="\n")
}

if (!file.exists(history.file))
{
  cat(paste0('[', Sys.time(), ']W| Missing History file:', history.file), file = log.file, sep="\n")
}

# load the history file of the successive day
history.file <- paste0(options[1, "HistoryPath"], 'H.', format(current.date  + 3600 * 24, "%Y%m%d"), ".hist")
history.data.dn <- data.frame()
if (file.exists(history.file)) {
  history.data.dn <- read.table (history.file,
                              header=TRUE,
                              col.names = c("Station", "DayTime", "TT",  "TD", "TX1", "TN1", "TX6", "TN6", "TX12", "TN12", "PREC", "PR24", "PR06", "RR", "TR", "SNOW", "DIR", "FF", "N", "L", "RD", "RD24", "AP", "QFF", "SH", "SH24", "VIS", "RH", "D_E", "D_RH", "D_VPD", "D_SLOPE", "SOIL"))
  cat(paste0('[', Sys.time(), ']I|  Loaded history file:', history.file), file = log.file, sep="\n")
}

if (!file.exists(history.file))
{
  cat(paste0('[', Sys.time(), ']W| Missing History file:', history.file), file = log.file, sep="\n")
}

# check for the MOS PATH and file
mosdata <- NULL
if (!is.na(options[1, "MOSPath"]))
{
  mosfile <- paste0(options[1, "MOSPath"], "MOS.", format(current.date, "%Y%m%d"), ".dat")
  if (!file.exists(mosfile))
  {
    mosfile <- paste0(options[1, "MOSPath"], "M.MG.", format(current.date, "%Y%m%d"), ".csv")
    if (!file.exists(mosfile))
    {
      cat(paste0('[', Sys.time(), ']W| Missing MOS file ', mosfile), file = log.file, sep="\n")
    }
    else
    {
      mos.datfile <- Input.MG.MOS.Converter(options[1, "MOSPath"],
                                            paste0("M.MG.", format(current.date, "%Y%m%d"), ".csv"),
                                            format(current.date, "%Y%m%d"),
                                            stations.df[, "StationNumber"])
      mosdata <- read.table(mos.datfile, header = TRUE)
    }
  }
  else
  {
    mosdata <- read.table(mosfile, header = TRUE)
  }
}

# create the cluster with debug output file
cl<-makeCluster(no_cores, outfile=paste0(options[1, "LogPath"], "debug.", checks.level, ".", format(Sys.time(), "%Y%m%d%H%M") , ".txt"))
registerDoParallel(cl)

# load data to the cluster(messages configuration, errors of the date, workflow configuration)
clusterExport(cl=cl, varlist=c("agg.config"))
clusterExport(cl=cl, varlist=c("agg.columns"))
#clusterExport(cl=cl, varlist=c("log.file"))
clusterExport(cl=cl, varlist=c("stations.df"))
clusterExport(cl=cl, varlist=c("currentPath"))
cat(paste0('[', Sys.time(), ']I|  Cluster created.'), file = log.file, sep="\n")

# run the parallel elaboration for the current date
data.list <- foreach(s = 1:length(input.stations), .packages="XML") %dopar%
{
  # extract data for current station and eventually merge it with station's historical data
  station.data <- subset(input.data, Station == input.stations[s])
  if ( nrow(history.data.db) > 0)
  {
    hist.station.data <- subset(history.data.db, Station == input.stations[s])
    station.data <-  merge(x = station.data,
                           y = hist.station.data,
                           by.x = colnames(station.data),
                           by.y = colnames(hist.station.data),
                           all = TRUE)
  }

  if ( nrow(history.data.dn) > 0)
  {
    hist.station.data <- subset(history.data.dn, Station == input.stations[s])
    station.data <-  merge(x = station.data,
                           y = hist.station.data,
                           by.x = colnames(station.data),
                           by.y = colnames(hist.station.data),
                           all = TRUE)
  }

  # retrieve MOS data for specific station
  mos.station <- NULL
  if (!is.null(mosdata))
  {
    mos.station <- subset(mosdata, Station == input.stations[s])
    mos.station <- subset(mos.station, select = c("Station", "DayTime", "TN", "TX"))
  }
  else
  {
    mos.station <- as.data.frame(matrix(ncol=4, nrow=0))
  }

  # hourly flags data for the station
  hf.data <- NULL
  if (!is.null(hourly.flags)) { hf.data <- subset(hourly.flags, hourly.flags$Station == input.stations[s]) }

  # run the aggregation for current station
  Parallel.Aggregation.Elaboration(station.data, input.stations[s], current.date, mos.station, hf.data)
}

# stop the cluster
stopCluster(cl)
cat(paste0('[', Sys.time(), ']I|  Cluster stopped'), file = log.file, sep="\n")

#release some memory
#rm(hourly.flags)
#rm(input.data)

# manage the aggregated data and daily flags
# data.frame for real data
data.df <- as.data.frame (matrix (nrow = 0, ncol = length(agg.columns)))
colnames(data.df) <- agg.columns

# data.frame for flags
flags.df <- as.data.frame(matrix(nrow = 0,ncol = 4))
colnames(flags.df) <- c("Station", "DayTime", "Property", "Flags")

# manage all answers
for (i in 1:length(data.list))
{
  # manage the real data data.frame
  tryCatch(
    {
      l.data.df <- as.data.frame(data.list[[i]][[1]])
      if (nrow(l.data.df) > 0)
      {
        data.df <- rbind (data.df, as.data.frame(data.list[[i]][[1]]))
      }
    },error = function (err)
    {
      print (paste0('Data - Error : ', i, err))
      return (NULL)
    }
    ,warning = function (warn)
    {
      print (paste0('Data - Warning: ', i, warn))
      return (NULL)
    }
  )

  # manage the flags data.frame
  tryCatch(
    {
      l.flags.df <- as.data.frame(data.list[[i]][[2]])
      if (nrow(l.flags.df) > 0)
      {
        flags.df <- rbind(flags.df, l.flags.df)
      }
    },error = function (err)
    {
      print (paste0('Flags - Error : ', i, err))
      return (NULL)
    }
    ,warning = function (warn)
    {
      print (paste0('Flags - Warning: ', i, warn))
      return (NULL)
    }
  )
}

# check the final values for TMIN & TMAX
tntx_indexes = which(!is.na(data.df$TN) & !is.na(data.df$TX) & as.numeric(data.df$TN) > as.numeric(data.df$TX))

# manage the EUR region of interest
if (length(tntx_indexes) > 0 & options[1, "RegionOfInterest"] == "EUR")
{
  cat(paste0('[', Sys.time(), ']I|  Found ', length(tntx_indexes), ' cases for TMIN > TMAX'), file = log.file, sep="\n")

  # calculates the dates for TN and TX intervals
  date_19UTC_pd = current.date - 5 * 3600
  date_18UTC_cd = current.date + 18 * 3600
  date_07UTC_cd = current.date + 7 * 3600
  date_06UTC_nd = current.date + 30 * 3600

  h3_tn_times <- c()
  h3_tx_times <- c()
  for(x in 1:8)
  {
    xn = as.integer(format(current.date - 3*3600 + (x-1)*3*3600, "%Y%m%d%H"))
    xt = as.integer(format(current.date + 9*3600 + (x-1)*3*3600, "%Y%m%d%H"))
    h3_tn_times <- c( xn, h3_tn_times)
    h3_tx_times <- c( xt, h3_tx_times)
  }

  for(r in 1:length(tntx_indexes))
  {
    #recalculate the TMIN and TMAX for each station for which TMIN > TMAX
    station.index  <- tntx_indexes[r]
    station.number <- data.df[station.index, "Station"]

    station.data <- input.data[ which(input.data$Station == station.number), ]
    hist.station.data <- history.data.db[ which(history.data.db$Station == station.number), ]
    if (nrow(hist.station.data) > 0) {
    station.data <-  merge(x = station.data,
                           y = hist.station.data,
                           by.x = colnames(station.data),
                           by.y = colnames(hist.station.data),
                           all = TRUE)
    }

    hist.station.data <- history.data.dn[ which(history.data.dn$Station == station.number), ]
    if (nrow(hist.station.data) > 0) {
      station.data <-  merge(x = station.data,
                             y = hist.station.data,
                             by.x = colnames(station.data),
                             by.y = colnames(hist.station.data),
                             all = TRUE)
    }

    #recalculate TMIN using the time interval 19 UTC previous day - 18 UTC current day
    data_tn <- station.data[ which(strptime(station.data$DayTime, "%Y%m%d%H") >= date_19UTC_pd &
                                   strptime(station.data$DayTime, "%Y%m%d%H") <= date_18UTC_cd), ]
    calculate_tn <- length( which(!is.na(data_tn[, "TT"])) ) / 24.0
    
    new_tn <- NA
    if (calculate_tn >= 0.8) {
      new_tn = min(data_tn[, "TT"], na.rm = TRUE)      
      if (new_tn >= as.numeric(data.df[station.index, "TN"])) { new_tn = NA }
    } else {
      #check for 3 hours values
      data_tn <- station.data[ which(station.data$DayTime %in% h3_tn_times), ]
      calculate_tn <- length( which(!is.na(data_tn[, "TT"]))) / 8.0
      if (calculate_tn >= 0.8)
      {
        new_tn = min(data_tn[, "TT"], na.rm = TRUE)
        if (new_tn >= as.numeric(data.df[station.index, "TN"])) { new_tn = NA }
      }
    }

    if (is.na(new_tn)) {
      cat(paste0('[', Sys.time(), ']W| Cannot recalculate the TMIN for station ', station.number ), file = log.file, sep="\n")
    }
    else {
      cat(paste0('[', Sys.time(), ']I|  Station:', station.number, ', New TMIN value: ', new_tn, ' replacing the calculated TMIN: ', data.df[ station.index, "TN"]), file = log.file, sep="\n")
      data.df[ station.index, "TN"] = new_tn
    }

    data_tx <- station.data[ which(strptime(station.data$DayTime, "%Y%m%d%H") >= date_07UTC_cd &
                                     strptime(station.data$DayTime, "%Y%m%d%H") <= date_06UTC_nd), ]
    calculate_tx <- length( which(!is.na(data_tn[, "TT"])) ) / 24.0
	
    new_tx <- NA
    if (calculate_tx >= 0.8) {
      new_tx = max(data_tx[, "TT"], na.rm=TRUE)
      if (new_tx <= as.numeric(data.df[station.index, "TX"])) { new_tx = NA }
    }
    else {
      data_tx <- station.data[ which(station.data$DayTime %in% h3_tx_times), ]
      calculate_tx <- length( which(!is.na(data_tx[, "TT"]))) / 8.0
      if (calculate_tx >= 0.8)
      {
        new_tx = max(data_tx[, "TT"], na.rm=TRUE)
        if (new_tx <= as.numeric(data.df[station.index, "TX"])) { new_tx = NA }
      }
    }

    if (!is.na(new_tx))
    {
      cat(paste0('[', Sys.time(), ']I|  Station:', station.number, ', New TMAX value: ', new_tx, ' replacing the calculated TMAX: ', data.df[ station.index, "TX"]), file = log.file, sep="\n")
      data.df[ station.index, "TX"] = new_tx
    }
    else {
      cat(paste0('[', Sys.time(), ']W| Cannot recalculate the TMAX for station ', station.number ), file = log.file, sep="\n")
    }
  }
}

# Manage DAT file for current date
dat.filename <- paste0(options[1, "OutputPath"], "O.", checks.level, "." , format(current.date, "%Y%m%d"), ".dat", sep="")
if (file.exists(dat.filename)) file.remove((dat.filename))
write.table(data.df, file=dat.filename, sep="\t", row.names = FALSE, col.names = TRUE, quote=FALSE)
cat(paste0('[', Sys.time(), ']I| DAT file created:', dat.filename), file = log.file, sep="\n")

# save flags to file
flags.filename <- paste0(options[1, "OutputPath"], "Flags.", checks.level, "." , format(current.date, "%Y%m%d"), ".dat", sep="")
if (file.exists(flags.filename)) file.remove((flags.filename))
write.table(flags.df, file=flags.filename, sep="\t", row.names = FALSE, col.names = TRUE, quote=FALSE)
cat(paste0('[', Sys.time(), ']I| Flags file created:', flags.filename), file = log.file, sep="\n")

cat(paste0('[', Sys.time(), ']I| Process end'), file = log.file, sep="\n")
close(log.file)
