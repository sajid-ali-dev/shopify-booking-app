<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\OshiService;
use App\Models\Session;

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
}
