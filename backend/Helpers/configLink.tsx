
import { fileURLToPath } from 'url';

import dotenv from 'dotenv'
import path from 'path'

    dotenv.config({ path: path.join(process.cwd(), 'Config/.env') });
