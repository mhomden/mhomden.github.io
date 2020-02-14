// Weblife JS Library
(function () {
    window.weblife = function (options) {
        "use strict";

        options = options || {};

        // Helper functions to find intersecting array elements
        function testWildcard(rule, url) {
            var allowPrefix = false;
            var allowSuffix = false;

            if (rule[0] === '*') {
                allowPrefix = true;
                rule = rule.slice(1);
            }

            if (rule[rule.length - 1] === '*') {
                allowSuffix = true;
                rule = rule.slice(0, -1);
            }

            if (!allowPrefix && (url.slice(0, rule.length) !== rule)) {
                return false;
            }

            if (!allowSuffix && (url.slice(-rule.length) !== rule)) {
                return false;
            }

            return url.indexOf(rule) !== -1;
        }

        function arrayIntersect(arr1, arr2) {
            return arr1.filter(function (s) {return arr2.some(function (re) {return testWildcard(s, re);});
        });
        };

        // Match dictionary for data types: url, category, app, appAction.
        var isolationMatch = {};

        // URL Category Match
        if (options.urlCategory === undefined) {
            console.log('Missing "urlCategory" option:', options);
            return;
        }

        if (options.isolateList.isolate_url_category) {
            // Convert to array w/ case insensitivity
            var urlCategoryArray = options.urlCategory.toLocaleString().toLowerCase().split(/[,;]/).map(function(item){return item.trim()});
            var isolateUrlCategoryArray = options.isolateList.isolate_url_category.toLocaleString().toLowerCase().split(/[,;]/).map(function(item){return item.trim()});

            console.groupCollapsed("--- CATEGORY MATCH ---");
                console.log('Blockpage Categories: ', urlCategoryArray);
                console.log('Isolate Categories: ', isolateUrlCategoryArray );
                console.log('Match: ', arrayIntersect(isolateUrlCategoryArray, urlCategoryArray));
            console.groupEnd();

            if (arrayIntersect(isolateUrlCategoryArray, urlCategoryArray).length) {
                isolationMatch.url_category = true;
            }
        }

        // URL Match
        if (options.targetUrl === undefined) {
            console.log('Missing "targetUrl" option:', options);
            return;
        }

        if (options.isolateList.isolate_url) {
            // Convert to array w/ case insensitivity
            var targetUrlArray = options.targetUrl.toLocaleString().toLowerCase().split(/[,;]/).map(function(item){return item.trim()});
            var isolateUrlArray = options.isolateList.isolate_url.toLocaleString().toLowerCase().split(/[,;]/).map(function(item){return item.trim()});

            console.groupCollapsed("--- URL MATCH ---");
                console.log('Blockpage URL: ', targetUrlArray);
                console.log('Isolate URL: ', isolateUrlArray);
                console.log('Match: ', arrayIntersect(isolateUrlArray, targetUrlArray));
            console.groupEnd();

            if (arrayIntersect(isolateUrlArray, targetUrlArray).length) {
                isolationMatch.target_url = true;
            }
        }

        // OPTIONAL FIELDS
        if (options.appName && options.isolateList.isolate_app_name) {
            var appNameArray = options.appName.split(/[,;]/).map(function(item){return item.trim()});

            console.groupCollapsed("--- APP NAME MATCH ---");
                console.log('AppName: ', appNameArray);
                console.log('Isolate AppName: ', options.isolateList.isolate_app_name);
                console.log('Match: ', arrayIntersect(options.isolateList.isolate_app_name, appNameArray));
            console.groupEnd();

            if (arrayIntersect(options.isolateList.isolate_app_name, appNameArray).length) {
                isolationMatch.app_name = true;
            }
        }

        if (options.appAction && options.isolateList.isolate_app_action) {
            var appActionArray = options.appAction.split(/[,;]/).map(function(item){return item.trim()});

            console.groupCollapsed("--- APP ACTION MATCH ---");
                console.log('AppAction: ', appActionArray);
                console.log('Isolate AppAction: ', options.isolateList.isolate_app_action);
                console.log('Match: ', arrayIntersect(options.isolateList.isolate_app_action, appActionArray));
            console.groupEnd();

            if (arrayIntersect(options.isolateList.isolate_app_action, appActionArray).length) {
                isolationMatch.app_action = true;
            }
        }

        // Dictionary check
        console.log("Final Match Dictionary: ", isolationMatch);

        // EXIT (don't show message if there are no matches.)
        if (Object.keys(isolationMatch).length === 0) {
            return;
        }

        var base = options.pfptEnv;
        var url = base + encodeURIComponent(options.targetUrl);

        // add notification info to URL
        if (options.notification) {
            url += '&notification=' + encodeURIComponent(options.notification);

            if (options.notificationLink) {
                url += '&notificationLink=' + encodeURIComponent(options.notificationLink);
            }
        }

        var humanFriendlyUrl = base + options.targetUrl;

        if (options.autoRedirect === true) {
            window.location.replace(url);
            return;
        }

        var container = document.getElementById(options.containerId);
        if (!container) {
            console.log('Missing element for containerId option:', options);
            return;
        }

        var message = messageTop + messageBottom;

        if (options.autoRedirect === 'countdown') {
            // Add the countdownMessage and display page
            message = messageTop + messageCountdown + messageBottom;
            container.innerHTML = '<div class="container">' + message + '</div>';
            document.querySelector('.countdown').textContent = options.countdownNum;

            var resume = true;

            // Update the count down every 1 second
            var x = setInterval(function() {
                if (resume) {
                    options.countdownNum--;
                    if (options.countdownNum <= 1) {
                        window.location.href = url;
                        resume = !resume;
                    }
                }
                document.querySelector('.countdown').textContent = options.countdownNum;
            }, 1000);

            var pauseButton = document.querySelector('.pauseButton').addEventListener('click', function(){
                resume = !resume;

                var pauseButtonText = document.querySelector('.pauseButton');
                resume ? pauseButtonText.innerText = 'pause' : pauseButtonText.innerText = 'continue';
            });
        } else {
        // Add the final message to the page.
        container.innerHTML = '<div class="container">' + message + '</div>';
        }

        // Update the isolation link dynamically
        document.querySelector('.isolation-link-url').href = url;
    };
})();
