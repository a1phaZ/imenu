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
            $(this).attr('data-badge', orderListCount + historyListCount ); //innerText = orderListCount + historyListCount;
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
        $(this).attr('data-badge', localStorage.orderCount );
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

  function inWorkOrderItem(e) {
    e.preventDefault();
    if (e.target.attributes['data-order-item-id']){
      var orderItemId = e.target.attributes['data-order-item-id'].value;
      var status = e.target.className
      $.ajax({
        url: '/order/'+orderItemId+'/status',
        method: 'POST',
        beforeSend: function(request) {
          return request.setRequestHeader('X-CSRF-Token', $("meta[name='csrf-token']").attr('content'));
        }
      })
      .done(function(result){
        var label = $('span[data-order-item-id='+orderItemId+']');
        var button = $('button[data-order-item-id='+orderItemId+']');
        label.removeClass('label-success label-warning label-primary label-danger');
        button.removeClass('in-work out-work close btn-warning btn-primary btn-danger');
        switch (result.status){
          case 1:
            label.addClass('label-success');
            button.addClass('btn-success in-work');
            label.each(function(){
              this.innerText = 'Новый';
            });
            button.each(function(){
              this.innerText = 'Принят заказ в работу';
            });
            break;
          case 2: 
            label.addClass('label-warning');
            button.addClass('btn-primary out-work');
            label.each(function(){
              this.innerText = 'В работе';
            });
            button.each(function(){
              this.innerText = 'Выдать заказ';
            });
            break;
          case 3: 
            label.addClass('label-primary');
            button.addClass('btn-danger close');
            label.each(function(){
              this.innerText = 'Выдан';
            });
            button.each(function(){
              this.innerText = 'Закрыть заказ';
            });
            break;
          case 4: 
            label.addClass('label-danger');
            button.each(function(){
              this.style.display = 'none';
            });
            label.each(function(){
              this.innerText = 'Закрыт';
            });
            break;
        }

      })
      .fail(function(err){
        console.log(err);
      })
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
  elements = $('.in-work');
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', inWorkOrderItem);
  }
  elements = $('.out-work');
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', inWorkOrderItem);
  }
  elements = $('.close');
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', inWorkOrderItem);
  }
  elements=$('#btn-success');
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', closeNotify);
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
  		breadcrumb.append('<li class="breadcrumb-item"><a href='+url+'>Главная</a></li>');
  		for (var i = 1; i < crumbs.length-1; i++) {
  			url += '/'+crumbs[i];
  			if (crumbs[i] != 'update' && crumbs[i] != 'delete' ){
          if (crumbs[i] == 'category'){
            crumbs[i] = 'Категории';
          } else if ($('#category-header')[0]){
            crumbs[i] = $('#category-header')[0].innerText;
          }
  				breadcrumb.append('<li class="breadcrumb-item"><a href='+url+'>'+crumbs[i]+'</a></li>');
  			}
  		}

  		breadcrumb.append('<li class="active breadcrumb-item">'+$("#page-header")[0].innerText+'</li>');
  	} else {
  		breadcrumb.append('<li class="active breadcrumb-item">Главная</li>');
  	}
  }

  //Initialize
  $(function init() {
    var state = {
      order: {
        id: localStorage.orderId ? localStorage.orderId : null,
        count: localStorage.orderCount ? localStorage.orderCount: null
      }
    };
    $.ajax({
      url: '/state',
      method: 'GET',
      data: state,
      beforeSend: function(request) {
        return request.setRequestHeader('X-CSRF-Token', $("meta[name='csrf-token']").attr('content'));
      }
    })
    .done(function(result){
      if (!result.id){
        delete localStorage.orderId;
        delete localStorage.orderCount;
      } else {
        localStorage.orderId = result.id;
        localStorage.orderCount = result.count;
      }
      getBreadcrumbs();
      setOrderCount();
      setOrderLink();
    })
    .fail(function(err){
      console.log(err);
    });
  });


  /**
  * Обработка уведомлений
  */
  $(function(){
    var socket = io();
    $('#send-order').submit(function(){
      socket.emit('notify', 'Новый заказ');
    });
    $('#order-plz').click(function(){
      socket.emit('notify', 'Закрыть заказ');
    })
    socket.on('notify', function (msg) {
      var notify = $('.notify');
      var notifyAudio = $('#notify-audio')[0];
      if (notify){
        notify.each(function(){
          $(this)[0].style.display = 'inline-block';
        });
        if ($('span.message__title')[0]){
          $('span.message__title')[0].innerText = msg;
        }
        $('.message').fadeIn(400).delay(3000).fadeOut(400);
      }
      if (notifyAudio){
        $('#notify-audio')[0].play();
      }
    });
  });

  function closeNotify(e) {
    e.preventDefault();
    $('#success').attr('style', 'display: none;');
  }

  (function (arr) {
    for (var i = 0; i < arr.length; i++) {
      var el = arr[i];
      for (var c = 0; c < el.children.length; c++) {
        if (el.children[c].getAttribute('class').indexOf('btn-clear') || el.children[c].getAttribute('class').indexOf('clear-toast')) {
          (function () {
            var clear = el.children[c];
            clear.addEventListener('click', function (e) {
              e.preventDefault();
              clear.parentElement.setAttribute('class', clear.parentElement.getAttribute('class') + ' hide');
            });
            // return false
          })();
        }
      }
    }
  })(document.querySelectorAll('.toast'));


  // S3 Amazon
  (()=>{
    if (document.getElementById('file-input')){
      document.getElementById('file-input').onchange = () => {
        const files = document.getElementById('file-input').files;
        const file = files[0];
        if (file == null){
          return; //alert('No file selected.');
        }
        getSignedRequest(file);
      };
    }
  })();

  function getSignedRequest(file){
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/sign-s3?file-name=${file.name}&file-type=${file.type}`);
    xhr.onreadystatechange = () => {
      if(xhr.readyState === 4){
        if(xhr.status === 200){
          console.log(xhr.responseText);
          const response = JSON.parse(xhr.responseText);
          
          uploadFile(file, response.signedRequest, response.url);
        } else {
          alert('Could not get signed URL');
        }
      }
    };
    xhr.send();
  }

  function uploadFile(file, signedRequest, url){
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedRequest);
    console.log(xhr);
    xhr.onreadystatechange = () =>{
      console.log(xhr.readyState);
      if(xhr.readyState === 4){
        if(xhr.status === 200){
          console.log('uploaded');
          document.getElementById('preview').src = url;
          document.getElementById('avatar-url').value = url;
        }
      }
    }
    xhr.send(file);
  }

});


