Markup:

<utp-some-directive>

<utp-modal info="modalDetails" ng-if="showModal"></utp-modal>

</utp-some-directive>
__________________________________________________________________

someDirective's controller:

//modal showing by default
$scope.showModal = true;

$scope.modalDetails = {
	content: "<h1>I AM AN H1 IN A MODAL</h1>",
	hideMOdal: function(){
		$scope.showModal = false;
	}
}