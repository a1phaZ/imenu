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
        if (!localStorage.orderId || localStorage.orderId != result._id) {
          localStorage.orderId = result._id;
          localStorage.orderCount = result.orderList.length;
          setOrderCount();
          setOrderLink();
        } else {
          localStorage.orderCount = result.orderList.length;
          var orderCounts = $('.order-count');
          orderCounts.each(function(){
            $(this)[0].innerText = result.orderList.length;
          });
          setOrderLink();
        }
      }).fail(function (err) {
        console.log(err);
      });
    }
  }

  function setOrderCount() {
    if (localStorage && localStorage.orderCount){
      var orderCounts = $('.order-count');
      orderCounts.each(function(){
        $(this)[0].innerText = localStorage.orderCount;
      });
    }
  }

  function setOrderLink() {
    if (localStorage && localStorage.orderId){
      var orders = $('.order');
      orders.each(function(){
        $(this).attr("href", '/order/'+localStorage.orderId);
      });
    } else {
      var orders = $('.order');
      orders.each(function(){
        $(this).removeAttr('href');
      });
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
    setOrderCount();
    setOrderLink();
  }

  init();
  
});

