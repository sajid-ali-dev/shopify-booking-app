<?php

namespace App\Services;

use App\Services\ShopifyService;
use App\Models\Configuration;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;


class OshiService
{

    public $shopifyService;
    public function __construct(ShopifyService $shopifyService)
    {
        $this->shopifyService = $shopifyService;
    }


    public function pushOrder($payload, $session)
    {
        $auth = $this->getOshiAuth();

        try {
            $isSuccessFull = false;
            foreach ($payload as $data) {
                $body = [
                    "clients" => $auth['client_id'],
                    "token" => $auth['token'],
                    "name" => $data["customer_name"],
                    "email" => $data["customer_email"], //optional
                    "mobile" => $data["phone"],
                    "city" => $data["city"],
                    "address" => $data["address"],
                    "instructions" => "", //optional
                    "details" => $data["description"],
                    "qty" => $data["quantity"],
                    "weight" => $data["weight"],
                    "total" => $data["amount"],
                    "source" => "", //optional
                    "shipment_services" => $data["shipper"],
                    "open_allow" => $data["parcel"],
                    "client_order_id" => $data["name"],
                ];


                $response = $this->oshiApiPostCall($auth['token'], "bookingapi", $body);
                Log::info(json_encode($body));
                Log::info("oshi req");
                Log::info(json_encode($response));

                if ($response["success"] === "true") {
                    //get location api
                    $orderId = $data["id"];
                    Log::info("here");
                    $this->shopifyService->fullfillOrderOnShopify($orderId, $session,  $response);

                    $isSuccessFull =  true;
                }
            }

            return  $isSuccessFull;
        } catch (Exception $ex) {
            return false;
        }
    }

    public function getData()
    {


        $auth = $this->getOshiAuth();
        $cities = [];
        $shippers = [];

        $cities[] = [
            "label" => "Select",
            "value" => 0,
        ];
        $shippers[] = [
            "label" => "Select",
            "value" => 0,
        ];


        foreach ($this->oshiApiGetCall($auth['token'], "citiesapi") as $city) {
            $cities[] = [
                "label" => $city["title"],
                "value" => $city["id"],
            ];
        }

        foreach ($this->oshiApiPostCall($auth['token'], "shippersapishopify", [
            "clients" => $auth['client_id'],
            "token" => $auth['token'],
        ]) as $shipper) {
            $shippers[] = [
                "label" => $shipper["title"],
                "value" => $shipper["id"],
            ];
        }

        return [
            "cities" => $cities,
            "shippers" => $shippers
        ];
    }

    // private function getShopifyOrderDetail($session, $shopifyOrderId)
    // {
    //     return $this->shopifyService->getOrder($session, $shopifyOrderId);
    // }

    // private function getCustomerDetails($session, $customerId)
    // {
    //     return $this->shopifyService->getCustomer($session, $customerId);
    // }

    private function getOshiAuth()
    {
        $conf = Configuration::where("id", 1)->first();

        return [
            "client_id" => $conf->client_id,
            "token" => $conf->token,
        ];
    }

    private function oshiApiGetCall($token, $endpoint)
    {
        $apiUrl = "https://courier.oshi.pk/" . $endpoint;
        $data = "";
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->get($apiUrl);


        if ($response->successful()) {
            // Handle successful response
            $data = $response->json(); // Convert response to JSON
            // Process $data
        }

        return $data;
    }

    private function oshiApiPostCall($token, $endpoint, $data)
    {
        $apiUrl = "https://courier.oshi.pk/" . $endpoint;
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->post($apiUrl, $data);

        return $response->json();
    }
}
