//Χρησιμοποιούμε το πακέτο dotenv
//Αν η μεταβλητή περιβάλλοντος 'NODE_ENV' δεν έχει τιμή 'production', τότε
//θα φορτωθούν οι ρυθμίσεις από το dotenv,
//δηλ οι μεταβλητές που ορίζονται στο αρχείο '.env'
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
   console.log('loading .env');
   dotenv.config();
}

import { taskList } from './app.mjs';

/**
 * Αν υπάρχει η μεταβλητή περιβάλλοντος 'PORT' χρησιμοποίησε την τιμή της,
 * αλλιώς χρησιμοποίησε τη θύρα 3000.
 */
const port = process.env.PORT || '3000';

const server = taskList.listen(port, () => {
   console.log(`Listening to http://127.0.0.1:${port}`);
});

process.on('SIGTERM', () => {
   console.info('SIGTERM signal received.');
   console.log('Closing http server.');
   server.close(() => {
      console.log('Http server closed.');
   });
});
