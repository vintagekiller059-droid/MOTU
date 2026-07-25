import sys
sys.path.insert(0, __import__("os").path.dirname(__file__))

from main import app

print("Registered routes:")
for route in app.routes:
    if hasattr(route, "methods"):
        methods = ",".join(route.methods)
        print(f"  {methods:10} {route.path}")