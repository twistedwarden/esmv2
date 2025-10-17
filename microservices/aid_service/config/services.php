<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'auth_service' => [
        'url' => env('AUTH_SERVICE_URL', 'https://auth-gsph.up.railway.app'),
        'timeout' => env('AUTH_SERVICE_TIMEOUT', 10),
        'api_key' => env('AUTH_SERVICE_API_KEY'),
    ],

    'scholarship_service' => [
        'url' => env('SCHOLARSHIP_SERVICE_URL', 'https://scholarship-gsph.up.railway.app'),
        'timeout' => env('SCHOLARSHIP_SERVICE_TIMEOUT', 10),
        'api_key' => env('SCHOLARSHIP_SERVICE_API_KEY'),
    ],

];
