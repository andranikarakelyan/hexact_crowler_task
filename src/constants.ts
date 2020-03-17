import { TableUserConfig } from 'table';
import { CrowlerOptions } from './Crowler';

export const HTML_CONTENT_TYPE: string = "text/html";

export const LOGGER_CONFIG: TableUserConfig = {
    columnDefault: {
        width: 50
    },
    columnCount: 5,
    columns: {
        0: {
            width: 4,
        },
        1: {
            width: 12,
        },
        2: {
            width: 14,
        },
        3: {
            width: 25,
        },
        4: {
            width: 100
        },
    },
};

export const CROWLER_DEFAULT_OPTIONS: CrowlerOptions = {
    ignore_hashs: true,
    ignore_queries: false,
    live_logging: true,
};
