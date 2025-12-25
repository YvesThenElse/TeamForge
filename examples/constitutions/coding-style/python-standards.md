---
name: Python Coding Standards
description: PEP 8 compliant Python coding standards with modern practices
category: coding-style
tags: [python, pep8, standards, backend]
---

# Python Coding Standards

## Style Guidelines (PEP 8)

### Formatting
- Use 4 spaces for indentation (never tabs)
- Maximum line length: 88 characters (Black default)
- Use blank lines to separate logical sections
- Two blank lines before top-level definitions

### Naming Conventions
```python
# Modules: short, lowercase, underscores if needed
import my_module

# Classes: CapWords (PascalCase)
class UserAccount:
    pass

# Functions/Variables: lowercase with underscores
def calculate_total(item_prices: list[float]) -> float:
    total_amount = sum(item_prices)
    return total_amount

# Constants: UPPER_CASE_WITH_UNDERSCORES
MAX_CONNECTIONS = 100
DEFAULT_TIMEOUT = 30

# Private: prefix with single underscore
def _internal_helper():
    pass

# "Dunder" methods for magic methods only
def __init__(self):
    pass
```

## Type Hints (Python 3.10+)

```python
from typing import Optional
from collections.abc import Callable, Sequence

def process_items(
    items: list[str],
    callback: Callable[[str], None] | None = None,
    limit: int = 10
) -> dict[str, int]:
    """Process items and return counts."""
    ...

# Use | instead of Union
def get_user(user_id: int) -> User | None:
    ...
```

## Docstrings

```python
def calculate_discount(
    price: float,
    percentage: float,
    min_price: float = 0.0
) -> float:
    """Calculate discounted price.

    Args:
        price: Original price in dollars.
        percentage: Discount percentage (0-100).
        min_price: Minimum allowed price after discount.

    Returns:
        The discounted price, never below min_price.

    Raises:
        ValueError: If percentage is not between 0 and 100.
    """
    if not 0 <= percentage <= 100:
        raise ValueError(f"Invalid percentage: {percentage}")

    discounted = price * (1 - percentage / 100)
    return max(discounted, min_price)
```

## Modern Python Features

### Use dataclasses for data containers
```python
from dataclasses import dataclass, field

@dataclass
class User:
    id: int
    name: str
    email: str
    roles: list[str] = field(default_factory=list)
```

### Use pathlib for file paths
```python
from pathlib import Path

config_path = Path.home() / ".config" / "app" / "settings.json"
if config_path.exists():
    content = config_path.read_text()
```

### Use context managers
```python
from contextlib import contextmanager

@contextmanager
def timer(name: str):
    start = time.time()
    yield
    print(f"{name} took {time.time() - start:.2f}s")
```

## Project Structure

```
project/
├── src/
│   └── package_name/
│       ├── __init__.py
│       ├── main.py
│       └── utils/
├── tests/
├── pyproject.toml
└── README.md
```

## Tools

- Formatter: `black` or `ruff format`
- Linter: `ruff` (replaces flake8, isort, etc.)
- Type checker: `mypy` or `pyright`
- Testing: `pytest`
