document.addEventListener('deviceready', function(){
	function auth(token){
		alert(token);
		if(token.length==0){
			window.location.replace("index.html");
		}
	};

	auth(window.localStorage.getItem('tokenDMG'));
});