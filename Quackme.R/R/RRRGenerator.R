#*********************************************************
#             Main Workflow of Weak Checks
#*********************************************************
# Libraries
library(foreach)
library(doParallel)
library(stringr)

#*********************************************************
#            Run the main application
#*********************************************************
rm(list=objects())

# get the source path to know from which path to include sources
currentPath <- paste0(getwd() , '/')

# modules to load
source(paste0(currentPath, "OptionParsing.R"))
source( paste0(currentPath, "RRRGenerator.Methods.R"))

# Set UTC time zone
Sys.setenv(TZ = "UTC")

# parse the command line options
options <- RRR.Command.Parse()

# create the log file and log the input options
log.file <- file( paste0(options[1, ]$LogPath, 'RRR.Generator.', format(Sys.time(), "%Y%m%d%H%M"), '.log'), open="a")
Log.Options (options, log.file)

input.path <- options[1, ]$InputPath
hour.interval <- as.integer(as.character(options[1, ]$HourInterval))
reference.date <- strptime(options[1, ]$ReferenceDate, "%Y%m%d")
no_cores <- options[1, ]$CoreNumber

# if exists less than 2 cores than will use 1 core for the cluster
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

# define the columns to use
columns <- c("Station", "DayTime", "PREC", "PR06", "RR","TR")

# check if all necessary file are presents on the input path
input.file.cd <- paste0( input.path, 'H.', format(reference.date, "%Y%m%d"), '.hist')
if (!file.exists(input.file.cd))
{
  msg <- paste0("Input file ", input.file.cd, " does not exists!")
  cat(paste0('[', Sys.time(), ']F| ', msg), file = log.file, sep="\n")
  stop(msg)
}

#previous.date <- reference.date - 24 * 3600
#input.file.pd <- paste0( input.path, 'H.', format(previous.date, "%Y%m%d"), '.hist')

#if (!file.exists(input.file.pd))
#{
#  msg <- paste0('Input file ', input.file.pd, ' does not exists!')
#  cat(paste0('[', Sys.time(), ']W| ', msg), file = log.file, sep="\n")
#}

next.date <- reference.date + 24 * 3600
input.file.nd <- paste0( input.path, 'H.', format(next.date, "%Y%m%d"), '.hist')

if (!file.exists(input.file.nd))
{
  msg <- paste0('Input file ', input.file.nd, ' does not exists!')
  cat(paste0('[', Sys.time(), ']W| ', msg), file = log.file, sep="\n")
}


# Read input files to a data table
# - input file with data relative to reference date
input.data <- read.table(input.file.cd,header=TRUE)
cat(paste0('[', Sys.time(), ']I| Input data of reference date loaded'), file = log.file, sep="\n")

# - input file with data relative to previous date
#if (file.exists(input.file.pd))
#{
#  input.data.previous  <- read.table(input.file.pd, header = TRUE)
#                                     #col.names = c("Station", "DayTime", "TT",  "TD", "TX1", "TN1", "TX6", "TN6", "TX12", "TN12", "PREC", "PR24", "PR06", "RR", "TR", "SNOW", "DIR", "FF", "N", "L" , "RD", "RD24", "AP", "QFF", "SH", "SH24", "VIS", "RH", "D_E",	"D_RH",	"D_VPD",	"D_SLOPE",	"SOIL"))

#  # merge data relative to two days
#  input.data <- rbind(input.data, input.data.previous)
#  cat(paste0('[', Sys.time(), ']I| Input data of previous date loaded'), file = log.file, sep="\n")
#}

# - input file with data relative to next date
if (file.exists(input.file.nd))
{
  input.data.next  <- read.table(input.file.nd, header = TRUE)

  # merge data relative to two days
  input.data <- rbind(input.data, input.data.next)
  cat(paste0('[', Sys.time(), ']I| Input data of next date loaded'), file = log.file, sep="\n")
}

# identiy the unique station present into the input file
input.stations <- unique(input.data[,"Station"])
cat(paste0('[', Sys.time(), ']I| Number of stations to process:', length(input.stations)), file = log.file, sep="\n")

