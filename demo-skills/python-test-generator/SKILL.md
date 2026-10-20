---
name: python-test-generator
description: Generates Python unit tests with pytest. Use when the user asks to write, generate, or add pytest unit tests for Python code.
---

# Python Test Generator

## Procedure

1. Read the Python module that the user names.
2. Identify each public function and class.
3. Create one test file for each module. Name it test_<module>.py.
4. Write one test for each normal case, edge case, and error case.
5. Use pytest fixtures for shared setup.
6. Use pytest.raises for expected exceptions.
7. Use parametrize for inputs that share one test body.
8. Run pytest on the new file. Report the result.

## Rules

- Do not change the code under test.
- Do not use external services or credentials.
- Use only the Python standard library and pytest.
