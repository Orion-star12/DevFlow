/* =========================================================
   DEVFLOW DASHBOARD
========================================================= */


/* =========================
   AUTHENTICATION
========================= */

requireAuth();


/* =========================
   API
========================= */

const API_URL =
    "http://127.0.0.1:8000";


/* =========================
   DASHBOARD ELEMENTS
========================= */

const totalProjects =
    document.getElementById(
        "total-projects"
    );


const activeProjects =
    document.getElementById(
        "active-projects"
    );


const totalTasks =
    document.getElementById(
        "total-tasks"
    );


const completedTasks =
    document.getElementById(
        "completed-tasks"
    );


const recentProjects =
    document.getElementById(
        "recent-projects"
    );


const recentTasks =
    document.getElementById(
        "recent-tasks"
    );


/* =========================
   DASHBOARD DATA
========================= */

let projects = [];

let tasks = [];

let clients = [];


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


        updateProjectStats();


        displayRecentProjects();


    } catch (error) {

        console.error(
            "Error loading projects:",
            error
        );


        recentProjects.innerHTML = `
            <div class="empty-state">

                <h3>
                    Unable to load projects
                </h3>

                <p>
                    Make sure the DevFlow backend
                    is running.
                </p>

            </div>
        `;

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


        /*
            Projects may already have
            loaded before clients.

            Reload the project cards so
            client names can appear.
        */

        displayRecentProjects();


    } catch (error) {

        console.error(
            "Error loading clients:",
            error
        );

    }

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


        updateTaskStats();


        displayRecentTasks();


        /*
            Project progress depends
            on task information.

            Therefore, refresh the
            project cards after tasks
            have loaded.
        */

        displayRecentProjects();


    } catch (error) {

        console.error(
            "Error loading tasks:",
            error
        );


        recentTasks.innerHTML = `
            <div class="empty-state">

                <h3>
                    Unable to load tasks
                </h3>

                <p>
                    Make sure the DevFlow backend
                    is running.
                </p>

            </div>
        `;

    }

}


/* =========================================================
   UPDATE PROJECT STATISTICS
========================================================= */

function updateProjectStats() {

    const total =
        projects.length;


    const active =
        projects.filter(
            (project) =>
                project.status === "active"
        ).length;


    totalProjects.textContent =
        total;


    activeProjects.textContent =
        active;

}


/* =========================================================
   UPDATE TASK STATISTICS
========================================================= */

function updateTaskStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            (task) =>
                task.status === "completed"
        ).length;


    totalTasks.textContent =
        total;


    completedTasks.textContent =
        completed;

}


/* =========================================================
   CALCULATE PROJECT PROGRESS
========================================================= */

function calculateProjectProgress(
    projectId
) {

    const projectTasks =
        tasks.filter(
            (task) =>
                task.project_id === projectId
        );


    /*
        A project with no tasks has
        no measurable progress yet.
    */

    if (
        projectTasks.length === 0
    ) {

        return 0;

    }


    const completedProjectTasks =
        projectTasks.filter(
            (task) =>
                task.status === "completed"
        );


    const progress =
        (
            completedProjectTasks.length /
            projectTasks.length
        ) * 100;


    return Math.round(
        progress
    );

}


/* =========================================================
   DISPLAY RECENT PROJECTS
========================================================= */

function displayRecentProjects() {

    if (
        projects.length === 0
    ) {

        recentProjects.innerHTML = `
            <div class="empty-state">

                <h3>
                    No projects yet
                </h3>

                <p>
                    Create your first project
                    to see it here.
                </p>

            </div>
        `;

        return;

    }


    /*
        Show the five newest projects.

        We reverse a copy so that
        the original projects array
        remains unchanged.
    */

    const recent =
        projects
            .slice(-5)
            .reverse();


    recentProjects.innerHTML =
        recent
            .map(
                (project) => {

                    const progress =
                        calculateProjectProgress(
                            project.id
                        );


                    const clientName =
                        getClientName(
                            project.client_id
                        );


                    return `
                        <a
                            href="project.html?id=${project.id}"
                            class="dashboard-item project-dashboard-item"
                        >

                            <div class="dashboard-item-top">

                                <div>

                                    <h4>
                                        ${project.name}
                                    </h4>

                                    <p>
                                        ${
                                            project.description ||
                                            "No description provided."
                                        }
                                    </p>

                                </div>

                                <span
                                    class="dashboard-item-arrow"
                                    aria-hidden="true"
                                >
                                    →
                                </span>

                            </div>


                            <div class="dashboard-item-meta">

                                <span class="dashboard-badge">
                                    ${project.status}
                                </span>


                                ${
                                    clientName
                                        ? `
                                            <span class="dashboard-badge">
                                                ${clientName}
                                            </span>
                                        `
                                        : ""
                                }

                            </div>


                            <div class="progress-header">

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

                        </a>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   DISPLAY RECENT TASKS
========================================================= */

function displayRecentTasks() {

    if (
        tasks.length === 0
    ) {

        recentTasks.innerHTML = `
            <div class="empty-state">

                <h3>
                    No tasks yet
                </h3>

                <p>
                    Create a task inside
                    a project to see it here.
                </p>

            </div>
        `;

        return;

    }


    /*
        Show the five newest tasks.
    */

    const recent =
        tasks
            .slice(-5)
            .reverse();


    recentTasks.innerHTML =
        recent
            .map(
                (task) => {

                    return `
                        <a
                            href="project.html?id=${task.project_id}"
                            class="dashboard-item task-dashboard-item"
                        >

                            <div class="dashboard-item-top">

                                <div>

                                    <h4>
                                        ${task.title}
                                    </h4>

                                    <p>
                                        ${
                                            task.description ||
                                            "No description provided."
                                        }
                                    </p>

                                </div>

                                <span
                                    class="dashboard-item-arrow"
                                    aria-hidden="true"
                                >
                                    →
                                </span>

                            </div>


                            <div class="dashboard-item-meta">

                                <span class="dashboard-badge">
                                    ${task.priority}
                                </span>


                                <span class="dashboard-badge">
                                    ${task.status}
                                </span>


                                ${
                                    task.due_date
                                        ? `
                                            <span class="dashboard-badge">
                                                Due:
                                                ${task.due_date}
                                            </span>
                                        `
                                        : ""
                                }

                            </div>

                        </a>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   START DASHBOARD
========================================================= */

async function startDashboard() {

    /*
        Load all dashboard data.

        Promise.all allows the three
        requests to happen together
        instead of waiting for one to
        finish before starting another.
    */

    await Promise.all(
        [
            loadProjects(),
            loadClients(),
            loadTasks()
        ]
    );


    /*
        Refresh everything one final time
        after all data has loaded.

        This makes sure:
        - project counts are correct
        - task counts are correct
        - client names are available
        - project progress is available
    */

    updateProjectStats();

    updateTaskStats();

    displayRecentProjects();

    displayRecentTasks();

}


/* =========================================================
   START
========================================================= */

startDashboard();