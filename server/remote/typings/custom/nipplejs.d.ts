
declare module nipplejs {
    function create(options: any): any;

    interface ManagerOptions {

        zone?: HTMLElement;
        color?: string;
        size?: number;
        threshold?: number;
        fadeTime?: number;
        multitouch?: boolean;
        maxNumberOfNipples?: number;
        dataOnly?: boolean;
        position?: any;
        mode?: string;
        restOpacity?: number;
        catchDistance?: MimeType

    }

    interface NippleInteractiveData {

        angle: {
            degree: number;
            radian: number;
        },
        direction: {
            angle: string;
            x: string;
            y: string;
        }
        distance: number;
        force: number;
        identifier: number;
        instance: Nipple;
        position: {
            x: number;
            y: number;
        };
        pressure: number;

    }

    interface EventData {
        type: string;
        target: any;
    }

    class Manager {

        static create(options?: ManagerOptions): Manager;

        on(type: string | string[], handler: (evt: EventData, data: any) => void): void;

        off(type: string | string[], handler: (evt: EventData, data: any) => void): void;

        get(identifier: number): Nipple;

        destroy(): void;

    }

    interface Nipple {

        on(type: string | string[], handler: (evt: EventData, data: any) => void): void;
        off(type: string | string[], handler: (evt: EventData, data: any) => void): void;
        el: HTMLElement;
        show(cb?: () => void): void;
        hide(cb?: () => void): void;
        add(): void;
        remove(): void;
        destroy(): void;
        identifier: number;
        trigger(type: string | string[], handler: (evt: EventData, data: any) => void): void;
        position: {
            x: number;
            y: number;
        };
        frontPosition: {
            x: number;
            y: number;
        };
        ui: {
            el: HTMLElement;
            front: HTMLElement;
            back: HTMLElement;
        };
        options: {
            color: string;
            size: number;
            threshold: number;
            fadeTime: number;
        }

    }


}