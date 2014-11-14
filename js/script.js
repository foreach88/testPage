var nav = document.getElementById('nav');
var choice = document.querySelectorAll('.choice');
var options = document.querySelectorAll('.options');
var cardNumbers = document.querySelectorAll('.cardNumber');
var cardHolder = document.querySelector('.cardHolder');
var getNextElement = makeNextElementSiblingForOldIe();
var i, j, len, key, val, elem;

//Событие изменения разрешения экрана
window.onresize = function() {
	
	//Устраняет проблему с высотой раскрытого меню и изменением разрешения браузера
	if(document.body.clientWidth > 641) nav.style.height = '';
}

//Событие раскрывания - закрывания меню при малом разрешении браузера
document.getElementById('menu').onclick = function() {
	if(nav.style.display) {
		var cur = nav.offsetHeight;
		
		var timerId = setInterval(function() {
			cur -= 10;
			cur = parseInt(nav.style.height = cur + 'px');
			if(cur <= 0) {
				nav.style.display = nav.style.height = '';
				clearTimeout(timerId);
			}
		}, 10);
	} else {
		nav.style.display = 'block';
		var height = nav.offsetHeight;
		cur = nav.style.height = 0;
		
		var timerId = setInterval(function() {
			cur += 10;
			cur = parseInt(nav.style.height = cur + 'px');
			if(cur >= height) {
				nav.style.height = height + 'px';
				clearTimeout(timerId);
			}
		}, 10);
	}
};

//Событие раскрывания-закрывания выпадающих списков
document.onclick = function(e) {
	e = fixEvent(e);

	//определяем произошел ли клик в .choice
	var target = e.target;
	while(target && target.className != 'choice') {
		target = target.parentNode;
	}
	
	//Клик произошел не вне .choice
	if(!target) {
		closeLists();
		return;
	}
	
	//Отмена выделения на выпадающих списках для lte IE9
	if(document.all && !window.atob) {
		target.onmousedown = target.onselectstart = function() {
			return false;
		}
	}
	
	var option = target.getElementsByTagName('ul')[0];
	var output = target.getElementsByTagName('output')[0];
	
	//обнуляем старые данные
	option.style.top = '';
	option.style.borderBottomWidth = '';
	
	option.style.zIndex = '1'; //для старых IE
	
	//Если список раскрывается, скрываем другие списки, которые открыты
	if(!option.style.display) closeLists();
	
	//Если нажали на LI, то берем из него значение
	if(e.target.tagName == 'LI') {
		output.innerHTML = e.target.innerHTML;
	}
	
	option.style.display ?  option.style.display = '' : option.style.display = 'block';
	
	//Проверяем наличие места внизу и если его мало выводим список сверху
	var coords = target.getBoundingClientRect();
	var distance = document.documentElement.clientHeight - coords.bottom;
	var height = option.offsetHeight;
	var indent = 20;
	
	if(distance < height + indent) {
		option.style.top = -height+1 + 'px';
		option.style.borderBottomWidth = '0';
	}
	
	//Скрываем все раскрытые списки
	function closeLists() {
		for(i=0, len=options.length; i<len; i++) {
			if(options[i].style.display) options[i].style.display = '';
		}
	}
}

//Установка значений по умолчанию для всех выпадающих списков
for(i=0, len=choice.length; i<len; i++) {
	choice[i].getElementsByTagName('output')[0].innerHTML = choice[i].querySelector('li').innerHTML;
}

//Валидация формы при нажатии на кнопку
document.querySelector('input[type="submit"]').onclick = function(e) {
	errors = {
		'cardNumber_1': false,
		'cardNumber_2': false,
		'cardNumber_3': false,
		'cardNumber_4': false,
		'cardHolder': false,
		'cvv': false
	};
	
	//Установка оформления для полей с ошибками
	function instalBorderColor(elem, val, elemName) {
		if(val) {
			elem.style.outline = '1px solid #ff3333';
			errors[elemName] = true;
		} else {
			elem.style.outline = '';
			errors[elemName] = false;
		}
	}
	
	//Ошибка для номера карты
	for(i=0, j=1, len=cardNumbers.length; i<len; i++, j++) {
			elem = cardNumbers[i];
			val = elem.value.match( /[^0-9]/ ) || !elem.value.length || elem.value.length != 4;	
			instalBorderColor(elem, !!val, 'cardNumber_' + j);
	}
	
	//Ошибка для имени держателя карты
	elem = cardHolder;
	val = elem.value.match( /[^a-zA-Z]/ ) || !elem.value.length || elem.value.length < 4;	
	instalBorderColor(elem, !!val, 'cardHolder');
	
	//Ошибка для CVV-кода
	elem = document.querySelector('.code');
	val = elem.value.match( /[^0-9]/ ) || !elem.value.length || elem.value.length != 3;	
	instalBorderColor(elem, !!val, 'cvv');
	
	//если есть ошибки - отменяем отправку формы
	for(key in errors) {
		if(errors[key]) return false;
	}
}

//Автофокусировка при вводе номера карты
for(i=0, len=cardNumbers.length; i<len; i++) {
	cardNumbers[i].onkeyup = function(e) {
		e = fixEvent(e);
		
		var nextElem = getNextElement(e.target);
		if(e.target.value.length == 4 && nextElem.tagName === 'INPUT') {
			nextElem.focus();
		}
	}
}

//Имитация placeholder в lte IE9
if(document.all && !window.atob){
	var placeholder = document.createElement('div');
	placeholder.style.position = 'absolute';
	placeholder.style.left = '25px';
	placeholder.style.bottom = '24px';
	placeholder.innerHTML = 'Держатель карты';
	placeholder.onclick = function() {
		placeholder.style.display = 'none';
		cardHolder.focus();
	};
	cardHolder.parentNode.appendChild(placeholder);
	
	cardHolder.onclick = function() {
		placeholder.style.display = 'none';
	};
	
	cardHolder.onblur = function() {
		if(cardHolder.value.length) return;
		placeholder.style.display = '';
	};
}

//Вспомогательные функции для lte IE8
function fixEvent(e) {
	e = e || window.event;
	
	if (!e.target) e.target = e.srcElement;

	return e;
}

function makeNextElementSiblingForOldIe() {
	return document.documentElement.nextElementSibling !== undefined ?

		function(elem) { 
			return elem.nextElementSibling;
		}
		:
		function(elem) {
			var current = elem.nextSibling;
			while(current && current.nodeType != 1) {	
				current = current.nextSibling;
			}
			return current;
		}
}