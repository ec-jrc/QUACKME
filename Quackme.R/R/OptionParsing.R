#*********************************************************
#             Options & Log management Module
#*********************************************************
library("optparse")
library("stringr")

#*********************************************************
# Manage the option from the command line for the WeakChecks area
# RETURN [DATA.FRAME]
#*********************************************************
WeakChecks.Command.Parse <- function()
{
  option_list = list(
    make_option(c("-c", "--config"), type="character", default=NULL,
                help="Config path", metavar="character"),
    make_option(c("-i", "--input"), type="character", default=NULL,
                help="Input path", metavar="character"),
    make_option(c("-f", "--file"), type="character", default=NULL,
                help="Input file to process", metavar="character"),
    make_option(c("-d", "--date"), type="integer", default=NULL,
                help="Reference date - YYYYMMDD", metavar="integer"),
    make_option(c("-o", "--output"), type="character", default=NULL,
                help="Output path", metavar="character"),
    make_option(c("-t", "--hist"), type="character", default=NULL,
                help="History path", metavar="character"),
    make_option(c("-r", "--errfile"), type="character", default=NULL,
                help="(Optional) Error file name", metavar="character"),
    make_option(c("-l", "--log"), type="character", default=NULL,
                help="(Optional) Log path", metavar="character"),
    make_option(c("-n", "--cores"), type="character", default=NULL,
                help="(Optional) Numer of cores", metavar="character"),
    make_option(c("-m", "--merge"), type="character", default=NULL,
                help="(Optional) Merge input and history [Append]", metavar="character"),
    make_option(c("-s", "--mos"), type="character", default=NULL,
                help="(Optional) MOS path", metavar="character")

  );

  opt_parser = OptionParser(option_list=option_list);
  opt = parse_args(opt_parser);

  if (is.null(opt$config)){
    print_help(opt_parser)
    stop("The config path is mandatory !", call.=FALSE)
  }

  if (!dir.exists(file.path(opt$config, "."))){
    print_help(opt_parser)
    stop(paste0('The config path ', opt$config, ' does not exists !'), call.=FALSE)
  }

  if (is.null(opt$input)){
    print_help(opt_parser)
    stop("The input path is mandatory !", call.=FALSE)
  }

  if (!dir.exists(file.path(opt$input, ".")))
  {
    print_help(opt_parser)
    stop ( paste0('The input path ', opt$input, ' does not exists !'), call.=FALSE)
  }

  if (is.null(opt$file)){
    print_help(opt_parser)
    stop("The input file is mandatory !", call.=FALSE)
  }

  if (grepl(";", opt$file))
  {
    # need to split the file and check everyone
    files <- unlist(lapply(str_split(opt$file,";"), trimws))
    error.flag <- FALSE
    error.msg <- ''
    for (f in 1:length(files))
    {
      if (!file.exists(paste0(opt$input, files[f])))
      {
        error.flag <- TRUE
        error.msg <- paste0(error.msg, 'The input file ', files[f], ' does not exists on the path ', opt$input, ' !\n')
      }
    }
    if (error.flag)
    {
      stop ( error.msg )
    }
  }
  else if (!file.exists(paste0(opt$input, opt$file)))
  {
    print_help(opt_parser)
    stop ( paste0('The input file ', opt$file, ' does not exists on the path ', opt$input, ' !'), call.=FALSE)
  }

  if (is.null(opt$date)){
    print_help(opt_parser)
    stop("The referenced date is mandatory !", call.=FALSE)
  }

  if (!is.integer((opt$date)))
  {
    print_help(opt_parser)
    stop("The referenced date is not an integer value !", call.=FALSE)
  }

  if (is.null(opt$output)){
    print_help(opt_parser)
    stop("The output directory is mandatory !", call.=FALSE)
  }

  # create output directory if not exists
  if (!dir.exists(file.path(opt$output, ".")))
  {
    dir.create(opt$output, showWarnings = FALSE, recursive=TRUE)
  }

  if (!dir.exists(file.path(opt$output, ".")))
  {
    print_help(opt_parser)
    stop ( paste0('Output directory [', opt$output, '] does not exists!'), call.=FALSE)
  }

  # check if history path was specified
  if (is.null(opt$hist))
  {
    print_help(opt_parser)
    stop("The history directory is mandatory !", call.=FALSE)
  }

  # if the log path was not specified create the Log directory into the output path
  if (is.null(opt$log))
  {
    opt$log <- paste0(opt$output, 'Log/')

    # create the lof if not exists
    if (!dir.exists(file.path(opt$log, ".")))
    {
      dir.create(opt$log, showWarnings = FALSE, recursive=TRUE)
    }
  }
  else if (!dir.exists(file.path(opt$log, ".")))
  {
    # if the log path does not exists create id
    dir.create(opt$log)
  }

  if (!dir.exists(file.path(opt$log, ".")))
  {
    print_help(opt_parser)
    stop ( paste0('Log directory [', opt$log, '] does not exists!'), call.=FALSE)
  }

  # pass the error files list
  opt$errfile <- ifelse(is.null(opt$errfile), NA, opt$errfile)

  # if the number of cores was not specified pass NA
  if (is.null(opt$cores))
  {
    opt$cores <- NA
  }

  opt$merge <- ifelse (is.null(opt$merge), NA, opt$merge)
  if (!is.na(opt$merge) & !grepl("^[0-9]{1,}$", opt$merge))
  {
    print_help(opt_parser)
    stop ( paste0('Non numeric value [', opt$merge, '] for option -m!'), call.=FALSE)
  }

  opt$mos <- ifelse (is.null(opt$mos), NA, opt$mos)
  if (!is.na(opt$mos) & !dir.exists(file.path(opt$mos, ".")))
  {
    print_help(opt_parser)
    stop ( paste0('MOS path [', opt$mos, '] is missing!'), call.=FALSE)
  }

  # return the command line options like a data.frame
  cmd.options <- data.frame(matrix( c( opt$config, opt$input, opt$output, opt$log, opt$file, opt$hist, opt$errfile, opt$date, opt$cores, opt$merge, opt$mos), ncol = 11, nrow = 1))
  colnames(cmd.options) <- c("ConfigPath", "InputPath", "OutputPath", "LogPath", "InputFile", "HistoryPath", "ErrorFile", "ReferenceDate", "CoreNumber", "MergeInput", "MOSPath")
  return (cmd.options[1, ])
}

