$(document).ready(function() {

  // Place JavaScript code here...

  //show cart function
  function showCart() {
    var xmlhttp = getXmlHttp();
    xmlhttp.open("POST", "/order", true);
    xmlhttp.onreadystatechange = function(){
      if (xmlhttp.readyState != 4) return
    }
    var lsProducts = localStorage.products ? localStorage.products : [];
    console.log(lsProducts);
    xmlhttp.send(lsProducts);
  }

  //add to cart handler
  function addToCart(e) {
    e.preventDefault();
    if (e.target.attributes['data-product-id']){
      var cartItem = e.target.attributes['data-product-id'].value;
      var products = localStorage.products ? JSON.parse(localStorage.products) : [];
      products.push(cartItem);
      localStorage.products = JSON.stringify(products);
      var count = JSON.parse(localStorage.products).length;
      setOrderCount(count);
    }
  }

  function setOrderCount(count) {
    $('#order-count')[0].innerText = count;
  }

  function getOrderCount() {
    if (localStorage){
      return localStorage.products ? JSON.parse(localStorage.products).length : 0;
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
    setOrderCount(getOrderCount());
  }

  init();
  
});