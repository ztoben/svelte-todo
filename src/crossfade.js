import { cubicOut } from 'svelte/easing';

export function crossfade({ fallback, ...defaults }) {
  let to_receive = new Map();
  let to_send = new Map();

  function crossfade(from, node, params) {
    const {
      delay = 0,
      duration = d => Math.sqrt(d) * 30,
      easing = cubicOut
    } = Object.assign({}, defaults, params);

    const to = node.getBoundingClientRect();
    const dx = from.left - to.left;
    const dy = from.top - to.top;

    const style = getComputedStyle(node);
    const transform = style.transform === 'none' ? '' : style.transform;

    const d = Math.sqrt(dx * dx + dy * dy);

    return {
      delay,
      duration: typeof duration === 'function' ? duration(d) : duration,
      easing,
      css: (t, u) => `
				opacity: ${t};
				transform: ${transform} translate(${u * dx}px,${u * dy}px);
			`
    };
  }

  function transition(items, counterparts, intro) {
    return (node, params) => {
      items.set(params.key, {
        rect: node.getBoundingClientRect()
      });

      return () => {
        if (counterparts.has(params.key)) {
          const { rect } = counterparts.get(params.key);
          counterparts.delete(params.key);

          return crossfade(rect, node, params);
        }

        // if the node is disappearing altogether
        // (i.e. wasn't claimed by the other list)
        // then we need to supply an outro
        items.delete(params.key);
        return fallback && fallback(node, params, intro);
      };
    };
  }

  return [
    transition(to_send, to_receive, false),
    transition(to_receive, to_send, true)
  ];
}
