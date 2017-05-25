cat src/node/_head.js > dist/server.js && 
find src/node -name '*.node.js' -exec cat {} \; >> dist/server.js && 
cat src/node/_foot.js >> dist/server.js