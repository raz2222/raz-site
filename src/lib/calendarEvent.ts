/** The calendar builders live with the server, because a booking from the
 * thank-you page has to send Raz an invitation from there. The browser imports
 * the same file, so the admin's links, the visitor's download and the server's
 * invitation are one description of a meeting, not three. */
export * from "../../api/_lib/calendar-event"