#*********************************************************
# Manage the option from the command line for the Aggregation module
# RETURN [DATA.FRAME]
#*********************************************************
Aggregation.Command.Parse <- function()
{
  option_list = list(
    make_option(c("-c", "--config"), type="character", default=NULL,
                help="Config path", metavar="character"),
    make_option(c("-i", "--input"), type="character", default=NULL,
                help="Input path", metavar="character"),
    make_option(c("-f", "--file"), type="character", default=NULL,
                help="Input file to process", metavar="character"),
    make_option(c("-r", "--region"), type="character", default="EUR",
                help="Region of interest (EUR|CHN)", metavar="character"),
    make_option(c("-o", "--output"), type="character", default=NULL,
                help="Output path", metavar="character"),
    make_option(c("-t", "--hist"), type="character", default=NULL,
                help="History path", metavar="character"),
    make_option(c("-l", "--log"), type="character", default=NULL,
                help="(Optional) Log path", metavar="character"),
    make_option(c("-n", "--cores"), type="character", default=NULL,
                help="(Optional) Numer of cores", metavar="character"),
    make_option(c("-s", "--mos"), type="character", default=NULL,
                help="(Optional) MOS path", metavar="character")

  );

  opt_parser = OptionParser(option_list=option_list);
  opt = parse_args(opt_parser);

  if (is.null(opt$config)){
    print_help(opt_parser)
    stop("The config path is mandatory !", call.=FALSE)
  }

  if (!dir.exists(file.path(opt$config, "."))){
    print_help(opt_parser)
    stop(paste0('The config path ', opt$config, ' does not exists !'), call.=FALSE)
  }

  if (is.null(opt$input)){
    print_help(opt_parser)
    stop("The input path is mandatory !", call.=FALSE)
  }

  # set default region to EUR
  if (is.null(opt$region))
  {
    opt$region <- "EUR"
  }
  else if ( ! (opt$region %in% c("EUR", "CHN")))
  {
    print_help(opt_parser)
    stop("Unrecognized region!", call.=FALSE)
  }

  if (is.null(opt$hist)){
    print_help(opt_parser)
    stop("The history path is mandatory !", call.=FALSE)
  }

  if (!dir.exists(file.path(opt$input, ".")))
  {
    print_help(opt_parser)
    stop ( paste0('The input path ', opt$input, 'does not exists !'), call.=FALSE)
  }

  if (is.null(opt$file)){
    print_help(opt_parser)
    stop("The input file is mandatory !", call.=FALSE)
  }

  if (!file.exists(paste0(opt$input, opt$file)))
  {
    print_help(opt_parser)
    stop ( paste0('The input file ', opt$file, ' does not exists on the path ', opt$input, ' !'), call.=FALSE)
  }

  if (is.null(opt$output)){
    print_help(opt_parser)
    stop("The output directory is mandatory !", call.=FALSE)
  }

  if (!dir.exists(file.path(opt$output, ".")))
  {
    stop ( paste0('Output directory [', opt$output, '] does not exists!'), call.=FALSE)
  }

  # if the log path was not specified create the Log directory into the output path
  if (is.null(opt$log))
  {
    opt$log <- paste0(opt$output, 'Log/')

    # create the lof if not exists
    if (!dir.exists(file.path(opt$log, ".")))
    {
      dir.create(opt$log)
    }
  }
  else if (!dir.exists(file.path(opt$log, ".")))
  {
    stop ( paste0('Log directory [', opt$log, '] does not exists!'), call.=FALSE)
  }

  # if the number of cores was not specified pass NA
  if (is.null(opt$cores))
  {
    opt$cores <- NA
  }

  opt$mos <- ifelse (is.null(opt$mos), NA, opt$mos)
  if (!is.na(opt$mos) & !dir.exists(file.path(opt$mos, ".")))
  {
    print_help(opt_parser)
    stop ( paste0('MOS path [', opt$mos, '] is missing!'), call.=FALSE)
  }

  # return the command line options like a data.frame
  cmd.options <- data.frame(matrix( c( opt$config, opt$input, opt$output, opt$log, opt$file, opt$hist, opt$cores, opt$mos, opt$region), ncol = 9, nrow = 1))
  colnames(cmd.options) <- c("ConfigPath", "InputPath", "OutputPath", "LogPath", "InputFile", "HistoryPath", "CoreNumber", "MOSPath", "RegionOfInterest")
  return (cmd.options[1, ])
}


