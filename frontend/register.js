const API_URL =
    "http://127.0.0.1:8000";


const registerForm =
    document.getElementById(
        "register-form"
    );


const registerName =
    document.getElementById(
        "register-name"
    );


const registerEmail =
    document.getElementById(
        "register-email"
    );


const registerPassword =
    document.getElementById(
        "register-password"
    );


const registerConfirmPassword =
    document.getElementById(
        "register-confirm-password"
    );


const registerError =
    document.getElementById(
        "register-error"
    );


registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        registerError.classList.add(
            "hidden"
        );


        const name =
            registerName.value.trim();


        const email =
            registerEmail.value.trim();


        const password =
            registerPassword.value;


        const confirmPassword =
            registerConfirmPassword.value;


        if (
            password !==
            confirmPassword
        ) {

            registerError.textContent =
                "Passwords do not match.";

            registerError.classList.remove(
                "hidden"
            );

            return;

        }


        const userData = {

            name: name,

            email: email,

            password: password

        };


        try {

            const response =
                await fetch(
                    `${API_URL}/users/`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                userData
                            )
                    }
                );


            if (!response.ok) {

                const errorData =
                    await response.json();


                throw new Error(
                    errorData.detail ||
                    "Unable to create account."
                );

            }


            await response.json();


            window.location.href =
                "login.html";


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            registerError.textContent =
                error.message;


            registerError.classList.remove(
                "hidden"
            );

        }

    }
);