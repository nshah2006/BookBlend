from .auth import router as auth_router
from .books import router as books_router
from .challenges import router as challenges_router
from .health import router as health_router
from .library import router as library_router
from .profile import router as profile_router
from .recommendations import router as recommendations_router

__all__ = [
    "auth_router",
    "books_router",
    "challenges_router",
    "health_router",
    "library_router",
    "profile_router",
    "recommendations_router",
]
