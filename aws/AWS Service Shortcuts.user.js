// ==UserScript==
// @name         AWS Service Shortcuts
// @version      0.1
// @description  Provides *very pretty* dropdown menus for resources pinned at the top of the AWS console to navigate between parts of a service (e.g., go to EC2 network interfaces instead of just the EC2 dashboard) and between regions with fewer page loads
// @author       Mike Urbanski
// @match        *.console.aws.amazon.com/*
// @grant        GM_addStyle
// ==/UserScript==

/*
Current capabilities:
- Display a dropdown when hovering over a pinned shortcut in the navbar. This shortcut has:
    - A link to that service homepage, the same as the pinned shortcut button, except:
    - A region selector that modifies this link to go to the selected region, allowing one to switch services and regions in one page load.
        - Click the region radio button again to deselect it and restore the default link.
    - Links to specific pages within that service (e.g., EC2 network interfaces).
        - These links do not currently respect the new region selection, but that is planned. For now, they take you to the current region.
*/

/*
How to add a service:
1. Pin the service on the navbar in the AWS console.
2. Inspect the element, find the 'li' item under the '<ul id="nav-shortcutBar"...>' and note the 'data-service-id' attribute,
   which will be something like 'ec2', 's3', etc.
3. In the main function, add an entry to funcMapping with the service name as the key, following the pattern already there.
4. Create the two functions (the init function can be blank).
5. In the links function, add the desired shortcuts following the patterns already present.
*/

/*
Known issues:
- The styling looks a little different depending on which AWS service page you are on. I think this is because each has its own CSS tweaks.
- Services with subdomain prefixes before 'console.aws.com' (e.g., Pages) will not work with the current region stripping logic.
- There are some issues with regions - it's not clear what determines which region you will go to.
    - There is a region subdomain (us-west-2.console.aws...), there is a region param (region=us-west-2), and maybe a cookie or stored value?
    - I THINK it will always work intuitively if you just don't specify any region in the URL subdomain or param, but I haven't tested all cases.
*/

/*
To do:
- Add the ability to have shortcuts directly to specific objects - an IAM policy, an EC2 instance page with a filter, etc.
    - The basic version would just be hardcoding them in this code.
    - The advanced version would be to add a little filter form right in the dropdown.
    - This would require knowing the AWS account and tracking saved objects by account to make it more useful.
- Some type of local storage of commonly accessed items (once the filter form is implemented).
- Restore links with filters. For example, when you type an EC2 instance filter, and then navigate somewhere else, that filter will be automatically
  reapplied when you return to that page.
    - This may actually occur on its own as long as you don't hardcode any params after the : (at least on EC2 pages). Need to test more.
*/

(function() {
    'use strict';
    console.log('script is running');

    setupCss();

    // This essentially declares "supported" services, but the base container with the region selection will be
    // available for anything, even if not listed here.
    var funcMapping = {
        iam: {init: iamInit, links: iamLinks},
        ec2: {init: ec2Init, links: ec2Links},
        vpc: {init: vpcInit, links: vpcLinks},
        s3: {init: s3Init, links: s3Links},
        kms: {init: kmsInit, links: kmsLinks},
        r53: {init: r53Init, links: r53Links}
    }

    var navBar = document.getElementById('nav-shortcutBar');
    navBar.childNodes.forEach(el => {
        var service = el.getAttribute("data-service-id");
        var base = baseInit(el, service, funcMapping[service]);
    });
})();

/*
Initializes a dropdown and calls the service-specific initialization function, if present.
*/
function baseInit(serviceElement, serviceName, serviceFunctions) {
    console.log('in ' + serviceName + ' init');

    var linkElement = serviceElement.firstChild;
    var url = linkElement.href; // the actual URL to the service's main page

    var urlWithoutRegion = stripRegionFromUrl(url);

    var ul = document.createElement('ul');
    ul.className = 'link-list';

    var dropdown = createBaseDropdown(serviceElement, serviceName, url, urlWithoutRegion, ul, serviceFunctions);

    dropdown.appendChild(ul);

    if (serviceFunctions) {
        serviceFunctions.init();
        serviceFunctions.links(ul, null);
    }
}

function removeAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/*
Removes any AWS region specifiers from a URL. For example, for the URL "https://us-west-2.console.aws.amazon.com/ec2/v2/home?region=us-west-2",
returns "https://console.aws.amazon.com/ec2/v2/home"
*/
function stripRegionFromUrl(url) {

    var urlWithoutRegion;
    // URLs can take a few different forms. There may a region subdomain (us-west-2.console.aws.amazon.com), which we can just remove.
    // There may be a region URL param (region=us-west-2), which we can remove. It may be at the start, middle, or end of other URL params.
    // After the URL params may be page-specific anchors, like '#Instances:...' that should be preserved.

    // I'm going to assume that we'll never get a # in the base URL or params, because not encoding that would break the AWS pages.
    // So, we'll just remove that and preserve it to append later.
    var hashIndex = url.indexOf('#');
    var urlEnd;

    if (hashIndex === -1) {
        urlEnd = "";
    }
    else {
        urlEnd = url.substring(hashIndex);
        url = url.substring(0, hashIndex);
    }

    // Now remove the region URL param. Possible cases:
    // 1. There is no 'region=' in the url: do nothing
    // 2. 'region=' is at the end of the URL params: strip off the preceeding ? or &
    // 3. 'region=' is followed by other URL params: strip the region param, and the following '&'
    var regionIndex = url.indexOf('region=');
    if (regionIndex === -1) {
        // case #1
        urlWithoutRegion = url;
    }
    else {
        var nextParamIndex = url.indexOf('&', regionIndex);
        if (nextParamIndex === -1) {
            // case #2
            urlWithoutRegion = url.substring(0, regionIndex - 1);
        }
        else {
            // case #3 - the '+ 1' skips over the '&'
            urlWithoutRegion = url.substring(0, regionIndex) + url.substring(nextParamIndex + 1);
        }
    }

    // Now we need to take out the region subdomain, if present.
    // If the character before 'console.aws...' is a '.', then there is a region subdomain.
    // Otherwise, it'll be a slash (as in 'https://') (or, unlikely, nothing at all), so we don't have to do anything.
    // TODO There are one or two AWS services that have another subdomain, so this would break that.
    var consoleIndex = urlWithoutRegion.indexOf('console.aws');
    if (consoleIndex > 0 && urlWithoutRegion[consoleIndex - 1] === '.') {
        urlWithoutRegion = "https://" + urlWithoutRegion.substring(consoleIndex);
    }

    return urlWithoutRegion + urlEnd;
}

/*
Returns a URL to a page with the specified region tag added to the URL params (...[? | &]region=<region>)

If the URL without region contains a #, then the region param is appended prior to that hash.
*/
function makeRegionUrl(urlWithoutRegion, region) {

    var hashIndex = urlWithoutRegion.indexOf('#');
    if (hashIndex === -1) {
        hashIndex = urlWithoutRegion.length;
    }

    var urlBeforeHash = urlWithoutRegion.substring(0, hashIndex);
    var urlAfterHash = urlWithoutRegion.substring(hashIndex);

    return urlBeforeHash + (urlBeforeHash.indexOf('?') == -1 ? '?' : '&') + 'region=' + region + urlAfterHash;
}

/*
Returns an 'li' element with a link and text for the specified URL. If region is null, then the url
and text are as specified in the parameters. If region is not null, then the url will be the result of
makeRegionUrl(url, region).
*/
function createLinkListItem(url, text, region) {
    var li = document.createElement('li');
    li.className = 'link-list-item';

    if (region) {
        url = makeRegionUrl(url, region);
    }

    li.innerHTML = '<a href="' + url + '">' + text + '</a>';
    return li;
}

