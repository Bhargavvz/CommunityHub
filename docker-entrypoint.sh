#!/bin/sh
set -e

# Start backend server
echo "Starting backend server..."
cd /app/backend
node dist/index.js &

# Start frontend static server
echo "Starting frontend server..."
cd /app
npx serve -s public -l 3000 &

# Wait for any process to exit
wait -n
  
# Exit with status of process that exited first
exit $? 