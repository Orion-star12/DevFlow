/* =========================================================
   DEVFLOW CLIENTS
========================================================= */

requireAuth();


/* =========================================================
   API
========================================================= */

const API_URL =
    "http://127.0.0.1:8000";


/* =========================================================
   ELEMENTS
========================================================= */

const clientsContainer =
    document.getElementById(
        "clients-container"
    );


const newClientButton =
    document.getElementById(
        "new-client-button"
    );


const clientModal =
    document.getElementById(
        "client-modal"
    );


const closeClientModalButton =
    document.getElementById(
        "close-client-modal"
    );


const cancelClientButton =
    document.getElementById(
        "cancel-client-button"
    );


const clientForm =
    document.getElementById(
        "client-form"
    );


const clientName =
    document.getElementById(
        "client-name"
    );


const clientEmail =
    document.getElementById(
        "client-email"
    );


const clientPhone =
    document.getElementById(
        "client-phone"
    );


const clientCompany =
    document.getElementById(
        "client-company"
    );


/* =========================================================
   DELETE CONFIRMATION
========================================================= */

const confirmClientModal =
    document.getElementById(
        "confirm-client-modal"
    );


const confirmClientTitle =
    document.getElementById(
        "confirm-client-title"
    );


const confirmClientMessage =
    document.getElementById(
        "confirm-client-message"
    );


const cancelClientDeleteButton =
    document.getElementById(
        "cancel-client-delete-button"
    );


const confirmClientDeleteButton =
    document.getElementById(
        "confirm-client-delete-button"
    );


/* =========================================================
   ERROR MODAL
========================================================= */

const errorModal =
    document.getElementById(
        "error-modal"
    );


const errorTitle =
    document.getElementById(
        "error-title"
    );


const errorMessage =
    document.getElementById(
        "error-message"
    );


const closeErrorButton =
    document.getElementById(
        "close-error-button"
    );


/* =========================================================
   DATA
========================================================= */

let clients = [];

let projects = [];


/* =========================================================
   EDIT STATE
========================================================= */

let editingClientId = null;


/* =========================================================
   ERROR MODAL
========================================================= */

function showError(
    title,
    message
) {

    errorTitle.textContent =
        title;


    errorMessage.textContent =
        message;


    errorModal.classList.remove(
        "hidden"
    );

}


function closeErrorModal() {

    errorModal.classList.add(
        "hidden"
    );

}


/* =========================================================
   LOAD CLIENTS
========================================================= */

async function loadClients() {

    try {

        const response =
            await authFetch(
                `${API_URL}/clients/`
            );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        clients =
            await response.json();


        displayClients();


    } catch (error) {

        console.error(
            "Error loading clients:",
            error
        );


        clientsContainer.innerHTML = `
            <div class="empty-state">

                <h3>
                    Unable to load clients
                </h3>

                <p>
                    Make sure the DevFlow backend is running.
                </p>

            </div>
        `;

    }

}


/* =========================================================
   LOAD PROJECTS
========================================================= */

async function loadProjects() {

    try {

        const response =
            await authFetch(
                `${API_URL}/projects/`
            );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        projects =
            await response.json();


        displayClients();


    } catch (error) {

        console.error(
            "Error loading projects:",
            error
        );

    }

}


/* =========================================================
   GET PROJECT COUNT
========================================================= */

function getClientProjectCount(
    clientId
) {

    return projects.filter(
        (project) =>
            project.client_id === clientId
    ).length;

}


/* =========================================================
   GET CLIENT INITIAL
========================================================= */

function getClientInitial(
    name
) {

    if (
        !name
    ) {

        return "?";

    }


    return name
        .trim()
        .charAt(0)
        .toUpperCase();

}


/* =========================================================
   DISPLAY CLIENTS
========================================================= */

