import logging
import os


def configure_logging() -> None:
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    logging.basicConfig(
        level=log_level,
        format='{"time":"%(asctime)s","level":"%(levelname)s","message":"%(message)s"}',
    )


def get_logger(name: str = "app") -> logging.Logger:
    return logging.getLogger(name)
