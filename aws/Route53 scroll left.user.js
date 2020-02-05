// ==UserScript==
// @name         Route53 scroll left
// @version      0.1
// @description  Makes the main table on route53 pages scroll to the left when it is first loaded. Often, especially when opening a hosted zone, the scroll bar will be in the middle to start.
// @author       Mike Urbanski
// @match        *console.aws.amazon.com/route53/home*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // The R53 page loads once, and then does background data fetching after that. So, the "same" table (identified by the class name)
    // will be recreated as the view changes. So, we essentially have to keep polling this object: first to see if it exists (because
    // the initial page load will not even include this element - it will be added by the first background data poll), and repeatedly
    // to see if it changes. Each time it changes, we'll scroll left and save the element, because we don't want to keep scrolling left
    // after it's loaded, because that would prevent the user from manually scrolling it.

    (function init(orig) {
        var el;
        var els = document.getElementsByClassName('GC53E5CBEAB');
        if (els.length == 1) {
            // The div exists, but we don't yet know if we just loaded a new data view or not.
            el = els[0];

            if (el == orig) {
                // The element hasn't been reloaded; do nothing.
            }
            else {
                // The element was newly recreated; scroll left.
                el.scrollLeft = 0;
            }
        }
        else if (els.length == 0) {
            // The initial data fetch hasn't occurred yet.
        }
        else {
            alert('more than 1 instance'); // This hasn't occurred yet, but I want to know if it will, and when.
        }

        setTimeout(() => init(el), 750); //re-call the function with the element that we found (if any).
    })(null);
})();