#*********************************************************
#             Main Workflow of Weak Checks
#*********************************************************
# Libraries
library (XML)
library(foreach)
library(doParallel)
library(stringr)

#*********************************************************
#            Run the main application
#*********************************************************
rm(list=objects())

# get the source path to know from which path to include sources
currentPath <- paste0(getwd() , '/')
print (currentPath)

# Import Modules
source( paste0(currentPath, "Converters.R"))
source( paste0(currentPath, "ParallelMethods.R"))
source( paste0(currentPath, "Errors.Management.R"))
source( paste0(currentPath, "Data.Management.R"))
source( paste0(currentPath, "XML.Management.R"))
source( paste0(currentPath, "Source.Management.R"))
source( paste0(currentPath, "OptionParsing.R"))

# Set UTC time zone
Sys.setenv(TZ = "UTC")

# parse the command line options
options <- WeakChecks.Command.Parse()

# define the level
checks.level <- 'WeakChecks'

# create the log file and log the input options
log.file <- file( paste0(options[1, ]$LogPath, checks.level, format(Sys.time(), "%Y%m%d%H%M"), '.log'), open="a")
Log.Options (options, log.file)

# Load sources for specific checks level
sources.df <- LoadSources( paste0(options[1, "ConfigPath"], "Workflow.xml"), checks.level, paste0(currentPath, checks.level, "/"))
sources.Methods <- as.vector (sources.df$moduleMethod)
cat(paste0('[', Sys.time(), ']I| Workflow configurations load.'), file = log.file, sep="\n")

# Load the station data from CONFIG path
station.file <- paste0(options[1, "ConfigPath"], "Stations.xml")
stations.df <- LoadStations(station.file)
cat(paste0('[', Sys.time(), ']I| Station data loaded.'), file = log.file, sep="\n")

# column names to manage
input.colnames <- c("Station", "DayTime", "TT",  "TD", "TX1", "TN1", "TX6", "TN6", "TX12", "TN12", "PREC", "PR24", "PR06", "RR", "TR", "SNOW",
                    "DIR", "FF", "N", "L" , "RD", "RD24", "AP", "QFF", "SH", "SH24", "VIS", "RH", "D_E", "D_RH", "D_VPD", "D_SLOPE","SOIL")

# get the input file extension
input.data <- NULL
input.File.Name <- ""
ext.parts <- strsplit(as.character(options[1, "InputFile"]), split="\\.")
input.ext <- ext.parts[[1]][length(ext.parts[[1]])]
if (input.ext == "csv")
{
  # Step 0: Convert input data
  input.File.Name <- Input.MG.Converter(options[1, "InputPath"], options[1, "InputFile"], options[1, "ReferenceDate"], stations.df[, "StationNumber"])
  cat(paste0('[', Sys.time(), ']I| Input file converted to local format.'), file = log.file, sep="\n")

    # Read input file to a data table
  input.data <- read.table(input.File.Name,header = TRUE)
  input.data <- subset(input.data, select=input.colnames)
  cat(paste0('[', Sys.time(), ']I| Input data converted to data.table.'), file = log.file, sep="\n")

} else if (input.ext == "dat") {
  # check if the options contains more than 1 file
  input.files = unlist(lapply(str_split(options[1, "InputFile"],";"), trimws))

  tryCatch({
    # read input files and merge them
    for (i in 1:length(input.files))
    {
      input.File.Name <- paste0(options[1, "InputPath"], input.files[i])
      if (is.null(input.data))
      {
        input.data <- read.table(input.File.Name, header = TRUE)
        input.data <- subset(input.data, select=input.colnames)
        cat(paste0('[', Sys.time(), ']I| Input file ', input.files[i], ' loaded.'), file = log.file, sep="\n")
      }
      else
      {
        input.partial.data <- read.table(input.File.Name, header = TRUE,col.names = input.colnames)
        input.partial.data <- subset(input.partial.data, select=input.colnames)
        input.data <- rbind(input.data, input.partial.data)
        cat(paste0('[', Sys.time(), ']I| Input file ', input.files[i], ' loaded.'), file = log.file, sep="\n")
      }
    }
  }
  ,error = function (err)
  {
    print (paste0('Error reading input DAT files: ', err))
    stop()
  }
  )
} else {
  cat(paste0('[', Sys.time(), ']I| Invalid input file type.'), file = log.file, sep="\n")
  stop()
}

