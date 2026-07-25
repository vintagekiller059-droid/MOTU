import sys
import os

print("=" * 60)
print("PYTHON PATH:")
for i, p in enumerate(sys.path[:5]):
    print(f"  [{i}] {p}")

print("\n" + "=" * 60)
print("IMPORT DIAGNOSTICS")

# Import main and check its file
import main
print(f"\nmain.py location: {main.__file__}")
print(f"main.app title: {main.app.title}")

# Check routers package
import routers
print(f"\nrouters package location: {routers.__file__}")
print(f"routers package path: {routers.__path__}")

# List what's in the routers directory
router_dir = os.path.dirname(routers.__file__)
print(f"\nFiles in routers dir ({router_dir}):")
for f in sorted(os.listdir(router_dir)):
    print(f"  {f}")

# Check if health module exists
try:
    import routers.health as health_mod
    print(f"\nrouters.health location: {health_mod.__file__}")
    print(f"routers.health router routes: {len(health_mod.router.routes)}")
    for r in health_mod.router.routes:
        print(f"    {r.path}")
except Exception as e:
    print(f"\nrouters.health import FAILED: {e}")

# Check if chat module exists
try:
    import routers.chat as chat_mod
    print(f"\nrouters.chat location: {chat_mod.__file__}")
    print(f"routers.chat router routes: {len(chat_mod.router.routes)}")
    for r in chat_mod.router.routes:
        print(f"    {r.path}")
except Exception as e:
    print(f"\nrouters.chat import FAILED: {e}")

print("\n" + "=" * 60)
print("ALL REGISTERED ROUTES IN main.app:")
for route in main.app.routes:
    if hasattr(route, "methods"):
        methods = ",".join(route.methods)
        print(f"  {methods:12} {route.path}")