# manage the mos data
mosdata <- RRRGenerator.ReadMOSByDate(options[1, "MOSPath"], reference.date, input.stations, 16)
#mosdata.previous <- RRRGenerator.ReadMOSByDate(options[1, "MOSPath"], previous.date, input.stations, 16)
#if (!is.null(mosdata.previous))
#{
#  if (is.null(mosdata))
#  {
#    mosdata <- mosdata.previous
#  }
#  else
#  {
#    prev.start <- previous.date + 19 * 3600
#    prev.end <- previous.date + 23 * 3600
#    mosdata.previous.x <- subset(mosdata.previous, strptime(mosdata.previous$DayTime, "%Y%m%d%H") >= prev.start &
#                                   strptime(mosdata.previous$DayTime, "%Y%m%d%H") <= prev.end)
#    mosdata <- rbind(mosdata, mosdata.previous.x)
#  }
#}

# prepare ellaboration interval
start.elab <- reference.date
end.elab   <- reference.date
if (hour.interval == 3)
{
  start.elab <- reference.date + 9 * 3600
  end.elab   <- reference.date + 30 * 3600
} else {
  start.elab <- reference.date + 12 * 3600
  end.elab   <- reference.date + 30 * 3600
}

# create the cluster with debug output file
cl<-makeCluster(no_cores, outfile=paste0(options[1, "LogPath"], "debug.RRRGenerator.", format(Sys.time(), "%Y%m%d%H%M") , ".txt"))
registerDoParallel(cl)

# load data to the cluster(messages configuration, errors of the date, workflow configuration)
clusterExport(cl=cl, varlist=c("log.file"))
cat(paste0('[', Sys.time(), ']I|  Cluster created.'), file = log.file, sep="\n")

# run the parallel ellaboration for the current date using observation between 01 of current day and 06 of next day
hour.df.list <- foreach(s = 1:length(input.stations)) %dopar%
{
  mos.station <- if (!is.null(mosdata)) subset(mosdata, mosdata$Station == input.stations[s]) else NULL
  if (hour.interval == 3)
  {
    Parallel.RRRGenerator.3H( subset(input.data, input.data$Station == input.stations[s])[, columns],
                              input.stations[s],
                              reference.date,
                              start.elab,
                              end.elab,
                              currentPath,
                              mos.station)
  }
  else
  {
    Parallel.RRRGenerator.6H( subset(input.data, input.data$Station == input.stations[s])[, columns],
                              input.stations[s],
                              reference.date,
                              start.elab,
                              end.elab,
                              currentPath,
                              mos.station)
  }
}

# stop the cluster
stopCluster(cl)
cat(paste0('[', Sys.time(), ']I|  Cluster stopped'), file = log.file, sep="\n")

total.df <- data.frame(matrix(ncol=4, nrow=0))
colnames(total.df) <- c("Station","DayTime", "RRR", "Flag")

for (i in 1:length(hour.df.list))
{
  total.df <- rbind(total.df, hour.df.list[[i]])
}

total.df[, "Station"] <- as.integer(total.df[, "Station"])
total.df[, "RRR"] <- round(as.numeric(total.df[, "RRR"]), digits = 1)
total.df[, "Flag"] <- as.integer(total.df[, "Flag"])

# start anyway from 06:00 of current date because the input data are considered allways between 06 current day and 06 next day
prefixFileName = ifelse(hour.interval == 6, 'rrr', 'rrr3h')
while(start.elab <= end.elab)
{

  # prepare the file
  hour.df.file.name <- paste0(options[1, ]$OutputPath, prefixFileName, '_', format(start.elab, "%Y%m%d%H"), '.txt')
  if (file.exists(hour.df.file.name))
  {
    file.remove(hour.df.file.name)
  }

  # extract data for specified time and save to the file
  hour.df <- subset ( total.df, strptime(total.df$DayTime, "%Y%m%d%H") == start.elab)
  hour.df[, "DayTime"] <- format(strptime(hour.df$DayTime, "%Y%m%d%H"), "%Y-%m-%d %H:%M")
  write.table(hour.df, hour.df.file.name, quote = FALSE, sep = ',', row.names = FALSE)
  cat(paste0('[', Sys.time(), ']I| Create RRR file:', hour.df.file.name), file = log.file, sep="\n")
  start.elab <- start.elab + hour.interval*3600
}

cat(paste0('[', Sys.time(), ']I| Process END.'), file = log.file, sep="\n")

