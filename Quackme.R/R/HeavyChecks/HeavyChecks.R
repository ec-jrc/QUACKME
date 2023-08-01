#*********************************************************
#           Implements all checks for daily values
#*********************************************************
library (XML)
library (suncalc)

#*********************************************************
# The checks will be done for a single station
# Parameters :
#  - station.data   [INPUT] [LIST]	- list data contains 3 data.frame (station data, new errors, flags)
#  - station.number [INPUT] [INT]	        - station number
#  - current.date   [INPUT] [INT]	        - day to analyze (like int in the format YYYYMMDD)
# RETURN :
#                   [LIST]          - list data containing 3 data.frame [station data, new errors, flags]
#*********************************************************
Station.HeavyChecks <- function (data.list, station.number, current.date)
{
  station.data  <- data.list[[1]]
  new.errors    <- data.list[[2]]
  #station.flags <- data.list[[3]]
  station.coord <- subset(stations.df, stations.df$StationNumber == station.data[1, "Station"])

  result <- tryCatch(
    {
      # initialize the properties status data.frame
      #prop.status <- as.data.frame(matrix(nrow = 1, ncol = length(agg.columns)), stringsAsFactors = FALSE)
      #colnames(prop.status) <- agg.columns
      #prop.status[1, ] <- "C"

      #Pierluca De Palma 27.09.2019
      #Default Error Parameters
      paramsErr  = c("")

      row <- station.data[1, ]

      # total clouds
      iN <- as.numeric(row$N)
      if (!is.na(iN))
      {
        if (iN < 0 | iN > 8)
        {
          exception.valid.n <- Check.HeavyChecks.Exceptions(exceptions.config, list("N", "001", station.data, station.coord))
          print (exception.valid.n)

          if (!exception.valid.n)
          {
            #Pierluca De Palma 17.09.2019
            paramsErr  = c("0", "8", iN)
            error.data <- HeavyChecks.GetError(station.data, "N", "001", paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              #prop.status[1, "N"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "N", iN, "001", error.data[[1]], error.data[[2]], error.data[[3]])
              #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "N", error.data[[1]])
            }
          } else {
            print (paste0("Exception rule remove error N-001 for station ", station.number, "\n"))
          }
        }
      }

      # daytime mean of total cloud cover
      iNDT <-  as.numeric(row$NDT)
      if (!is.na(iNDT))
      {
        if (iNDT < 0 | iNDT > 8)
        {
          exception.valid.ndt <- Check.HeavyChecks.Exceptions(exceptions.config, list("NDT", "001", station.data, station.coord))

          if (!exception.valid.ndt)
          {
            #Pierluca De Palma 27.09.2019
            paramsErr  = c("0", "8", iNDT)
            error.data <- HeavyChecks.GetError(station.data, "NDT", "001", paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              #prop.status[1, "NDT"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "NDT", iNDT, "001", error.data[[1]], error.data[[2]], error.data[[3]])
              #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "NDT", error.data[[1]])
            }
          }
          else {
            print (paste0("Exception rule remove error NDT-001 for station ", station.number, "\n"))
          }
        }
      }

      # maximum and minim temperatures
      iTN <- as.numeric(row$TN)
      iTX <- as.numeric(row$TX)
      if (!is.na(iTN) & (iTN < -35 | iTN > 35))
      {
        exception.valid.tn <- Check.HeavyChecks.Exceptions(exceptions.config, list("TN", "001", station.data, station.coord))
        if (!exception.valid.tn)
        {
          #Pierluca De Palma 27.09.2019
          paramsErr  = c("-35", "35", iTN)
          error.data <- HeavyChecks.GetError(station.data, "TN", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TN"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TN", iTN, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "TN", error.data[[1]])
          }
        }
        else {
          print (paste0("Exception rule remove error TN-001 for station ", station.number, "\n"))
        }
      }

      if (!is.na(iTX) & (iTX < -20 | iTX > 50))
      {
        exception.valid.tx <- Check.HeavyChecks.Exceptions(exceptions.config, list("TX", "001", station.data, station.coord))

        if (!exception.valid.tx)
        {
          #Pierluca De Palma 27.09.2019
          paramsErr  = c("-20", "50", iTX)
          error.data <- HeavyChecks.GetError(station.data, "TX", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TX"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TX", iTX, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "TX", error.data[[1]])
          }
        }
        else {
          print (paste0("Exception rule remove error TX-001 for station ", station.number, "\n"))
        }
      }

      if (!is.na(iTX) & !is.na(iTN))
      {
        dTT <- abs(iTX - iTN)
        if (dTT < 0 | dTT > 30)
        {
          exception.valid.tx2 <- Check.HeavyChecks.Exceptions(exceptions.config, list("TX", "002", station.data, station.coord))

          if (!exception.valid.tx2)
          {
            paramsErr  = c("0", "30", iTX, iTN)
            error.data <- HeavyChecks.GetError(station.data, "TX", "002", paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              #prop.status[1, "TX"] <- ifelse (prop.status[1, "TX"] != "W", error.data[[1]], prop.status[1, "TX"])
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TX", iTX, "002", error.data[[1]], error.data[[2]], error.data[[3]])
              #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "TX", error.data[[1]])
            }

            error.data <- HeavyChecks.GetError(station.data, "TN", "002", paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              #prop.status[1, "TN"] <- ifelse (prop.status[1, "TN"] != "W", error.data[[1]], prop.status[1, "TN"])
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TN", iTN, "002", error.data[[1]], error.data[[2]], error.data[[3]])
              #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "TN", error.data[[1]])
            }

          }
          else {
            print (paste0("Exception rule remove error TX-002 for station ", station.number, "\n"))
          }
        }

        if (iTN > iTX)
        {
          exception.valid.tntx <- Check.HeavyChecks.Exceptions(exceptions.config, list("TX", "003", station.data, station.coord))
          exception.valid.txtn <- Check.HeavyChecks.Exceptions(exceptions.config, list("TN", "003", station.data, station.coord))

          if (!exception.valid.tntx & !exception.valid.txtn)
          {
            paramsErr  = c(iTN, iTX)
            error.data <- HeavyChecks.GetError(station.data, "TX", "003", paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              #prop.status[1, "TX"] <- ifelse (prop.status[1, "TX"] != "W", error.data[[1]], prop.status[1, "TX"])
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TX", iTX, "003", error.data[[1]], error.data[[2]], error.data[[3]])
              #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "TX", error.data[[1]])
            }

            error.data <- HeavyChecks.GetError(station.data, "TN", "003", paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              #prop.status[1, "TN"] <- ifelse (prop.status[1, "TN"] != "W", error.data[[1]], prop.status[1, "TN"])
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TN", iTN, "003", error.data[[1]], error.data[[2]], error.data[[3]])
              #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "TN", error.data[[1]])
            }

          }
          else {
            print (paste0("Exception rule remove error TX-003 & TN-003 for station ", station.number, "\n"))
          }
        }
      }

      # Measuread Sunshine
      iMSUN <- as.numeric(row$MSUN)
      if (!is.na(iMSUN) & (iMSUN < 0 | iMSUN > 24))
      {
        exception.valid.msun <- Check.HeavyChecks.Exceptions(exceptions.config, list("MSUN", "001", station.data, station.coord))

        if (!exception.valid.msun)
        {
          paramsErr  = c("0", "24", iMSUN)
          error.data <- HeavyChecks.GetError(station.data, "MSUN", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "MSUN"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "MSUN", iMSUN, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "MSUN", error.data[[1]])
          }
        }
        else {
          print (paste0("Exception rule remove error MSUN-001 for station ", station.number, "\n"))
        }
      }

      #***************************
      # Pierluca De Palma - 09.09.2019 - Changes:
      # code commented and added a new check see: https://trello.com/c/iukmrsSM
      #***************************

      # Measuread Sunlight times
      sunlight <- getSunlightTimes(as.Date (current.date),
                                   lat = as.double(as.character(station.coord[1, "Latitude"])),
                                   lon = as.double(as.character(station.coord[1, "Longitude"])),
                                   tz="CET",
                                   keep = c("sunrise", "sunset"))

      iMSLTM <- ifelse (!is.na(row$MSUN) & !is.na(sunlight["sunset"]) & !is.na(sunlight["sunrise"]),
                        suppressWarnings (sunlight["sunset"] - sunlight["sunrise"]),
                        NA)
      #(getSunlightTimes(date = Sys.Date(), lat = as.numeric(row$LAT), lon = as.numeric(row$LON), tz="CET", keep = c("sunrise", "sunset"))["sunset"]-
      #  getSunlightTimes(date = Sys.Date(), lat = as.numeric(row$LAT), lon = as.numeric(row$LON), tz="CET", keep = c("sunrise", "sunset"))["sunrise"])) else NA

      # Measured sunshine and cloud cover
      if (!is.na(iMSUN) & !is.na(iMSLTM) & iMSUN > (as.numeric(iMSLTM) * 0.5) & !is.na(iN) & iN == 8)
      {
        exception.valid.n3 <- Check.HeavyChecks.Exceptions(exceptions.config, list("N", "003", station.data, station.coord))

        if (!exception.valid.n3)
        {
          paramsErr  = c("8", "0.5", iN, iMSUN)
          error.data <- HeavyChecks.GetError(station.data, "N", "003", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "N"] <- ifelse (prop.status[1, "N"] != "W", error.data[[1]], prop.status[1, "N"])
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "N", iN, "003", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "N", error.data[[1]])
          }
        }
        else {
          print (paste0("Exception rule remove error N-003 for station ", station.number, "\n"))
        }
      }

      # Measured Radiation
      iMRAD <- as.numeric(row$MRAD)
      if (!is.na(iMRAD) & (iMRAD <= 0 | iMRAD > 36))
      {
        exception.valid.mrad <- Check.HeavyChecks.Exceptions(exceptions.config, list("MRAD", "001", station.data, station.coord))

        if (!exception.valid.mrad)
        {
          paramsErr  = c("0", "36", iMRAD)
          error.data <- HeavyChecks.GetError(station.data, "MRAD", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "MRAD"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "MRAD", iMRAD, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "MRAD", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error MRAD-001 for station ", station.number, "\n"))
        }
      }

      # Measured Sunshine & Measure Radiation
      # Verify the checks only if the measured sunshine is great than 1 HOUR. Assign the error to the radiation
      if (!is.na(iMSUN) & !is.na(iMRAD) & iMSUN > 1 & iMRAD <= 0)
      {
        exception.valid.msun2 <- Check.HeavyChecks.Exceptions(exceptions.config, list("MSUN", "002", station.data, station.coord))

        if (!exception.valid.msun2)
        {
          paramsErr  = c("1", "0", iMSUN, iMRAD)
          error.data <- HeavyChecks.GetError(station.data, "MSUN", "002", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "MSUN"] <- ifelse (prop.status[1, "MSUN"] != "W", error.data[[1]], prop.status[1, "MSUN"])
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "MSUN", iMSUN, "002", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "MSUN", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error MSUN-002 for station ", station.number, "\n"))
        }
      }

      # MVP - Daily mean vapour pressure
      iMVP <- as.numeric(row$MVP)
      if (!is.na (iMVP) & (iMVP < 0 | iMVP > 38))
      {
        exception.valid.mvp <- Check.HeavyChecks.Exceptions(exceptions.config, list("MVP", "001", station.data, station.coord))

        if (!exception.valid.mvp)
        {
          paramsErr  = c("0", "38", iMVP)
          error.data <- HeavyChecks.GetError(station.data, "MVP", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "MVP"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "MVP", iMVP, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "MVP", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error MVP-001 for station ", station.number, "\n"))
        }
      }

      # FF - Wind speed
      iFF <- as.numeric(row$FF)
      if (!is.na(iFF) & (iFF < 0 | iFF > 25))
      {
        exception.valid.ff <- Check.HeavyChecks.Exceptions(exceptions.config, list("FF", "001", station.data, station.coord))

        if (!exception.valid.ff)
        {
          paramsErr  = c("0", "25", iFF)
          error.data <- HeavyChecks.GetError(station.data, "FF", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "FF"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "FF", iFF, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "FF", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error FF-001 for station ", station.number, "\n"))
        }
      }

      # RRR - Precipitation
      # March 2023 / change the threshold from 1400 to 500 mm daily, and the error become a suspicious one, not wrong
      iRRR <- as.numeric(row$RRR)
      if (!is.na(iRRR) & (iRRR < 0 | iRRR >= 500))
      {
        exception.valid.rrr <- Check.HeavyChecks.Exceptions(exceptions.config, list("RRR", "001", station.data, station.coord))

        if (!exception.valid.rrr)
        {
          paramsErr  = c("0", "500", iRRR)
          error.data <- HeavyChecks.GetError(station.data, "RRR", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "RRR"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RRR", iRRR, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "RRR", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error RRR-001 for station ", station.number, "\n"))
        }
      }

      if (!is.na(iRRR) & iRRR >= 100 & iRRR < 500)
      {
        exception.valid.rrr <- Check.HeavyChecks.Exceptions(exceptions.config, list("RRR", "003", station.data, station.coord))

        if (!exception.valid.rrr)
        {
          paramsErr  = c("100", "500", iRRR)
          error.data <- HeavyChecks.GetError(station.data, "RRR", "003", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "RRR"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RRR", iRRR, "003", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "RRR", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error RRR-002 for station ", station.number, "\n"))
        }
      }

      # Precipitation & Cloud Cover
      if (!is.na(iRRR) & iRRR >0 & !is.na(iN) & iN == 0)
      {
        exception.valid.n2 <- Check.HeavyChecks.Exceptions(exceptions.config, list("N", "002", station.data, station.coord))

        if (!exception.valid.n2)
        {
          paramsErr  = c("0", "0", iRRR)
          error.data <- HeavyChecks.GetError(station.data, "N", "002", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "N"] <- ifelse (prop.status[1, "N"] != "W", error.data[[1]], prop.status[1, "N"])
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "N", iN, "002", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "N", error.data[[1]])
          }

          paramsErr  = c("0", "0", iRRR)
          error.data <- HeavyChecks.GetError(station.data, "RRR", "002", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "RRR"] <- ifelse (prop.status[1, "RRR"] != "W", error.data[[1]], prop.status[1, "RRR"])
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RRR", iRRR, "002", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "RRR", error.data[[1]])
          }

        } else {
          print (paste0("Exception rule remove error N-002, RRR-002 for station ", station.number, "\n"))
        }
      }

      ## AIR Temperature checks
      # TT06
      iTT06 <- as.numeric(row$TT06)
      if (!is.na(iTT06) & (iTT06 < -50 | iTT06 > 50))
      {
        exception.valid.tt06 <- Check.HeavyChecks.Exceptions(exceptions.config, list("TT06", "001", station.data, station.coord))

        if (!exception.valid.tt06)
        {
          paramsErr  = c("-50", "50", iTT06)
          error.data <- HeavyChecks.GetError(station.data, "TT06", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TT06"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TT06", iTT06, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "TT06", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error TT06-001 for station ", station.number, "\n"))
        }
      }

      # TT09
      iTT09 <- as.numeric(row$TT09)
      if (!is.na(iTT09) & (iTT09 < -50 | iTT09 > 50))
      {
        exception.valid.tt09 <- Check.HeavyChecks.Exceptions(exceptions.config, list("TT09", "001", station.data, station.coord))

        if (!exception.valid.tt09)
        {
          paramsErr  = c("-50", "50", iTT09)
          error.data <- HeavyChecks.GetError(station.data, "TT09", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TT09"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TT09", iTT09, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "TT09", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error TT09-001 for station ", station.number, "\n"))
        }
      }

      # TT12
      iTT12 <- as.numeric(row$TT12)
      if (!is.na(iTT12) & (iTT12 < -50 | iTT12 > 50))
      {
        exception.valid.tt12 <- Check.HeavyChecks.Exceptions(exceptions.config, list("TT12", "001", station.data, station.coord))

        if (!exception.valid.tt12)
        {
          paramsErr  = c("-50", "50", iTT12)
          error.data <- HeavyChecks.GetError(station.data, "TT12", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TT12"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TT12", iTT12, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "TT12", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error TT12-001 for station ", station.number, "\n"))
        }
      }

      # TT15
      iTT15 <- as.numeric(row$TT15)
      if (!is.na(iTT15) & (iTT15 < -50 | iTT15 > 50))
      {
        exception.valid.tt15 <- Check.HeavyChecks.Exceptions(exceptions.config, list("TT15", "001", station.data, station.coord))

        if (!exception.valid.tt15)
        {
          paramsErr  = c("-50", "50", iTT15)
          error.data <- HeavyChecks.GetError(station.data, "TT15", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TT15"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TT15", iTT15, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "TT15", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error TT15-001 for station ", station.number, "\n"))
        }
      }

      # TT18
      iTT18 <- as.numeric(row$TT18)
      if (!is.na(iTT18) & (iTT18 < -50 | iTT18 > 50))
      {
        exception.valid.tt18 <- Check.HeavyChecks.Exceptions(exceptions.config, list("TT18", "001", station.data, station.coord))

        if (!exception.valid.tt18)
        {
          paramsErr  = c("-50", "50", iTT18)
          error.data <- HeavyChecks.GetError(station.data, "TT18", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "TT18"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "TT18", iTT18, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "TT18", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error TT18-001 for station ", station.number, "\n"))
        }
      }

      ## RELATIVE HUmidity checks
      # RH06
      iRH06 <- as.numeric(row$RH06)
      if (!is.na (iRH06) & (iRH06 < 0 | iRH06 > 100))
      {
        exception.valid.rh06 <- Check.HeavyChecks.Exceptions(exceptions.config, list("RH06", "001", station.data, station.coord))

        if (!exception.valid.rh06)
        {
          paramsErr  = c("0", "100", iRH06)
          error.data <- HeavyChecks.GetError(station.data, "RH06", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "RH06"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RH06", iRH06, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "RH06", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error RH06-001 for station ", station.number, "\n"))
        }
      }

      # RH09
      iRH09 <- as.numeric(row$RH09)
      if (!is.na (iRH09) & (iRH09 < 0 | iRH09 > 100))
      {
        exception.valid.rh09 <- Check.HeavyChecks.Exceptions(exceptions.config, list("RH09", "001", station.data, station.coord))

        if (!exception.valid.rh09)
        {
          paramsErr  = c("0", "100", iRH09)
          error.data <- HeavyChecks.GetError(station.data, "RH09", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "RH09"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RH09", iRH09, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "RH09", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error RH09-001 for station ", station.number, "\n"))
        }
      }

      # RH12
      iRH12 <- as.numeric(row$RH12)
      if (!is.na (iRH12) & (iRH12 < 0 | iRH12 > 100))
      {
        exception.valid.rh12 <- Check.HeavyChecks.Exceptions(exceptions.config, list("RH12", "001", station.data, station.coord))

        if (!exception.valid.rh12)
        {
          paramsErr  = c("0", "100", iRH12)
          error.data <- HeavyChecks.GetError(station.data, "RH12", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "RH12"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RH12", iRH12, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "RH12", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error RH12-001 for station ", station.number, "\n"))
        }
      }

      # RH15
      iRH15 <- as.numeric(row$RH15)
      if (!is.na (iRH15) & (iRH15 < 0 | iRH15 > 100))
      {
        exception.valid.rh15 <- Check.HeavyChecks.Exceptions(exceptions.config, list("RH15", "001", station.data, station.coord))

        if (!exception.valid.rh15)
        {
          paramsErr  = c("0", "100", iRH15)
          error.data <- HeavyChecks.GetError(station.data, "RH15", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "RH15"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RH15", iRH15, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "RH15", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error RH15-001 for station ", station.number, "\n"))
        }
      }

      # RH18
      iRH18 <- as.numeric(row$RH18)
      if (!is.na (iRH18) & (iRH18 < 0 | iRH18 > 100))
      {
        exception.valid.rh18 <- Check.HeavyChecks.Exceptions(exceptions.config, list("RH18", "001", station.data, station.coord))

        if (!exception.valid.rh18)
        {
          paramsErr  = c("0", "100", iRH18)
          error.data <- HeavyChecks.GetError(station.data, "RH18", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "RH18"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RH18", iRH18, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "RH18", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error RH18-001 for station ", station.number, "\n"))
        }
      }

      # VPD Vapour pressure deficit
      iVPD <- as.numeric(row$VPD)
      if (!is.na (iVPD) & (iVPD < 0 | iVPD > 60))
      {
        exception.valid.vpd <- Check.HeavyChecks.Exceptions(exceptions.config, list("VPD", "001", station.data, station.coord))

        if (!exception.valid.vpd)
        {
          paramsErr  = c("0", "60", iVPD)
          error.data <- HeavyChecks.GetError(station.data, "VPD", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "VPD"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "VPD", iVPD, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "VPD", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error VPD-001 for station ", station.number, "\n"))
        }
      }

      # SLOPE
      iSLOPE <- as.numeric(row$SLOPE)
      if (!is.na (iSLOPE) & (iSLOPE < 0 | iSLOPE > 30))
      {
        exception.valid.slope <- Check.HeavyChecks.Exceptions(exceptions.config, list("SLOPE", "001", station.data, station.coord))

        if (!exception.valid.slope)
        {
          paramsErr  = c("0", "30", iSLOPE)
          error.data <- HeavyChecks.GetError(station.data, "SLOPE", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "SLOPE"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "SLOPE", iSLOPE, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "SLOPE", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error SLOPE-001 for station ", station.number, "\n"))
        }
      }

      # ET0
      iET0 <- as.numeric(row$ET0)
      if (!is.na (iET0) & (iET0 < 0 | iET0 > 25))
      {
        exception.valid.et0 <- Check.HeavyChecks.Exceptions(exceptions.config, list("ET0", "001", station.data, station.coord))

        if (!exception.valid.et0)
        {
          paramsErr  = c("0", "25", iET0)
          error.data <- HeavyChecks.GetError(station.data, "ET0", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            #prop.status[1, "ET0"] <- error.data[[1]]
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "ET0", iET0, "001", error.data[[1]], error.data[[2]], error.data[[3]])
            #station.flags <- HeavyChecks.ManageFlags(station.flags, station.number, current.date, "ET0", error.data[[1]])
          }
        } else {
          print (paste0("Exception rule remove error ET0-001 for station ", station.number, "\n"))
        }
      }

      # visibility
      iVis <- as.numeric(row$VIS)
      if (!is.na (iVis) & ( iVis < 0 | iVis > 80))
      {
        exception.valid.vis <- Check.HeavyChecks.Exceptions(exceptions.config, list("VIS", "001", station.data, station.coord))

        if (!exception.valid.vis)
        {
          paramsErr  = c("0", "80", iVis)
          error.data <- HeavyChecks.GetError(station.data, "VIS", "001", paramsErr)
          if (!is.null(error.data) & length(error.data) > 0)
          {
            new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "VIS", iVis, "001", error.data[[1]], error.data[[2]], error.data[[3]])
          }
        } else {
          print (paste0("Exception rule remove error ET0-001 for station ", station.number, "\n"))
        }
      }

      #return the list of data.frames
      return (list(station.data, new.errors)) #, station.flags))
    }
    ,error = function (err)
    {
      print (paste0('Station.HeavyChecks[Station:', station.number , '] - Error : ', err))
      return (data.list)
    }
    ,warning = function (warn)
    {
      print (paste0('Station.HeavyChecks[Station:', station.number , '] - Warning: ', warn))
      return (data.list)
    }
    )

  return (result)
}
