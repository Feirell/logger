```ts
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
```