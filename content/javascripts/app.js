;(function ($, window, undefined) {
  'use strict';

  var $doc = $(document),
      Modernizr = window.Modernizr;

  $(document).ready(function() {
    $.fn.foundationAlerts           ? $doc.foundationAlerts() : null;
    $.fn.foundationButtons          ? $doc.foundationButtons() : null;
    $.fn.foundationAccordion        ? $doc.foundationAccordion() : null;
    $.fn.foundationNavigation       ? $doc.foundationNavigation() : null;
    $.fn.foundationTopBar           ? $doc.foundationTopBar() : null;
    $.fn.foundationCustomForms      ? $doc.foundationCustomForms() : null;
    $.fn.foundationMediaQueryViewer ? $doc.foundationMediaQueryViewer() : null;
    $.fn.foundationTabs             ? $doc.foundationTabs({callback : $.foundation.customForms.appendCustomMarkup}) : null;
    $.fn.foundationTooltips         ? $doc.foundationTooltips() : null;
    $.fn.foundationMagellan         ? $doc.foundationMagellan() : null;
    $.fn.foundationClearing         ? $doc.foundationClearing() : null;
    $.fn.placeholder                ? $('input, textarea').placeholder() : null;
  });

  // UNCOMMENT THE LINE YOU WANT BELOW IF YOU WANT IE8 SUPPORT AND ARE USING .block-grids
  // $('.block-grid.two-up>li:nth-child(2n+1)').css({clear: 'both'});
  // $('.block-grid.three-up>li:nth-child(3n+1)').css({clear: 'both'});
  // $('.block-grid.four-up>li:nth-child(4n+1)').css({clear: 'both'});
  // $('.block-grid.five-up>li:nth-child(5n+1)').css({clear: 'both'});

  // Hide address bar on mobile devices (except if #hash present, so we don't mess up deep linking).
  if (Modernizr.touch && !window.location.hash) {
    $(window).load(function () {
      setTimeout(function () {
        window.scrollTo(0, 1);
      }, 0);
    });
  }

  // Set value to range or number depending on who changed
  $("input[type='range']").each(function() {
    var rangeInput = $(this);
    var numberInput = rangeInput.siblings("input[type='number']");
    rangeInput.on('change', function() {
      numberInput.val($(this).val());
      calculate();
    });
    numberInput.on('change', function() {
      rangeInput.val($(this).val());
      calculate();
    });
  });

  // Force numbers to be minimal 1
  $("input[type='number']").on('change', function() {
    var value = $(this).val();
    if(value < 1) {
      $(this).val(1);
      return;
    }
  });

  $(".instance_type").on('click', function() {
    var instance = $(this).find("input[type='radio']");
    $("#max_connections").val(instance.val());
    calculate();
  });

  $("#max_connections").on('change', function() {
    var value = $(this).val();
    var instance = $(".instance_type input[value='"+value+"']");
    if(instance.length > 0)
      instance.trigger('click');
    else
      calculate();
  });

  var calculate = function() {
    var max_connections = parseInt($("#max_connections").val());
    var web_dynos       = $("#dyno_web").val();
    var worker_dynos    = $("#dyno_worker").val();
    var web_threads     = $("#web_threads").val();
    var client_conn     = $("#redis_client_connections").val();
    var redis_reserved  = 2;

    var web_connections     = (web_dynos * (client_conn * web_threads));
    var concurrency         = (max_connections - web_connections - (redis_reserved * worker_dynos)) / worker_dynos;
    var server_connections  = concurrency + redis_reserved;

	web_connections = Math.floor(web_connections);
	concurrency = Math.floor(concurrency);
	server_connections = Math.floor(server_connections);
	
    var code_client_size = $("#code_initializer .lit:eq(0)");
    var code_server_size = $("#code_initializer .lit:eq(1)");
    var code_concurrency = $("#code_concurrency .lit:eq(0)");
    if(concurrency < 1) {
      $("#concurrency, #server_connection_size").html('impossible');
      var error = '???';
      code_concurrency.html(error);
      code_server_size.html(error);
      code_client_size.html(error);
    }
    else {
      $("#concurrency").html(concurrency);
      code_concurrency.html('<strong>' + concurrency + '</strong>');
      code_server_size.html('<strong>' + server_connections + '</strong>');
      code_client_size.html('<strong>' + client_conn + '</strong>');
      $("#server_connection_size").html(concurrency + redis_reserved);
    }
    //max connections = (Heroku worker count * (concurrency + 2 reserved connections)) + (web dyno count * (client connection size * unicorn worker_process size))
  };

  $("#redis_client_connections").on('change', calculate);
  $("pre").each(function() {
    var text = $(this).text();
    text = text.replace(/^[ \n\t]*|[ \n\t]*$/g, '');
    var line = text.match(/^(.*?)[$\n]/)[1];
    // Those that have `# foo.rb` as the first line, highlight.
    var m = line.match(/^# (.*\.([a-z]{2,3}))$/);
    if (m) {
      var rest = text.match(/\n((?:.|\n)*)$/m)[1];
      $(this).addClass('has-caption');
      $(this).html("<h5>"+m[1]+"</h5>" + rest);
    }
  });
  prettyPrint();

  setTimeout(calculate, 100);

})(jQuery, this);
