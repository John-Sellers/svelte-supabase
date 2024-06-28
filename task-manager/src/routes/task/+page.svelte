<script lang="ts">
    import { onMount } from "svelte";
    import { createTask, readTask, updateTask, deleteTask } from "../../api";
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

    const fetchUserTasks = async () => {
        const {
            data: { session },
            error,
        } = await supabase.auth.getSession();
        if (error) {
            console.error("Error fetching session:", error);
            return;
        }

        if (session?.user) {
            newTask.user_id = session.user.id;
            tasks = await readTask(session.user.id);
        } else {
            goto("/login");
        }
    };

    const addTask = async () => {
        const {
            data: { session },
            error,
        } = await supabase.auth.getSession();
        if (error) {
            console.error("Error fetching session:", error);
            return;
        }

        if (session?.user) {
            const createdTask = await createTask(newTask);
            if (createdTask) {
                tasks = [...tasks, createdTask];
                newTask = {
                    title: "",
                    description: "",
                    is_complete: false,
                    user_id: session.user.id,
                };
            }
        }
    };

    const removeTask = async (id: string) => {
        const result = await deleteTask(id);
        if (result) {
            tasks = tasks.filter((task) => task.id !== id);
        }
    };

    onMount(fetchUserTasks);
</script>

<div class={styles.container}>
    <h1>Task Management</h1>

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

    <nav>
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/login">Login</a></li>
        </ul>
    </nav>
</div>
