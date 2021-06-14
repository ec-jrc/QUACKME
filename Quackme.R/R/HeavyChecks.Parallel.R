#*********************************************************
#             Main Workflow of Heavy Checks
#*********************************************************
# Libraries
library (XML)
library (suncalc)
library(foreach)
library(doParallel)
library(methods)
library(stringr)

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
source(paste0(currentPath, "Flags.Management.R"))

# Set UTC time zone
Sys.setenv(TZ = "UTC")

# parse the command line options
options <- HeavyChecks.Command.Parse()

# define the level
checks.level <- 'HeavyChecks'

# create the log file and log the input options
log.file <- file( paste0(options[1, ]$LogPath, checks.level, format(Sys.time(), "%Y%m%d%H%M"), '.log'), open="a")
Log.Options (options, log.file)

# Load sources for specific checks level
sources.df <- LoadSources( paste0(options[1, "ConfigPath"], "Workflow.xml"), checks.level, paste0(currentPath, checks.level, "/"))
sources.methods <- as.vector (sources.df$moduleMethod)
if (is.null(sources.df))
{
  cat(paste0('[', Sys.time(), ']I| Missing workflow active configuration for HeavyChecks !'), file = log.file, sep="\n")
  stop("Missing workflow active configuration for HeavyChecks")
}
cat(paste0('[', Sys.time(), ']I| Workflow configurations load.'), file = log.file, sep="\n")

# Read aggregation configuration file
agg.config <- saveXML(xmlParse(paste0(options[1, "ConfigPath"], "Aggregation.xml")))
cat(paste0('[', Sys.time(), ']I| Aggregation configurations load.'), file = log.file, sep="\n")

#retrieve aggregation columns
agg.columns <- RetrieveAggregationColumnNames(agg.config)
agg.columns <- c("Station", "DayTime", agg.columns)

# Read the input file name
input.filename <- paste0(options[1, "InputPath"], options[1, "InputFile"])

# check if the input file is an XML file
input.file <- options[1, "InputFile"]
input.ext  <- str_sub( input.file, - 3)

# retrieve working data
current.date <- NULL
if (input.ext == "xml")
{
  current.date <- strptime(unlist(strsplit(as.character(input.file), "[.]"))[4], "%Y%m%d")
} else {
  current.date <- strptime(unlist(strsplit(as.character(input.file), "[.]"))[3], "%Y%m%d")
}

# load daily flags if exists or create empty structure
df.flags <- NULL
flags.filename <- paste0(options[1, "InputPath"], "Flags.Aggregation.", format(current.date, "%Y%m%d"), ".dat")
if (file.exists(flags.filename))
{
  df.flags <- read.table(flags.filename, header = TRUE, stringsAsFactors = FALSE)
  cat(paste0('[', Sys.time(), ']I| Flags data loaded.'), file = log.file, sep="\n")
} else  {
  df.flags <- as.data.frame(matrix(nrow=0, ncol=4))
  colnames(df.flags) <- c("Station", "DayTime", "Property", "Flags")
}

# gt, eventually, the XML with corrected data
df.errors <- NULL

# if the input file is an XML file transform it into .dat format
if (input.ext == "xml")
{
  # check if the input xml is empty
  xmlErrors <- xmlParse(paste0(options[1, "InputPath"], options[1, "InputFile"]))
  if ( length( getNodeSet(xmlErrors, "//Observation")) == 0)
  {
    cat (cat(paste0('[', Sys.time(), ']I| XML input file is empty. The exceution are stopped'), file = log.file, sep="\n"))
    quit(save = "default", status = 0)
  }

  # create the DAT file name
  dat.filename <- paste0(options[1, "OutputPath"], "KO.HeavyChecks.", format(current.date, "%Y%m%d"), ".dat")
  if (file.exists(dat.filename)) file.remove(dat.filename)

  # convert input XML to DAT file and update flags if necessary
  d.list <- Output.HeavyChecks.Xml2DataFrame ( paste0(options[1, "InputPath"], options[1, "InputFile"]), dat.filename, df.flags)
  df.errors <- d.list[[1]]
  df.flags  <- d.list[[2]]

  # override the input.file and input.filename with .dat info
  input.file <- paste0("KO.", checks.level , ".", format(current.date, "%Y%m%d"), ".dat")
  input.filename <- paste0( options[1, "OutputPath"], input.file)
  cat (cat(paste0('[', Sys.time(), ']I| XML input file converted to dat file.'), file = log.file, sep="\n"))
}

# Read the context of input file
input.data <- read.table(input.filename, header=TRUE, stringsAsFactors = FALSE)
input.cols <- colnames(input.data)

# check if some new property was added Aggregation.XML of some property was removed
for (c in 1:length(agg.columns))
{
  # property is new, add to the input filled by NA
  if (! (agg.columns[c] %in% input.cols))
  {
    input.data[, agg.columns[c]] <- NA
  }
}

cat(paste0('[', Sys.time(), ']I| Input data converted to data.table.'), file = log.file, sep="\n")

