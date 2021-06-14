#*********************************************************
#                     Threshold Generator
#*********************************************************
library(chron)
library(extRemes)
library(RODBC)
library(data.table)
library(doParallel)
library(methods)
library(foreach)

#*********************************************************
#                     Application main code
#*********************************************************
rm(list=objects())

# get the source path to know from which path to include sources
currentPath <- paste0(getwd() , '/')
print (currentPath)

# load sources
source(paste0(currentPath, "TGenerator.Methods.R"))
source(paste0(currentPath, "ParallelMethods.R"))
source(paste0(currentPath, "OptionParsing.R"))

# parse the command line options
options <- TGenerator.Command.Parse()

# level
prog.level <- "TGenerator"

# create the log file and log the input options
log.file <- file( paste0(options[1, ]$LogPath, prog.level, format(Sys.time(), "%Y%m%d%H%M"), '.log'), open="a")
Log.Options (options, log.file)

# check for valid mode
if (options[1, "Mode"] != "Daily" & options[1, "Mode"] != "Season")
{
  err.msg <- paste0('Invalid mode - ', options[1, "Mode"])
  cat(err.msg, file = log.file, sep="\n")
  stop (err.msg)
}

# get the list of stations
con <- odbcConnect("<dbname>", uid="<username>", pwd="<password>", rows_at_time = 100)
stations <- sqlQuery(con,"select IDSTATION as station_number, STATION as station_name, latitude, longitude from <tablename> order by IDSTATION")
close(con)

# generate Threshold file DAILY mode
if (options[1, "Mode"] == "Daily")
{
  daily.station <- NA
  tryCatch(
    {
      cat(paste0('[', Sys.time(), ']I| Start generation for daily threshold'), file = log.file, sep="\n")

      # prepare the data frame for daily and season's data
      threshold.stations <- data.frame(matrix(ncol=9, nrow=0))
      colnames(threshold.stations) <- c("Station", "Day", "MT99", "MTX99", "MTN99", "MT1", "MTX1", "MTN1", "MTC5")

      # Step 2: detect number of cores (processor) to be used for the cluster
      # iF exists less than 2 cores than will use 1 core for the cluster
      no_cores <- detectCores() - 2
      if (no_cores <= 0)
      {
        no_cores <- 1
      }

      cat(paste0('[', Sys.time(), ']I| ', no_cores, ' cores used for parallel ellaboration.'), file = log.file, sep="\n")

      # create the cluster with debug output file
      cl<-makeCluster(no_cores, outfile=paste0(options[1, ]$LogPath, "debug.daily.", prog.level, ".", format(Sys.time(), "%Y%m%d%H%M") , ".txt"))
      registerDoParallel(cl)

      # load data to the cluster(messages configuration, errors of the date, workflow configuration)
      clusterExport(cl=cl, varlist=c("log.file"))
      cat(paste0('[', Sys.time(), ']I|  Cluster created.'), file = log.file, sep="\n")

      # run the parallel ellaboration for the current date
      df.daily.list <- foreach(s = 1:nrow(stations), .packages= c("chron", "extRemes", "RODBC", "data.table")) %dopar%
      {
        # retrieve station data from current and history file
        current.station <- stations[s, "STATION_NUMBER"]

        # run the threshold checks for current station
        Parallel.TGenerator.Daily.CHINA(current.station, currentPath, 2019)
      }
      # stop the cluster
      stopCluster(cl)
      cat(paste0('[', Sys.time(), ']I|  Cluster stopped'), file = log.file, sep="\n")

      #***************************
      # Pierluca De Palma - 06.09.2019 - changes:
      # Remove Year from file name
      #***************************

      # create the name of DAT daily file
      daily.filename <- paste0(options[1, "OutputPath"], "Threshold.Daily.dat")
      if (file.exists(daily.filename)) file.remove(daily.filename)

      # aggregate all data.frame
      daily.station <- data.frame(matrix(ncol=8, nrow=0))
      colnames(daily.station) <- c("Station", "Day", "MT99", "MTX99", "MTN99", "MT1", "MTX1", "MTN1")
      #daily.station <- df.daily.list[[1]]
      #colnames(daily.station) <- c("Station", "Day", "MT99", "MTX99", "MTN99", "MT1", "MTX1", "MTN1")

      #***************************
      # Pierluca De Palma - 25.09.2019 - changes:
      # Remove NA from .dat
      #***************************
      #********************************************
      #for (i in 2:length(df.daily.list)) why 2: and not 1:
      #********************************************
      for (i in 1:length(df.daily.list))
      {
        bAllNa <-
          all(is.na(df.daily.list[[i]][3])) &
          all(is.na(df.daily.list[[i]][4])) &
          all(is.na(df.daily.list[[i]][5])) &
          all(is.na(df.daily.list[[i]][6])) &
          all(is.na(df.daily.list[[i]][7])) &
          all(is.na(df.daily.list[[i]][8]))

        #print (paste0('put data in file or not for station: ', df.daily.list[[i]][1,1],' (',bAllNa,')'))

        if (!bAllNa)
        {
          daily.station <- rbind(daily.station, df.daily.list[[i]])
        }
        else
        {
          daily.station <- subset(daily.station, daily.station[ , 1] != df.daily.list[[i]][1,1])
        }
      }

      write.table(daily.station, daily.filename, sep="\t", row.names=FALSE)
      cat(paste0('[', Sys.time(), ']I| Daily threshold file created: ', daily.filename), file = log.file, sep="\n")

      cat(paste0('[', Sys.time(), ']I| End generation for daily threshold'), file = log.file, sep="\n")
    },
    error = function(err) {
      print ( paste0('[ERROR] TGenerator.Daily :', err))
      return (daily.station)
    },
    warning = function(warn) {
      print ( paste0('[WARNING] TGenerator.Daily :', warn))
      return (daily.station)
    })
}

