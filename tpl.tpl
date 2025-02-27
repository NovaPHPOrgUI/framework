<style id="{$styleId}">

</style>

{if $pjax}
<div id="container" class="container">
{/if}



{if $pjax}
</div>
{/if}

<script id="{$scriptId}">
    window.pageLoadFiles = [];
    window.pageOnLoad = function (loading) {
        window.pageOnUnLoad = function () {
        };
        return false
    };
</script>



