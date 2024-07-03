<script lang="ts">
    import { onMount } from "svelte";
    import { supabase } from "../../supabaseClient";
    import type { Task } from "../../type";
    import { goto } from "$app/navigation";
    import styles from "./task.module.css";

    let tasks: Task[] = [];
    let newTask: Omit<Task, "id" | "created_at"> = {
        title: "",
        description: "",
        is_complete: false,
        user_id: "",
    };
    let id: string = "";
    let userEmail: string = "";
    let loading = true;
    let errorMessage = "";
    let showModal = false;
    let showDeleteModal = false;
    let taskToEdit: Task | null = null;
    let taskToDelete: Task | null = null;

    const fetchUserTasks = async () => {
        try {
            const { data: sessionData, error: sessionError } =
                await supabase.auth.getSession();
            console.log("Session Data:", sessionData); // Debugging session data
            if (sessionError) {
                console.error("Error fetching session:", sessionError);
                errorMessage = "Failed to fetch session. Please try again.";
                return;
            }

            if (sessionData.session?.user) {
                userEmail = sessionData.session.user.email || "";
                id = sessionData.session.user.id || "";
                newTask.user_id = id;

                console.log("User ID:", id); // Debugging user ID

                const { data: tasksData, error: tasksError } = await supabase
                    .from("task")
                    .select("*")
                    .eq("user_id", id);

                console.log("Tasks Data:", tasksData); // Debugging tasks data
                if (tasksError) {
                    console.error("Error fetching tasks:", tasksError);
                    errorMessage = "Failed to fetch tasks. Please try again.";
                    return;
                }

                if (tasksData.length === 0) {
                    console.warn("No tasks found for the user ID:", id); // Log when no tasks are found
                }

                tasks = tasksData;
                loading = false;
            } else {
                goto("/login");
            }
        } catch (err) {
            console.error("Unexpected error fetching user tasks:", err);
            errorMessage = "Unexpected error occurred. Please try again.";
        } finally {
            loading = false;
        }
    };

    const addTask = async () => {
        try {
            const { error } = await supabase.from("task").insert([newTask]);

            if (error) {
                console.error("Error adding task:", error);
                errorMessage = "Failed to add task. Please try again.";
                return;
            }

            fetchUserTasks();
            newTask = {
                title: "",
                description: "",
                is_complete: false,
                user_id: id,
            };
        } catch (err) {
            console.error("Unexpected error adding task:", err);
            errorMessage = "Unexpected error occurred. Please try again.";
        }
    };

    const updateTask = async () => {
        if (taskToEdit) {
            try {
                const { error } = await supabase
                    .from("task")
                    .update({
                        title: taskToEdit.title,
                        description: taskToEdit.description,
                    })
                    .eq("id", taskToEdit.id);

                if (error) {
                    console.error("Error updating task:", error);
                    errorMessage = "Failed to update task. Please try again.";
                    return;
                }

                fetchUserTasks();
                showModal = false;
                taskToEdit = null;
            } catch (err) {
                console.error("Unexpected error updating task:", err);
                errorMessage = "Unexpected error occurred. Please try again.";
            }
        }
    };

    const confirmRemoveTask = (task: Task) => {
        taskToDelete = task;
        showDeleteModal = true;
    };

    const removeTask = async () => {
        if (taskToDelete) {
            try {
                const { error } = await supabase
                    .from("task")
                    .delete()
                    .eq("id", taskToDelete.id);

                if (error) {
                    console.error("Error removing task:", error);
                    errorMessage = "Failed to remove task. Please try again.";
                    return;
                }

                tasks = tasks.filter((task) => task.id !== taskToDelete.id);
                showDeleteModal = false;
                taskToDelete = null;
            } catch (err) {
                console.error("Unexpected error removing task:", err);
                errorMessage = "Unexpected error occurred. Please try again.";
            }
        }
    };

    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Error signing out:", error);
                errorMessage = "Failed to log out. Please try again.";
            } else {
                goto("/login");
            }
        } catch (err) {
            console.error("Unexpected error logging out:", err);
            errorMessage = "Unexpected error occurred. Please try again.";
        }
    };

    const openEditModal = (task: Task) => {
        taskToEdit = { ...task };
        showModal = true;
    };

    const closeEditModal = () => {
        showModal = false;
        taskToEdit = null;
    };

    const closeDeleteModal = () => {
        showDeleteModal = false;
        taskToDelete = null;
    };

    onMount(fetchUserTasks);
</script>

<div class={styles.container}>
    <h1>Task Management</h1>
    {#if loading}
        <p>Loading tasks...</p>
    {:else}
        {#if errorMessage}
            <p class={styles.error}>{errorMessage}</p>
        {/if}
        <h5>Email: {userEmail}</h5>
        <h5>ID: {id}</h5>

        <form on:submit|preventDefault={addTask}>
            <input
                type="text"
                bind:value={newTask.title}
                placeholder="Title"
                required
            />
            <input
                type="text"
                bind:value={newTask.description}
                placeholder="Description"
                required
            />
            <button type="submit">Add Task</button>
        </form>

        {#if tasks.length === 0}
            <p>No tasks found.</p>
        {:else}
            <div class={styles.stickyNotesContainer}>
                {#each tasks as task}
                    <div class={styles.stickyNote}>
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                        <button on:click={() => confirmRemoveTask(task)}
                            >Delete</button
                        >
                        <button on:click={() => openEditModal(task)}
                            >Update</button
                        >
                    </div>
                {/each}
            </div>
        {/if}

        <button on:click={logout}>Logout</button>

        <nav>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/login">Login</a></li>
            </ul>
        </nav>

        {#if showModal && taskToEdit}
            <div class="modal">
                <div class="modal-content">
                    <h3>Edit Task</h3>
                    <input
                        type="text"
                        bind:value={taskToEdit.title}
                        placeholder="Title"
                        required
                    />
                    <input
                        type="text"
                        bind:value={taskToEdit.description}
                        placeholder="Description"
                        required
                    />
                    <button on:click={updateTask}>Save</button>
                    <button on:click={closeEditModal}>Cancel</button>
                </div>
            </div>
        {/if}

        {#if showDeleteModal && taskToDelete}
            <div class="modal">
                <div class="modal-content">
                    <h3>Are you sure you want to delete this task?</h3>
                    <p>{taskToDelete.title}</p>
                    <button on:click={removeTask}>Yes, delete</button>
                    <button on:click={closeDeleteModal}>Cancel</button>
                </div>
            </div>
        {/if}
    {/if}
</div>
