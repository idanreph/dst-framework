#!/bin/bash
# run-test.sh
# Runs the DST scanner against the bad-code-test.js demo file
# and compares output to expected-output.txt

set -e

echo "=== DST Framework Demo ==="
echo "Running scanner on: demo/bad-code-test.js"
echo ""

node tools/dst-scanner.js demo/bad-code-test.js

echo ""
echo "=== Expected Output ==="
cat demo/expected-output.txt