function displayClients() {

    if (
        clients.length === 0
    ) {

        clientsContainer.innerHTML = `
            <div class="empty-state">

                <h3>
                    No clients yet
                </h3>

                <p>
                    Add your first client to start organizing your work.
                </p>

            </div>
        `;

        return;

    }


    const sortedClients =
        clients
            .slice()
            .reverse();


    clientsContainer.innerHTML =
        sortedClients
            .map(
                (client) => {

                    const projectCount =
                        getClientProjectCount(
                            client.id
                        );


                    const initial =
                        getClientInitial(
                            client.name
                        );


                    return `
                        <article
                            class="client-card"
                        >

                            <div
                                class="client-card-header"
                            >

                                <div
                                    class="client-identity"
                                >

                                    <div
                                        class="client-avatar"
                                        aria-hidden="true"
                                    >
                                        ${initial}
                                    </div>


                                    <div
                                        class="client-card-title"
                                    >

                                        <h3>
                                            ${client.name}
                                        </h3>


                                        <p
                                            class="client-company"
                                        >
                                            ${
                                                client.company ||
                                                "Independent client"
                                            }
                                        </p>

                                    </div>

                                </div>


                                <span
                                    class="client-project-count"
                                >
                                    ${
                                        projectCount
                                    }
                                    ${
                                        projectCount === 1
                                            ? "project"
                                            : "projects"
                                    }
                                </span>

                            </div>



                            <div
                                class="client-details"
                            >

                                <p>
                                    <strong>
                                        Email
                                    </strong>

                                    <span>
                                        ${
                                            client.email ||
                                            "Not provided"
                                        }
                                    </span>
                                </p>


                                <p>
                                    <strong>
                                        Phone
                                    </strong>

                                    <span>
                                        ${
                                            client.phone ||
                                            "Not provided"
                                        }
                                    </span>
                                </p>

                            </div>



                            <div
                                class="client-actions"
                            >

                                <button
                                    type="button"
                                    class="secondary-button edit-client-button"
                                    data-client-id="${client.id}"
                                >
                                    Edit
                                </button>


                                <button
                                    type="button"
                                    class="danger-button delete-client-button"
                                    data-client-id="${client.id}"
                                >
                                    Delete
                                </button>

                            </div>

                        </article>
                    `;

                }
            )
            .join("");


    addClientButtonListeners();

}


/* =========================================================
   OPEN CREATE CLIENT MODAL
========================================================= */

function openCreateClientModal() {

    editingClientId =
        null;


    clientForm.reset();


    updateClientModalMode();


    clientModal.classList.remove(
        "hidden"
    );


    clientName.focus();

}


/* =========================================================
   OPEN EDIT CLIENT MODAL
========================================================= */

function openEditClientModal(
    clientId
) {

    const client =
        clients.find(
            (item) =>
                item.id ===
                Number(clientId)
        );


    if (!client) {

        showError(
            "Client not found",
            "The selected client could not be found."
        );


        return;

    }


    editingClientId =
        client.id;


    clientName.value =
        client.name;


    clientEmail.value =
        client.email || "";


    clientPhone.value =
        client.phone || "";


    clientCompany.value =
        client.company || "";


    updateClientModalMode();


    clientModal.classList.remove(
        "hidden"
    );


    clientName.focus();

}


/* =========================================================
   UPDATE CLIENT MODAL MODE
========================================================= */

function updateClientModalMode() {

    const modalTitle =
        clientModal.querySelector(
            "h2"
        );


    const modalDescription =
        clientModal.querySelector(
            ".modal-header p"
        );


    const submitButton =
        clientForm.querySelector(
            'button[type="submit"]'
        );


    if (
        editingClientId
    ) {

        modalTitle.textContent =
            "Edit Client";


        if (
            modalDescription
        ) {

            modalDescription.textContent =
                "Update your client's information.";

        }


        submitButton.textContent =
            "Save Changes";

    } else {

        modalTitle.textContent =
            "Create Client";


        if (
            modalDescription
        ) {

            modalDescription.textContent =
                "Add a client to your workspace.";

        }


        submitButton.textContent =
            "Create Client";

    }

}


/* =========================================================
   CLOSE CLIENT MODAL
========================================================= */

function closeClientModal() {

    clientModal.classList.add(
        "hidden"
    );


    editingClientId =
        null;


    clientForm.reset();


    updateClientModalMode();

}


/* =========================================================
   CREATE CLIENT
========================================================= */

async function createClient() {

    const clientData = {

        name:
            clientName.value.trim(),

        email:
            clientEmail.value.trim(),

        phone:
            clientPhone.value.trim(),

        company:
            clientCompany.value.trim()

    };


    if (
        !clientData.name
    ) {

        showError(
            "Client name required",
            "Please enter the client's name."
        );


        return;

    }


    try {

        const response =
            await authFetch(
                `${API_URL}/clients/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            clientData
                        )
                }
            );


        if (!response.ok) {

            const errorData =
                await response.json();


            throw new Error(
                errorData.detail ||
                `Server returned ${response.status}`
            );

        }


        await response.json();


        closeClientModal();


        await loadClients();


    } catch (error) {

        console.error(
            "Error creating client:",
            error
        );


        showError(
            "Unable to create client",
            error.message
        );

    }

}


/* =========================================================
   UPDATE CLIENT
========================================================= */

async function updateClient() {

    if (
        !editingClientId
    ) {

        return;

    }


    const clientData = {

        name:
            clientName.value.trim(),

        email:
            clientEmail.value.trim(),

        phone:
            clientPhone.value.trim(),

        company:
            clientCompany.value.trim()

    };


    if (
        !clientData.name
    ) {

        showError(
            "Client name required",
            "Please enter the client's name."
        );


        return;

    }


    try {

        const response =
            await authFetch(
                `${API_URL}/clients/${editingClientId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            clientData
                        )
                }
            );


        if (!response.ok) {

            const errorData =
                await response.json();


            throw new Error(
                errorData.detail ||
                `Server returned ${response.status}`
            );

        }


        await response.json();


        closeClientModal();


        await loadClients();


    } catch (error) {

        console.error(
            "Error updating client:",
            error
        );


        showError(
            "Unable to update client",
            error.message
        );

    }

}


