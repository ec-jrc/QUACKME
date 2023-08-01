#*********************************************************
#           Solar radiation, Sunshine duration,
#              cloud cover, Precipation
#                     Weak Checks
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
WeakChecks.ChecksSolar <- function(data.list, current.date, old.errors, mos.data)
{
  result <- tryCatch(
    {
      # extract essential data
      station.obs <- data.list[[1]]
      new.errors  <- data.list[[2]]
      prop.flags  <- data.list[[3]]

      # define the matrix of status
      prop.status <- as.data.frame(matrix(nrow = nrow(station.obs), ncol = 10))
      colnames(prop.status) <- c("RD", "RD24", "SH", "SH24", "N", "L", "PREC", "PR06", "PR24", "RR")
      prop.status[, "RD"]    <- "C"
      prop.status[, "RD24"]  <- "C"
      prop.status[, "SH"]    <- "C"
      prop.status[, "SH24"]  <- "C"
      prop.status[, "N"]     <- "C"
      prop.status[, "L"]     <- "C"
      prop.status[, "PREC"]  <- "C"
      prop.status[, "PR06"]  <- "C"
      prop.status[, "PR24"]  <- "C"
      prop.status[, "RR"]    <- "C"

      paramsErr  = c("")

      for (obs in 1:nrow(station.obs))
      {
        # get current row
        row <- station.obs[obs, ]

        # numeric values
        iRD   <- ifelse (!is.na(row$RD), suppressWarnings(as.numeric(as.character(row$RD))), NA)
        iRD24 <- ifelse(!is.na(row$RD24), suppressWarnings(as.numeric(as.character(row$RD24))), NA)
        iSH   <- ifelse(!is.na(row$SH), suppressWarnings(as.numeric(as.character(row$SH))), NA)
        iSH24 <- ifelse(!is.na(row$SH24), suppressWarnings(as.numeric(as.character(row$SH24))), NA)
        iCC   <- ifelse(!is.na(row$N), suppressWarnings(as.numeric(as.character(row$N))), NA)
        iLC   <- ifelse(!is.na(row$L), suppressWarnings(as.numeric(as.character(row$L))), NA)
        iPREC <- ifelse(!is.na(row$PREC), suppressWarnings(as.numeric(as.character(row$PREC))), NA)
        iRR <- ifelse(!is.na(row$RR), suppressWarnings(as.numeric(as.character(row$RR))), NA)
        iTR <- ifelse(!is.na(row$TR), suppressWarnings(as.numeric(as.character(row$TR))), NA)

        # replace NA total cloud value with the low cloud value if valid
        if (is.na(iCC) && !is.na(iLC))
        {
          station.obs[obs, "N"] <- iLC
          iCC <- iLC
        }

        # hourly solar radiation. the value is reported in KJ/mq/h
        if (!is.na(iRD))
        {
          if ( iRD < 0 | iRD > 5760)
          {
            #Pierluca De Palma 18.09.2019
            paramsErr  = c("0 - 1600", (iRD * 1000)/3600)
            error.data <- WeakChecks.GetError("001", "RD", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "RD"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RD", iRD, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "RD", error.data[[1]])
            }
          }
        }

        # daily solar radiation. the value is reported in J/cm2
        # remove on 15.12.2021
        if (FALSE)
        {
	        if (!is.na(iRD24))
	        {
	          if ( iRD24 < 0 | iRD24 > 5760 * 24)
	          {
	            #Pierluca De Palma 18.09.2019
	            paramsErr  = c("0 - 38.4", (iRD24/360))
	            error.data <- WeakChecks.GetError("001", "RD24", row$DayTime, old.errors, paramsErr)
	            if (!is.null(error.data) & length(error.data) > 0)
	            {
	              prop.status[obs, "RD24"] <- error.data[[1]]
	              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RD24", iRD24, "001", error.data[[1]], error.data[[2]])
	              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "RD24", error.data[[1]])
	            }
	          }
	        }
        }

        # hourly sunshine
        if (!is.na(iSH))
        {
          if ( iSH > 60)
          {
            #Pierluca De Palma 18.09.2019
            paramsErr  = c("60", iSH)
            error.data <- WeakChecks.GetError("001", "SH", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "SH"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "SH", iSH, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "SH", error.data[[1]])
            }
          }
        }

        # daily sunshine
        if (!is.na(iSH24))
        {
          if ( iSH24 > 24 * 60)
          {
            #Pierluca De Palma 18.09.2019
            paramsErr  = c("24", iSH24H)
            error.data <- WeakChecks.GetError("001", "SH24", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "SH24"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "SH24", iSH24, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "SH24", error.data[[1]])
            }
          }
        }

        # cloud cover
        if (!is.na(iCC))
        {
          if ( iCC < 0 | iCC > 8)
          {
            #Pierluca De Palma 18.09.2019
            paramsErr  = c("0 - 8", iCC)
            error.data <- WeakChecks.GetError("001", "N", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "N"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "N", iCC, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "N", error.data[[1]])
            }
          }
        }

        # low cloud cover
        if (!is.na(iLC))
        {
          if ( iLC < 0 | iLC > 8)
          {
            #Pierluca De Palma 18.09.2019
            paramsErr  = c("0 - 8", iLC)
            error.data <- WeakChecks.GetError("001", "L", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "L"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "L", iLC, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "L", error.data[[1]])
            }
          }
        }

        # precipitation
        if (!is.na(iPREC))
        {
          if ( iPREC < 0 | iPREC >= 400)
          {
            #Pierluca De Palma 18.09.2019
            paramsErr  = c("0 - 400", iPREC)
            error.data <- WeakChecks.GetError("001", "PREC", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "PREC"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "PREC", iPREC, "001", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "PREC", error.data[[1]])
            }
          }
          else if (iPREC >= 40 & iPREC < 400)
          {
            #Pierluca De Palma 18.09.2019
            #March 2023 - change the threshold from 200 to 70 mm by hour
            paramsErr  = c("40", iPREC)
            error.data <- WeakChecks.GetError("002", "PREC", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "PREC"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "PREC", iPREC, "002", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "PREC", error.data[[1]])
            }
          }
        }

        if (!is.na(iRD) & !is.na(iSH))
        {
          if ( iSH > 0 & iRD == 0)
          {
            #Pierluca De Palma 18.09.2019
            paramsErr  = c("0", "0", iSH, iRD)
            error.data <- WeakChecks.GetError("002", "RD", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "RD"] <- ifelse (prop.status[obs, "RD"] == "C" | prop.status[obs, "RD"] == "S", error.data[[1]], prop.status[obs, "RD"])
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RD", iRD, "002", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "RD", error.data[[1]])
            }
          }
        }

        # precipitation for RR/TR
        if (!is.na(iTR) & !is.na(iRR))
        {
          print (paste0('Station:', row$Station, ',DayTime:', row$DayTime, ', RR:', iRR, ', TR:', iTR))
          if (iTR == 1)
          {
            if ( iRR < 0 | iRR >= 400)
            {
              paramsErr  = c("0", "400", iRR, iTR)
              error.data <- WeakChecks.GetError("002", "RR", row$DayTime, old.errors, paramsErr)
              if (!is.null(error.data) & length(error.data) > 0)
              {
                prop.status[obs, "RR"] <- error.data[[1]]
                new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RR", iRR, "002", error.data[[1]], error.data[[2]])
                prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "RR", error.data[[1]])
              }
            }
            else if (iRR >= 40 & iRR < 400)
            {
              paramsErr  = c("40", "400", iRR, iTR)
              error.data <- WeakChecks.GetError("003", "RR", row$DayTime, old.errors, paramsErr)
              if (!is.null(error.data) & length(error.data) > 0)
              {
                prop.status[obs, "RR"] <- error.data[[1]]
                new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RR", iRR, "003", error.data[[1]], error.data[[2]])
                prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "RR", error.data[[1]])
              }
            }
          }

          # precipitation for RR/TR - 3 H
          if (iTR == 3 )
          {
            if (iRR < 0 | iRR >= 400)
            {
              paramsErr  = c("0", "400", iRR, iTR)
              error.data <- WeakChecks.GetError("002", "RR", row$DayTime, old.errors, paramsErr)
              if (!is.null(error.data) & length(error.data) > 0)
              {
                prop.status[obs, "RR"] <- error.data[[1]]
                new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RR", iRR, "002", error.data[[1]], error.data[[2]])
                prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "RR", error.data[[1]])
              }
            }
            else if (iRR >= 80 & iRR < 400)
            {
              paramsErr  = c("80", "400", iRR, iTR)
              error.data <- WeakChecks.GetError("003", "RR", row$DayTime, old.errors, paramsErr)
              if (!is.null(error.data) & length(error.data) > 0)
              {
                prop.status[obs, "RR"] <- error.data[[1]]
                new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RR", iRR, "003", error.data[[1]], error.data[[2]])
                prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "RR", error.data[[1]])
              }
            }
          }

          # precipitation for RR/TR - 6 H
          if (iTR == 6)
          {
            if (iRR < 0 | iRR >= 400)
            {
              paramsErr  = c("0", "400", iRR, iTR)
              error.data <- WeakChecks.GetError("002", "RR", row$DayTime, old.errors, paramsErr)
              if (!is.null(error.data) & length(error.data) > 0)
              {
                prop.status[obs, "RR"] <- error.data[[1]]
                new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RR", iRR, "002", error.data[[1]], error.data[[2]])
                prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "RR", error.data[[1]])
              }
            }
            else if (iRR >= 80 & iRR < 400)
            {
              paramsErr  = c("80", "400", iRR, iTR)
              error.data <- WeakChecks.GetError("003", "RR", row$DayTime, old.errors, paramsErr)
              if (!is.null(error.data) & length(error.data) > 0)
              {
                prop.status[obs, "RR"] <- error.data[[1]]
                new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RR", iRR, "003", error.data[[1]], error.data[[2]])
                prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "RR", error.data[[1]])
              }
            }
          }

          # precipitation for RR/TR - 12 H
          if (iTR == 12)
          {
            if (iRR < 0 | iRR >= 400)
            {
              paramsErr  = c("0", "400", iRR, iTR)
              error.data <- WeakChecks.GetError("002", "RR", row$DayTime, old.errors, paramsErr)
              if (!is.null(error.data) & length(error.data) > 0)
              {
                prop.status[obs, "RR"] <- error.data[[1]]
                new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RR", iRR, "002", error.data[[1]], error.data[[2]])
                prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "RR", error.data[[1]])
              }
            }
            else if (iRR >= 80 & iRR < 400)
            {
              paramsErr  = c("80", "400", iRR, iTR)
              error.data <- WeakChecks.GetError("003", "RR", row$DayTime, old.errors, paramsErr)
              if (!is.null(error.data) & length(error.data) > 0)
              {
                prop.status[obs, "RR"] <- error.data[[1]]
                new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "RR", iRR, "003", error.data[[1]], error.data[[2]])
                prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "RR", error.data[[1]])
              }
            }
          }
        }

        # precipitation for PR06
        if (!is.na(row$PR06))
        {
          if (row$PR06 < 0 | row$PR06 >= 400)
          {
            paramsErr  = c("0", "400", row$PR06)
            error.data <- WeakChecks.GetError("004", "PR06", row$DayTime, old.errors, paramsErr)
            if (!is.null(error.data) & length(error.data) > 0)
            {
              prop.status[obs, "PR06"] <- error.data[[1]]
              new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "PR06", row$PR06, "004", error.data[[1]], error.data[[2]])
              prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "PR06", error.data[[1]])
            }
            else if (iPR06 >= 80 & iPR06 < 400)
            {
              paramsErr  = c("80", "400", row$PR06)
              error.data <- WeakChecks.GetError("005", "RR", row$DayTime, old.errors, paramsErr)
              if (!is.null(error.data) & length(error.data) > 0)
              {
                prop.status[obs, "PR06"] <- error.data[[1]]
                new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "PR06", row$PR06, "005", error.data[[1]], error.data[[2]])
                prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "PR06", error.data[[1]])
              }
            }
          }
        }

        # 01.07.2019 - Moved to HeavyChecks
        #if (!is.na(iRD24) & !is.na(iSH24))
        #{
        #  if ( iSH24 > 0 & iRD24 == 0)
        #  {
        #    obs.node.sh24[[1]] <- WeakChecks.ManageError("002", obs.node.sh24[[1]], row$DayTime, xml.errors)
        #  }
        #}

        # 01.07.2019 - MOVED to HeavyChecks
        #if (!is.na(iPREC) & !is.na(iCC))
        #{
        # if ( iPREC > 0 & iCC == 0)
        #  {
        #    obs.node.cc[[1]] <- WeakChecks.ManageError("002", obs.node.cc[[1]], row$DayTime, xml.errors)
        #  }
        #}

        # 01.07.2019 - MOVED to HeavyChecks
        #if (!is.na(iSH) & !is.na(iCC))
        #{
        #  if ( iSH > 0 & iCC == 8)
        #  {
        #    obs.node.cc[[1]] <- WeakChecks.ManageError("003", obs.node.cc[[1]], row$DayTime, xml.errors)
        #  }
        #}

        # reset the RR & TR values if one of it are not valid
        iRR <- ifelse(!is.na(row$RR), suppressWarnings(as.numeric(as.character(row$RR))), NA)
        iTR <- ifelse(!is.na(row$TR), suppressWarnings(as.numeric(as.character(row$TR))), NA)

        if ( is.na(iRR) | is.na(iTR) )
        {
          station.obs[obs, "RR"] <- NA
          station.obs[obs, "TR"] <- NA
        }

        # precipitation MOS controls
        if (!is.null(mos.data))
        {
          mos.idx <- which( mos.data$DayTime == row$DayTime)
          if (length(mos.idx) > 0)
          {
            # get the MOS row
            mos.row <- mos.data[mos.idx, ]

            # 1H MOS precipitation checks removed on 03.11

            # retrieve maximum values
            #mos.RRR1X <- NA
            mos.RRR6X <- NA
            mos.RRR12X <- NA
            mos.RRR24X <- NA

            #if ( "RRRX1" %in% colnames(mos.data))
            #{
            # mos.RRR1X <- if(!is.na(mos.row$RRRX1)) suppressWarnings(as.numeric(as.character(mos.row$RRRX1))) else NA
            #}

            if ( "RRRX6" %in% colnames(mos.data))
            {
              mos.RRR6X <- if(!is.na(mos.row$RRRX6)) suppressWarnings(as.numeric(as.character(mos.row$RRRX6))) else NA
            }
            if ( "RRRX12" %in% colnames(mos.data))
            {
              mos.RRR12X <- if(!is.na(mos.row$RRRX12)) suppressWarnings(as.numeric(as.character(mos.row$RRRX12))) else NA
            }
            if ( "RRRX24" %in% colnames(mos.data))
            {
              mos.RRR24X <- if(!is.na(mos.row$RRRX24)) suppressWarnings(as.numeric(as.character(mos.row$RRRX24))) else NA
            }

            # manage 1 hour precipitation (removed on 03.11)
            if (FALSE)
            {
              if (!is.na(iPREC) & !is.na(mos.RRR1X) & !is.na(mos.row[, "PREC"]))
              {
                mos.RRR1 <- as.numeric(mos.row$PREC)
                SD.RRR1 <- min(5 * max(0.2, mos.RRR1), max(1, abs(mos.RRR1X - mos.RRR1)))
                if ( !is.na(mos.RRR1) & mos.RRR1 > 0)
                {
         		      F.RRR1 <- abs(iPREC - mos.RRR1) / mos.RRR1

          			  if ( abs(iPREC - mos.RRR1) > (6 * SD.RRR1))
           			  {
          				  if (iPREC > 20 & !is.na(F.RRR1) & F.RRR1 > 5)
             			  {
          					  paramsErr  = c(iPREC, mos.RRR1, mos.RRR1X, SD.RRR1, round(F.RRR1, digits=2))
          					  error.data <- WeakChecks.GetError("003", "PREC", row$DayTime, old.errors, paramsErr)
          					  if (!is.null(error.data) & length(error.data) > 0)
          					  {
            					  prop.status[obs, "PREC"] <- ifelse (prop.status[obs, "PREC"] == "C" | prop.status[obs, "PREC"] == "S", error.data[[1]], prop.status[obs, "PREC"])
          					    new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "PREC", iPREC, "003", error.data[[1]], error.data[[2]])
          					    prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "PREC", error.data[[1]])
          					  }
          				  }
                    else if ( abs(iPREC - mos.RRR1) > (6 * SD.RRR1) &
                              !(iPREC > mos.RRR1 &
                                ( (iPREC <= 10 & mos.RRR1 >= 0.5) |
                                (iPREC <= 15 & mos.RRR1 >= 2.5) )))
                    {
          					  paramsErr  = c(iPREC, mos.RRR1, mos.RRR1X, SD.RRR1, F.RRR1)
          					  error.data <- WeakChecks.GetError("004", "PREC", row$DayTime, old.errors, paramsErr)
          					  if (!is.null(error.data) & length(error.data) > 0)
          					  {
            						prop.status[obs, "PREC"] <- ifelse (prop.status[obs, "PREC"] == "C" | prop.status[obs, "PREC"] == "S", error.data[[1]], prop.status[obs, "PREC"])
          						  new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "PREC", iPREC, "004", error.data[[1]], error.data[[2]])
          						  prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "PREC", error.data[[1]])
          					  }
                    }
          			  }
                }
        			}
            }

            # manage 6 hourly precipitation
            iPR06 <- ifelse(!is.na(row$PR06), suppressWarnings(as.numeric(as.character(row$PR06))), NA)
            if (!is.na(iPR06) & !is.na(mos.RRR6X) & !is.na(mos.row[, "PR06"]))
            {
              mos.RRR6 <- as.numeric(mos.row$PR06)
              SD.RRR6 <- min(5 * max(0.2, mos.RRR6), max(1, abs(mos.RRR6X - mos.RRR6)))
              if (!is.na(mos.RRR6) & mos.RRR6 > 0)
              {
                F.RRR6 <- abs(iPR06 - mos.RRR6) / mos.RRR6

                if ( abs(iPR06 - mos.RRR6) > (6 * SD.RRR6) & iPR06 > 20 & !is.na(F.RRR6) & F.RRR6 > 5)
                {
                  paramsErr  = c(iPR06, mos.RRR6, mos.RRR6X, SD.RRR6, round(F.RRR6, digits = 2))
                  error.data <- WeakChecks.GetError("001", "PR06", row$DayTime, old.errors, paramsErr)
                  if (!is.null(error.data) & length(error.data) > 0)
                  {
                    prop.status[obs, "PR06"] <- ifelse (prop.status[obs, "PR06"] == "C" | prop.status[obs, "PR06"] == "S", error.data[[1]], prop.status[obs, "PR06"])
                    new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "PR06", iPR06, "001", error.data[[1]], error.data[[2]])
                    prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "PR06", error.data[[1]])
                  }
                }
                else if ( abs(iPR06 - mos.RRR6) > (6 * SD.RRR6) &
                          !(iPR06 > mos.RRR6 &
                            ( (iPR06 <= 10 & mos.RRR6 >= 0.5) |
                              (iPR06 <= 15 & mos.RRR6 >= 2.5) )))
                {
                  paramsErr  = c(iPR06, mos.RRR6, mos.RRR6X, SD.RRR6, F.RRR6)
                  error.data <- WeakChecks.GetError("002", "PR06", row$DayTime, old.errors, paramsErr)
                  if (!is.null(error.data) & length(error.data) > 0)
                  {
                    prop.status[obs, "PR06"] <- ifelse (prop.status[obs, "PR06"] == "C" | prop.status[obs, "PR06"] == "S", error.data[[1]], prop.status[obs, "PR06"])
                    new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "PR06", iPR06, "002", error.data[[1]], error.data[[2]])
                    prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "PR06", error.data[[1]])
                  }
                }
              }
            }

            # manage 24 hourly precipitation
            iPR24 <- ifelse (!is.na(row$PR24), suppressWarnings(as.numeric(as.character(row$PR24))), NA)
            if (!is.na(iPR24) & !is.na(mos.RRR24X) & !is.na(mos.row[, "PR24"]))
            {
              mos.RRR24 <- as.numeric(mos.row$PR24)
              SD.RRR24 <- min(5 * max(0.2, mos.RRR24), max(1, abs(mos.RRR24X - mos.RRR24)))
              if (!is.na(mos.RRR24) & mos.RRR24 > 0)
              {
                F.RRR24 <- abs(iPR24 - mos.RRR24) / mos.RRR24

                if ( abs(iPR24 - mos.RRR24) > (6 * SD.RRR24) & iPR24 > 20 & !is.na(F.RRR24) & F.RRR24 > 5)
                {
                  paramsErr  = c(iPR24, mos.RRR24, mos.RRR24X, SD.RRR24, round(F.RRR24, digits = 2))
                  error.data <- WeakChecks.GetError("001", "PR24", row$DayTime, old.errors, paramsErr)
                  if (!is.null(error.data) & length(error.data) > 0)
                  {
                    prop.status[obs, "PR24"] <- ifelse (prop.status[obs, "PR24"] == "C" | prop.status[obs, "PR24"] == "S", error.data[[1]], prop.status[obs, "PR24"])
                    new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "PR24", iPR24, "001", error.data[[1]], error.data[[2]])
                    prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "PR24", error.data[[1]])
                  }
                }
                else if ( abs(iPR24 - mos.RRR24) > (6 * SD.RRR24) &
                          !(iPR24 > mos.RRR24 &
                            ( (iPR24 <= 10 & mos.RRR24 >= 0.5) |
                              (iPR24 <= 15 & mos.RRR24 >= 2.5) )))
                {
                  paramsErr  = c(iPR24, mos.RRR24, mos.RRR24X, SD.RRR24, F.RRR24)
                  error.data <- WeakChecks.GetError("002", "PR24", row$DayTime, old.errors, paramsErr)
                  if (!is.null(error.data) & length(error.data) > 0)
                  {
                    prop.status[obs, "PR24"] <- ifelse (prop.status[obs, "PR24"] == "C" | prop.status[obs, "PR24"] == "S", error.data[[1]], prop.status[obs, "PR24"])
                    new.errors[ nrow(new.errors) + 1, ] <- c(row$Station, row$DayTime, "PR24", iPR24, "002", error.data[[1]], error.data[[2]])
                    prop.flags <- WeakChecks.ManageFlag(prop.flags, row$Station, row$DayTime, "PR24", error.data[[1]])
                  }
                }
              }
            }
          }
        }

        iPR24.last <- NA
        iPR24.daytime.last  <- NA

        # check 24H precipitation value at 06 next day
        day.06nd <- current.date + 30 * 3600
        obs.06nd <- subset(station.obs, strptime(station.obs$DayTime, "%Y%m%d%H") == day.06nd)
        if (!is.null(obs.06nd) & nrow(obs.06nd) & !is.na(obs.06nd[1, "PR24"]))
        {
          iPR24.last <- suppressWarnings(as.numeric(as.character(obs.06nd[1, "PR24"])))
          iPR24.daytime.last <- day.06nd
        }

        if (is.na(iPR24.last))
        {
          # check 24H precipitation value at 00 next day if at 06 is missing
          day.00nd <- current.date + 24 * 3600
          obs.00nd <- subset(station.obs, strptime(station.obs$DayTime, "%Y%m%d%H") == day.00nd)
          if (!is.null(obs.00nd) & nrow(obs.00nd) & !is.na(obs.00nd[1, "PR24"]))
          {
            iPR24.last <- suppressWarnings(as.numeric(as.character(obs.00nd[1, "PR24"])))
            iPR24.daytime.last <- day.00nd
          }
        }

        # cross checks for precipitations
        if (obs == nrow(station.obs))
        {
          if (!is.na(iPR24.last))
          {
            data.list[[1]] <- station.obs
            data.list[[2]] <- new.errors
            data.list[[3]] <- prop.flags

            if (format(iPR24.daytime.last, "%H") == "06")
            {
              # call cross checks for interval 06 current day - 06 next day
              resp.list <- WeakChecks.Precipitation.CrossChecks(list(station.obs, new.errors, prop.flags, prop.status),
                                                                current.date,
                                                                6,
                                                                old.errors,
                                                                iPR24.last,
                                                                iPR24.daytime.last)
              station.obs <- resp.list[[1]]
              new.errors  <- resp.list[[2]]
              prop.flags  <- resp.list[[3]]
              prop.status <- resp.list[[4]]
            }

            if (format(iPR24.daytime.last, "%H") == "00")
            {
              # call cross checks for interval 00 current day - 00 next day
              resp.list <- WeakChecks.Precipitation.CrossChecks(list(station.obs, new.errors, prop.flags, prop.status),
                                                                current.date,
                                                                0,
                                                                old.errors,
                                                                iPR24.last,
                                                                iPR24.daytime.last)

              station.obs <- resp.list[[1]]
              new.errors  <- resp.list[[2]]
              prop.flags  <- resp.list[[3]]
              prop.status <- resp.list[[4]]
            }
          }
        }
      }

      # check if for the specific time and property exists an alert with level="W" =>
      # in that case reset the value of the property to NA
      station.obs [ which (prop.status[, "RD"] == "W"), "RD"] <- NA
      station.obs [ which (prop.status[, "RD24"] == "W"), "RD24"] <- NA
      station.obs [ which (prop.status[, "SH"] == "W"), "SH"] <- NA
      station.obs [ which (prop.status[, "SH24"] == "W"), "SH24"] <- NA
      station.obs [ which (prop.status[, "N"] == "W"), "N"] <- NA
      station.obs [ which (prop.status[, "L"] == "W"), "L"] <- NA
      station.obs [ which (prop.status[, "PREC"] == "W"), "PREC"] <- NA
      station.obs [ which (prop.status[, "PR06"] == "W"), "PR06"] <- NA
      station.obs [ which (prop.status[, "PR24"] == "W"), "PR24"] <- NA
      station.obs [ which (prop.status[, "RR"] == "W"), "RR"] <- NA

      # release all is possible
      rm(prop.status)

      # interpolate main properties
      data.list[[1]] <- station.obs
      data.list[[2]] <- new.errors
      data.list[[3]] <- prop.flags
      data.list <- WeakChecks.Property.Interpolation(data.list, current.date, "RD")
      data.list <- WeakChecks.Property.Interpolation(data.list, current.date, "SH")
      data.list <- WeakChecks.Property.Interpolation(data.list, current.date, "N")
      data.list <- WeakChecks.Property.Interpolation(data.list, current.date, "L")
      data.list <- WeakChecks.Property.Interpolation(data.list, current.date, "PREC")

      # return the result
      return (data.list)
    }
    ,error = function (err)
    {
      print (paste0('WeakChecks.ChecksSolar[' + data.list[[1]][1, "Station"] + '] - Error : ', err))
      return (data.list)
    }
    ,warning = function (warn)
    {
      print (paste0('WeakChecks.ChecksSolar[' + data.list[[1]][1, "Station"] + '] - Warning: ', warn))
      return (data.list)
    })

  return (result)
}
