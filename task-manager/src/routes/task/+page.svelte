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

    const fetchUserTasks = async () => {
        try {
            const { data: sessionData, error: sessionError } =
                await supabase.auth.getSession();
            if (sessionError) {
                console.error("Error fetching session:", sessionError);
                errorMessage = "Failed to fetch session. Please try again.";
                return;
            }

            if (sessionData.session?.user) {
                userEmail = sessionData.session.user.email || "";
                id = sessionData.session.user.id || "1";
                newTask.user_id = id;

                const { data: tasksData, error: tasksError } = await supabase
                    .from("task")
                    .select("*")
                    .eq("user_id", id);

                if (tasksError) {
                    console.error("Error fetching tasks:", tasksError);
                    errorMessage = "Failed to fetch tasks. Please try again.";
                    return;
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

    const removeTask = async (taskId: string) => {
        try {
            const { error } = await supabase
                .from("task")
                .delete()
                .eq("id", taskId);

            if (error) {
                console.error("Error removing task:", error);
                errorMessage = "Failed to remove task. Please try again.";
                return;
            }

            tasks = tasks.filter((task) => task.id !== taskId);
        } catch (err) {
            console.error("Unexpected error removing task:", err);
            errorMessage = "Unexpected error occurred. Please try again.";
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
                        <button on:click={() => removeTask(task.id)}
                            >Delete</button
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
    {/if}
</div>
