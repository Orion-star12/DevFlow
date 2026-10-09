/* =========================================================
   DEVFLOW PROJECT TASKS
========================================================= */

requireAuth();


/* =========================================================
   TASK ELEMENTS
========================================================= */

const tasksContainer =
    document.getElementById(
        "tasks-container"
    );


const newTaskButton =
    document.getElementById(
        "new-task-button"
    );


const taskModal =
    document.getElementById(
        "task-modal"
    );


const closeTaskModalButton =
    document.getElementById(
        "close-task-modal"
    );


const cancelTaskButton =
    document.getElementById(
        "cancel-task-button"
    );


const taskForm =
    document.getElementById(
        "task-form"
    );


const taskTitle =
    document.getElementById(
        "task-title"
    );


const taskDescription =
    document.getElementById(
        "task-description"
    );


const taskPriority =
    document.getElementById(
        "task-priority"
    );


const taskDueDate =
    document.getElementById(
        "task-due-date"
    );


/* =========================================================
   EDIT TASK ELEMENTS
========================================================= */

const editTaskModal =
    document.getElementById(
        "edit-task-modal"
    );


const editTaskForm =
    document.getElementById(
        "edit-task-form"
    );


const editTaskTitle =
    document.getElementById(
        "edit-task-title"
    );


const editTaskDescription =
    document.getElementById(
        "edit-task-description"
    );


const editTaskPriority =
    document.getElementById(
        "edit-task-priority"
    );


const editTaskStatus =
    document.getElementById(
        "edit-task-status"
    );


const editTaskDueDate =
    document.getElementById(
        "edit-task-due-date"
    );


const closeEditTaskModalButton =
    document.getElementById(
        "close-edit-task-modal"
    );


const cancelEditTaskButton =
    document.getElementById(
        "cancel-edit-task-button"
    );


/* =========================================================
   API
========================================================= */

const TASKS_API_URL =
    "https://devflow-backend-nkaq.onrender.com";


/* =========================================================
   CURRENT EDITING TASK
========================================================= */

let editingTaskId = null;


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
   LOAD TASKS
========================================================= */

