# Logger

This is an opiniated Logger meant to make the log output more informative by prepending the time the log was done and the instance which issued the log, with as much more ease of use.
This package is quite simple, there is no support for other output targets then the default console.

## Decorator

You can create an Logger instance with the @Log decorator. Be awere that this approach will (because of TypeScript) create only ONE instance for the Example class and put this instance onto Examples prototype. The prototype property has the same name as the attribute you put the @Log decorator on.

Since this will only create one instance for all instances of the Example class you have no instance number in the tag. If you want / need one use the second option.

```ts
import { Logger, Log } from 'logger';

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

new Example();
```

Which will print:

```txt
16:00:00 [EXAMPLE] this is a log output
16:00:00 [EXAMPLE] this is a info output
16:00:00 [EXAMPLE] this is a debug output
16:00:00 [EXAMPLE] this is a warn output
16:00:00 [EXAMPLE] this is a error output
```

## apply onto a target

You can archive a similar behaivior as the decorator option with the applyOnTarget function.
Be awere that with this methode you are creating a new Logger instance with each Example instance which is not the case with the @Log decorator.

```ts
import { applyOnTarget, Logger } from 'logger';

class Example {
    private logger!: Logger;

    constructor() {
        applyOnTarget(this, 'logger', { useInstanceNumber: false });
        this.logger.log('this is a log output');
        this.logger.info('this is a info output');
        this.logger.debug('this is a debug output');
        this.logger.warn('this is a warn output');
        this.logger.error('this is a error output');
    }
}

new Example();
```

## Constructor

Or imperativly with the constructor:

```ts
import { Logger } from 'logger';

const la = new Logger('SomeName', 0);
la.log('This is a log entry from A');

const lb = new Logger('SomeName', 1);
lb.log('This is a log entry from B');
```

which will print:

```txt
16:00:00 [SOME-NAME-00] This is a log entry from A
16:00:00 [SOME-NAME-01] This is a log entry from B
```