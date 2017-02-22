$(document).ready(function() {

  // Place JavaScript code here...

  // function ajax(options) {
  //   return new Promise(function(resolve, reject) {
  //     $.ajax(options).done(resolve).fail(reject);
  //   });
  // }

  

  //add to cart handler
  function addToCart(e) {
    e.preventDefault();
    if (e.target.attributes['data-product-id']){
      var cartItemId = e.target.attributes['data-product-id'].value;
      var orderId = localStorage.orderId ? localStorage.orderId : null;
      $.ajax({
        url: '/order/add', 
        method: 'POST',
        data: {
          cartItemId, 
          orderId
        },
        beforeSend: function(request) {
          return request.setRequestHeader('X-CSRF-Token', $("meta[name='csrf-token']").attr('content'));
        }
      }).done(function(result) {
        console.log(result);
        if (!localStorage.orderId || localStorage.orderId != result._id) {
          localStorage.orderId = result._id;
        }
      }).fail(function (err) {
        console.log(err);
      });
      // var products = localStorage.products ? JSON.parse(localStorage.products) : [];
      // products.push(cartItem);
      // localStorage.products = JSON.stringify(products);
      // var count = JSON.parse(localStorage.products).length;
      // setOrderCount(count);
    }
  }

  //addEventListeners
  //add handler add to cart
  var elements = $('.cart-add-btn');
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', addToCart);
  }
  // var order = $('#order');
  // order[0].addEventListener('click', showCart);
  
  //Breadcrumbs
  function getBreadcrumbs() {
  	var location = window.location;
  	var origin = location.origin;
  	var path = location.pathname;
  	var crumbs = (path != '/') ? path.split('/') : [];
  	var breadcrumb = $('#breadcrumb');
  	if (crumbs.length != 0){
  		var url = origin;
  		breadcrumb.append('<li><a href='+url+'>Главная</a></li>');
  		for (var i = 1; i < crumbs.length-1; i++) {
  			url += '/'+crumbs[i];
  			if (crumbs[i] != 'update' && crumbs[i] != 'delete' ){
          if (crumbs[i] == 'category'){
            crumbs[i] = 'Категории';
          } else if ($('#category-header')[0]){
            crumbs[i] = $('#category-header')[0].innerText;
          }
  				breadcrumb.append('<li><a href='+url+'>'+crumbs[i]+'</a></li>');
  			}
  		}

  		breadcrumb.append('<li class="active">'+$("#page-header")[0].innerText+'</li>');
  	} else {
  		breadcrumb.append('<li class="active">Главная</li>');
  	}
  }

  //Initialize
  function init() {
    getBreadcrumbs();
    //setOrderCount(getOrderCount());
  }

  init();

  var $nav = $('.greedy-nav');
  var $btn = $('.greedy-nav button');
  var $vlinks = $('.greedy-nav .visible-links');
  var $hlinks = $('.greedy-nav .hidden-links');

  var breaks = [];

  function updateNav() {
    
    var availableSpace = $btn.hasClass('hidden') ? $nav.width() : $nav.width() - $btn.width() - 30;

    // The visible list is overflowing the nav
    if($vlinks.width() > availableSpace) {

      // Record the width of the list
      breaks.push($vlinks.width());

      // Move item to the hidden list
      $vlinks.children().last().prependTo($hlinks);

      // Show the dropdown btn
      if($btn.hasClass('hidden')) {
        $btn.removeClass('hidden');
      }

    // The visible list is not overflowing
    } else {

      // There is space for another item in the nav
      if(availableSpace > breaks[breaks.length-1]) {

        // Move the item to the visible list
        $hlinks.children().first().appendTo($vlinks);
        breaks.pop();
      }

      // Hide the dropdown btn if hidden list is empty
      if(breaks.length < 1) {
        $btn.addClass('hidden');
        $hlinks.addClass('hidden');
      }
    }

    // Keep counter updated
    $btn.attr("count", breaks.length);

    // Recur if the visible list is still overflowing the nav
    if($vlinks.width() > availableSpace) {
      updateNav();
    }

  }

  // Window listeners

  $(window).resize(function() {
      updateNav();
  });

  $btn.on('click', function() {
    $hlinks.toggleClass('hidden');
  });

  updateNav();
  
});

