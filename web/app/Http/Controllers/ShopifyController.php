<?php

namespace App\Http\Controllers;

use App\Models\Session;

use Illuminate\Http\Request;
use App\Services\ShopifyService;
use App\Services\OshiService;
use Illuminate\Support\Facades\Log;

class ShopifyController extends Controller
{
    private $shopifyService;
    private $oshiService;

    public function __construct(ShopifyService $shopifyService, OshiService $oshiService)
    {
        $this->shopifyService = $shopifyService;
        $this->oshiService = $oshiService;
    }


    public function createLocationInShopify($shop, $redirectUrl)
    {


        $auth = Session::byShop($shop)->get(['id', 'shop', 'access_token']);


        $this->shopifyService->createLocationInShopify($auth->all());

        return redirect($redirectUrl);
    }


    public function getOrders(Request $request)
    {

        $session = $request->get(
            'shopifySession'
        );
        $auth = Session::byShop($session->getShop())->get(['id', 'shop', 'access_token']);

        $orders = $this->shopifyService->getOrders($request, $auth->all());
        $cities = $this->getOshiData()['cities'];
        $shippers = $this->getOshiData()['shippers'];

        return  $this->manageData($orders, $cities, $shippers);
    }

    private function manageData($orders, $cities, $shippers)
    {
        $normalizedOrders = [];

        foreach ($orders as $order) {

            $normalizedOrders[] =
                [
                    "id" => $order["id"],
                    "name" => $order["name"],
                    "amount" => $order["amount"],
                    "weight" => $order["weight"] != 0 ? $order["weight"] : 0.5,
                    "quantity" => $order["quantity"],
                    "customer_name" => $order["customer_name"],
                    "city" => $this->getCityId($cities, $order["city"]),
                    "customer_email" => $order["customer_email"],
                    "phone" => $order["phone"],
                    "address" => $order["address"],
                    "description" => $order["description"],
                    "parcel" => false
                ];
        }



        return [
            "orders" => $normalizedOrders,
            "cities" => $cities,
            "shippers" => $shippers,
        ];
    }

    private function getCityId($cities, $cityName)
    {
        $matchedValue = 0;
        foreach ($cities as $city) {
            if ($city['label'] === strtoupper($cityName)) {
                $matchedValue = $city['value'];
                break;
            }
        }

        return $matchedValue;
    }

    public function getOshiData()
    {
        return $this->oshiService->getData();
    }
}