#*********************************************************
# Manage the option from the command line for the HeavyChecks level
# RETURN [DATA.FRAME]
#*********************************************************
HeavyChecks.Command.Parse <- function()
{
  option_list = list(
    make_option(c("-c", "--config"), type="character", default=NULL,
                help="Config path", metavar="character"),
    make_option(c("-i", "--input"), type="character", default=NULL,
                help="Input path", metavar="character"),
    make_option(c("-f", "--file"), type="character", default=NULL,
                help="Input file to process", metavar="character"),
    make_option(c("-o", "--output"), type="character", default=NULL,
                help="Output path", metavar="character"),
    make_option(c("-l", "--log"), type="character", default=NULL,
                help="(Optional) Log path", metavar="character"),
#    make_option(c("-m", "--model"), type="character", default=NULL,
#                help="(Optional) Model source", metavar="character"),
    make_option(c("-t", "--hist"), type="character", default=NULL,
                help="(Optional) History path", metavar="character"),
    make_option(c("-n", "--cores"), type="character", default=NULL,
                help="(Optional) Numer of cores", metavar="character")

  );

  opt_parser = OptionParser(option_list=option_list);
  opt = parse_args(opt_parser);

  if (is.null(opt$config)){
    print_help(opt_parser)
    stop("The config path is mandatory !", call.=FALSE)
  }

  if (!dir.exists(file.path(opt$config, "."))){
    print_help(opt_parser)
    stop(paste0('The config path ', opt$config, ' does not exists !'), call.=FALSE)
  }

  if (is.null(opt$input)){
    print_help(opt_parser)
    stop("The input path is mandatory !", call.=FALSE)
  }

  if (!dir.exists(file.path(opt$input, ".")))
  {
    print_help(opt_parser)
    stop ( paste0('The input path ', opt$input, ' does not exists !'), call.=FALSE)
  }

  if (is.null(opt$file)){
    print_help(opt_parser)
    stop("The input file is mandatory !", call.=FALSE)
  }

  if (!file.exists(paste0(opt$input, opt$file)))
  {
    print_help(opt_parser)
    stop ( paste0('The input file ', opt$file, ' does not exists on the path ', opt$input, ' !'), call.=FALSE)
  }

  if (is.null(opt$output)){
    print_help(opt_parser)
    stop("The output directory is mandatory !", call.=FALSE)
  }

  if (!dir.exists(file.path(opt$output, ".")))
  {
    stop ( paste0('Output directory ', opt$output, ' does not exists!'), call.=FALSE)
  }

  # if the log path was not specified create the Log directory into the output path
  if (is.null(opt$log))
  {
    opt$log <- paste0(opt$output, 'Log/')

    # create the lof if not exists
    if (!dir.exists(file.path(opt$log, ".")))
    {
      dir.create(opt$log)
    }
  }
  else if (!dir.exists(file.path(opt$log, ".")))
  {
    stop ( paste0('Log directory ', opt$log, ' does not exists!'), call.=FALSE)
  }

  # check if the model file was specified
  #if (!is.null(opt$model))
  #{
  #  opt$model <- paste0(opt$config, opt$model)
  #  if (!file.exists(opt$model))
  #  {
  #    stop ( paste0('Model file ', opt$model, ' does not exists!'), call.=FALSE)
  #  }
  #}
  #else
  #{
  #  opt$model <- NA
  #}

  # check if the history path was specified
  if (!is.null(opt$hist))
  {
    if (!dir.exists(file.path(opt$hist, ".")))
    {
      stop ( paste0('History directory [', opt$hist, '] does not exists!'), call.=FALSE)
    }
  }
  else
  {
    opt$hist <- NA
  }

  # if the number of cores was not specified pass NA
  if (is.null(opt$cores))
  {
    opt$cores <- NA
  }

  # return the command line options like a data.frame
  cmd.options <- data.frame(matrix( c( opt$config, opt$input, opt$output, opt$log, opt$file, opt$hist, opt$cores), ncol = 7, nrow = 1))
  colnames(cmd.options) <- c("ConfigPath", "InputPath", "OutputPath", "LogPath", "InputFile", "HistoryPath", "CoreNumber")
  return (cmd.options[1, ])
}

