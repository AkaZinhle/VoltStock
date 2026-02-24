
import os
from pathlib import Path

BASE_DIR = Path.cwd()
print(f"Propable Backend Dir (CWD): {BASE_DIR}")
ROOT_DIR = BASE_DIR.parent
print(f"Probable Root Dir: {ROOT_DIR}")

print("\n--- Backend Dir Files ---")
try:
    for f in BASE_DIR.iterdir():
        print(f.name)
except Exception as e:
    print(e)
    
print("\n--- Root Dir Files ---")
try:
    for f in ROOT_DIR.iterdir():
        print(f.name)
except Exception as e:
    print(e)
