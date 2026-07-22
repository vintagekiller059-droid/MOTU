"""Structured ANSI colored logging utility."""

import logging
import sys
from typing import Optional
from src.config import settings


class ColoredFormatter(logging.Formatter):
    """Color-coded console log formatter for fast terminal diagnostics."""

    COLOR_CODES = {
        logging.DEBUG: "\033[36m",     # Cyan
        logging.INFO: "\033[32m",      # Green
        logging.WARNING: "\033[33m",   # Yellow
        logging.ERROR: "\033[31m",     # Red
        logging.CRITICAL: "\033[41m",  # Red Background
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        color = self.COLOR_CODES.get(record.levelno, self.RESET)
        record.levelname = f"{color}{record.levelname:<8}{self.RESET}"
        return super().format(record)


def setup_logger(name: Optional[str] = "MOTU") -> logging.Logger:
    """Creates a configured logger instance."""
    logger = logging.getLogger(name)

    if not logger.handlers:
        logger.setLevel(settings.LOG_LEVEL.upper())
        handler = logging.StreamHandler(sys.stdout)
        
        formatter = ColoredFormatter(
            fmt="[%(asctime)s] | %(levelname)s | [%(name)s] -> %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.propagate = False

    return logger


logger = setup_logger("Core")