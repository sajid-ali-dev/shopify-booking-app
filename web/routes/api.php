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


// Routes for shopify
Route::group(['middleware' => 'shopify.auth',  'prefix' => 'shopify'], function () {

    Route::get('orders', [ShopifyController::class, 'getOrders']);
});



//Routes for Oshi
Route::group(['middleware' => 'shopify.auth',  'prefix' => 'oshi'], function () {

    Route::get('data', [OshiController::class, 'getData']);
    Route::post('push-order', [OshiController::class, 'pushOrder']);
});
