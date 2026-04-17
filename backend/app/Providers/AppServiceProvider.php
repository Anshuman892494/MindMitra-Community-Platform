<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        \Laravel\Sanctum\Sanctum::usePersonalAccessTokenModel(\App\Models\PersonalAccessToken::class);
    }
}
