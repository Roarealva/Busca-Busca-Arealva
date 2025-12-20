
# Instruções para Hospedagem Externa (Backend Real)

Este projeto foi construído utilizando React para o Frontend. Para que ele funcione com persistência real em um servidor (como uma Hostgator, KingHost, etc.), você precisará de um backend em PHP e um banco de dados MySQL.

## 1. Banco de Dados (MySQL)
Execute o script SQL fornecido anteriormente para criar as tabelas `users`, `properties` e `transactions`.

## 2. Token de Acesso Mercado Pago
Utilize o token de acesso fornecido para integrar a geração de PIX:
**Token:** `APP_USR-4603868128905509-111401-881eec61e4b08b6b3d4faba37345a8bb-78489368`

## 3. Exemplo de Integração PHP para PIX
Crie um arquivo `gerar_pix.php` no seu servidor:

```php
<?php
$access_token = 'APP_USR-4603868128905509-111401-881eec61e4b08b6b3d4faba37345a8bb-78489368';
$url = "https://api.mercadopago.com/v1/payments";

$data = [
    "transaction_amount" => 20.00,
    "description" => "Plano Mensal Busca Busca Arealva",
    "payment_method_id" => "pix",
    "payer" => [
        "email" => "cliente@exemplo.com",
        "first_name" => "Cliente",
        "last_name" => "Busca",
        "identification" => [
            "type" => "CPF",
            "number" => "12345678909"
        ]
    ]
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $access_token",
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);
curl_close($ch);

echo $response; // Este JSON contém a string do PIX para o Frontend
?>
```

## 4. Webhook para Confirmação
Configure a URL de notificação no painel do Mercado Pago para seu arquivo `webhook.php`. Quando o status mudar para `approved`, atualize o campo `status` do imóvel para `active` e defina o `expiryDate`.