/*
Builds and returns a region selector with all necessary logic for updating links.

serviceName: the AWS service name
linkToUpdate: the dropdown title link ('a') element
originalUrl: the url to the AWS service from the link element
urlWithoutRegion: the url with all region components stripped off
linkList: the list element ('ul') containing service-specific deep links
*/
function buildRegionSelectors(serviceName, linkToUpdate, originalUrl, urlWithoutRegion, linkList, serviceFunctions) {

    var defaultRegions = [
        {
            value: 'us-east-1',
            display: 'N. Virginia (us-east-1)'
        },
        {
            value: 'us-west-2',
            display: 'Oregon (us-west-2)'
        }
    ];

    var radioDiv = document.createElement('div');
    radioDiv.className = 'region-select-container'

    var ul = document.createElement('ul');
    ul.className = 'region-select-list';

    radioDiv.appendChild(ul);

    // This will be used to force deselection of the old one. Making it a dict allows it to be passed by reference to the handlers.
    var selectedRadioButton = {s: null};

    defaultRegions.forEach(r => {

        var li = document.createElement('li');
        li.className = 'region-select-list-item';

        var radio = document.createElement('input');
        radio.id = 'region-select-' + serviceName + '-' + r.value;
        radio.type = 'radio';
        radio.name = 'region-select-' + serviceName;
        radio.value = r.value;
        li.appendChild(radio);

        // On first selection of a button, update the URLs with the region (using the URL without region as a template).
        // On deselection, restore the original URL. 'checked' is already true when onclick fires, so we
        // use the class as a simple state check to circumvent this.
        radio.onclick = (event) => function(event, linkElement, originalUrl, urlWithoutRegion, region, selectedRadioButton, linkList, serviceFunctions) {

            var target = event.target;

            if (target.classList.contains('isChecked')) {
                target.checked = false;
                linkElement.href = originalUrl;
                if (serviceFunctions) {
                    removeAllChildren(linkList);
                    serviceFunctions.links(linkList, null);
                }
                target.classList.remove('isChecked');
            }
            else {
                console.log('Setting region ' + region);
                console.log(serviceFunctions);
                linkElement.href = makeRegionUrl(urlWithoutRegion, region);
                if (serviceFunctions) {
                    removeAllChildren(linkList);
                    serviceFunctions.links(linkList, region);
                }
                target.classList.add('isChecked');
                if (selectedRadioButton.s && selectedRadioButton.s != target) {
                    selectedRadioButton.s.classList.remove('isChecked');
                }
                selectedRadioButton.s = target;
            }

        }(event, linkToUpdate, originalUrl, urlWithoutRegion, r.value, selectedRadioButton, linkList, serviceFunctions);

        var label = document.createElement('label');
        label.setAttribute('for', radio.id); //label.for doesn't seem to work
        label.innerText = r.display;
        label.className = 'region-select-radio-label';
        li.appendChild(label);

        ul.appendChild(li);
    });

    var radioComment = document.createElement('span');
    radioComment.className = 'radio-comment';
    radioComment.innerText = '(Click a radio button again to deselect it and reset the links.)';

    radioDiv.appendChild(radioComment);

    return radioDiv;
}

/*
Returns a dropdown, initialized with all reusable elements, that can be modified by each service.

serviceElement: the container holding the navbar button
serviceName: the AWS service name
originalUrl: the URL of the link on the button
urlWithoutRegion: the URL with all region elements removed
linkList: the list element (e.g., 'ul') that will contain the service-specific links
*/
function createBaseDropdown(serviceElement, serviceName, originalUrl, urlWithoutRegion, linkList, serviceFunctions) {
    var dropdownDiv = document.createElement('div');
    dropdownDiv.id = serviceName + '-dropdown-xyz123'; // unlikely, but this makes sure that the ID doesn't conflict.

    var rect = serviceElement.getBoundingClientRect();
    dropdownDiv.className = 'service-dropdown'
    dropdownDiv.style.left = rect.x + 'px'; // If there's CSS for this (likely), I don't know it.
    dropdownDiv.style.top = (rect.y + rect.height) + 'px';

    // Set up mouse move event listeners - when the moused is moved over the main button in the navbar,
    // display the dropdown. When the mouse moves out, hide the dropdown unless it moves to the dropdown itself.
    // Apply the same logic for the dropdown itself. I'm not actually sure why this doesn't cause a small blip,
    // since 'exit' fires first and you'd expect it to make the div disappear, but it seems to work.
    // Use the added class as a state variable.
    serviceElement.onmouseenter = () => function(serviceElement, dropdownDiv) {
        dropdownDiv.style.display = 'block';
        serviceElement.classList.add('mouseover');
    }(serviceElement, dropdownDiv);

    serviceElement.onmouseleave = () => function(serviceElement, dropdownDiv) {
        serviceElement.classList.remove('mouseover');
        if (!dropdownDiv.classList.contains('mouseover')) {
            dropdownDiv.style.display = 'none';
        }
    }(serviceElement, dropdownDiv);

    dropdownDiv.onmouseenter = () => function(dropdownDiv) {
        dropdownDiv.style.display = 'block';
        dropdownDiv.classList.add('mouseover');
    }(dropdownDiv);

    dropdownDiv.onmouseleave = () => function(serviceElementDiv, dropdownDiv) {
        dropdownDiv.classList.remove('mouseover');
        if (!serviceElementDiv.classList.contains('mouseover')) {
            dropdownDiv.style.display = 'none';
        }
    }(serviceElement, dropdownDiv);

    var title = document.createElement('span');
    title.className = 'container-title';
    title.href = originalUrl;

    var link = document.createElement('a');
    link.href = originalUrl;
    link.id = 'title-link-' + serviceName
    link.innerText = serviceName.toUpperCase();

    title.appendChild(link);

    document.body.appendChild(dropdownDiv);
    dropdownDiv.appendChild(title);

    var radioDiv = buildRegionSelectors(serviceName, link, originalUrl, urlWithoutRegion, linkList, serviceFunctions)

    dropdownDiv.appendChild(radioDiv);

    return dropdownDiv;
}

