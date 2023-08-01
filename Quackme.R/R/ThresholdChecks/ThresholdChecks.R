#*********************************************************
#           Implements all checks for daily values
#*********************************************************

#*********************************************************
# Make the threshold checks for daily values
# The checks will be done for a single station
# Parameters :
#  - station.data   [INPUT] [LIST]	- list data contains 3 data.frame (station data, new errors, flags)
#  - station.number [INPUT] [INT]	  - station number
#  - current.date   [INPUT] [TIME]  - day to analyze
# RETURN :
#                   [LIST]          - list data containing 3 data.frame [station data, new errors, flags]
#*********************************************************
Station.DailyChecks <- function (data.list, station.number, current.date)
{
  station.data  <- data.list[[1]]
  new.errors    <- data.list[[2]]

  result <- tryCatch(
    {
      #Pierluca De Palma 27.09.2019
      #Default Error Parameters
      paramsErr  = c("")

      # get observation of current day
      row <- subset(station.data, strptime(DayTime, "%Y%m%d") == current.date)[1, ]

      # get threshold data
      jday <- format(current.date, "%j")
      th.row.index <- which(th.daily.df$Station == as.numeric(station.number) &
                            as.numeric(th.daily.df$Day) == as.numeric(jday))
      if (length(th.row.index) == 0)
      {
        print ( paste0('No daily threshold for station ', station.number, ' and date ', jday))
        return (data.list)
      }

      # retrieve the row of threshold for current station and date in elaboration
      th.row <- th.daily.df[th.row.index[1], ]

      # maximum and minim temperatures
      iTN <- if(!is.na(row$TN)) suppressWarnings(as.numeric(as.character(row$TN))) else NA
      iTX <- if(!is.na(row$TX)) suppressWarnings(as.numeric(as.character(row$TX))) else NA

      # calculate daily mean temperature
      iTMean <- NA
      if (!is.na(iTN) & !is.na(iTX))
      {
        iTMean <- (iTN + iTX)/2
      }

      # daily mean temperature checks
      if (!is.na(iTMean))
      {
        MT99 <- as.numeric(as.character(th.row$MT99))
        if (!is.na(MT99) & iTMean > (MT99 + 2.0))
        {
          #Pierluca De Palma 27.09.2019
          paramsErr  = c(iTMean, MT99)
          error.data <- ThresholdChecks.Daily.GetError(station.data, "TX", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TX"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TX", iTX, "001", "Daily", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- ThresholdChecks.ManageFlags(station.flags, station.number, current.date, "TX", error.data[[1]])
          }
        }

        MT1 <- as.numeric(as.character(th.row$MT1))
        if (!is.na(MT1) & iTMean < (MT1 - 2.0))
        {
          #Pierluca De Palma 27.09.2019
          paramsErr  = c(iTMean, th.row$MT1)
          error.data <- ThresholdChecks.Daily.GetError(station.data, "TX", "003", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TX"] <- ifelse (prop.status[1, "TX"] != "W", error.data[[1]], prop.status[1, "TX"])
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TX", iTX, "003", "Daily", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- ThresholdChecks.ManageFlags(station.flags, station.number, current.date, "TX", error.data[[1]])
          }
        }
      }

      # daily minimum temperature checks
      if (!is.na(iTN))
      {
        MTN99 <- as.numeric(as.character(th.row$MTN99))
        MTN1  <- as.numeric(as.character(th.row$MTN1))

        if (!is.na(MTN99) & iTN > (MTN99 + 2.0))
        {
          paramsErr  = c(iTN, MTN99)
          error.data <- ThresholdChecks.Daily.GetError(station.data, "TN", "002", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TN"] <- ifelse (prop.status[1, "TN"] != "W", error.data[[1]], prop.status[1, "TN"])
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TN", iTN, "002", "Daily", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- ThresholdChecks.ManageFlags(station.flags, station.number, current.date, "TN", error.data[[1]])
          }
        }

        if (!is.na(MTN1) & iTN < (MTN1 - 2.0))
        {
          paramsErr  = c(iTN, MTN1)
          error.data <- ThresholdChecks.Daily.GetError(station.data, "TN", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TN"] <- ifelse (prop.status[1, "TN"] != "W", error.data[[1]], prop.status[1, "TN"])
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TN", iTN, "001", "Daily", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- ThresholdChecks.ManageFlags(station.flags, station.number, current.date, "TN", error.data[[1]])
          }
        }
      }

      # daily maximum temperature checks
      if (!is.na(iTX))
      {
        MTX99 <- as.numeric(as.character(th.row$MTX99))
        MTX1 <- as.numeric(as.character(th.row$MTX1))

        if (!is.na(MTX99) & iTX > (MTX99 + 2.0))
        {
          paramsErr  = c(iTX, MTX99)
          error.data <- ThresholdChecks.Daily.GetError(station.data, "TX", "002", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TX"] <- ifelse (prop.status[1, "TX"] != "W", error.data[[1]], prop.status[1, "TX"])
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TX", iTX, "002", "Daily", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- ThresholdChecks.ManageFlags(station.flags, station.number, current.date, "TX", error.data[[1]])
          }
        }

        if (!is.na(MTX1) & iTX < (MTX1 - 2.0))
        {
          paramsErr  = c(iTX, MTX1)
          error.data <- ThresholdChecks.Daily.GetError(station.data, "TX", "004", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TX"] <- ifelse (prop.status[1, "TX"] != "W", error.data[[1]], prop.status[1, "TX"])
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TX", iTX, "004", "Daily", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- ThresholdChecks.ManageFlags(station.flags, station.number, current.date, "TX", error.data[[1]])
          }
        }
      }

      # return the observation like XML format
      return (list(station.data, new.errors)) #, station.flags, prop.status))
    }
    ,error = function (err)
    {
      print (paste0('Station.DailyChecks[Station:', station.number, ', Date:', current.date, '] - Error : ', err))
      return (data.list)
    }
    ,warning = function (warn)
    {
      print (paste0('Station.DailyChecks[Station:', station.number, ', Date:', current.date, '] - Warning: ', warn))
      return (data.list)
    }
    )

  return (result)
}

