<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    use HasFactory;

    public function scopeByShop($query, $shop)
    {
        return $query->where('shop', $shop);
    }
}