# Get the reference date
referenceDate <- strptime(as.character(options[1, "ReferenceDate"]), "%Y%m%d")

# Check if the -m option was specified
if (!is.na(options[1, "MergeInput"]))
{
  # check if the history file for the previous day exists
  hist.06.hourly.file <- paste0( options[1, "HistoryPath"], "H.", options[1, "ReferenceDate"], ".hist")

  # append history file to the input file
  if (file.exists(hist.06.hourly.file))
  {
    df.hist <- read.table(hist.06.hourly.file, header = TRUE)
    df.hist <- subset(df.hist, select = input.colnames)
    df.hist <- subset(df.hist, strptime(df.hist$DayTime, "%Y%m%d%H") <= (referenceDate + as.numeric(as.character(options[1, "MergeInput"])) * 3600))

    input.data <- rbind(input.data, df.hist)

    # sort data for Station and DayTime
    input.data <- input.data[ order( input.data[, "Station"], input.data["DayTime"] ), ]

    # write.table(input.data, paste0(input.File.Name, "1"), sep="\t",row.names=FALSE, col.names=TRUE, quote=FALSE)
    cat(paste0('[', Sys.time(), ']I| History data append to the input data.'), file = log.file, sep="\n")
  }
}

# check for duplicate <Station, DateTime>
dupl.rows <- data.frame(table(input.data$Station, input.data$DayTime))
dupl.rows.gt.1 <- dupl.rows[ dupl.rows$Freq > 1, ]
if (nrow(dupl.rows.gt.1))
{
  cat(paste0('[', Sys.time(), ']F| Input file contains duplicate rows for the combination <Station, DayTime>'), file = log.file, sep="\n")
  print (paste0('[', Sys.time(), ']F| Input file contains duplicate rows for the combination <Station, DayTime> !'), file = log.file, sep="\n")
  stop()
}

# Extract the unique observation dates
input.dates <- input.data[,"DayTime"]
input.dates <- strptime(input.dates, "%Y%m%d")
input.dates <- unique(input.dates)

# Get the unique station codes for which input file contains observations
input.stations <- unique(input.data[,"Station"])
cat(paste0('[', Sys.time(), ']I| Manage ', length(input.stations), ' stations'), file = log.file, sep="\n")

# Filter the stations
#input.stations <- input.stations[ input.stations == 3007033 ] #| input.stations == 6628]

# Step 1: read the alert messages configuration
df.msg <- xmlToDataFrame(paste0(options[1, "ConfigPath"], "Messages.", checks.level, ".xml"))
cat(paste0('[', Sys.time(), ']I| Messages configurations load.'), file = log.file, sep="\n")

# Read interpolations configurations
df.int <- read.table(paste0(options[1, "ConfigPath"], "Interpolations.config"), header = TRUE)
cat(paste0('[', Sys.time(), ']I| Interpolations configurations load.'), file = log.file, sep="\n")

