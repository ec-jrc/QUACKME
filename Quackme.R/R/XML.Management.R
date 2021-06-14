#*********************************************************
#             XML management Module
#*********************************************************

#library include
library("XML")

#*********************************************************
# Convert DATAFRAME structure to XML structure
# df	    [IN]		  [DATAFRAME]		Data frame to convert
# elName	[IN]		  [TEXT]		    Name of single row element
# rootName[IN]      [TEXT]        Root name
# fileName[IN]      [TEXT]        Full path of the output file
#*********************************************************
DataFrame2XML <- function(df, elName, rootName, fileName)
{
  tryCatch(
  {
    xml <- xmlTree(rootName)
    xml$addNode(elName, close=FALSE)
    for (i in 1:nrow(df)) {
      xml$addNode("value", close=FALSE)
      for (j in names(df)) {
        xml$addNode(j, df[i, j])
      }
      xml$closeTag()
    }
    xml$closeTag()

    # save XML data to file
    saveXML(xml, fileName)
  },
  error = function(err) {
    print ( paste0('[ERROR in DataFrame2XML] :', err))
  })
}

#*********************************************************
# Convert DATAFRAME structure to XML file writing data directly to the file like a string
# df	      [IN]	[DATAFRAME]		Data frame to convert
# elName	  [IN]	[TEXT]		    Name of single row element
# rootName  [IN]  [TEXT]        Root name
# fileName  [IN]  [TEXT]        Full path of the output file
#*********************************************************
DataFrame2XMLByString <- function (df, elName, rootName, fileName)
{
  tryCatch(
    {
      df.cols <- colnames(df)
      df.rows <- nrow(df)
      fn <- file( fileName, open="a")
      cat (paste0("<", rootName, ">\n"), file = fn)
      for (r in 1:df.rows)
      {
        cat (paste0("<", elName, ">\n"), file = fn)
        for (c in 1:length(df.cols))
        {
          if (df.cols[c] != "Station" & df.cols[c] != "DayTime")
          {
            cat (paste0("  <", df.cols[c], ' Status="C">', df[r, c], "</", df.cols[c], ">\n"), file = fn)
          }
          else
          {
            cat (paste0("\t<", df.cols[c], ">", df[r, c], "</", df.cols[c], ">\n"), file = fn)
          }
        }
        cat (paste0("</", elName, ">\n"), file = fn)
      }

      cat (paste0("</", rootName, ">"), file = fn)

      # flush connection
      flush.connection(fn)
      close(fn)
    },
    error = function(err) {
      print ( paste0('[ERROR in DataFrame2XML] :', err))
    })
}


#*********************************************************
# Convert DATAFRAME structure to XML file writing data directly to the file like a string
# data.df	  [IN]	[DATAFRAME]		Data frame with observations data to convert
# error.df  [IN]  [DATA.FARME]  Data frame with errors data to convert
# elName	  [IN]	[TEXT]		    Name of single row element
# rootName  [IN]  [TEXT]        Root name
# fileName  [IN]  [TEXT]        Full path of the output file
#*********************************************************
ThresholdChecks.CreateXML.KOFile <- function (data.df, error.df, elName, rootName, fileName)
{
  tryCatch(
    {
      df.cols <- colnames(data.df)
      df.rows <- nrow(data.df)
      fn <- file( fileName, open="a")
      cat (paste0("<", rootName, ">\n"), file = fn)
      for (r in 1:df.rows)
      {
        # retrieve station number
        station.number <- data.df[r, "Station"]
        station.alerts <- ""

        # retrieve errors for station ordered by property
        station.errors <- subset (error.df, error.df$Station == station.number)

        cat (paste0("<", elName, ">\n"), file = fn)
        for (c in 1:length(df.cols))
        {
          property.name <- df.cols[c]
          if (property.name != "Station" & property.name != "DayTime")
          {
            # search for errors assigned to current column
            column.errors <- subset (station.errors, station.errors$Property == property.name)
            column.status <- "C"
            if (nrow(column.errors) > 0)
            {
              for (x in 1:nrow(column.errors))
              {
                station.alerts <- paste0(  station.alerts, ifelse(station.alerts != "", "\n", ""))
                station.alerts <- paste0(station.alerts, "\t<ALERT Level=\"", column.errors[x, "Level"],
                                                         "\" Property=\"", column.errors[x, "Property"],
                                                         "\" Code=\"", column.errors[x, "Code"],
                                                         "\" Message=\"", column.errors[x, "Message"],
                                                         "\" Area=\"", ifelse ("Area" %in% colnames(column.errors), column.errors[x, "Area"], "Unknown"),
                                                         "\" Values=\"", column.errors[x, "Values"], "\"></ALERT>")

                if (column.errors[x, "Level"] == "W" & column.status != "W")
                {
                  column.status <- "W"
                } else {
                  column.status <- column.errors[1, "Level"]
                }
              }

              cat (paste0("\t<", property.name, ' Status="', column.status, '">', column.errors[1, "Value"], "</", property.name, ">\n"), file = fn)

            } else {
              cat (paste0("\t<", property.name, ' Status="', column.status, '">', data.df[r, c], "</", property.name, ">\n"), file = fn)
            }
          }
          else
          {
            cat (paste0("\t<", property.name, ">", data.df[r, c], "</", property.name, ">\n"), file = fn)
          }
        }

        # save station alerts if presents
        if (nchar(station.alerts) > 0)
        {
          cat(paste0(station.alerts, '\n'), file = fn)
        }

        cat (paste0("</", elName, ">\n"), file = fn)
      }

      cat (paste0("</", rootName, ">"), file = fn)

      # flush connection
      flush.connection(fn)
      close(fn)
    },
    error = function(err) {
      print ( paste0('[HeavyChecks.CreateXML.KOFile] Error:', err))
    })
}

