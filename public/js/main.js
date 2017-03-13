$(document).ready(function() {
  
  // Place JavaScript code here...

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
          var orderListCount = result.orderList.length;
          var historyListCount = result.historyList.length;
          localStorage.orderCount = orderListCount + historyListCount;
          setOrderCount();
          setOrderLink();
        } else {
          var orderListCount = result.orderList.length;
          var historyListCount = result.historyList.length;
          localStorage.orderCount = orderListCount + historyListCount;
          var orderCounts = $('.order-count');
          orderCounts.each(function(){
            var orderListCount = result.orderList.length;
            var historyListCount = result.historyList.length;
            $(this)[0].innerText = orderListCount + historyListCount;
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

  function reDrawPrice(result){
    var orderList = result.orderList;
    var orderTotalPrice = 0;
    var historyList = result.historyList;
    orderList.forEach(function(item){
      var cartItem = item.cartItemId;
      var itemCount = $('.cart-item-count[data-cart-item-id = '+cartItem._id+']')[0];
      var itemPrice = $('#'+cartItem._id+'-price')[0];
      var itemDiscount = $('#'+cartItem._id+'-discount')[0];
      var itemTotal = $('#'+cartItem._id+'-total')[0];
      itemCount.value = item.count;
      itemPrice.innerText = cartItem.price;
      if (itemDiscount){
        itemDiscount.innerText = cartItem.discount;
      }
      var total = Math.round(cartItem.price*item.count/((cartItem.discount+100)/100));
      itemTotal.innerText = total;
      
      orderTotalPrice += total;
    });
    historyList.forEach(function(item){
      var cartItem = item.cartItemId;
      var itemCount = $('.cart-item-count[data-cart-item-id = '+cartItem._id+']')[0];
      var itemPrice = $('#'+cartItem._id+'-price')[0];
      var itemDiscount = $('#'+cartItem._id+'-discount')[0];
      var itemTotal = $('#'+cartItem._id+'-total')[0];
      itemCount.value = item.count;
      itemPrice.innerText = cartItem.price;
      if (itemDiscount){
        itemDiscount.innerText = cartItem.discount;
      }
      var total = Math.round(cartItem.price*item.count/((cartItem.discount+100)/100));
      itemTotal.innerText = total;
      
      orderTotalPrice += total;
    });
    $('#total')[0].innerText = orderTotalPrice;
  }

  function changeCartItemCount(e){
    e.preventDefault();
    if (e.target.attributes['data-cart-item-id']){
      var cartItemId = e.target.attributes['data-cart-item-id'].value;
      var cartItemCount = e.target.value;
      var orderId = localStorage.orderId ? localStorage.orderId : null;
      $.ajax({
        url: '/order/change', 
        method: 'POST',
        data: {
          cartItemId,
          cartItemCount, 
          orderId
        },
        beforeSend: function(request) {
          return request.setRequestHeader('X-CSRF-Token', $("meta[name='csrf-token']").attr('content'));
        }
      })
      .done(function(result){
        reDrawPrice(result);
      })
      .fail(function (err) {
        console.log(err);
      });
    }
  }

  function deleteCartItem(e) {
    e.preventDefault();
    if (e.target.attributes['data-cart-item-id']){
      var cartItemId = e.target.attributes['data-cart-item-id'].value;
      var cartItem = $('.order-cart-item[data-cart-item-id = '+cartItemId+']');
      var orderId = localStorage.orderId ? localStorage.orderId : null;
      $.ajax({
        url: '/order/item-delete',
        method: 'POST',
        data: {
          cartItemId,
          orderId
        },
        beforeSend: function(request) {
          return request.setRequestHeader('X-CSRF-Token', $("meta[name='csrf-token']").attr('content'));
        }
      })
      .done(function(result){
        var orderListCount = result.orderList.length;
        var historyListCount = result.historyList.length;
        localStorage.orderCount = orderListCount + historyListCount;
        cartItem.remove();
        setOrderCount();
        reDrawPrice(result);
      })
      .fail(function(err){
        console.log(err);
      });
    }
  }

  //addEventListeners
  //add handler add to cart
  var elements;
  elements = $('.cart-add-btn');
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', addToCart);
  }
  elements = $('.cart-item-count');
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('change', changeCartItemCount);
  }
  elements = $('[aria-label="Delete"]');
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', deleteCartItem);
  }
  
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

$(function(){
  var socket = io();
  $('#send-order').submit(function(){
    socket.emit('notify', localStorage.orderId);
  });
  socket.on('notify', function (msg) {
    $('#notify')[0].style.display = 'inline-block';
    $('#notify-audio')[0].play();
  });
});

