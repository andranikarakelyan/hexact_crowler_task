import { Crowler } from "./Crowler";
import { LinkInfo, PageInfo } from "./types";

export class DummyCrowler extends Crowler {

    protected async _crowlStep( url: URL, ): Promise<void> {

        // Find and ignore duplicates 
        if ( this.handled_links.some( ( link_info: LinkInfo ): boolean => {

            if ( url.origin !== link_info.url.origin ) {
                return false;
            }

            if ( url.pathname !== link_info.url.pathname ) {
                return false;
            }

            if ( !this.options.ignore_queries && url.search !== link_info.url.search ) {
                return false;
            }

            if ( !this.options.ignore_hashs && url.hash !== link_info.url.hash ) {
                return false;
            }

            return true;

        } ) ) {
            return;
        }

        const page_info: PageInfo = await Crowler._loadPage( url );

        this._addHandledPageInfo( page_info );
                
        // If link is not with start url domain, not parse it body
        if ( page_info.url.origin !== this.start_url.origin ) {
            return;
        }

        const links: URL[] = this._getPageURLs( page_info );

        for ( const link of links ) {
            // console.log( "\n", link );
            await this._crowlStep( link );
        }

    }

}
