(function( jQuery ) {
  // Create the request object
  // (This is still attached to ajaxSettings for backward compatibility)
  jQuery.ajaxSettings.xdr = function() {
    return (window.XDomainRequest ? new window.XDomainRequest() : null);
  };

  // Determine support properties
  (function( xdr ) {
    jQuery.extend( jQuery.support, { iecors: !!xdr });
  })( jQuery.ajaxSettings.xdr() );

  // Create transport if the browser can provide an xdr
  if ( jQuery.support.iecors ) {

    jQuery.ajaxTransport(function( s ) {
      var callback;

      return {
        send: function( headers, complete ) {
          // Get a new xdr
          var xdr = s.xdr();

          xdr.onload = function() {
            var status, responseHeaders, statusText, responses;

            // Firefox throws exceptions when accessing properties
            // of an xdr when a network error occurred
            // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
            try {

              responses = {};
              // IE8 does not set status at all.
              status = xdr.status || 200;
              if (xdr.contentType) {
                responseHeaders = { 'Content-Type': xdr.contentType };
                if (xdr.contentType.toLowerCase().indexOf("application/json") == 0)
                  s.dataTypes.push("json");
              }

              // When requesting binary data, IE6-9 will throw an exception
              // on any attempt to access responseText (#11426)
              if ( typeof xdr.responseText === "string" ) {
                responses.text = xdr.responseText;
              }

              // Firefox throws an exception when accessing
              // statusText for faulty cross-domain requests
              try {
                statusText = xdr.statusText || "OK";
              } catch( e ) {
                // We normalize with Webkit giving an empty statusText
                status = 0;
                statusText = "";
              }

              // Filter status for non standard behaviors

              // If the request is local and we have data: assume a success
              // (success with no data won't get notified, that's the best we
              // can do given current implementations)
              if ( !status && s.isLocal && !s.crossDomain ) {
                status = responses.text ? 200 : 404;
              // IE - #1450: sometimes returns 1223 when it should be 204
              } else if ( status === 1223 ) {
                status = 204;
              }

            } catch( firefoxAccessException ) {
                    complete( -1, firefoxAccessException );
            }

            // Call complete if needed
            if ( responses ) {
                complete( status, statusText, responses, responseHeaders );
            }
          };
          
          // Apply custom fields if provided
          if ( s.xhrFields ) {
            xdr.onerror = s.xhrFields.error;
            xdr.ontimeout = s.xhrFields.timeout;
          }

          xdr.open( s.type, s.url );

          // XDR has no method for setting headers O_o

          xdr.send( ( s.hasContent && s.data ) || null );
        },

        abort: function() {
          xdr.abort();
        }
      };
    });
  }
})( jQuery );
