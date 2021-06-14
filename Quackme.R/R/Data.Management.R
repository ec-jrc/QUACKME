#*********************************************************
#             DATA management Module
#*********************************************************

#*********************************************************
# Merge data between original data and errors
# data.list		  [IN]	[LIST]	      Original data & flags
# errors.df   	[IN]	[DATA.FRAME]	Data frame with errors found on previous run
#*********************************************************
Merge.Data.Errors <- function(data.list, errors.df)
{
  result <- tryCatch(
    {
      data.df <- data.list[[1, 1]]
      prop.flags <- data.list[[1, 3]]

      rows <- nrow(errors.df)

      for (r in 1:rows)
      {
        # get current row
        error.row <- errors.df[r, ]
        error.daytime <- error.row$DayTime
        property.name <- as.character(error.row$Property)

        # search the observation with same daytime
        indexes <- which( data.df$DayTime == error.daytime)
        if (length(indexes) <= 0) { next }

        row.index <- indexes[1]

        if (error.row$Status == "F" | error.row$Status == "M")
        {
          # replace value
          data.df[row.index, property.name] <- error.row$Value
          prop.flags [ nrow(prop.flags) + 1, ] <- c(error.row$Station, error.row$DayTime, error.row$Property, "H")
        }
        else if (error.row$Status == "W")
        {
          # the wrong values will be discarded
          data.df[row.index, property.name] <- NA
        }
      }

      data.list[[1, 1]] <- data.df
      data.list[[1, 3]] <- prop.flags
      return (data.list)
    }
    ,error = function (err)
    {
      print (paste0('Merge.Data.Errors - Error : ', err))
      return (data.list)
    }
    ,warning = function (warn)
    {
      print (paste0('Merge.Data.Errors - Warning: ', warn))
      return (data.list)
    }

  )
  return (result)
}

#*********************************************************
# Merge data between original data and errors
# data.df		  [IN]	[DATA.FRAME]	Original data
# xml.errors	[IN]	[XML]			    Xml structure with errors
#*********************************************************
Merge.Data.Errors.Old <- function(data.df, xml.errors)
{
  result <- tryCatch(
    {
      rows <- nrow(data.df)

      for (r in 1:rows)
      {
        # get current row
        row <- data.df[r, ]

        # check if for current daytime&station exist a node with errors
        errors.node <-  getNodeSet(xml.errors,
                                   paste0("//Observation[DayTime=", row$DayTime, " and Station=",row$Station, "]/*[not (@Status=\"C\")]"))

        if (length(errors.node) > 0)
        {
          for (n in 1:length(errors.node))
          {
            # ignore Station, DayTime & ALERT nodes
            if (xmlName(errors.node[[n]]) == 'Station' |
                xmlName(errors.node[[n]]) == 'DayTime' |
                xmlName(errors.node[[n]]) == 'ALERT')
              next

            #get the error status and change the value of the properties depending on
            error.status <- xmlGetAttr(errors.node[[n]], "Status")
            if (error.status == "F" | error.status == "M")
            {
              data.df[r, xmlName(errors.node[[n]])] <- xmlValue(errors.node[[n]])
            }
            else if (error.status == "W")
            {
              # the wrong values will be discarded
              data.df[r, xmlName(errors.node[[n]])] <- 'NA'
            }
          }
        }

        # old version used when the KO files contains all data
        if (FALSE)
        {
          for(p.name in names(data.df))
          {
            if (!(p.name == "Station" | p.name == "DayTime"))
            {
              # for each property need to check if exists errors
              error.node <- Errors.Xml.Search.Property(p.name, row$Station, row$DayTime, xml.errors)

              # set the new value
              if (!is.null(error.node))
              {
                #get the error status
                error.status <- xmlGetAttr(error.node, "Status")
                if (error.status == "F" | error.status == "M")
                {
                  #print (paste0('Value changed - Old:', data.df[r, p.name], ', New:',  xmlValue(error.node[[1]])))
                  data.df[r, p.name] <- xmlValue(error.node[[1]])
                }
                else if (error.status == "W")
                {
                  # the wrong values will be discarded
                  data.df[r, p.name] <- 'NA'
                }
                else {
                  # unrecognized status value
                }
              }
            }
          }
        }
      }

      return (data.df)
    }
    ,error = function (err)
    {
      print (paste0('Merge.Data.Errors - Error : ', err))
      return (data.df)
    }
    ,warning = function (err)
    {
      print (paste0('Merge.Data.Errors - Warning: ', err))
      return (data.df)
    }

  )

  return (result)
}
