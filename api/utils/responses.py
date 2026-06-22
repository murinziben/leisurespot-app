from fastapi.responses import JSONResponse


def success(data=None, message: str = "Success", status_code: int = 200):
    return JSONResponse(
        status_code=status_code,
        content={"success": True, "message": message, "data": data},
    )


def error(message: str = "Error", status_code: int = 400, details=None):
    return JSONResponse(
        status_code=status_code,
        content={"success": False, "message": message, "details": details},
    )
