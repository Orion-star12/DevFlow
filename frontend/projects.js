/* =========================================================
   DEVFLOW PROJECTS PAGE
========================================================= */

requireAuth();


/* =========================================================
   API
========================================================= */

const API_URL =
    "https://devflow-backend-nkaq.onrender.com";


/* =========================================================
   PAGE ELEMENTS
========================================================= */

const projectsContainer =
    document.getElementById(
        "projects-container"
    );


const newProjectButton =
    document.getElementById(
        "new-project-button"
    );


const projectModal =
    document.getElementById(
        "project-modal"
    );


const cancelProjectButton =
    document.getElementById(
        "cancel-project-button"
    );


const projectForm =
    document.getElementById(
        "project-form"
    );


const projectName =
    document.getElementById(
        "project-name"
    );


const projectDescription =
    document.getElementById(
        "project-description"
    );


const projectClient =
    document.getElementById(
        "project-client"
    );


/* =========================================================
   SEARCH AND FILTER ELEMENTS
========================================================= */

const projectSearchInput =
    document.getElementById(
        "project-search-input"
    );


const projectStatusFilter =
    document.getElementById(
        "project-status-filter"
    );


const clearProjectFiltersButton =
    document.getElementById(
        "clear-project-filters"
    );


const projectsResultSummary =
    document.getElementById(
        "projects-result-summary"
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

let projects = [];

let tasks = [];

let clients = [];


/* =========================================================
   FILTER STATE
========================================================= */

let searchTerm = "";

let selectedStatus = "all";


/* =========================================================
   ERROR HANDLING
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


        displayProjects();


    } catch (error) {

        console.error(
            "Error loading projects:",
            error
        );


        projectsContainer.innerHTML = `
            <div class="empty-state">

                <h3>
                    Unable to load projects
                </h3>

                <p>
                    Make sure the DevFlow backend is running.
                </p>

            </div>
        `;

    }

}


/* =========================================================
   LOAD TASKS
========================================================= */

async function loadTasks() {

    try {

        const response =
            await authFetch(
                `${API_URL}/tasks/`
            );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        tasks =
            await response.json();


        displayProjects();


    } catch (error) {

        console.error(
            "Error loading tasks:",
            error
        );

    }

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


        displayProjects();


    } catch (error) {

        console.error(
            "Error loading clients:",
            error
        );


        projectClient.innerHTML =
            `<option value="">No client</option>`;

    }

}


/* =========================================================
   CLIENT DROPDOWN
========================================================= */

