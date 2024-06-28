<script lang="ts">
    import { supabase } from "../../supabaseClient";
    import { goto } from "$app/navigation";
    let email = "";
    let password = "";

    const signUp = async () => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) {
            console.error("Error signing up:", error);
        } else {
            console.log("User signed up:", data.user);
            goto("/login");
        }
    };
</script>

<h1>Sign Up</h1>

<form on:submit|preventDefault={signUp}>
    <input type="email" bind:value={email} placeholder="Email" required />
    <input
        type="password"
        bind:value={password}
        placeholder="Password"
        required
    />
    <button type="submit">Sign Up</button>
</form>
