'use strict';
/* ============================================================================
   Forj — Live Backend (Daily Hearth) · SINGLE-FILE build.
   Everything is inlined here: the Ember Engine, the Strava client, the token
   store, the activity data, and the web page. No local require()s, so the repo
   only needs this file + package.json. Nothing to mislabel.

   Modes: live (STRAVA_CLIENT_ID set → OAuth + live pull) · local (demo data).
   ========================================================================== */
try { require('dotenv').config(); } catch (e) {}
const express = require('express');
const path = require('path');
const fs = require('fs');

/* ---------- embedded activity data (demo / local mode) ---------- */
const ACTIVITIES_DATA = [
  {"id":"19327541710","name":"Evening Weight Training","type":"WeightTraining","date":"2026-07-15T19:30:01","dist":0,"mov":1801,"elev":0,"eff":4,"cal":275,"pr":0},
  {"id":"19297740709","name":"Afternoon Run","type":"Run","date":"2026-07-13T17:57:47","dist":8112,"mov":2205,"elev":24,"eff":50,"cal":694,"pr":1},
  {"id":"19277965203","name":"Morning Run","type":"Run","date":"2026-07-12T07:19:59","dist":16125,"mov":5464,"elev":457,"eff":60,"cal":1509,"pr":12},
  {"id":"19265253461","name":"100th Parkrun","type":"Run","date":"2026-07-11T09:03:23","dist":4971,"mov":1205,"elev":15,"eff":46,"cal":434,"pr":9},
  {"id":"19265253444","name":"Morning Run","type":"Run","date":"2026-07-11T08:37:44","dist":1618,"mov":523,"elev":9,"eff":7,"cal":145,"pr":0},
  {"id":"19259809831","name":"Evening Run","type":"Run","date":"2026-07-10T19:31:03","dist":8054,"mov":2442,"elev":3,"eff":27,"cal":685,"pr":0},
  {"id":"19246876123","name":"Evening Run","type":"Run","date":"2026-07-09T18:52:42","dist":8573,"mov":2809,"elev":0,"eff":18,"cal":722,"pr":0},
  {"id":"19233166050","name":"Evening Weight Training","type":"WeightTraining","date":"2026-07-08T19:40:03","dist":0,"mov":1802,"elev":0,"eff":4,"cal":263,"pr":0},
  {"id":"19203942484","name":"Afternoon Run","type":"Run","date":"2026-07-06T17:53:21","dist":5883,"mov":1988,"elev":20,"eff":23,"cal":589,"pr":1},
  {"id":"19185161768","name":"Morning Run","type":"Run","date":"2026-07-05T07:07:09","dist":18059,"mov":6164,"elev":245,"eff":27,"cal":1521,"pr":1},
  {"id":"19178541176","name":"Afternoon Run","type":"Run","date":"2026-07-04T16:01:22","dist":9696,"mov":2669,"elev":27,"eff":52,"cal":814,"pr":3},
  {"id":"19167488495","name":"Evening Weight Training","type":"WeightTraining","date":"2026-07-03T19:52:49","dist":0,"mov":2701,"elev":0,"eff":5,"cal":334,"pr":0},
  {"id":"19153126214","name":"Afternoon Run","type":"Run","date":"2026-07-02T16:30:04","dist":6441,"mov":2408,"elev":57,"eff":8,"cal":532,"pr":0},
  {"id":"19142036266","name":"Zwift — Jungle Circuit","type":"VirtualRide","date":"2026-07-01T20:16:22","dist":11982,"mov":1821,"elev":96,"eff":5,"cal":257,"pr":3},
  {"id":"19139416203","name":"2 Mile TT (5K)","type":"Run","date":"2026-07-01T16:49:02","dist":6441,"mov":1716,"elev":19,"eff":34,"cal":528,"pr":8},
  {"id":"19125588710","name":"Afternoon Run","type":"Run","date":"2026-06-30T16:17:54","dist":9667,"mov":2969,"elev":81,"eff":21,"cal":781,"pr":3},
  {"id":"19097092218","name":"Morning Run","type":"Run","date":"2026-06-28T10:46:07","dist":16100,"mov":4937,"elev":73,"eff":24,"cal":1256,"pr":5},
  {"id":"19089880565","name":"Evening Run","type":"Run","date":"2026-06-27T19:19:50","dist":11270,"mov":3438,"elev":8,"eff":16,"cal":883,"pr":0},
  {"id":"19076795657","name":"Zwift — TT Club Racing R.G.V.","type":"VirtualRide","date":"2026-06-26T19:21:05","dist":17786,"mov":1839,"elev":54,"eff":30,"cal":434,"pr":12},
  {"id":"19074224614","name":"Afternoon Run","type":"Run","date":"2026-06-26T14:47:56","dist":5018,"mov":1394,"elev":0,"eff":21,"cal":401,"pr":0},
  {"id":"19065903835","name":"Evening Run","type":"Run","date":"2026-06-25T20:15:22","dist":6442,"mov":2210,"elev":4,"eff":12,"cal":563,"pr":0},
  {"id":"19053622650","name":"Zwift — INC Relentless Social Ride","type":"VirtualRide","date":"2026-06-24T20:27:27","dist":11800,"mov":1537,"elev":171,"eff":24,"cal":304,"pr":12},
  {"id":"19026261045","name":"Sweating like a snowman in June","type":"VirtualRide","date":"2026-06-22T19:52:40","dist":10987,"mov":1800,"elev":96,"eff":5,"cal":236,"pr":0},
  {"id":"19025011769","name":"Afternoon Run","type":"Run","date":"2026-06-22T17:50:13","dist":8853,"mov":2870,"elev":11,"eff":45,"cal":821,"pr":1},
  {"id":"19014299742","name":"Zwift — Expand","type":"VirtualRide","date":"2026-06-21T19:31:24","dist":15223,"mov":1800,"elev":62,"eff":5,"cal":290,"pr":11},
  {"id":"19005933640","name":"Morning Run","type":"Run","date":"2026-06-21T07:02:14","dist":18068,"mov":5559,"elev":107,"eff":56,"cal":1494,"pr":0},
  {"id":"19001388747","name":"Zwift — Training Zones","type":"VirtualRide","date":"2026-06-20T20:15:20","dist":14008,"mov":1813,"elev":64,"eff":4,"cal":236,"pr":9},
  {"id":"18987745249","name":"Zwift — Aerobic Triple Rhythm","type":"VirtualRide","date":"2026-06-19T19:22:21","dist":14130,"mov":1801,"elev":56,"eff":4,"cal":249,"pr":6},
  {"id":"18982840606","name":"Lunch Run","type":"Run","date":"2026-06-19T11:16:01","dist":9665,"mov":3002,"elev":180,"eff":37,"cal":827,"pr":11},
  {"id":"18960118279","name":"Afternoon Run","type":"Run","date":"2026-06-17T16:25:08","dist":12940,"mov":3944,"elev":119,"eff":62,"cal":1111,"pr":1},
  {"id":"18932222799","name":"Club 12 x 200m","type":"Run","date":"2026-06-15T17:49:16","dist":8026,"mov":2236,"elev":4,"eff":44,"cal":612,"pr":0},
  {"id":"18921572899","name":"Zwift — Neon Flats","type":"VirtualRide","date":"2026-06-14T19:31:20","dist":14928,"mov":1818,"elev":72,"eff":0,"cal":265,"pr":2},
  {"id":"18912820086","name":"Morning Run","type":"Run","date":"2026-06-14T07:26:02","dist":17719,"mov":5974,"elev":253,"eff":100,"cal":1431,"pr":0},
  {"id":"18908658289","name":"Zwift — Oh Hill No","type":"VirtualRide","date":"2026-06-13T20:53:57","dist":7973,"mov":1826,"elev":313,"eff":0,"cal":360,"pr":20},
  {"id":"18891566435","name":"Afternoon Run","type":"Run","date":"2026-06-12T14:43:01","dist":8855,"mov":2927,"elev":9,"eff":17,"cal":686,"pr":0},
  {"id":"18880140717","name":"Afternoon Run","type":"Run","date":"2026-06-11T17:07:09","dist":5036,"mov":1418,"elev":51,"eff":23,"cal":403,"pr":3},
  {"id":"18869471398","name":"Zwift — Beach Island Loop","type":"VirtualRide","date":"2026-06-10T19:57:09","dist":14579,"mov":1830,"elev":61,"eff":0,"cal":265,"pr":3},
  {"id":"18866867844","name":"Afternoon Run","type":"Run","date":"2026-06-10T16:45:34","dist":8060,"mov":2201,"elev":16,"eff":53,"cal":654,"pr":7},
  {"id":"18852835943","name":"Afternoon Run","type":"Run","date":"2026-06-09T17:06:00","dist":5319,"mov":1631,"elev":28,"eff":12,"cal":419,"pr":9},
  {"id":"18841145673","name":"Loading Up with Runna","type":"Workout","date":"2026-06-08T19:25:05","dist":0,"mov":2725,"elev":0,"eff":0,"cal":0,"pr":0},
  {"id":"18841163781","name":"CRC Track — overcooked that one","type":"Run","date":"2026-06-08T17:54:15","dist":6442,"mov":1924,"elev":28,"eff":32,"cal":543,"pr":1},
  {"id":"18819676929","name":"Morning Run","type":"Run","date":"2026-06-07T08:01:27","dist":16102,"mov":5079,"elev":28,"eff":49,"cal":1311,"pr":1},
  {"id":"18800760124","name":"Zwift — Loop de Loop","type":"VirtualRide","date":"2026-06-05T19:23:39","dist":25824,"mov":3026,"elev":302,"eff":0,"cal":601,"pr":34},
  {"id":"18795573415","name":"Broken miles","type":"Run","date":"2026-06-05T12:00:45","dist":8858,"mov":2460,"elev":12,"eff":48,"cal":698,"pr":4},
  {"id":"18788313638","name":"Evening Workout","type":"Workout","date":"2026-06-04T19:38:17","dist":0,"mov":0,"elev":2,"eff":0,"cal":267,"pr":0},
  {"id":"18774641262","name":"Zwift — Mountain Mash","type":"VirtualRide","date":"2026-06-03T19:55:06","dist":6190,"mov":1709,"elev":332,"eff":0,"cal":329,"pr":64},
  {"id":"18772133737","name":"Afternoon Run","type":"Run","date":"2026-06-03T16:50:36","dist":8053,"mov":2379,"elev":34,"eff":33,"cal":638,"pr":7},
  {"id":"18761439758","name":"Afternoon Run","type":"Run","date":"2026-06-02T16:28:25","dist":8434,"mov":2685,"elev":91,"eff":15,"cal":666,"pr":1},
  {"id":"18746687347","name":"Zwift — Tick Tock","type":"VirtualRide","date":"2026-06-01T20:29:51","dist":10230,"mov":1229,"elev":18,"eff":0,"cal":173,"pr":20},
  {"id":"18746332735","name":"Full Body Strength with Runna","type":"Workout","date":"2026-06-01T19:36:18","dist":0,"mov":2615,"elev":0,"eff":0,"cal":0,"pr":0}
];

