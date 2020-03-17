import { merge } from 'lodash';
import * as CherrIO from "cheerio";
import { createStream, TableUserConfig } from 'table';
import { LOGGER_CONFIG, CROWLER_DEFAULT_OPTIONS, HTML_CONTENT_TYPE } from './constants';
import { LinkInfo, PageInfo } from './types';
const request = require('request');

export interface CrowlerOptions {
    ignore_hashs: boolean;
    ignore_queries: boolean;
    live_logging: boolean;
}

export abstract class Crowler {

    public readonly options: CrowlerOptions;
    public readonly start_url: URL;
    public readonly handled_links: LinkInfo[];
    private static __logger_config: TableUserConfig = LOGGER_CONFIG;
    private __logging_stream: { write: ( columns: string[] ) => void };
    
    public constructor( start_url: string, options?: Partial<CrowlerOptions> ){

        this.start_url = new URL( start_url );
        this.options = merge( {}, CROWLER_DEFAULT_OPTIONS, options );
        this.handled_links = [];
        this.__logging_stream = createStream( Crowler.__logger_config ) as any;

    }

    public async run(): Promise<LinkInfo[]> {

        if ( this.options.live_logging ) {
            this.__logging_stream.write( [
                "N",
                "Status code",
                "Reponse time",
                "Content type",
                "URL"
            ] );
        }
        
        await this._crowlStep( this.start_url );

        if ( this.options.live_logging ) {
            console.log();
        }

        return this.handled_links;

    }

    protected abstract async _crowlStep( url: URL, ): Promise<void>;

    protected static async _loadPage( url: URL ): Promise<PageInfo> {
        return new Promise( ( resolve, reject ) => {
            const request_time: number = Date.now();
            request( url.href, (error, response, body) => {

                const page_info: PageInfo = {
                    url: url,
                    status_code: response && response.statusCode ? response.statusCode : null,
                    body: typeof body === "string" ? body : null,
                    error: error instanceof Error ? error.message : null,
                    content_type: response && typeof response.headers && typeof response.headers[ "content-type" ] === 'string' ? response.headers[ "content-type" ].split( ';' )[0] : null,
                    response_time: Date.now() - request_time,
                };
                
                resolve( page_info );

            });
        } );
    }

    protected _addHandledPageInfo( page_info: PageInfo ): void {

        const link_info: LinkInfo = {
            response_time: page_info.response_time,
            url: page_info.url,
            status_code: page_info.status_code,
            content_type: page_info.content_type,
        };

        this.handled_links.push( link_info );

        if ( this.options.live_logging ) {
            this.__logging_stream.write( [
                String( this.handled_links.length ),
                String( link_info.status_code ),
                `${ link_info.response_time }ms`,
                String( link_info.content_type ),
                String( link_info.url.href ),
            ]);
        }

    }

    protected _getPageURLs( page_info: PageInfo ): URL[] {

        if ( page_info.body === null ) {
            return [];
        }
        
        if ( page_info.content_type === null || !page_info.content_type.startsWith( HTML_CONTENT_TYPE ) ) {
            return [];
        }

        const $: CheerioStatic =  CherrIO.load( page_info.body );
        const url_s: ( undefined | string )[] = [];

        // Get <a>, <link> tag href-s
        $( 'a, link' ).each( function( i, el ): void {
            url_s.push( $( el ).attr( 'href' ) );
        } ).toArray();

        // Get <img>, <script> tag src-s
        $( 'img, script' ).each( function( i, el ): void {
            url_s.push( $( el ).attr( 'src' ) );
        } ).toArray();

        const results: URL[] = [];
        for ( const url of url_s ) {
            try {
                if ( url !== undefined && url.trim() !== "" ) {
                    results.push( new URL( url as string, `${ page_info.url.origin }${ page_info.url.pathname }` ) );
                }
            }
            catch( err ){}
        }

        return results;

    }

}

