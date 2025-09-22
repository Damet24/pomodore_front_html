<script lang="ts">
    import ButtonGroupItem from "./ButtonGroupItem.svelte";

    interface ButtonGroupProps {
        name: string
        action: (param: any) => void
    }

    let {buttons}: { buttons: ButtonGroupProps[] } = $props()
</script>
<div class="inline-flex rounded-md shadow-xs mb-2" role="group">
    {#each buttons as button, i}
        {#if (i === 0)}
            <ButtonGroupItem action={button.action} type="start">{button.name}</ButtonGroupItem>
        {:else if (i === buttons.length - 1)}
            <ButtonGroupItem action={button.action} type="end">{button.name}</ButtonGroupItem>
        {:else}
            <ButtonGroupItem action={button.action} type="none">{button.name}</ButtonGroupItem>
        {/if}
    {/each}
</div>