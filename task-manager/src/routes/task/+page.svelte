<script lang="ts">
    import { onMount } from "svelte";
    import { createTask, readTask, deleteTask } from "../../api";
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
    let userId: string = "";
    let userEmail: string = "";

    const fetchUserTasks = async () => {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error fetching session:", error);
                return;
            }

            if (data.session?.user) {
                userEmail = data.session.user.email || "";

                // Query the Users table to get the user ID based on the email address
                const { data: userData, error: userError } = await supabase
                    .from("Users")
                    .select("id")
                    .eq("email", userEmail)
                    .single();

                if (userError) {
                    console.error("Error fetching user ID:", userError);
                    return;
                }

                userId = userData.id;
                newTask.user_id = userId;
                tasks = await readTask(userId);
            } else {
                goto("/login");
            }
        } catch (err) {
            console.error("Unexpected error fetching user tasks:", err);
        }
    };

    const addTask = async () => {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error fetching session:", error);
                return;
            }

            if (data.session?.user) {
                const createdTask = await createTask(newTask);
                if (createdTask) {
                    tasks = [...tasks, createdTask];
                    newTask = {
                        title: "",
                        description: "",
                        is_complete: false,
                        user_id: userId,
                    };
                }
            }
        } catch (err) {
            console.error("Unexpected error adding task:", err);
        }
    };

    const removeTask = async (id: string) => {
        try {
            const result = await deleteTask(id);
            if (result) {
                tasks = tasks.filter((task) => task.id !== id);
            }
        } catch (err) {
            console.error("Unexpected error removing task:", err);
        }
    };

    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Error signing out:", error);
            } else {
                goto("/login");
            }
        } catch (err) {
            console.error("Unexpected error logging out:", err);
        }
    };

    onMount(fetchUserTasks);
</script>

<div class={styles.container}>
    <h1>Task Management</h1>
    <h5>User Email: {userEmail}</h5>
    <h5>User ID: {userId}</h5>

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

    <ul>
        {#each tasks as task}
            <li>
                <strong>{task.title}</strong> - {task.description}
                <button on:click={() => removeTask(task.id)}>Delete</button>
            </li>
        {/each}
    </ul>

    <button on:click={logout}>Logout</button>

    <nav>
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/login">Login</a></li>
        </ul>
    </nav>
</div>
