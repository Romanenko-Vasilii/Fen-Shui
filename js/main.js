$(document).ready(function(){
  // бургер-меню
  $('.burger').on('click', function() {
    $('.info').slideToggle(300, function() {
      if($(this).css('display') === 'none') {
        $(this).removeAttr('style');
      }
    });
  });
  
 
  
// включение-выключение окна с заказом
  var modal = $('.modal'),
      modalBtn = $('[data-toggle=modal]'),
      closeBtn = $('.modal__close')

  modalBtn.on('click', function () {
    modal.toggleClass('modal--visible');
  });
  closeBtn.on('click', function () {
    modal.toggleClass('modal--visible');
  });

  function press(event) {
    if(event.keyCode == '27') {
      modal.removeClass('modal--visible');
    }
  }
  
  window.addEventListener('keydown', press, false);
//прокрутка якорю
  $('a[href^="#"]').click(function(){
      headHeight = $('.head').height();
      if(document.getElementById($(this).attr('href').substr(1)) != null) {
        headHeight = $('.head').height() + 150; 
      $('html, body').animate({ scrollTop: $($(this).attr('href')).offset().top - headHeight }, 1000); 
    }     
    return false;
  });


  // фиксирую меню при прокрутке
  var fixd = $('.header__head');
  $(window).scroll(function () {
		if ($(this).scrollTop() > 400) {
			fixd.addClass('fixd');
		} else {
			fixd.removeClass('fixd');
		}
	});

  var fixd__basket = $('.basket');
  $(window).scroll(function () {
		if ($(this).scrollTop() > 400) {
			fixd__basket.addClass('fixd__basket');
		} else {
			fixd__basket.removeClass('fixd__basket');
		}
	});

    const cookieName = 'basket';
    // объект корзины
    var basket = {};

    // функция добавления в корзину
    basket.add = function (product) {
        // добавляем объект продукта в массив корзины
        basket.products.push(product);
        // обновляем корзину в cookies
        basket.refreshCookie();
        // пересчитываем и показываем цену в корзине
        basket.refreshPrice();
        // добавляем товар в оформление заказа
        basket.addProductToOrder(product);
    };

    // считает сумму в корзине
    basket.getPrice = function () {
        var totalPrice = 0;
        // цикл по продуктам в корзине
        $.each(basket.products, function (key, product) {
            // прибавляем цену к сумме
            totalPrice += parseInt(product.price);
        });
        return totalPrice;
    };

    // отображение цены
    basket.refreshPrice = function () {
        var newPrice = basket.getPrice();
        // в краткой корзине
        fixd__basket.find('.total__price_amount').text(newPrice);
        // сумма в оформлении заказа
        $('#modal__total__price_amount').text(newPrice);
    };

    // обновляет инфу в оформлении заказа
    basket.refreshOrder = function () {
        $('#modal__product_list').html('');
        // цикл по продуктам в корзине
        $.each(basket.products, function (key, product) {
            // добавляем в заказ
            basket.addProductToOrder(product);
        });
    };

    // обновляет инфу в оформлении заказа
    basket.addProductToOrder = function (product) {
        var productStr = '' +
            '        <div class="modal__product">\n' +
            '          <div class="modal__product__img">\n' +
            '            <img class="product__img" src="' + product.img + '" alt="#">\n' +
            '          </div>\n' +
            '          <!-- /.modal__product__img -->\n' +
            '          <div class="modal__product__title">\n' +
            '            <span class="modal__product__name">' + product.name + '</span>' +
            '            <p class="modal__product__text modal__product__size_kind">' + product.sizeKind + '</p>\n' +
            '            <p class="modal__product__text">' + product.structure + '</p>\n' +
            '          </div>\n' +
            '          <!-- /.modal__product__title -->\n' +
            '          <div class="modal__buttom">\n' +
            '            <button class="add add__plus">+</button>\n' +
            '            <button class="add add__minus">&#8211</button>\n' +
            '          </div>\n' +
            '          <!-- /.modal__buttom -->\n' +
            '          <div class="quantity"> Количество <br> <span class="lot">' + product.quantity + '</span> </div>\n' +
            '          <!-- /.quantity -->\n' +
            '          <div class="modal__price"> Стоимость <span class="cost">' + product.price + ' р.</span></div>\n' +
            '          <!-- /.modal__price -->\n' +
            '          <div class="product__close"></div>\n' +
            '      </div>';

        $('#modal__product_list').append(productStr);
    };

    // ищет продукт в корзине по имени и размеру
    // возвращает индекс найденного продукта в массиве или false
    basket.searchProduct = function (prod) {
        for (var i = 0; i < basket.products.length; i++) {
            var product = basket.products[i];
            // ищем в массиве нужный продукт по совпадению имени и размера
            if (prod.name === product.name && prod.sizeKind === product.sizeKind) {
                return i;
            }
        }
        return false;
    };

    // ищет по переданному дочернему элементу dom и возвращает объект продукта из basket.products
    // @param childOfProdInDom - дочерний dom элемент продукта в оформлении заказа
    basket.searchProductInOrder = function (childOfProdInDom) {
        var parent = $(childOfProdInDom).parents('.modal__product');
        var prod = {};
        // ищем у продукта, количество которого меняем, название
        prod.name = parent.find('.modal__product__name').text().trim();
        // и размер
        prod.sizeKind = parent.find('.modal__product__size_kind').text().trim();

        return prod;
    };

    // возвращает количество конкретного продукта в корзине
    // prod может быть не полноценным объектом, а содержать лишь имя и размер, необходимые для поиска
    basket.getProductQuantity = function (prod) {
        var index = basket.searchProduct(prod);
        if (index !== false) {
            return basket.products[index].quantity;
        }

        return 0;
    };

    // добавляет или отнимает указанное quantity к количеству товара в корзине
    // чтобы отнять, нужно передавать quantity со знаком минус. Например чтобы отнять один ролл:
    // basket.changeQuantity(product, -1);
    // первым параметром принимает index товара в массиве basket.products
    basket.changeQuantity = function (index, quantity) {
        // считаем цену одного ролла
        var price = basket.products[index].price / basket.products[index].quantity;
        // меняем сумму
        basket.products[index].price += price * quantity;
        // меняем количество
        basket.products[index].quantity += quantity;
        // обновляем куки
        basket.refreshCookie();
        // обновляем сумму в краткой корзине и оформлении заказа
        basket.refreshPrice();
        // количество товара в оформлении заказа
        basket.refreshOrder();
    };

    // удаляет продукт
    // @param index индекс товара в массиве basket.products
    basket.removeProduct = function (index) {
        // удаляем из массива
        basket.products.splice(index, 1);
        // обновляем куки
        basket.refreshCookie();
        // обновляем сумму в краткой корзине и оформлении заказа
        basket.refreshPrice();
        // количество товара в оформлении заказа
        basket.refreshOrder();
    };

    // обновляет куки массивом из basket.products
    basket.refreshCookie = function () {
        // делаем из объекта строку json, чтобы хранить ее в cookies
        var newCookie = JSON.stringify(basket.products);
        // обновляем
        localStorage.setItem(cookieName, newCookie);
    };

    // добавление в корзину
    $('.buy').click(function () {
        // к родителю добавил .size_kind - это общий класс для small и big, чтобы проще было искать
        var size = $(this).parent('.size_kind');
        // временная примитивная валидация, чтобы не ломалась корзина если нет sizeKind
        if (size.length === 0) {
            console.log('Ошибка: у товара отсутствует размер');
            return false;
        }
        // собираем инфу о товаре
        var product = {}; // объект с данными о товаре

        // стандарт
        if (size.hasClass('small')) {
            product.sizeKind = 'стандарт';
            product.price = parseInt(size.find('.small__price').text().trim());    // этого дублирования кода можно избежать, если добавить общий класс для цены и веса (на будущее)
            product.weight = size.find('.small__gramm').text().trim();   // но, пока работает так
        }
        // большой
        else if (size.hasClass('big')) {
            product.sizeKind = 'большой';
            product.price = parseInt(size.find('.big__price').text().trim());    //   дублирование этого кода !!!!
            product.weight = size.find('.big__gramm').text().trim();   //
        }
        var wrapProduct = $(size).parents('.wrap__product');
        // ищем название товара
        product.name = wrapProduct.find('.product__title').text().trim();
        // картинка
        product.img = wrapProduct.find('.product__img').attr('src');
        // состав
        product.structure = wrapProduct.find('.product__structure').text().trim();
        // количество
        product.quantity = 1;
        // смотрим, был ли товар уже добавлен в корзину
        var index = basket.searchProduct(product);
        // если нет - добавляем в корзину
        if (index === false) {
            basket.add(product);
        }
        // иначе увеличиваем количество на один
        else {
            // увеличиваем количество
            basket.changeQuantity(index, 1);
        }
    });

    // нажатие + в детальной корзине
    $(document).on('click', '.add__plus', function () {
        // ищем продукт в dom в оформлении заказа
        var prod = basket.searchProductInOrder(this);
        // ищем индекс продукта в массиве товаров
        var index = basket.searchProduct(prod);
        // увеличиваем количество
        basket.changeQuantity(index, 1);
    });

    // нажатие - в детальной корзине
    $(document).on('click', '.add__minus', function () {
        // ищем продукт в dom в оформлении заказа
        var prod = basket.searchProductInOrder(this);
        // ищем индекс продукта в массиве товаров
        var index = basket.searchProduct(prod);
        // не уменьшаем количество если ролл один
        if (basket.products[index].quantity > 1) {
            // уменьшаем количество
            basket.changeQuantity(index, -1);
        }
    });

    // удаление продукта в детальной корзине
    $(document).on('click', '.product__close', function () {
        // ищем продукт в dom в оформлении заказа
        var prod = basket.searchProductInOrder(this);
        // ищем индекс продукта в массиве товаров
        var index = basket.searchProduct(prod);
        // удаляем продукт
        basket.removeProduct(index);
    });

    // массив с объектами продуктов (при первой загрузке страницы берется из cookies)
    basket.products = (localStorage.getItem(cookieName) != null) ? JSON.parse(localStorage.getItem(cookieName)) : [];
    // пересчитываем и показываем цену в корзине
    basket.refreshPrice();
    // обновляем продукты в оформлении заказа
    basket.refreshOrder();

    // перед отправкой формы добавляем в нее данные из корзины
    $('form').submit(function() {
        $('#basket_input').val(JSON.stringify(basket.products));
        localStorage.removeItem(cookieName);
    });
  
  // Валидация формы
  $('form').validate({
    errorClass: "invalid",
    rules: {
      // simple rule, converted to {required:true}
      userName: {
        required: true,
        minlength: 2,
        maxlength: 15
      },
      userPhone: "required",
      // compound rule
      
    },
    messages: {
      userName: {
        required: "Имя обязательно",
        minlength: "Имя не короче двух букв",
        maxlength: "Имя не длиннее 15 букв"
      },
      userPhone: "Телефон обязателен",
    }
  });
  // маска телефона (если +7, то из телеги нельзя позвонить)
  $('[type=tel]').mask('8(000) 000-00-00', {placeholder: "8(___) ___-__-__"});

  $(window).scroll(function () {
    // Если отступ сверху больше 170px то показываем кнопку "Наверх"
    if ($(this).scrollTop() > 200) {
        $('#button-up').fadeIn();
    } else {
        $('#button-up').fadeOut();
    }
});

/** При нажатии на кнопку мы перемещаемся к началу страницы, за 500 милисекунд */
$('#button-up').click(function () {
    $('body,html').animate({
        scrollTop: 0
    }, 500);
    return false;
});

  
});