<?php

namespace App\Services;


use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RestService
{
    private function getConfig($session)
    {
        $config = array(
            'ShopUrl' => $session[0]->shop,
            'AccessToken' => $session[0]->access_token,
        );
        return $config;
    }

    public function getRequest($session, $url)
    {
        $response = Http::withHeaders(
            [
                'X-Shopify-Access-Token' => $this->getConfig($session)['AccessToken'],
            ]
        )->get('https://' . $this->getConfig($session)['ShopUrl'] . $url);
        Log::info($response->header("page_info"));

        return $response->json();
    }

    public function postRequest($session, $url, $data)
    {

        $response = Http::withHeaders([
            'X-Shopify-Access-Token' => $this->getConfig($session)['AccessToken'],
        ])->post('https://' . $this->getConfig($session)['ShopUrl'] . $url, $data);

        return $response->json();
    }

    public function delRequest($session, $url)
    {

        $response = Http::withHeaders([
            'X-Shopify-Access-Token' => $this->getConfig($session)['AccessToken'],
        ])->delete('https://' . $this->getConfig($session)['ShopUrl'] . $url);

        return $response->json();
    }
}
