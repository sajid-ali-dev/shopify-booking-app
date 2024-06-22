<?php

namespace App\Services;

use App\Helpers\Constants;
use App\Services\RestService;
use Illuminate\Support\Facades\Log;
use Exception;


class ShopifyService
{

    public $restService;

    public function __construct(RestService $restService)
    {
        $this->restService = $restService;
    }

    public function fullfillOrderOnShopify($orderId, $session, $oshiResponse)
    {
        

        try {
            $response = $this->restService->getRequest(
                $session,
                Constants::ADMIN_API . "orders/" . $orderId . "/fulfillment_orders.json"
            );

            if ($response && !empty($response["fulfillment_orders"])) {

                $tracking = $oshiResponse["tracking"];
                $trackingUrl = $oshiResponse["tracking_url"];
                $fulfillmentOrderId = $response["fulfillment_orders"][0]["id"];

                $this->fulfilledOrderOnShopify($session, $tracking, $trackingUrl, $fulfillmentOrderId);
            }

            return true;
        } catch (Exception $ex) {
            return false;
        }
    }

    private function fulfilledOrderOnShopify($session, $tracking, $trackingUrl, $fulfillmentOrderId)
    {
        $payload = array(
            "fulfillment" => array(
                "line_items_by_fulfillment_order" => array(
                    array(
                        "fulfillment_order_id" => $fulfillmentOrderId
                    )
                ),
                "tracking_info" => array(
                    "number" => $tracking,
                    "url" => $trackingUrl
                )
            )
        );
        try {
            $response = $this->restService->postRequest(
                $session,
                Constants::ADMIN_API . "fulfillments.json",
                $payload
            );
            Log::info("API RESPONSE FULFILLMENT");
            Log::info(json_encode($response));
            return true;
        } catch (Exception $ex) {
            return false;
        }
    }

    public function createLocationInShopify($session)
    {
        $payload = [
            "name" => "oshi Warehouse",
            "address1" => "123 Oshi St",
            "address2" => "",
            "city" => "Karachi",
            "zip" => "05444",
            "province" => "Sindh",
            "country" => "Pakistan",
            "phone" => "123-456-7890"
        ];
        try {
            $response = $this->restService->postRequest(
                $session,
                Constants::ADMIN_API . "locations.json",
                $payload
            );
            Log::info("API RESPONSE");
            Log::info(json_encode($response));
            return true;
        } catch (Exception $ex) {
            return false;
        }
    }


    public function getOrders($request, $session, $page_info = null)
    {

        $response = $this->getShopifyOrdersApi($request, $session, $page_info);
        $orders = [];


        foreach ($response['orders'] as $resp) {
            Log::info("object");
            Log::info(json_encode($resp));
            $quantity = 0;
            $line_items = "";
            foreach ($resp["line_items"] as $lineItem) {
                $quantity += $lineItem["quantity"];
                $line_items .= "[" . $lineItem["quantity"] . " x " . $lineItem["variant_title"] . "]";
            }
            $orders[] = [
                "id" => $resp["id"],
                "name" => $resp["name"],
                "amount" => $resp["current_total_price"],
                "weight" => $resp["total_weight"],
                "quantity" => $quantity,
                "customer_name" => $resp["customer"] != null ? $resp["customer"]["first_name"] . " " . $resp["customer"]["last_name"]  : "",
                "city" => $resp["shipping_address"] != null ? $resp["shipping_address"]["city"]   : "",
                "customer_email" => $resp["customer"] != null ? $resp["customer"]["email"] : "",
                "phone" => $resp["customer"] != null && $resp["customer"]["phone"] != null ? $resp["customer"]["phone"]  : "",
                "address" => $resp["shipping_address"] ? $resp["shipping_address"]["address1"] . " " . $resp["shipping_address"]["address2"] : "",
                "description" => $line_items
            ];
        }

        return $orders;
    }

    public function getOrder($session, $shopifyOrderId)
    {
        try {
            $response = $this->restService->getRequest(
                $session,
                Constants::ADMIN_API . "orders/" . $shopifyOrderId . ".json"
            );
            return $response['order'];
        } catch (Exception $ex) {
            return false;
        }
    }

    private function getShopifyOrdersApi($request, $session, $page_info)
    {
        try {
            $ids = $request->ids;
            $orders = $this->restService->getRequest(
                $session,
                Constants::ADMIN_API . "orders.json?limit=50&ids=" . $ids
            );
            return $orders;
        } catch (Exception $ex) {
            return false;
        }
    }

    public function getCustomer($session, $customerId)
    {
        try {
            $response = $this->restService->getRequest(
                $session,
                Constants::ADMIN_API . "customers/" . $customerId . "/addresses.json"
            );
            return $response;
        } catch (Exception $ex) {
            return false;
        }
    }
}
