#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Doctor T's Birthday Quiz..."
python3 -m http.server 8000 --directory dist & 
sleep 2
open "http://localhost:8000"
echo "The quiz is now open in your browser."
echo "Press Ctrl+C in this window to stop the server when you are finished."
wait
