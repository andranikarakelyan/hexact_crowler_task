export interface LinkInfo {
    url: URL;
    status_code: null | string;
    content_type: null | string;
    response_time: number;
}

export interface PageInfo extends LinkInfo {
    body: null | string;
    error: null | string;
}