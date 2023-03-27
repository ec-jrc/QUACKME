#*********************************************************
#            Generic mathematical method
#                 Weak Checks
#*********************************************************

#*********************************************************
# LVAP = Latent Heat Of Vapourization
# Parameters :
#  - TT         [INPUT] [NUMERIC]         - temperature
#*********************************************************
LVAP <- function(TT)
{
  return ((as.numeric('597') - as.numeric('0.566') * as.numeric(TT)) * 4186)
}

#*********************************************************
# Celsius2Kelvin = Convert temperature from Celsius to Kelvin
# Parameters :
#  - TT         [INPUT] [INT]         - temperature
#*********************************************************
Celsius2Kelvin <- function(TT)
{
  return (as.numeric(TT) + as.numeric('273.15'))
}

#*********************************************************
# ESAT = Saturation vapor pressure
# This   function   calculates  the  (saturation)  vapor  pressure
#       from  temperature data. When TT1 is  the air temperature  and TT2
#       the dew-point  temperature the  result is the  vapour pressure of
#       the air. In case  TT1 = TT2 is the air temperature  the result is
#       the saturation vapour pressure.
# Parameters :
#  - TT1         [INPUT] [INT]         - temperature
#  - TT2         [INPUT] [INT]         - temperature
#*********************************************************
ESAT <- function(TT1, TT2)
{
  # Gas constant for water vapor
  RV <- as.numeric ('461.51')

  # Calculatre LVAP
  TT1_LVAP <- LVAP( TT1 )

  # calculate saturation
  RT_ESAT <- round( as.numeric('6.1078') * exp (TT1_LVAP/RV * (1./Celsius2Kelvin(0.) - 1./Celsius2Kelvin(TT2))), digits = 3)

  return (RT_ESAT)
}

#*********************************************************
# EDEF = Vapour pressure deficit (hPa)
# Parameters :
#  - TT         [INPUT] [INT]         - air temperature
#  - TD         [INPUT] [INT]         - dew-point temperature
#*********************************************************
EDEF <- function(TT, TD)
{
  VPD <- round(ESAT(TT, TT) - ESAT(TT, TD), digits = 3)

  return (VPD)
}

#*********************************************************
# ESLOPE = Calculate  the slope of  the saturation  vapour  pressure  versus
#          temperature curve
# Parameters :
#  - SVP          [INPUT] [DECIMAL]         - saturation vapour pressure
#  - TT           [INPUT] [DECIAML]         - air temperature
#*********************************************************
ESLOPE <- function(SVP, TT )
{
  ES <- round(238.102 * 17.32491 * SVP / (TT + 238.102)**2, digits = 3)

  return (ES)
}

#*********************************************************
# ERH - Calculate relative humidity
# Parameters :
#  - TT         [INPUT] [INT]         - air temperature
#  - TD         [INPUT] [INT]         - dew-pint temperature
#*********************************************************
ERH <- function(TT, TD)
{
  RH <- round(100 * ESAT(TT, TD) / ESAT(TT, TT), digits = 2)

  return (RH)
}


#*********************************************************
# Check if the valid values of the array are integer values
# Parameters :
#  - col.obs    [INPUT] [VECTOR]			 	  - vector with values to evaluate
#  - decimal.number
#  - mos.data   [INPUT] [DATA.FRAME]  - MOS data
# RETURN :
#               [BOOL]                 - TRUE if the array contains only integer values
#*********************************************************
CheckIntegerValues <- function (col.obs, decimal.number)
{
  par.data <- col.obs[ which(!is.na(col.obs))]
  answer <- FALSE
  sum.data <- 0
  if (length(par.data) > 0)
  {
    int.data <- as.integer( (par.data - trunc(par.data)) * (10 ** decimal.number))
    sum.data <- sum(int.data)
    return ( if (sum.data == 0) TRUE else FALSE)
  }

  return (answer)
}