#*********************************************************
# Manage the option from the command line for the ThresholdChecks level
# RETURN [DATA.FRAME]
#*********************************************************
ThresholdChecks.Command.Parse <- function()
{
  option_list = list(
    make_option(c("-c", "--config"), type="character", default=NULL,
                help="Config path", metavar="character"),
    make_option(c("-d", "--date"), type="integer", default=NULL,
                help="Reference date - YYYYMMDD", metavar="integer"),
    make_option(c("-i", "--input"), type="character", default=NULL,
                help="Input path", metavar="character"),
    make_option(c("-f", "--file"), type="character", default=NULL,
                help="Input file to process", metavar="character"),
    make_option(c("-t", "--hist"), type="character", default=NULL,
                help="History path", metavar="character"),
    make_option(c("-o", "--output"), type="character", default=NULL,
                help="Output path", metavar="character"),
    make_option(c("-l", "--log"), type="character", default=NULL,
                help="(Optional) Log path", metavar="character"),
    make_option(c("-n", "--cores"), type="character", default=NULL,
                help="(Optional) Numer of cores", metavar="character")

  );

  opt_parser = OptionParser(option_list=option_list);
  opt = parse_args(opt_parser);
  print (opt)

  if (is.null(opt$config)){
    print_help(opt_parser)
    stop("The config path is mandatory !", call.=FALSE)
  }

  if (!dir.exists(file.path(opt$config, "."))){
    print_help(opt_parser)
    stop(paste0('The config path ', opt$config, ' does not exists !'), call.=FALSE)
  }

  if (is.null(opt$date)){
    print_help(opt_parser)
    stop("The referenced date is mandatory !", call.=FALSE)
  }

  if (is.null(opt$input)){
    print_help(opt_parser)
    stop("The input path is mandatory !", call.=FALSE)
  }

  if (!dir.exists(file.path(opt$input, ".")))
  {
    print_help(opt_parser)
    stop ( paste0('The input path ', opt$input, ' does not exists !'), call.=FALSE)
  }

  if (is.null(opt$file)){
    print_help(opt_parser)
    stop("The input file is mandatory !", call.=FALSE)
  }

  if (!file.exists(paste0(opt$input, opt$file)))
  {
    print_help(opt_parser)
    stop ( paste0('The input file ', opt$file, ' does not exists on the path ', opt$input, ' !'), call.=FALSE)
  }

  # check if the history path was specified
  if (is.null(opt$hist))
  {
    print_help(opt_parser)
    stop("The history directory is mandatory !", call.=FALSE)
  }

  if (is.null(opt$output)){
    print_help(opt_parser)
    stop("The output directory is mandatory !", call.=FALSE)
  }

  if (!dir.exists(file.path(opt$output, ".")))
  {
    stop ( paste0('Output directory ', opt$output, ' does not exists!'), call.=FALSE)
  }

  # if the log path was not specified create the Log directory into the output path
  if (is.null(opt$log))
  {
    opt$log <- paste0(opt$output, 'Log/')

    # create the lof if not exists
    if (!dir.exists(file.path(opt$log, ".")))
    {
      dir.create(opt$log)
    }
  }
  else if (!dir.exists(file.path(opt$log, ".")))
  {
    stop ( paste0('Log directory ', opt$log, ' does not exists!'), call.=FALSE)
  }

  # if the number of cores was not specified pass NA
  if (is.null(opt$cores))
  {
    opt$cores <- NA
  }

  # return the command line options like a data.frame
  cmd.options <- data.frame(matrix( c( opt$config, opt$date, opt$output, opt$log, opt$input, opt$file, opt$hist, opt$cores), ncol = 8, nrow = 1))
  colnames(cmd.options) <- c("ConfigPath", "ReferenceDate", "OutputPath", "LogPath", "InputPath", "InputFile", "HistoryPath", "CoreNumber")
  return (cmd.options[1, ])
}

