/* =========================================================
   DEVFLOW PROJECT DETAILS
========================================================= */

requireAuth();


/* =========================================================
   API
========================================================= */

const API_URL =
    "https://devflow-backend-nkaq.onrender.com";


/* =========================================================
   PROJECT ELEMENTS
========================================================= */

const projectName =
    document.getElementById(
        "project-name"
    );


const projectClient =
    document.getElementById(
        "project-client"
    );


const projectDescription =
    document.getElementById(
        "project-description"
    );


const projectClientDetails =
    document.getElementById(
        "project-client-details"
    );


const projectStatus =
    document.getElementById(
        "project-status"
    );


/* =========================================================
   PROJECT PROGRESS ELEMENTS
========================================================= */

const projectProgressValue =
    document.getElementById(
        "project-progress-value"
    );


const projectProgressFill =
    document.getElementById(
        "project-progress-fill"
    );


/* =========================================================
   EDIT PROJECT ELEMENTS
========================================================= */

const editModal =
    document.getElementById(
        "edit-modal"
    );


const editProjectButton =
    document.getElementById(
        "edit-project-button"
    );


const closeEditModalButton =
    document.getElementById(
        "close-edit-modal"
    );


const cancelEditButton =
    document.getElementById(
        "cancel-edit-button"
    );


const editProjectForm =
    document.getElementById(
        "edit-project-form"
    );


const editProjectName =
    document.getElementById(
        "edit-project-name"
    );


const editProjectDescription =
    document.getElementById(
        "edit-project-description"
    );


const editProjectClient =
    document.getElementById(
        "edit-project-client"
    );


const editProjectStatus =
    document.getElementById(
        "edit-project-status"
    );


/* =========================================================
   DELETE PROJECT
========================================================= */

const deleteProjectButton =
    document.getElementById(
        "delete-project-button"
    );


/* =========================================================
   CONFIRMATION MODAL
========================================================= */

const confirmModal =
    document.getElementById(
        "confirm-modal"
    );


const confirmTitle =
    document.getElementById(
        "confirm-title"
    );


const confirmMessage =
    document.getElementById(
        "confirm-message"
    );


const confirmActionButton =
    document.getElementById(
        "confirm-action-button"
    );


const cancelConfirmButton =
    document.getElementById(
        "cancel-confirm-button"
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
   PROJECT STATE
========================================================= */

let currentProject = null;

let clients = [];

let projectTasks = [];


/* =========================================================
   GET PROJECT ID
========================================================= */

function getProjectId() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get("id");

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


        populateClientDropdown();


    } catch (error) {

        console.error(
            "Error loading clients:",
            error
        );

    }

}


/* =========================================================
   POPULATE CLIENT DROPDOWN
========================================================= */

function populateClientDropdown() {

    editProjectClient.innerHTML = `
        <option value="">
            No client
        </option>
    `;


    clients
        .slice()
        .sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        )
        .forEach(
            (client) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    client.id;


                option.textContent =
                    client.name;


                editProjectClient.appendChild(
                    option
                );

            }
        );

}


/* =========================================================
   GET CLIENT NAME
========================================================= */

function getClientName(
    clientId
) {

    if (
        clientId === null ||
        clientId === undefined
    ) {

        return "No client";

    }


    const client =
        clients.find(
            (item) =>
                item.id === clientId
        );


    if (!client) {

        return "Unknown client";

    }


    return client.name;

}


/* =========================================================
   LOAD PROJECT
========================================================= */

async function loadProject() {

    const projectId =
        getProjectId();


    if (!projectId) {

        projectName.textContent =
            "Project not found";


        return;

    }


    try {

        const response =
            await authFetch(
                `${API_URL}/projects/${projectId}`
            );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        currentProject =
            await response.json();


        displayProject(
            currentProject
        );


    } catch (error) {

        console.error(
            "Error loading project:",
            error
        );


        projectName.textContent =
            "Unable to load project";


        projectClient.textContent =
            "The project could not be loaded.";


        projectDescription.textContent =
            "Make sure the project exists and belongs to your account.";

    }

}


/* =========================================================
   LOAD PROJECT TASKS
========================================================= */

async function loadProjectTasks() {

    const projectId =
        getProjectId();


    if (!projectId) {

        return;

    }


    try {

        const response =
            await authFetch(
                `${API_URL}/tasks/project/${projectId}`
            );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        projectTasks =
            await response.json();


        updateProjectProgress();


    } catch (error) {

        console.error(
            "Error loading project tasks:",
            error
        );

    }

}


/* =========================================================
   CALCULATE PROJECT PROGRESS
========================================================= */

function calculateProjectProgress() {

    if (
        projectTasks.length === 0
    ) {

        return 0;

    }


    const completedTasks =
        projectTasks.filter(
            (task) =>
                task.status === "completed"
        );


    const progress =
        (
            completedTasks.length /
            projectTasks.length
        ) * 100;


    return Math.round(
        progress
    );

}


/* =========================================================
   UPDATE PROJECT PROGRESS
========================================================= */

function updateProjectProgress() {

    const progress =
        calculateProjectProgress();


    if (projectProgressValue) {

        projectProgressValue.textContent =
            `${progress}%`;

    }


    if (projectProgressFill) {

        projectProgressFill.style.width =
            `${progress}%`;

    }

}


/* =========================================================
   GET STATUS CLASS
========================================================= */

function getProjectStatusClass(
    status
) {

    if (
        status === "completed"
    ) {

        return "status-completed";

    }


    if (
        status === "active"
    ) {

        return "status-active";

    }


    if (
        status === "on-hold"
    ) {

        return "status-on-hold";

    }


    return "status-default";

}


