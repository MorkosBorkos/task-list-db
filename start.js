const app = require('./app');

/**
 * Αν υπάρχει η μεταβλητή περιβάλλοντος 'PORT' χρησιμοποίησε την τιμή της, 
 * αλλιώς χρησιμοποίησε τη θύρα 3000.
 */
const port = process.env.PORT || '3000';

const server = app.listen(port, () => { console.log("Listening to port " + port) });


process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    console.log('Closing http server.');
    server.close(() => {
        console.log('Http server closed.');
    });
});