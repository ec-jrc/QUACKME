#*********************************************************
#               Atmosphere presure
#                 Weak Checks
#*********************************************************

#*********************************************************
# The checks will be done for a single station
# Parameters :
#  - data.list    [INPUT] [LIST]			 	- list with 2 data.frame (observations and new errors)
#  - current.date [INPUT] [DATE]			 	- date of the elaboration
#  - old.errors   [INPUT] [DATA.FRAME]  - data frame with errors of previous run
#  - mos.data     [INPUT] [DATA.FRAME]  - MOS data
# RETURN :
#  [LIST] - list with 2 data.frame : one with data and another with the new errors
#*********************************************************
WeakChecks.ChecksAir <- function(data.list, current.date, old.errors, mos.data)
{
  result <- tryCatch(
    {
      # extract essential data
      station.obs <- data.list[[1]]
      new.errors  <- data.list[[2]]
      prop.flags  <- data.list[[3]]

      # define the matrix of status
      prop.status <- as.data.frame(matrix(nrow = nrow(station.obs), ncol = 2))
      colnames(prop.status) <- c("AP", "QFF")
      prop.status[, "AP"] <- "C"
      prop.status[, "QFF"] <- "C"

      paramsErr  = c("")

      checkConsecutiveObservations <- FALSE
      for (obs in 1:nrow(station.obs))
      {
        # get current row
        row <- station.obs[obs, ]

        if (obs > 1)
        {
          #check of the previous observation is on hour / 3 hour
          prev1H <- strptime(row$DayTime, "%Y%m%d%H") - 1 * 3600
          prev3H <- strptime(row$DayTime, "%Y%m%d%H") - 3 * 3600
          checkConsecutiveObservations <- strptime(station.obs[obs-1, "DayTime"], "%Y%m%d%H") == prev1H |
                                          strptime(station.obs[obs-1, "DayTime"], "%Y%m%d%H") == prev3H
        }

        iAP <- ifelse (!is.na(row$AP), suppressWarnings(as.numeric(as.character(row$AP))), NA)
        if (!is.na(iAP))
        {
          if ( iAP < 500 | iAP > 1100)
          {
            #Pierluca De Palma 17.09.2019
            paramsErr  = c('500 - 1000', iAP)
            error.data <- WeakChecks.GetError("001", "AP", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "AP"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "AP", iAP, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "AP", error.data[[1]])
            }
          }

          if (checkConsecutiveObservations)

          {
            ## check consecutive values for AP
            iPrevAP <- ifelse (!is.na(station.obs[obs-1, "AP"]), suppressWarnings(as.numeric(as.character(station.obs[obs-1, "AP"]))) , NA)

            if (!is.na(iPrevAP))
            {
              ap.diff <- abs(iAP - iPrevAP)
              if (ap.diff > 15)
              {
                #Pierluca De Palma 18.09.2019
                paramsErr  = c(15, iAP, iPrevAP, round(ap.diff, digits=1))
                error.data <- WeakChecks.GetError("002", "AP", row$DayTime, old.errors, paramsErr)
                if (!is.null(error.data) & length(error.data) > 0)
                {
                  prop.status[obs, "AP"] <- ifelse (prop.status[obs, "AP"] == "C" | prop.status[obs, "AP"] == "S", error.data[[1]], prop.status[obs, "AP"])
                  new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "AP", iAP, "002", error.data[[1]], error.data[[2]])
                  prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "AP", error.data[[1]])
                }
              }
            }
          }
        }

        iQFF <- if (!is.na(row$QFF)) suppressWarnings(as.numeric(as.character(row$QFF))) else NA
        if (!is.na(iQFF))
        {
          if ( iQFF < 950 | iQFF > 1060)
          {
            #Pierluca De Palma 18.09.2019
            paramsErr  = c("950 - 1060", iQFF)
            error.data <- WeakChecks.GetError("001", "QFF", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "QFF"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "QFF", iQFF, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "QFF", error.data[[1]])
            }
          }
        }
      }

      # check if for the specific time and property exists an alert with level="W" =>
      # in that case reset the value of the property to NA
      station.obs [ which (prop.status[, "AP"] == "W"), "AP"] <- NA
      station.obs [ which (prop.status[, "QFF"] == "W"), "QFF"] <- NA

      # release all is possible
      rm(prop.status)

      # save the new data frame to the list and return it
      data.list[[1]] <- station.obs
      data.list[[2]] <- new.errors
      data.list[[3]] <- prop.flags
      return (data.list)
    }
    ,error = function (err)
    {
      print (paste0('WeakChecks.ChecksAir - Error : ', err))
      return (data.list)
    }
    ,warning = function (warn)
    {
      print (paste0('WeakChecks.ChecksAir - Warning: ', warn))
      return (data.list)
    })

  return (result)
}
