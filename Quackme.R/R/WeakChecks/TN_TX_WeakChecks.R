#*********************************************************
#           Minimum and Maximum Temperature Checks
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
WeakChecks.ChecksMinMaxTemperatures <- function(data.list, current.date, old.errors, mos.data)
{
  result <- tryCatch(
    {
      # extract essential data
      station.obs <- data.list[[1]]
      new.errors  <- data.list[[2]]
      prop.flags  <- data.list[[3]]

      # define the matrix of status
      prop.status <- as.data.frame(matrix(nrow = nrow(station.obs), ncol = 6))
      colnames(prop.status) <- c("TN1", "TN6", "TN12", "TX1", "TX6", "TX12")
      prop.status[, "TN1"] <- "C"
      prop.status[, "TN6"] <- "C"
      prop.status[, "TN12"] <- "C"
      prop.status[, "TX1"] <- "C"
      prop.status[, "TX6"] <- "C"
      prop.status[, "TX12"] <- "C"
      paramsErr  = c("")

      th.counters.tn6 <- 15
      th.counters.tx6 <- 15
      th.counters.tn12 <- 15
      th.counters.tx12 <- 15

      checkConsecutiveObservations <- FALSE
      for (obs in 1:nrow(station.obs))
      {
        # get current row
        row <- station.obs[obs, ]

        if (obs > 1)
        {
          # previous observation time
          prevDayTime <- strptime(row$DayTime, "%Y%m%d%H") - 1 * 3600
          checkConsecutiveObservations <- strptime(station.obs[obs-1, "DayTime"], "%Y%m%d%H") == prevDayTime
        }

        # numeric values
        iTN1 <- ifelse (!is.na(row$TN1), suppressWarnings(as.numeric(as.character(row$TN1))), NA)
        iTN6 <- ifelse (!is.na(row$TN6), suppressWarnings(as.numeric(as.character(row$TN6))), NA)
        iTN12 <- ifelse (!is.na(row$TN12), suppressWarnings(as.numeric(as.character(row$TN12))), NA)

        iTX1 <- ifelse(!is.na(row$TX1), suppressWarnings(as.numeric(as.character(row$TX1))), NA)
        iTX6 <- ifelse(!is.na(row$TX6), suppressWarnings(as.numeric(as.character(row$TX6))), NA)
        iTX12 <- ifelse(!is.na(row$TX12), suppressWarnings(as.numeric(as.character(row$TX12))), NA)

        if (!is.na(iTN1))
        {
          if ( iTN1 < -80 | iTN1 > 40)
          {
            #Pierluca De Palma 18.09.2019
            paramsErr  = c("-80 - 40", iTN1)
            error.data <- WeakChecks.GetError("001", "TN1", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "TN1"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TN1", iTN1, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TN1", error.data[[1]])
            }
          }

          ## check consecutive values for TN1 only for difference of 1 hour between observations
          if (checkConsecutiveObservations)
          {
            iPrevTN1 <- ifelse (!is.na(station.obs[obs-1, "TN1"]), suppressWarnings(as.numeric(as.character(station.obs[obs-1, "TN1"]))), NA)
            if (!is.na(iPrevTN1))
            {
              tn1.diff <- abs(iTN1 - iPrevTN1)
              if (tn1.diff < 0.1)
              {
                #Pierluca De Palma 18.09.2019
                paramsErr  = c("0.1", iTN1, iPrevTN1, round(tn1.diff, digits = 1))
                error.data <- WeakChecks.GetError("002", "TN1", row$DayTime, old.errors, paramsErr)
                if (!is.null(error.data) & length(error.data) > 0)
                {
                  prop.status[obs, "TN1"] <- ifelse (prop.status[obs, "TN1"] == "C" | prop.status[obs, "TN1"] == "S", error.data[[1]], prop.status[obs, "TN1"])
                  new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TN1", iTN1, "002", error.data[[1]], error.data[[2]])
                  prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TN1", error.data[[1]])
                }
              }
              else if (tn1.diff > 15)
              {
                #Pierluca De Palma 18.09.2019
                paramsErr  = c("15", iTN1, iPrevTN1, round(tn1.diff, digits = 1))
                error.data <- WeakChecks.GetError("003", "TN1", row$DayTime, old.errors, paramsErr)
                if (!is.null(error.data) & length(error.data) > 0)
                {
                  prop.status[obs, "TN1"] <- ifelse (prop.status[obs, "TN1"] == "C" | prop.status[obs, "TN1"] == "S", error.data[[1]], prop.status[obs, "TN1"])
                  new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TN1", iTN1, "003", error.data[[1]], error.data[[2]])
                  prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TN1", error.data[[1]])
                }
              }
            }
          }
        }

        if (!is.na(iTN6))
        {
          if ( iTN6 < -80 | iTN6 > 40)
          {
            #Pierluca De Palma 18.09.2019
            paramsErr  = c("-80 - 40", iTN6)
            error.data <- WeakChecks.GetError("001", "TN6", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "TN6"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TN6", iTN6, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TN6", error.data[[1]])
            }
          }
        }

        if (!is.na(iTN12))
        {
          if ( iTN12 < -80 | iTN12 > 40)
          {
            #Pierluca De Palma 18.09.2019
            paramsErr  = c("-80 - 40", iTN12)
            error.data <- WeakChecks.GetError("001", "TN12", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "TN12"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TN12", iTN12, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TN12", error.data[[1]])
            }
          }
        }

        if (!is.na(iTX1))
        {
          if ( iTX1 < -80 | iTX1 > 60)
          {
            paramsErr  = c("-80 - 60", iTX1)
            error.data <- WeakChecks.GetError("001", "TX1", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "TX1"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TX1", iTX1, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TX1", error.data[[1]])
            }
          }

          ## check consecutive values for TX1
          if (checkConsecutiveObservations)
          {
            iPrevTX1 <- ifelse (!is.na(station.obs[obs-1, "TX1"]), suppressWarnings(as.numeric(as.character(station.obs[obs-1, "TX1"]))), NA)
            if (!is.na(iPrevTX1))
            {
              tx1.diff <- abs(iTX1 - iPrevTX1)
              if (tx1.diff < 0.1)
              {
                #Pierluca De Palma 18.09.2019
                paramsErr  = c("0.1", iTX1, iPrevTX1, round(tx1.diff, digits=1))
                error.data <- WeakChecks.GetError("002", "TX1", row$DayTime, old.errors, paramsErr)
                if (!is.null(error.data) & length(error.data) > 0)
                {
                  prop.status[obs, "TX1"] <- ifelse (prop.status[obs, "TX1"] == "C" | prop.status[obs, "TX1"] == "S", error.data[[1]], prop.status[obs, "TX1"])
                  new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TX1", iTX1, "002", error.data[[1]], error.data[[2]])
                  prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TX1", error.data[[1]])
                }
              }
              else if (tx1.diff > 15)
              {
                #Pierluca De Palma 18.09.2019
                paramsErr  = c("15", iTX1, iPrevTX1, round(tx1.diff, digits = 1))
                error.data <- WeakChecks.GetError("003", "TX1", row$DayTime, old.errors, paramsErr)
                if (!is.null(error.data) & length(error.data) > 0)
                {
                  prop.status[obs, "TX1"] <- ifelse (prop.status[obs, "TX1"] == "C" | prop.status[obs, "TX1"] == "S", error.data[[1]], prop.status[obs, "TX1"])
                  new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TX1", iTX1, "003", error.data[[1]], error.data[[2]])
                  prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TX1", error.data[[1]])
                }
              }
            }
          }
        }

        if (!is.na(iTX6))
        {
          if ( iTX6 < -80 | iTX6 > 60)
          {
            #Pierluca De Palma 18.09.2019
            paramsErr  = c("-80 - 60", iTX6)
            error.data <- WeakChecks.GetError("001", "TX6", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "TX6"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TX6", iTX6, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TX6", error.data[[1]])
            }
          }
        }

        if (!is.na(iTX12))
        {
          if ( iTX12 < -80 | iTX12 > 60)
          {
            #Pierluca De Palma 18.09.2019
            paramsErr  = c("-80 - 60", iTX12)
            error.data <- WeakChecks.GetError("001", "TX12", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "TX12"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TX12", iTX12, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TX12", error.data[[1]])
            }
          }
        }

        if (FALSE)
        {

        if (obs > 1)
        {

          prevDayTime <- strptime(row$DayTime, "%Y%m%d%H") - 1 * 3600

          # check differences for consecutive times only for hourly observation
          if (strptime(station.obs[obs-1, "DayTime"], "%Y%m%d%H") == prevDayTime)
          {


            ## check consecutive values for TN6
            ## Switched off on 28.01.2020
      			#iPrevTN6 <- if (!is.na(df.obs[obs-1, "TN6"])) suppressWarnings(as.numeric(as.character(df.obs[obs-1, "TN6"]))) else NA
      			#if (!is.na(iTN6) & !is.na(iPrevTN6))
      			#{
      			#  tn6.diff <- abs(iTN6 - iPrevTN6)
      			#  if (tn6.diff < 0.1)
      			#  {
      			#    th.counters.tn6 <- th.counters.tn6 - 1
      			#    if (th.counters.tn6 == 0)
      			#    {
      			#      print (paste0('TN6:', th.counters.tn6, ', DayTime:', row$DayTime))
      			#      #Pierluca De Palma 18.09.2019
      			#      paramsErr  = c("0.1", iTN6, iPrevTN6, round(tn6.diff, digits=1))
      		  #     obs.node.tn6[[1]] <- WeakChecks.ManageError("002", obs.node.tn6[[1]], row$DayTime, xml.errors, paramsErr)
      			#    }
      			#  }
      			#  else if (tn6.diff > 15)
      			#  {
      			#    #Pierluca De Palma 18.09.2019
      			#    paramsErr  = c("15", iTN6, iPrevTN6, round(tn6.diff, digits=1))
      			#	  obs.node.tn6[[1]] <- WeakChecks.ManageError("003", obs.node.tn6[[1]], row$DayTime, xml.errors, paramsErr)
      			#  }
      			#}

            ## check consecutive values for TN12
      			## Switched off on 28.01.2020
            #iPrevTN12 <- if (!is.na(df.obs[obs-1, "TN12"])) suppressWarnings(as.numeric(as.character(df.obs[obs-1, "TN12"]))) else NA
            #if (!is.na(iTN12) & !is.na(iPrevTN12))
      			#{
      			#  tn12.diff <- abs(iTN12 - iPrevTN12)
      			#  if (tn12.diff < 0.1)
      			#  {
      			#    th.counters.tn12 <- th.counters.tn12 - 1
      			#    if (th.counters.tn12 == 0)
      			#    {
      			#      #Pierluca De Palma 18.09.2019
      			#      paramsErr  = c("0.1", iTN12, iPrevTN12, round(tn12.diff, digits = 1))
      			#      obs.node.tn12[[1]] <- WeakChecks.ManageError("002", obs.node.tn12[[1]], row$DayTime, xml.errors, paramsErr)
      			#    }
      			#  }
      			#  else if (tn12.diff > 15)
      			#  {
      			#    #Pierluca De Palma 18.09.2019
      			#    paramsErr  = c("15", iTN12, iPrevTN12, round(tn12.diff, digits = 1))
      			#    obs.node.tn12[[1]] <- WeakChecks.ManageError("003", obs.node.tn12[[1]], row$DayTime, xml.errors, paramsErr)
      			#  }
      			#}



            ## check consecutive values for TX6
            ## Switched off on 28.01.2020
            #iPrevTX6 <- if (!is.na(df.obs[obs-1, "TX6"])) suppressWarnings(as.numeric(as.character(df.obs[obs-1, "TX6"]))) else NA
            #if (!is.na(iTX6) & !is.na(iPrevTX6))
            #{
            #  tx6.diff <- abs(iTX6 - iPrevTX6)
            #  if (tx6.diff < 0.1)
            #  {
            #    th.counters.tx6 <- th.counters.tx6 - 1
            #    if (th.counters.tx6 == 0)
            #    {
            #      #Pierluca De Palma 18.09.2019
            #      paramsErr  = c("0.1", iTX6, iPrevTX6, round(tx6.diff, digits=1))
            #      obs.node.tx6[[1]] <- WeakChecks.ManageError("002", obs.node.tx6[[1]], row$DayTime, xml.errors, paramsErr)
            #    }
            #  }
            #  else if (tx6.diff > 15)
            # {
            #    #Pierluca De Palma 18.09.2019
            #    paramsErr  = c("15", iTX6, iPrevTX6, round(tx6.diff, digits=1))
            #    obs.node.tx6[[1]] <- WeakChecks.ManageError("003", obs.node.tx6[[1]], row$DayTime, xml.errors, paramsErr)
            #  }
            #}

            ## check consecutive values for TX12
            ## Switched off on 28.01.2020
            #iPrevTX12 <- if (!is.na(df.obs[obs-1, "TX12"])) suppressWarnings(as.numeric(as.character(df.obs[obs-1, "TX12"]))) else NA
            #if (!is.na(iTX12) & !is.na(iPrevTX12))
            #{
            #  tx12.diff <- abs(iTX12 - iPrevTX12)
            #  if (tx12.diff < 0.1)
            #  {
            #    th.counters.tx12 <- th.counters.tx12 - 1
            #    if (th.counters.tx12 == 0)
            #    {
            #      #Pierluca De Palma 18.09.2019
            #      paramsErr  = c("0.1", iTX12, iPrevTX12, round(tx12.diff, digits=1))
            #      obs.node.tx12[[1]] <- WeakChecks.ManageError("002", obs.node.tx12[[1]], row$DayTime, xml.errors, paramsErr)
            #    }
            #  }
            #  else if (tx12.diff > 15)
            #  {
            #    #Pierluca De Palma 18.09.2019
            #    paramsErr  = c("15", iTX12, iPrevTX12, round(tx12.diff, digits=1))
            #    obs.node.tx12[[1]] <- WeakChecks.ManageError("003", obs.node.tx12[[1]], row$DayTime, xml.errors, paramsErr)
            #  }
            #}
          }
        }
        }
      }

      # check if for the specific time and property exists an alert with level="W" =>
      # in that case reset the value of the property to NA
      station.obs [ which (prop.status[, "TN1"] == "W"), "TN1"] <- NA
      station.obs [ which (prop.status[, "TN6"] == "W"), "TN6"] <- NA
      station.obs [ which (prop.status[, "TN12"] == "W"), "TN12"] <- NA
      station.obs [ which (prop.status[, "TX1"] == "W"), "TX1"] <- NA
      station.obs [ which (prop.status[, "TX6"] == "W"), "TX6"] <- NA
      station.obs [ which (prop.status[, "TX12"] == "W"), "TX12"] <- NA

      # release all is possible
      rm(prop.status)

      # save the new data frame to the list and return it
      data.list[[1]] <- station.obs
      data.list[[2]] <- new.errors
      data.list[[3]] <- prop.flags

      # interpolate TN1, TX1
      data.list <- WeakChecks.Property.Interpolation(data.list, current.date, "TX1")
      data.list <- WeakChecks.Property.Interpolation(data.list, current.date, "TN1")

      return (data.list)
    }
    ,error = function (err)
    {
      print (paste0('WeakChecks.ChecksMinMaxTemperatures - Error : ', err))
      return (data.list)
    }
    ,warning = function (warn)
    {
      print (paste0('WeakChecks.ChecksMinMaxTemperatures - Warning: ', warn))
      return (data.list)
    })

  return (result)
}
