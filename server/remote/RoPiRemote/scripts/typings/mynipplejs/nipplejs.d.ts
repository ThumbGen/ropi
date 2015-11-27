// Type definitions for nipplejs v0.5.6
// Project: http://yoannmoinet.github.io/nipplejs/
// Definitions by: ThumbGen <https://github.com/ThumbGen>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// See a detailed documentation on the project's website


declare module nipplejs {

    function create(options: ManagerOptions): Manager;

    class Manager {

        constructor(options: ManagerOptions);

        on(eventNames: string, handler: EventHandler): Manager;

        off(eventNames?: string, handler?: EventHandler): Manager;

        get(identifier: any): Manager;

        destroy(): void;

        options: ManagerOptions;

        nippleOptions: ManagerNippleOptions;

    }

    class Nipple {

        constructor(manager: Manager, options: NippleOptions);

        identifier: any;

        position: NipplePosition;

        frontPosition: NipplePosition;

        ui: Ui;

        options: NippleOptions;

        on(eventNames: string, handler: EventHandler): Nipple;

        off(eventNames?: string, handler?: EventHandler): Nipple;

        el: HTMLElement;

        show(callback?: any): void;

        hide(callback?: any): void;

        add(): void;

        remove(): void;

        destroy(): void;

        trigger(eventNames: string, data?: any): void;

    }

    const enum Direction { up, down, right, left }

    interface Ui {

        el: HTMLElement;

        front: HTMLElement;

        back: HTMLElement;
    }

    interface Angle {
        
        radian: number;

        degree: number;
    }

    interface MoveEventData {

        identifier: number;

        position: NipplePosition;

        force: number;

        distance: number;

        pressure: number;

        angle: Angle;

        instance: Nipple;
    }

    interface NipplePosition {
        x: number;
        y: number;
    }

    interface NippleOptions {

        color: string;

        size: number;

        threshold: number;

        fadeTime: number;
    }

    interface ManagerOptions {
        zone?: HTMLElement; // active zone
        color?: string;
        size?: number;
        threshold?: number; // before triggering a directional event
        fadeTime?: number; // transition time
        multitouch?: boolean;
        maxNumberOfNipples?: number; // when multitouch, what is too many?
        dataOnly?: boolean; // no dom element whatsoever
        position?: Object; // preset position for 'static' mode
        mode?: string; // 'dynamic', 'static' or 'semi'
        restOpacity?: number; // opacity when not 'dynamic' and rested
        catchDistance?: number; // distance to recycle previous joystick in 'semi' mode
    }

    interface EventHandler {
        (event: any, data: any): void
    }

    interface MoveEventHandler {
        (event: string, data: MoveEventData)
    }

    interface ManagerNippleOptions {
        size: number;
        threshold: number;
        color: string;
        mode: string;
        fadeTime: number;
        dataOnly: boolean;
        restOpacity: number;
    }
}