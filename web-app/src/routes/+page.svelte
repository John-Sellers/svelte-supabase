<script>
    import { goto } from "$app/navigation";
    import styles from "./Page.module.css";
</script>

<div class={styles.page}>
    <div class={styles.heroContent}>
        <div class={styles.heroText}>
            <h1 class={styles.heroTitle}>Welcome to PokePage</h1>
            <p class={styles.heroSubtitle}>Create an account to get started</p>
            <button class={styles.heroButton} on:click={() => goto("/signup")}
                >Create An Account</button
            >
        </div>
    </div>
</div>
