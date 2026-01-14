#!/bin/bash
# Test Speechace API directly with curl

API_KEY="10aVYSlQ02QoQfzbzSuMFh/LijulCOxb/jf4upG2nDu/etq3VLi1BLDEfc9obrSNVofw09vJwM0blfjqUrz1JgCIJr9/Xfxvv4A1I19EZtR/lnKbmlzdF/okj2qDEM4G"
AUDIO_FILE="E:/github/hyteam/website-hoc-tieng-anh/backend/temp/audio/cloudinary-mp3-695d2d8f98f8851605b5bb38-0-1768379790261.mp3"
TEXT="I like to travel around the world"
USER_ID="test-user-123"

echo "Testing Speechace API..."
echo "API Key: ${API_KEY:0:30}..."
echo "Audio file: $AUDIO_FILE"
echo ""

curl -X POST "https://api2.speechace.com/api/scoring/text/v0.5/json" \
  -F "key=$API_KEY" \
  -F "text=$TEXT" \
  -F "user_audio_file=@$AUDIO_FILE" \
  -F "dialect=en-us" \
  -F "user_id=$USER_ID" \
  -v