#*********************************************************
# Convert DATAFRAME structure to XML file writing data directly to the file like a string
# data.df	  [IN]	[DATAFRAME]		Data frame with observations data to convert
# error.df  [IN]  [DATA.FARME]  Data frame with errors data to convert
# elName	  [IN]	[TEXT]		    Name of single row element
# rootName  [IN]  [TEXT]        Root name
# fileName  [IN]  [TEXT]        Full path of the output file
#*********************************************************
HeavyChecks.CreateXML.KOFile <- function (data.df, error.df, elName, rootName, fileName)
{
  tryCatch(
    {
      df.cols <- colnames(data.df)
      df.rows <- nrow(data.df)
      fn <- file( fileName, open="a")
      cat (paste0("<", rootName, ">\n"), file = fn)
      for (r in 1:df.rows)
      {
        # retrieve station number
        station.number <- data.df[r, "Station"]
        station.alerts <- ""

        # retrieve errors for station ordered by property
        station.errors <- subset (error.df, error.df$Station == station.number)

        cat (paste0("<", elName, ">\n"), file = fn)
        for (c in 1:length(df.cols))
        {
          property.name <- df.cols[c]
          if (property.name != "Station" & property.name != "DayTime")
          {
            # search for errors assigned to current column
            column.errors <- subset (station.errors, station.errors$Property == property.name)
            column.status <- "C"
            if (nrow(column.errors) > 0)
            {
              for (x in 1:nrow(column.errors))
              {
                station.alerts <- paste0(  station.alerts, ifelse(station.alerts != "", "\n", ""))
                station.alerts <- paste0(station.alerts, "\t<ALERT Level=\"", column.errors[x, "Level"],
                                         "\" Property=\"", column.errors[x, "Property"],
                                         "\" Code=\"", column.errors[x, "Code"],
                                         "\" Message=\"", column.errors[x, "Message"],
                                         "\" Values=\"", column.errors[x, "Values"], "\"></ALERT>")

                if (column.errors[x, "Level"] == "W" & column.status != "W")
                {
                  column.status <- "W"
                } else {
                  column.status <- column.errors[1, "Level"]
                }
              }

              cat (paste0("\t<", property.name, ' Status="', column.status, '">', column.errors[1, "Value"], "</", property.name, ">\n"), file = fn)

            } else {
              cat (paste0("\t<", property.name, ' Status="', column.status, '">', data.df[r, c], "</", property.name, ">\n"), file = fn)
            }
          }
          else
          {
            cat (paste0("\t<", property.name, ">", data.df[r, c], "</", property.name, ">\n"), file = fn)
          }
        }

        # save station alerts if presents
        if (nchar(station.alerts) > 0)
        {
          cat(paste0(station.alerts, '\n'), file = fn)
        }

        cat (paste0("</", elName, ">\n"), file = fn)
      }

      cat (paste0("</", rootName, ">"), file = fn)

      # flush connection
      flush.connection(fn)
      close(fn)
    },
    error = function(err) {
      print ( paste0('[HeavyChecks.CreateXML.KOFile] Error:', err))
    })
}


