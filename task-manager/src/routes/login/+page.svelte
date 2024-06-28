<script lang="ts">
    import { supabase } from "../../supabaseClient";
    import { goto } from "$app/navigation";
    let email = "";
    let password = "";

    const signIn = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            console.error("Error signing in:", error);
        } else {
            console.log("User signed in:", data.user);
            goto("/task");
        }
    };
</script>

<h1>Login</h1>

<form on:submit|preventDefault={signIn}>
    <input type="email" bind:value={email} placeholder="Email" required />
    <input
        type="password"
        bind:value={password}
        placeholder="Password"
        required
    />
    <button type="submit">Login</button>
</form>
