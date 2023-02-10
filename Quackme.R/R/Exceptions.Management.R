#*********************************************************
#             Exceptions management
#*********************************************************
# Libraries
library(XML)

#*********************************************************
# Retrieve exceptions for HeavyChecks module
# Parameters :
#  - exceptions.config [INPUT] [STRING]   - string with XML format containing all exceptions
#  - property.name     [INPUT] [STRING]   - name of property to search
#  - error.code        [INPUT] [STRING]   - code of error to search
# RETURN :
#                      [XML]              - list of XML nodes found or NULL
#*********************************************************
Get.HeavyChecks.Exceptions <- function(exceptions.config, property.name, error.code)
{
  if (is.null(exceptions.config)) return (NULL)

  ex.root <- xmlParse(exceptions.config)
  ex.nodes <- getNodeSet(ex.root, paste0('//Exception[Error[@Property=\"', property.name, '\" and @Code=\"', error.code, '\"]]'))
  return (ex.nodes)
}

#*********************************************************
# Evaluate EXCLUDE condition inside exception. The value not belong to the interval
#  or not equal with the specific condition value
# Parameters :
#  - xn        [INPUT] [XMLNODE]   - xml node with the condition
#  - value     [INPUT] [NUMERIC]   - value to use for condition
# RETURN :
#              [BOOLEAN]           - TRUE if the condition is satisfied, FALSE else
#*********************************************************
Evaluate.Exception.Exclude <- function(xn, value)
{
  propStatus <-  TRUE
  result <- tryCatch(
    {
      # min value
      minValue = as.character(xmlGetAttr(xn, "Min"))
      maxValue = as.character(xmlGetAttr(xn, "Max"))
      if (!is.null(minValue) & length(minValue) > 0 &
          !is.null(maxValue) & length(maxValue) > 0 )
      {
        propStatus = !(value > as.numeric(minValue) & value < as.numeric(maxValue))
      }
      else if (!is.null(maxValue) & length(maxValue) > 0)
      {
        propStatus = !(value < as.numeric(maxValue))
      }
      else if (!is.null(minValue) & length(minValue) > 0)
      {
        propStatus = !(value > as.numeric(minValue))
      }

      if (!propStatus) return (FALSE)

      # min value
      mineqValue = as.character(xmlGetAttr(xn, "MinEqual"))
      maxeqValue = as.character(xmlGetAttr(xn, "MaxEqual"))
      if (!is.null(mineqValue) & length(mineqValue) > 0 &
          !is.null(maxeqValue) & length(maxeqValue) > 0)
      {
        propStatus = !(value >= as.numeric(mineqValue) & value <= as.numeric(maxeqValue))
      }
      else if (!is.null(mineqValue) & length(mineqValue) > 0)
      {
        propStatus = !(value >= as.numeric(mineqValue))
      }
      else if (!is.null(maxeqValue) & length(maxeqValue) > 0)
      {
        propStatus = !(value <= as.numeric(maxeqValue))
      }

      if (!propStatus) return (FALSE)

      # equal value
      eqValue = as.character(xmlGetAttr(xn, "Equal"))
      if (!is.null(eqValue) & length(eqValue) > 0)
      {
        propStatus = !(value == as.numeric(eqValue))
      }

      return (propStatus)
    }
    ,error = function (err)
    {
      print (paste0('Evaluate.Exception.Exclude - Error', err))
      return (FALSE)
    }
    ,warning = function (warn)
    {
      print (paste0('Evaluate.Exception.Exclude - Warning: ', warn))
      return (FALSE)
    }
  )

  return (result)
}

