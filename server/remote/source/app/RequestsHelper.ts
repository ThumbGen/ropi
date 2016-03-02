/// Singleton helper for sending requests

class RequestsHelper {

    static Current = new RequestsHelper();

    put(command: string, callbackSuccess: any = null, callbackError: any = null) {
        $.ajax({
            url: Settings.Current.getBaseAPIUrl() + command,
            type: "PUT",
            success(result) {
                console.log(command);
                if (callbackSuccess != null) {
                    callbackSuccess(result);
                }
            },
            error(result) {
                console.log(result + command);
                if (callbackError != null) {
                    callbackError(result);
                }
            }
        });
    }
}