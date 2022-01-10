<script>
	import '../app.scss';
    import {Theme} from "carbon-components-svelte";

    let theme = "g80";
</script>

<Theme bind:theme persist persistKey="__comet-theme" />

<slot />
