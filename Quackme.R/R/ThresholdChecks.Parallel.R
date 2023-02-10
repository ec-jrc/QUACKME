#*********************************************************
#             Main Workflow of Threshold Checks
#*********************************************************
# Libraries
library (XML)
library(foreach)
library(doParallel)
library(stringr)
library(alphahull)
library(rgdal)
library(sp)
library(cluster)
library(EMCluster)
library(tripack)

#*********************************************************
#            Run the main application
#*********************************************************
rm(list=objects())

# get the source path to know from which path to include sources
currentPath <- paste0(getwd() , '/')

# Import Modules

source(paste0(currentPath, "ParallelMethods.R"))
source(paste0(currentPath, "Data.Management.R"))
source(paste0(currentPath, "Converters.R"))
source(paste0(currentPath, "Source.Management.R"))
source(paste0(currentPath, "XML.Management.R"))
source(paste0(currentPath, "OptionParsing.R"))
source(paste0(currentPath, "ConvexHull.Management.R"))
source(paste0(currentPath, "Flags.Management.R"))

# Set UTC time zone
Sys.setenv(TZ = "UTC")

# parse the command line options
options <- ThresholdChecks.Command.Parse()

# define the level
checks.level <- 'ThresholdChecks'

# create the log file and log the input options
log.file <- file( paste0(options[1, ]$LogPath, checks.level, format(Sys.time(), "%Y%m%d%H%M"), '.log'), open="a")
Log.Options (options, log.file)

# Load sources for specific checks level
sources.df <- LoadSources( paste0(options[1, "ConfigPath"], "Workflow.xml"), checks.level, paste0(currentPath, checks.level, "/"))
sources.methods <- as.vector (sources.df$moduleMethod)
if (is.null(sources.df))
{
  cat(paste0('[', Sys.time(), ']I| Missing workflow active configuration for TresholdChecks !'), file = log.file, sep="\n")
  stop("Missing workflow active configuration for TresholdChecks")
}
cat(paste0('[', Sys.time(), ']I| Workflow configurations load.'), file = log.file, sep="\n")

# Load the aggregation properties
# Read aggregation configuration file
agg.config <- saveXML(xmlParse(paste0(options[1, "ConfigPath"], "Aggregation.xml")))
cat(paste0('[', Sys.time(), ']I| Aggregation configurations load.'), file = log.file, sep="\n")

#retrieve aggregation columns
agg.columns <- RetrieveAggregationColumnNames(agg.config)
properties.names <- c("Station", "DayTime", agg.columns)

#.b Prepare input data
input.filename <- paste0(options[1, "InputPath"], options[1, "InputFile"])
input.file <- toString(options[1, "InputFile"])

#. get the input file extension
input.ext  <- str_sub( input.file, - 3)

#. get the current date
current.date <- strptime(options[1, ]$ReferenceDate, "%Y%m%d")

# load daily flags if exists or create empty structure
df.flags <- NULL
flags.filename <- paste0(options[1, "InputPath"], "Flags.HeavyChecks.", format(current.date, "%Y%m%d"), ".dat")
if (file.exists(flags.filename))
{
  df.flags <- read.table(flags.filename, header = TRUE, stringsAsFactors = FALSE)
  cat(paste0('[', Sys.time(), ']I| Flags data loaded.'), file = log.file, sep="\n")
} else  {
  df.flags <- as.data.frame(matrix(nrow=0, ncol=4))
  colnames(df.flags) <- c("Station", "DayTime", "Property", "Flags")
}

# if the input file is an XML file transform it into DAT format
input.xml <- NULL
df.errors <- NULL
if (input.ext == "xml")
{

  # check if the input xml is empty
  xmlErrors <- xmlParse(input.filename)
  if ( length( getNodeSet(xmlErrors, "//Observation")) == 0)
  {
    cat (cat(paste0('[', Sys.time(), ']I| XML input file is empty. The exceution are stopped'), file = log.file, sep="\n"))
    quit(status = 0)
  }

  # create the DAT filename
  dat.filename <- paste0(options[1, "OutputPath"], "KO.", checks.level, ".", format(current.date, "%Y%m%d"), ".dat")
  if (file.exists(dat.filename)) file.remove(dat.filename)

  # convert input XML to DAT file
  # convert input XML to DAT file and update flags if necessary
  d.list <- Output.ThresholdChecks.Xml2DataFrame ( paste0(options[1, "InputPath"], options[1, "InputFile"]), dat.filename, df.flags)
  df.errors <- d.list[[1]]
  df.flags  <- d.list[[2]]

  # override the input.file and input.filename with DAt info
  input.file <- paste0("KO.", checks.level , ".", format(current.date, "%Y%m%d"), ".dat")
  input.filename <- paste0( options[1, "OutputPath"], input.file)
  cat (cat(paste0('[', Sys.time(), ']I| XML input file converted to dat file.'), file = log.file, sep="\n"))
}

