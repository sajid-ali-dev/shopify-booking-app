<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\OshiService;
use App\Models\Session;
use App\Models\Configuration;

class OshiController extends Controller
{


    private $oshiService;

    public function __construct(OshiService $oshiService)
    {

        $this->oshiService = $oshiService;
    }


    public function pushOrder(Request $request)
    {

        $session = $request->get(
            'shopifySession'
        );
        $auth = Session::byShop($session->getShop())->get(['id', 'shop', 'access_token']);
        // $shopifyOrderId = $request->id;

        // $session = $request->get(
        //     'shopifySession'
        // );
        // $auth = Session::byShop($session->getShop())->get(['id', 'shop', 'access_token']);

        // return $this->oshiService->pushOrder($auth->all(), $shopifyOrderId);
        return $this->oshiService->pushOrder($request->body,  $auth->all());
    }

    public function getData()
    {

        return $this->oshiService->getData();
    }

    public function clientValidate(Request $request)
    {
        $session = $request->get(
            'shopifySession'
        );

        $conf = Configuration::where("id", 1)->first();

        if ($request->apiKey == $conf->token && $request->clientId == $conf->client_id) {

            Session::where("shop", $session->getShop())->update([
                'oshi_token' => $request->apiKey,
                'client_id' => $request->clientId
            ]);
            return response()->json([
                'success' => true
            ]);
        }



        return response()->json([
            'success' => false
        ]);
    }

    public function checkCredentials(Request $request)
    {
        $session = $request->get(
            'shopifySession'
        );
        $data = Session::where("shop", $session->getShop())->first();

        if ($data->oshi_token == "" || $data->client_id == "") {
            return response()->json([
                'success' => false
            ]);
        }
        return response()->json([
            'success' => true
        ]);
    }
}