# try to read the history flags file for interval 00-06
input.flags <- NULL
if (!is.na(options[1, "HistoryPath"]))
{
  hist.flags.filename <- paste0(options[1, "HistoryPath"], 'H.Flags.', as.character(options[1, "ReferenceDate"]), ".hist")
  if (file.exists(hist.flags.filename)) {
    input.flags <- read.table(hist.flags.filename, header=TRUE, stringsAsFactors = FALSE)
  }
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

# check is errors files was specified
error.files <- c()
if (!is.na(options[1, "ErrorFile"]))
{
  error.files <- unlist(lapply(str_split(options[1, "ErrorFile"],";"), trimws), use.names = FALSE)
  if (length(error.files) <= 0 | length(error.files) > 2)
  {
    stop(" The '-r' option has an invalid value!")
  }
}

# check for the MOS PATH and file
mosdata <- NULL
if (!is.na(options[1, "MOSPath"]))
{
  mosfile <- paste0(options[1, "MOSPath"], "M.MG.", format(referenceDate, "%Y%m%d"), ".csv")
  if (!file.exists(mosfile))
  {
    cat(paste0('[', Sys.time(), ']W| Missing MOS file ', mosfile), file = log.file, sep="\n")
  }
  else
  {
    mos.datfile <- Input.MG.MOS.Converter(options[1, "MOSPath"],
                                          paste0("M.MG.", format(referenceDate, "%Y%m%d"), ".csv"),
                                          format(referenceDate, "%Y%m%d"),
                                          stations.df[, "StationNumber"])
    mosdata <- read.table(mos.datfile, header = TRUE)
  }
}

# total stations to manage
cat(paste0('[', Sys.time(), ']I| Stations to manage:', length(input.stations)), file = log.file, sep="\n")

# Step 3: start the elaboration process fetching the observation dates
df.errors <- NULL
for(d in 1:length(input.dates))
{
  # get date to manage
  current.date <- input.dates[d]

  # load the errors file for the specific date, if was specified in the command line
  if (length(error.files) > 0)
  {
    xml.error.filename <- paste0("O.KO.WeakChecks." , format(current.date, "%Y%m%d"), ".xml")
    if (xml.error.filename %in% error.files)
    {
      xml.error.full.filename <- paste0(options[1, "InputPath"], xml.error.filename)
      if (file.exists( xml.error.full.filename ))
      {
        dat.errors.filename <- paste0(options[1, "InputPath"], "E.WeakChecks.", format(current.date, "%Y%m%d"), ".err" )
        if (file.exists(dat.errors.filename))
        {
          file.remove(dat.errors.filename)
        }

        # check if the xml file is empty
        xml.errors <- xmlParse(xml.error.full.filename)
        if (length( getNodeSet(xml.errors, "//Observation")) == 0)
        {
          cat(paste0('[', Sys.time(), ']I| KO file ', xml.error.full.filename, ' empty - skip elaboration of date.'), file = log.file, sep="\n")
          next
        }

        # convert XML errors file to Data.Frame format
        result <- WeakChecks.Errors.Xml2DataFrame(xml.error.full.filename, dat.errors.filename)
        if (!result)
        {
          cat( paste0('Error file - ', xml.error.full.filename, ' - cannot be managed! Ellaboration stopped'), file = log.file, sep = "\r\n")
          stop(paste0('Error file - ', xml.error.full.filename, ' - cannot be managed! Ellaboration stopped'))
        }

        # read error file to data.frame
        if (is.null (df.errors))
        {
          df.errors <- read.table(dat.errors.filename, header = TRUE, colClasses = c("integer", "integer", "character", "numeric", "character", "character"), stringsAsFactors = FALSE)
        }
        else
        {
          df.errors.temp <- read.table(dat.errors.filename, header = TRUE, colClasses = c("integer", "integer", "character", "numeric", "character", "character"), stringsAsFactors = FALSE)
          df.errors <- rbind(df.errors, df.errors.temp)
        }
        cat( paste0('[', Sys.time(), ']I| Error file for date ', format(current.date, "%Y%m%d"), ' loaded'), file = log.file, sep = "\r\n")
      }
      else
      {
        cat( paste0('[', Sys.time(), ']W| Missing error file ', xml.error.full.filename, ' - skip elaboration of date.'), file = log.file, sep = "\r\n")
        next
      }
    }
    else
    {
      cat( paste0('[', Sys.time(), ']I| No Error file for date ', format(current.date, "%Y%m%d"), ' - skip elaboration of date.' ), file = log.file, sep = "\r\n")
      next
    }
  }
}

# create the cluster with debug output file
cl<-makeCluster(no_cores, outfile=paste0(options[1, "LogPath"], "debug.", checks.level, ".", format(Sys.time(), "%Y%m%d%H%M") , ".txt"))
registerDoParallel(cl)

# load data to the cluster(messages configuration, errors of the date, workflow configuration)
clusterExport(cl=cl, varlist=c("df.msg"))
clusterExport(cl=cl, varlist=c("df.int"))
clusterExport(cl=cl, varlist=c("sources.df"))
clusterExport(cl=cl, varlist=c("stations.df"))
clusterExport(cl=cl, varlist=c("log.file"))
clusterExport(cl=cl, varlist=c("input.flags"))
cat(paste0('[', Sys.time(), ']I|  Cluster created.'), file = log.file, sep="\n")

if (!is.null(df.errors))
{

    # run the parallel elaboration for the current date using observation between 01 of current day and 00 of next
    data.list <- foreach(s = 1:length(input.stations), .export=sources.Methods ) %dopar%
    {
      Parallel.WeakChecks.Ellaboration(subset(input.data, Station == input.stations[s] ),
                                       input.stations[s],
                                       referenceDate,
                                       currentPath,
                                       subset(df.errors, df.errors$Station == input.stations[s]),
                                       if (!is.null(mosdata)) subset(mosdata, mosdata$Station == input.stations[s]) else NULL )
    }
} else {
    # run the parallel elaboration for the current date using observation between 01 of current day and 00 of next day
    data.list <- foreach(s = 1:length(input.stations), .export=sources.Methods ) %dopar%
    {
      Parallel.WeakChecks.Ellaboration(subset(input.data, Station == input.stations[s] ),
                                       input.stations[s],
                                       referenceDate,
                                       currentPath,
                                       NULL,
                                       if (!is.null(mosdata)) subset(mosdata, mosdata$Station == input.stations[s]) else NULL)
    }
}

# stop the cluster
stopCluster(cl)
cat(paste0('[', Sys.time(), ']I|  Cluster stopped'), file = log.file, sep="\n")

# data.frame for real data
data.df <- as.data.frame (matrix (nrow = 0, ncol = length(input.colnames)))
colnames(data.df) <- input.colnames

# data.frame for errors
error.df <- as.data.frame(matrix(nrow = 0,ncol = 7))
colnames(error.df) <- c("Station", "DayTime", "Property", "Value", "Code", "Level", "Message")

# create the flags structure
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

for (d in 1:length(input.dates))
{
  current.date <- input.dates[d]
  cat(paste0('[', Sys.time(), ']I| Manage files for ellaboration date:', format(current.date, "%Y%m%d")), file = log.file, sep="\n")

  # Manage DAT file for current date
  dat.filename <- paste0(options[1, "OutputPath"], "O.", checks.level, "." , format(current.date, "%Y%m%d"), ".dat", sep="")

  # remove file if exists
  if (file.exists(dat.filename)) file.remove((dat.filename))

  # save DAT file for current date and create history file if request
  data4day.df <- subset(data.df, format(strptime(DayTime, "%Y%m%d"), "%Y%m%d") == format(current.date, "%Y%m%d"))
  write.table(data4day.df, file=dat.filename, sep="\t", row.names = FALSE, col.names = TRUE, quote=FALSE)
  cat(paste0('[', Sys.time(), ']I| DAT file created:', dat.filename), file = log.file, sep="\n")

  # save data from DAT File to XML version
  ok.day.file <- paste0(options[1, "OutputPath"], "O.OK.WeakChecks.", format(current.date, "%Y%m%d"), ".xml")
  if (file.exists(ok.day.file)) file.remove(ok.day.file)
  DataFrame2XMLByString(data4day.df, "Observation", "Observations", ok.day.file)
  cat(paste0('[', Sys.time(), ']I| OK XML file created:', ok.day.file), file = log.file, sep="\n")

  # save history file for current date
  if (!is.na(options[1, "HistoryPath"]))
  {
    hist.filename <- paste0( options[1, "HistoryPath"], "H." , format(current.date, "%Y%m%d"), ".hist", sep="")

    # remove file if exists
    if (file.exists(hist.filename)) file.remove(hist.filename)

    # copy dat file like history file
    file.copy(dat.filename, hist.filename)
    cat(paste0('[', Sys.time(), ']I| History file created:', hist.filename), file = log.file, sep="\n")
  }

  # convert .DAT file to KO XML
  xml.filename <- paste0(options[1, "OutputPath"], "O.KO.", checks.level, "." , format(current.date, "%Y%m%d"), ".xml", sep="")
  if (file.exists(xml.filename)) file.remove(xml.filename)

  # start to create KO XML file
  xml.file <- file( xml.filename, open="a")
  cat("<Observations>", file=xml.file, sep="\n")
  r <- 1

  # sort by station, time, property
  error4day.df <- subset(error.df, format(strptime(DayTime, "%Y%m%d"), "%Y%m%d") == format(current.date, "%Y%m%d"))
  error4day.df <- error4day.df[ with (error4day.df, order( as.integer(error4day.df[,1]), as.integer(error4day.df[,2]) , error4day.df[,3])), ]

  while (r <= nrow(error4day.df))
  {
    cr.station <- error4day.df[r, "Station"]
    cr.daytime <- error4day.df[r, "DayTime"]
    alerts <- ""

    cat("<Observation>", file=xml.file, sep="\n")
    cat(paste0("  <Station>", error4day.df[r, "Station"], "</Station>\n"), file=xml.file)
    cat(paste0("  <DayTime>", error4day.df[r, "DayTime"], "</DayTime>\n"), file=xml.file)

    while (r <= nrow(error4day.df) &
           error4day.df[r, "DayTime"] == cr.daytime &
           error4day.df[r, "Station"] == cr.station)
    {
      cr.property <- error4day.df[r, "Property"]
      cr.value <- error4day.df[r, "Value"]
      level <- "S"

      while (r <= nrow(error4day.df) &
             error4day.df[r, "DayTime"] == cr.daytime &
             error4day.df[r, "Station"] == cr.station &
             error4day.df[r, "Property"] == cr.property)
      {
        if (error4day.df[r, "Level"] == "W") { level <- "W" }

        if ( alerts != "")
        {
          alerts <- paste0(alerts, "\n", "  <ALERT Level=\"", error4day.df[r, "Level"],
                            "\" Property=\"", error4day.df[r, "Property"],
                            "\" Code=\"", error4day.df[r, "Code"],
                            "\" Message=\"", error4day.df[r, "Message"],
                            "\" Status=\"?\"/>");

        }
        else
        {
          alerts <- paste0( "  <ALERT Level=\"", error4day.df[r, "Level"],
                                "\" Property=\"", error4day.df[r, "Property"],
                                "\" Code=\"", error4day.df[r, "Code"],
                                "\" Message=\"", error4day.df[r, "Message"],
                                "\" Status=\"?\"/>");
        }
        r <- r+1
      }

      # compose the final XML structure of the property
      cat(paste0("  <", cr.property, " Status=\"", level, "\">", cr.value, "</", cr.property, ">\n"), file = xml.file)
    }

    # save the alerts
    cat(alerts, file = xml.file, sep="\n")

    # close current observation
    cat("</Observation>", file = xml.file, sep="\n")
  }

  # close root XML tag
  cat("</Observations>", file=xml.file, sep="\n")

  # close xml file
  flush.connection(xml.file)
  close(xml.file)
  cat(paste0('[', Sys.time(), ']I| XML error file created:', xml.filename), file = log.file, sep="\n")

  # End elaboration for current date
  cat(paste0('[', Sys.time(), ']I| End ellaboration for date:', format(current.date, "%Y%m%d")), file = log.file, sep="\n")
  flush.connection(log.file)

  # remove temporary error file created from the XML one
  if (length(error.files) > 0)
  {
    err.temp.file <- paste0(options[1, "InputPath"], "E.WeakChecks.", format(current.date, "%Y%m%d"), ".err" )
    if (file.exists(err.temp.file))
      file.remove(err.temp.file)
  }

  # save flags for current date
  flags.filename <- paste0(options[1, "OutputPath"], "Flags.", checks.level, "." , format(current.date, "%Y%m%d"), ".dat", sep="")
  if (file.exists(flags.filename)) file.remove((flags.filename))
  daily.flags.df <- subset (flags.df, strptime(flags.df$DayTime, "%Y%m%d") == current.date)

  # sort data for Station and DayTime
  daily.flags.df <- daily.flags.df[ order( daily.flags.df[, "Station"], daily.flags.df[, "DayTime"] ), ]

  #save data to file
  write.table(daily.flags.df, file=flags.filename, sep="\t", row.names = FALSE, col.names = TRUE, quote=FALSE)
  cat(paste0('[', Sys.time(), ']I| Flags file created:', flags.filename), file = log.file, sep="\n")

  # make a copy of the flags files
  if (!is.na(options[1, "HistoryPath"]))
  {
    hist.flags.filename <- paste0( options[1, "HistoryPath"], "H.Flags.", format(current.date, "%Y%m%d"), ".hist", sep="")

    # remove file if exists
    if (file.exists(hist.flags.filename)) { file.remove(hist.flags.filename) }

    # copy dat file like history file
    file.copy(flags.filename, hist.flags.filename)
    cat(paste0('[', Sys.time(), ']I| History flags file created:', hist.flags.filename), file = log.file, sep="\n")
  }
}

cat(paste0('[', Sys.time(), ']I| Process end'), file = log.file, sep="\n")
close(log.file)
quit()