function populateClientDropdown() {

    projectClient.innerHTML =
        `<option value="">No client</option>`;


    const sortedClients =
        clients
            .slice()
            .sort(
                (a, b) =>
                    a.name.localeCompare(
                        b.name
                    )
            );


    sortedClients.forEach(
        (client) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                client.id;


            option.textContent =
                client.name;


            projectClient.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   CLIENT NAME
========================================================= */

function getClientName(
    clientId
) {

    if (
        clientId === null ||
        clientId === undefined
    ) {

        return "";

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
   PROJECT PROGRESS
========================================================= */

function calculateProjectProgress(
    projectId
) {

    const projectTasks =
        tasks.filter(
            (task) =>
                task.project_id ===
                projectId
        );


    if (
        projectTasks.length === 0
    ) {

        return 0;

    }


    const completedTasks =
        projectTasks.filter(
            (task) =>
                task.status ===
                "completed"
        );


    return Math.round(
        (
            completedTasks.length /
            projectTasks.length
        ) *
        100
    );

}


/* =========================================================
   TASK COUNT
========================================================= */

function getProjectTaskCount(
    projectId
) {

    return tasks.filter(
        (task) =>
            task.project_id ===
            projectId
    ).length;

}


/* =========================================================
   COMPLETED TASK COUNT
========================================================= */

function getCompletedTaskCount(
    projectId
) {

    return tasks.filter(
        (task) =>
            task.project_id ===
                projectId &&
            task.status ===
                "completed"
    ).length;

}


/* =========================================================
   STATUS CLASS
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
   FILTER PROJECTS
========================================================= */

function getFilteredProjects() {

    const normalizedSearch =
        searchTerm
            .trim()
            .toLowerCase();


    return projects.filter(
        (project) => {

            const matchesSearch =
                !normalizedSearch ||
                project.name
                    .toLowerCase()
                    .includes(
                        normalizedSearch
                    ) ||
                (
                    project.description ||
                    ""
                )
                    .toLowerCase()
                    .includes(
                        normalizedSearch
                    );


            const matchesStatus =
                selectedStatus ===
                    "all" ||
                project.status ===
                    selectedStatus;


            return (
                matchesSearch &&
                matchesStatus
            );

        }
    );

}


/* =========================================================
   UPDATE RESULT SUMMARY
========================================================= */

function updateResultSummary(
    filteredProjects
) {

    const total =
        projects.length;


    const visible =
        filteredProjects.length;


    if (
        total === 0
    ) {

        projectsResultSummary.textContent =
            "No projects yet";


        return;

    }


    if (
        visible === total &&
        !searchTerm &&
        selectedStatus === "all"
    ) {

        projectsResultSummary.textContent =
            `Showing all ${total} ${
                total === 1
                    ? "project"
                    : "projects"
            }`;


        return;

    }


    projectsResultSummary.textContent =
        `Showing ${visible} of ${total} ${
            total === 1
                ? "project"
                : "projects"
        }`;

}


/* =========================================================
   DISPLAY PROJECTS
========================================================= */

function displayProjects() {

    const filteredProjects =
        getFilteredProjects();


    updateResultSummary(
        filteredProjects
    );


    if (
        projects.length === 0
    ) {

        projectsContainer.innerHTML = `
            <div class="empty-state">

                <h3>
                    No projects yet
                </h3>

                <p>
                    Create your first project to get started.
                </p>

            </div>
        `;


        return;

    }


    if (
        filteredProjects.length === 0
    ) {

        projectsContainer.innerHTML = `
            <div class="empty-state">

                <h3>
                    No matching projects
                </h3>

                <p>
                    Try changing your search or status filter.
                </p>

                <button
                    type="button"
                    id="empty-clear-filters"
                    class="secondary-button"
                >
                    Clear Filters
                </button>

            </div>
        `;


        const emptyClearButton =
            document.getElementById(
                "empty-clear-filters"
            );


        emptyClearButton.addEventListener(
            "click",
            clearProjectFilters
        );


        return;

    }


    const sortedProjects =
        filteredProjects
            .slice()
            .reverse();


    projectsContainer.innerHTML =
        sortedProjects
            .map(
                (project) => {

                    const progress =
                        calculateProjectProgress(
                            project.id
                        );


                    const taskCount =
                        getProjectTaskCount(
                            project.id
                        );


                    const completedTaskCount =
                        getCompletedTaskCount(
                            project.id
                        );


                    const clientName =
                        getClientName(
                            project.client_id
                        );


                    const statusClass =
                        getProjectStatusClass(
                            project.status
                        );


                    return `
                        <article
                            class="project-card"
                        >

                            <div
                                class="project-card-header"
                            >

                                <div
                                    class="project-card-title"
                                >

                                    <h3>
                                        ${project.name}
                                    </h3>

                                </div>


                                <span
                                    class="project-status ${statusClass}"
                                >
                                    ${project.status}
                                </span>

                            </div>


                            <p
                                class="project-card-description"
                            >
                                ${
                                    project.description ||
                                    "No description provided."
                                }
                            </p>


                            <div
                                class="project-card-info"
                            >

                                <div
                                    class="project-info-item"
                                >

                                    <span>
                                        Client
                                    </span>

                                    <strong>
                                        ${
                                            clientName ||
                                            "No client"
                                        }
                                    </strong>

                                </div>


                                <div
                                    class="project-info-item"
                                >

                                    <span>
                                        Tasks
                                    </span>

                                    <strong>
                                        ${completedTaskCount}/${taskCount}
                                    </strong>

                                </div>

                            </div>


                            <div
                                class="progress-header"
                            >

                                <span>
                                    Progress
                                </span>

                                <strong>
                                    ${progress}%
                                </strong>

                            </div>


                            <div
                                class="progress-bar"
                                aria-label="Project progress"
                            >

                                <div
                                    class="progress-fill"
                                    style="width: ${progress}%"
                                ></div>

                            </div>


                            <a
                                href="project.html?id=${project.id}"
                                class="view-project"
                            >

                                Open Project

                                <span aria-hidden="true">
                                    →
                                </span>

                            </a>

                        </article>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   SEARCH EVENT
========================================================= */

projectSearchInput.addEventListener(
    "input",
    () => {

        searchTerm =
            projectSearchInput.value;


        displayProjects();

    }
);


/* =========================================================
   STATUS FILTER EVENT
========================================================= */

projectStatusFilter.addEventListener(
    "change",
    () => {

        selectedStatus =
            projectStatusFilter.value;


        displayProjects();

    }
);


/* =========================================================
   CLEAR FILTERS
========================================================= */

function clearProjectFilters() {

    searchTerm =
        "";


    selectedStatus =
        "all";


    projectSearchInput.value =
        "";


    projectStatusFilter.value =
        "all";


    displayProjects();

}


clearProjectFiltersButton.addEventListener(
    "click",
    clearProjectFilters
);


/* =========================================================
   CREATE PROJECT MODAL
========================================================= */

function openCreateProjectModal() {

    projectForm.reset();


    projectModal.classList.remove(
        "hidden"
    );


    projectName.focus();

}


function closeProjectModal() {

    projectModal.classList.add(
        "hidden"
    );


    projectForm.reset();

}


/* =========================================================
   CREATE PROJECT
========================================================= */

async function createProject() {

    const selectedClientId =
        projectClient.value;


    const projectData = {

        name:
            projectName.value.trim(),

        description:
            projectDescription.value.trim(),

        client_id:
            selectedClientId
                ? Number(selectedClientId)
                : null

    };


    if (
        !projectData.name
    ) {

        showError(
            "Project name required",
            "Please enter a name for your project."
        );


        return;

    }


    try {

        const response =
            await authFetch(
                `${API_URL}/projects/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            projectData
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


        closeProjectModal();


        await loadProjects();


    } catch (error) {

        console.error(
            "Error creating project:",
            error
        );


        showError(
            "Unable to create project",
            error.message
        );

    }

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

projectForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        await createProject();

    }
);


newProjectButton.addEventListener(
    "click",
    openCreateProjectModal
);


cancelProjectButton.addEventListener(
    "click",
    closeProjectModal
);


projectModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            projectModal
        ) {

            closeProjectModal();

        }

    }
);


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
   START PROJECTS PAGE
========================================================= */

async function startProjectsPage() {

    await Promise.all([
        loadClients(),
        loadProjects(),
        loadTasks()
    ]);


    displayProjects();

}


startProjectsPage();