#*********************************************************
# Make the threshold checks for seasons values
# The checks will be done for a single station
# Parameters :
#  - data.list      [INPUT] [LIST]	- list data contains 3 data.frame (station data, new errors, flags)
#  - station.number [INPUT] [INT]	  - station number
#  - current.date   [INPUT] [TIME]  - day to analyze
# RETURN :
#                   [LIST]          - list data containing 3 data.frame [station data, new errors, flags]
#*********************************************************
Station.SeasonsChecks <- function (data.list, station.number, current.date)
{
  station.data <- data.list[[1]]
  new.errors   <- data.list[[2]]

  result <- tryCatch(
    {
      #Pierluca De Palma 27.09.2019
      #Default Error Parameters
      paramsErr  = c("")

      # get observation of current day and previous day
      row.cd <- subset(station.data, strptime(DayTime, "%Y%m%d") == current.date)[1, ]

      previous.date <- current.date - 24 * 3600
      row.pd <- NA
      if (!is.null(input.hist))
      {
        row.pd <- subset(input.hist, strptime(DayTime, "%Y%m%d") == previous.date & Station == row.cd$Station)[1, ]
      }

      # get the season and threshold data
      season <- Get.Season(current.date)
      th.row.index <- which(th.seasons.df$Station == as.numeric(station.number) & th.seasons.df$Season == season)
      if (length(th.row.index) == 0)
      {
        print ( paste0('No season threshold for station: ', station.number, ', season ', season))
        return (data.list)
      }

      th.row <- th.seasons.df[th.row.index[1], ]

      # minimum and maximum temperatures
      iTN.cd <- if(!is.na(row.cd$TN)) suppressWarnings(as.numeric(as.character(row.cd$TN))) else NA
      iTX.cd <- if(!is.na(row.cd$TX)) suppressWarnings(as.numeric(as.character(row.cd$TX))) else NA

      iTX.pd <- NA
      iTN.pd <- NA
      if ( !is.na(row.pd) && length(row.pd) > 0)
      {
        iTX.pd <- if(!is.na(row.pd$TX)) suppressWarnings(as.numeric(as.character(row.pd$TX))) else NA
        iTN.pd <- if(!is.na(row.pd$TN)) suppressWarnings(as.numeric(as.character(row.pd$TN))) else NA
      }

      # calculate difference of daily mean temperatures
      dMT <- NA
      if (!is.na(iTN.cd) & !is.na(iTX.cd) & !is.na(iTN.pd) & !is.na(iTX.pd))
      {
        dMT <- round(abs((iTN.cd + iTX.cd)/2 - (iTN.pd + iTX.pd)/2), digits = 2)
      }

      # daily mean temperature checks
      if (!is.na(dMT))
      {
        if (!is.na(th.row$MT95) & dMT > (th.row$MT95 + 2.0))
        {
          #Pierluca De Palma 27.09.2019
          paramsErr  = c(dMT, th.row$MT95, season)
          error.data <- ThresholdChecks.Seasons.GetError(station.data, "TX", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TX"] <- ifelse( prop.status[1, "TX"] != "W", error.data[[1]], prop.status[1, "TX"])
            new.errors[ nrow(new.errors) + 1, ] <- c(row.cd$Station, row.cd$DayTime, "TX", iTX.cd, "001", "Season", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- ThresholdChecks.ManageFlags(station.flags, station.number, current.date, "TX", error.data[[1]])
          }
        }
        else if (!is.na(th.row$MT5) & dMT < (th.row$MT5 - 2.0))
        {
          #Pierluca De Palma 27.09.2019
          paramsErr  = c(dMT, th.row$MT5, season)
          error.data <- ThresholdChecks.Seasons.GetError(station.data, "TX", "002", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TX"] <- ifelse( prop.status[1, "TX"] != "W", error.data[[1]], prop.status[1, "TX"])
            new.errors[ nrow(new.errors) + 1, ] <- c(row.cd$Station, row.cd$DayTime, "TX", iTX.cd, "002", "Season", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- ThresholdChecks.ManageFlags(station.flags, station.number, current.date, "TX", error.data[[1]])
          }
        }
      }

      # daily minium temperature difference
      dTN <- NA
      if (!is.na(iTN.cd) & !is.na(iTN.pd))
      {
        dTN <- round(abs ( iTN.cd - iTN.pd), digits = 2)
        if (!is.na(th.row$MTN95) & dTN > (th.row$MTN95 + 2.0))
        {
          #Pierluca De Palma 27.09.2019
          paramsErr  = c(dTN, th.row$MTN95, season)
          error.data <- ThresholdChecks.Seasons.GetError(station.data, "TN", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TN"] <- ifelse( prop.status[1, "TN"] != "W", error.data[[1]], prop.status[1, "TN"])
            new.errors[ nrow(new.errors) + 1, ] <- c(row.cd$Station, row.cd$DayTime, "TN", iTN.cd, "001", "Season", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- ThresholdChecks.ManageFlags(station.flags, station.number, current.date, "TN", error.data[[1]])
          }
        }
        else if (!is.na(th.row$MTN5) & dTN < (th.row$MTN5 - 2.0))
        {
          #Pierluca De Palma 27.09.2019
          paramsErr  = c(dTN, th.row$MTN5, season)
          error.data <- ThresholdChecks.Seasons.GetError(station.data, "TN", "002", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TN"] <- ifelse( prop.status[1, "TN"] != "W", error.data[[1]], prop.status[1, "TN"])
            new.errors[ nrow(new.errors) + 1, ] <- c(row.cd$Station, row.cd$DayTime, "TN", iTN.cd, "002", "Season", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- ThresholdChecks.ManageFlags(station.flags, station.number, current.date, "TN", error.data[[1]])
          }
        }
      }

      # daily maximum temperature difference
      dTX <- NA
      if (!is.na(iTX.cd) & !is.na(iTX.pd))
      {
        dTX <- round(abs(iTX.cd - iTX.pd), digits =2)
        if (!is.na(th.row$MTX95) & dTX > (th.row$MTX95 + 2.0))
        {
          #Pierluca De Palma 27.09.2019
          paramsErr  = c(dTX, th.row$MTX95, season)
          error.data <- ThresholdChecks.Seasons.GetError(station.data, "TX", "003", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TX"] <- ifelse( prop.status[1, "TX"] != "W", error.data[[1]], prop.status[1, "TX"])
            new.errors[ nrow(new.errors) + 1, ] <- c(row.cd$Station, row.cd$DayTime, "TX", iTX.cd, "003", "Season", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- ThresholdChecks.ManageFlags(station.flags, station.number, current.date, "TX", error.data[[1]])
          }
        }
        else if (!is.na(th.row$MTX5) & dTX < (th.row$MTX5 - 2.0))
        {
          #Pierluca De Palma 27.09.2019
          paramsErr  = c(dTX, th.row$MTX5, season)
          error.data <- ThresholdChecks.Seasons.GetError(station.data, "TX", "004", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TX"] <- ifelse( prop.status[1, "TX"] != "W", error.data[[1]], prop.status[1, "TX"])
            new.errors[ nrow(new.errors) + 1, ] <- c(row.cd$Station, row.cd$DayTime, "TX", iTX.cd, "004", "Season", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- ThresholdChecks.ManageFlags(station.flags, station.number, current.date, "TX", error.data[[1]])
          }
        }
      }

      # precipitation checks
      iRRR <- if(!is.na(row.cd$RRR)) suppressWarnings(as.numeric(as.character(row.cd$RRR))) else NA
      if (!is.na(iRRR))
      {
        iRRR <- round (iRRR, digits = 2)
        if (!is.na(th.row$RRR5Y) & iRRR > th.row$RRR5Y)
        {
          #Pierluca De Palma 27.09.2019
          paramsErr  = c(iRRR, th.row$RRR5Y, season)
          error.data <- ThresholdChecks.Seasons.GetError(station.data, "RRR", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "RRR"] <- ifelse( prop.status[1, "RRR"] != "W", error.data[[1]], prop.status[1, "RRR"])
            new.errors[ nrow(new.errors) + 1, ] <- c(row.cd$Station, row.cd$DayTime, "RRR", iRRR, "001", "Season", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- ThresholdChecks.ManageFlags(station.flags, station.number, current.date, "RRR", error.data[[1]])
          }
        }
      }

      # wind speed checks
      iFF <- if(!is.na(row.cd$FF)) suppressWarnings(as.numeric(as.character(row.cd$FF))) else NA
      if (!is.na(iFF))
      {
        iFF <- round(iFF, digits = 2)
        if (!is.na(th.row$FF5Y) & iFF > th.row$FF5Y)
        {
          #Pierluca De Palma 27.09.2019
          paramsErr  = c(iFF, th.row$FF5Y, season)
          error.data <- ThresholdChecks.Seasons.GetError(station.data, "FF", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "FF"] <- ifelse( prop.status[1, "FF"] != "W", error.data[[1]], prop.status[1, "FF"])
            new.errors[ nrow(new.errors) + 1, ] <- c(row.cd$Station, row.cd$DayTime, "FF", iFF, "001", "Season", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- ThresholdChecks.ManageFlags(station.flags, station.number, current.date, "FF", error.data[[1]])
          }
        }
      }

      # return the observation like XML format
      return (list(station.data, new.errors)) #, station.flags, prop.status))
    }
    ,error = function (err)
    {
      print (paste0('Station.SeasonsChecks[Station:', station.number, ', Date:', current.date, '] - Error : ', err))
      return (data.list)
    }
    ,warning = function (warn)
    {
      print (paste0('Station.SeasonsChecks[Station:', station.number, ', Date:', current.date, '] - Warning: ', warn))
      return (data.list)
    }
  )

  return (result)
}

#*********************************************************
# Make the threshold checks for 5 best stations values
# The checks will be done for a single station
# Parameters :
#  - station.data   [INPUT] [DATA.FRAME]	- station data
#  - station.xml    [INPUT] [XML]	        - station xml
#  - error.xml      [INPUT] [XML]	        - station error xml
#  - station.number [INPUT] [INT]	        - station number
#  - current.date   [INPUT] [INT]	        - day to analyze (like int in the format YYYYMMDD)
#*********************************************************
Station.5BestChecks <- function (station.data, station.xml, error.xml, station.number, current.date)
{
  result <- tryCatch(
    {

      # get observation of current day
      row.cd <- subset(station.data, strptime(DayTime, "%Y%m%d") == current.date)[1, ]

      # get the 5best thresold data
      if (is.na(th.5best.df)) return (station.xml)

      th.row.index <- which(th.5best.df$Station == as.numeric(station.number))
      if (length(th.row.index) == 0)
      {
        print ( paste0('No 5best threshold for station ', station.number))
        return (station.xml)
      }

      th.row <- th.5best.df[th.row.index, ]

      # minimum and maximum temperatures
      iTN.cd <- if(!is.na(row.cd$TN)) suppressWarnings(as.numeric(as.character(row.cd$TN))) else NA
      iTX.cd <- if(!is.na(row.cd$TX)) suppressWarnings(as.numeric(as.character(row.cd$TX))) else NA

      # calculate difference of daily mean temperatures
      dMT <- NA
      if (!is.na(iTN.cd) & !is.na(iTX.cd))
      {
        dMT <- (iTN.cd + iTX.cd)/2
      }

      # prediction mean temperature
      iPred <- NA

      # TODO  - calculate predicted value

      # daily mean temperature checks
      if (!is.na(dMT) & !is.na(iPred))
      {
        if (dmT > iPred)
        {
          # create the alert node and modify the status of node for current property
          station.xml <- ErrorNode.ThresholdChecks.Seasons(station.data, station.xml, error.xml, "TX", "006")
          station.xml <- ErrorNode.ThresholdChecks.Seasons(station.data, station.xml, error.xml, "TN", "003")
        }
      }

      # return the observation like XML format
      return (station.xml)
    }
    ,error = function (err)
    {
      print (paste0('Station.5BestChecks - Error : ', err))
      return (station.xml)
    }
    ,warning = function (warn)
    {
      print (paste0('Station.5BestChecks - Warning: ', warn))
      return (station.xml)
    }
  )

  return (result)
}

