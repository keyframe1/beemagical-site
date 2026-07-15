/**
 * Every outbound destination the site sends people to, defined once.
 *
 * There is no backend behind this site, so commission and contact traffic all
 * routes to Ko-fi: a form that accepts a message and sends it nowhere is worse
 * than no form at all. When Hannah moves to her own shop or booking service,
 * change the values here and every button, link, and fallback on the site
 * follows. Nothing should hardcode these URLs anywhere else.
 *
 * Per-listing Ko-fi URLs (a single painting or sticker) are not here on
 * purpose: those ids are opaque, belong to one piece, and live with that
 * piece's own data.
 */

/** Commission requests: anyone who wants a piece made. */
export const KOFI_COMMISSIONS = 'https://ko-fi.com/bee_magical/commissions';

/** The shop: originals, prints, and stickers already listed for sale. */
export const KOFI_SHOP = 'https://ko-fi.com/bee_magical/shop';

/** The Ko-fi profile itself, for the nav and footer link lists. */
export const KOFI_HOME = 'https://ko-fi.com/bee_magical';

/** Hannah's address, the fallback for anyone who would rather just write. */
export const EMAIL = 'beemagicalart@gmail.com';

/** Ready-made mailto href for EMAIL. */
export const EMAIL_HREF = `mailto:${EMAIL}`;
