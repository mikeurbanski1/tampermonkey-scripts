// ==UserScript==
// @name         AWS Security Group Links
// @version      0.1
// @description  Provide some links for better security group navigation in AWS.
// @author       Mike Urbanski
// @match        *console.aws.amazon.com/vpc/home*
// @match        *console.aws.amazon.com/ec2/v2/home*
// @match        *.console.aws.amazon.com/vpc/home*
// @match        *.console.aws.amazon.com/ec2/v2/home*
// @grant        none
// ==/UserScript==

// The VPC and EC2 pages behave differently. VPC has the same class name for each region (or at least, us-east-1 and us-west-2).
// EC2 has a different class name by region.
var vpcClassNames = ['GGDXUD2BI1'];
var ec2ClassNames = ['GGVUFA2COMB', 'GLIWNNXDKNB'];

(function() {
    'use strict';

    console.log('SG script is running');

    var handlers = {
        vpc: {
            getId: getIdVpc,
            getLinks: getLinksVpc,
            addLinks: addLinksVpc
        },
        ec2: {
            getId: getIdEc2,
            getLinks: getLinksEc2,
            addLinks: addLinksEc2
        }
    }

    var handler = /vpc\/home/.test(window.location.href) ? handlers.vpc : handlers.ec2;

    // The EC2 or VPC page loads once, and then does background data fetching after that. So, we essentially have to keep polling the URL:
    // first to see if we are in the right sub-page, and repeatedly to see if it changes.
    (function run(handler, origSgId) {

        if (! /#securitygroups/.test(window.location.href.toLowerCase())) {
//             console.log('Not a security group page');
        }
        else {
//             console.log('In a security group page');
            var sgId = handler.getId();
//             console.log(sgId);
            if (!sgId) {
//                 console.log('No SG selected ');
            }
            else if (sgId == origSgId) {
//                 console.log('Same SG selected');
            }
            else {
                console.log('New SG selected: ' + sgId);
                var links = handler.getLinks(sgId).concat(getCommonLinks(sgId));
                handler.addLinks(links);
            }
        }

        setTimeout(() => run(handler, sgId), 1000);

    })(handler, null);
})();

function getParentContainer(classNames) {
    var infoElement;
    for (var cls of classNames) {
        infoElement = document.getElementsByClassName(cls).item(0);
        if (infoElement) {
            break
        }
    }
    return infoElement;
}

function getIdVpc() {
    var infoElement = getParentContainer(vpcClassNames);
    if (!infoElement || !infoElement.firstChild) {
//         console.log('No group selected');
        return null;
    }
    else {
        var sgId = infoElement.childNodes.item(1).textContent;
//         console.log(sgId);
        return sgId;
    }
}

function getIdEc2() {
    var infoElement = getParentContainer(ec2ClassNames);

    if (!infoElement || !infoElement.firstChild || !infoElement.firstChild.tagName) {
//         console.log('No group selected');
        return null;
    }
    else {
        // String format is: "Security Group: <sg-id>"
        var sgLabelText = infoElement.firstChild.textContent
        var sgId = sgLabelText.substring(sgLabelText.indexOf(':') + 2);
//         console.log(sgId);
        return sgId;
    }
}

function getLinksVpc(sgId) {
    return [
            {
            url: 'https://console.aws.amazon.com/ec2/v2/home#securityGroups:groupId=' + sgId,
            text: 'View in EC2'
            }
           ];
}

function getLinksEc2(sgId) {
    return [
            {
            url: 'https://console.aws.amazon.com/vpc/home#securityGroups:filter=' + sgId,
            text: 'View in VPC'
            }
           ];
}

function getCommonLinks(sgId) {
    return [
            {
            url: `https://console.aws.amazon.com/ec2/v2/home#Instances:search=${sgId};sort=instanceId`,
            text: 'Search Instances'
            },
            {
            url: `https://console.aws.amazon.com/ec2/v2/home#NIC:search=${sgId};sort=instanceId`,
            text: 'Search Network Interfaces'
            }
           ];
}

function addLinksVpc(links) {
    var infoElement = getParentContainer(vpcClassNames)
    links.forEach(link => {
        var s = document.createElement('span');
        s.innerHTML = getTextForLink(link);
        infoElement.appendChild(s);
    });
}

function addLinksEc2(links) {
    var infoElement = getParentContainer(ec2ClassNames)

    links.forEach(link => {
        var s = document.createElement('span');
        s.innerHTML = getTextForLink(link);
        infoElement.appendChild(s);
    });
}

function getTextForLink(link) {
    return ` | <a href="${link.url}">${link.text}</a>`
}


