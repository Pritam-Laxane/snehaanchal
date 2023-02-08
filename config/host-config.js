let hostConfig = {};
switch (process.env.NODE_ENV) {
    case 'production':
        hostConfig = {
            PROTOCOL: 'https',
            HOST: 'snehaanchal.herokuapp.com',
            PORT: '',
        };
        break;
    case 'test':
        hostConfig = {
            PROTOCOL: 'http',
            HOST: 'snehaanchal.org',
            PORT: process.env.PORT || 3000,
        };
        break;
    default:
        // development environment
        hostConfig = {
            PROTOCOL: 'http',
            HOST: 'localhost',
            PORT: process.env.PORT || 3000,
        };
        break;
}
console.log(process.env.NODE_ENV, hostConfig);
module.exports = hostConfig;
