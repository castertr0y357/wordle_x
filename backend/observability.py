import os
import sys
import json
import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

APP_NAME = "wordle-x"
_debug_enabled = os.environ.get("LOG_LEVEL", "INFO").upper() == "DEBUG" or os.environ.get("DEBUG_LOGGING", "").lower() in ("true", "1")

class LokiJsonFormatter(logging.Formatter):
    """Outputs standardized single-line JSON log events for Loki ingestion."""
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "app": APP_NAME,
            "logger": record.name,
            "correlation_id": getattr(record, "correlation_id", "none"),
            "action": getattr(record, "action", "general"),
            "message": record.getMessage(),
        }
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        context = getattr(record, "context", None)
        if context:
            log_entry["context"] = context
        return json.dumps(log_entry)

def setup_logger(name: str = "wordle_x") -> logging.Logger:
    app_logger = logging.getLogger(name)
    app_logger.setLevel(logging.DEBUG if _debug_enabled else logging.INFO)
    
    if not app_logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        if os.environ.get("CONSOLE_PRETTY", "").lower() in ("true", "1"):
            handler.setFormatter(logging.Formatter("[%(asctime)s] [%(levelname)s] [%(name)s] - %(message)s"))
        else:
            handler.setFormatter(LokiJsonFormatter())
        app_logger.addHandler(handler)
        app_logger.propagate = False
    return app_logger

logger = setup_logger()

def set_debug_logging(enabled: bool):
    global _debug_enabled
    _debug_enabled = enabled
    target_level = logging.DEBUG if enabled else logging.INFO
    logger.setLevel(target_level)
    logging.getLogger().setLevel(target_level)
    logger.info(f"[Settings] - [Observability] - Debug logging set to {enabled}", extra={"action": "observability.toggle_debug"})

def is_debug_enabled() -> bool:
    return _debug_enabled

class MetricsRegistry:
    """Lightweight in-memory Prometheus exposition registry."""
    def __init__(self):
        self.requests_total: Dict[str, int] = {}
        self.actions_total: Dict[str, int] = {}
        self.start_time = time.time()

    def record_request(self, method: str, path: str, status: int):
        # Normalize path to avoid high cardinality
        normalized_path = path.split("?")[0]
        if normalized_path.startswith("/api/game/") and len(normalized_path.split("/")) > 3:
            normalized_path = "/api/game/{id}"
        key = f'{APP_NAME}_http_requests_total{{method="{method}",path="{normalized_path}",status="{status}"}}'
        self.requests_total[key] = self.requests_total.get(key, 0) + 1

    def record_action(self, action: str, status: str = "success"):
        key = f'{APP_NAME}_actions_total{{action="{action}",status="{status}"}}'
        self.actions_total[key] = self.actions_total.get(key, 0) + 1

    def generate_metrics(self) -> str:
        lines = [
            f"# HELP {APP_NAME}_uptime_seconds Process uptime in seconds",
            f"# TYPE {APP_NAME}_uptime_seconds gauge",
            f"{APP_NAME}_uptime_seconds {round(time.time() - self.start_time, 2)}",
            f"# HELP {APP_NAME}_http_requests_total Total HTTP requests handled",
            f"# TYPE {APP_NAME}_http_requests_total counter"
        ]
        for k, v in sorted(self.requests_total.items()):
            lines.append(f"{k} {v}")
            
        lines.append(f"# HELP {APP_NAME}_actions_total Total domain actions executed")
        lines.append(f"# TYPE {APP_NAME}_actions_total counter")
        for k, v in sorted(self.actions_total.items()):
            lines.append(f"{k} {v}")
            
        return "\n".join(lines) + "\n"

metrics = MetricsRegistry()
