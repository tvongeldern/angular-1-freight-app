find dist -name "*_tmp.html" -delete &&

find src/js/modules/common/* -name '*_tmp.html' -exec cp {} dist \; &&
find src/js/modules/common/* -name '*_tmp.html' -exec cp {} dist/customer \; &&
find src/js/modules/common/* -name '*_tmp.html' -exec cp {} dist/carrier \; &&
find src/js/modules/common/* -name '*_tmp.html' -exec cp {} dist/driver \; &&

find src/js/modules/homepage/* -name '*_tmp.html' -exec cp {} dist \; &&

find src/js/modules/carrier/* -name '*_tmp.html' -exec cp {} dist/carrier \; &&

find src/js/modules/customer/* -name '*_tmp.html' -exec cp {} dist/customer \; && 

find src/js/modules/driver/* -name '*_tmp.html' -exec cp {} dist/driver \;
