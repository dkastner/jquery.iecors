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
		return {
			send: function( headers, complete ) {
			  var xdr = s.xdr();

			  xdr.onload = function() {
				var headers = { 'Content-Type': xdr.contentType };
				complete(200, 'OK', { text: xdr.responseText }, headers);
			  };
			  
			  // Apply custom fields if provided
			  if(s.xhrFields) {
				xdr.onerror = s.xhrFields.error;
				xdr.ontimeout = s.xhrFields.timeout;
			  } else {
				//Needed to prevent hangup when not defined in IE
				xdr.onerror = function() {complete(404, 'Not Found')}
				xdr.ontimeout = function() {complete(408, 'Request Time-Out')}
			  }
			  xdr.timeout = 5000;
			  xdr.open( s.type, s.url );

			  // XDR has no method for setting headers O_o

			  xdr.send( ( s.hasContent && s.data ) || null );
			},

			abort: s.xdr().abort

		};
	     });
	}
})( jQuery );
