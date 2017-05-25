find src/js/modules/homepage -name '*_css.css' -exec cat {} \; >> dist/homepage.css &&
find src/js/modules/common -name '*_css.css' -exec cat {} \; >> dist/homepage.css &&

find src/js/modules/carrier -name '*_css.css' -exec cat {} \; >> dist/carrier/carrier.css &&
find src/js/modules/common -name '*_css.css' -exec cat {} \; >> dist/carrier/carrier.css &&

find src/js/modules/customer -name '*_css.css' -exec cat {} \; >> dist/customer/customer.css &&
find src/js/modules/common -name '*_css.css' -exec cat {} \; >> dist/customer/customer.css &&

find src/js/modules/driver -name '*_css.css' -exec cat {} \; >> dist/driver/driver.css &&
find src/js/modules/common -name '*_css.css' -exec cat {} \; >> dist/driver/driver.css
