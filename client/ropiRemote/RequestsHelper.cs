using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Text;

namespace ropiRemote
{
    public static class RequestsHelper
    {
        private static readonly HttpClient Client = new HttpClient();

        public static string PrepareQueryString(Dictionary<string, string> values)
        {
            var queryStringparam = values.Aggregate("", (current, p) => current + (p.Key + "=" + p.Value + "&"));
            queryStringparam = queryStringparam.TrimEnd('&');
            //Debug.WriteLine(queryStringparam);
            return queryStringparam;
        }

        //public static HttpContent PrepareContent(object obj)
        //{
        //    var param = Newtonsoft.Json.JsonConvert.SerializeObject(obj);
        //    //Debug.WriteLine(param);
        //    HttpContent result = new StringContent(param, Encoding.UTF8, "application/json");
        //    return result;
        //}

        public static async Task<HttpResponseMessage> SendRequestAsync(string method, string ip, string url, string queryString = null, HttpContent content = null)
        {
            var response = new HttpResponseMessage(HttpStatusCode.NotFound);
            //var authResult = AuthenticationService.AuthenticationResult;
            //if (authResult?.AccessToken != null)
            {
                //Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", authResult.AccessToken);

                queryString = string.IsNullOrWhiteSpace(queryString) ? "" : "?" + queryString;
                var uri = $"http://{ip}{Consts.ApiUrl}{url}{queryString}";
                Debug.WriteLine(uri);
                switch (method)
                {
                    case "get":
                        response = await Client.GetAsync(uri);
                        break;
                    case "post":
                        response = await Client.PostAsync(uri, content);
                        break;
                    case "put":
                        response = await Client.PutAsync(uri, content);
                        break;
                }

                Debug.WriteLine("Response Code:" + response.StatusCode);

                if (!response.IsSuccessStatusCode)
                {
                    if (response.StatusCode == HttpStatusCode.Unauthorized)
                    {
                        // If service returns access denied, clear the token cache and have the user sign-in again.
                        //var dlg = new MessageDialog("Sorry, you don't have access to the ROOMobile Service. Please sign-in again.");
                        //await dlg.ShowAsync();
                        //authenticationContext.TokenCache.Clear();
                    }
                    else
                    {
                        //var dlg = new MessageDialog("Sorry, an error occurred accessing the ROOMobile server. Please try again.");
                        //await dlg.ShowAsync();
                    }
                }
            //}
            //else
            //{
            //    // not authenticated
            }
            return response;
        }
    }
}