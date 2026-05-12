from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse

from app.schemas.error import ErrorDetail, ErrorResponse
from app.schemas.query import QueryCreate, QueryResponse

router = APIRouter(tags=["queries"])


@router.post("/queries", response_model=QueryResponse)
async def submit_query(payload: QueryCreate, request: Request):
    request_id = getattr(request.state, "request_id", None)
    error = ErrorResponse(
        error=ErrorDetail(
            code="not_implemented",
            message="Query submission not implemented yet",
        ),
        request_id=request_id,
    )
    return JSONResponse(status_code=status.HTTP_501_NOT_IMPLEMENTED, content=error.model_dump())
