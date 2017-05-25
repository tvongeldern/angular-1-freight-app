app.factory('viewport', function($window, constants){

    function isMobile(){
        return ($window.innerWidth <= constants.viewport.mobile);
    }

    function isTablet(){
        return ($window.innerWidth > constants.viewport.mobile && $window.innerWidth < constants.viewport.desktop);
    }

    function isDesktop(){
        return ($window.innerWidth >= constants.viewport.desktop);
    }

    return {
        isMobile,
        isTablet,
        isDesktop
    };

});
