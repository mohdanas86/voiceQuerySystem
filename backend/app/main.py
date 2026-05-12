from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.routes.health import router as health_router
from app.api.routes.queries import router as queries_router
from app.core.config import get_settings
from app.core.database import close_mongo_connection, connect_to_mongo
from app.core.logger import configure_logging, get_logger
from app.core.security import setup_cors
from app.middleware.request_id import RequestIdMiddleware
from app.middleware.request_logging import RequestLoggingMiddleware
from app.schemas.error import ErrorDetail, ErrorResponse


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging()

    app = FastAPI(title=settings.app_name, version="0.1.0")
    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(RequestLoggingMiddleware)
    setup_cors(app, settings)

    app.include_router(health_router, prefix=settings.api_v1_prefix)
    app.include_router(queries_router, prefix=settings.api_v1_prefix)

    @app.on_event("startup")
    async def on_startup() -> None:
        await connect_to_mongo(settings)

    @app.on_event("shutdown")
    async def on_shutdown() -> None:
        await close_mongo_connection()

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger = get_logger("error")
        logger.exception("unhandled_exception")
        request_id = getattr(request.state, "request_id", None)
        error = ErrorResponse(
            error=ErrorDetail(code="server_error", message="Unexpected server error"),
            request_id=request_id,
        )
        return JSONResponse(status_code=500, content=error.model_dump())

    return app


app = create_app()