/* ---------- embedded web page ---------- */
const HEARTH_HTML = Buffer.from("PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImVuIj4KPGhlYWQ+CjxtZXRhIGNoYXJzZXQ9IlVURi04Ij4KPG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLCBtYXhpbXVtLXNjYWxlPTEsIHVzZXItc2NhbGFibGU9bm8iPgo8dGl0bGU+Rm9yaiDCtyBEYWlseSBIZWFydGggKGxpdmUpPC90aXRsZT4KPHN0eWxlPgogICp7bWFyZ2luOjA7cGFkZGluZzowO2JveC1zaXppbmc6Ym9yZGVyLWJveDstd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6dHJhbnNwYXJlbnR9CiAgQHByb3BlcnR5IC0tZGVneyBzeW50YXg6JzxhbmdsZT4nOyBpbmhlcml0czpmYWxzZTsgaW5pdGlhbC12YWx1ZToxODBkZWc7IH0KICA6cm9vdHsKICAgIC0tYmc6IzBiMDkxMDstLWNhcmQ6cmdiYSgyNTUsMjU1LDI1NSwuMDQ1KTstLWNhcmQyOnJnYmEoMjU1LDI1NSwyNTUsLjAzKTstLWxpbmU6cmdiYSgyNTUsMjU1LDI1NSwuMDkpOy0tbGluZTI6cmdiYSgyNTUsMjU1LDI1NSwuMDYpOwogICAgLS1pbms6I2Y0ZWNkZDstLWRpbTojYTk5ZThjOy0tZGltMjojN2Q3NDY2Oy0tZW1iZXI6I2ZjNzEzNzstLWVtYmVyMjojZmZiNDU0Oy0tZW1iZXIzOiNmZmQyN2E7LS1nb2xkOiNkOGIwNmE7CiAgICAtLWJsdWUyOiNhOWQ5ZWE7LS1ncmVlbjojN2ZkMDhhOy0tc3RyYXZhOiNmYzRjMDI7CiAgICAtLXNlcmlmOidJb3dhbiBPbGQgU3R5bGUnLCdQYWxhdGlubyBMaW5vdHlwZScsUGFsYXRpbm8sJ0Jvb2sgQW50aXF1YScsR2VvcmdpYSxzZXJpZjsKICAgIC0tdWk6LWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsJ1NlZ29lIFVJJyxSb2JvdG8sSGVsdmV0aWNhLEFyaWFsLHNhbnMtc2VyaWY7fQogIGh0bWwsYm9keXtoZWlnaHQ6MTAwJX0KICBib2R5e2ZvbnQtZmFtaWx5OnZhcigtLXVpKTtiYWNrZ3JvdW5kOnJhZGlhbC1ncmFkaWVudCg4MCUgNTAlIGF0IDMwJSAwJSxyZ2JhKDEyMCw2MCwyNSwuMzUpLHJnYmEoMCwwLDAsMCkgNjAlKSwjMDgwNzBjOwogICAgY29sb3I6dmFyKC0taW5rKTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7bWluLWhlaWdodDoxMDAlO3BhZGRpbmc6MjZweH0KICAuZGV2aWNle3Bvc2l0aW9uOnJlbGF0aXZlO3dpZHRoOjM5MnB4O2hlaWdodDo4NDRweDtib3JkZXItcmFkaXVzOjUycHg7YmFja2dyb3VuZDpsaW5lYXItZ3JhZGllbnQoMTYwZGVnLCMyMjFiMTYsIzBjMGEwZSk7CiAgICBwYWRkaW5nOjExcHg7Ym94LXNoYWRvdzowIDQwcHggOTBweCByZ2JhKDAsMCwwLC43KSwwIDAgMCAycHggcmdiYSgyNTUsMTkwLDEyMCwuMDYpLGluc2V0IDAgMXB4IDFweCByZ2JhKDI1NSwyNTUsMjU1LC4xNCl9CiAgLmRldmljZTo6YWZ0ZXJ7Y29udGVudDonJztwb3NpdGlvbjphYnNvbHV0ZTtpbnNldDoxMXB4O2JvcmRlci1yYWRpdXM6NDJweDtwb2ludGVyLWV2ZW50czpub25lO2JveC1zaGFkb3c6aW5zZXQgMCAwIDAgMXB4IHJnYmEoMCwwLDAsLjYpLGluc2V0IDAgMCA0MHB4IHJnYmEoMCwwLDAsLjUpO3otaW5kZXg6NDB9CiAgLnNjcmVlbntwb3NpdGlvbjphYnNvbHV0ZTtpbnNldDoxMXB4O2JvcmRlci1yYWRpdXM6NDJweDtvdmVyZmxvdzpoaWRkZW47YmFja2dyb3VuZDp2YXIoLS1iZyl9CiAgLnNjcm9sbHtwb3NpdGlvbjphYnNvbHV0ZTtpbnNldDowO292ZXJmbG93LXk6YXV0bztvdmVyZmxvdy14OmhpZGRlbjtwYWRkaW5nLWJvdHRvbTozMHB4O3Njcm9sbGJhci13aWR0aDpub25lfQogIC5zY3JvbGw6Oi13ZWJraXQtc2Nyb2xsYmFye2Rpc3BsYXk6bm9uZX0KICAuaXNsYW5ke3Bvc2l0aW9uOmFic29sdXRlO3RvcDoxMnB4O2xlZnQ6NTAlO3RyYW5zZm9ybTp0cmFuc2xhdGVYKC01MCUpO3dpZHRoOjEwNHB4O2hlaWdodDoyOXB4O2JhY2tncm91bmQ6IzAwMDtib3JkZXItcmFkaXVzOjE2cHg7ei1pbmRleDozMH0KICAuZ2xvd3twb3NpdGlvbjphYnNvbHV0ZTt0b3A6LTQwcHg7bGVmdDowO3JpZ2h0OjA7aGVpZ2h0OjI4MHB4O3BvaW50ZXItZXZlbnRzOm5vbmU7ei1pbmRleDowO2JhY2tncm91bmQ6cmFkaWFsLWdyYWRpZW50KDcwJSAxMDAlIGF0IDUwJSAwJSxyZ2JhKDI1MiwxMTMsNTUsLjIyKSxyZ2JhKDAsMCwwLDApIDcwJSl9CgogIGhlYWRlcntwb3NpdGlvbjpyZWxhdGl2ZTt6LWluZGV4OjU7cGFkZGluZzo1NnB4IDIycHggOHB4fQogIC5jcmVzdHJvd3tkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4fQogIC5jcmVzdHt3aWR0aDozMHB4O2hlaWdodDozMHB4O2ZsZXg6bm9uZX0KICAuaG1ldGF7ZmxleDoxO21pbi13aWR0aDowfQogIC5ob3VzZXtmb250LWZhbWlseTp2YXIoLS1zZXJpZik7Zm9udC1zaXplOjE1cHg7Y29sb3I6I2ZiZWVkNjtsaW5lLWhlaWdodDoxLjE7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4fQogIC5yZWFsbXtmb250LXNpemU6MTAuNXB4O2NvbG9yOnZhcigtLWRpbTIpO2xldHRlci1zcGFjaW5nOi4wOGVtO3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZTttYXJnaW4tdG9wOjNweH0KICAubGl2ZXtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NXB4O2ZvbnQtc2l6ZTo4LjVweDtsZXR0ZXItc3BhY2luZzouMTJlbTt0ZXh0LXRyYW5zZm9ybTp1cHBlcmNhc2U7Y29sb3I6I2ZmN2EzYzsKICAgIGJvcmRlcjoxcHggc29saWQgcmdiYSgyNTIsNzYsMiwuNSk7Ym9yZGVyLXJhZGl1czoyMHB4O3BhZGRpbmc6MnB4IDdweH0KICAubGl2ZSAuZG90e3dpZHRoOjVweDtoZWlnaHQ6NXB4O2JvcmRlci1yYWRpdXM6NTAlO2JhY2tncm91bmQ6dmFyKC0tc3RyYXZhKTtib3gtc2hhZG93OjAgMCA2cHggdmFyKC0tc3RyYXZhKTthbmltYXRpb246YmxpbmsgMnMgZWFzZS1pbi1vdXQgaW5maW5pdGV9CiAgQGtleWZyYW1lcyBibGlua3swJSwxMDAle29wYWNpdHk6MX01MCV7b3BhY2l0eTouMzV9fQoKICAuZ3JlZXR7cG9zaXRpb246cmVsYXRpdmU7ei1pbmRleDo1O3BhZGRpbmc6MTJweCAyMnB4IDZweH0KICAuaGl7Zm9udC1mYW1pbHk6dmFyKC0tc2VyaWYpO2ZvbnQtc2l6ZToyNHB4O2xpbmUtaGVpZ2h0OjEuMTU7Y29sb3I6I2ZiZWVkNn0KICAuaGkgYntjb2xvcjp2YXIoLS1lbWJlcjIpfQogIC5zdWJoaXtmb250LXNpemU6MTIuNXB4O2NvbG9yOnZhcigtLWRpbSk7bWFyZ2luLXRvcDo1cHg7bGluZS1oZWlnaHQ6MS40NX0KCiAgLndyYXB7cG9zaXRpb246cmVsYXRpdmU7ei1pbmRleDo1O3BhZGRpbmc6MCAxOHB4fQogIC5zZWN0bGJse2ZvbnQtc2l6ZToxMC41cHg7bGV0dGVyLXNwYWNpbmc6LjE4ZW07dGV4dC10cmFuc2Zvcm06dXBwZXJjYXNlO2NvbG9yOnZhcigtLWVtYmVyKTtmb250LXdlaWdodDo3MDA7bWFyZ2luOjIwcHggNnB4IDhweDtkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW59CiAgLnNlY3RsYmwgLmx2e2NvbG9yOiNmZjdhM2M7bGV0dGVyLXNwYWNpbmc6LjFlbX0KICAuY2FyZHtiYWNrZ3JvdW5kOnZhcigtLWNhcmQpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7Ym9yZGVyLXJhZGl1czoyMHB4O3BhZGRpbmc6MThweH0KCiAgLnZvd3tkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoyMHB4fQogIC5yaW5ne3Bvc2l0aW9uOnJlbGF0aXZlO3dpZHRoOjEwNHB4O2hlaWdodDoxMDRweDtmbGV4Om5vbmV9CiAgLnJpbmcgLnRyYWNre3Bvc2l0aW9uOmFic29sdXRlO2luc2V0OjA7Ym9yZGVyLXJhZGl1czo1MCU7YmFja2dyb3VuZDpjb25pYy1ncmFkaWVudCh2YXIoLS1lbWJlcikgdmFyKC0tZGVnLDE4MGRlZykscmdiYSgyNTUsMjU1LDI1NSwuMDgpIDApO3RyYW5zaXRpb246LS1kZWcgMXMgY3ViaWMtYmV6aWVyKC4yLC44LC4yLDEpfQogIC5yaW5nIC5ob2xle3Bvc2l0aW9uOmFic29sdXRlO2luc2V0OjlweDtib3JkZXItcmFkaXVzOjUwJTtiYWNrZ3JvdW5kOiMxMDBjMTE7ZGlzcGxheTpncmlkO3BsYWNlLWl0ZW1zOmNlbnRlcjt0ZXh0LWFsaWduOmNlbnRlcn0KICAucmluZyAucnZ7Zm9udC1mYW1pbHk6dmFyKC0tc2VyaWYpO2ZvbnQtc2l6ZToyNXB4O2NvbG9yOiNmZmYxZDg7bGluZS1oZWlnaHQ6MX0KICAucmluZyAucmx7Zm9udC1zaXplOjlweDtsZXR0ZXItc3BhY2luZzouMTRlbTt0ZXh0LXRyYW5zZm9ybTp1cHBlcmNhc2U7Y29sb3I6dmFyKC0tZGltKTttYXJnaW4tdG9wOjNweH0KICAudm93aW5mbyBoM3tmb250LWZhbWlseTp2YXIoLS1zZXJpZik7Zm9udC1zaXplOjE3cHg7Zm9udC13ZWlnaHQ6NDAwO2NvbG9yOiNmYmVlZDZ9CiAgLnZvd2luZm8gLm1pe2ZvbnQtc2l6ZToxMi41cHg7Y29sb3I6dmFyKC0tZGltKTttYXJnaW4tdG9wOjRweH0udm93aW5mbyAubWkgYntjb2xvcjp2YXIoLS1lbWJlcjIpfQoKICAuY3Vyc3tkaXNwbGF5OmdyaWQ7Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOjFmciAxZnIgMWZyO2dhcDoxMHB4O21hcmdpbi10b3A6MTRweH0KICAuY3Vye2JhY2tncm91bmQ6dmFyKC0tY2FyZDIpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZTIpO2JvcmRlci1yYWRpdXM6MTVweDtwYWRkaW5nOjEycHggOHB4O3RleHQtYWxpZ246Y2VudGVyfQogIC5jdXIgLmNpe2ZvbnQtc2l6ZToxNXB4fS5jdXIgLmN2e2ZvbnQtZmFtaWx5OnZhcigtLXNlcmlmKTtmb250LXNpemU6MTlweDttYXJnaW4tdG9wOjVweDtjb2xvcjojZmZmMWQ4O2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc30KICAuY3VyIC5jbHtmb250LXNpemU6OC41cHg7bGV0dGVyLXNwYWNpbmc6LjFlbTt0ZXh0LXRyYW5zZm9ybTp1cHBlcmNhc2U7Y29sb3I6dmFyKC0tZGltMik7bWFyZ2luLXRvcDozcHh9CiAgLmNpLmV7Y29sb3I6dmFyKC0tZW1iZXIyKX0uY2kuc3tjb2xvcjp2YXIoLS1lbWJlcjMpfS5jaS53e2NvbG9yOnZhcigtLWJsdWUyKX0KCiAgLmZlZWR7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbn0KICAuYWN0e2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEycHg7cGFkZGluZzoxM3B4IDA7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tbGluZTIpfQogIC5hY3Q6Zmlyc3QtY2hpbGR7Ym9yZGVyLXRvcDpub25lfQogIC5hY3QgLmFpe3dpZHRoOjM2cHg7aGVpZ2h0OjM2cHg7Ym9yZGVyLXJhZGl1czoxMHB4O2ZsZXg6bm9uZTtkaXNwbGF5OmdyaWQ7cGxhY2UtaXRlbXM6Y2VudGVyO2ZvbnQtc2l6ZToxNXB4O2JhY2tncm91bmQ6dmFyKC0tY2FyZDIpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZTIpfQogIC5hY3QgLmFie2ZsZXg6MTttaW4td2lkdGg6MH0KICAuYWN0IC5hbntmb250LXNpemU6MTNweDtjb2xvcjojZmJlZWQ2O3doaXRlLXNwYWNlOm5vd3JhcDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpc30KICAuYWN0IC5hbiAudmlhe2ZvbnQtc2l6ZTo4LjVweDtjb2xvcjojZmY3YTNjO2xldHRlci1zcGFjaW5nOi4wNmVtO3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZTttYXJnaW4tbGVmdDo2cHh9CiAgLmFjdCAuYWR7Zm9udC1zaXplOjEwLjVweDtjb2xvcjp2YXIoLS1kaW0pO21hcmdpbi10b3A6MnB4fQogIC5hY3QgLmF3e2ZvbnQtc2l6ZTo5LjVweDtjb2xvcjp2YXIoLS1kaW0yKTttYXJnaW4tdG9wOjNweH0KICAuYWN0IC5hZXt0ZXh0LWFsaWduOnJpZ2h0O2ZsZXg6bm9uZX0KICAuYWN0IC5hZSAuZW17Zm9udC1mYW1pbHk6dmFyKC0tc2VyaWYpO2ZvbnQtc2l6ZToxNXB4O2NvbG9yOnZhcigtLWVtYmVyMil9CiAgLmFjdCAuYWUgLnNwe2ZvbnQtc2l6ZTo5LjVweDtjb2xvcjp2YXIoLS1kaW0yKX0KCiAgLmNocm9ue2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjE0cHg7Y3Vyc29yOnBvaW50ZXJ9CiAgLmNocm9uIC5jZ3tmb250LXNpemU6MjJweDtjb2xvcjp2YXIoLS1lbWJlcik7dGV4dC1zaGFkb3c6MCAwIDE2cHggcmdiYSgyNTUsMTUwLDYwLC41KX0KICAuY2hyb24gLmN0e2ZsZXg6MX0uY2hyb24gLmN0IGJ7Zm9udC1mYW1pbHk6dmFyKC0tc2VyaWYpO2ZvbnQtc2l6ZToxNXB4O2NvbG9yOiNmYmVlZDY7Zm9udC13ZWlnaHQ6NDAwfQogIC5jaHJvbiAuY3Qgc3BhbntkaXNwbGF5OmJsb2NrO2ZvbnQtc2l6ZToxMS41cHg7Y29sb3I6dmFyKC0tZGltKTttYXJnaW4tdG9wOjJweH0uY2hyb24gLmNoZXZ7Y29sb3I6dmFyKC0tZGltMik7Zm9udC1zaXplOjIwcHh9CgogIC5mb290e3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxMC41cHg7Y29sb3I6dmFyKC0tZGltMik7cGFkZGluZzoyMHB4IDI0cHggOHB4O2xpbmUtaGVpZ2h0OjEuNn0KICAuZm9vdCAucmZ7Y29sb3I6dmFyKC0tZW1iZXIyKTtjdXJzb3I6cG9pbnRlcjt0ZXh0LWRlY29yYXRpb246dW5kZXJsaW5lfQoKICAvKiBjb25uZWN0IHNjcmVlbiAqLwogIC5jb25uZWN0e3Bvc2l0aW9uOmFic29sdXRlO2luc2V0OjA7ei1pbmRleDoyMDtkaXNwbGF5Om5vbmU7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3RleHQtYWxpZ246Y2VudGVyO3BhZGRpbmc6NDBweCAzMnB4O2JhY2tncm91bmQ6dmFyKC0tYmcpfQogIC5jb25uZWN0LnNob3d7ZGlzcGxheTpmbGV4fQogIC5jb25uZWN0IGgye2ZvbnQtZmFtaWx5OnZhcigtLXNlcmlmKTtmb250LXNpemU6MjRweDtjb2xvcjojZmJlZWQ2O21hcmdpbi10b3A6MjBweH0KICAuY29ubmVjdCBwe2ZvbnQtc2l6ZToxM3B4O2NvbG9yOnZhcigtLWRpbSk7bGluZS1oZWlnaHQ6MS42O21hcmdpbi10b3A6MTJweDttYXgtd2lkdGg6MjgwcHh9CiAgLmNidG57bWFyZ2luLXRvcDoyNnB4O2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo5cHg7YmFja2dyb3VuZDp2YXIoLS1zdHJhdmEpO2NvbG9yOiNmZmY7Zm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZToxNHB4OwogICAgYm9yZGVyOm5vbmU7Ym9yZGVyLXJhZGl1czoxNHB4O3BhZGRpbmc6MTRweCAyNHB4O2N1cnNvcjpwb2ludGVyO3RleHQtZGVjb3JhdGlvbjpub25lO2JveC1zaGFkb3c6MCAxMnB4IDI2cHggcmdiYSgyNTIsNzYsMiwuMzUpfQoKICAvKiBwaXAgKi8KICAucGlwe3Bvc2l0aW9uOmFic29sdXRlO3JpZ2h0OjE4cHg7Ym90dG9tOjIycHg7d2lkdGg6NDBweDtoZWlnaHQ6NTJweDt6LWluZGV4OjE1fQogIC5waXBmbHt3aWR0aDoxMDAlO2hlaWdodDoxMDAlO3RyYW5zZm9ybS1vcmlnaW46NTAlIDEwMCU7YW5pbWF0aW9uOmZsaWNrIDIuNnMgZWFzZS1pbi1vdXQgaW5maW5pdGV9CiAgQGtleWZyYW1lcyBmbGlja3swJSwxMDAle3RyYW5zZm9ybTpzY2FsZVkoMSl9MzAle3RyYW5zZm9ybTpzY2FsZVkoMS4wNSkgc2NhbGVYKC45Nyl9NjAle3RyYW5zZm9ybTpzY2FsZVkoLjk3KSBzY2FsZVgoMS4wMyl9fQoKICAvKiBjaHJvbmljbGUgc2hlZXQgKi8KICAuc2hlZXR7cG9zaXRpb246YWJzb2x1dGU7aW5zZXQ6MDt6LWluZGV4OjM1O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpmbGV4LWVuZDtiYWNrZ3JvdW5kOnJnYmEoNiw1LDksLjU1KTtvcGFjaXR5OjA7dmlzaWJpbGl0eTpoaWRkZW47dHJhbnNpdGlvbjpvcGFjaXR5IC40c30KICAuc2hlZXQuc2hvd3tvcGFjaXR5OjE7dmlzaWJpbGl0eTp2aXNpYmxlfQogIC5zaGVldGJvZHl7d2lkdGg6MTAwJTttYXgtaGVpZ2h0Ojg2JTtvdmVyZmxvdy15OmF1dG87YmFja2dyb3VuZDpsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCMxOTEzMjAsIzBmMGIxMyk7Ym9yZGVyLXRvcC1sZWZ0LXJhZGl1czoyNnB4O2JvcmRlci10b3AtcmlnaHQtcmFkaXVzOjI2cHg7CiAgICBib3JkZXItdG9wOjFweCBzb2xpZCByZ2JhKDI1NSwxOTAsMTEwLC4yKTtwYWRkaW5nOjEwcHggMjBweCAzMHB4O3RyYW5zZm9ybTp0cmFuc2xhdGVZKDEwMCUpO3RyYW5zaXRpb246dHJhbnNmb3JtIC40NXMgY3ViaWMtYmV6aWVyKC4yLC44LC4yLDEpO3Njcm9sbGJhci13aWR0aDpub25lfQogIC5zaGVldGJvZHk6Oi13ZWJraXQtc2Nyb2xsYmFye2Rpc3BsYXk6bm9uZX0KICAuc2hlZXQuc2hvdyAuc2hlZXRib2R5e3RyYW5zZm9ybTpub25lfQogIC5ncmFie3dpZHRoOjQwcHg7aGVpZ2h0OjRweDtib3JkZXItcmFkaXVzOjRweDtiYWNrZ3JvdW5kOnJnYmEoMjU1LDI1NSwyNTUsLjE4KTttYXJnaW46OHB4IGF1dG8gMTRweH0KICAuc2hlYWR7dGV4dC1hbGlnbjpjZW50ZXI7bWFyZ2luLWJvdHRvbToxNnB4fS5zaGVhZCAuc2d7Zm9udC1zaXplOjIwcHg7Y29sb3I6dmFyKC0tZW1iZXIpfQogIC5zaGVhZCAuc3R7Zm9udC1mYW1pbHk6dmFyKC0tc2VyaWYpO2ZvbnQtc2l6ZToyMXB4O2xldHRlci1zcGFjaW5nOi4yOGVtO3RleHQtaW5kZW50Oi4yOGVtO2NvbG9yOiNmNGVjZDg7bWFyZ2luLXRvcDoycHh9CiAgLnNoZWFkIC5zc3tmb250LWZhbWlseTp2YXIoLS1zZXJpZik7Zm9udC1zdHlsZTppdGFsaWM7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tZGltKTttYXJnaW4tdG9wOjVweH0KICAuc2dyaWR7ZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczoxZnIgMWZyIDFmcjtnYXA6MTBweH0KICAuc3RpbGV7YmFja2dyb3VuZDp2YXIoLS1jYXJkMik7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lMik7Ym9yZGVyLXJhZGl1czoxM3B4O3BhZGRpbmc6MTNweCA2cHg7dGV4dC1hbGlnbjpjZW50ZXJ9CiAgLnN0aWxlIGJ7ZGlzcGxheTpibG9jaztmb250LWZhbWlseTp2YXIoLS1zZXJpZik7Zm9udC1zaXplOjE5cHg7Y29sb3I6I2ZmY2E3ZDtsaW5lLWhlaWdodDoxO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc30KICAuc3RpbGUgc3BhbntkaXNwbGF5OmJsb2NrO2ZvbnQtc2l6ZTo4cHg7bGV0dGVyLXNwYWNpbmc6LjA4ZW07dGV4dC10cmFuc2Zvcm06dXBwZXJjYXNlO2NvbG9yOnZhcigtLWRpbTIpO21hcmdpbi10b3A6NXB4fQogIC5iYXJze2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpmbGV4LWVuZDtnYXA6NnB4O2hlaWdodDo4MHB4O21hcmdpbi10b3A6MThweH0KICAuYmFye2ZsZXg6MTtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NXB4O2hlaWdodDoxMDAlO2p1c3RpZnktY29udGVudDpmbGV4LWVuZH0KICAuYmFyPml7ZGlzcGxheTpibG9jazt3aWR0aDoxMDAlO21heC13aWR0aDoyNnB4O2JvcmRlci1yYWRpdXM6NHB4IDRweCAwIDA7YmFja2dyb3VuZDpsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCNmMDk3M2EsIzdhNGExZSk7bWluLWhlaWdodDozcHh9CiAgLmJhcj5zcGFue2ZvbnQtc2l6ZTo4LjVweDtjb2xvcjp2YXIoLS1kaW0yKX0KICAuc2ZlYXRze2xpc3Qtc3R5bGU6bm9uZTttYXJnaW4tdG9wOjE4cHh9CiAgLnNmZWF0cyBsaXtwb3NpdGlvbjpyZWxhdGl2ZTtwYWRkaW5nOjlweCAwIDlweCAxOHB4O2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWxpbmUyKTtmb250LXNpemU6MTNweDtjb2xvcjp2YXIoLS1pbmspfQogIC5zZmVhdHMgbGk6Zmlyc3QtY2hpbGR7Ym9yZGVyLXRvcDpub25lfQogIC5zZmVhdHMgbGk6OmJlZm9yZXtjb250ZW50Oifil4YnO3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDt0b3A6MTFweDtjb2xvcjpyZ2JhKDI1NSwxODAsODQsLjYpO2ZvbnQtc2l6ZTo4cHh9CiAgLnNmZWF0cyBsaSBie2ZvbnQtd2VpZ2h0OjQwMDtjb2xvcjojZmZlMGIwfS5zZmVhdHMgbGkgc3BhbntkaXNwbGF5OmJsb2NrO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRpbSk7bWFyZ2luLXRvcDoxcHh9CgogIEBtZWRpYSAobWF4LXdpZHRoOjQ4MHB4KXtib2R5e3BhZGRpbmc6MH0uZGV2aWNle3dpZHRoOjEwMHZ3O2hlaWdodDoxMDB2aDtib3JkZXItcmFkaXVzOjA7cGFkZGluZzowO2JveC1zaGFkb3c6bm9uZX0uZGV2aWNlOjphZnRlcntpbnNldDowO2JvcmRlci1yYWRpdXM6MH0uc2NyZWVue2luc2V0OjA7Ym9yZGVyLXJhZGl1czowfS5pc2xhbmR7ZGlzcGxheTpub25lfX0KPC9zdHlsZT4KPC9oZWFkPgo8Ym9keT4KPGRpdiBjbGFzcz0iZGV2aWNlIj48ZGl2IGNsYXNzPSJzY3JlZW4iPgogIDxkaXYgY2xhc3M9InNjcm9sbCIgaWQ9InNjcm9sbCI+CiAgICA8ZGl2IGNsYXNzPSJnbG93Ij48L2Rpdj4KICAgIDxkaXYgaWQ9ImFwcCI+PC9kaXY+CiAgPC9kaXY+CgogIDwhLS0gY29ubmVjdCBzdGF0ZSAtLT4KICA8ZGl2IGNsYXNzPSJjb25uZWN0IiBpZD0iY29ubmVjdCI+CiAgICA8c3ZnIHdpZHRoPSI2MCIgaGVpZ2h0PSI3OCIgdmlld0JveD0iMCAwIDY2IDg2Ij48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImNmIiBjeD0iNTAlIiBjeT0iNjYlIiByPSI1NiUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZmM2QwIi8+PHN0b3Agb2Zmc2V0PSI0MiUiIHN0b3AtY29sb3I9IiNmZmI0NTQiLz48c3RvcCBvZmZzZXQ9Ijc4JSIgc3RvcC1jb2xvcj0iI2YwNzMxZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2MwNDEwZSIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPgogICAgICA8cGF0aCBkPSJNMzMgODQgQzkgNzIgMTggNDIgMzMgNCBDNDggNDIgNTcgNzIgMzMgODQgWiIgZmlsbD0idXJsKCNjZikiLz48L3N2Zz4KICAgIDxoMj5Zb3VyIEhlYXJ0aCBpcyB3YWl0aW5nPC9oMj4KICAgIDxwPkNvbm5lY3QgU3RyYXZhIGFuZCBldmVyeSB3YWxrLCBydW4sIHJpZGUgYW5kIHNlc3Npb24gYmVjb21lcyBFbWJlciDigJQgc2NvcmVkIGFnYWluc3QgeW91ciBvd24gYmFzZWxpbmUsIHdyaXR0ZW4gaW50byBBdXJldGguPC9wPgogICAgPGEgY2xhc3M9ImNidG4iIGhyZWY9Ii9hdXRoL3N0cmF2YSI+4peOIENvbm5lY3Qgd2l0aCBTdHJhdmE8L2E+CiAgPC9kaXY+CgogIDwhLS0gY2hyb25pY2xlIHNoZWV0IC0tPgogIDxkaXYgY2xhc3M9InNoZWV0IiBpZD0ic2hlZXQiPjxkaXYgY2xhc3M9InNoZWV0Ym9keSI+CiAgICA8ZGl2IGNsYXNzPSJncmFiIj48L2Rpdj4KICAgIDxkaXYgY2xhc3M9InNoZWFkIj48ZGl2IGNsYXNzPSJzZyI+4peIPC9kaXY+PGRpdiBjbGFzcz0ic3QiPlRIRSBDSFJPTklDTEU8L2Rpdj48ZGl2IGNsYXNzPSJzcyIgaWQ9InNoU3ViIj48L2Rpdj48L2Rpdj4KICAgIDxkaXYgY2xhc3M9InNncmlkIiBpZD0ic2hTdGF0cyI+PC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJiYXJzIiBpZD0ic2hCYXJzIj48L2Rpdj4KICAgIDx1bCBjbGFzcz0ic2ZlYXRzIiBpZD0ic2hGZWF0cyI+PC91bD4KICA8L2Rpdj48L2Rpdj4KICA8ZGl2IGNsYXNzPSJpc2xhbmQiPjwvZGl2Pgo8L2Rpdj48L2Rpdj4KCjxzY3JpcHQ+Cid1c2Ugc3RyaWN0JzsKY29uc3QgJD1pZD0+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpOwpjb25zdCBDVVJfSUNPTj17ZW1iZXI6J+KXhicsc3BhcmtzOifinKYnLHN0aWxsOifinYknfTsKbGV0IEE9bnVsbDsKCmFzeW5jIGZ1bmN0aW9uIGJvb3QoKXsKICBjb25zdCBzdD1hd2FpdCBmZXRjaCgnL2FwaS9zdGF0dXMnKS50aGVuKHI9PnIuanNvbigpKS5jYXRjaCgoKT0+KHttb2RlOidsaXZlJyxjb25uZWN0ZWQ6ZmFsc2V9KSk7CiAgaWYoc3QubW9kZT09PSdsaXZlJyAmJiAhc3QuY29ubmVjdGVkKXsgJCgnY29ubmVjdCcpLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTsgcmV0dXJuOyB9CiAgdHJ5eyBBPWF3YWl0IGZldGNoKCcvYXBpL2hlYXJ0aCcpLnRoZW4ocj0+eyBpZihyLnN0YXR1cz09PTQwMSl7dGhyb3cgJ2F1dGgnO30gcmV0dXJuIHIuanNvbigpOyB9KTsgfQogIGNhdGNoKGUpeyAkKCdjb25uZWN0JykuY2xhc3NMaXN0LmFkZCgnc2hvdycpOyByZXR1cm47IH0KICByZW5kZXIoKTsKfQoKZnVuY3Rpb24gZm10KG4peyByZXR1cm4gKHR5cGVvZiBuPT09J251bWJlcic/TWF0aC5yb3VuZChuKTpuKS50b0xvY2FsZVN0cmluZz9NYXRoLnJvdW5kKG4pLnRvTG9jYWxlU3RyaW5nKCk6bjsgfQoKZnVuY3Rpb24gcmVuZGVyKCl7CiAgY29uc3QgaWQ9QS5pZGVudGl0eSwgdz1BLndlZWssIGM9QS5jdXJyZW5jaWVzLCBsdD1BLmxpZmV0aW1lOwogIGNvbnN0IHN1cnBhc3MgPSB3LnN1cnBhc3NlZDsKICAkKCdhcHAnKS5pbm5lckhUTUw9YAogICAgPGhlYWRlcj48ZGl2IGNsYXNzPSJjcmVzdHJvdyI+CiAgICAgIDxzdmcgY2xhc3M9ImNyZXN0IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDYiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2E5ODUzZiIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgICAgICAgPHBhdGggZD0iTTUwIDc2IEMzMyA2NiA0MCA0OCA1MCAyNiBDNjAgNDggNjcgNjYgNTAgNzYgWiIgZmlsbD0iI2ZjNzEzNyIvPjxwYXRoIGQ9Ik01MCA2OCBDNDIgNjIgNDUgNTIgNTAgNDAgQzU1IDUyIDU4IDYyIDUwIDY4IFoiIGZpbGw9IiNmZmQ2OTkiLz48L3N2Zz4KICAgICAgPGRpdiBjbGFzcz0iaG1ldGEiPjxkaXYgY2xhc3M9ImhvdXNlIj5Ib3VzZSAke2lkLmhvdXNlfTxzcGFuIGNsYXNzPSJsaXZlIj48c3BhbiBjbGFzcz0iZG90Ij48L3NwYW4+JHtBLm1vZGU9PT0nbGl2ZSc/J0xpdmUgwrcgU3RyYXZhJzonTGl2ZSBkZW1vJ308L3NwYW4+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icmVhbG0iPiR7aWQubmFtZX0gJHtpZC5vZn0gwrcgJHtpZC5raW5kcmVkfSAke2lkLmNsc30gwrcgJHtpZC5kYXl9PC9kaXY+PC9kaXY+CiAgICA8L2Rpdj48L2hlYWRlcj4KCiAgICA8ZGl2IGNsYXNzPSJncmVldCI+CiAgICAgIDxkaXYgY2xhc3M9ImhpIj5Hb29kIGRheSw8YnI+PGI+JHtpZC5uYW1lfTwvYj4uPC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InN1YmhpIiBpZD0ic3ViaGkiPjwvZGl2PgogICAgPC9kaXY+CgogICAgPGRpdiBjbGFzcz0id3JhcCI+CiAgICAgIDxkaXYgY2xhc3M9InNlY3RsYmwiPlRoaXMgd2VlayA8c3BhbiBjbGFzcz0ibHYiPuKXjyBmcm9tIHlvdXIgU3RyYXZhPC9zcGFuPjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJjYXJkIj4KICAgICAgICA8ZGl2IGNsYXNzPSJ2b3ciPgogICAgICAgICAgPGRpdiBjbGFzcz0icmluZyI+PGRpdiBjbGFzcz0idHJhY2siIGlkPSJ2b3dUcmFjayI+PC9kaXY+PGRpdiBjbGFzcz0iaG9sZSI+PGRpdj48ZGl2IGNsYXNzPSJydiI+JHt3LnZvd0RvbmV9LyR7dy52b3dUYXJnZXR9PC9kaXY+PGRpdiBjbGFzcz0icmwiPmRheXM8L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9InZvd2luZm8iPjxoMz5Nb3ZlICR7dy52b3dUYXJnZXR9IGRheXM8L2gzPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJtaSI+PGI+JHt3Lm1pfTwvYj4gbWkgbG9nZ2VkIHRoaXMgd2VlazwvZGl2PgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJtaSIgc3R5bGU9Im1hcmdpbi10b3A6MnB4O2NvbG9yOnZhcigtLWRpbTIpIj4ke3cubW92ZW1lbnREYXlzfSBkYXkke3cubW92ZW1lbnREYXlzIT09MT8ncyc6Jyd9IG1vdmVkJHtzdXJwYXNzPycg4oCUIHZvdyBzdXJwYXNzZWQnOicnfS48L2Rpdj48L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJjdXJzIj4KICAgICAgICAgICR7WydlbWJlcicsJ3NwYXJrcycsJ3N0aWxsJ10ubWFwKGs9PmA8ZGl2IGNsYXNzPSJjdXIiPjxkaXYgY2xhc3M9ImNpICR7a1swXX0iPiR7Q1VSX0lDT05ba119PC9kaXY+PGRpdiBjbGFzcz0iY3YiPiR7Zm10KGNba10pfTwvZGl2PjxkaXYgY2xhc3M9ImNsIj4ke2s9PT0nc3RpbGwnPydTdGlsbHdhdGVyJzprfTwvZGl2PjwvZGl2PmApLmpvaW4oJycpfQogICAgICAgIDwvZGl2PgogICAgICA8L2Rpdj4KCiAgICAgIDxkaXYgY2xhc3M9InNlY3RsYmwiPlJlY2VudCBhY3Rpdml0eSA8c3BhbiBjbGFzcz0ibHYiPuKXjyBsaXZlIEVtYmVyPC9zcGFuPjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJjYXJkIGZlZWQiPgogICAgICAgICR7QS5mZWVkLm1hcChmPT57IGNvbnN0IGU9Zi5lYXJuOyBjb25zdCBpYz17c3RyZW5ndGg6J/Cfj4snLFsndmlydHVhbCByaWRlJ106J/CfmrQnLHN3aW06J/CfjIonfVtmLmtpbmRdfHwn8J+Rnyc7CiAgICAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9ImFjdCI+PGRpdiBjbGFzcz0iYWkiPiR7aWN9PC9kaXY+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImFiIj48ZGl2IGNsYXNzPSJhbiI+JHtmLm5hbWV9PHNwYW4gY2xhc3M9InZpYSI+U3RyYXZhPC9zcGFuPjwvZGl2PgogICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImFkIj4keytmLmRpc3RNaT4wP2YuZGlzdE1pKycgbWkgwrcgJzonJ30ke2YudGltZVN0cn0gwrcgJHtmLmtpbmR9PC9kaXY+CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iYXciPmVmZm9ydCAke2UucmVsRWZmb3J0fSDDlyBzdHJlYWsgJHtlLmNvbnNpc3RlbmN5fSDDlyAke2UuaW1wcm92ZW1lbnQ9PT0nMS4xNSc/J1BSICc6Jyd9JHtlLmltcHJvdmVtZW50fSA9ICR7ZS5lbWJlcn08L2Rpdj48L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iYWUiPjxkaXYgY2xhc3M9ImVtIj4rJHtlLmVtYmVyfTwvZGl2PjxkaXYgY2xhc3M9InNwIj4rJHtlLnNwYXJrc30g4pymJHtlLnN0aWxsPycgwrcgKycrZS5zdGlsbCsnIOKdiSc6Jyd9PC9kaXY+PC9kaXY+PC9kaXY+YDsKICAgICAgICB9KS5qb2luKCcnKX0KICAgICAgPC9kaXY+CgogICAgICA8ZGl2IGNsYXNzPSJzZWN0bGJsIj5Zb3VyIENocm9uaWNsZTwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJjYXJkIj48ZGl2IGNsYXNzPSJjaHJvbiIgaWQ9ImNocm9uQ2FyZCI+CiAgICAgICAgPGRpdiBjbGFzcz0iY2ciPuKXiDwvZGl2PjxkaXYgY2xhc3M9ImN0Ij48Yj4ke2x0LnJ1bk1pfSBydW5uaW5nIG1pbGVzLCB3cml0dGVuIGludG8gQXVyZXRoPC9iPjxzcGFuPiR7bHQucnVuc30gcnVucyDCtyAke2x0LmhvdXJzfSBob3VycyDCtyBhICR7bHQuc3RyZWFrfS1kYXkgc3RyZWFrIG5vdzwvc3Bhbj48L2Rpdj48ZGl2IGNsYXNzPSJjaGV2Ij7igLo8L2Rpdj48L2Rpdj48L2Rpdj4KCiAgICAgIDxkaXYgY2xhc3M9ImZvb3QiPlN5bmNlZCBmcm9tIFN0cmF2YSDCtyAke1N0cmluZyhBLnN5bmNlZEF0KS5zbGljZSgwLDEwKX0gwrcgPHNwYW4gY2xhc3M9InJmIiBpZD0icmVmcmVzaCI+cmVmcmVzaDwvc3Bhbj48YnI+RXZlcnkgZmlndXJlIGNvbXB1dGVkIGxpdmUgYnkgdGhlIEVtYmVyIEVuZ2luZSDigJQgbm90aGluZyBiYWtlZC48L2Rpdj4KICAgIDwvZGl2PgoKICAgIDxkaXYgY2xhc3M9InBpcCI+PHN2ZyBjbGFzcz0icGlwZmwiIHZpZXdCb3g9IjAgMCA0MCA1MiI+PGRlZnM+PHJhZGlhbEdyYWRpZW50IGlkPSJwYiIgY3g9IjUwJSIgY3k9IjY2JSIgcj0iNTYlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZjNkMCIvPjxzdG9wIG9mZnNldD0iNDAlIiBzdG9wLWNvbG9yPSIjZmZiNDU0Ii8+PHN0b3Agb2Zmc2V0PSI3NiUiIHN0b3AtY29sb3I9IiNmMDczMWYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjMDQxMGUiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz4KICAgICAgPHBhdGggZD0iTTIwIDUwIEM2IDQzIDExIDI2IDIwIDQgQzI5IDI2IDM0IDQzIDIwIDUwIFoiIGZpbGw9InVybCgjcGIpIi8+PGNpcmNsZSBjeD0iMTYiIGN5PSIzNCIgcj0iMS42IiBmaWxsPSIjM2ExZTA4Ii8+PGNpcmNsZSBjeD0iMjQiIGN5PSIzNCIgcj0iMS42IiBmaWxsPSIjM2ExZTA4Ii8+PC9zdmc+PC9kaXY+YDsKCiAgLy8gdm93IHJpbmcKICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCk9PnsgY29uc3QgZnJhYz1NYXRoLm1pbigxLHcudm93RG9uZS93LnZvd1RhcmdldCk7ICQoJ3Zvd1RyYWNrJykuc3R5bGUuc2V0UHJvcGVydHkoJy0tZGVnJywoZnJhYyozNjApKydkZWcnKTsgfSk7CiAgLy8gc3ViaGkg4oCUIFBpcCByZWFkcyB0aGUgcmVhbCBkYXRhCiAgY29uc3QgdG9wPUEuZmVlZFswXTsKICAkKCdzdWJoaScpLmlubmVySFRNTCA9IHN1cnBhc3MKICAgID8gYFlvdeKAmXZlIG1vdmVkIDxiPiR7dy5tb3ZlbWVudERheXN9IGRheXM8L2I+IHRoaXMgd2VlayDigJQgdm93IHN1cnBhc3NlZC4gWW91ciBsYXN0IGVmZm9ydDogJHt0b3A/dG9wLm5hbWUudG9Mb3dlckNhc2UoKTon4oCUJ30sIDxiPiske3RvcD90b3AuZWFybi5lbWJlcjowfSBFbWJlcjwvYj4uYAogICAgOiBgJHt3LnZvd1RhcmdldC13LnZvd0RvbmV9IGRheSR7KHcudm93VGFyZ2V0LXcudm93RG9uZSkhPT0xPydzJzonJ30gbGVmdCBvbiB5b3VyIHZvdy4gS2VlcCB0aGUgY2hhaW4uYDsKICAkKCdyZWZyZXNoJykub25jbGljaz0oKT0+eyBBPW51bGw7IGJvb3QoKTsgfTsKICAkKCdjaHJvbkNhcmQnKS5vbmNsaWNrPW9wZW5TaGVldDsKfQoKZnVuY3Rpb24gb3BlblNoZWV0KCl7CiAgY29uc3QgbHQ9QS5saWZldGltZTsKICAkKCdzaFN1YicpLnRleHRDb250ZW50PUEuaWRlbnRpdHkubmFtZSsn4oCZcyBsZWdlbmQgwrcgJytsdC5zcGFuOwogIGNvbnN0IHN0YXRzPVtbbHQucnVuTWksJ3J1bm5pbmcgbWlsZXMnXSxbbHQuc3RyZWFrLCdkYXkgc3RyZWFrJ10sW2x0LnJ1bnMsJ3J1bnMgbG9nZ2VkJ10sW2x0LmhvdXJzLCdob3VycyBtb3ZpbmcnXSxbbHQuZWxldkZ0LCdmZWV0IGNsaW1iZWQnXSxbbHQubG9uZ2VzdE1pLCdsb25nZXN0IMK3IG1pJ11dOwogICQoJ3NoU3RhdHMnKS5pbm5lckhUTUw9c3RhdHMubWFwKHM9PmA8ZGl2IGNsYXNzPSJzdGlsZSI+PGI+JHtzWzBdfTwvYj48c3Bhbj4ke3NbMV19PC9zcGFuPjwvZGl2PmApLmpvaW4oJycpOwogIGNvbnN0IG1heD1NYXRoLm1heCguLi5sdC5tb250aGx5Lm1hcChtPT5tLmttKSwxKTsKICAkKCdzaEJhcnMnKS5pbm5lckhUTUw9bHQubW9udGhseS5tYXAobT0+YDxkaXYgY2xhc3M9ImJhciI+PGkgc3R5bGU9ImhlaWdodDoke01hdGgucm91bmQobS5rbS9tYXgqMTAwKX0lIj48L2k+PHNwYW4+JHttLm19PC9zcGFuPjwvZGl2PmApLmpvaW4oJycpOwogICQoJ3NoRmVhdHMnKS5pbm5lckhUTUw9bHQuZmVhdHMubWFwKGY9PmA8bGk+PGI+JHtmLnR9PC9iPjxzcGFuPiR7Zi5kfTwvc3Bhbj48L2xpPmApLmpvaW4oJycpOwogICQoJ3NoZWV0JykuY2xhc3NMaXN0LmFkZCgnc2hvdycpOwp9CiQoJ3NoZWV0JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGU9PnsgaWYoZS50YXJnZXQ9PT0kKCdzaGVldCcpKSAkKCdzaGVldCcpLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTsgfSk7Cgpib290KCk7CndpbmRvdy5IZWFydGhMaXZlPXsgcmVhZHk6KCk9PiEhQXx8ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nvbm5lY3QnKS5jbGFzc0xpc3QuY29udGFpbnMoJ3Nob3cnKSwgZGF0YTooKT0+QSB9Owo8L3NjcmlwdD4KPC9ib2R5Pgo8L2h0bWw+Cg==", 'base64').toString('utf8');

