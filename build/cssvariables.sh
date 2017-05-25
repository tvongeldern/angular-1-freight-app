find dist -name '*.css' -exec sed -i "" 's/$blue/#809fff/g' {} \;
find dist -name '*.css' -exec sed -i "" 's/$red/#ff3333/g' {} \;
find dist -name '*.css' -exec sed -i "" 's/$yellow/#ffcc00/g' {} \;
find dist -name '*.css' -exec sed -i "" 's/$green/#47d147/g' {} \;

find dist -name '*.css' -exec sed -i "" 's/$white/#fff/g' {} \;
find dist -name '*.css' -exec sed -i "" 's/$black/#333/g' {} \;
find dist -name '*.css' -exec sed -i "" 's/$shadow-gray/#ACAEB4/g' {} \;

find dist -name '*.css' -exec sed -i "" 's/$desktop/screen and (min-width: 960px)/g' {} \;
find dist -name '*.css' -exec sed -i "" 's/$tablet/screen and (max-width: 959px) and (min-width: 505px)/g' {} \;
find dist -name '*.css' -exec sed -i "" 's/$mobile/screen and (max-width: 504px)/g' {} \;
