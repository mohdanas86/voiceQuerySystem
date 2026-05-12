from __future__ import annotations

from typing import Any, Dict, Optional

from app.schemas.error import ErrorDetail, ErrorResponse


def build_error_response(
    code: str,
    message: str,
    request_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> ErrorResponse:
    return ErrorResponse(
        error=ErrorDetail(code=code, message=message, details=details),
        request_id=request_id,
    )
