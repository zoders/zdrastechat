import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')

# Важно: сначала инициализируем Django
django_asgi_app = get_asgi_application()

# Теперь импортируем routing (после инициализации)
import apps.chats.routing
from apps.chats.middleware import JwtAuthMiddlewareStack

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JwtAuthMiddlewareStack(
        URLRouter(apps.chats.routing.websocket_urlpatterns)
    ),
})
