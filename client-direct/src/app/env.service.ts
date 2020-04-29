/**
 * Environment service.
 * 
 * See also {@link EnvServiceFactory} and {@link EnvServiceProvider}.
 * 
 * {@link https://www.jvandemo.com/how-to-use-environment-variables-to-configure-your-angular-application-without-a-rebuild/}
 */
export class EnvService {

  // The values that are defined here are the default values that can
  // be overridden by env.js

  // API urls
  public apiUrlAppMgr = '';
  public apiUrlData = '';

  // Whether or not to enable debug mode
  public enableDebug = true;

  constructor() {
  }

}
