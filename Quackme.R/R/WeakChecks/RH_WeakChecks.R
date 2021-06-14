#*********************************************************
#                   Relative humidity
#                       Weak Checks
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
WeakChecks.ChecksHumidity <- function(data.list, current.date, old.errors, mos.data)
{
  result <- tryCatch(
    {
      # extract essential data
      station.obs <- data.list[[1]]
      new.errors  <- data.list[[2]]
      prop.flags  <- data.list[[3]]

      # define the matrix of status
      prop.status <- as.data.frame(matrix(nrow = nrow(station.obs), ncol = 1))
      colnames(prop.status) <- c("RH")
      prop.status[, "RH"] <- "C"

      paramsErr  = c("")

      th.counter.rh <- 20

      #Pierluca De Palma 18.09.2019
      #Default Error Parameters
      paramsErr  = c("")

      # make the test only if the RH column is present into the source data.frame
      if ("RH" %in% colnames(station.obs))
      {
        for (obs in 1:nrow(station.obs))
        {
          # get current row
          row <- station.obs[obs, ]

          # get numeric value
          iRH <- ifelse (!is.na(row$RH), suppressWarnings(as.numeric(as.character(row$RH))), NA)

          if (!is.na(iRH))
          {
            if ( iRH < 0 | iRH > 100)
            {
              #Pierluca De Palma 17.09.2019
              paramsErr  = c("0 - 100", iRH)
              error.data <- WeakChecks.GetError("001", "RH", row$DayTime, old.errors, paramsErr)
              if (!is.null(error.data) & length(error.data) > 0)
              {
                prop.status[obs, "RH"] <- error.data[[1]]
                new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RH", iRH, "001", error.data[[1]], error.data[[2]])
                prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "RH", error.data[[1]])
              }
            }

            if (obs > 1)
            {
              # check consecutive values for RH
              prevDayTime <- strptime(row$DayTime, "%Y%m%d%H") - 1 * 3600

              # check differences for consecutive times only for hourly observation
              if (strptime(station.obs[obs-1, "DayTime"], "%Y%m%d%H") == prevDayTime)
              {
                # get value of previous hourly observations
                iPrevRH <- ifelse(!is.na(station.obs[obs-1, "RH"]), suppressWarnings(as.numeric(as.character(station.obs[obs-1, "RH"]))), NA)

                if (!is.na(iRH) & !is.na(iPrevRH) & iRH > 0 & iPrevRH > 0)
                {
                  rh.diff <- round(abs(iRH - iPrevRH), digits = 2)

                  if (rh.diff < 0.5 & iRH < 95 & iPrevRH < 95 &
                      strptime(station.obs[obs, "DayTime"], "%Y%m%d%H") < (current.date + 24 * 3600))
                  {
                    th.counter.rh <- th.counter.rh - 1
                    if (th.counter.rh == 0)
                    {
                      #Pierluca De Palma 17.09.2019
                      paramsErr  = c("0.5", iRH, iPrevRH, rh.diff)
                      error.data <- WeakChecks.GetError("002", "RH", row$DayTime, old.errors, paramsErr)
                      if (!is.null(error.data) & length(error.data) > 0)
                      {
                        prop.status[obs, "RH"] <- ifelse (prop.status[obs, "RH"] == "C" | prop.status[obs, "RH"] == "S", error.data[[1]], prop.status[obs, "RH"])
                        new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RH", iRH, "002", error.data[[1]], error.data[[2]])
                        prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "RH", error.data[[1]])
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      # check if for the specific time and property exists an alert with level="W" =>
      # in that case reset the value of the property to NA
      station.obs [ which (prop.status[, "RH"] == "W"), "RH"] <- NA

      # release all if possible
      rm(prop.status)

      # make the interpolation of D_RH if configured
      data.list[[1]] <- station.obs
      data.list[[2]] <- new.errors
      data.list[[3]] <- prop.flags

      data.list <- WeakChecks.Property.Interpolation(data.list, current.date, "RH")

      # return data
      return (data.list)
    }
    ,error = function (err)
    {
      print (paste0('WeakChecks.ChecksHumidity - Error : ', err))
      return (data.list)
    }
    ,warning = function (warn)
    {
      print (paste0('WeakChecks.ChecksHumidity - Warning: ', warn))
      return (data.list)
    })

  return (result)
}
