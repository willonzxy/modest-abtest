import {
    ABTEST_UID_COOKIE_NAME,
    ABTEST_TRACE_ID_COOKIE_NAME,
    ABTEST_COOKIE_ALIVE_TIME
} from '../config.js'

import { serialize as cookieSet } from 'cookie';

export default function setCookies(app_id, uid, trace_id) {
    let hostname = location.hostname;
    let domain = isIpHostName(hostname) ? hostname : hostname.replace(/(.+)(?=\..+\..+\b)/, '');
    // set uid in cookie
    document.cookie = cookieSet(`${ABTEST_UID_COOKIE_NAME}${app_id}`, uid, {
        maxAge: ABTEST_COOKIE_ALIVE_TIME,
        domain
    });
    // set trace_id in cookie
    document.cookie = cookieSet(`${ABTEST_TRACE_ID_COOKIE_NAME}${app_id}`, trace_id, {
        maxAge: ABTEST_COOKIE_ALIVE_TIME,
        domain
    })
}

function isIpHostName(str) {
    return str.split('.').length === 4
}