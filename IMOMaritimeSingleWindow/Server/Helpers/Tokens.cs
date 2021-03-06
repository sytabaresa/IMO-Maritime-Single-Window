
/*  An utility class that provides functionality for handling token generation.
 *  This was adopted from an example project written by
 *  author: Marc Macniel (https://github.com/mmacneil)
 *  cited in a blog post
 *  url: https://fullstackmark.com/post/13/jwt-authentication-with-aspnet-core-2-web-api-angular-5-net-core-identity-and-facebook-login
 *  demonstrating how to implement a framework for authenticating users with JWT
 *  in an ASP.NET Core 2/Angular 5 web application.
 *  
 *  The original class this class is based upon can be found on the project's GitHub repository
 *  url: https://github.com/mmacneil/AngularASPNETCore2WebApiAuth
 *  file url: https://github.com/mmacneil/AngularASPNETCore2WebApiAuth/blob/master/src/Helpers/Tokens.cs
 */

using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using IMOMaritimeSingleWindow.Auth;
using Newtonsoft.Json;

namespace IMOMaritimeSingleWindow.Helpers
{
    public static class Tokens
    {
      public static async Task<string> GenerateJwt(ClaimsIdentity identity, IJwtFactory jwtFactory, string userName, JwtIssuerOptions jwtOptions, JsonSerializerSettings serializerSettings)
      {
        var response = new
        {
          auth_token = await jwtFactory.GenerateEncodedToken(userName, identity)
        };

        return JsonConvert.SerializeObject(response, serializerSettings);
      }
    }
}
