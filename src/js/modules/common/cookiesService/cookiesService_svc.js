app.service("cookiesService", function(){

  return {

    tools: {

      set : function(name, value, options){

        var data = [encodeURIComponent(name) + '=' + encodeURIComponent(value)];

        if (options){

          if ('expiry' in options){
            if (typeof options.expiry == 'number'){
              options.expiry = new Date(options.expiry * 1000 + +new Date);
            }
            data.push('expires=' + options.expiry.toGMTString());
          }

          if ('domain' in options) data.push('domain=' + options.domain);
          if ('path'   in options) data.push('path='   + options.path);
          if ('secure' in options && options.secure) data.push('secure');

        }

        document.cookie = data.join('; ');

      },

      get : function(name, keepDuplicates){

        var values = [];

        var cookies = document.cookie.split(/; */);
        for (var i = 0; i < cookies.length; i ++){

          var details = cookies[i].split('=');
          if (details[0] == encodeURIComponent(name)){
            values.push(decodeURIComponent(details[1].replace(/\+/g, '%20')));
          }

        }

        return (keepDuplicates ? values : values[0]);

      },

      clear : function(name, options){

        if (!options) options = {};
        options.expiry = -86400;
        this.set(name, '', options);

      }

    }


  }

});

