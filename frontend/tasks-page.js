/* =========================================================
   DEVFLOW TASKS PAGE
========================================================= */

requireAuth();


/* =========================================================
   API
========================================================= */

const API_URL =
    "https://devflow-backend-nkaq.onrender.com";


/* =========================================================
   ELEMENTS
========================================================= */

const tasksContainer =
    document.getElementById(
        "tasks-container"
    );


const totalTasksElement =
    document.getElementById(
        "total-tasks"
    );


const pendingTasksElement =
    document.getElementById(
        "pending-tasks"
    );


const inProgressTasksElement =
    document.getElementById(
        "in-progress-tasks"
    );


const completedTasksElement =
    document.getElementById(
        "completed-tasks"
    );


/* =========================================================
   DATA
========================================================= */

let tasks = [];

let projects = [];


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


    } catch (error) {

        console.error(
            "Error loading tasks:",
            error
        );


        tasksContainer.innerHTML = `
            <div class="empty-state">

                <h3>
                    Unable to load tasks
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


    } catch (error) {

        console.error(
            "Error loading projects:",
            error
        );

    }

}


/* =========================================================
   GET PROJECT NAME
========================================================= */

function getProjectName(
    projectId
) {

    const project =
        projects.find(
            (item) =>
                item.id === projectId
        );


    if (!project) {

        return "Unknown Project";

    }


    return project.name;

}


/* =========================================================
   FORMAT STATUS
========================================================= */

function formatTaskStatus(
    status
) {

    if (
        status === "in-progress"
    ) {

        return "In Progress";

    }


    if (
        status === "completed"
    ) {

        return "Completed";

    }


    if (
        status === "pending"
    ) {

        return "Pending";

    }


    return status;

}


/* =========================================================
   STATUS CLASS
========================================================= */

function getTaskStatusClass(
    status
) {

    if (
        status === "completed"
    ) {

        return "task-status-completed";

    }


    if (
        status === "in-progress"
    ) {

        return "task-status-progress";

    }


    if (
        status === "pending"
    ) {

        return "task-status-pending";

    }


    return "task-status-default";

}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateTaskSummary() {

    const total =
        tasks.length;


    const pending =
        tasks.filter(
            (task) =>
                task.status ===
                "pending"
        ).length;


    const inProgress =
        tasks.filter(
            (task) =>
                task.status ===
                "in-progress"
        ).length;


    const completed =
        tasks.filter(
            (task) =>
                task.status ===
                "completed"
        ).length;


    totalTasksElement.textContent =
        total;


    pendingTasksElement.textContent =
        pending;


    inProgressTasksElement.textContent =
        inProgress;


    completedTasksElement.textContent =
        completed;

}


/* =========================================================
   DISPLAY TASKS
========================================================= */

function displayTasks() {

    if (
        tasks.length === 0
    ) {

        tasksContainer.innerHTML = `
            <div class="empty-state">

                <h3>
                    No tasks yet
                </h3>

                <p>
                    Create a task inside a project to see it here.
                </p>

                <a
                    href="projects.html"
                    class="primary-button"
                >
                    View Projects
                </a>

            </div>
        `;

        return;

    }


    const sortedTasks =
        tasks
            .slice()
            .reverse();


    tasksContainer.innerHTML =
        sortedTasks
            .map(
                (task) => {

                    const projectName =
                        getProjectName(
                            task.project_id
                        );


                    const statusClass =
                        getTaskStatusClass(
                            task.status
                        );


                    const formattedStatus =
                        formatTaskStatus(
                            task.status
                        );


                    return `
                        <article
                            class="task-page-card"
                        >

                            <div
                                class="task-page-main"
                            >

                                <div
                                    class="task-page-card-header"
                                >

                                    <div>

                                        <h3>
                                            ${task.title}
                                        </h3>

                                        <p>
                                            ${
                                                task.description ||
                                                "No description provided."
                                            }
                                        </p>

                                    </div>


                                    <span
                                        class="task-status-badge ${statusClass}"
                                    >
                                        ${formattedStatus}
                                    </span>

                                </div>



                                <div
                                    class="task-page-meta"
                                >

                                    <span
                                        class="task-page-meta-item"
                                    >

                                        <span>
                                            Project
                                        </span>

                                        <strong>
                                            ${projectName}
                                        </strong>

                                    </span>


                                    <span
                                        class="task-page-meta-item"
                                    >

                                        <span>
                                            Priority
                                        </span>

                                        <strong>
                                            ${task.priority}
                                        </strong>

                                    </span>


                                    ${
                                        task.due_date
                                            ? `
                                                <span
                                                    class="task-page-meta-item"
                                                >

                                                    <span>
                                                        Due date
                                                    </span>

                                                    <strong>
                                                        ${task.due_date}
                                                    </strong>

                                                </span>
                                            `
                                            : ""
                                    }

                                </div>

                            </div>



                            <a
                                href="project.html?id=${task.project_id}"
                                class="secondary-button task-view-button"
                            >
                                View Project
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
   START TASKS PAGE
========================================================= */

async function startTasksPage() {

    await Promise.all([
        loadProjects(),
        loadTasks()
    ]);


    updateTaskSummary();


    displayTasks();

}


startTasksPage();