#*********************************************************
# Manage the option from the command line for the SConverter module
# RETURN [DATA.FRAME]
#*********************************************************
SConverter.Command.Parse <- function()
{
  option_list = list(
    make_option(c("-c", "--config"), type="character", default=NULL,
                help="Config path", metavar="character"),
    make_option(c("-f", "--file"), type="character", default=NULL,
                help="Input file to process", metavar="character"),
    make_option(c("-o", "--output"), type="character", default=NULL,
                help="Output path", metavar="character"),
    make_option(c("-d", "--date"), type="integer", default=NULL,
                help="Reference date (YYYYMMDD)", metavar="integer"),
    make_option(c("-l", "--log"), type="character", default=NULL,
                help="(Optional) Log path", metavar="character")

  );

  opt_parser = OptionParser(option_list=option_list);
  opt = parse_args(opt_parser);

  if (is.null(opt$config)){
    print_help(opt_parser)
    stop("The config path is mandatory !", call.=FALSE)
  }

  if (!dir.exists(file.path(opt$config, "."))){
    print_help(opt_parser)
    stop(paste0('The config path ', opt$config, ' does not exists !'), call.=FALSE)
  }

  if (is.null(opt$file)){
    print_help(opt_parser)
    stop("The input file is mandatory !", call.=FALSE)
  }

  if (!file.exists(paste0(opt$input, opt$file)))
  {
    print_help(opt_parser)
    stop ( paste0('The input file ', opt$file, ' does not exists on the path ', opt$input, ' !'), call.=FALSE)
  }

  if (is.null(opt$output)){
    print_help(opt_parser)
    stop("The output directory is mandatory !", call.=FALSE)
  }

  if (!dir.exists(file.path(opt$output, ".")))
  {
    stop ( paste0('Output directory ', opt$output, ' does not exists!'), call.=FALSE)
  }

  if (is.null(opt$date)){
    print_help(opt_parser)
    stop("The reference date is mandatory !", call.=FALSE)
  }

  if (!is.integer((opt$date)))
  {
    print_help(opt_parser)
    stop("The referenced date is not an integer value !", call.=FALSE)
  }

  # if the log path was not specified create the Log directory into the output path
  if (is.null(opt$log))
  {
    opt$log <- paste0(opt$output, 'Log/')

    # create the lof if not exists
    if (!dir.exists(file.path(opt$log, ".")))
    {
      dir.create(opt$log)
    }
  }
  else if (!dir.exists(file.path(opt$log, ".")))
  {
    stop ( paste0('Log directory ', opt$log, ' does not exists!'), call.=FALSE)
  }

  # return the command line options like a data.frame
  cmd.options <- data.frame(matrix( c( opt$config, opt$output, opt$log, opt$file, opt$date), ncol = 5, nrow = 1))
  colnames(cmd.options) <- c("ConfigPath", "OutputPath", "LogPath", "InputFile", "ReferenceDate")
  return (cmd.options[1, ])
}

