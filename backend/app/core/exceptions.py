from fastapi import Request
from fastapi.responses import JSONResponse


async def global_exception_handler(
    request: Request,
    exc: Exception,
):
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=500,
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
        content={
            "success": False,
            "message": str(exc),
        },
    )