#*********************************************************
# Evaluate INCLUDE condition inside exception. The value belong to the interval or equal
#   with specific value
# Parameters :
#  - xn        [INPUT] [XMLNODE]   - xml node with the condition
#  - value     [INPUT] [NUMERIC]   - value to use for condition
# RETURN :
#              [BOOLEAN]           - TRUE if the condition is satisfied, FALSE else
#*********************************************************
Evaluate.Exception.Include <- function(xn, value)
{
  propStatus <- TRUE
  result <- tryCatch(
    {
      # min value
      minValue = as.character(xmlGetAttr(xn, "Min"))
      maxValue = as.character(xmlGetAttr(xn, "Max"))
      if (!is.null(minValue) & length(minValue) > 0 &
          !is.null(maxValue) & length(maxValue) > 0 )
      {
        propStatus = (value > as.numeric(minValue) & value < as.numeric(maxValue))
      }
      else if (!is.null(maxValue) & length(maxValue) > 0)
      {
        propStatus = (value < as.numeric(maxValue))
      }
      else if (!is.null(minValue) & length(minValue) > 0)
      {
        propStatus = (value > as.numeric(minValue))
      }

      if (!propStatus) return (FALSE)

      # min value
      mineqValue = as.character(xmlGetAttr(xn, "MinEqual"))
      maxeqValue = as.character(xmlGetAttr(xn, "MaxEqual"))
      if (!is.null(mineqValue) & length(mineqValue) > 0 &
          !is.null(maxeqValue) & length(maxeqValue) > 0)
      {
        propStatus = (value >= as.numeric(mineqValue) & value <= as.numeric(maxeqValue))
      }
      else if (!is.null(mineqValue) & length(mineqValue) > 0)
      {
        propStatus = (value >= as.numeric(mineqValue))
      }
      else if (!is.null(maxeqValue) & length(maxeqValue) > 0)
      {
        propStatus = (value <= as.numeric(maxeqValue))
      }

      if (!propStatus) return (FALSE)

      # equal value
      eqValue = as.character(xmlGetAttr(xn, "Equal"))
      if (!is.null(eqValue) & length(eqValue) > 0 )
      {
        propStatus = (value == as.numeric(eqValue))
      }

      return (propStatus)
    }
    ,error = function (err)
    {
      print (paste0('Evaluate.Exception.Include - Error', err))
      return (FALSE)
    }
    ,warning = function (warn)
    {
      print (paste0('Evaluate.Exception.Include - Warning: ', warn))
      return (FALSE)
    }
  )

  return (result)
}

#*********************************************************
# Evaluate exception condition
# Parameters :
#  - xn                 [INPUT] [XMLNODE]   - xml node with the condition
#  - property.value     [INPUT] [NUMERIC]   - value to use for condition
# RETURN :
#              [BOOLEAN]           - TRUE if the condition is satisfied, FALSE else
#*********************************************************
Evaluate.Exception.Condition <- function (ex, property.value, station.coord)
{
  result <- tryCatch({

    target = as.character(xmlGetAttr(ex, "Target"))
    value = ifelse (target == "Value", property.value,
                    ifelse(target == "Latitude", as.numeric(as.character(station.coord[1, "Latitude"])),
                           ifelse(target == "Longitude", as.numeric(as.character(station.coord[1, "Longitude"])),
                                  ifelse(target == "Altitude", as.numeric(as.character(station.coord[1, "Altitude"])), NA))))
    exType = as.character(xmlGetAttr( ex, "Type"))
    if (exType == "Exclude") return (Evaluate.Exception.Exclude(ex, value))
    if (exType == "Include") return (Evaluate.Exception.Include(ex, value))
    return (FALSE)
  }
  ,error = function (err)
  {
    print (paste0('Evaluate.Exception.Condition - Error', err))
    return (FALSE)
  }
  ,warning = function (warn)
  {
    print (paste0('Evaluate.Exception.Condition - Warning: ', warn))
    return (FALSE)
  })

  return (result)
}