/* =========================================================
   DISPLAY PROJECT
========================================================= */

function displayProject(
    project
) {

    projectName.textContent =
        project.name;


    const clientName =
        getClientName(
            project.client_id
        );


    projectClient.textContent =
        clientName === "No client"
            ? "No client assigned"
            : clientName;


    projectDescription.textContent =
        project.description ||
        "No description provided.";


    projectClientDetails.textContent =
        clientName;


    projectStatus.textContent =
        project.status;


    projectStatus.className =
        `project-status ${
            getProjectStatusClass(
                project.status
            )
        }`;


    updateProjectProgress();

}


/* =========================================================
   OPEN EDIT PROJECT MODAL
========================================================= */

function openEditModal() {

    if (!currentProject) {

        return;

    }


    editProjectName.value =
        currentProject.name;


    editProjectDescription.value =
        currentProject.description ||
        "";


    editProjectClient.value =
        currentProject.client_id !== null &&
        currentProject.client_id !== undefined
            ? currentProject.client_id
            : "";


    editProjectStatus.value =
        currentProject.status;


    editModal.classList.remove(
        "hidden"
    );


    editProjectName.focus();

}


/* =========================================================
   CLOSE EDIT PROJECT MODAL
========================================================= */

function closeEditModal() {

    editModal.classList.add(
        "hidden"
    );


    editProjectForm.reset();

}


/* =========================================================
   UPDATE PROJECT
========================================================= */

async function updateProject(
    event
) {

    event.preventDefault();


    const projectId =
        getProjectId();


    if (!projectId) {

        return;

    }


    const selectedClientId =
        editProjectClient.value;


    const updatedProject = {

        name:
            editProjectName.value.trim(),

        description:
            editProjectDescription.value.trim(),

        client_id:
            selectedClientId
                ? Number(
                    selectedClientId
                )
                : null,

        status:
            editProjectStatus.value

    };


    if (
        !updatedProject.name
    ) {

        showError(
            "Project name required",
            "Please enter a name for the project."
        );


        return;

    }


    try {

        const response =
            await authFetch(
                `${API_URL}/projects/${projectId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            updatedProject
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


        currentProject =
            await response.json();


        displayProject(
            currentProject
        );


        closeEditModal();


    } catch (error) {

        console.error(
            "Error updating project:",
            error
        );


        showError(
            "Unable to update project",
            error.message
        );

    }

}


/* =========================================================
   OPEN PROJECT DELETE CONFIRMATION
========================================================= */

function openProjectDeleteConfirmation() {

    const projectId =
        getProjectId();


    if (!projectId) {

        return;

    }


    confirmTitle.textContent =
        "Delete Project";


    confirmMessage.textContent =
        "Are you sure you want to delete this project?";


    confirmActionButton.textContent =
        "Delete";


    confirmActionButton.dataset.action =
        "delete-project";


    confirmActionButton.dataset.projectId =
        projectId;


    confirmActionButton.dataset.taskId =
        "";


    confirmModal.classList.remove(
        "hidden"
    );

}


/* =========================================================
   DELETE PROJECT
========================================================= */

async function deleteProject(
    projectId
) {

    try {

        const response =
            await authFetch(
                `${API_URL}/projects/${projectId}`,
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


        closeConfirmModal();


        window.location.href =
            "projects.html";


    } catch (error) {

        console.error(
            "Error deleting project:",
            error
        );


        closeConfirmModal();


        showError(
            "Unable to delete project",
            error.message
        );

    }

}


/* =========================================================
   HANDLE CONFIRMATION
========================================================= */

function handleConfirmation() {

    const action =
        confirmActionButton.dataset.action;


    const projectId =
        confirmActionButton.dataset.projectId;


    const taskId =
        confirmActionButton.dataset.taskId;


    if (
        action ===
        "delete-project"
    ) {

        deleteProject(
            projectId
        );


        return;

    }


    if (
        action ===
        "delete-task"
    ) {

        const event =
            new CustomEvent(
                "devflow-delete-task",
                {
                    detail: {
                        taskId:
                            taskId
                    }
                }
            );


        document.dispatchEvent(
            event
        );


        return;

    }

}


/* =========================================================
   CLOSE CONFIRMATION
========================================================= */

function closeConfirmModal() {

    confirmModal.classList.add(
        "hidden"
    );


    confirmActionButton.dataset.action =
        "";


    confirmActionButton.dataset.projectId =
        "";


    confirmActionButton.dataset.taskId =
        "";

}


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
   PROJECT EVENTS
========================================================= */

editProjectButton.addEventListener(
    "click",
    openEditModal
);


closeEditModalButton.addEventListener(
    "click",
    closeEditModal
);


cancelEditButton.addEventListener(
    "click",
    closeEditModal
);


editProjectForm.addEventListener(
    "submit",
    updateProject
);


deleteProjectButton.addEventListener(
    "click",
    openProjectDeleteConfirmation
);


/* =========================================================
   EDIT MODAL OUTSIDE CLICK
========================================================= */

editModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === editModal
        ) {

            closeEditModal();

        }

    }
);


/* =========================================================
   CONFIRMATION EVENTS
========================================================= */

cancelConfirmButton.addEventListener(
    "click",
    closeConfirmModal
);


confirmActionButton.addEventListener(
    "click",
    handleConfirmation
);


confirmModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === confirmModal
        ) {

            closeConfirmModal();

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
            event.target === errorModal
        ) {

            closeErrorModal();

        }

    }
);


/* =========================================================
   START PROJECT SYSTEM
========================================================= */

async function startProjectSystem() {

    await loadClients();

    await loadProject();

    await loadProjectTasks();

}


startProjectSystem();
