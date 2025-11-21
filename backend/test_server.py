from fastapi import FastAPI, APIRouter
from routes import auth_router, profile_router, game_router

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Add a test route
@api_router.get("/test")
async def test():
    return {"message": "Test route works"}

# Include auth routes
api_router.include_router(auth_router)
api_router.include_router(profile_router)
api_router.include_router(game_router)

app.include_router(api_router)

if __name__ == "__main__":
    print("Routes in app:")
    for route in app.routes:
        if hasattr(route, 'path'):
            print(f'{getattr(route, "methods", "N/A")} {route.path}')
        else:
            print(f'Route: {route}')
            if hasattr(route, 'routes'):
                for subroute in route.routes:
                    if hasattr(subroute, 'path'):
                        print(f'  Sub: {getattr(subroute, "methods", "N/A")} {subroute.path}')