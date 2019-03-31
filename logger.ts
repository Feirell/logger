import chalk, { Chalk } from 'chalk';
const split = /[a-z][A-Z]/g;

const formatNumber = (n: number, l = 2) => n.toString().padStart(l, '0');
const timestring = () => new Date().toLocaleTimeString();
const upperToDashed = (str: string) => str.replace(split, substr => substr[0] + '-' + substr[1]).toUpperCase();

type LogFnc = (...args: any) => undefined;
type ColorDefinition = { chalkColor: Chalk, consoleColor: string };

const checkSuitableNumber = (n: any) => isFinite(n) && n % 1 == 0 && n >= 0 && n <= 255;

export class Logger {
    private label: string;

    private readonly colors = Object.seal({
        prefix: null as any as ColorDefinition,
        log: null as any as ColorDefinition,
        info: null as any as ColorDefinition,
        debug: null as any as ColorDefinition,
        warn: null as any as ColorDefinition,
        error: null as any as ColorDefinition
    })

    constructor(name: string, instanceNumber?: number) {
        this.label = upperToDashed(name) + (isFinite(instanceNumber as any) ? '-' + formatNumber(instanceNumber as number) : '');

        this.setColor('prefix', 128, 128, 128); // grey
        this.setColor('log', 144, 238, 144); // lightgreen
        this.setColor('info', 128, 128, 128);
        this.setColor('debug', 128, 128, 128);
        this.setColor('warn', 255, 255, 224); // lightyellow
        this.setColor('error', 255, 0, 0);
    }

    /**
     * The part is either log, info, debug, warn, error or prefix.
     * The color parts should be 0 to 255
     */
    setColor(part: string, r: number, g: number, b: number) {
        part = '' + part;
        if (!Object.prototype.hasOwnProperty.call(this.colors, part))
            throw new RangeError('part needs to be one of [' + Object.getOwnPropertyNames(this.colors).map(v => '"' + v + '"').join(', ') + '] but was "' + part + '"');

        if (!checkSuitableNumber(r))
            throw new TypeError('r needs to be an integer in the range 0 to 255 but was ' + r);

        if (!checkSuitableNumber(g))
            throw new TypeError('g needs to be an integer in the range 0 to 255 but was ' + g);

        if (!checkSuitableNumber(b))
            throw new TypeError('b needs to be an integer in the range 0 to 255 but was ' + b);

        const cc = chalk.rgb(r, g, b);
        const bc = 'rgb(' + r + ', ' + g + ', ' + b + ')';

        (this.colors as any)[part] = {
            chalkColor: cc,
            consoleColor: bc
        };
    }

    private print(logFnc: LogFnc, color: ColorDefinition, args: any[]) {
        const hasPattern = typeof args[0] == 'string';
        if (chalk.level == 0) // assuming that this is a browser
            logFnc('%c%s%c [%c%s%c] ' + (hasPattern ? args[0] : ''),
                'color: ' + this.colors.prefix.consoleColor,
                timestring(),
                'color: unset',

                'color: ' + color.consoleColor,
                this.label,
                'color: unset',

                ...(hasPattern ? args.slice(1) : args));
        else // the stdout supports ANSI colors, use chalk
            logFnc('%s [%s] ' + (hasPattern ? args[0] : ''),
                this.colors.prefix.chalkColor(timestring()),

                color.chalkColor(this.label),

                ...(hasPattern ? args.slice(1) : args)
            );
    }

    log(...args: any[]) { this.print(console.log as LogFnc, this.colors.log, args); }
    info(...args: any[]) { this.print((console as any).info, this.colors.info, args); }
    debug(...args: any[]) { this.print((console as any).debug, this.colors.debug, args); }
    warn(...args: any[]) { this.print(console.warn as LogFnc, this.colors.warn, args); }
    error(...args: any[]) { this.print(console.error as LogFnc, this.colors.error, args); }
}

const instanceTracker = new WeakMap();

const isPrototype = (inst: object) => inst === inst.constructor.prototype;

const getConstructor = (inst: Function | object) => {
    if (typeof inst == 'function')
        return inst;

    if (isPrototype(inst))
        return inst.constructor;

    return Object.getPrototypeOf(inst).constructor;
};

/**
 * This function is a decorator which can be used on attributes.
 * Be awere that the injected Logger instance is the same for all instances of this class!
 *
 ```ts
 class Example{
    @Log()
    private logger!: Logger;

    exampleMethode(){
        this.logger.log('exampleMethode was called');
    }
 }
 ```
 */
export function Log(...decoratorArgs: any[]) {
    return function (target: any, propertyname: string) {
        // target is either a prototype or the constructor function, hopefully they will offer a way of
        // accessing the actual instance (one could with getter and some workaround but you should not)
        const isStatic = isPrototype(target) || typeof target === 'function';
        const constructor = getConstructor(target);

        // if (!isStatic && !instanceTracker.has(target))
        //     instanceTracker.set(target, 0);

        const name = constructor.name;

        // const nr = isStatic ? undefined : instanceTracker.get(target) + 1;
        // instanceTracker.set(target, nr);

        const logger = new Logger(name, /*nr*/ undefined);
        Object.defineProperty(target, propertyname, { value: logger });
    };
}

class Example {
    @Log()
    private logger!: Logger;

    constructor() {
        this.logger.log('this is a log output');
        this.logger.info('this is a info output');
        this.logger.debug('this is a debug output');
        this.logger.warn('this is a warn output');
        this.logger.error('this is a error output');
    }
}

new Example;