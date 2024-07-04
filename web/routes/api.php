<?php


use App\Http\Controllers\ShopifyController;
use App\Http\Controllers\OshiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/', function () {
    return "Hello API";
});

define('CLIENT_SECRET', env('SHOPIFY_API_SECRET'));
function verify_webhook($data, $hmac_header)
{
    $calculated_hmac = base64_encode(hash_hmac('sha256', $data, CLIENT_SECRET, true));
    return hash_equals($calculated_hmac, $hmac_header);
}

// Customer Data Erasure Webhook
Route::post('/customers/redact', function () {
    $hmac_header = $_SERVER['HTTP_X_SHOPIFY_HMAC_SHA256'];

    $data = file_get_contents('php://input');
    $verified = verify_webhook($data, $hmac_header);
    error_log('Webhook verified: ' . var_export($verified, true));
    if ($verified) {
        # Process webhook payload
        # ...
        http_response_code(200);
    } else {
        response()->json('', 401)->send();
    }
});

// Customer Data request Webhook
Route::post('/customers/data_request', function () {

    $hmac_header = $_SERVER['HTTP_X_SHOPIFY_HMAC_SHA256'];

    $data = file_get_contents('php://input');
    $verified = verify_webhook($data, $hmac_header);
    error_log('Webhook verified: ' . var_export($verified, true));
    if ($verified) {
        # Process webhook payload
        # ...
        http_response_code(200);
    } else {
        response()->json('', 401)->send();
    }
});

// Customer Data request Webhook
Route::post('/redact/redact', function () {

    $hmac_header = $_SERVER['HTTP_X_SHOPIFY_HMAC_SHA256'];

    $data = file_get_contents('php://input');
    $verified = verify_webhook($data, $hmac_header);
    error_log('Webhook verified: ' . var_export($verified, true));
    if ($verified) {
        # Process webhook payload
        # ...
        http_response_code(200);
    } else {
        response()->json('', 401)->send();
    }
});


// Routes for shopify
Route::group(['middleware' => 'shopify.auth',  'prefix' => 'shopify'], function () {

    Route::get('orders', [ShopifyController::class, 'getOrders']);
});



//Routes for Oshi
Route::group(['middleware' => 'shopify.auth',  'prefix' => 'oshi'], function () {

    Route::get('data', [OshiController::class, 'getData']);
    Route::post('push-order', [OshiController::class, 'pushOrder']);
    Route::post('client-validate', [OshiController::class, 'clientValidate']);
    Route::get('check-crendentials', [OshiController::class, 'checkCredentials']);
});