# load the input data
input.data <- read.table(input.filename, header=TRUE, stringsAsFactors = FALSE)
input.cols <- colnames(input.data)

# check if some new property was added Aggregation.XML of some property was removed
for (c in 1:length(properties.names))
{
  # property is new, add to the input filled by NA
  if (! (properties.names[c] %in% input.cols))
  {
    input.data[, properties.names[c]] <- NA
  }
}
cat(paste0('[', Sys.time(), ']I| Input data converted to data.table.'), file = log.file, sep="\n")
cat(paste0('[', Sys.time(), ']I| Current elaboration date: ', current.date), file = log.file, sep="\n")

# Get the unique station codes for which input file contains observations
input.stations <- unique(input.data[,"Station"])

# station filter
#input.stations <- input.stations[ input.stations == 1209 ] # | input.stations == 4096 | input.stations == 6201]

# Read the alert messages configuration
df.daily.msg <- xmlToDataFrame(paste0(options[1, "ConfigPath"], "Messages.Daily.", checks.level, ".xml"), stringsAsFactors = FALSE)
df.seasons.msg <- xmlToDataFrame(paste0(options[1, "ConfigPath"], "Messages.Seasons.", checks.level, ".xml"), stringsAsFactors = FALSE)
cat(paste0('[', Sys.time(), ']I| Messages configurations load.'), file = log.file, sep="\n")

# Retrieve the station data of previous day
hist.date <- current.date - 24 * 3600
hist.file <- paste0( options[1, "HistoryPath"], "D.", format(hist.date, "%Y%m%d"), ".hist")
input.hist <- NULL
if (file.exists(hist.file))
{
  input.hist <- read.table(hist.file, header=TRUE, stringsAsFactors = FALSE)
  hist.columns <- colnames(input.hist)
  #add missing columns to the history
  for (c in 1:length(properties.names))
  {
    # property is new, add to the input filled by NA
    if (! (properties.names[c] %in% hist.columns))
    {
      input.hist[, properties.names[c]] <- NA
    }
  }

  cat(paste0('[', Sys.time(), ']I| History file ', hist.file, ' converted to data.table.'), file = log.file, sep="\n")
} else {
  cat(paste0('[', Sys.time(), ']I| History file - ', hist.file, 'missing!'), file = log.file, sep="\n")
}

# Retrieve the threshold files
th.daily.fileName <- paste0(options[1, "ConfigPath"], "Threshold.Daily.dat")
th.seasons.fileName <- paste0(options[1, "ConfigPath"], "Threshold.Seasons.dat")
#th.5best.fileName <- paste0(options[1, "ConfigPath"], "Threshold.5Best.dat")

# check threshold file presence
if (!file.exists(th.daily.fileName))
{
  stop(paste0("Missing daily threshold file: ", th.daily.fileName))
}

if (!file.exists(th.seasons.fileName))
{
  stop(paste0("Missing seasons threshold file: ", th.daily.fileName))
}

# load threshold files
th.daily.df <- NA
tryCatch(
  {
    # load daily threshold file
    th.daily.df <- read.table(th.daily.fileName,
                              header=TRUE,
                              col.names = c("Station", "Day", "MT99", "MTX99", "MTN99", "MT1", "MTX1", "MTN1"),
                              stringsAsFactors = FALSE)
    cat(paste0('[', Sys.time(), ']I| Threshold daily file loaded to data.table .'), file = log.file, sep="\n")
  }
  ,error = function (err)
  {
    stop('Error loading daily threshold file: ', err)
  }
  ,warning = function (err)
  {
    stop('Warning loading daily threshold file: ', err)
  }
)

th.seasons.df <- NA
tryCatch(
  {
    # load daily threshold file
    th.seasons.df <- read.table(th.seasons.fileName,
                              header=TRUE,
                              col.names = c("Station", "Season", "MT5", "MT95", "MTX5", "MTX95", "MTN5", "MTN95", "RRR5Y", "FF5Y"),
                              stringsAsFactors = FALSE)
    cat(paste0('[', Sys.time(), ']I| Threshold seasons file loaded to data.table .'), file = log.file, sep="\n")
  }
  ,error = function (err)
  {
    stop('Error loading seasons threshold file: ', err)
  }
  ,warning = function (err)
  {
    stop('Warning loading seasons threshold file: ', err)
  }
)