# Get the unique station codes for which input file contains observations
input.stations <- unique(input.data[,"Station"])

#filter stations
#input.stations <- input.stations[ input.stations == 3116163 ]# | input.stations == 5101] #| input.stations == 40848]

# Read the alert messages configuration
df.msg <- xmlToDataFrame(paste0(options[1, "ConfigPath"], "Messages.", checks.level, ".xml"))
cat(paste0('[', Sys.time(), ']I| Messages configurations load.'), file = log.file, sep="\n")

# Load the station data from CONFIG path
station.file <- paste0(options[1, "ConfigPath"], "Stations.xml")
stations.df <- LoadStations(station.file)
cat(paste0('[', Sys.time(), ']I| Station data loaded.'), file = log.file, sep="\n")

# check for exceptions file
exceptions.config <- NULL
exceptions.checks.file <- paste0( options[1, "ConfigPath"], checks.level, '.Exceptions.xml')
if (!file.exists(exceptions.checks.file))
{
  cat(paste0('[', Sys.time(), ']I| ', 'Exceptions checks file not present.'), file = log.file, sep="\n")
} else {
  ex.xml <- xmlParse(exceptions.checks.file)
  exceptions.config <- saveXML(ex.xml)
  cat(paste0('[', Sys.time(), ']I| ', 'Exceptions checks file loaded.'), file = log.file, sep="\n")
}

# Detect number of cores (processor) to be used for the cluster
# If exists less than 2 cores than will use 1 core for the cluster
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
clusterExport(cl=cl, varlist=c("df.msg"))
clusterExport(cl=cl, varlist=c("df.errors"))
clusterExport(cl=cl, varlist=c("sources.df"))
clusterExport(cl=cl, varlist=c("stations.df"))
clusterExport(cl=cl, varlist=c("log.file"))
clusterExport(cl=cl, varlist=c("exceptions.config"))
clusterExport(cl=cl, varlist=c("agg.columns"))
cat(paste0('[', Sys.time(), ']I|  Cluster created.'), file = log.file, sep="\n")

# run the parallel elaboration for the current date
data.list <- foreach(s = 1:length(input.stations), .packages= c("suncalc"), .export=sources.methods) %dopar%
{
  # run the heavy checks for current station
  Parallel.HeavyChecks.Ellaboration(subset(input.data, input.data$Station == input.stations[s]),
                                    input.stations[s],
                                    current.date,
                                    currentPath)
}

# stop the cluster
stopCluster(cl)
cat(paste0('[', Sys.time(), ']I|  Cluster stopped'), file = log.file, sep="\n")

#release some memory
rm(input.data)

# manage the aggregated data and daily flags
# data.frame for real data
data.df <- as.data.frame (matrix (nrow = 0, ncol = length(agg.columns)))
colnames(data.df) <- agg.columns

# data.frame for errors
error.df <- as.data.frame(matrix(nrow = 0,ncol = 8))
colnames(error.df) <- c('Station', 'DayTime', 'Property', 'Value', 'Code', 'Level', 'Message', 'Values')

# data.frame for flags
#flags.df <- as.data.frame(matrix(nrow = 0,ncol = 4))
#colnames(flags.df) <- c("Station", "DayTime", "Property", "Flags")

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
  if (FALSE)
  {
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

#write.table(error.df, file ="d:\\HeavyErrors.df", sep="\t", quote = FALSE, row.names = FALSE )

# remove values for the properties with WRONG errors
if (nrow(error.df) > 0)
{
  for (r in 1:nrow(error.df))
  {
    if (error.df[r, "Level"] == "W")
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
  HeavyChecks.CreateXML.KOFile(data.df, error.df, "Observation", "Observations", ko.xml.filename)
}
cat(paste0('[', Sys.time(), ']I|  KO XML file created: ', ko.xml.filename), file = log.file, sep="\n")

write.table(df.flags, "d:\\Flags.Heavy.df", sep="\t", quote = FALSE, row.names = FALSE)

# update flags with the error's level
if (nrow(error.df) > 0)
{
  for (f in 1:nrow(error.df))
  {
    df.flags <- HeavyChecks.ManageFlags(df.flags,
                                        error.df[f, "Station"],
                                        current.date,
                                        error.df[f, "Property"],
                                        error.df[f, "Level"])
  }
}

# save flags to file
flags.filename <- paste0(options[1, "OutputPath"], "Flags.", checks.level, "." , format(current.date, "%Y%m%d"), ".dat", sep="")
if (file.exists(flags.filename)) file.remove((flags.filename))
write.table(df.flags, file=flags.filename, sep="\t", row.names = FALSE, col.names = TRUE, quote=FALSE)
cat(paste0('[', Sys.time(), ']I| Flags file created:', format(current.date, "%Y%m%d")), file = log.file, sep="\n")

cat(paste0('[', Sys.time(), ']I| Process end'), file = log.file, sep="\n")
close(log.file)
quit()
