import { Crowler } from "./Crowler";
import { DummyCrowler } from "./DummyCrowler";
const ReadLine = require( "readline" );

( async () => {

    const rl = ReadLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Please enter url: ', (answer) => {

        rl.close();
        ( async () => {
            try {

                const crowler: Crowler = new DummyCrowler( answer, {
                    ignore_queries: false,
                } );
                const start_time: number = Date.now();
                console.log(`Crowling started`);
                const results = await crowler.run();
                console.log( `\nResults ( ${ results.length } links, ${ Date.now() - start_time } ms )` );

            }
            catch( error ){
                console.log( "\nCrowling error:", error.message );
                process.exit( 1 );
            }
        } )();
        
    });
   

} )();