#*********************************************************
# Manage the option from the command line for the TGenerator module
# RETURN [DATA.FRAME]
#*********************************************************
TGenerator.Command.Parse <- function()
{
  option_list = list(
    make_option(c("-m", "--mode"), type="character", default=NULL,
                help="Mode [Daily/Season]", metavar="character"),
    make_option(c("-c", "--config"), type="character", default=NULL,
                help="Config path", metavar="character"),
    make_option(c("-o", "--output"), type="character", default=NULL,
                help="Output path", metavar="character"),
    make_option(c("-l", "--log"), type="character", default=NULL,
                help="(Optional) Log path", metavar="character")
  );

  opt_parser = OptionParser(option_list=option_list);
  opt = parse_args(opt_parser);

  if (is.null(opt$mode)){
    print_help(opt_parser)
    stop("The mode is mandatory !", call.=FALSE)
  }

  if (is.null(opt$output)){
    print_help(opt_parser)
    stop("The output directory is mandatory !", call.=FALSE)
  }

  if (opt$mode == "DailyCokrig" & is.null(opt$config))
  {
    print_help(opt_parser)
    stop("The config path (-c) option is mandatory for DailyCokrig mode!", call.=FALSE)
  }

  if (!dir.exists(file.path(opt$output, ".")))
  {
    stop ( paste0('Output directory ', opt$output, ' does not exists!'), call.=FALSE)
  }

  # if the log path was not specified create the Log directory into the output path
  if (is.null(opt$log))
  {
    opt$log <- paste0(opt$output, 'Log/')

    # create the lof if not exists
    if (!dir.exists(file.path(opt$log, ".")))
    {
      dir.create(opt$log)
    }
  }
  else if (!dir.exists(file.path(opt$log, ".")))
  {
    stop ( paste0('Log directory ', opt$log, ' does not exists!'), call.=FALSE)
  }

  # return the command line options like a data.frame
  cmd.options <- data.frame(matrix( c( opt$mode, opt$config, opt$output, opt$log), ncol = 4, nrow = 1))
  colnames(cmd.options) <- c("Mode", "ConfigPath", "OutputPath", "LogPath")
  return (cmd.options[1, ])
}

