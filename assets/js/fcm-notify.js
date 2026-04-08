(function () {
    'use strict';

    // Expose minimal API under edu.fcm
    if (!window.edu) window.edu = {};
    if (!window.edu.fcm) window.edu.fcm = {};

    var FIREBASE_CONFIG = {
        apiKey: 'AIzaSyA2A_tudRnQTcrfr9zaxvXxmVAlRy9HVUc',
        authDomain: 'iu-notification-7cf54.firebaseapp.com',
        projectId: 'iu-notification-7cf54',
        storageBucket: 'iu-notification-7cf54.firebasestorage.app',
        messagingSenderId: '716994724011',
        appId: '1:716994724011:web:4462bd887a65d2491ab7ee'
    };

    // You MUST set this (Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates)
    // E.g. in index.aspx: window.FCM_VAPID_KEY = '...';
    function getVapidKey() {
        var key = (window.FCM_VAPID_KEY || '').trim();
        if (key) return key;
        try {
            key = (localStorage.getItem('FCM_VAPID_KEY') || '').trim();
        } catch (e) {
        }
        return key;
    }

    function isProbablyValidVapidKey(key) {
        // Firebase Web Push public key is base64url and usually ~87 chars.
        // This is a heuristic check to catch common mistakes (server key, private key, too short, contains invalid chars).
        if (!key) return false;
        if (key.length < 70) return false;
        return /^[A-Za-z0-9_-]+$/.test(key);
    }

    function normalizeUrlJoin(base, path) {
        base = base || '';
        path = path || '';
        if (!base) return path;
        if (!path) return base;
        if (base[base.length - 1] === '/' && path[0] === '/') return base + path.substring(1);
        if (base[base.length - 1] !== '/' && path[0] !== '/') return base + '/' + path;
        return base + path;
    }

    function getServiceWorkerUrl() {
        // Prefer edu.system.rootPath (contains virtual directory), fallback to same folder.
        try {
            if (window.edu && edu.system && edu.system.rootPath) {
                return normalizeUrlJoin(edu.system.rootPath, '/firebase-messaging-sw.js');
            }
        } catch (e) {
        }
        return 'firebase-messaging-sw.js';
    }

    function canUseWebPush() {
        if (!('Notification' in window)) return false;
        if (!('serviceWorker' in navigator)) return false;
        if (!('PushManager' in window)) return false;
        if (typeof window.isSecureContext === 'boolean' && window.isSecureContext === false) return false;
        return true;
    }

    function initFirebaseIfNeeded() {
        if (!window.firebase) {
            console.warn('[FCM] firebase SDK not loaded (missing firebase-app-compat / firebase-messaging-compat)');
            return null;
        }

        try {
            if (!firebase.apps || !firebase.apps.length) {
                var webnotu = firebase.initializeApp(FIREBASE_CONFIG);
                console.log('[FCM] Firebase initialized:', webnotu);
            }
        } catch (e) {
            // ignore duplicate init
        }

        try {
            return firebase.messaging();
        } catch (e2) {
            console.warn('[FCM] firebase.messaging() failed:', e2);
            return null;
        }
    }

    function saveTokenToOracle(token) {
        try {
            if (!window.edu || !edu.system || typeof edu.system.makeRequest !== 'function') {
                console.warn('[FCM] edu.system.makeRequest not available');
                return;
            }

            if (!edu.system.userId) {
                console.warn('[FCM] missing edu.system.userId; skip saving token');
                return;
            }

            // 1) Try insert (ThemMoi_USER_FCM)
            var obj_insert = {
                action: 'CMS_ThongBao_MH/FSkkLAwuKB4UEgQTHgcCDAPP',
                func: 'pkg_thongbao.ThemMoi_USER_FCM',
                iM: edu.system.iM,
                strUSER_ID: edu.system.userId,
                strTOKEN: token
            };

            // 2) Fallback update (Update_USER_FCM)
            var obj_update = {
                action: 'CMS_ThongBao_MH/FDElIDUkHhQSBBMeBwIM',
                func: 'pkg_thongbao.Update_USER_FCM',
                iM: edu.system.iM,
                strUSER_ID: edu.system.userId,
                strTOKEN: token
            };

            function doUpdate(reason) {
                edu.system.makeRequest({
                    success: function (data2) {
                        console.log('[FCM] updated token:', data2 && data2.Success !== undefined ? data2.Success : data2, reason ? ('(' + reason + ')') : '');
                    },
                    error: function (er2) {
                        console.warn('[FCM] update token error:', er2);
                    },
                    type: 'POST',
                    action: obj_update.action,
                    contentType: true,
                    data: obj_update
                }, false, false, false, null);
            }

            edu.system.makeRequest({
                success: function (data) {
                    // Expecting { Success, Message, Data } (varies by API)
                    if (data && data.Success === true) {
                        console.log('[FCM] inserted token: true');
                        return;
                    }

                    // Insert failed (often because record exists) => update
                    doUpdate((data && data.Message) ? data.Message : 'insert-not-success');
                },
                error: function (er) {
                    // Insert call errored => try update as a best-effort
                    console.warn('[FCM] insert token error:', er);
                    // Don't spam update on auth errors
                    if (er && er.status === 401) return;
                    doUpdate('insert-error');
                },
                type: 'POST',
                action: obj_insert.action,
                contentType: true,
                data: obj_insert
            }, false, false, false, null);
        } catch (e) {
            console.warn('[FCM] saveTokenToOracle exception:', e);
        }
    }

    async function registerServiceWorker() {
        var swUrl = getServiceWorkerUrl();
        try {
            return await navigator.serviceWorker.register(swUrl);
        } catch (e) {
            console.warn('[FCM] service worker register failed:', swUrl, e);
            return null;
        }
    }

    async function getAndSaveToken(messaging, serviceWorkerRegistration) {
        var vapidKey = getVapidKey();
        if (!vapidKey) {
            console.warn('[FCM] Missing window.FCM_VAPID_KEY (VAPID key)');
            return;
        }

        if (!isProbablyValidVapidKey(vapidKey)) {
            console.warn('[FCM] VAPID key looks invalid (len=' + vapidKey.length + '). Use Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates -> Public key.');
            return;
        }

        try {
            var currentToken = await messaging.getToken({
                vapidKey: vapidKey,
                serviceWorkerRegistration: serviceWorkerRegistration || undefined
            });

            if (!currentToken) {
                console.warn('[FCM] No token returned');
                return;
            }

            // Expose token for debugging/copying
            try {
                if (window.edu && edu.fcm) edu.fcm.currentToken = currentToken;
            } catch (eExpose) {
            }
            try {
                localStorage.setItem('FCM_CURRENT_TOKEN', currentToken);
            } catch (eLs) {
            }

            console.log('[FCM] Token đang sử dụng là:', currentToken);
            var cacheKey = 'FCM_TOKEN_LAST';
            var lastToken = '';
            try { lastToken = localStorage.getItem(cacheKey) || ''; } catch (e0) { }

            if (lastToken !== currentToken) {
                try { localStorage.setItem(cacheKey, currentToken); } catch (e1) { }
                saveTokenToOracle(currentToken);
            } else {
                // unchanged
            }
        } catch (e2) {
            console.warn('[FCM] getToken failed:', e2);
        }
    }

    async function enableNotificationsInternal() {
        if (!canUseWebPush()) {
            console.warn('[FCM] Web Push requires HTTPS (or localhost) + Notifications + ServiceWorker + PushManager');
            return;
        }

        // Request permission only when needed
        if (Notification.permission === 'denied') {
            console.warn('[FCM] Notification permission denied');
            return;
        }

        if (Notification.permission !== 'granted') {
            try {
                var permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.warn('[FCM] User did not grant permission:', permission);
                    return;
                }
            } catch (e0) {
                console.warn('[FCM] requestPermission failed:', e0);
                return;
            }
        }

        var messaging = initFirebaseIfNeeded();
        if (!messaging) return;

        try {
            if (typeof messaging.onMessage === 'function') {
                messaging.onMessage(function (payload) {
                    console.log('[FCM] foreground message:', payload);
                });
            }
        } catch (eMsg) {
        }

        var reg = await registerServiceWorker();
        await getAndSaveToken(messaging, reg);
    }

    // Public API
    // Call after login has completed and edu.system.userId is ready.
    window.edu.fcm.init = function () {
        // Delay a bit so AFG() finishes and edu.system is fully populated.
        setTimeout(function () {
            enableNotificationsInternal();
        }, 500);
    };

    // Manual trigger if you prefer calling from a button later:
    window.edu.fcm.enable = function () {
        return enableNotificationsInternal();
    };

    // Get last known token (from memory or localStorage)
    window.edu.fcm.getToken = function () {
        try {
            if (window.edu && edu.fcm && edu.fcm.currentToken) return edu.fcm.currentToken;
        } catch (e0) {
        }
        try {
            return localStorage.getItem('FCM_CURRENT_TOKEN') || '';
        } catch (e1) {
        }
        return '';
    };
})();
