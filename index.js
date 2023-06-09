const Cookies = require('js-cookie');

class SSOHandler {
  constructor(
    ssoUrl = '/sso/provider',
    rootCookieName = 'xia_root_header_token',
    accessCookieName = 'xia_access_token',
    refreshSignalName = 'xia_refresh_signal'
  ) {
    this.ssoUrl = ssoUrl;
    const rootCookie = Cookies.get(rootCookieName)
    this.rootHeader = rootCookie ? JSON.parse(atob(rootCookie)) : {}
    this.accessCookieName = accessCookieName;
    this.refreshSignalName = refreshSignalName;
    this.access_cookie = Cookies.get(accessCookieName);
    this.refresh_signal = Cookies.get(refreshSignalName);
    this.access_cookie_body = this.getUnverifiedBody(this.access_cookie);
    this.refresh_signal_body = this.getUnverifiedBody(this.refresh_signal);
  }

  getValue(obj, key, defaultValue) {
    return key in obj ? obj[key] : defaultValue;
  }

  getUnverifiedBody(content) {
    if (!content) {
      console.log("No cookie found")
      return {}
    }
    const tokenParts = content.split('.');
    if (tokenParts.length !== 3) {
      console.log("Cookie is not a JWT token")
      return {}
    }
    const payloadBase64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
    try {
      return JSON.parse(atob(payloadBase64));
    } catch (error) {
      console.error('Error while decoding and parsing JWT payload:', error);
      return {};
    }
  }

  getScope(prefix, pos) {
    const accessToken = this.getUnverifiedBody(this.access_cookie)
    return [...new Set((accessToken.user_acl || [])
      .filter((acl) => {
        if (acl.obj && acl.obj.startsWith(prefix)) {
          const parts = acl.obj.split('/')
          return parts.length > pos && parts[pos] !== '*'
        }
        return false
      })
      .map(acl => acl.obj.split('/')[pos]))]
  }

  async refreshAccessToken() {
    this.access_cookie = Cookies.get(this.accessCookieName);
    this.refresh_signal = Cookies.get(this.refreshSignalName);
    this.refresh_signal_body = this.getUnverifiedBody(this.refresh_signal);
    if (this.access_cookie) {
      return true;
    }
    else if (!this.access_cookie && ('token_info' in this.refresh_signal_body)) {
      const newLocation = this.refresh_signal_body['token_info']['root'];
      console.log("Refreshing access token")
      if (newLocation.startsWith("/")) {
        // location.href = newLocation;
        await fetch(newLocation)
        return true;
      }
    } else if (!this.access_cookie && this.getValue(this.rootHeader, 'login', false)) {
      console.log("Redirect to SSO")
      location.href = this.ssoUrl;
      await new Promise(resolve => setTimeout(resolve, 10000));  // blocking the following command as the page will be refreshed
      return true
    }
    return false;
  }
}

module.exports = SSOHandler
