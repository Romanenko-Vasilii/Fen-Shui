<?php

/* https://api.telegram.org/bot1733858509:AAHDVMSoc4v_P5doXO3YmcxAm7QVlDLvkNo/getUpdates,
где, XXXXXXXXXXXXXXXXXXXXXXX - токен вашего бота, полученный ранее */

$name = htmlspecialchars($_POST['userName']);
$phone = htmlspecialchars($_POST['userPhone']);
$userComment = htmlspecialchars($_POST['userComment']);
$token = "1733858509:AAHDVMSoc4v_P5doXO3YmcxAm7QVlDLvkNo";
$chat_id = "-555650130";

$basket = json_decode($_POST['basket_products']);
$productsStr = '';
$totalCost = 0;
foreach($basket as $product) {
  $productsStr .= "{$product->name} , {$product->sizeKind}, {$product->weight}, цена: {$product->price}, количество: {$product->quantity}";
  $totalCost += $product->price;
}

$arr = array(
  'Имя пользователя:' => $name,
  'Телефон:' => $phone,
  'Комментарий:' => $userComment,
  'Заказ' => $productsStr,
  'Итого' => $totalCost,
);



foreach($arr as $key => $value) {
  $txt .= "<b>".$key."</b> ".$value."%0A";
};

$sendToTelegram = fopen("https://api.telegram.org/bot{$token}/sendMessage?chat_id={$chat_id}&parse_mode=html&text={$txt}","r");

if ($sendToTelegram) {
  header('Location:sanks.html');
} else {
  echo "Error";
}
?>