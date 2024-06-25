<!-- src/routes/tasks.svelte -->
<script lang="ts">
    import { onMount } from "svelte";
    import { createTask, updateTask, deleteTask, getTasks } from "../api/api";
    import { supabase } from "../supabaseClient";
    import type { Task } from "../type";

    let tasks: Task[] = [];
    let newTask: Omit<Task, "id" | "created_at"> = {
        title: "",
        description: "",
        is_complete: false,
        user_id: "",
    };

    const fetchUserTasks = async () => {
        const { user } = supabase.auth.session();
        if (user) {
            newTask.user_id = user.id;
            tasks = await getTasks(user.id);
        }
    };

    const addTask = async () => {
        const { user } = supabase.auth.session();
        if (user) {
            await createTask(newTask);
            newTask = {
                title: "",
                description: "",
                is_complete: false,
                user_id: user.id,
            };
            fetchUserTasks();
        }
    };

    const removeTask = async (id: string) => {
        await deleteTask(id);
        fetchUserTasks();
    };

    onMount(fetchUserTasks);
</script>

<h1>Task Management</h1>

<form on:submit|preventDefault={addTask}>
    <input type="text" bind:value={newTask.title} placeholder="Title" />
    <input
        type="text"
        bind:value={newTask.description}
        placeholder="Description"
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
