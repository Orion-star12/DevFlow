const API_URL =
    "http://127.0.0.1:8000";


const loginForm =
    document.getElementById(
        "login-form"
    );


const loginEmail =
    document.getElementById(
        "login-email"
    );


const loginPassword =
    document.getElementById(
        "login-password"
    );


const loginError =
    document.getElementById(
        "login-error"
    );


loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        loginError.classList.add(
            "hidden"
        );


        const email =
            loginEmail.value.trim();


        const password =
            loginPassword.value;


        const loginData = {

            email: email,

            password: password

        };


        try {

            const response =
                await fetch(
                    `${API_URL}/auth/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                loginData
                            )
                    }
                );


            if (!response.ok) {

                const errorData =
                    await response.json();


                throw new Error(
                    errorData.detail ||
                    "Unable to log in."
                );

            }


            const data =
                await response.json();


            localStorage.setItem(
                "devflow_token",
                data.access_token
            );


            window.location.href =
                "index.html";


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            loginError.textContent =
                error.message;


            loginError.classList.remove(
                "hidden"
            );

        }

    }
);