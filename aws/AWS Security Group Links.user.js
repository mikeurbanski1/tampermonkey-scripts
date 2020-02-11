// ==UserScript==
// @name         AWS Security Group Links
// @version      0.1
// @description  Provide some links for better security group navigation in AWS. Also adds a link to copy the SG ID to the clipboard and open the VPC.
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

// The class names for identifying the VPC ID container in the info subpanel. Again, EC2 is different per region.
var vpcVpcIdClassNames = ['GGDXUD2BJI'];
var ec2VpcIdClassNames = ['GLIWNNXDEK', 'GGVUFA2CGK'];

(function() {
    'use strict';

    console.log('SG script is running');

    var handlers = {
        vpc: {
            getId: getIdVpc,
            getLinks: getLinksVpc,
            classNames: vpcClassNames,
            vpcIdClassNames: vpcVpcIdClassNames
        },
        ec2: {
            getId: getIdEc2,
            getLinks: getLinksEc2,
            classNames: ec2ClassNames,
            vpcIdClassNames: ec2VpcIdClassNames
        }
    }

    var isInVpc = /vpc\/home/.test(window.location.href);
    var handler = isInVpc ? handlers.vpc : handlers.ec2;

    // The EC2 or VPC page loads once, and then does background data fetching after that. So, we essentially have to keep polling the URL:
    // first to see if we are in the right sub-page, and repeatedly to see if it changes.
    (function run(handler, origSgId, isInVpc) {

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
                addLinks(sgId, links, handler.classNames);
                addVpcLink(handler.vpcIdClassNames, isInVpc);
            }
        }

        setTimeout(() => run(handler, sgId, isInVpc), 1000);

    })(handler, null, isInVpc);
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

function addLinks(sgId, links, classNames) {
    var infoElement = getParentContainer(classNames)

    infoElement.appendChild(createCopyLink(sgId));

    links.forEach(link => {
        var s = document.createElement('span');
        s.innerHTML = getHtmlForLink(link);
        infoElement.appendChild(s);
    });
}

function createCopyLink(textToCopy) {
    var span = document.createElement('span');
    var link = document.createElement('a');
    link.textContent = '⧉ → 📋';
    link.onclick = () => function(text) {
        copy(text);
    }(textToCopy);

    span.appendChild(link);
    return span;
}

function addVpcLink(vpcIdClassNames, isInVpc) {

    var fields;

    for (var cls of vpcIdClassNames) {
        var els = document.getElementsByClassName(cls);
        if (els && els.length > 0) {
            fields = els;
            break;
        }
    }

    if (!fields) {
        console.error('Could not find fields to update for VPC');
        return;
    }

    var element;
    var vpcId;

    for (var field of fields) {
        var firstChildText = field.firstChild.textContent;
        if (firstChildText.startsWith('vpc-')) {
            element = field.firstChild;
            vpcId = firstChildText;
            break;
        }
    }

    element.innerHTML = `<a href="${getUrlToVpc(vpcId, isInVpc)}">${vpcId}</a>`;
}

function getHtmlForLink(link) {
    return ` | <a href="${link.url}">${link.text}</a>`;
}

function getUrlToVpc(vpcId, isInVpc) {
    var postfix = `#vpcs:search=${vpcId};sort=VpcId`;
    return isInVpc ? postfix : 'https://console.aws.amazon.com/vpc/home' + postfix; // Stay in VPC SPA if possible
}

function copy(text) {
    // This should work for a modern browser. The ugly alternative is to create a hidden element with text, select its text, and issue a "copy" command.
    navigator.clipboard.writeText(text).then(function() {

  }, function(err) {
    console.error('Could not copy text: ', err);
  });
}

