// app/links.ts — shared outbound URLs
export const GARMIN = 'https://www.garmin.com/en-US/'
export const CMU = 'https://design.cmu.edu/'
export const RED_HOUSE = 'https://redhousecom.com/'
/** Served from public/, so a browser opens it in its own PDF reader rather
 *  than downloading it. Link it with `target="_blank"`. */
export const RESUME = '/YuerZhu_2026Resume1.pdf'
export const LINKEDIN = 'https://www.linkedin.com/in/yuer-j-zhu'
export const EMAIL = 'mailto:yuerzhu02@gmail.com'

/** A subject and an opening line, so a contact link opens a draft rather than
 *  an empty window addressed to nobody in particular. */
export const SAY_HELLO =
  `${EMAIL}?subject=${encodeURIComponent("Let's connect")}` +
  `&body=${encodeURIComponent('Hi Yuer,\n\n')}`
