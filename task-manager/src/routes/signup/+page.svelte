<script lang="ts">
    import { supabase } from "../../supabaseClient"; // Ensure this is correctly configured
    import { goto } from "$app/navigation";
    import styles from "./signup.module.css";

    let email = "";
    let password = "";
    let errorMessage = ""; // Variable to store error messages for user feedback

    // Define the type for the auth data response
    type AuthData = {
        user: {
            id: string;
        };
    };

    // Function to handle the sign-up process
    const signUp = async () => {
        errorMessage = ""; // Reset the error message at the start

        // Call Supabase's signUp method with the email and password
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        // Check for errors in the sign-up process
        if (error) {
            // Log the error to the console and set the error message for user feedback
            console.error("Error signing up:", error);
            errorMessage = error.message || "An error occurred during sign-up.";
        } else {
            // Type assertion to let TypeScript know the shape of authData
            const authData = data as AuthData;
            console.log("User signed up:", authData.user);

            // Insert user data into the custom "users" table
            const { data: insertData, error: insertError } = await supabase
                .from("users")
                .insert([{ id: authData.user.id, email }]);

            // Check for errors in inserting data into the custom "users" table
            if (insertError) {
                console.error(
                    "Error inserting user into custom users table:",
                    insertError,
                );
                errorMessage =
                    insertError.message || "An error occurred during sign-up.";
            } else {
                console.log(
                    "User inserted into custom users table:",
                    insertData,
                );
                // Redirect to the login page after successful sign-up
                goto("/login");
            }
        }
    };
</script>

<!-- HTML template for the sign-up form -->
<div class={styles.container}>
    <h1>Sign Up</h1>

    <!-- Form for user sign-up -->
    <form on:submit|preventDefault={signUp}>
        <!-- Input field for email -->
        <input type="email" bind:value={email} placeholder="Email" required />
        <!-- Input field for password -->
        <input
            type="password"
            bind:value={password}
            placeholder="Password"
            required
        />
        <!-- Submit button for the form -->
        <button type="submit">Sign Up</button>
    </form>

    <!-- Display error message if any -->
    {#if errorMessage}
        <p class="error">{errorMessage}</p>
    {/if}

    <!-- Navigation links -->
    <nav>
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/login">Login</a></li>
        </ul>
    </nav>
</div>

<style>
    /* Add basic styles for the error message */
    .error {
        color: red;
    }
</style>
