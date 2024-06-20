<script>
    // Declare a prop named 'data' to receive data from the parent component.
    export let data;
    import { goto, invalidate, invalidateAll } from "$app/navigation";
    import styles from "./Layout.module.css";

    // Import the 'Auth' component from the '@supabase/auth-ui-svelte' package for authentication.
    import { Auth } from "@supabase/auth-ui-svelte";

    // Import the 'ThemeSupa' theme from the '@supabase/auth-ui-svelte' package for authentication.
    import { ThemeSupa } from "@supabase/auth-ui-shared";

    // Destructure 'supabase' and 'session' from the 'data' prop.
    let { supabase, session } = data;

    // Reactive statement to update 'supabase' and 'session' when 'data' changes.
    $: ({ supabase, session } = data);

    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN") {
            invalidateAll();
        }

        if (event === "SIGNED_OUT") {
            await goto("/login");
            invalidateAll();
        }
    });
</script>

<nav class={styles.nav}>
    <div class={styles.navContainer}>
        <div class={styles.navLinks}>
            <a href="/" class={styles.navLink}>PokePage</a>
            {#if session !== null}
                <a href="/{session.user.email}" class={styles.navLink}
                    >My Page</a
                >
            {/if}
        </div>
        <div class={styles.navButtons}>
            {#if session === null}
                <button on:click={() => goto("/login")} class={styles.login}>
                    Login
                </button>
            {:else}
                <span>Welcome, {session.user.email}</span>
                <button
                    on:click={async () => {
                        await supabase.auth.signOut();
                    }}
                    class={styles.logout}
                >
                    Logout
                </button>
            {/if}
        </div>
    </div>
</nav>

<slot></slot>