# generatye Threshold file for SEASON mode
if (options[1, "Mode"] == "Season")
{
  tryCatch(
    {
      cat(paste0('[', Sys.time(), ']I| Start generation for seasons threshold'), file = log.file, sep="\n")

      # seasons threshold
      season.stations <- data.frame(matrix(ncol=10, nrow=0))
      colnames(season.stations) <- c("Station", "Season", "MT5", "MT95", "MTX5", "MTX95", "MTN5", "MTN95", "RRR5Y", "FF5Y")

      # iF exists less than 2 cores than will use 1 core for the cluster
      no_cores <- detectCores() - 2
      if (no_cores <= 0)
      {
        no_cores <- 1
      }

      # create the cluster with debug output file
      cls<-makeCluster(no_cores, outfile=paste0(options[1, ]$LogPath, "debug.seasons.", prog.level, ".", format(Sys.time(), "%Y%m%d%H%M") , ".txt"))
      registerDoParallel(cls)

      # load data to the cluster(log file)
      clusterExport(cl=cls, varlist=c("log.file"))
      cat(paste0('[', Sys.time(), ']I|  Cluster created.'), file = log.file, sep="\n")

      # run the parallel elaboration for the current date
      df.seasons.list <- foreach(s = 1:nrow(stations), .packages= c("chron", "extRemes", "RODBC", "data.table")) %dopar%
      {
        # retrieve station data from current and history file
        current.station <- stations[s, "STATION_NUMBER"]

        # run the threshold checks for current station
        Parallel.TGenerator.Seasons.CHINA(current.station, currentPath)
      }
      # stop the cluster
      stopCluster(cls)
      cat(paste0('[', Sys.time(), ']I|  Cluster stopped'), file = log.file, sep="\n")

      #***************************
      # Pierluca De Palma - 06.09.2019 - changes:
      # Remove Year from file name
      #***************************

      # create the name of DAT daily file
      seasons.filename <- paste0(options[1, "OutputPath"], "Threshold.Seasons.dat")
      if (file.exists(seasons.filename)) file.remove(seasons.filename)

      # aggregate all data.frame
      #seasons.station <- df.seasons.list[[1]]
      seasons.station <- data.frame(matrix(ncol=10, nrow=0))
      colnames(seasons.station) <- c("Station", "Season", "MT5", "MT95", "MTX5", "MTX95", "MTN5", "MTN95", "RRR5Y", "FF5Y")

      #***************************
      # Pierluca De Palma - 25.09.2019 - changes:
      # Remove NA from .dat
      #***************************
      for (i in 1:length(df.seasons.list))
      {
        bAllNa <-
          all(is.na(df.seasons.list[[i]][3])) &
          all(is.na(df.seasons.list[[i]][4])) &
          all(is.na(df.seasons.list[[i]][5])) &
          all(is.na(df.seasons.list[[i]][6])) &
          all(is.na(df.seasons.list[[i]][7])) &
          all(is.na(df.seasons.list[[i]][8])) &
          all(is.na(df.seasons.list[[i]][9])) &
          all(is.na(df.seasons.list[[i]][10]))

        if (!bAllNa)
        {
          seasons.station <- rbind(seasons.station, df.seasons.list[[i]])
        }
        else
        {
          seasons.station <- subset(seasons.station, seasons.station[ , 1] != df.seasons.list[[i]][1,1])
        }
      }

      write.table(seasons.station, seasons.filename, sep="\t", row.names=FALSE)

      cat(paste0('[', Sys.time(), ']I|  Seasons threshold file created: ', seasons.filename), file = log.file, sep="\n")
      cat(paste0('[', Sys.time(), ']I| End generation for seasons threshold'), file = log.file, sep="\n")
    },
    error = function(err) {
      print ( paste0('[ERROR] TGenerator.Seasons :', err))
    },
    warning = function(warn) {
      print ( paste0('[WARNING] TGenerator.Seasons :', warn))
    }
  )
}


