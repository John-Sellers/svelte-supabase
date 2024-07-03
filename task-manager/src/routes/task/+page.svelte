<script lang="ts">
    import { onMount } from "svelte"; // Lifecycle function to run code when the component is mounted
    import { supabase } from "../../supabaseClient"; // Import supabase client for authentication and database operations
    import type { Task } from "../../type"; // Import the Task type definition
    import { goto } from "$app/navigation"; // Import navigation function to redirect users
    import styles from "./task.module.css"; // Import CSS module for styling

    // Define component state variables
    let tasks: Task[] = []; // Array to store the list of tasks with type annotation indicating it's an array of Task objects
    let newTask: Omit<Task, "id" | "created_at"> = {
        title: "", // Initial empty title for the new task
        description: "", // Initial empty description for the new task
        is_complete: false, // Initial completion status for the new task
        user_id: "", // Initial user ID for the new task (will be set later)
    };
    let id: string = ""; // Variable to store the user ID with type annotation indicating it's a string
    let userEmail: string = ""; // Variable to store the user email with type annotation indicating it's a string

    // Function to fetch user tasks from the database
    const fetchUserTasks = async () => {
        try {
            // Get the current session data
            const { data: sessionData, error: sessionError } =
                await supabase.auth.getSession();
            if (sessionError) {
                console.error("Error fetching session:", sessionError); // Log session fetch error
                return;
            }

            if (sessionData.session?.user) {
                userEmail = sessionData.session.user.email || ""; // Set user email
                id = sessionData.session.user.id || "1"; // Set user ID

                newTask.user_id = id; // Set user ID in new task

                // Query the Task table to get tasks for the user
                const { data: tasksData, error: tasksError } = await supabase
                    .from("task")
                    .select("*")
                    .eq("user_id", id);

                if (tasksError) {
                    console.error("Error fetching tasks:", tasksError); // Log tasks fetch error
                    return;
                }

                console.log("Tasks:", tasksData); // Log tasks

                tasks = tasksData; // Set tasks state
            } else {
                goto("/login"); // Redirect to login if no user is found
            }
        } catch (err) {
            console.error("Unexpected error fetching user tasks:", err); // Log any unexpected errors
        }
    };

    // Function to add a new task
    const addTask = async () => {
        try {
            const { error } = await supabase.from("task").insert([newTask]);

            if (error) {
                console.error("Error adding task:", error); // Log task addition error
                return;
            }

            // Fetch updated tasks list
            fetchUserTasks();

            // Reset newTask fields
            newTask = {
                title: "",
                description: "",
                is_complete: false,
                user_id: id,
            };
        } catch (err) {
            console.error("Unexpected error adding task:", err); // Log any unexpected errors
        }
    };

    // Function to remove a task
    const removeTask = async (taskId: string) => {
        try {
            const { error } = await supabase
                .from("task")
                .delete()
                .eq("id", taskId);

            if (error) {
                console.error("Error removing task:", error); // Log task removal error
                return;
            }

            tasks = tasks.filter((task) => task.id !== taskId); // Remove the task from the tasks array
        } catch (err) {
            console.error("Unexpected error removing task:", err); // Log any unexpected errors
        }
    };

    // Function to log out the user
    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut(); // Sign out the user
            if (error) {
                console.error("Error signing out:", error); // Log sign out error
            } else {
                goto("/login"); // Redirect to login page
            }
        } catch (err) {
            console.error("Unexpected error logging out:", err); // Log any unexpected errors
        }
    };

    // Run the fetchUserTasks function when the component is mounted
    onMount(fetchUserTasks);
</script>

<!-- HTML template for the component -->
<div class={styles.container}>
    <h1>Task Management</h1>
    <!-- Header for the task management section -->
    <h5>Email: {userEmail}</h5>
    <h5>ID: {id}</h5>
    <!-- Display the user ID -->

    <!-- Form to add a new task -->
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
        <!-- Button to submit the form and add the task -->
    </form>

    <!-- Container for sticky notes -->
    <div class={styles.stickyNotesContainer}>
        {#each tasks as task}
            <div class={styles.stickyNote}>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <button on:click={() => removeTask(task.id)}>Delete</button>
            </div>
        {/each}
    </div>

    <button on:click={logout}>Logout</button>
    <!-- Button to log out the user -->

    <!-- Navigation links -->
    <nav>
        <ul>
            <li><a href="/">Home</a></li>
            <!-- Link to home page -->
            <li><a href="/login">Login</a></li>
            <!-- Link to login page -->
        </ul>
    </nav>
</div>
