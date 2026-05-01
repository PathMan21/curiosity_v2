
import { fileURLToPath } from 'url';

import dotenv from 'dotenv'
import path from 'path'

    dotenv.config({ path: path.join(process.cwd(), 'Config/.env') });

    const env = process.env.ENVIRONNEMENT || "test";
    

    if (env == "dev") {
      dotenv.config({ path: path.join(process.cwd(), `Config/.env.${env}`) });
      console.log("environnement dev chargé")
    }