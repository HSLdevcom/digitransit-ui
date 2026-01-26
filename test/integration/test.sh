#/bin/bash
set -e

IMAGE=hsldevcom/digitransit-ui:$1

# Run the container in the background
CONTAINER_ID=$(docker run -d -p 8080:8080 -e CONFIG=tampere "$IMAGE")


# Run cleanup after script completes (either successfully or with an error)-
cleanup () {
    echo "Stop and remove the container..."
    docker rm -f "$CONTAINER_ID" > /dev/null
    echo "Container stopped and removed."
}
trap cleanup EXIT

# Wait for the server to be up (max 30s) and test that the server responds with 200 when accessing front page
echo "Waiting for server to start..."
for i in {1..30}; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ | grep -q 200; then
    break
  fi
  sleep 1
done

echo "Server started and front page returned 200 as expected."

echo "Checking that fetching assets that don't exist returns 404..."
# Check that missing assets return 404 so there is no risk of cdn cache corruption
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/assets/foo | grep -q 404
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/js/foo | grep -q 404
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/css/foo | grep -q 404
echo "Missing assets returned 404."
