import { useRef } from 'react';

export const useDragScroll = () => {
    const ref = useRef(null);
    const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });

    const onMouseDown = (e) => {
        if (!ref.current) return;
        drag.current = { active: true, startX: e.pageX, scrollLeft: ref.current.scrollLeft, moved: false };
        ref.current.style.cursor = 'grabbing';
    };

    const onMouseMove = (e) => {
        if (!drag.current.active || !ref.current) return;
        const delta = e.pageX - drag.current.startX;
        if (Math.abs(delta) > 4) drag.current.moved = true;
        ref.current.scrollLeft = drag.current.scrollLeft - delta;
    };

    const onMouseUp = () => {
        drag.current.active = false;
        if (ref.current) ref.current.style.cursor = '';
    };

    return {
        events: {
            ref,
            onMouseDown,
            onMouseMove,
            onMouseUp,
            onMouseLeave: onMouseUp
        },
        hasMoved: () => drag.current.moved
    };
};
