<script>
    import { quintOut } from 'svelte/easing';
    import { crossfade } from './crossfade.js';
    import { flip } from './flip.js';

    const [send, receive] = crossfade({
        fallback(node, params) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;

            return {
                duration: 600,
                easing: quintOut,
                css: t => `
                    transform: ${transform} scale(${t});
                    opacity: ${t}
                `
            };
        }
    });

    const ENTER_KEY = 13;

    let items = [];

    try {
        items = JSON.parse(localStorage.getItem('todos-svelte')) || [];
    } catch (err) {
        items = [];
    }

    function createNew(event) {
        if (event.which === ENTER_KEY) {
            items = items.concat({
                id: uuid(),
                description: event.target.value,
                completed: false
            });
            event.target.value = '';
        }
    }

    function toggleCompleted(item) {
        items = items.map(todo => {
            if (todo === item) return { completed: !item.completed, description: item.description, id: item.id };
            return todo;
        });
    }

    function removeItem(item) {
        items = items.filter(todo => todo.id !== item.id);
    }

    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    $: notCompleted = items.filter(item => !item.completed);
    $: completed = items.filter(item => item.completed);

    $: try {
        localStorage.setItem('todos-svelte', JSON.stringify(items));
    } catch (err) {
        // noop
    }
</script>

<style>
    .container {
        width: 100vw;
        height: 100vh;
        background-color: #333333;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .header {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .new-todo {
        width: 500px;
        background: transparent;
        border: 1px solid white;
        border-radius: 5px;
        outline: none;
        color: white;
        padding: 15px;
    }

    h1 {
        color: white;
    }

    .todos {
        width: 500px;
        list-style: none;
        padding: 0;
    }

    .todo {
        padding: 15px;
        border: 1px solid white;
        color: white;
        border-radius: 5px;
        margin-bottom: 5px;
    }

    .todo:hover {
        background-color: gray;
    }

    .completed {
        text-decoration: line-through;
    }

    .remove {
        color: white;
        background: transparent;
        border: none;
        cursor: pointer;
        margin: 0;
        padding: 0;
        height: 21px;
        float: right;
        font-size: 21px;
    }

    .description {
        margin-left: 5px;
    }

    h2 {
        width: 500px;
        color: white;
        margin: 0;
    }
</style>

<div class="container">
    <div class="header">
        <h1>TODO</h1>
        <input
            class="new-todo"
            on:keydown={createNew}
            placeholder="Enter a new todo..."
            autofocus
        >
    </div>
    {#if notCompleted.length > 0}
        <h2>Not Completed</h2>
        <ul class="todos">
            {#each notCompleted as item (item.id)}
                <li
                    class="todo"
                    in:receive="{{key: item.id}}"
                    out:send="{{key: item.id}}"
                    animate:flip
                >
                    <label>
                        <input
                            type="checkbox"
                            class="toggle"
                            checked={item.completed}
                            on:click={() => toggleCompleted(item)}
                        />
                        <span class="description">{item.description}</span>
                        <button class="remove" on:click={() => removeItem(item)}>X</button>
                    </label>
                </li>
            {/each}
        </ul>
    {/if}
    {#if completed.length > 0}
        <h2>Completed</h2>
        <ul class="todos">
            {#each completed as item (item.id)}
                <li
                    class="todo"
                    in:receive="{{key: item.id}}"
                    out:send="{{key: item.id}}"
                    animate:flip
                >
                    <label>
                        <input
                            type="checkbox"
                            class="toggle"
                            checked={item.completed}
                            on:click={() => toggleCompleted(item)}
                        />
                        <span class="description completed">{item.description}</span>
                        <button class="remove" on:click={() => removeItem(item)}>X</button>
                    </label>
                </li>
            {/each}
        </ul>
    {/if}
</div>