/* =========================================================
   CLIENT FORM SUBMISSION
========================================================= */

clientForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (
            editingClientId
        ) {

            await updateClient();

        } else {

            await createClient();

        }

    }
);


/* =========================================================
   OPEN DELETE CONFIRMATION
========================================================= */

function openDeleteClientConfirmation(
    clientId
) {

    const client =
        clients.find(
            (item) =>
                item.id ===
                Number(clientId)
        );


    if (!client) {

        showError(
            "Client not found",
            "The selected client could not be found."
        );


        return;

    }


    confirmClientTitle.textContent =
        "Delete Client";


    confirmClientMessage.textContent =
        `Are you sure you want to delete ${client.name}?`;


    confirmClientDeleteButton.dataset.clientId =
        client.id;


    confirmClientModal.classList.remove(
        "hidden"
    );

}


/* =========================================================
   CLOSE DELETE CONFIRMATION
========================================================= */

function closeDeleteClientConfirmation() {

    confirmClientModal.classList.add(
        "hidden"
    );


    confirmClientDeleteButton.dataset.clientId =
        "";

}


/* =========================================================
   DELETE CLIENT
========================================================= */

async function deleteClient(
    clientId
) {

    try {

        const response =
            await authFetch(
                `${API_URL}/clients/${clientId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const errorData =
                await response.json();


            throw new Error(
                errorData.detail ||
                `Server returned ${response.status}`
            );

        }


        await response.json();


        closeDeleteClientConfirmation();


        await Promise.all([
            loadClients(),
            loadProjects()
        ]);


    } catch (error) {

        console.error(
            "Error deleting client:",
            error
        );


        closeDeleteClientConfirmation();


        showError(
            "Unable to delete client",
            error.message
        );

    }

}


/* =========================================================
   CLIENT BUTTON LISTENERS
========================================================= */

function addClientButtonListeners() {

    const editButtons =
        document.querySelectorAll(
            ".edit-client-button"
        );


    editButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    openEditClientModal(
                        button.dataset.clientId
                    );

                }
            );

        }
    );


    const deleteButtons =
        document.querySelectorAll(
            ".delete-client-button"
        );


    deleteButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    openDeleteClientConfirmation(
                        button.dataset.clientId
                    );

                }
            );

        }
    );

}


/* =========================================================
   CLIENT MODAL EVENTS
========================================================= */

newClientButton.addEventListener(
    "click",
    openCreateClientModal
);


cancelClientButton.addEventListener(
    "click",
    closeClientModal
);


if (
    closeClientModalButton
) {

    closeClientModalButton.addEventListener(
        "click",
        closeClientModal
    );

}


clientModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === clientModal
        ) {

            closeClientModal();

        }

    }
);


/* =========================================================
   DELETE MODAL EVENTS
========================================================= */

cancelClientDeleteButton.addEventListener(
    "click",
    closeDeleteClientConfirmation
);


confirmClientDeleteButton.addEventListener(
    "click",
    () => {

        const clientId =
            confirmClientDeleteButton
                .dataset
                .clientId;


        if (
            clientId
        ) {

            deleteClient(
                clientId
            );

        }

    }
);


confirmClientModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            confirmClientModal
        ) {

            closeDeleteClientConfirmation();

        }

    }
);


/* =========================================================
   ERROR MODAL EVENTS
========================================================= */

closeErrorButton.addEventListener(
    "click",
    closeErrorModal
);


errorModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            errorModal
        ) {

            closeErrorModal();

        }

    }
);


/* =========================================================
   START CLIENT SYSTEM
========================================================= */

async function startClientsPage() {

    await Promise.all([
        loadClients(),
        loadProjects()
    ]);


    displayClients();

}


startClientsPage();