#*********************************************************
# Manage the option from the command line of QUACKME program
# RETURN [DATA.FRAME]
#*********************************************************
Quackme.Command.Parse <- function()
{
  option_list = list(
    make_option(c("-c", "--config"), type="character", default=NULL,
                help="Config path", metavar="character"),
    make_option(c("-i", "--input"), type="character", default=NULL,
                help="Input path", metavar="character"),
    make_option(c("-f", "--file"), type="character", default=NULL,
                help="Input file to process", metavar="character"),
    make_option(c("-d", "--date"), type="integer", default=NULL,
                help="Reference date - YYYYMMDD", metavar="integer"),
    make_option(c("-o", "--output"), type="character", default=NULL,
                help="Output path", metavar="character"),
    make_option(c("-t", "--hist"), type="character", default=NULL,
                help="History path", metavar="character"),
    make_option(c("-r", "--errfile"), type="character", default=NULL,
                help="(Optional) Error file name", metavar="character"),
    make_option(c("-m", "--model"), type="character", default=NULL,
                help="(Optional) Model source", metavar="character"),
    make_option(c("-l", "--log"), type="character", default=NULL,
                help="(Optional) Log path", metavar="character")

  );

  opt_parser = OptionParser(option_list=option_list);
  opt = parse_args(opt_parser);
  print (opt)

  if (is.null(opt$config)){
    print_help(opt_parser)
    stop("The config path is mandatory !", call.=FALSE)
  }

  if (!dir.exists(file.path(opt$config, "."))){
    print_help(opt_parser)
    stop(paste0('The config path ', opt$config, ' does not exists !'), call.=FALSE)
  }

  if (is.null(opt$file)){
    print_help(opt_parser)
    stop("The input file is mandatory !", call.=FALSE)
  }

  if (!file.exists(paste0(opt$input, opt$file)))
  {
    print_help(opt_parser)
    stop ( paste0('The input file ', opt$file, ' does not exists on the path ', opt$input, ' !'), call.=FALSE)
  }

  if (is.null(opt$date)){
    print_help(opt_parser)
    stop("The reference date is mandatory !", call.=FALSE)
  }

  if (is.null(opt$output)){
    print_help(opt_parser)
    stop("The output directory is mandatory !", call.=FALSE)
  }

  if (!dir.exists(file.path(opt$output, ".")))
  {
    stop ( paste0('Output directory ', opt$output, ' does not exists!'), call.=FALSE)
  }

  # check if the history path was specified
  if (is.null(opt$hist))
  {
    print_help(opt_parser)
    stop("The history directory is mandatory !", call.=FALSE)
  }

  # check if the error file exist on the input path
  if (!is.null(opt$errfile))
  {
    if (!file.exists( paste0(opt$input, opt$errfile )))
    {
      stop ( paste0('Error file [', opt$errfile, '] does not exists on the input path [', opt$input , ']!'), call.=FALSE)
    }
  }
  else
  {
    opt$errfile <- NA
  }

  # check if the model file was specified
  if (!is.null(opt$model))
  {
    opt$model <- paste0(opt$config, opt$model)
    if (!file.exists(opt$model))
    {
      stop ( paste0('Model file ', opt$model, ' does not exists!'), call.=FALSE)
    }
  }
  else
  {
    opt$model <- NA
  }

  # if the log path was not specified create the Log directory into the output path
  if (is.null(opt$log))
  {
    opt$log <- paste0(opt$output, 'Log/')

    # create the lof if not exists
    if (!dir.exists(file.path(opt$log, ".")))
    {
      dir.create(opt$log)
    }
  }
  else if (!dir.exists(file.path(opt$log, ".")))
  {
    stop ( paste0('Log directory ', opt$log, ' does not exists!'), call.=FALSE)
  }

  # return the command line options like a data.frame
  cmd.options <- data.frame(matrix( c( opt$config, opt$input, opt$file, opt$date, opt$output, opt$hist, opt$errfile, opt$model, opt$log), ncol = 9, nrow = 1))
  colnames(cmd.options) <- c("ConfigPath", "InputPath", "InputFile", "ReferenceDate", "OutputPath", "HistoryPath", "ErrorFile", "ModelFile", "LogPath")
  return (cmd.options[1, ])
}

