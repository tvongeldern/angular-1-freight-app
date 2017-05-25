echo setting permissons &&
chmod +x build/*.sh &&
echo permissions set &&

echo building page markup... &&
./build/pages.sh &&
echo page markup built &&

echo building module scripts... &&
./build/modulescripts.sh &&
echo module scripts built &&

echo building module templates... &&
./build/moduletemplates.sh &&
echo module templates built &&

echo building common files... &&
./build/commonfiles.sh &&
echo common files built &&

echo building module css... &&
./build/modulecss.sh &&
echo module css built &&

echo building back end node scripts... &&
./build/nodes.sh &&
echo back end node scripts built &&

echo building server config example... &&
./build/serverconfigbuild.sh &&
echo server config example built &&

echo converting css variables... &&
./build/cssvariables.sh &&
echo css variables converted &&

echo synching sql queries... &&
./build/sqlqueries.sh &&
echo sql queries synched &&

date &&
echo '' && 
echo SUCCESSFUL BUILD! &&
echo ''