// Maybe these will be useful in the future
function iamInit() {}
function ec2Init() {}
function vpcInit() {}
function s3Init() {}
function kmsInit() {}
function r53Init() {}

// The links here should not have any region references. It will be automatically added as needed.
function iamLinks(linkList, region) {
    linkList.appendChild(createLinkListItem('https://console.aws.amazon.com/iam/home#/users', 'Users', region));
    linkList.appendChild(createLinkListItem('https://console.aws.amazon.com/iam/home#/roles', 'Roles', region));
    linkList.appendChild(createLinkListItem('https://console.aws.amazon.com/iam/home#/policies', 'Policies', region));
}

function ec2Links(linkList, region) {
    linkList.appendChild(createLinkListItem('https://console.aws.amazon.com/ec2/v2/home#Instances:', 'Instances', region));
    linkList.appendChild(createLinkListItem('https://console.aws.amazon.com/ec2/v2/home#LoadBalancers:', 'Load Balancers', region));
    linkList.appendChild(createLinkListItem('https://console.aws.amazon.com/ec2/v2/home#NIC:', 'Network Interfaces', region));
    linkList.appendChild(createLinkListItem('https://console.aws.amazon.com/ec2/v2/home#SecurityGroups:', 'Security Groups', region));
    linkList.appendChild(createLinkListItem('https://console.aws.amazon.com/ec2/autoscaling/home#AutoScalingGroups:', 'Auto Scaling Groups', region));
}

function vpcLinks(linkList, region) {
    linkList.appendChild(createLinkListItem('https://console.aws.amazon.com/vpc/home#vpcs:', 'VPCs', region));
    linkList.appendChild(createLinkListItem('https://console.aws.amazon.com/vpc/home#subnets:', 'Subnets', region));
    linkList.appendChild(createLinkListItem('https://console.aws.amazon.com/vpc/home#acls:', 'Network ACLs', region));
    linkList.appendChild(createLinkListItem('https://console.aws.amazon.com/vpc/home#SecurityGroups:', 'Security Groups', region));
}

function s3Links(linkList, region) {
    // not much to do here other than shortcuts to specific buckets, once that is supported by this script.
}

function kmsLinks(linkList, region) {
    // ibid
}

function r53Links(linkList, region) {
    // ibid
}

function setupCss() {

    GM_addStyle(`.service-dropdown {
position: absolute;
display: none;
box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
z-index: 100;
background-color: #f9f9f9;
min-width: 300px;
min-height: 300px;
}`);

    GM_addStyle(`.container-title {
font-size: 14pt;
font-weight: bold;
padding: 8px 8px;
display: block;
text-align: left;
}`);

    GM_addStyle(`.radio-comment {
font-size: 8pt;
padding-top: 3px;
}`);

     GM_addStyle(`.region-select-container {
color: black;
font-size: 10pt;
display: block;
padding-left: 5px;
padding-bottom: 5px;
}`);

    // padding-inline-start overrides the default ul style on the page
    GM_addStyle(`.region-select-list {
list-style: none;
padding-inline-start: 0px;
}`);

    GM_addStyle(`.region-select-list-item {
padding-left: 2px;
padding-top: 2px;
}`);

    GM_addStyle(`.region-select-radio-label {
padding-left: 5px;
}`);

    GM_addStyle(`.link-list {
list-style: none;
padding-inline-start: 0px;
padding-left: 5px;
}`);

    GM_addStyle(`.link-list-item {
font-size: 12pt;
}`);
}


