function getAuthToken() {

    return localStorage.getItem(
        "devflow_token"
    );

}


function isLoggedIn() {

    return Boolean(
        getAuthToken()
    );

}


function logout() {

    localStorage.removeItem(
        "devflow_token"
    );

    window.location.href =
        "login.html";

}


function requireAuth() {

    if (!isLoggedIn()) {

        window.location.href =
            "login.html";

    }

}


async function authFetch(
    url,
    options = {}
) {

    const token =
        getAuthToken();


    const headers = {
        ...(options.headers || {})
    };


    if (token) {

        headers[
            "Authorization"
        ] =
            `Bearer ${token}`;

    }


    const response =
        await fetch(
            url,
            {
                ...options,
                headers: headers
            }
        );


    if (
        response.status === 401
    ) {

        logout();

        return response;

    }


    return response;

}
const logoutButton =
    document.getElementById(
        "logout-button"
    );

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logout
    );

}