if (FALSE)
{
  th.5best.df <- NA
  tryCatch(
    {
      # load 5 best threshold file
      th.5best.df <- read.table(th.5best.fileName,
                                  header=TRUE,
                                  col.names = c("Station", "Pred1", "Pred2", "Pred3", "Pred4", "Pred5", "Pred6"),
                                  stringsAsFactors = FALSE )
      cat(paste0('[', Sys.time(), ']I| Threshold 5 Best file loaded to data.table .'), file = log.file, sep="\n")
    }
    ,error = function (err)
    {
      stop('Error loading 5best threshold file: ', err)
    }
    ,warning = function (err)
    {
      stop('Warning loading 5best threshold file: ', err)
    }
  )
}

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

# create the cluster with debug output file
cl<-makeCluster(no_cores, outfile=paste0(options[1, "LogPath"], "debug.", checks.level, ".", format(Sys.time(), "%Y%m%d%H%M") , ".txt"))
registerDoParallel(cl)

# load data to the cluster(messages configuration, errors of the date, workflow configuration)
clusterExport(cl=cl, varlist=c("df.daily.msg"))
clusterExport(cl=cl, varlist=c("th.daily.df"))
clusterExport(cl=cl, varlist=c("df.seasons.msg"))
clusterExport(cl=cl, varlist=c("th.seasons.df"))
#clusterExport(cl=cl, varlist=c("th.5best.df"))
clusterExport(cl=cl, varlist=c("df.errors"))
clusterExport(cl=cl, varlist=c("sources.df"))
clusterExport(cl=cl, varlist=c("log.file"))
clusterExport(cl=cl, varlist=c("input.hist"))
cat(paste0('[', Sys.time(), ']I|  Cluster created.'), file = log.file, sep="\n")

# run the parallel elaboration for the current date
data.list <- foreach(s = 1:length(input.stations), .export=sources.methods) %dopar%
{
  # run the threshold checks for current station
  Parallel.ThresholdChecks.Ellaboration(subset(input.data, input.data$Station == input.stations[s]),
                                        input.stations[s],
                                        current.date,
                                        currentPath,
                                        properties.names)
}

# stop the cluster
stopCluster(cl)
cat(paste0('[', Sys.time(), ']I|  Cluster stopped'), file = log.file, sep="\n")

#release some memory
rm(input.data)
rm(df.errors)

# manage the aggregated data and daily flags
# data.frame for real data
data.df <- as.data.frame (matrix (nrow = 0, ncol = length(agg.columns)))
colnames(data.df) <- agg.columns

