#*********************************************************
#    Implements method for flags management
#*********************************************************

#*********************************************************
# Manage the flags inside the WeakChecks module. If the combination [Station, DayTime, Property]
# already exists append the flag to existent, else add a new row
#
# Parameters :
#  - df.flags   [INPUT] [DATA.FRAME]	  - current flags situation
#  - station    [INPUT] [INT]	          - station identifier
#  - daytime    [INPUT] [INT]           - daytime like integer
#  - property   [INPUT] [STRING]        - name of column to interpolate
#  - flag       [INPUT] [STRING]        - flag to manage
#  [RETURN] [DATA.FRAME]  - The update flag situation
#*********************************************************
WeakChecks.ManageFlag <- function(df.flags, station, daytime, property, flag)
{
  result <- tryCatch( {
    idx <- which (df.flags$Station == station & df.flags$DayTime == daytime & df.flags$Property == property)
    if (length(idx) > 0 )
    {
      if (flag == "I")
      {
        df.flags[ idx[1], "Flags"] <- "I"
      } else {
        v.flags <- unlist (strsplit(as.character(df.flags[ idx[1], "Flags"]), "[|]"))
        if ( !(flag %in% v.flags))
        {
          df.flags[ idx[1], "Flags"] <- paste0(as.character(df.flags[ idx[1], "Flags"]), "|", flag)
        }
      }
    }
    else
    {
      df.flags[nrow(df.flags) + 1, ] <- c(station, daytime, property, flag)
    }
    return (df.flags)
  },
  error = function (err)
  {
    print (paste0('WeakChecks.ManageFlag[Station:', station, ', Property:', property, ', DayTime:', daytime, '] - Error : ', err))
    return (df.flags)
  }
  , warning = function (warn)
  {
    print (paste0('WeakChecks.ManageFlag[Station:', station, ', Property:', property, ', DayTime:', daytime, '] - Warning : ', warn))
    return (df.flags)
  })

  return (result)
}

#*********************************************************
# Manage the flags inside the WeakChecks module. Merge (union) the new flags to existent
#for the specific combination (station, time, property)
#
# Parameters :
#  - df.flags   [INPUT] [DATA.FRAME]	  - current flags situation
#  - station    [INPUT] [INT]	          - station identifier
#  - daytime    [INPUT] [INT]           - daytime like integer
#  - property   [INPUT] [STRING]        - name of column to interpolate
#  - flag       [INPUT] [VECTOR]        - flag to manage
#  [RETURN] [DATA.FRAME]  - The update flag situation
#*********************************************************
WeakChecks.ManageMultipleFlag <- function(df.flags, station, daytime, property, flags)
{
  result <- tryCatch( {
    idx <- which (df.flags$Station == station & df.flags$DayTime == daytime & df.flags$Property == property)
    if (length(idx) <= 0 )
    {
      idx <- nrow(df.flags) + 1
      df.flags[idx, ] <- c(station, daytime, property, "")
    }

    v.flags <- unlist (strsplit(as.character(df.flags[ idx[1], "Flags"]), "[|]"))
    for (f in 1:length(flags))
    {
      in.flags <- unlist (strsplit(as.character(flags[f]), "[|]"))
      v.flags <- union(v.flags, in.flags)
    }

    df.flags[idx, "Flags"] <- paste(v.flags, collapse = "|")

    return (df.flags)
  },
  error = function (err)
  {
    print (paste0('WeakChecks.ManageMultipleFlag[Station:', station, ', Property:', property, ', DayTime:', daytime, '] - Error : ', err))
    return (df.flags)
  }
  , warning = function (warn)
  {
    print (paste0('WeakChecks.ManageMultipleFlag[Station:', station, ', Property:', property, ', DayTime:', daytime, '] - Warning : ', warn))
    return (df.flags)
  })

  return (result)
}

#*********************************************************
# Aggregate formula flags considering the vector in input
# Parameters :
#  - v.flags    [INPUT] [VECTOR]	  - vector of flags
#               [RETURN] [STRING]   - all distinct flags separated by "|"
#*********************************************************
AggregateFormulaFlags <- function(v.flags)
{
  if (is.null(v.flags) | length(v.flags) == 0) { return (NA) }

  r.flags <- c()
  for (row in 1:length(v.flags))
  {
    h.flags <- unlist(strsplit(as.character(v.flags[row]), "[|]"))
    r.flags <- union(r.flags, h.flags)
  }

  flags <- paste(r.flags, collapse="|")
  rm(r.flags)
  return (flags)
}

#*********************************************************
# # Manage flags for HeavyChecks module property
# Parameters :
#  - current.flags    [INPUT] [STRING]	  - current flags
#  - new.flag         [INPUT] [STRING]    - new flag
#  - first            [INPUT] [BOOL]      - TRUE if is the first call, FALSE else
#               [RETURN] [STRING]   - all distinct flags separated by "|"
#*********************************************************
HeavyChecks.ManageFlags <- function(station.flags, station.number, current.date, property, new.flag)
{
  flag.idx <- which(station.flags$Property == property & station.flags$Station == station.number)

  result <- tryCatch({

    if (length(flag.idx) > 0)
    {
      current.flags <- as.character(station.flags[flag.idx[1], "Flags"])
      new.flag <- as.character(new.flag)

      flags   <- NA
      r.flags <- unlist(strsplit(current.flags, "[|]"))
      flags   <- ifelse (new.flag %in% r.flags, current.flags, paste0(current.flags, "|", new.flag))

      station.flags[flag.idx[1], "Flags"] <- flags

    } else {

      station.flags[1 + nrow(station.flags), ] <- c(station.number, format(current.date, "%Y%m%d"), property, new.flag)
    }

    return (station.flags)
  },
  error = function (err)
  {
    print (paste0('HeavyChecks.ManageFlags[Station=', station.number, ', Property=', property, '] - Error : ', err))
    return (station.flags)
  }
  ,warning = function (warn)
  {
    print (paste0('HeavyChecks.ManageFlags[Station=', station.number, ', Property=', property, '] - Warning: ', warn))
    return (station.flags)
  })

  return (result)
}

#*********************************************************
# Manage flags for ThresholdChecks module property
# Parameters :
#  - current.flags    [INPUT] [STRING]	  - current flags
#  - new.flag         [INPUT] [STRING]    - new flag
#               [RETURN] [STRING]   - all distinct flags separated by "|"
#*********************************************************
ThresholdChecks.ManageFlags <- function(station.flags, station.number, current.date, property, new.flag)
{
  flag.idx <- which(station.flags$Property == property & station.flags$Station == station.number)

  result <- tryCatch({

    if (length(flag.idx) > 0)
    {
      current.flags <- as.character(station.flags[flag.idx[1], "Flags"])
      new.flag <- as.character(new.flag)

      flags   <- NA
      r.flags <- unlist(strsplit(current.flags, "[|]"))
      flags   <- ifelse (new.flag %in% r.flags, current.flags, paste0(current.flags, "|", new.flag))

      station.flags[flag.idx[1], "Flags"] <- flags

    } else {

      station.flags[1 + nrow(station.flags), ] <- c(station.number, format(current.date, "%Y%m%d"), property, new.flag)
    }

    return (station.flags)
  },
  error = function (err)
  {
    print (paste0('ThresholdChecks.ManageFlags[Station=', station.number, ', Property=', property, '] - Error : ', err))
    return (current.flags)
  }
  ,warning = function (warn)
  {
    print (paste0('ThresholdChecks.ManageFlags[Station=', station.number, ', Property=', property, '] - Warning: ', warn))
    return (current.flags)
  })

  return (result)
}


