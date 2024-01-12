# RollerCoin-React-MainApp-FrontEnd

```
```
## Requirements
- Installed [NodeJS](https://nodejs.org/uk/) v18.16.1

## State management
- ```/src/actions/```
- ```/src/reducers/```

## SEO management
- ```/src/constants/routes.js``` - SEO settings for different pages
- 
## How to start
- Download dependencies via NPM  ```npm i```
- To start local build run ```npm run start:local_dev```

## Docker
```docker-compose -f docker-compose.local.yml up --build```

## Environment variables
- ```WS``` - Main WebSocket URL
- ```CRYPTO_IV``` - Initialization vector secret key for data encryption
- ```EXHANGE_RATE``` - Multiplier for base currency
- ```MINIMAL_PAYMENT_IN_RLT``` - The minimum allowable amount of purchase of the main currency by user at once
- ```MAX_AMOUNT_FOR_ONE_USER``` - The maximum allowable amount of purchase of the main currency by user at once
- ```WALLET_ADDRESS_VALIDATOR``` - Wallet address validation network type
- ```WP_API``` - WordPress blog news API
- ```FACEBOOK_APP_ID``` - AppID for initialization when connecting SDK script
- ```FACEBOOK_PIXEL_ID``` - PixelID for facebook analytics
- ```GTM_ID``` - Google Tag Manager ID
- ```AVAILABLE_METAMASK_NETWORKS``` - Blockchain network id index
- ```PIXEL_CONVERSION_BUY_TOKEN_URL``` - URL for load conversion pixel script
- ```NODE_WS_URL``` - Node WebSocket URL 
- ```NODE_WS_WITH_AUTH``` - Create a websocket connection when the user logs in
- ```STATIC_URL``` - Static server URL
- ```AVATARS_STATIC_URL``` - Avatars static server URL
- ```GOOGLE_OAUTH_CLIENT_ID``` - Client ID for authorization through the google service

Located in: ```src/config/.env.development```,  ```src/config/.env.local``` , ```src/config/.env.production```