#*********************************************************
# Precipitation cross checks for specific interval
# Parameters :
#  - data.list    [INPUT] [LIST]        - list that contains 4 DAta.Frame (data station, new errors, property flags, property status)
#  - current.date [INPUT] [DATE]			 	- date of the elaboration
#  - start.interval [INPUT] [INT]			  - hour from which to start the analysis
#  - old.errors   [INPUT] [DATA.FRAME]  - data frame with errors of previous run
#  - new.errors   [INPUT] [DATA.FRAME]  - data frame with errors of current run
#  - iPR24        [INPUT] [NUMERIC]     - 24H precipitation value
#  - iPR24.daytime  [INPUT] [DATE]      - 24H precipitation daytime
# RETURN :
#  [LIST] - list with 4 data.frame (data station, new errors, property flags, property status)
#*********************************************************
WeakChecks.Precipitation.CrossChecks <- function (data.list, current.date, start.interval, old.errors, iPR24, iPR24.daytime)
{
  result <- tryCatch( {
    station.obs <- data.list[[1]]
    new.errors  <- data.list[[2]]
    prop.flags  <- data.list[[3]]
    prop.status <- data.list[[4]]
    station.number <- station.obs[1, "Station"]

    # determine the interval (06 current day - 06 next day or 00 current day - 00 next day) but the DT1 will start 6 hours after the start of the interval
    dt1 <- current.date + start.interval * 3600 + 6 * 3600
    dt4 <- current.date + start.interval * 3600 + 24 * 3600

    dt <- dt1
    iPR06s <- c()
    while (dt <= dt4)
    {
      obs.06 <- subset(station.obs, strptime(station.obs$DayTime, "%Y%m%d%H") == dt)
      if (nrow(obs.06) >= 1 & !is.na(obs.06[1, "PR06"])){
        iPR06 <- suppressWarnings(as.integer(as.character(obs.06[1, "PR06"])))
        iPR06s <- c(iPR06s, iPR06)
        dt <- dt + 6 * 3600
      }
      else break
    }

    if (length(iPR06s) == 4)
    {
      sum.prec <- sum(iPR06s)
      if (abs(sum.prec - iPR24) > 10)
      {
        # create errors for 24H precipitation
        paramsErr = c( format((current.date + start.interval * 3600), "%Y-%m-%d %H:%M"),
                       format(dt4, "%Y-%m-%d %H:%M"),
                       iPR24,
                       format(iPR24.daytime, "%Y-%m-%d %H:%M"),
                       sum.prec,
                       10)
        error.data <- WeakChecks.GetError("003", "PR24", format(iPR24.daytime, "%Y%m%d%H"), old.errors, paramsErr)
        if (!is.null(error.data) & length(error.data) > 0)
        {
          idx.24H <- which( strptime(station.obs[, "DayTime"], "%Y%m%d%H") == iPR24.daytime)[1]
          prop.status[idx.24H, "PR24"] <- ifelse (prop.status[idx.24H, "PR24"] == "C" | prop.status[idx.24H, "PR24"] == "S", error.data[[1]], prop.status[idx.24H, "PR24"])
          new.errors[ nrow(new.errors) + 1, ] <- c(station.number, format(iPR24.daytime, "%Y%m%d%H"), "PR24", iPR24, "003", error.data[[1]], error.data[[2]])
          prop.flags <- WeakChecks.ManageFlag(prop.flags, station.number, format(iPR24.daytime, "%Y%m%d%H"), "PR24", error.data[[1]])
        }

        # create errors for 6h precipitation
        dt <- dt1
        print ('PR06 cross checks')
        while (dt <= dt4)
        {
          idx <- which( strptime(station.obs[, "DayTime"], "%Y%m%d%H") == dt)[1]
          error.data <- WeakChecks.GetError("003", "PR06", format(dt, "%Y%m%d%H"), old.errors, paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            prop.status[idx, "PR06"] <- ifelse (prop.status[idx, "PR06"] == "C" | prop.status[idx, "PR06"] == "S", error.data[[1]], prop.status[idx, "PR06"])
            new.errors[ nrow(new.errors) + 1, ] <- c(station.number, format(dt, "%Y%m%d%H"), "PR06", station.obs[idx, "PR06"], "003", error.data[[1]], error.data[[2]])
            prop.flags <- WeakChecks.ManageFlag(prop.flags, station.number, format(dt, "%Y%m%d%H"), "PR06", error.data[[1]])
          }

          dt <- dt + 6 * 3600
        }
      }
    }
    else
    {
      # check RR/TR values
      iRRs <- c()
      dt <- dt1
      while (dt <= dt4)
      {
        obs.06 <- subset(station.obs, strptime(station.obs$DayTime, "%Y%m%d%H") == dt, select = c("TR", "RR", "DayTime"))
        if (nrow(obs.06) >= 1 & !is.na(obs.06[1, "TR"]) & !is.na(obs.06[1, "RR"]))
        {
          iTR <- suppressWarnings(as.integer(as.character(obs.06[1, "TR"])))
          iRR <- suppressWarnings(as.numeric(as.character(obs.06[1, "RR"])))
          if (iTR == 6)
          {
            iRRs <- c(iRRs, iRR)
          }
          else if (iTR == 12)
          {
            obs.06.prev <- subset(station.obs, strptime(station.obs$DayTime, "%Y%m%d%H") == (dt - 6 * 3600), select = c("TR", "RR", "DayTime"))
            if (nrow(obs.06.prev) >= 1 & !is.na(obs.06.prev[1, "TR"]) & !is.na(obs.06.prev[1, "RR"]))
            {
              iTR.prev <- suppressWarnings(as.integer(as.character(obs.06.prev[1, "TR"])))
              iRR.prev <- suppressWarnings(as.numeric(as.character(obs.06.prev[1, "RR"])))
              if (iTR.prev == 6)
              {
                iRRs <- c(iRRs, (iRR - iRR.prev))
              }
              else break
            }
            else break
          }
          else break
        }

        dt <- dt + 6*3600
      }

      if (length(iRRs) == 4)
      {
        sum.prec <- sum(iRRs)
        if (abs(sum.prec - iPR24) > 10)
        {
          # create errors for 24H precipitation
          paramsErr = c( format(current.date + start.interval*3600, "%Y-%m-%d %H:%M"),
                        format(dt4, "%Y-%m-%d %H:%M") ,
                        iPR24,
                        format(iPR24.daytime, "%Y-%m-%d %H:%M"),
                        sum.prec,
                        10)
          error.data <- WeakChecks.GetError("005", "PR24", format(iPR24.daytime, "%Y%m%d%H"), old.errors, paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            idx.24H <- which( strptime(station.obs[, "DayTime"], "%Y%m%d%H") == iPR24.daytime)[1]
            prop.status[idx.24H, "PR24"] <- ifelse (prop.status[idx.24H, "PR24"] == "C" | prop.status[idx.24H, "PR24"] == "S", error.data[[1]], prop.status[idx.24H, "PR24"])
            new.errors[ nrow(new.errors) + 1, ] <- c(station.number, format(iPR24.daytime, "%Y%m%d%H"), "PR24", iPR24, "005", error.data[[1]], error.data[[2]])
            prop.flags <- WeakChecks.ManageFlag(prop.flags, station.number, format(iPR24.daytime, "%Y%m%d%H"), "PR24", error.data[[1]])
          }

          # create errors for 6h precipitation
          dt <- dt1
          print ('RR/TR cross checks')
          while (dt <= dt4)
          {
            idx <- which( strptime(station.obs[, "DayTime"], "%Y%m%d%H") == dt)[1]
            paramsErr = c( format(current.date + start.interval*3600, "%Y-%m-%d:%H"),
                          format(dt4, "%Y-%m-%d:%H"),
                          iPR24,
                          format(iPR24.daytime, "%Y-%m-%d:%H"),
                          sum.prec,
                          10,
                          station.obs[idx, "RR"],
                          station.obs[idx, "TR"])
            error.data <- WeakChecks.GetError("001", "RR", format(dt, "%Y%m%d%H"), old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[idx, "RR"] <- ifelse (prop.status[idx, "RR"] == "C" | prop.status[idx, "RR"] == "S", error.data[[1]], prop.status[idx, "RR"])
              new.errors[ nrow(new.errors) + 1, ] <- c(station.number, format(dt, "%Y%m%d%H"), "RR", station.obs[idx, "RR"], "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, station.number, format(dt, "%Y%m%d%H"), "RR", error.data[[1]])
            }

            dt <- dt + 6*3600
          }
        }
      }
    }

    # cross checks 1H precipitations
    dt1 <- current.date + (start.interval + 1) * 3600
    pr1H.obs <- subset(station.obs, strptime(station.obs$DayTime, "%Y%m%d%H") >= dt1 &
                                    strptime(station.obs$DayTime, "%Y%m%d%H") <= dt4)[, "PREC"]

    valid1.obs <- which (!is.na(pr1H.obs))
    if (length(pr1H.obs) == 24 & length(valid1.obs) == 24)
    {
      sum.prec <- sum(pr1H.obs)
      if (abs (sum.prec - iPR24) > 10)
      {
        # create errors for 24H precipitation
        idx.24H <- which( strptime(station.obs[, "DayTime"], "%Y%m%d%H") == iPR24.daytime)[1]
        paramsErr = c( format(current.date + start.interval*3600, "%Y-%m-%d %H:%M"),
                       format(dt4, "%Y-%m-%d %H:%M"),
                       iPR24,
                       format(iPR24.daytime, "%Y-%m-%d %H:%M"),
                       sum.prec,
                       10)
        error.data <- WeakChecks.GetError("004", "PR24", format(iPR24.daytime, "%Y%m%d%H"), old.errors, paramsErr)
        if (!is.null(error.data) & length(error.data) > 0)
        {
          prop.status[idx.24H, "PR24"] <- ifelse (prop.status[idx.24H, "PR24"] == "C" | prop.status[idx.24H, "PR24"] == "S", error.data[[1]], prop.status[idx.24H, "PR24"])
          new.errors[ nrow(new.errors) + 1, ] <- c(station.number, format(iPR24.daytime, "%Y%m%d%H"), "PR24", iPR24, "004", error.data[[1]], error.data[[2]])
          prop.flags <- WeakChecks.ManageFlag(prop.flags, station.number, format(iPR24.daytime, "%Y%m%d%H"), "PR24", error.data[[1]])
        }

        # create errors for 1h precipitation
        print ('1H cross checks')
        dt <- dt1
        while (dt <= dt4)
        {
          idx <- which( strptime(station.obs[, "DayTime"], "%Y%m%d%H") == dt)[1]
          print ( paste0('Data:', dt, ', Idx:', idx))
          error.data <- WeakChecks.GetError("005", "PREC", format(dt, "%Y%m%d%H"), old.errors, paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            prop.status[idx, "PREC"] <- ifelse (prop.status[idx, "PREC"] == "C" | prop.status[idx, "PREC"] == "S", error.data[[1]], prop.status[idx, "PREC"])
            new.errors[ nrow(new.errors) + 1, ] <- c(station.number, format(dt, "%Y%m%d%H"), "PREC", station.obs[idx, "PREC"], "005", error.data[[1]], error.data[[2]])
            prop.flags <- WeakChecks.ManageFlag(prop.flags, station.number, format(dt, "%Y%m%d%H"), "PREC", error.data[[1]])
          }
          dt <- dt + 1 * 3600
        }
      }
    }

    # prepare result
    data.list[[1]] <- station.obs
    data.list[[2]] <- new.errors
    data.list[[3]] <- prop.flags
    data.list[[4]] <- prop.status
    return (data.list)
  },
  error = function (err)
  {
    print (paste0('WeakChecks.Precipitation.CrossChecks[Station', station.number, '] - Error : ', err))
    return (data.list)
  }
  ,warning = function (warn)
  {
    print (paste0('WeakChecks.Precipitation.CrossChecks[Station', station.number, '] - Warning: ', warn))
    return (data.list)
  })

  return (result)
}

#*********************************************************
# Determine if the observation are hourly or not
# Parameters :
#  - dates    [INPUT] [VECTOR]  - the array of daytime observation
#             [RETURN] [BOOL]   - TRUE if hourly observation, FALSE else
#*********************************************************
WeakChecks.CheckHourlyObservations <- function(dates)
{
  result <- tryCatch({

    if (length(dates) < 2 ) return (FALSE)

    no.dates <- length(dates)
    diff.results <- diff(dates)
    diff.results[which(diff.results == 77)] <- 1
    if (no.dates > 12 & sum(diff.results) >= (no.dates-1)) return (TRUE)

    return (FALSE)
  }
  ,error = function (err)
  {
    print (paste0('WeakChecks.CheckHourlyObservations - Error : ', err))
    return (FALSE)
  }
  ,warning = function (warn)
  {
    print (paste0('WeakChecks.CheckHourlyObservations - Warning: ', warn))
    return (FALSE)
  })


  return (result)
}

#*********************************************************
# Make the temporal interpolation for a specific property relative
#
# Parameters :
#  - station.obs   [INPUT] [DATA.FRAME]	  - station observation
#  - current.date  [INPUT] [DATETIME]	    - elaboration date
#  - property      [INPUT] [STRING]       - name of column to interpolate
#  - digits        [INPUT] [INT]          - number of digits to round the value
#  - start.inter   [INPUT] [DATETIME]     - time of start interpolation interval
#  - end.inter     [INPUT] [DATETIME]     - time of end interpolation interval
#  - expected.obs  [INPUT] [INT]          - number of expected values
#  [RETURN] [VECTOR]  - Vector with interpolated data
#*********************************************************
WeakChecks.Column.Interpolation.ByInterval <- function(station.obs, current.date, property, digits, start.inter, end.inter, expected.obs)
{
  missing.values <- NULL

  result <- tryCatch( {

    # check if the observations are hourly or 3-hour
    is.HourlyObservation <- WeakChecks.CheckHourlyObservations(station.obs[, "DayTime"])
    hour.step <- if (is.HourlyObservation) 1 else 3

    # if the number of valid observation into the column are less than 80% the interpolation are not done
    obs.valid.index <- which( !is.na(station.obs[, property]) )
    obs.na.index <- which (is.na(station.obs[, property]))

    print (paste0('Station no.:', as.character(station.obs[1, "Station"]),
                  ',Property:', property,
                  ',Valid index:', as.character( length(obs.valid.index)),
                  ',NA index:', as.character( length(obs.na.index)),
                  ',Observations:', as.character(nrow(station.obs)),
                  ',Percentage:', as.character(round(length(obs.valid.index) / expected.obs, digits = 2))))

    if ( length(obs.na.index > 0) | length(obs.valid.index) < expected.obs)
    {
      if ( length(obs.valid.index) != expected.obs &
           round(length(obs.valid.index) / expected.obs, digits = 2) < 0.80)
      {
        print (paste0('Station no.:', as.character(station.obs[1, "Station"]),
                      ' not enough values to interpolate property ', property,
                      ' for date ', format(current.date, "%Y%m%d")))

        return (NULL)
      }

      # create indexes array and property values array
      missing.index <- c()
      missing.daytime <- c()
      valid.index <- c()
      obs.prop <- c()

      pos.index <- 1
      mis.index <- 0
      val.index <- 0

      # extract valid data for previous day
      pos.daytime <- current.date - 24*3600   # 00 of the previous day
      end.day <- pos.daytime + 23*3600   # 23 of previous day
      while (pos.daytime <= end.day)
      {
        row.d <- subset(station.obs, strptime(station.obs$DayTime, "%Y%m%d%H") == pos.daytime)
        if (nrow(row.d) > 0 & !is.na(row.d[1, property]))
        {
          val.index <- val.index + 1
          valid.index[val.index] <- pos.index
          obs.prop[val.index] <- row.d[1, property]
        }
        else if (pos.daytime >= start.inter & pos.daytime <= end.inter)
        {
          mis.index <- mis.index + 1
          missing.index[mis.index] <- pos.index
          missing.daytime[mis.index] <- format(pos.daytime, "%Y%m%d%H")
        }

        # increment position and daytime
        pos.index <- pos.index + 1
        pos.daytime <- pos.daytime + hour.step * 3600
      }

      #print (paste0('passed prev day', pos.index))

      # extract valid data for current date
      pos.daytime <- current.date
      end.day <- pos.daytime + 23*3600
      while (pos.daytime <= end.day)
      {
        row.d <- subset(station.obs, strptime(station.obs$DayTime, "%Y%m%d%H") == pos.daytime)
        if ( (nrow(row.d) > 0 & !is.na(row.d[1, property])))
        {
          val.index <- val.index + 1
          valid.index[val.index] <- pos.index
          obs.prop[val.index] <- row.d[1, property]
        }
        else if (pos.daytime >= start.inter & pos.daytime <= end.inter)
        {
          # missing observation row or property value is NA
          mis.index <- mis.index + 1
          missing.index[mis.index] <- pos.index
          missing.daytime[mis.index] <- format(pos.daytime, "%Y%m%d%H")
        }

        # increment position and daytime
        pos.index <- pos.index + 1
        pos.daytime <- pos.daytime + hour.step * 3600
      }

      #print ('passed current day')

      # extract valid data for next day
      pos.daytime <- current.date + 24*3600 # 00 of next day
      end.day <- pos.daytime + 23*3600
      max.obs.day <- max ( strptime(station.obs[, "DayTime"], "%Y%m%d%H"))
      if (max.obs.day < end.day & end.inter < end.day & end.inter >= max.obs.day)
      {
        end.day <- end.inter
      }
      while (pos.daytime <= end.day)
      {
        row.d <- subset(station.obs, strptime(station.obs$DayTime, "%Y%m%d%H") == pos.daytime)
        if (nrow(row.d) > 0 & !is.na(row.d[1, property]))
        {
          val.index <- val.index + 1
          valid.index[val.index] <- pos.index
          obs.prop[val.index] <- row.d[1, property]
        }
        else if (pos.daytime >= start.inter & pos.daytime <= end.inter)
        {
          mis.index <- mis.index + 1
          missing.index[mis.index] <- pos.index
          missing.daytime[mis.index] <- format(pos.daytime, "%Y%m%d%H")
        }

        # increment position and daytime
        pos.index <- pos.index + 1
        pos.daytime <- pos.daytime + hour.step * 3600
      }

      #print (paste0('Total number of values:', as.character(length(obs.prop)), ', Total valid indexes;', as.character(length(valid.index))))

      if (!is.null(missing.index))
      {
        # check if the number of missing values are more than 20%
        missing.perc <- round (length(missing.index) / expected.obs, digits = 2)
        if (missing.perc > 0.20)
        {
          print (paste0('Station no.:', as.character(station.obs[1, "Station"]),
                        ' not enough values to interpolate property ', property,
                        ' for date ', format(current.date, "%Y%m%d")))

          return (NULL)
        }
      }

      if (!is.null(missing.index))
      {
        print (paste0('Missing values:', length(missing.index), ', Expected values:', expected.obs))
        cd.loess <- loess(obs.prop ~ valid.index, span = 0.9, degree = 2, control = loess.control(surface = "direct"))
        cd.predict <- predict(cd.loess, newdata = missing.index)

        # create the missing values data frame
        missing.values <- as.data.frame(matrix(ncol=3, nrow = length(missing.index)))
        colnames(missing.values) <- c("Index", "DayTime", "Value")
        for (m in 1:length(missing.index))
        {
          missing.values[m, ] <- c(missing.index[m], missing.daytime[m], round(cd.predict[m], digits = digits))
        }
      }
      print (paste0('Interpolation done for station ', station.obs[1, "Station"], ', Property:', property))
    }

    return (missing.values)
  }
  ,error = function (err)
  {
    print (paste0('WeakChecks.Column.Interpolation.ByInterval[Station:', station.obs[1, "Station"], 'Property:', property, '] - Error : ', err))
    return (missing.values)
  }
  , warning = function (warn)
  {
    print (paste0('WeakChecks.Column.Interpolation.ByInterval[Station:', station.obs[1, "Station"], 'Property:', property, '] - Warning : ', warn))
    return (missing.values)
  }
  )

  return (result)
}


#*********************************************************
# Make the temporal interpolation for a specific property relative
# to 24 H of current date
#
# Parameters :
#  - station.obs   [INPUT] [DATA.FRAME]	  - station observation
#  - current.date  [INPUT] [DATETIME]	    - elaboration date
#  - property      [INPUT] [STRING]       - name of column to interpolate
#  [RETURN] [DATA.FRAME]  - The entire data frame of observations
#*********************************************************
WeakChecks.Property.Interpolation <- function(data.list, current.date, propertyName)
{
  result <- tryCatch( {
    tt.int <- subset(df.int, df.int$Property == propertyName)
    if (nrow(tt.int) > 0)
    {
      current.obs <- data.list[[1]]
      prop.flags  <- data.list[[3]]

      start.int <- current.date + as.integer(as.character(tt.int[1, "StartTime"])) * 3600 +
        as.integer(as.character(tt.int[1, "StartDay"])) * 24 * 3600
      end.int   <- current.date + as.integer(as.character(tt.int[1, "EndTime"])) * 3600 +
        as.integer(as.character(tt.int[1, "EndDay"])) * 24 * 3600
      allowNegativeValues <- as.character(tt.int[1, "AllowNegativeValues"]) == "YES"

      # decide the number of expected values
      obs.number.inter <- as.numeric(difftime(end.int, start.int, units = "hours")) + 1
      if (!WeakChecks.CheckHourlyObservations(current.obs[, "DayTime"])) { obs.number.inter <- as.integer( obs.number.inter / 3) }

      if (obs.number.inter > 0) {
        # extract data
        obs.to.inter <- subset(current.obs,
                               strptime(current.obs$DayTime, "%Y%m%d%H") >= start.int &
                               strptime(current.obs$DayTime, "%Y%m%d%H") <= end.int)

        # interpolate data
        missing.values <- WeakChecks.Column.Interpolation.ByInterval(obs.to.inter, current.date,
                                                                     propertyName,
                                                                     as.integer(as.character(tt.int[1, "Decimals"])),
                                                                     start.int, end.int,
                                                                     obs.number.inter)

        if (!is.null(missing.values))
        {
          for (m in 1:nrow(missing.values))
          {
            # check if the DayTime is present into the observations
            nrows <- nrow(subset(current.obs, strptime(current.obs$DayTime, "%Y%m%d%H") == strptime(missing.values[m, "DayTime"], "%Y%m%d%H")))
            if (nrows >= 1 & !is.na(missing.values[m, "Value"]))
            {
              numeric.value <- as.numeric(missing.values[m, "Value"])

              # reduce the value for N(total cloud) & L(low cloud) to 8 if great than 8
              if ( (propertyName == "N" | propertyName == "L") & numeric.value > 8) numeric.value <- 8

              # reduce the value for RH/D_RH to 100 if great than 100
              if ( (propertyName == "RH" | propertyName == "D_RH") & numeric.value > 100) numeric.value <- 100

              # reset value to 0 if non negative aren't allowed
              if (allowNegativeValues == FALSE & numeric.value < 0)  numeric.value <- 0

              # save new value to observations data.frame
              current.obs[ strptime(current.obs$DayTime, "%Y%m%d%H") == strptime(missing.values[m, "DayTime"], "%Y%m%d%H"), propertyName] <- numeric.value
              prop.flags <- WeakChecks.ManageFlag(prop.flags, current.obs[1, "Station"], missing.values[m , "DayTime"], propertyName, "I")
            }
          }
        }
      }

      data.list[[1]] <- current.obs
      data.list[[3]] <- prop.flags
    }

    return (data.list)
  }
  ,error = function (err)
  {
    print (paste0('WeakChecks.Property.Interpolation[Station:', data.list[[1]][1, "Station"], 'Property:', propertyName, '] - Error : ', err))
    return (data.list)
  }
  , warning = function (warn)
  {
    print (paste0('WeakChecks.Property.Interpolation[Station:', data.list[[1]][1, "Station"], 'Property:', propertyName, '] - Warning : ', warn))
    return (data.list)
  }
  )

  return (result)
}

#*********************************************************
# Generate the consecutive errors for AIR Temperature
# Parameters :
#  - indexes
#  - list of data
# RETURN :
#  [LIST] - list with 3 data.frame : new errors, properties status, properties flags
#*********************************************************
WeakChecks.Generate.TT.ConsecutiveErrors <-function(indexes, data)
{
  station.data <- data[[1]]
  old.errors   <- data[[2]]
  new.errors   <- data[[3]]
  prop.status  <- data[[4]]
  prop.flags   <- data[[5]]
  station.code <- station.data[1, "Station"]

  print (indexes)

  # need to raise all alerts and update the flags for TT parameter for all values involved
  for(x in 1:length(indexes))
  {
    obs.idx      = indexes[x]
    tt.value     = station.data[obs.idx, "TT"]
    tt.nextvalue = station.data[obs.idx+1, "TT"]
    tt.daytime   = station.data[obs.idx, "DayTime"]
    paramsErr    = c("0.1",
                     tt.value,
                     format(strptime(station.data[obs.idx, "DayTime"],"%Y%m%d%H"),format = '%T'),
                     tt.nextvalue,
                     format(strptime(station.data[obs.idx+1, "DayTime"],"%Y%m%d%H"),format = '%T'))
    error.data <- WeakChecks.GetError("002", "TT", tt.daytime, old.errors, paramsErr)
    if (!is.null(error.data) & length(error.data) > 0)
    {
      prop.status[obs.idx, "TT"] <- ifelse (prop.status[obs.idx, "TT"] == "C" | prop.status[obs.idx, "TT"] == "S", error.data[[1]], prop.status[obs.idx, "TT"])
      new.errors[ nrow(new.errors) + 1, ] <- c(station.code, tt.daytime, "TT", tt.value, "002", error.data[[1]], error.data[[2]])
      prop.flags <- WeakChecks.ManageFlag(prop.flags, station.code, tt.daytime, "TT", error.data[[1]])
    }
  }

  # add the error for the last index of observations
  obs.idx      = indexes[length(indexes)] + 1
  tt.prevvalue = station.data[obs.idx-1, "TT"]
  tt.value     = station.data[obs.idx, "TT"]
  tt.daytime   = station.data[obs.idx, "DayTime"]
  paramsErr    = c("0.1",
                   tt.prevvalue,
                   format(strptime(station.data[obs.idx-1, "DayTime"],"%Y%m%d%H"),format = '%T'),
                   tt.value,
                   format(strptime(tt.daytime,"%Y%m%d%H"),format = '%T'))

  error.data <- WeakChecks.GetError("002", "TT", tt.daytime, old.errors, paramsErr)
  if (!is.null(error.data) & length(error.data) > 0)
  {
    prop.status[obs.idx, "TT"] <- ifelse (prop.status[obs.idx, "TT"] == "C" | prop.status[obs.idx, "TT"] == "S", error.data[[1]], prop.status[obs.idx, "TT"])
    new.errors[ nrow(new.errors) + 1, ] <- c(station.code, tt.daytime, "TT", tt.value, "002", error.data[[1]], error.data[[2]])
    prop.flags <- WeakChecks.ManageFlag(prop.flags, station.code, tt.daytime, "TT", error.data[[1]])
  }

  return (list(new.errors, prop.status, prop.flags))
}

#*********************************************************
# Generate the consecutive errors for DEW Point Temperature
# Parameters :
#  - indexes
#  - list of data
# RETURN :
#  [LIST] - list with 3 data.frame : new errors, properties status, properties flags
#*********************************************************
WeakChecks.Generate.TD.ConsecutiveErrors <-function(indexes, data)
{
  station.data <- data[[1]]
  old.errors   <- data[[2]]
  new.errors   <- data[[3]]
  prop.status  <- data[[4]]
  prop.flags   <- data[[5]]
  station.code <- station.data[1, "Station"]

  # need to raise all alerts and update the flags for TD parameter for all values involved
  for(x in 1:length(indexes))
  {
    obs.idx      = indexes[x]
    td.value     = station.data[obs.idx, "TD"]
    td.nextvalue = station.data[obs.idx+1, "TD"]
    td.daytime   = station.data[obs.idx, "DayTime"]
    paramsErr    = c("0.1",
                     td.value,
                     format(strptime(station.data[obs.idx, "DayTime"],"%Y%m%d%H"),format = '%T'),
                     td.nextvalue,
                     format(strptime(station.data[obs.idx+1, "DayTime"],"%Y%m%d%H"),format = '%T'))
    error.data <- WeakChecks.GetError("003", "TD", td.daytime, old.errors, paramsErr)
    if (!is.null(error.data) & length(error.data) > 0)
    {
      prop.status[obs.idx, "TD"] <- ifelse (prop.status[obs.idx, "TD"] == "C" | prop.status[obs.idx, "TD"] == "S", error.data[[1]], prop.status[obs.idx, "TD"])
      new.errors[ nrow(new.errors) + 1, ] <- c(station.code, td.daytime, "TD", td.value, "003", error.data[[1]], error.data[[2]])
      prop.flags <- WeakChecks.ManageFlag(prop.flags, station.code, td.daytime, "TD", error.data[[1]])
    }
  }

  # add the error for the last index of observations
  obs.idx      = indexes[length(indexes)] + 1
  td.prevvalue = station.data[obs.idx-1, "TD"]
  td.value     = station.data[obs.idx, "TD"]
  td.daytime   = station.data[obs.idx, "DayTime"]
  paramsErr    = c("0.1",
                   td.prevvalue,
                   format(strptime(station.data[obs.idx-1, "DayTime"],"%Y%m%d%H"),format = '%T'),
                   td.value,
                   format(strptime(td.daytime,"%Y%m%d%H"),format = '%T'))
  error.data <- WeakChecks.GetError("003", "TD", td.daytime, old.errors, paramsErr)
  if (!is.null(error.data) & length(error.data) > 0)
  {
    prop.status[obs.idx, "TD"] <- ifelse (prop.status[obs.idx, "TD"] == "C" | prop.status[obs.idx, "TD"] == "S", error.data[[1]], prop.status[obs.idx, "TD"])
    new.errors[ nrow(new.errors) + 1, ] <- c(station.code, td.daytime, "TD", td.value, "003", error.data[[1]], error.data[[2]])
    prop.flags <- WeakChecks.ManageFlag(prop.flags, station.code, td.daytime, "TD", error.data[[1]])
  }

  return (list(new.errors, prop.status, prop.flags))
}
