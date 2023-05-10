# X-I-A SSO Handler
Handler SSO in X-I-A infrastructure

## Quick start:

Create the sso handler and then call the refreshAccessToken method
```
const ssoHandler = new SSOHandler();
ssoHandler.refreshAccessToken()
```

## Parameters
* ssoUrl: SSO path to redirect to. Default: '/sso/provider',
* rootCookieName: Cookie which holds global login information. Default:  'xia_root_header_token',
* accessCookieName = Access Token is hold here. Default: 'xia_access_token',
* refreshSignalName = Refresh Signal is hold here. Default: 'xia_refresh_signal'

Refresh Signal just inform that there is a refresh token presented.
