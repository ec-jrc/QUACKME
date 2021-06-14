#*********************************************************
# Implements the TMEAN checks using the data of the 5
# nearest stations
#*********************************************************
library (XML)
library (RODBC)

#*********************************************************
# Get the elements between 2nd and 6th position.
# All values are ordered ascending.
# The first position are not considered because is
# allways = 0
#*********************************************************
best.5 <- function(x){
  sam <- order(x,decreasing=FALSE)[2:6]
  return(sam)
}

#*********************************************************
# The checks will be done for all stations one by one
# Parameters :
#  - station.data   [INPUT] [DATA.FRAME]	- all stations data
#  - station.xml    [INPUT] [XML]	        - all stations data in XML format
#  - error.filename [INPUT] [STRING]      - string with XML data of errors observation
#  - th.fileName    [INPUT] [STRING]      - full name of 5best threshold file
#*********************************************************
Station.5BestChecks <- function(stations.data, stations.xml, error.filename, th.filename)
{
  th.df <- NA
  tryCatch(
    {
      # load 5 best threshold file
      th.df <- read.table(th.fileName,
                          header=TRUE,
                         col.names = c("Station", "Pred1", "Pred2", "Pred3", "Pred4", "Pred5", "Pred6"))
      cat(paste0('[', Sys.time(), ']I| Threshold 5 Best file loaded to data.table .'), file = log.file, sep="\n")
    }
    ,error = function (err)
    {
      print (paste0('Station.5BestChecks - Error : ', err))
      return (stations.xml)
    }
  )

  # read stations distance and calculate the nearest 5 stations for each station
  stations <- NA
  tryCatch(
    {
      con <- odbcConnect("CGMS12", uid="cgms12eun", pwd="pwd412EUN", rows_at_time = 500)
      stations <- sqlQuery(con,"select station_number, station_name, latitude, longitude from STATION order by station_number")
      close(con)
    }
  )

  all.distances <- as.matrix(dist(stations[,3:4],method='euclidean'))
  nearest.stations <- apply(all.distances,MARGIN=2,FUN=best.5)

  # make the checks
  tryCatch(
    {
      xml.errors <- NULL
      if (!is.null(error.filename))
      {
        xml.errors <- xmlParse(error.filename)
      }

      for (s in 1:length(stations.data))
      {
        station.code <- stations.data[s, "Station"]

        tmean <- NA
        station.row <- stations.data[s, ]
        if (!is.na(station.row$TN) & !is.na(station.row$TX))
        {
          tmean <- (station.row$TN + station.row$TX)/2
        }

        # get predictions coeficients for the current station
        pred.row <- th.df[ th.df$Station == station.row$Station, ]
        pred.coef <- c(pred.row$PRED1, pred.row$PRED2, pred.row$PRED3, pred.row$PRED4, pred.row$PRED5, pred.row$PRED6)

        # get the 5 nearest stations
        nearest5 <- nearest.stations[, s]

        # create an array with the tmean of current station and with the tmean
        # of nearest 5 station
        tmean.nearest <- c(tmean)
        for (n in 1:5)
        {
          station.n <- stations.data[ nearest5[s], ]
          if (!is.na(station.n$TN) & !is.na(station.n$TX))
          {
            tmean.nearest <- c(tmean.nearest, (station.n$TN + station.n$TX)/2 )
          }
        }

        # calculate tmean predicted
        tmean.predicted <- sum(pred.coef * tmean.nereast)

        # find the error node if exists
        error.station <- NULL
        if (!is.null(xml.errors))
        {
          error.station <- getNodeSet( xml.errors, paste0("//Observation[Station=", station.code, "]"))
        }

        # make the test between the tmean of current station and precited value
        # can use ErrorNode.ThresholdChecks.Daily but is necessary to load error file if was specified
        #ErrorNode.ThresholdChecks.Daily (subset(input.data, input.data$Station == input.stations[s]),
        #                                 getNodeSet( xmlParse(input.xml), paste0("//Observation[Station=", station.code, "]")),
        #                                 error.station,
        #                                 "TX",
        #                                 "006")
        # check if will be necessary to signal the alert for TN too
      }
    }
    ,error = function (err)
    {
      print (paste0('Station.5BestChecks - Error : ', err))
      return (stations.xml)
    }
  )

  return (stations.xml)
}