#*********************************************************
# Manage the option from the command line for the RRRGenerator area
# RETURN [DATA.FRAME]
#*********************************************************
RRR.Command.Parse <- function()
{
  option_list = list(
    make_option(c("-i", "--input"), type="character", default=NULL,
                help="Input path", metavar="character"),
    make_option(c("-d", "--date"), type="integer", default=NULL,
                help="Reference date - YYYYMMDD", metavar="integer"),
    make_option(c("-o", "--output"), type="character", default=NULL,
                help="Output path", metavar="character"),
    make_option(c("-r", "--hour"), type="integer", default=NULL,
                help="Type of hour interval [3|6]", metavar="integer"),
    make_option(c("-l", "--log"), type="character", default=NULL,
                help="(Optional) Log path", metavar="character"),
    make_option(c("-n", "--cores"), type="character", default=NULL,
                help="(Optional) Numer of cores", metavar="character"),
    make_option(c("-s", "--mos"), type="character", default=NULL,
                help="(Optional) MOS path", metavar="character")

  );

  opt_parser = OptionParser(option_list=option_list);
  opt = parse_args(opt_parser);

  if (is.null(opt$input)){
    print_help(opt_parser)
    stop("The input path is mandatory !", call.=FALSE)
  }

  if (!dir.exists(file.path(opt$input, ".")))
  {
    print_help(opt_parser)
    stop ( paste0('The input path ', opt$input, 'does not exists !'), call.=FALSE)
  }

  if (is.null(opt$date)){
    print_help(opt_parser)
    stop("The referenced date is mandatory !", call.=FALSE)
  }

  if (is.null(opt$output)){
    print_help(opt_parser)
    stop("The output directory is mandatory !", call.=FALSE)
  }

  if (!dir.exists(file.path(opt$output, ".")))
  {
    stop ( paste0('Output directory [', opt$output, '] does not exists!'), call.=FALSE)
  }

  if (is.null(opt$hour)){
    print_help(opt_parser)
    stop("The hour interval is mandatory !", call.=FALSE)
  }

  # if the log path was not specified create the Log directory into the output path
  if (is.null(opt$log))
  {
    opt$log <- paste0(opt$output, 'Log/')

    # create the lof if not exists
    if (!dir.exists(file.path(opt$log, ".")))
    {
      dir.create(opt$log)
    }
  }
  else if (!dir.exists(file.path(opt$log, ".")))
  {
    stop ( paste0('Log directory [', opt$log, '] does not exists!'), call.=FALSE)
  }

  # if the number of cores was not specified pass NA
  if (is.null(opt$cores))
  {
    opt$cores <- NA
  }

  opt$mos <- ifelse (is.null(opt$mos), NA, opt$mos)
  if (!is.na(opt$mos) & !dir.exists(file.path(opt$mos, ".")))
  {
    print_help(opt_parser)
    stop ( paste0('MOS path [', opt$mos, '] is missing!'), call.=FALSE)
  }

  # return the command line options like a data.frame
  cmd.options <- data.frame(matrix( c( opt$input, opt$output, opt$log, opt$date, opt$hour, opt$cores, opt$mos), ncol = 7, nrow = 1))
  colnames(cmd.options) <- c("InputPath", "OutputPath", "LogPath", "ReferenceDate", "HourInterval", "CoreNumber", "MOSPath")
  return (cmd.options[1, ])
}


#*********************************************************
# Save options to log file
# options   [INPUT] [DATA.FRAME]  data frame with options
# log.file  [INPUT] [FILE]        connection to a log file
#*********************************************************
Log.Options <- function (options, log.file)
{
  cat(paste0('[', Sys.time(), ']I| Command line options:'), file = log.file, sep="\n")
  for (col in 1:length(colnames(options)))
  {
    cat (paste0('[', Sys.time(), ']I|  ', colnames(options)[col], ':', options[1, col]), file = log.file, "\n")
  }
}
