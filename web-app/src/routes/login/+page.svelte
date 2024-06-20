<script lang="ts">
    // Declare a prop named 'data' to receive data from the parent component.
    export let data;

    // Import the 'Auth' component from the '@supabase/auth-ui-svelte' package for authentication.
    import { Auth } from "@supabase/auth-ui-svelte";

    // Import the CSS module for scoped styling.
    import styles from "./Page.module.css";

    // Import the 'ThemeSupa' theme from the '@supabase/auth-ui-svelte' package for authentication.
    import { ThemeSupa } from "@supabase/auth-ui-shared";
    import { goto } from "$app/navigation";

    // Destructure 'supabase' and 'session' from the 'data' prop.
    let { supabase, session } = data;

    // Reactive statement to update 'supabase' and 'session' when 'data' changes.
    $: ({ supabase, session } = data);

    //
    $: if (session) {
        goto("/");
    }
</script>

<!-- Main container div with a class from the imported CSS module for styling -->
<div class={styles.container}>
    <!-- Inner container div with a class from the imported CSS module for styling -->
    <div class={styles.innerContainer}>
        <!-- Paragraph providing instruction to the user -->
        <p>
            Create an account to get started or login if you already have an
            account
        </p>
        <!-- Auth component for handling authentication -->
        <Auth
            supabaseClient={supabase}
            theme="dark"
            appearance={{
                style: {
                    input: `
                        width: 350px;
                        padding: 10px;
                        border: 1px solid var(--color-gray-300);
                        border-radius: 5px;
                        margin-bottom: 10px;
                    `, // Apply inline styles to the input element
                    button: `
                        background-color: var(--color-primary);
                        width: 350px;
                        color: var(--color-white);
                        padding: 10px 20px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    `, // Apply inline styles to button element
                    container: `
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    `, // Apply inline styles to the container element
                },
            }}
        />
    </div>
</div>