# data.frame for errors
error.df <- as.data.frame(matrix(nrow = 0,ncol = 9))
colnames(error.df) <- c('Station', 'DayTime', 'Property', 'Value', 'Code', 'Area', 'Level', 'Message', 'Values')

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
      print (data.list[[i]][[1]])
      return (NULL)
    }
    ,warning = function (warn)
    {
      print (paste0('Data - Warning: ', i, warn))
      return (NULL)
    }
  )

  # manage the error data.frame
  tryCatch(
    {
      l.error.df <- as.data.frame(data.list[[i]][[2]])
      if (nrow(l.error.df) > 0)
      {
        error.df <- rbind(error.df, l.error.df)
      }
    },error = function (err)
    {
      print (paste0('Error - Error : ', i, err))
      return (NULL)
    }
    ,warning = function (warn)
    {
      print (paste0('Error - Warning: ', i, warn))
      return (NULL)
    }
  )

  # manage the flags data.frame
  if (FALSE) {
  tryCatch(
    {
      l.flags.df <- as.data.frame(data.list[[i]][[3]])
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
}

# verify if there is some Convex Hull configuration for the errors
if (nrow(error.df) > 0)
{
  #load stations details
  stations.df <- LoadStations(paste0(options[1, "ConfigPath"], "Stations.xml"))
  stations.df <- stations.df[which(stations.df$StationNumber %in% input.stations), ]

  cvhull.file <- paste0(options[1, "ConfigPath"], "ConvexHull.Thresholds.xml")
  #print (paste0('Prima di convex.hull:', nrow(error.df)))
  error.df <- Manage.ConvexHull.Exceptions(error.df,
                                           stations.df,
                                           cvhull.file,
                                           log.file,
                                           paste0(options[1, "OutputPath"], "Convex.Hull.Errors.", format(current.date, "%Y%m%d"), ".dat"))

  print (paste0('Dopo convex.hull:', nrow(error.df)))
}

# remove the values for properties with WRONG error level , before to save the data to file
if (nrow(error.df) > 0 )
{
  for (r in 1:nrow(error.df))
  {
    if (trimws(as.character(error.df[r, "Level"])) == "W")
    {
      data.df[ data.df$Station == error.df[r, "Station"], error.df[r, "Property"] ] <- NA
    }
  }
}

# Manage DAT file for current date
dat.filename <- paste0(options[1, "OutputPath"], "O.", checks.level, "." , format(current.date, "%Y%m%d"), ".dat", sep="")
if (file.exists(dat.filename)) file.remove((dat.filename))
write.table(data.df, file=dat.filename, sep="\t", row.names = FALSE, col.names = TRUE, quote=FALSE)
cat(paste0('[', Sys.time(), ']I| DAT file created:', dat.filename), file = log.file, sep="\n")

# check if is necessary to make a history copy
if (!is.na(options[1, "HistoryPath"]))
{
  hist.fileName <- paste0(options[1, "HistoryPath"], "D." , format(current.date, "%Y%m%d"), ".hist")
  if (file.exists(hist.fileName)) file.remove(hist.fileName)
  if (file.exists(dat.filename)) file.copy(dat.filename, hist.fileName)
  cat(paste0('[', Sys.time(), ']I|  History file created: ', hist.fileName), file = log.file, sep="\n")
}

# create empty KO XML File or the file with all data if exists at least one error
ko.xml.filename <- paste0( options[1, "OutputPath"], "O.KO.", checks.level, ".", format(current.date, "%Y%m%d"), ".xml")
if (file.exists(ko.xml.filename)) file.remove(ko.xml.filename)
if (nrow(error.df) <= 0)
{
  # create empty file
  ko.handle <- file(ko.xml.filename)
  cat('<Observations />', file = ko.handle, sep="\n")
  close(ko.handle)
  print (paste0('[', Sys.time(), ']I| Create EMPTY KO file - ', ko.xml.filename))
} else {
  # convert all data produced into XML file
  ThresholdChecks.CreateXML.KOFile(data.df, error.df, "Observation", "Observations", ko.xml.filename)
  #write.table(error.df, paste0(options[1, "OutputPath"], "KO.Threshold.Errors.dat"), row.names = FALSE, col.names = TRUE, sep="\t")
}
cat(paste0('[', Sys.time(), ']I|  KO XML file created: ', ko.xml.filename), file = log.file, sep="\n")

# update flags with the error's level
if (nrow(error.df) > 0)
{
  for (f in 1:nrow(error.df))
  {
    df.flags <- ThresholdChecks.ManageFlags(df.flags,
                                            error.df[f, "Station"],
                                            current.date,
                                            error.df[f, "Property"],
                                            error.df[f, "Level"])
  }

  flags.filename <- paste0(options[1, "OutputPath"], "Flags.", checks.level, "." , format(current.date, "%Y%m%d"), ".dat", sep="")
  if (file.exists(flags.filename)) file.remove((flags.filename))
  write.table(df.flags, file=flags.filename, sep="\t", row.names = FALSE, col.names = TRUE, quote=FALSE)

  idx <- which(nchar(as.vector(df.flags[, "Flags"])) > 1)
  if (length(idx) > 0)
  {
    for (f in 1:length(idx))
    {
      if (nchar(as.character(df.flags[idx[f], "Flags"])) > 1)
      {
        property <- df.flags[idx[f], "Property"]
        station  <- df.flags[idx[f], "Station"]
        day      <- df.flags[idx[f], "DayTime"]
        flags    <- unlist (strsplit(as.character(df.flags[idx[f], "Flags"]), "[|]"))

        for (g in 1:length(flags))
        {
          df.flags <- rbind(df.flags, c(station, day, property, flags[g]))
        }
      }
    }

    idxm <- which(nchar(as.vector(df.flags[, "Flags"])) > 1)
    df.flags <- df.flags[-idxm, ]
  }

  df.flags <- df.flags[order(as.integer(df.flags[, 1])), ]
}

# save flags to file
flags.filename <- paste0(options[1, "OutputPath"], "S", format(current.date, "%Y%m%d"), ".mdat", sep="")
if (file.exists(flags.filename)) file.remove((flags.filename))
write.table(df.flags, file=flags.filename, sep="\t", row.names = FALSE, col.names = TRUE, quote=FALSE)
cat(paste0('[', Sys.time(), ']I| Flags file created:', format(current.date, "%Y%m%d")), file = log.file, sep="\n")

cat(paste0('[', Sys.time(), ']I| Process end'), file = log.file, sep="\n")
close(log.file)
quit()

