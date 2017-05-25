cat src/js/_head.js > dist/homepage.js &&
find src/js/modules/homepage -name '*.js' -exec cat {} \; >> dist/homepage.js &&
find src/js/modules/common -name '*.js' -exec cat {} \; >> dist/homepage.js &&

cat src/js/_head.js > dist/carrier/carrier.js &&
find src/js/modules/carrier -name '*.js' -exec cat {} \; >> dist/carrier/carrier.js &&
find src/js/modules/common -name '*.js' -exec cat {} \; >> dist/carrier/carrier.js &&

cat src/js/_head.js > dist/customer/customer.js &&
find src/js/modules/customer -name '*.js' -exec cat {} \; >> dist/customer/customer.js &&
find src/js/modules/common -name '*.js' -exec cat {} \; >> dist/customer/customer.js &&

cat src/js/_head.js > dist/driver/driver.js &&
find src/js/modules/driver -name '*.js' -exec cat {} \; >> dist/driver/driver.js &&
find src/js/modules/common -name '*.js' -exec cat {} \; >> dist/driver/driver.js
