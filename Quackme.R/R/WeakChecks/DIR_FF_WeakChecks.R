#*********************************************************
#              Wind direction/Wind speed
#                    Weak Checks
#*********************************************************

#*********************************************************
# The checks will be done for a single station
# Parameters :
#  - data.list    [INPUT] [LIST]			 	- list with 2 data.frame (observations and new errors)
#  - current.date [INPUT] [DATE]			 	- date of the ellaboration
#  - old.errors   [INPUT] [DATA.FRAME]  - data frame with errors of previous run
#  - mos.data     [INPUT] [DATA.FRAME]  - MOS data
# RETURN :
#  [LIST] - list with 2 data.frame : one with data and another with the new errors
#*********************************************************
WeakChecks.ChecksWind <- function(data.list, current.date, old.errors, mos.data)
#WeakChecks.ChecksWind <- function(xml.obs, df.obs, day.obs, xml.errors, mos.data)
{
  result <- tryCatch(
    {
      # extract essential data
      station.obs <- data.list[[1]]
      new.errors  <- data.list[[2]]
      prop.flags  <- data.list[[3]]

      # define the matrix of status
      prop.status <- as.data.frame(matrix(nrow = nrow(station.obs), ncol = 2))
      colnames(prop.status) <- c("DIR", "FF")
      prop.status[, "DIR"] <- "C"
      prop.status[, "FF"] <- "C"

      paramsErr  = c("")

      th.counter.dir40 <- 5
      th.counter.dir5 <- 20
      th.counter.ff05 <- 15
      th.counter.ff15 <- 10

      # retrieve station altitude
      station.data <- stations.df[ stations.df$StationNumber == station.obs[1, "Station"], ]
      station.altitude <- 0.0
      if( nrow(station.data) > 0) { station.altitude <- as.numeric(as.character(station.data[1, "Altitude"])) }

      checkConsecutiveObservations <- FALSE

      for (obs in 1:nrow(station.obs))
      {
        row <- station.obs[obs, ]

        if (obs > 1)
        {
          # previous observation time
          prevDayTime <- strptime(row$DayTime, "%Y%m%d%H") - 1 * 3600
          checkConsecutiveObservations <- (strptime(station.obs[obs-1, "DayTime"], "%Y%m%d%H") == prevDayTime)
        }

        # convert columns values to numeric values
        iDir <- if (!is.na(row$DIR)) suppressWarnings(as.numeric(as.character(row$DIR))) else NA
        iFF <- if (!is.na(row$FF)) suppressWarnings(as.numeric(as.character(row$FF))) else NA

        if (!is.na(iDir))
        {
          #wind direction outside 0-360 degrees. In this case, the value will be consider WRONG.
          if (iDir < 0 | iDir > 360)
          {
            paramsErr  = c("0 - 360", iDir)
            error.data <- WeakChecks.GetError("001", "DIR", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "DIR"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "DIR", iDir, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "DIR", error.data[[1]])
            }
          }
        }

        if (!is.na(iFF))
        {
          #Wind speed outside 0 – 75 m/sec
          if (iFF < 0 | iFF > 75)
          {
            #Pierluca De Palma 17.09.2019
            paramsErr  = c("0 - 75", iFF)
            error.data <- WeakChecks.GetError("001", "FF", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "FF"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "FF", iFF, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "FF", error.data[[1]])
            }
          }
        }

        #***************************
        # Pierluca De Palma - 09.09.2019 - changes:
        # Change check Wind speed from 0 to > 3.5 m/sec, see: https://trello.com/c/7ZWRVmU5
        # [Marian Bratu - 24.01.2020 Switch off the check]
        #***************************
        #if (!is.na(iFF) & is.na(iDir))
        #{
        #  if (iFF > 3.5 )
        #  {
        #    #Pierluca De Palma 17.09.2019
        #    paramsErr  = c("3.5", "NA", iFF)
        #    obs.node.ff[[1]] <- WeakChecks.ManageError("004", obs.node.ff[[1]], row$DayTime, xml.errors, paramsErr)
        #  }
        #}

        if (checkConsecutiveObservations)
        {
            ## check consecutive values for DIR
            iPrevDir <- ifelse ( !is.na(station.obs[obs-1, "DIR"]), suppressWarnings(as.numeric(as.character(station.obs[obs-1, "DIR"]))) , NA)
            iPrevFF  <- ifelse ( !is.na(station.obs[obs-1, "FF"]), suppressWarnings(as.numeric(as.character(station.obs[obs-1, "FF"]))) , NA)

            if (!is.na (iDir) & !is.na(iPrevDir) & iDir > 0 & iPrevDir > 0)
            {
              if (station.altitude <= 1000.0)
              {
                dir.diff <- abs(iDir - iPrevDir)
                if (dir.diff > 180)
                {
                  dir.diff <- ifelse( iDir > 180, 360 - iDir, iDir ) + ifelse (iPrevDir > 180, 360 - iPrevDir, iPrevDir)
                }

                if (dir.diff < 5 & (!is.na(iFF) & iFF > 4.6) & ( !is.na(iPrevFF) & iPrevFF > 4.6) &
                    strptime(row$DayTime, "%Y%m%d%H") < (current.date + 24 * 3600))
                {
                  th.counter.dir5 <- th.counter.dir5 - 1
                  if (th.counter.dir5 == 0)
                  {
                    #Pierluca De Palma 17.09.2019
                    paramsErr  = c("5", "4.6", iFF, iDir, iPrevDir, round(dir.diff, digits=10))
                    error.data <- WeakChecks.GetError("002", "DIR", row$DayTime, old.errors, paramsErr)
                    if (!is.null(error.data) & length(error.data) > 0)
                    {
                      prop.status[obs, "DIR"] <- ifelse( prop.status[obs, "DIR"] == "C" | prop.status[obs, "DIR"] == "S", error.data[[1]], prop.status[obs, "DIR"] )
                      new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "DIR", iDir, "002", error.data[[1]], error.data[[2]])
                      prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "DIR", error.data[[1]])
                    }
                  }
                }
                else if (dir.diff > 40 & ( !is.na(iFF) & iFF > 4.6) & ( !is.na(iPrevFF) & iPrevFF > 4.6) &
                         strptime(station.obs[obs, "DayTime"], "%Y%m%d%H") < (current.date + 24 * 3600))
                {
                  th.counter.dir40 <- th.counter.dir40 - 1
                  if (th.counter.dir40 == 0)
                  {
                    #Pierluca De Palma 17.09.2019
                    paramsErr  = c("40", "4.6", iFF, iDir, iPrevDir, round(dir.diff, digits=1) )
                    error.data <- WeakChecks.GetError("003", "DIR", row$DayTime, old.errors, paramsErr)
                    if (!is.null(error.data) & length(error.data) > 0)
                    {
                      prop.status[obs, "DIR"] <- ifelse( prop.status[obs, "DIR"] == "C" | prop.status[obs, "DIR"] == "S", error.data[[1]], prop.status[obs, "DIR"] )
                      new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "DIR", iDir, "003", error.data[[1]], error.data[[2]])
                      prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "DIR", error.data[[1]])
                    }
                  }
                }
              }
            }

            ## check consecutive values for FF
            if (!is.na(iFF) & !is.na (iPrevFF) & iFF > 0 & iPrevFF > 0)
            {
              ff.diff <- round(abs(iFF - iPrevFF), digits = 2)
              if (ff.diff < 0.5 & iFF > 4.6 & iPrevFF > 4.6 &
                  strptime(station.obs[obs, "DayTime"], "%Y%m%d%H") < (current.date + 24 * 3600))
              {
                th.counter.ff05 <- th.counter.ff05 - 1
                if (th.counter.ff05 == 0)
                {
                  #Pierluca De Palma 17.09.2019
                  paramsErr  = c("0.5", "4.6", iFF, iPrevFF, round(ff.diff,digits=1))
                  error.data <- WeakChecks.GetError("002", "FF", row$DayTime, old.errors, paramsErr)
                  if (!is.null(error.data) & length(error.data) > 0)
                  {
                    prop.status[obs, "FF"] <- ifelse( prop.status[obs, "FF"] == "C" | prop.status[obs, "FF"] == "S", error.data[[1]], prop.status[obs, "FF"] )
                    new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "FF", iFF, "002", error.data[[1]], error.data[[2]])
                    prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "FF", error.data[[1]])
                  }
                }
              }
              else if (ff.diff > 15 & strptime(station.obs[obs, "DayTime"], "%Y%m%d%H") < (current.date + 24 * 3600))
              {
                th.counter.ff15 <- th.counter.ff15 - 1
                if (th.counter.ff15 == 0)
                {
                  paramsErr  = c("15", iFF, iPrevFF, round(ff.diff,digits=1))
                  error.data <- WeakChecks.GetError("003", "FF", row$DayTime, old.errors, paramsErr)
                  if (!is.null(error.data) & length(error.data) > 0)
                  {
                    prop.status[obs, "FF"] <- ifelse( prop.status[obs, "FF"] == "C" | prop.status[obs, "FF"] == "S", error.data[[1]], prop.status[obs, "FF"] )
                    new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "FF", iFF, "003", error.data[[1]], error.data[[2]])
                    prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "FF", error.data[[1]])
                  }
                }
              }
            }
        }

        #MOS Checks
        if (!is.null(mos.data))
        {
          row.idx <- which ( mos.data$DayTime == row$DayTime)
          if (length(row.idx) > 0)
          {
            mos.row <- mos.data[ row.idx[1], ]
            mosFF <- if (!is.na(mos.row$FF)) as.numeric(mos.row$FF) else NA

            # FF MOS Check
            if ( !is.na(mosFF) & !is.na(iFF))
            {
              ffDiff <- abs(iFF - mosFF)
              if (ffDiff > 40)
              {
                paramsErr  = c(40, iFF, mosFF)
                error.data <- WeakChecks.GetError("005", "FF", row$DayTime, old.errors, paramsErr)
                if (!is.null(error.data) & length(error.data) > 0)
                {
                  prop.status[obs, "FF"] <- ifelse( prop.status[obs, "FF"] == "C" | prop.status[obs, "FF"] == "S", error.data[[1]], prop.status[obs, "FF"] )
                  new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "FF", iFF, "005", error.data[[1]], error.data[[2]])
                  prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "FF", error.data[[1]])
                }
              }
              else if (ffDiff > 25 & ffDiff <= 40)
              {
                paramsErr  = c(25, 40, iFF, mosFF)
                error.data <- WeakChecks.GetError("006", "FF", row$DayTime, old.errors, paramsErr)
                if (!is.null(error.data) & length(error.data) > 0)
                {
                  prop.status[obs, "FF"] <- ifelse( prop.status[obs, "FF"] == "C" | prop.status[obs, "FF"] == "S", error.data[[1]], prop.status[obs, "FF"] )
                  new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "FF", iFF, "006", error.data[[1]], error.data[[2]])
                  prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "FF", error.data[[1]])
                }
              }
              else if (iFF == 0 & mosFF > 18)
              {
                paramsErr  = c(0, 18, iFF, mosFF)
                error.data <- WeakChecks.GetError("007", "FF", row$DayTime, old.errors, paramsErr)
                if (!is.null(error.data) & length(error.data) > 0)
                {
                  prop.status[obs, "FF"] <- ifelse( prop.status[obs, "FF"] == "C" | prop.status[obs, "FF"] == "S", error.data[[1]], prop.status[obs, "FF"] )
                  new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "FF", iFF, "007", error.data[[1]], error.data[[2]])
                  prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "FF", error.data[[1]])
                }
              }
              # removed on 24.09.2020
              #else if (mosFF > 0)
              #{
              #  rFF <- round(iFF/mosFF, digits = 2)
              #  if (rFF >= 1.75 & rFF <= 2.25)
              #  {
              #    paramsErr  = c(1.75, 2.25, iFF, mosFF)
              #    error.data <- WeakChecks.GetError("008", "FF", row$DayTime, old.errors, paramsErr)
              #    if (!is.null(error.data) & length(error.data) > 0)
              #    {
              #      prop.status[obs, "FF"] <- ifelse( prop.status[obs, "FF"] == "C" | prop.status[obs, "FF"] == "S", error.data[[1]], prop.status[obs, "FF"] )
              #      new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "FF", iFF, "008", error.data[[1]], error.data[[2]])
              #    }
              #  }
              #}
            }
          }
        }
      }

      # check if for the specific time and property exists an alert with level="W" =>
      # in that case reset the value of the property to NA
      station.obs [ which (prop.status[, "DIR"] == "W"), "DIR"] <- NA
      station.obs [ which (prop.status[, "FF"] == "W"), "FF"] <- NA

      # release all is possible
      rm(prop.status)

      # save the new data frame to the list and return it
      data.list[[1]] <- station.obs
      data.list[[2]] <- new.errors
      data.list[[3]] <- prop.flags

      data.list <- WeakChecks.Property.Interpolation(data.list, current.date, "FF")

      return (data.list)
    }
    ,error = function (err)
    {
      print (paste0('WeakChecks.ChecksWind - Error : ', err))
      return (data.list)
    }
    ,warning = function (warn)
    {
      print (paste0('WeakChecks.ChecksWind - Warning: ', warn))
      return (data.list)
    })

  return (result)
}
