<script lang="ts">
    import {formatMillisecondsToTime} from "../../lib/time.ts";

    interface TimerProps {
        time: number
        max_time: number
    }

    let {time, max_time = 25 * 60 * 1000}: TimerProps = $props()
    let percentage = $derived(Math.round(((max_time - time) / max_time) * 100))

</script>

<div class="flex items-center justify-center flex-col border-4 border-white rounded-full aspect-square">
    <p class="text-7xl font-bold">{formatMillisecondsToTime(time)}</p>
    <p>{percentage}% completed</p>
</div>