/* ---------- Ember Engine ---------- */
const eng = (function(){
'use strict';
/* ============================================================================
   THE EMBER ENGINE — activity normalization (real implementation)
   Ports the design in Forj blueprint §8 into code that runs on live Strava
   activity summaries. Pure functions, no dependencies.

   Ember(session) = base × consistency × improvement
     base        = relativeEffort × 6           (Strava relative effort = suffer score)
     consistency = 1 → 1.35, from trailing 28-day movement-day density   (§8.2 C)
     improvement = 1.15 if the session set a PR, else 1.0                 (§8.3 I)

   The economy's best wage goes to *becoming*, not *being*: a beginner's steep
   PR-laden week out-earns an elite's easy maintenance at equal relative effort.
   ========================================================================== */

const M_PER_MILE = 1609.344;
const FT_PER_M = 3.28084;

const toMiles = m => (m || 0) / M_PER_MILE;
const dayKey = iso => String(iso).slice(0, 10);           // 'YYYY-MM-DD'
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* Some sessions (Zwift, weight training) carry no Strava relative_effort.
   Fall back to a defensible proxy so all movement still mints — §8.1 modality-agnosticism. */
function relativeEffort(a) {
  if (a.eff && a.eff > 0) return a.eff;
  if (a.cal && a.cal > 0) return Math.max(3, Math.round(a.cal / 14));   // calorie proxy
  const min = (a.mov || 0) / 60;
  return Math.max(2, Math.round(min * 0.5));                            // time proxy
}

/* trailing 28-day movement-day density → consistency multiplier (1.0 … 1.35). */
function consistencyAt(activeDays, iso) {
  const end = new Date(iso + 'T00:00:00Z').getTime();
  const start = end - 27 * 86400000;
  let days = 0;
  for (const d of activeDays) {
    const t = new Date(d + 'T00:00:00Z').getTime();
    if (t >= start && t <= end) days++;
  }
  return 1 + 0.35 * clamp(days / 20, 0, 1);                             // 20+ days in 28 → 1.35
}

function kindOf(a) {
  const n = (a.name || '').toLowerCase();
  const t = a.type;
  if (t === 'WeightTraining' || t === 'Workout') return 'strength';
  if (t === 'VirtualRide' || t === 'Ride') return 'virtual ride';
  if (t === 'Swim') return 'swim';
  if (n.includes('parkrun')) return 'parkrun · a milestone';
  if (n.includes('marathon')) return 'marathon';
  const mi = toMiles(a.dist), eff = a.eff || 0;
  if (n.includes('tt') || n.includes('interval') || n.includes('400') || n.includes('200') ||
      n.includes('800') || n.includes('1k') || n.includes('track') || n.includes('rep')) return 'intervals';
  if (mi >= 15) return 'long run';
  if (eff >= 45) return 'tempo';
  if (eff > 0 && eff < 18) return 'recovery';
  if (eff < 28) return 'easy';
  return 'steady run';
}

/* Ember earn for a single session, given the athlete's active-day set. */
function earn(a, activeDays) {
  const eff = relativeEffort(a);
  const base = eff * 6;
  const consistency = consistencyAt(activeDays, dayKey(a.date));
  const improvement = (a.pr || 0) > 0 ? 1.15 : 1.0;
  const ember = Math.round(base * consistency * improvement);
  const sparks = clamp(Math.round(eff / 16) + 1, 1, 5);
  const still = eff > 0 && eff < 22 ? 1 : 0;                            // low-load session brews Stillwater (§8.6)
  return {
    ember, sparks, still,
    base, consistency: consistency.toFixed(2), improvement: improvement.toFixed(2),
    relEffort: eff,
  };
}

function activeDaySet(acts) {
  const s = new Set();
  for (const a of acts) s.add(dayKey(a.date));
  return s;
}

/* Consecutive-day streak ending at the most recent active day. */
function streak(activeDays) {
  if (!activeDays.size) return 0;
  const days = [...activeDays].sort();
  let cur = days[days.length - 1];
  let n = 1;
  const has = d => activeDays.has(d);
  const prev = d => {
    const t = new Date(d + 'T00:00:00Z').getTime() - 86400000;
    return new Date(t).toISOString().slice(0, 10);
  };
  let d = prev(cur);
  while (has(d)) { n++; d = prev(d); }
  return n;
}

function weekSummary(acts, todayIso, vowTarget = 5) {
  const end = new Date(todayIso + 'T23:59:59Z').getTime();
  const start = end - 6 * 86400000;
  const inWeek = acts.filter(a => {
    const t = new Date(dayKey(a.date) + 'T12:00:00Z').getTime();
    return t >= start - 43200000 && t <= end;
  });
  const days = new Set(inWeek.map(a => dayKey(a.date)));
  const mi = inWeek.reduce((s, a) => s + toMiles(a.dist), 0);
  return {
    mi: +mi.toFixed(1),
    movementDays: days.size,
    vowTarget,
    vowDone: Math.min(days.size, vowTarget),
    surpassed: days.size > vowTarget,
  };
}

function monthly(acts) {
  const m = {};
  for (const a of acts) {
    const key = dayKey(a.date).slice(0, 7);
    m[key] = (m[key] || 0) + (a.dist || 0) / 1000;               // km
  }
  return Object.keys(m).sort().map(k => ({
    m: ['J','F','M','A','M','J','J','A','S','O','N','D'][+k.slice(5, 7) - 1],
    ym: k, km: Math.round(m[k]),
  }));
}

function biggestWeek(acts) {
  const byDay = {};
  for (const a of acts) { if (a.type !== 'Run') continue; byDay[dayKey(a.date)] = (byDay[dayKey(a.date)] || 0) + toMiles(a.dist); }
  const days = Object.keys(byDay).sort();
  let best = 0;
  for (const d0 of days) {
    const t0 = new Date(d0 + 'T00:00:00Z').getTime();
    let sum = 0;
    for (const d of days) {
      const t = new Date(d + 'T00:00:00Z').getTime();
      if (t >= t0 && t < t0 + 7 * 86400000) sum += byDay[d];
    }
    best = Math.max(best, sum);
  }
  return +best.toFixed(1);
}

function feats(acts) {
  const runs = acts.filter(a => a.type === 'Run' && a.dist > 0);
  const out = [];
  const longest = runs.slice().sort((x, y) => y.dist - x.dist)[0];
  if (longest) out.push({ t: longest.name, d: `${toMiles(longest.dist).toFixed(1)} mi · your longest journey` });
  const hardest = runs.slice().sort((x, y) => (y.eff || 0) - (x.eff || 0))[0];
  if (hardest && hardest !== longest) out.push({ t: hardest.name, d: `relative effort ${hardest.eff} · your biggest single effort` });
  const parkrun = runs.find(a => /parkrun/i.test(a.name));
  if (parkrun) {
    const s = parkrun.mov, mm = Math.floor(s / 60), ss = String(s % 60).padStart(2, '0');
    out.push({ t: parkrun.name, d: `5K in ${mm}:${ss} · ${parkrun.pr} PRs on the day` });
  }
  out.push({ t: 'Your biggest week', d: `${biggestWeek(acts)} mi in a single seven days` });
  const st = streak(activeDaySet(acts));
  if (st >= 7) out.push({ t: `A ${st}-day movement streak`, d: 'ran, rolled or lifted — every day' });
  return out.slice(0, 6);
}

function lifetime(acts) {
  const runs = acts.filter(a => a.type === 'Run');
  const activeDays = activeDaySet(acts);
  const runMi = runs.reduce((s, a) => s + toMiles(a.dist), 0);
  const totalMi = acts.reduce((s, a) => s + toMiles(a.dist), 0);
  const hours = acts.reduce((s, a) => s + (a.mov || 0), 0) / 3600;
  const elevFt = acts.reduce((s, a) => s + (a.elev || 0) * FT_PER_M, 0);
  const kcal = acts.reduce((s, a) => s + (a.cal || 0), 0);
  const dates = [...activeDays].sort();
  return {
    runMi: Math.round(runMi).toLocaleString(),
    totalMi: Math.round(totalMi).toLocaleString(),
    runs: runs.length,
    activities: acts.length,
    hours: Math.round(hours),
    elevFt: Math.round(elevFt).toLocaleString(),
    kcal: '~' + (Math.round(kcal / 1000) * 1000).toLocaleString(),
    streak: streak(activeDays),
    longestMi: (runs.length ? toMiles(runs.slice().sort((x, y) => y.dist - x.dist)[0].dist) : 0).toFixed(1),
    biggestWeekMi: biggestWeek(acts).toFixed(1),
    span: dates.length ? `${dates[0]} → ${dates[dates.length - 1]}` : '—',
    monthly: monthly(acts),
    feats: feats(acts),
  };
}

/* Build everything the Daily Hearth needs from a list of normalized activities. */
function computeHearth(acts, todayIso) {
  const sorted = acts.slice().sort((a, b) => (a.date < b.date ? 1 : -1));   // newest first
  const activeDays = activeDaySet(acts);
  const feed = sorted.slice(0, 8).map(a => {
    const e = earn(a, activeDays);
    return {
      id: a.id, name: a.name, when: dayKey(a.date), kind: kindOf(a),
      distMi: toMiles(a.dist).toFixed(1),
      timeStr: fmtTime(a.mov), prs: a.pr || 0, earn: e,
    };
  });
  const totals = acts.reduce((s, a) => {
    const e = earn(a, activeDays); s.ember += e.ember; s.sparks += e.sparks; s.still += e.still; return s;
  }, { ember: 0, sparks: 0, still: 0 });
  const lt = lifetime(acts);
  return {
    week: weekSummary(acts, todayIso),
    currencies: { ember: totals.ember, sparks: totals.sparks, still: totals.still },
    feed,
    lifetime: lt,
    milestone: feed.find(f => /parkrun|marathon/.test(f.kind)) || feed[0],
  };
}

function fmtTime(s) {
  s = s || 0; const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}` : `${m}:${String(ss).padStart(2, '0')}`;
}

return { computeHearth, earn, lifetime, weekSummary, streak, kindOf, relativeEffort, toMiles };

})();

/* ---------- Strava client ---------- */
const strava = (function(){
'use strict';
/* ============================================================================
   Strava API client — OAuth (authorize / exchange / refresh) + activity fetch.
   Uses Node 18+ global fetch. No SDK.
   ========================================================================== */

const AUTH = 'https://www.strava.com/oauth/authorize';
const TOKEN = 'https://www.strava.com/oauth/token';
const API = 'https://www.strava.com/api/v3';

function authorizeUrl() {
  const p = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.STRAVA_REDIRECT_URI,
    approval_prompt: 'auto',
    scope: 'read,activity:read_all',
  });
  return `${AUTH}?${p.toString()}`;
}

async function exchangeCode(code) {
  const r = await fetch(TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code, grant_type: 'authorization_code',
    }),
  });
  if (!r.ok) throw new Error('Strava token exchange failed: ' + r.status + ' ' + (await r.text()));
  return r.json();          // { access_token, refresh_token, expires_at, athlete }
}

async function refresh(refreshToken) {
  const r = await fetch(TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token', refresh_token: refreshToken,
    }),
  });
  if (!r.ok) throw new Error('Strava refresh failed: ' + r.status);
  return r.json();          // { access_token, refresh_token, expires_at }
}

/* Ensure a non-expired access token, refreshing + persisting if needed. */
async function validToken(store) {
  let tok = store.get();
  if (!tok) throw new Error('not connected');
  const now = Math.floor(Date.now() / 1000);
  if (tok.expires_at - now < 120) {
    const fresh = await refresh(tok.refresh_token);
    tok = { ...tok, ...fresh };
    store.set(tok);
  }
  return tok.access_token;
}

async function getAthlete(accessToken) {
  const r = await fetch(`${API}/athlete`, { headers: { Authorization: 'Bearer ' + accessToken } });
  if (!r.ok) throw new Error('athlete fetch failed: ' + r.status);
  return r.json();
}

/* Paginate athlete activities (newest first). maxPages caps the pull. */
async function getActivities(accessToken, { perPage = 100, maxPages = 4 } = {}) {
  const out = [];
  for (let page = 1; page <= maxPages; page++) {
    const r = await fetch(`${API}/athlete/activities?per_page=${perPage}&page=${page}`,
      { headers: { Authorization: 'Bearer ' + accessToken } });
    if (r.status === 429) throw new Error('Strava rate limit hit — try again shortly.');
    if (!r.ok) throw new Error('activities fetch failed: ' + r.status);
    const batch = await r.json();
    out.push(...batch);
    if (batch.length < perPage) break;
  }
  return out;
}

/* Strava summary lacks true calories → MET estimate (documented, honest). */
const MET = { Run: 9.8, TrailRun: 10.5, VirtualRun: 9.8, Ride: 7.0, VirtualRide: 7.2, Swim: 8.3, WeightTraining: 5.0, Workout: 4.5, Walk: 3.8, Hike: 5.5 };
function estCalories(a, weightKg) {
  const hours = (a.moving_time || 0) / 3600;
  const met = MET[a.sport_type] || MET[a.type] || 5;
  return Math.round(met * (weightKg || 75) * hours);
}

/* Map a raw Strava summary activity to the Ember Engine's normalized shape. */
function normalize(a, weightKg) {
  return {
    id: String(a.id),
    name: a.name,
    type: a.sport_type || a.type,
    date: a.start_date_local || a.start_date,
    dist: Math.round(a.distance || 0),
    mov: a.moving_time || 0,
    elev: Math.round(a.total_elevation_gain || 0),
    eff: a.suffer_score || 0,                       // Strava relative effort
    cal: estCalories(a, weightKg),
    pr: a.pr_count || 0,
  };
}

return { authorizeUrl, exchangeCode, refresh, validToken, getAthlete, getActivities, normalize };

})();

/* ---------- token store (writes tokens.json next to this file) ---------- */
const store = (function () {
  const FILE = path.join(__dirname, 'tokens.json');
  function get() {
    try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
    catch {
      if (process.env.STRAVA_REFRESH_TOKEN)
        return { access_token: null, refresh_token: process.env.STRAVA_REFRESH_TOKEN, expires_at: 0, bootstrap: true };
      return null;
    }
  }
  function set(tok) { try { fs.writeFileSync(FILE, JSON.stringify(tok, null, 2)); } catch (e) {} }
  function clear() { try { fs.unlinkSync(FILE); } catch (e) {} }
  return { get, set, clear };
})();

/* ---------- server ---------- */
const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;
const WEIGHT = +(process.env.ATHLETE_WEIGHT_KG || 92);
const MODE = (process.env.FORJ_MODE === 'local' || !process.env.STRAVA_CLIENT_ID) ? 'local' : 'live';

app.get('/healthz', (req, res) => res.json({ ok: true, mode: MODE }));

function forjIdentity(athlete) {
  const first = (athlete && athlete.first_name) || 'Wanderer';
  const city = (athlete && athlete.location && athlete.location.city) || (athlete && athlete.city) || 'Rainhill';
  return { name: first, of: 'of ' + city, house: 'Everburning', kindred: 'Emberkin', cls: 'Vanguard', day: 'Age II · Spring' };
}
function latestDate(acts) { return acts.map(a => String(a.date).slice(0, 10)).sort().pop(); }

async function buildHearth() {
  if (MODE === 'local') {
    const acts = ACTIVITIES_DATA;
    const today = latestDate(acts);
    const data = eng.computeHearth(acts, today);
    return { mode: 'local', connected: true, syncedAt: today,
      identity: forjIdentity({ first_name: 'Leighton', location: { city: 'Newport' } }), ...data };
  }
  const token = await strava.validToken(store);
  const [athlete, raw] = await Promise.all([
    strava.getAthlete(token),
    strava.getActivities(token, { perPage: 100, maxPages: 4 }),
  ]);
  const acts = raw.map(a => strava.normalize(a, WEIGHT));
  const today = new Date().toISOString().slice(0, 10);
  const data = eng.computeHearth(acts, today);
  return { mode: 'live', connected: true, syncedAt: new Date().toISOString(), identity: forjIdentity(athlete), ...data };
}

app.get('/api/status', (req, res) => {
  const connected = MODE === 'local' ? true : !!store.get();
  res.json({ mode: MODE, connected });
});
app.get('/api/hearth', async (req, res) => {
  try {
    if (MODE === 'live' && !store.get()) return res.status(401).json({ needAuth: true });
    res.json(await buildHearth());
  } catch (e) { console.error(e); res.status(500).json({ error: String(e.message || e) }); }
});
app.get('/auth/strava', (req, res) => res.redirect(strava.authorizeUrl()));
app.get('/auth/callback', async (req, res) => {
  try {
    if (req.query.error) return res.redirect('/?error=' + encodeURIComponent(req.query.error));
    store.set(await strava.exchangeCode(req.query.code));
    res.redirect('/');
  } catch (e) { console.error(e); res.status(500).send('Auth failed: ' + e.message); }
});
app.post('/auth/logout', (req, res) => { store.clear(); res.json({ ok: true }); });
app.get('/', (req, res) => res.type('html').send(HEARTH_HTML));

app.listen(PORT, () => {
  console.log('\n  Forj backend · mode=' + MODE + ' · http://localhost:' + PORT);
  if (MODE === 'live') console.log(store.get() ? '  Strava: connected' : '  Strava: not connected — open the page and click Connect.');
  else console.log('  Local mode — serving embedded demo data through the Ember Engine.\n');
});
