<script lang="ts">
    import { page } from "$app/stores";
    import styles from "./Page.module.css";
    import { getPokemonList, getPokemon } from "$lib/pokemonAPI";
    export let data;

    let { supabase, session } = data;
    $: ({ supabase, session } = data);
    $: email = $page.params.email;

    let pokemonList: any = [];
    let pokemonData: any = [];
    let profile: any = {
        description: "This is your description, change it!",
        pokemon_ids: [1, 2, 3],
    };
    let isModalOpen = false;

    async function refreshPokemonData() {
        pokemonData = [];

        profile.pokemon_ids.map(async (id: number) => {
            const data = await getPokemon(id.toString());

            if (pokemonData === undefined) {
                pokemonData = [data];
            } else {
                pokemonData = [...pokemonData, data];
            }
        });
    }

    async function saveProfile() {
        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", email);

        if (profileData?.length === 0) {
            const { data, error } = await supabase.from("profiles").insert({
                ...profile,
                user_id: session?.user?.id,
                email: session?.user?.email,
            });
        } else {
            const { data, error } = await supabase
                .from("profiles")
                .update(profile)
                .eq("user_id", session?.user?.id);
        }
    }

    async function savePageEdits() {
        console.log("Save Page Edits");
        // Update the profile in the database
        await saveProfile();
        // Close the modal
        isModalOpen = false;
    }

    page.subscribe(async () => {
        pokemonList = await getPokemonList();

        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("description, pokemon_ids")
            .eq("email", email);

        if (profileData?.length == 0 && email == session?.user?.email) {
            saveProfile();
            console.log("Save Profile");
        } else if (profileData != null && profileData.length > 0) {
            profile = profileData[0];
        } else {
            console.log("Profile not found");
            profile = {
                description: "This user does not have a profile",
                pokemon_ids: [],
            };
        }

        await refreshPokemonData();
    });
</script>

<div class={styles.container}>
    <div>
        <div>
            <h1 class={styles.myPageTitle}>{email}'s Pokemon List</h1>
            <p class={styles.myPageSubtitle}>{profile.description}</p>
            <div class={styles.myPokemonContainer}>
                {#if pokemonData === undefined}
                    <p>Loading...</p>
                {:else}
                    {#each pokemonData as pokemon}
                        <div class={styles.pokemonCard}>
                            <div>
                                <div>
                                    <img
                                        src={pokemon.sprites.front_default}
                                        alt="Picture of {pokemon.name}"
                                    />
                                    <h2 class={styles.pokemonName}>
                                        {pokemon.name}
                                    </h2>
                                    <p class={styles.pokemonDescription}>
                                        {pokemon.types[0].type.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
            {#if email == session?.user?.email}
                <button on:click={() => (isModalOpen = true)}>
                    Edit Page
                </button>
                <dialog open={isModalOpen} class={styles.modal}>
                    <div>
                        <h3>Edit Your Page</h3>
                        <p>Here you can make edits to your page</p>
                        <p>Edit your description</p>
                        <textarea
                            bind:value={profile.description}
                            placeholder={profile.description}
                        />
                        <button
                            on:click={() => {
                                savePageEdits();
                            }}
                        >
                            Save
                        </button>
                        <button
                            on:click={() => {
                                isModalOpen = false;
                            }}
                        >
                            Cancel
                        </button>
                        <p>Select your pokemon</p>
                        <div>
                            {#each pokemonList as pokemon}
                                <button>
                                    <div>
                                        <h2>{pokemon.name}</h2>
                                    </div>
                                </button>
                            {/each}
                        </div>
                    </div>
                </dialog>
            {/if}
        </div>
    </div>
</div>
