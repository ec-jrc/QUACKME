#*********************************************************
#           Air Temperature,Dew point temperature,
#   Relative Humidity, Vapor pressure deficit, Slope
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
WeakChecks.ChecksTemperatures <- function(data.list, current.date, old.errors, mos.data)
{
  result <- tryCatch(
    {
      # extract essential data
      station.obs <- data.list[[1]]
      new.errors  <- data.list[[2]]
      prop.flags  <- data.list[[3]]

      # define the matrix of status
      prop.status <- as.data.frame(matrix(nrow = nrow(station.obs), ncol = 3))
      colnames(prop.status) <- c("TT", "TD", "D_RH")
      prop.status[, "TT"] <- "C"
      prop.status[, "TD"] <- "C"
      prop.status[, "D_RH"] <- "C"

      paramsErr  = c("")

      checkConsecutiveObservations <- FALSE
      raise.tt.consecutives <- FALSE
      raise.td.consecutives <- FALSE
      tt.consecutives <- c()
      td.consecutives <- c()
      iPrevTT <- NA
      iPrevTD <- NA

      for (obs in 1:nrow(station.obs))
      {
        # get current row
        row <- station.obs[obs, ]
        dtime <- strptime(station.obs[obs, "DayTime"],"%Y%m%d%H")

        if (obs > 1)
        {
          # previous observation time
          time.diff <- station.obs[obs, "DayTime"] - station.obs[obs -1, "DayTime"]
          checkConsecutiveObservations <- time.diff == 1 | time.diff == 77
        }

        # numeric values
        iTT <- if(!is.na(row$TT)) suppressWarnings(as.numeric(as.character(row$TT))) else NA
        iTD <- if(!is.na(row$TD)) suppressWarnings(as.numeric(as.character(row$TD))) else NA

        #### TT Checks
        if (!is.na(iTT))
        {
          if ( iTT < -80 | iTT > 60)
          {
            paramsErr  = c("-80 : 60", iTT)
            error.data <- WeakChecks.GetError("001", "TT", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "TT"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TT", iTT, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TT", error.data[[1]])
            }
          }

          if (checkConsecutiveObservations == TRUE)
          {
            ## check consecutive values for TT
            if (!is.na(iPrevTT))
            {
              tt.diff <- round(abs(iTT - iPrevTT), digits = 1)
              if ( tt.diff < 0.1)
              {
                tt.consecutives <- c(tt.consecutives, obs-1)
                #print (paste0('Prev[', station.obs[obs-1, "DayTime"], ', ', iPrevTT, ', Crt[', station.obs[obs, "DayTime"], ',', iTT, 'Length', length(tt.consecutives)))
              }
              else {
                raise.tt.consecutives <- length(tt.consecutives) >= 16
                if (!raise.tt.consecutives) { tt.consecutives <- c() }
              }

              if (tt.diff > 15)
              {
                dtime.prev <-  strptime(station.obs[obs-1, "DayTime"],"%Y%m%d%H")

                paramsErr  = c("15", iPrevTT, format(dtime.prev,format = '%T'), iTT, format(dtime, format = '%T'))
                error.data <- WeakChecks.GetError("003", "TT", row$DayTime, old.errors, paramsErr)
                if (!is.null(error.data) & length(error.data) > 0)
                {
                  prop.status[obs, "TT"] <- ifelse (prop.status[obs, "TT"] == "C" | prop.status[obs, "TT"] == "S", error.data[[1]], prop.status[obs, "TT"])
                  new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TT", iTT, "003", error.data[[1]], error.data[[2]])
                  prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TT", error.data[[1]])
                }

                # check if the error already exists for the previous time
                error.prev.time <- subset(new.errors, new.errors$DayTime == station.obs[obs-1, "DayTime"] &
                                            new.errors$Station == station.obs[obs-1, "Station"] &
                                            new.errors$Property == "TT" &
                                            new.errors$Code == "003")
                if (nrow(error.prev.time) <= 0)
                {
                  prop.status[obs-1, "TT"] <- ifelse (prop.status[obs-1, "TT"] == "C" | prop.status[obs-1, "TT"] == "S", error.data[[1]], prop.status[obs-1, "TT"])
                  new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, station.obs[obs-1, "DayTime"], "TT", iPrevTT, "003", error.data[[1]], error.data[[2]])
                  prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, station.obs[obs-1, "DayTime"], "TT", error.data[[1]])
                }
              }
            }
            else {
              raise.tt.consecutives <- length(tt.consecutives) >= 16
              if (!raise.tt.consecutives) { tt.consecutives <- c() }
            }
          }
          else {
            raise.tt.consecutives <- length(tt.consecutives) >= 16
            if (!raise.tt.consecutives) { tt.consecutives <- c() }
          }
        }
        else {
          raise.tt.consecutives <- length(tt.consecutives) >= 16
          if (!raise.tt.consecutives) { tt.consecutives <- c() }
        }

        if (raise.tt.consecutives)
        {
          # generate errors
          tmp.tt.list <- WeakChecks.Generate.TT.ConsecutiveErrors(tt.consecutives, list(station.obs, old.errors, new.errors, prop.status, prop.flags))
          new.errors <- tmp.tt.list[[1]]
          prop.status <- tmp.tt.list[[2]]
          prop.flags <- tmp.tt.list[[3]]

          raise.tt.consecutives <- FALSE
          tt.consecutives <- c()
        }
        iPrevTT <- iTT

        #### TD checks
        if (!is.na(iTD))
        {
          if ( iTD < -80 | iTD > 35)
          {
            paramsErr  = c("-80 : 35", iTD)
            error.data <- WeakChecks.GetError("001", "TD", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "TD"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TD", iTD, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TD", error.data[[1]])
            }
          }

          if (checkConsecutiveObservations == TRUE)
          {

            if (!is.na(iPrevTD))
            {

              td.diff <- round(abs(iTD - iPrevTD), digits = 2)
              if ( td.diff < 0.1)
              {
                td.consecutives <- c(td.consecutives, obs-1)
              }
              else {
                raise.td.consecutives <- length(td.consecutives) >= 16
                if (!raise.td.consecutives) { td.consecutives <- c() }
              }

              if (td.diff > 11)
              {
                dtime.prev <-  strptime(station.obs[obs-1, "DayTime"],"%Y%m%d%H")

                #Pierluca De Palma 17.09.2019
                paramsErr  = c(11, iPrevTD, format(dtime.prev,format = '%T'), iTD, format(dtime, format = '%T'))
                error.data <- WeakChecks.GetError("004", "TD", row$DayTime, old.errors, paramsErr)
                if (!is.null(error.data) & length(error.data) > 0)
                {
                  prop.status[obs, "TD"] <- ifelse (prop.status[obs, "TD"] == "C" | prop.status[obs, "TD"] == "S", error.data[[1]], prop.status[obs, "TD"])
                  new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TD", iTD, "004", error.data[[1]], error.data[[2]])
                  prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TD", error.data[[1]])
                }
                # check if the error already exists for the previous time
                error.prev.time <- subset(new.errors, new.errors$DayTime == station.obs[obs-1, "DayTime"] &
                                            new.errors$Station == station.obs[obs-1, "Station"] &
                                            new.errors$Property == "TD" &
                                            new.errors$Code == "004")
                if (nrow(error.prev.time) <= 0)
                {
                  prop.status[obs-1, "TT"] <- ifelse (prop.status[obs-1, "TD"] == "C" | prop.status[obs-1, "TD"] == "S", error.data[[1]], prop.status[obs-1, "TD"])
                  new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, station.obs[obs-1, "DayTime"], "TD", iPrevTD, "004", error.data[[1]], error.data[[2]])
                  prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, station.obs[obs-1, "DayTime"], "TD", error.data[[1]])
                }
              }
            }
            else {
              raise.td.consecutives <- length(td.consecutives) >= 16
              if (!raise.td.consecutives) { td.consecutives <- c() }
            }
          }
          else {
            raise.td.consecutives <- length(td.consecutives) >= 16
            if (!raise.td.consecutives) { td.consecutives <- c() }
          }
        }
        else {
          raise.td.consecutives <- length(td.consecutives) >= 16
          if (!raise.td.consecutives) { td.consecutives <- c() }
        }

        if (raise.td.consecutives)
        {
          # generate errors
          tmp.td.list <- WeakChecks.Generate.TD.ConsecutiveErrors(td.consecutives, list(station.obs, old.errors, new.errors, prop.status, prop.flags))
          new.errors <- tmp.td.list[[1]]
          prop.status <- tmp.td.list[[2]]
          prop.flags <- tmp.td.list[[3]]

          raise.td.consecutives <- FALSE
          td.consecutives <- c()
        }
        iPrevTD <- iTD

        # check if is necessary to replace the TD with TT
        if (!is.na(iTT) & !is.na(iTD))
        {
          if (iTD > iTT)
          {
            #print (paste0('Station:', row$Station, ', DayTime:', row$DayTime, ', TT:', iTT, ', TD:', iTD))
            if ( (iTD - iTT) < 1.0 )
            {
              # replace Dew Point temperature with Air temperature
              station.obs[obs, "TD"] <- iTT
              print ( paste0('TD value [', iTD, '] replaced with TT value [', iTT, '] for Station no. ', row$Station, ' and time ', row$DayTime ))
              iTD <- iTT
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TD", "R")
            }
            else
            {
              paramsErr  = c(iTD, iTT)
              error.data <- WeakChecks.GetError("002", "TD", row$DayTime, old.errors, paramsErr)
              if (!is.null(error.data) & length(error.data) > 0)
              {
                prop.status[obs, "TD"] <- ifelse (prop.status[obs, "TD"] == "C" | prop.status[obs, "TD"] == "S", error.data[[1]], prop.status[obs, "TD"])
                new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TD", iTD, "002", error.data[[1]], error.data[[2]])
                prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TD", error.data[[1]])
              }

              # raise error even for TT
              error.data <- WeakChecks.GetError("006", "TT", row$DayTime, old.errors, paramsErr)
              if (!is.null(error.data) & length(error.data) > 0)
              {
                prop.status[obs, "TT"] <- ifelse (prop.status[obs, "TT"] == "C" | prop.status[obs, "TT"] == "S", error.data[[1]], prop.status[obs, "TT"])
                new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TT", iTT, "006", error.data[[1]], error.data[[2]])
                prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TT", error.data[[1]])
              }
            }
          }
        }

        #### MOS Checks
        if (!is.null(mos.data))
        {
          row.idx <- which ( mos.data$DayTime == row$DayTime)
          if (length(row.idx) > 0)
          {
            mos.row <- mos.data[ row.idx[1], ]
            mosTT <- if (!is.na(mos.row$TT)) as.numeric(mos.row$TT) else NA
            mosTD <- if (!is.na(mos.row$TD)) as.numeric(mos.row$TD) else NA

            # TT MOS Check
            if ( !is.na(mosTT) & !is.na(iTT))
            {
              ttDiff <- abs(iTT - mosTT)
              if (ttDiff > 12)
              {
                paramsErr  = c(12, iTT, mosTT)
                error.data <- WeakChecks.GetError("004", "TT", row$DayTime, old.errors, paramsErr)
                if (!is.null(error.data) & length(error.data) > 0)
                {
                  prop.status[obs, "TT"] <- ifelse (prop.status[obs, "TT"] == "C" | prop.status[obs, "TT"] == "S", error.data[[1]], prop.status[obs, "TT"])
                  new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TT", iTT, "004", error.data[[1]], error.data[[2]])
                  prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TT", error.data[[1]])
                }
              }
              else if (ttDiff > 8.5 & ttDiff <= 12)
              {
                paramsErr  = c(8.5, 12, iTT, mosTT)
                error.data <- WeakChecks.GetError("005", "TT", row$DayTime, old.errors, paramsErr)
                if (!is.null(error.data) & length(error.data) > 0)
                {
                  prop.status[obs, "TT"] <- ifelse (prop.status[obs, "TT"] == "C" | prop.status[obs, "TT"] == "S", error.data[[1]], prop.status[obs, "TT"])
                  new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TT", iTT, "005", error.data[[1]], error.data[[2]])
                  prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TT", error.data[[1]])
                }
              }
            }

            # TD MOS Check
            if ( !is.na(mosTD) & !is.na(iTD))
            {
              tdDiff <- abs(iTD - mosTD)
              if (tdDiff > 15)
              {
                paramsErr  = c(15, iTD, mosTD)
                error.data <- WeakChecks.GetError("005", "TD", row$DayTime, old.errors, paramsErr)
                if (!is.null(error.data) & length(error.data) > 0)
                {
                  prop.status[obs, "TD"] <- ifelse (prop.status[obs, "TD"] == "C" | prop.status[obs, "TD"] == "S", error.data[[1]], prop.status[obs, "TD"])
                  new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TD", iTD, "005", error.data[[1]], error.data[[2]])
                  prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TD", error.data[[1]])
                }
              }
              else if (tdDiff > 11 & tdDiff <= 15)
              {
                paramsErr  = c(11, 15, iTD, mosTD)
                error.data <- WeakChecks.GetError("006", "TD", row$DayTime, old.errors, paramsErr)
                if (!is.null(error.data) & length(error.data) > 0)
                {
                  prop.status[obs, "TD"] <- ifelse (prop.status[obs, "TD"] == "C" | prop.status[obs, "TD"] == "S", error.data[[1]], prop.status[obs, "TD"])
                  new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TD", iTD, "006", error.data[[1]], error.data[[2]])
                  prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TD", error.data[[1]])
                }
              }
            }
          }
        }
      }

      # add wrong / suspicious flags to the possible other flags

      # check if for the specific time and property exists an alert with level="W" =>
      # in that case reset the value of the property to NA
      station.obs [ which (prop.status[, "TT"] == "W"), "TT"] <- NA
      station.obs [ which (prop.status[, "TD"] == "W"), "TD"] <- NA

      # check if necessary to make the interpolation for the TT and TD properties, before to calculate the various other properties
      # that depends by TT & TD

      # make TT & TD interpolation if configured
      data.list[[1]] <- station.obs
      data.list[[2]] <- new.errors
      data.list[[3]] <- prop.flags
      data.list <- WeakChecks.Property.Interpolation(data.list, current.date, "TT")
      data.list <- WeakChecks.Property.Interpolation(data.list, current.date, "TD")

      station.obs <- data.list[[1]]
      new.errors  <- data.list[[2]]
      prop.flags  <- data.list[[3]]

      th.counter.rh <- 20

      # calculate dynamic properties once the interpolations was done
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
        iTT <- if(!is.na(row$TT)) suppressWarnings(as.numeric(as.character(row$TT))) else NA
        iTD <- if(!is.na(row$TD)) suppressWarnings(as.numeric(as.character(row$TD))) else NA
        obs.flags <- subset(prop.flags, (prop.flags$Property == "TT" | prop.flags$Property == "TD") &
                                         prop.flags$DayTime == station.obs[obs, "DayTime"])

        #### Calculated properties : D_E, D_RH, D_VPD, D_SLOPE
        d_e <- NA
        d_rh <- NA
        d_vpd <- NA
        if ( !is.na(iTD) & !is.na(iTT))
        {
          #### Calculate : vapor pressure, vapor pressure deficit, relative humidity
          if (iTD <= iTT)
          {
            d_vpd <- EDEF(iTT, iTD)
            d_e   <- ESAT(iTT, iTD)
            d_rh  <- ERH(iTT, iTD)

            station.obs[obs, "D_VPD"] <- round(d_vpd, digits = 2)
            station.obs[obs, "D_E"]   <- round(d_e, digits = 2)
            station.obs[obs, "D_RH"]  <- round(d_rh, digits = 2)

            if (nrow(obs.flags) > 0)
            {
              prop.flags <- WeakChecks.ManageMultipleFlag(prop.flags, row[1, "Station"], row[1, "DayTime"], "D_RH", obs.flags[, "Flags"])
              prop.flags <- WeakChecks.ManageMultipleFlag(prop.flags, row[1, "Station"], row[1, "DayTime"], "D_E", obs.flags[, "Flags"])
              prop.flags <- WeakChecks.ManageMultipleFlag(prop.flags, row[1, "Station"], row[1, "DayTime"], "D_VPD", obs.flags[, "Flags"])
            }
          }
          else {
            # verify again the TD and TT values only if one of them was interpolated
            tt.interpolated <- nrow(subset(prop.flags, prop.flags$DayTime == row[1, "DayTime"] && prop.flags$Property == "TT" && str_detect('I', prop.flags$Flags))) > 0
            td.interpolated <- nrow(subset(prop.flags, prop.flags$DayTime == row[1, "DayTime"] && prop.flags$Property == "TD" && str_detect('I', prop.flags$Flags))) > 0

            print (paste0('TD.Interpolated:', td.interpolated, ', TT.Interpolated:', tt.interpolated, ', TT:', iTT, ', TD:', iTD))
            if (tt.interpolated == TRUE | td.interpolated == TRUE)
            {
              if ( (iTD - iTT) < 1.0 )
              {
                # replace Dew Point temperature with Air temperature
                station.obs[obs, "TD"] <- iTT
                print ( paste0('TD value [', iTD, '] replaced with TT value [', iTT, '] for Station no. ', row$Station, ' and time ', row$DayTime ))
                iTD <- iTT
                prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "TD", "R")
              }
              else
              {
                # reset interpolated values - (v2.0.5)
                if (tt.interpolated) {
                  iTT <- NA
                  station.obs[obs, "TT"] <- NA
                  print (paste0('Removed interpolated TT for Station=', station.obs[1, "Station"], ' Time=', station.obs[obs, "DayTime"]))
                }

                if (td.interpolated)
                {
                  iTD <- NA
                  station.obs[obs, "TD"] <- NA
                  print (paste0('Removed interpolated TD for Station=', station.obs[1, "Station"], ' Time=', station.obs[obs, "DayTime"]))
                }
              }
            }
          }

          #### Calculate slope saturation
          if ( !is.na(iTT) & !is.na(d_e) & !is.na(d_vpd))
          {
            station.obs[obs, "D_SLOPE"] <- round(ESLOPE( d_e + d_vpd, iTT), digits = 3)
            if (nrow(obs.flags) > 0)
            {
              prop.flags <- WeakChecks.ManageMultipleFlag(prop.flags, row[1, "Station"], row[1, "DayTime"], "D_SLOPE", obs.flags[, "Flags"])
            }
          }
        }

        #### Check of calculated relative humidity
        if (!is.na(d_rh))
        {
          if ( d_rh < 0 | d_rh > 100)
          {
            #Pierluca De Palma 18.09.2019
            paramsErr  = c("0 - 100",d_rh)
            error.data <- WeakChecks.GetError("001", "D_RH", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "D_RH"] <- ifelse (prop.status[obs, "D_RH"] == "C" | prop.status[obs, "D_RH"] == "S", error.data[[1]], prop.status[obs, "D_RH"])
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "D_RH", d_rh, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "D_RH", error.data[[1]])
            }
          }

          if (checkConsecutiveObservations == TRUE)
          {
            # check consecutive values for calculate relative humidity
            iPrevDRH <- ifelse ( !is.na(station.obs[obs-1, "D_RH"]) , suppressWarnings(as.numeric(as.character(station.obs[obs-1, "D_RH"]))), NA)

            if (!is.na(iPrevDRH) & d_rh > 0 & iPrevDRH > 0)
            {
              rh.diff <- round(abs(d_rh - iPrevDRH), digits=2)

              if (rh.diff < 0.5 & d_rh < 95 & iPrevDRH < 95 & strptime(station.obs[obs, "DayTime"], "%Y%m%d%H") < (current.date + 24 * 3600))
              {
                th.counter.rh <- th.counter.rh - 1
                if (th.counter.rh == 0)
                {
                  integer.tt.values <- CheckIntegerValues(station.obs[, "TT"],1)
                  integer.td.values <- CheckIntegerValues(station.obs[, "TD"],1)

                  if (integer.tt.values == FALSE & integer.td.values == FALSE)
                  {
                    paramsErr  = c("0.5", d_rh, iPrevDRH, rh.diff)
                    error.data <- WeakChecks.GetError("002", "D_RH", row$DayTime, old.errors, paramsErr)
                    if (!is.null(error.data) & length(error.data) > 0)
                    {
                      prop.status[obs, "D_RH"] <- ifelse (prop.status[obs, "D_RH"] == "C" | prop.status[obs, "D_RH"] == "S", error.data[[1]], prop.status[obs, "D_RH"])
                      new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "D_RH", d_rh, "002", error.data[[1]], error.data[[2]])
                      prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "D_RH", error.data[[1]])
                    }
                  }
                }
              }
            }
          }
        }
      }

      #reset eventually wrong values for calculated relative humidity
      station.obs [ which (prop.status[, "D_RH"] == "W"), "D_RH"] <- NA

      # make the interpolation of D_RH is configured
      data.list[[1]] <- station.obs
      data.list[[2]] <- new.errors
      data.list[[3]] <- prop.flags

      data.list <- WeakChecks.Property.Interpolation(data.list, current.date, "D_RH")

      # release all if possible
      rm(prop.status)

      # save the new data frame to the list and return it
      return (data.list)
    }
    ,error = function (err)
    {
      print (paste0('WeakChecks.ChecksTemperatures - Error : ', err))
      return (data.list)
    }
    ,warning = function (warn)
    {
      print (paste0('WeakChecks.ChecksTemperatures - Warning: ', warn))
      return (data.list)
    })

  return (result)
}