#*********************************************************
# Evaluate exception
# Parameters :
#  - ex            [INPUT] [XMLNODE]       - xml node with the condition
#  - station.data  [INPUT] [DATA.FRAME]    - station daily data
#  - station.coord [INPUT] [DATA.FRAME]    - station coordinates
# RETURN :
#              [BOOLEAN]           - TRUE if the exception is satisfied, FALSE else
#*********************************************************
Evaluate.Exception <- function (ex, station.data, station.coord)
{
  result <- tryCatch({

    exception.result <- TRUE
    prop.nodes <- getNodeSet(ex, "Property")

    if (!is.null(prop.nodes))
    {
      for(xp in prop.nodes)
      {
        prop.name = as.character(xmlGetAttr(xp, "Name"))
        prop.condition <- getNodeSet(xp, "Condition")[[1]]
        prop.value = station.data[1, prop.name]

        exception.result <- Evaluate.Exception.Condition(prop.condition, prop.value, station.coord)
        if (!exception.result) { break }
      }
    }

    if (exception.result)
    {
      # retrieve conditions
      cond.nodes <- getNodeSet(ex, "Condition")
      if (!is.null(cond.nodes))
      {
        for (xc in cond.nodes)
        {
          exception.result <- Evaluate.Exception.Condition(xc, NULL, station.coord)
          if (!exception.result) break
        }
      }
    }

    return (exception.result)
  }
  ,error = function (err)
  {
    print (paste0('Evaluate.Exception - Error', err))
    return (FALSE)
  }
  ,warning = function (warn)
  {
    print (paste0('Evaluate.Exception - Warning: ', warn))
    return (FALSE)
  })

  return (result)
}

#*********************************************************
# Check if exists a verified exceptions for a specific [property, error code]
# Parameters :
#  - exceptions.config  [INPUT] [STRING]  - xml string with exception configurations
#  - param.list         [INPUT] [LIST]    - list of parameters (property name, error code, station data, station coordinate)
# RETURN :
#              [BOOLEAN]           - TRUE if at least one exception is verified, FALSE if no exception is verified
#*********************************************************
Check.HeavyChecks.Exceptions <- function(exceptions.config, param.list)
{
  property.name <- param.list[[1]]
  error.code    <- param.list[[2]]
  station.data  <- param.list[[3]]
  station.coord <- param.list[[4]]

  #retrieve exceptions
  result <- tryCatch(
    {
      ex.nodes <- Get.HeavyChecks.Exceptions(exceptions.config, property.name, error.code)
      if (is.null(ex.nodes)) return (FALSE)

      for (ex in ex.nodes)
      {
        ex.result <- Evaluate.Exception(ex, station.data, station.coord)
        if (ex.result) return (TRUE)
      }

      return (FALSE)
    }
    ,error = function (err)
    {
      print (paste0('Check.HeavyChecks.Exceptions - Error', err))
      return (FALSE)
    }
    ,warning = function (warn)
    {
      print (paste0('Check.HeavyChecks.Exceptions - Warning: ', warn))
      return (FALSE)
    })

  return(result)

}

#*********************************************************
# Manage the error exceptions for theall errors find into the current run
# Parameters :
#  - exceptions.config  [INPUT] [STRING]    - xml string with exception configurations
#  - stations.df        [INPUT] [DATA.FRAME]- data frame with stations configurations
#  - observations.data  [INPUT] [DATA.FRAME]- data frame with observations data
#  - errors.data        [INPUT] [DATA.FRAME]- data frame with errors data
# RETURN :
#    Data frame with errors data
#*********************************************************
Manage.HeavyChecks.Exceptions <- function(exceptions.config, stations.df, observations.data, errors.data)
{
  result<-  tryCatch({
    # evaluate the configurations for each error
    row2remove <- c()
    for (row in 1:nrow(errors.data))
    {
      err.property <- errors.data[row, "Property"]
      err.code     <- errors.data[row, "Code"]
      station.config <- stations.df[ stations.df$StationNumber == errors.data[row, "Station"], ]
      station.obs    <- observations.data[ observations.data$Station == errors.data[row, "Station"], ]
      ex.result <- Check.HeavyChecks.Exceptions(exceptions.config, list(err.property, err.code, station.obs, station.config))
      if (ex.result) { row2remove <- c(row2remove, row) }
    }

    if (length(row2remove) > 0 )
    {
      errors.data <- errors.data[!row2remove, ]
    }

    return (errors.data)
  }
  ,error = function (err)
  {
    print (paste0('Manage.HeavyChecks.Exceptions - Error', err))
    return (errors.data)
  }
  ,warning = function (warn)
  {
    print (paste0('Manage.HeavyChecks.Exceptions - Warning: ', warn))
    return (errors.data)
  })

  return (result)
}