#*********************************************************
# Merge 2 XML structure with identical structure cloning the nodes
# x1	[IN]		  [XML]		      xml structure
# x2	[IN]		  [XML]		      xml structure
# 		[RETURN]	[XML]	        unique xml structure
#*********************************************************
Merge.XML <- function( x1, x2)
{
  out <- tryCatch  (
    {
      x2_children <- xmlChildren(x2)
      if (!is.null(x2_children))
      {
        for (child.x2 in x2_children)
        {
          addChildren(x1, xmlClone(child.x2))
        }
      }
    },
    error=function(cond) {
      message(cond)
      # Choose a return value in case of error
      return(NULL)
    },
    warning=function(cond) {
      message(cond)
      return(NULL)
    },
    finally={
      return (x1)
    }
  )

  return (out)
}

#*********************************************************
# Split hourly observation into OK files
# i.obs	  [IN]		  [XML]	    input xml structure
# d.file	[IN]	    [STRING]	full path of destination file
#    	  	[RETURN]	[BOOL]	  TRUE if file was created, FALSE otherwise
#*********************************************************
XML.Spool.OK.Observations <- function( i.obs, d.file)
{
  result <- tryCatch(
    {
      print(paste0('Start creating file:', d.file, ' at ', Sys.time()))

      i <- 1
      n.list <- list("<Observations>")

      i <- 2
      # get the observation nodes that not contains the status = W for some property
      node.list <- getNodeSet(i.obs, "//Observation[not(*/@Status=\"W\")]")

      if (length(node.list) > 0)
      {
        # remove all ALERT nodes from the selected observations
        for (node.child in node.list)
        {
          alert.nodes <- getNodeSet(node.child, "//ALERT")
          removeNodes(alert.nodes)

          n.list[[i]] <- saveXML(node.child)
          i <- i+1
        }
      }

      n.list[[i]] <- "</Observations>"

      # create the output file only if exists nodes
      if (length(node.list) > 0)
      {
        # convert the node list to a data.frame of XML strings
        tmp.xml.df <- do.call(rbind.data.frame, n.list)

        tmp.df.file <- paste0(d.file, ".tmp")
        if (file.exists(tmp.df.file)) file.remove(tmp.df.file)

        # save the date frame of XML string to a file
        write.table(tmp.xml.df, file=tmp.df.file, sep="", row.names = FALSE, col.names = FALSE, quote=FALSE)
        rm(tmp.xml.df)

        print(paste0('Created file:', tmp.df.file, ' at ', Sys.time()))

        # read the file with xml string like an XML file
        xml.df <- xmlParse( tmp.df.file)

        # convert the XML structure to a real data.frame with the data of all onservations
        all.df <- xmlToDataFrame (xmlRoot(xml.df), c("integer", "integer", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric"))
        write.table(all.df, d.file,sep="\t",row.names=FALSE)

        file.remove(tmp.df.file)

        print(paste0('End creating file:', d.file, ' at ', Sys.time()))

        rm(all.df)
        rm(xml.df)
      }
      else
      {
        print(paste0('[', Sys.time(), '] File:', d.file, ' - not created due to missing record !'))
      }

      return (TRUE)
    },
    error = function(err) {
      print ( paste0('[ERROR in XML.Spool.OK.Observations] :', err))
      return (FALSE)
    }
  )

  return (result);
}

#*********************************************************
# Split hourly observation into KO files
# i.xml	    [IN]		  [XML]	  input xml structure
# l.level   [IN]      [ARRAY] array of levels to manage
# d.obs	    [IN]		  [XML]	  desitnation xml structure
# 	  	    [RETURN]	[BOOL]	TRUE if desination file was created
#*********************************************************
XML.Spool.KO.Observations <- function (i.xml, l.level, d.file)
{
  result <- tryCatch(
    {
      print(paste0('Start creating file:', d.file, ' at ', Sys.time()))
      i <- 1
      n.list <- list("<Observations>")

      # retrieve all nodes for KO
      i<- 2
      node.list <- getNodeSet(i.xml, "//Observation[ALERT[@Status=\"?\" and (@Level=\"A\" or @Level=\"S\" or @Level=\"W\")]]")
      if (length(node.list) > 0)
      {
        for (node.child in node.list)
        {
          n.list[[i]] <- saveXML(node.child)
          i <- i+1
        }
      }
      n.list[[i]] <- "</Observations>"

      # transforms the list of xml strings into data frame of strings
      xml.df <- do.call(rbind.data.frame, n.list)

      # write the data.frame to a text file
      write.table(xml.df, file=d.file, sep="", row.names = FALSE, col.names = FALSE, quote=FALSE)
      print(paste0('End creating file:', d.file, ' at ', Sys.time()))

      # release temporary memory
      rm(xml.df)

      return (TRUE)
    }
    , error = function(err)
    {
      print ( paste0('[ERROR in XML.Spool.KO.Observations] :', err))
      return (FALSE)
    }
  )

  return (result)
}

#*********************************************************
# Split OK/KO records. This method will produce 2 output files:
#  - one with correct observation where the wrong values will be replaced by NA
#  - onw with wrong/suspicious values
# Parameters:
# xml.in      [INPUT] [XML]     XML with observation data
# checksLevel [INPUT] [STRING]  Checks level
# date        [INPUT] [INT]     Reference date
# outputPath  [INPUT] [STRING]  Path where to create the output files
#
#*********************************************************
XML.Split.Observations <- function(xml.in, checksLevel, date, outputPath)
{
  output.data <- character()
  tryCatch(
    {
      i.ko <- 1
      i.ok <- 1
      ko.list <- list("<Observations>")
      ok.list <- list("<Observations>")

      i.ko <- 2
      i.ok <- 2

      # retrieve all nodes and fetch them
      node.list <- getNodeSet(xml.in, "//Observation")
      if (length(node.list) > 0)
      {
        for (node.child in node.list)
        {
          # check if the node contains elements with Wrong and/or Suspicous status
          ws.nodes <- xpathSApply(node.child, ".//*[@Status=\"W\" or @Status=\"S\"]", xmlChildren)
          if (length(ws.nodes) > 0)
          {
            clone.node <- xmlClone(node.child)
            ok.props <-  getNodeSet(clone.node, "//Observation/*[@Status=\"C\"]")
            if (length(ok.props) > 0)
            {
              removeNodes(ok.props)
            }

            # add the node to the ko file
            ko.list[[i.ko]] <- saveXML(clone.node)
            i.ko <- i.ko + 1

            # replace the wrong values with NA before to wright the record to the ok file
            wr.nodes <- xpathSApply(node.child, ".//*[@Status=\"W\"]", xmlChildren)
            if ( length (wr.nodes) > 0)
            {
              for (wr.node in wr.nodes)
              {
                xmlValue(wr.node) <- 'NA'
              }
            }
          }

          # write the record to OK file
          alert.nodes <- getNodeSet(node.child, ".//ALERT")
          if (length(alert.nodes) > 0)
          {
            removeNodes(alert.nodes)
          }

          ok.list[[i.ok]] <- saveXML((node.child))
          i.ok <- i.ok + 1
        }
      }

      # close the lists
      ko.list[[i.ko]] <- "</Observations>"
      ok.list[[i.ok]] <- "</Observations>"

      # transform the ko list to file
      ko.file <- paste0(outputPath, "O.KO.", checksLevel, ".", date, ".xml")
      if (i.ko > 2)
      {
        # transform the list of strings into data.frame of strings
        ko.df <- do.call(rbind.data.frame, ko.list)

        # write the data.frame to a text file
        if (file.exists(ko.file)) file.remove(ko.file)

        write.table(ko.df, file=ko.file, sep="", row.names = FALSE, col.names = FALSE, quote=FALSE)
        #print(paste0('[', Sys.time(), '] KO file created:', ko.file))
        output.data <- append(output.data, paste0('[', Sys.time(), ']I|  KO file created:', ko.file))

        # release temporary memory
        rm(ko.df)
      }
      else
      {
        # create empty file but with the tag <Observations />
        ko.handle <- file(ko.file)
        cat('<Observations />', file = ko.handle, sep="\n")
        close(ko.handle)
        print (paste0('[', Sys.time(), ']I| Create EMPTY KO file - ', ko.file))
      }

      # transform the ok list to file
      if (i.ok > 2)
      {
        ok.df <- do.call(rbind.data.frame, ok.list)

        # write the data.frame to a text file
        ok.file <- paste0(outputPath, "O.OK.", checksLevel, ".", date, ".xml")
        if (file.exists(ok.file)) file.remove(ok.file)

        write.table(ok.df, file=ok.file, sep="", row.names = FALSE, col.names = FALSE, quote=FALSE)
        #print(paste0('[', Sys.time() , '] OK file created:', ok.file))
        output.data <- append(output.data, paste0('[', Sys.time(), ']I|  OK file created:', ok.file))

        # release temporary memory
        rm(ok.df)
      }
      #return (TRUE)
    }
    , error = function(err)
    {
      #print ( paste0('[', Sys.time(), ']I|  XML.Split.Observations:', err))
      output.data <- append(output.data, paste0('[', Sys.time(), ']I|  XML.Split.Observations:', err))
      #return (FALSE)
    }
    )

  return (output.data)
}

#*********************************************************
# Split OK/KO records. This method will produce 2 output files:
#  - one with correct observation where the wrong values will be replaced by NA
#  - onw with wrong/suspicious values
# Parameters:
# xml.in      [INPUT] [XML]     XML with observation data
# checksLevel [INPUT] [STRING]  Checks level
# date        [INPUT] [INT]     Reference date
# outputPath  [INPUT] [STRING]  Path where to create the output files
#
#*********************************************************
XML.Split.Observations_PROD <- function(xml.in, checksLevel, date, outputPath)
{
  output.data <- character()
  tryCatch(
    {
      i.ko <- 1
      i.ok <- 1
      ko.list <- list("<Observations>")
      ok.list <- list("<Observations>")

      i.ko <- 2
      i.ok <- 2

      # retrieve all nodes and fetch them
      node.list <- getNodeSet(xml.in, "//Observation")
      if (length(node.list) > 0)
      {
        for (node.child in node.list)
        {
          # check if the node contains elements with Wrong and/or Suspicous status
          ws.nodes <- xpathSApply(node.child, ".//*[@Status=\"W\" or @Status=\"S\"]", xmlChildren)
          if (length(ws.nodes) > 0)
          {
            # add the node to the ko file
            ko.list[[i.ko]] <- saveXML((node.child))
            i.ko <- i.ko + 1

            # replace the wrong values with NA before to wright the record to the ok file
            wr.nodes <- xpathSApply(node.child, ".//*[@Status=\"W\"]", xmlChildren)
            if ( length (wr.nodes) > 0)
            {
              for (wr.node in wr.nodes)
              {
                xmlValue(wr.node) <- 'NA'
              }
            }
          }

          # write the record to OK file
          alert.nodes <- getNodeSet(node.child, ".//ALERT")
          if ( length(alert.nodes))
          {
            removeNodes(alert.nodes)
          }

          ok.list[[i.ok]] <- saveXML((node.child))
          i.ok <- i.ok + 1
        }
      }

      # close the lists
      ko.list[[i.ko]] <- "</Observations>"
      ok.list[[i.ok]] <- "</Observations>"

      # transform the ko list to file
      if (i.ko > 2)
      {
        # transform the list of strings into data.frame of strings
        ko.df <- do.call(rbind.data.frame, ko.list)

        # write the data.frame to a text file
        ko.file <- paste0(outputPath, "O.KO.", checksLevel, ".", date, ".xml")
        if (file.exists(ko.file)) file.remove(ko.file)

        write.table(ko.df, file=ko.file, sep="", row.names = FALSE, col.names = FALSE, quote=FALSE)
        #print(paste0('[', Sys.time(), '] KO file created:', ko.file))
        output.data <- append(output.data, paste0('[', Sys.time(), ']I|  KO file created:', ko.file))

        # release temporary memory
        rm(ko.df)
      }

      # transform the ok list to file
      if (i.ok > 2)
      {
        ok.df <- do.call(rbind.data.frame, ok.list)

        # write the data.frame to a text file
        ok.file <- paste0(outputPath, "O.OK.", checksLevel, ".", date, ".xml")
        if (file.exists(ok.file)) file.remove(ok.file)

        write.table(ok.df, file=ok.file, sep="", row.names = FALSE, col.names = FALSE, quote=FALSE)
        #print(paste0('[', Sys.time() , '] OK file created:', ok.file))
        output.data <- append(output.data, paste0('[', Sys.time(), ']I|  OK file created:', ok.file))

        # release temporary memory
        rm(ok.df)
      }
      #return (TRUE)
    }
    , error = function(err)
    {
      #print ( paste0('[', Sys.time(), ']I|  XML.Split.Observations:', err))
      output.data <- append(output.data, paste0('[', Sys.time(), ']I|  XML.Split.Observations:', err))
      #return (FALSE)
    }
  )

  return (output.data)
}


#*********************************************************
# Split the XML file for HeavyChecks observation. Create only the OK file
#
# xml.in    [INPUT]   [XML]     XML structure with HeavyChecks data
# file.name [INPUT]   [STRING]  full path of XML messages configurations file
#           [RETURN]  [LIST]    List of messages
#*********************************************************
XML.Split.HeavyChecks.Observations <- function(xml.in, xml.ok.filename)
{
  output.data <- character()
  tryCatch(
    {
      i.ok <- 1
      ok.list <- list("<Observations>")

      i.ok <- 2

      # retrieve all nodes and fetch them
      node.list <- getNodeSet(xml.in, "//Observation")
      if (length(node.list) > 0)
      {
        for (node.child in node.list)
        {
          # check if the node contains elements with Wrong and/or Suspicous status
          ws.nodes <- xpathSApply(node.child, ".//*[@Status=\"W\" or @Status=\"S\"]", xmlChildren)
          if (length(ws.nodes) > 0)
          {
            # replace the wrong values with NA before to wright the record to the ok file
            wr.nodes <- xpathSApply(node.child, ".//*[@Status=\"W\"]", xmlChildren)
            if ( length (wr.nodes) > 0)
            {
              for (wr.node in wr.nodes)
              {
                xmlValue(wr.node) <- 'NA'
              }
            }
          }

          # write the record to OK file
          alert.nodes <- getNodeSet(node.child, ".//ALERT")
          if ( length(alert.nodes))
          {
            removeNodes(alert.nodes)
          }

          ok.list[[i.ok]] <- saveXML((node.child))
          i.ok <- i.ok + 1
        }
      }

      # close the lists
      ok.list[[i.ok]] <- "</Observations>"

      # transform the ok list to file
      if (i.ok > 2)
      {
        ok.df <- do.call(rbind.data.frame, ok.list)

        # write the data.frame to a text file
        if (file.exists(xml.ok.filename)) file.remove(xml.ok.filename)

        write.table(ok.df, file=xml.ok.filename, sep="", row.names = FALSE, col.names = FALSE, quote=FALSE)
        #print(paste0('[', Sys.time() , '] OK file created:', ok.file))
        output.data <- append(output.data, paste0('[', Sys.time(), ']I|  OK file created:', xml.ok.filename))

        # release temporary memory
        rm(ok.df)
      }
    }
    , error = function(err)
    {
      #print ( paste0('[', Sys.time(), ']I|  XML.Split.Observations:', err))
      output.data <- append(output.data, paste0('[', Sys.time(), ']E|  XML.Split.HeavyChecks.Observations:', err))
      #return (FALSE)
    }
  )

  return (output.data)
}

#*********************************************************
# Load the XML file with messages configurations
# file.name [INPUT]   [STRING]  full path of XML messages configurations file
#           [RETURN]  [XML]     XML tree with messages configurations
#*********************************************************
Load.Xml.Messages <- function(file.name)
{
  xml.msg <- xmlParse(file.name, useInternalNodes=TRUE)
  return (xml.msg)
}

#*********************************************************
# Retrieve aggregation column
# Parameters :
#  - agg.config    [INPUT]  [STRING]	- String with XML aggregation configuration
#                  [RETURN] [VECTOR]  - vector with aggregation column (properties)
#*********************************************************
RetrieveAggregationColumnNames <- function(agg.config)
{
  xml.agg <- xmlParse(agg.config)
  prop.nodes <- getNodeSet(xml.agg, "//Property")
  agg.columns <- c()
  for(pn in prop.nodes)
  {
    agg.columns <- c(agg.columns, xmlValue(getNodeSet(pn, "Name")[[1]]))
  }
  return (agg.columns)
}

#*******************************************************************
#                         DEPRECATED
#*******************************************************************
OLD.Split.XML.OK.Observations <- function( xml.obs, d.obs)
{
  nodeList <- getNodeSet( xml.obs, "//Observation")
  if (!is.null(nodeList))
  {
    for (node.child in nodeList)
    {
      addChildren(d.obs, node.child)
    }
  }

  return (d.obs)
}


### Split hourly observation into KO files
# xml.obs [INPUT] [XML] xml with hourly observations
# d.obs   [INPUT] [XML] xml with KO data
# [RETURN] d.obs changed
Old.Split.XML.KO.Observations <- function( xml.obs, d.obs)
{
  nodeList <- getNodeSet( xml.obs, "//Observation[ALERT/@Status=\"?\"]")
  if (!is.null(nodeList))
  {
    for (node.child in nodeList)
    {
      addChildren(d.obs, xmlParent(node.child))
    }
  }

  return (d.obs)
}