async function loadTasks() {

    const projectId =
        getProjectId();


    if (!projectId) {

        return;

    }


    try {

        const response =
            await authFetch(
                `${TASKS_API_URL}/tasks/project/${projectId}`
            );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        const tasks =
            await response.json();


        displayTasks(
            tasks
        );


        /*
            Update the project progress bar
            after loading the latest task data.
        */

        if (
            typeof updateProjectProgress ===
            "function"
        ) {

            /*
                Store the latest tasks globally
                for the project page.
            */

            projectTasks =
                tasks;


            updateProjectProgress();

        }


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
   DISPLAY TASKS
========================================================= */

function displayTasks(
    tasks
) {

    if (
        tasks.length === 0
    ) {

        tasksContainer.innerHTML = `
            <div class="empty-state">

                <h3>
                    No tasks yet
                </h3>

                <p>
                    Create your first task for this project.
                </p>

            </div>
        `;

        return;

    }


    tasksContainer.innerHTML =
        tasks
            .map(
                (task) => {

                    return `
                        <article
                            class="task-card"
                            data-task-id="${task.id}"
                        >

                            <div class="task-card-header">

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
                                    class="task-status-badge ${getTaskStatusClass(task.status)}"
                                >
                                    ${formatTaskStatus(task.status)}
                                </span>

                            </div>


                            <div class="task-meta">

                                <span
                                    class="task-priority"
                                >
                                    Priority:
                                    ${task.priority}
                                </span>


                                ${
                                    task.due_date
                                        ? `
                                            <span
                                                class="task-due-date"
                                            >
                                                Due:
                                                ${task.due_date}
                                            </span>
                                        `
                                        : ""
                                }

                            </div>


                            <div class="task-actions">

                                <button
                                    type="button"
                                    class="secondary-button edit-task-button"
                                    data-task-id="${task.id}"
                                >
                                    Edit
                                </button>


                                <button
                                    type="button"
                                    class="danger-button delete-task-button"
                                    data-task-id="${task.id}"
                                >
                                    Delete
                                </button>

                            </div>

                        </article>
                    `;

                }
            )
            .join("");


    addTaskButtonListeners();

}


/* =========================================================
   FORMAT TASK STATUS
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
   TASK STATUS CLASS
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
   CREATE TASK
========================================================= */

async function createTask(
    event
) {

    event.preventDefault();


    const projectId =
        getProjectId();


    const taskData = {

        project_id:
            Number(
                projectId
            ),

        title:
            taskTitle.value.trim(),

        description:
            taskDescription.value.trim(),

        priority:
            taskPriority.value,

        due_date:
            taskDueDate.value ||
            null

    };


    if (
        !taskData.title
    ) {

        showError(
            "Task title required",
            "Please enter a title for the task."
        );


        return;

    }


    try {

        const response =
            await authFetch(
                `${TASKS_API_URL}/tasks/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            taskData
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


        closeTaskModal();


        await loadTasks();

    } catch (error) {

        console.error(
            "Error creating task:",
            error
        );


        showError(
            "Unable to create task",
            error.message
        );

    }

}


/* =========================================================
   GET SINGLE TASK
========================================================= */

async function getTask(
    taskId
) {

    try {

        const response =
            await authFetch(
                `${TASKS_API_URL}/tasks/${taskId}`
            );


        if (!response.ok) {

            const errorData =
                await response.json();


            throw new Error(
                errorData.detail ||
                `Server returned ${response.status}`
            );

        }


        return await response.json();


    } catch (error) {

        console.error(
            "Error loading task:",
            error
        );


        showError(
            "Unable to load task",
            error.message
        );


        return null;

    }

}


/* =========================================================
   OPEN EDIT TASK MODAL
========================================================= */

async function openEditTaskModal(
    taskId
) {

    const task =
        await getTask(
            taskId
        );


    if (!task) {

        return;

    }


    editingTaskId =
        taskId;


    editTaskTitle.value =
        task.title;


    editTaskDescription.value =
        task.description ||
        "";


    editTaskPriority.value =
        task.priority;


    editTaskStatus.value =
        task.status;


    editTaskDueDate.value =
        task.due_date ||
        "";


    editTaskModal.classList.remove(
        "hidden"
    );


    editTaskTitle.focus();

}


/* =========================================================
   CLOSE EDIT TASK MODAL
========================================================= */

function closeEditTaskModal() {

    editTaskModal.classList.add(
        "hidden"
    );


    editingTaskId =
        null;


    editTaskForm.reset();

}


/* =========================================================
   UPDATE TASK
========================================================= */

async function updateTask(
    event
) {

    event.preventDefault();


    if (
        !editingTaskId
    ) {

        return;

    }


    const updatedTask = {

        title:
            editTaskTitle.value.trim(),

        description:
            editTaskDescription.value.trim(),

        priority:
            editTaskPriority.value,

        status:
            editTaskStatus.value,

        due_date:
            editTaskDueDate.value ||
            null

    };


    if (
        !updatedTask.title
    ) {

        showError(
            "Task title required",
            "Please enter a title for the task."
        );


        return;

    }


    try {

        const response =
            await authFetch(
                `${TASKS_API_URL}/tasks/${editingTaskId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            updatedTask
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


        closeEditTaskModal();


        await loadTasks();


    } catch (error) {

        console.error(
            "Error updating task:",
            error
        );


        showError(
            "Unable to update task",
            error.message
        );

    }

}


/* =========================================================
   OPEN DELETE CONFIRMATION
========================================================= */

function openTaskDeleteConfirmation(
    taskId
) {

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


    confirmTitle.textContent =
        "Delete Task";


    confirmMessage.textContent =
        "Are you sure you want to delete this task?";


    confirmActionButton.textContent =
        "Delete";


    confirmActionButton.dataset.taskId =
        taskId;


    confirmActionButton.dataset.action =
        "delete-task";


    confirmActionButton.dataset.projectId =
        "";


    const confirmModal =
        document.getElementById(
            "confirm-modal"
        );


    confirmModal.classList.remove(
        "hidden"
    );

}


/* =========================================================
   DELETE TASK
========================================================= */

async function deleteTask(
    taskId
) {

    try {

        const response =
            await authFetch(
                `${TASKS_API_URL}/tasks/${taskId}`,
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


        closeTaskConfirmation();


        await loadTasks();


    } catch (error) {

        console.error(
            "Error deleting task:",
            error
        );


        closeTaskConfirmation();


        showError(
            "Unable to delete task",
            error.message
        );

    }

}


/* =========================================================
   CLOSE TASK CONFIRMATION
========================================================= */

function closeTaskConfirmation() {

    const confirmModal =
        document.getElementById(
            "confirm-modal"
        );


    const confirmActionButton =
        document.getElementById(
            "confirm-action-button"
        );


    confirmModal.classList.add(
        "hidden"
    );


    confirmActionButton.dataset.taskId =
        "";


    confirmActionButton.dataset.action =
        "";


    confirmActionButton.dataset.projectId =
        "";

}


/* =========================================================
   TASK BUTTON LISTENERS
========================================================= */

function addTaskButtonListeners() {

    const editButtons =
        document.querySelectorAll(
            ".edit-task-button"
        );


    editButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const taskId =
                        button.dataset.taskId;


                    openEditTaskModal(
                        taskId
                    );

                }
            );

        }
    );


    const deleteButtons =
        document.querySelectorAll(
            ".delete-task-button"
        );


    deleteButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const taskId =
                        button.dataset.taskId;


                    openTaskDeleteConfirmation(
                        taskId
                    );

                }
            );

        }
    );

}


/* =========================================================
   CREATE TASK MODAL
========================================================= */

function openTaskModal() {

    taskForm.reset();


    taskModal.classList.remove(
        "hidden"
    );


    taskTitle.focus();

}


function closeTaskModal() {

    taskModal.classList.add(
        "hidden"
    );


    taskForm.reset();

}


/* =========================================================
   TASK EVENTS
========================================================= */

newTaskButton.addEventListener(
    "click",
    openTaskModal
);


closeTaskModalButton.addEventListener(
    "click",
    closeTaskModal
);


cancelTaskButton.addEventListener(
    "click",
    closeTaskModal
);


taskForm.addEventListener(
    "submit",
    createTask
);


taskModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === taskModal
        ) {

            closeTaskModal();

        }

    }
);


/* =========================================================
   EDIT TASK EVENTS
========================================================= */

if (
    closeEditTaskModalButton
) {

    closeEditTaskModalButton.addEventListener(
        "click",
        closeEditTaskModal
    );

}


cancelEditTaskButton.addEventListener(
    "click",
    closeEditTaskModal
);


editTaskForm.addEventListener(
    "submit",
    updateTask
);


editTaskModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === editTaskModal
        ) {

            closeEditTaskModal();

        }

    }
);


/* =========================================================
   TASK DELETE EVENT
========================================================= */

document.addEventListener(
    "devflow-delete-task",
    (event) => {

        const taskId =
            event.detail.taskId;


        deleteTask(
            taskId
        );

    }
);


/* =========================================================
   START TASK SYSTEM
========================================================= */

loadTasks();

