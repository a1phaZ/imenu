$(document).ready(function() {

  // Place JavaScript code here...
  function getBreadcrumbs() {
  	var location = window.location;
  	var origin = location.origin;
  	var path = location.pathname;
  	var crumbs = (path != '/') ? path.split('/') : [];
  	console.log(location);
  	console.log(crumbs);
  	var breadcrumb = $('#breadcrumb');
  	if (crumbs.length != 0){
  		var url = origin;
  		breadcrumb.append('<li><a href='+url+'>Главная</a></li>');
  		for (var i = 1; i < crumbs.length-1; i++) {
  			url += '/'+crumbs[i];
  			if (crumbs[i] != 'update' && crumbs[i] != 'delete' ){
  				breadcrumb.append('<li><a href='+url+'>'+crumbs[i]+'</a></li>');
  			}
  		}
  		breadcrumb.append('<li class="active">'+crumbs[crumbs.length-1]+'</li>');
  	} else {
  		breadcrumb.append('<li class="active">Главная</li>');
  	}
  }
  getBreadcrumbs();
});