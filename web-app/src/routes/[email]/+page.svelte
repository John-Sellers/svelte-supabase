<script lang="ts">
    import { page } from "$app/stores";
    import styles from "./Page.module.css";

    $: email = $page.params.email;
</script>

<div class={styles.page}>
    <div class={styles.heroContent}>
        <div class={styles.heroText}>
            <h1 class={styles.heroTitle}>{email} Page</h1>
            <p>User description here...</p>
        </div>
    </div>
</div>
