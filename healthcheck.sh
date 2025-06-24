
#!/bin/sh

# Health check script for the application
set -e

# Check if the application is responding
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "Health check passed"
    exit 0
else
    echo "Health check failed"
    exit 1
fi
