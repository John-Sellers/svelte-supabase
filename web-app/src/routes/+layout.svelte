<script>
    import { goto } from "$app/navigation";
    import styles from "./Layout.module.css";
</script>

<nav class={styles.nav}>
    <div class={styles.navContainer}>
        <div class={styles.navLinks}>
            <a href="/" class={styles.navLink}>PokePage</a>
            <a href="/user" class={styles.navLink}>My Page</a>
        </div>
        <div class={styles.navButtons}>
            <span class={styles.welcome}>Welcome, John</span>
            <button on:click={() => goto("/login")} class={styles.login}>
                Login
            </button>
            <button on:click={() => goto("/logout")} class={styles.logout}>
                Logout
            </button>
        </div>
    </div>
</nav>

<slot></slot>
