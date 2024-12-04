[aaa](https://github.com/laravel/socialite/issues/388)

Two には redirectUrl($url) method があって One にはない!

\socialite\src\SocialiteManager.php

    /**
     * Create an instance of the specified driver.
     *
     * @return \Laravel\Socialite\One\AbstractProvider
     */
    protected function createTwitterDriver()
    {
        $config = $this->config->get('services.twitter');

        return new TwitterProvider(
            $this->container->make('request'), new TwitterServer($this->formatConfig($config))
        );
    }

```php
    public function redirectToProvider()
    {
        $config = config('services.twitter');

        /** @var string */
        $requestRedirectUrl = request()->get('redirect_to');

        /** @var string[] */
        $allowedUrls = config('services.twitter.allowed_redirect_urls');

        if (in_array($requestRedirectUrl, $allowedUrls, true)) {
            $config['redirect'] = $requestRedirectUrl;
        } else {
            $config['redirect'] = $allowedUrls[0];
        }

        $driver = (new ConfigurableSocialiteManager($this->container))->createTwitterDriverWithConfig($config);

        return $driver->redirect();
    }
```

```php
        'allowed_redirect_urls' => [
            'https://salmon-stats-api.yuki.games/auth/twitter/callback', // The first url will be used by default
            'http://localhost/auth/twitter/callback',
            'salmon-stats://',
        ],

```
