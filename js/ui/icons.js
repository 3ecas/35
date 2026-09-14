window.Game = window.Game || {};

(function () {
    var line = {
        sound:
            '<path d="M4 9.4h3.3L11.8 5.5v13L7.3 14.6H4z"/>' +
            '<path d="M15.2 9.7a3.3 3.3 0 0 1 0 4.6"/>' +
            '<path d="M17.8 7.1a6.9 6.9 0 0 1 0 9.8"/>',

        mute:
            '<path d="M4 9.4h3.3L11.8 5.5v13L7.3 14.6H4z"/>' +
            '<path d="M15.4 9.9 20 14.5M20 9.9l-4.6 4.6"/>',

        ladder: '<path d="M9 6.2h6M7.5 12h9M6 17.8h12"/>',

        back: '<path d="M18.4 12H6.2M11.4 6.8 6.2 12l5.2 5.2"/>',

        play: '<path d="M8.6 5.9 18.4 12l-9.8 6.1Z" fill="currentColor" stroke="none"/>',

        // carry on: the same triangle, stood against the mark you left off at
        resume:
            '<path d="M6.2 5.9v12.2"/>' +
            '<path d="M10.2 6.3 19 12l-8.8 5.7Z" fill="currentColor" stroke="none"/>',


        help:
            '<path d="M9.2 9a2.85 2.85 0 1 1 3.7 3.35c-.75.3-1.05.9-1.05 1.7v.35"/>' +
            '<path d="M11.85 17.5h.01"/>'
    };

    var art = {
        dirt:
            '<g transform="translate(1.2 1.2) scale(0.0422)" fill-rule="evenodd" ' +
            'clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" fi' +
            'll="#000"><g id="dirt-Layer1" transform="matrix(0.911571,0,0,0.91157' +
            '1,22.637778,22.637778)"> <g transform="matrix(1.277168,0,0,1.40725,-' +
            '77.97941,-239.703754)"> <path d="M438.441,421L84.559,421C97.825,343.' +
            '165 172.046,283.5 261.5,283.5C350.954,283.5 425.175,343.165 438.441,' +
            '421Z" style="fill:rgb(139,106,71);"/> </g> <g transform="matrix(1.27' +
            '7168,0,0,1.40725,-77.97941,-239.703754)"> <path d="M261.5,421L84.559' +
            ',421C97.825,343.165 172.046,283.5 261.5,283.5L261.5,421Z" style="fil' +
            'l:rgb(175,138,99);"/> </g> <g transform="matrix(1.013071,0,0,1.01307' +
            '1,30.118068,-10.555622)"> <g transform="matrix(3.28932,0,0,3.28932,-' +
            '286.561107,34.82917)"> <circle cx="129" cy="74" r="13" style="fill:r' +
            'gb(210,180,148);"/> </g> <g transform="matrix(1.600215,0,0,1.600215,' +
            '-107.760813,187.711083)"> <circle cx="129" cy="74" r="13" style="fil' +
            'l:rgb(238,220,200);"/> </g> </g> <g transform="matrix(0.656819,0,0,0' +
            '.656819,-8.96733,27.777663)"> <g transform="matrix(2.722594,0,0,2.72' +
            '2594,40.391693,78.134347)"> <circle cx="129" cy="74" r="13" style="f' +
            'ill:rgb(210,180,148);"/> </g> <g transform="matrix(1.489344,0,0,1.48' +
            '9344,185.872543,145.474248)"> <circle cx="129" cy="74" r="13" style=' +
            '"fill:rgb(238,220,200);"/> </g> </g> <g transform="matrix(1.478731,0' +
            ',0,1.478731,-75.980486,-71.969181)"> <g transform="matrix(2.887219,0' +
            ',0,2.887219,-98.917416,20.649166)"> <circle cx="129" cy="74" r="13" ' +
            'style="fill:rgb(210,180,148);"/> </g> <g transform="matrix(1.437137,' +
            '0,0,1.437137,117.306242,109.618442)"> <circle cx="129" cy="74" r="13' +
            '" style="fill:rgb(238,220,200);"/> </g> </g> </g></g>',

        rock:
            '<g transform="translate(1.2 1.2) scale(0.0422)" fill-rule="evenodd" ' +
            'clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" fi' +
            'll="#000"><g id="rock-Layer1" transform="matrix(1.169771,0,0,1.16977' +
            '1,-48.716232,-82.464664)"> <path d="M417.077,210.385L425.062,226.354' +
            'L425.062,244.097L430.385,267.164L432.159,288.456L436.595,308.86L433.' +
            '046,322.168L415.303,354.993L405.544,375.398L391.35,390.48L348.765,39' +
            '9.352L307.069,417.095L280.454,421.531L246.741,405.562L253.763,259.52' +
            '2L417.077,210.385Z" style="fill:rgb(140,143,138);"/> <path d="M281.3' +
            '41,421.531L222.788,419.756L185.527,411.772L152.701,402.9L110.117,384' +
            '.27L87.938,357.655L84.389,307.086L89.712,274.261L89.712,252.082L86.1' +
            '64,230.79L94.027,209.276L94.148,208.61L284.889,260.066L285.777,292.0' +
            '04L277.792,330.152L277.792,386.044L281.341,421.531Z" style="fill:rgb' +
            '(178,181,175);"/> <g transform="matrix(0.497429,-0.497429,0.497429,0' +
            '.497429,52.051391,256.686382)"> <path d="M341.221,141.129L384.025,21' +
            '6.036L422.371,279.351L413.453,320.372L357.273,310.562L263.639,265.08' +
            '3L198.701,212.082L146.819,142.913L115.608,65.33L90.639,-6.01L157.52,' +
            '9.15L227.077,37.686L277.907,90.299L341.221,141.129Z" style="fill:rgb' +
            '(208,211,205);"/> </g> <g transform="matrix(0.160565,-0.160565,0.160' +
            '565,0.160565,147.984569,206.138708)"> <path d="M341.221,141.129L384.' +
            '025,216.036L422.371,279.351L413.453,320.372L357.273,310.562L263.639,' +
            '265.083L198.701,212.082L146.819,142.913L115.608,65.33L90.639,-6.01L1' +
            '57.52,9.15L227.077,37.686L277.907,90.299L341.221,141.129Z" style="fi' +
            'll:rgb(234,235,232);"/> </g> </g></g>',

        coal:
            '<g transform="translate(1.2 1.2) scale(0.0422)" fill-rule="evenodd" ' +
            'clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" fi' +
            'll="#000"><g id="coal-Layer4"> </g> <g id="coal-Layer2"> </g> <g id=' +
            '"coal-Layer3"> <path d="M213,449L180,441L140,440L111,418L74,368L60,3' +
            '49L55,294L51,260L82,214L98,177L103,126L136,84L200,62L280,90L303,75L3' +
            '47,80L403,150L438,184L459,227L454,276L430,327L398,373L360,409L341,43' +
            '5L323,456L290,459L245,450L213,449Z" style="fill:rgb(23,23,23);"/> <c' +
            'lipPath id="coal-_clip1"> <path d="M213,449L180,441L140,440L111,418L' +
            '74,368L60,349L55,294L51,260L82,214L98,177L103,126L136,84L200,62L280,' +
            '90L303,75L347,80L403,150L438,184L459,227L454,276L430,327L398,373L360' +
            ',409L341,435L323,456L290,459L245,450L213,449Z"/> </clipPath> <g clip' +
            '-path="url(#coal-_clip1)"> <path d="M206,332L201,313L252,210L367,196' +
            'L358,276L297,318L269,321L234,365L206,332Z" style="fill:rgb(31,31,31)' +
            ';"/> <path d="M236,350L270,321L348,328L411,385L366,430L293,427L268,3' +
            '99L230,394L236,350Z" style="fill:rgb(8,8,8);"/> <path d="M212,326L16' +
            '2,313L110,331L110,402L167,455L240,458L268,398L241,346L212,326Z" styl' +
            'e="fill:rgb(44,44,44);"/> <path d="M204,217L134,315L212,326L241.989,' +
            '299.668L252,210L220,212L204,217Z" style="fill:rgb(73,73,73);"/> <pat' +
            'h d="M36,312L122,284L168,320L119,337L140,404L200,454L89,450L36,312Z"' +
            ' style="fill:rgb(16,16,16);"/> <path d="M296,69L301,118L286,206L360,' +
            '255L393,217L433,153L343,60L296,69Z" style="fill:rgb(54,54,54);"/> <p' +
            'ath d="M80,187L107,204L171,195L162,68L99,108L80,187Z" style="fill:rg' +
            'b(54,54,54);"/> <path d="M43,279L145,302L204,217L148,179L107,195L81,' +
            '189L36,269L43,279Z" style="fill:rgb(69,69,69);"/> <path d="M46,257L1' +
            '19,296L55,354L46,257Z" style="fill:rgb(54,54,54);"/> <path d="M141,4' +
            '3L134,121L145,186L204,217L286,206L300,169L307,115L303,75L266,54L141,' +
            '43Z" style="fill:rgb(116,116,116);"/> </g> </g> <g id="coal-Layer5">' +
            ' </g></g>',

        iron:
            '<g transform="translate(1.2 1.2) scale(0.0101)" fill-rule="evenodd" ' +
            'clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" fi' +
            'll="#000"><g id="iron-Layer1"><rect x="208.333" y="1239.583" width="' +
            '1716.667" height="116.667" style="fill:#8d949d;"/><rect x="208.333" ' +
            'y="1239.583" width="858.333" height="116.667" style="fill:#536173;"/' +
            '><rect x="208.333" y="906.25" width="1716.667" height="287.5" style=' +
            '"fill:#adb4bc;"/><clipPath id="iron-_clip1"><rect x="208.333" y="906' +
            '.25" width="1716.667" height="287.5"/></clipPath><g clip-path="url(#' +
            'iron-_clip1)"><rect x="1066.667" y="906.25" width="858.333" height="' +
            '287.5" style="fill:#6a7078;"/></g><rect x="208.333" y="777.083" widt' +
            'h="1716.667" height="83.333" style="fill:#dadde1;"/><rect x="820.833' +
            '" y="1025" width="491.667" height="83.333" style="fill:#dadde1;"/></' +
            'g></g>',

        zinc:
            '<path d="M12 3.4 20.4 8v8L12 20.6 3.6 16V8Zm0 5.4a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Z" ' +
            'fill="var(--i-zinc)"/>' +
            '<path d="M12 20.6V15.6a3.6 3.6 0 0 0 3.6-3.6h4.8v4Z" ' +
            'fill="var(--i-zinc-deep)"/>' +
            '<path d="M12 3.4 20.4 8l-4.3 2.4A5 5 0 0 0 12 8.8Z" ' +
            'fill="var(--i-zinc-light)"/>' +
            '<path d="M12 8.8a3.4 3.4 0 0 0-3.4 3.4H7.2A4.8 4.8 0 0 1 12 7.4Z" ' +
            'fill="var(--i-zinc-light)"/>' +
            '<path d="M4.6 8.6 11 5.1l1 .6-6.4 3.5Z" ' +
            'fill="var(--i-shine)"/>',

        copper:
            '<path d="M4.6 5.6h11a2.1 2.1 0 0 1 0 4.2h-11a2.1 2.1 0 0 1 0-4.2Zm3.8 4.3h11a2.1 2.1 0 0 1 0 4.2h-11a2.1 2.1 0 0 1 0-4.2Zm-3.8 4.3h11a2.1 2.1 0 0 1 0 4.2h-11a2.1 2.1 0 0 1 0-4.2Z" ' +
            'fill="var(--i-copper)"/>' +
            '<path d="M15.6 9.8h-3.4a2.1 2.1 0 0 0 0-4.2h3.4a2.1 2.1 0 0 1 0 4.2Zm3.8 4.3H16a2.1 2.1 0 0 0 0-4.2h3.4a2.1 2.1 0 0 1 0 4.2Zm-3.8 4.3h-3.4a2.1 2.1 0 0 0 0-4.2h3.4a2.1 2.1 0 0 1 0 4.2Z" ' +
            'fill="var(--i-copper-deep)"/>' +
            '<path d="M4.6 5.6h11a2.1 2.1 0 0 1 1.7.9H2.9a2.1 2.1 0 0 1 1.7-.9Zm3.8 4.3h11a2.1 2.1 0 0 1 1.7.9H6.7a2.1 2.1 0 0 1 1.7-.9Zm-3.8 4.3h11a2.1 2.1 0 0 1 1.7.9H2.9a2.1 2.1 0 0 1 1.7-.9Z" ' +
            'fill="var(--i-copper-light)"/>' +
            '<path d="M5 6.4h4.4l-.2.9H4.8Zm3.8 4.3h4.4l-.2.9H8.6Z" ' +
            'fill="var(--i-shine)"/>',

        bronze:
            '<path d="M5 6.6h11a2.6 2.6 0 0 1 0 5.2H5a2.6 2.6 0 0 1 0-5.2Zm3 5.6h11a2.6 2.6 0 0 1 0 5.2H8a2.6 2.6 0 0 1 0-5.2Z" ' +
            'fill="var(--i-bronze)"/>' +
            '<path d="M16 11.8h-4.6a2.6 2.6 0 0 0 0-5.2H16a2.6 2.6 0 0 1 0 5.2Zm3 5.6h-4.6a2.6 2.6 0 0 0 0-5.2H19a2.6 2.6 0 0 1 0 5.2Z" ' +
            'fill="var(--i-bronze-deep)"/>' +
            '<path d="M5 6.6h11a2.6 2.6 0 0 1 2.2 1.2H2.8A2.6 2.6 0 0 1 5 6.6Zm3 5.6h11a2.6 2.6 0 0 1 2.2 1.2H5.8A2.6 2.6 0 0 1 8 12.2Z" ' +
            'fill="var(--i-bronze-light)"/>' +
            '<path d="M5.6 7.4h4.8l-.3 1H5.1Zm3 5.6h4.8l-.3 1H8.1Z" ' +
            'fill="var(--i-shine)"/>',

        tin:
            '<path d="M6.4 7.6h11.2v9.2a5.6 2.6 0 0 1-11.2 0Z" ' +
            'fill="var(--i-tin)"/>' +
            '<path d="M12 7.8h5.6v9a5.6 2.6 0 0 1-5.6 2.6Z" ' +
            'fill="var(--i-tin-deep)"/>' +
            '<path d="M12 5a5.6 2.6 0 0 1 5.6 2.6A5.6 2.6 0 0 1 6.4 7.6 5.6 2.6 0 0 1 12 5Z" ' +
            'fill="var(--i-tin-light)"/>' +
            '<path d="M6.4 11.4h11.2v2.4H6.4Z" ' +
            'fill="var(--i-tin-light)"/>' +
            '<path d="M12 5.9a3.4 1.4 0 0 1 3.4 1.4A3.4 1.4 0 0 1 8.6 7.3 3.4 1.4 0 0 1 12 5.9Z" ' +
            'fill="var(--i-shine)"/>' +
            '<path d="M8.2 12h2.4v1.4H8.2Z" ' +
            'fill="var(--i-shine)"/>',

        titanium:
            '<path d="M12 3.6 21 9v6l-9 5.4L3 15V9Z" ' +
            'fill="var(--i-titanium)"/>' +
            '<path d="M12 12.4 21 9v6l-9 5.4Z" ' +
            'fill="var(--i-titanium-deep)"/>' +
            '<path d="M12 3.6 21 9l-9 3.4L3 9Z" ' +
            'fill="var(--i-titanium-light)"/>' +
            '<path d="M12 12.4v8L3 15V9Z" ' +
            'fill="var(--i-titanium-light)"/>' +
            '<path d="M4.6 9 11 5.2l1.2.7L5.8 9.7Z" ' +
            'fill="var(--i-shine)"/>',

        silver_ore:
            '<path d="M8.6 10.4a5.4 5.4 0 1 1 0 10.8 5.4 5.4 0 0 1 0-10.8Zm8.4-6a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6Zm1.4 8.4a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4Z" ' +
            'fill="var(--i-silver)"/>' +
            '<path d="M14 15.8a5.4 5.4 0 0 1-5.4 5.4V15.8Zm6.8-.2a3.2 3.2 0 0 1-3.2 3.2v-3.2Zm0-7.4a3.8 3.8 0 0 1-3.8 3.8V8.2Z" ' +
            'fill="var(--i-silver-deep)"/>' +
            '<path d="M8.6 10.4a5.4 5.4 0 0 0-5.4 5.4h5.4Zm8.4-6a3.8 3.8 0 0 0-3.8 3.8H17Z" ' +
            'fill="var(--i-silver-light)"/>' +
            '<path d="M5.6 13.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Zm9.6-6.4a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" ' +
            'fill="var(--i-shine)"/>',

        ingot:
            '<path d="M2.4 19.4 5.2 12h13.6l2.8 7.4Z" ' +
            'fill="var(--i-gold)"/>' +
            '<path d="M12 12h6.8l2.8 7.4H12Z" ' +
            'fill="var(--i-gold-deep)"/>' +
            '<path d="M5.2 12 7 7.2h10l1.8 4.8Z" ' +
            'fill="var(--i-gold-light)"/>' +
            '<path d="M8.6 14.2h6.8l.5 1.4H8.1Z" ' +
            'fill="var(--i-gold-deep)"/>' +
            '<path d="M7.6 8h5.2l-.4 1.2H7.2Z" ' +
            'fill="var(--i-shine)"/>' +
            '<path d="M4.6 13.2h4l-.5 1.4H4.1Z" ' +
            'fill="var(--i-shine)"/>',

        platinum:
            '<path d="M3 12.8 4.8 8.2h14.4l1.8 4.6Zm0 7 1.8-4.4h14.4l1.8 4.4Z" ' +
            'fill="var(--i-platinum)"/>' +
            '<path d="M12 8.2h7.2l1.8 4.6H12Zm0 7h7.2l1.8 4.4H12Z" ' +
            'fill="var(--i-platinum-deep)"/>' +
            '<path d="M4.8 8.2h14.4l-1 2.4H5.8Zm0 7h14.4l-1 2.2H5.8Z" ' +
            'fill="var(--i-platinum-light)"/>' +
            '<path d="M6.2 8.9h4.4l-.4 1.1H5.8Zm0 7h4.4l-.4 1H5.8Z" ' +
            'fill="var(--i-shine)"/>',

        iridium:
            '<path d="M12 2.8 15 9.4l6.6.6-5 4.4 1.6 6.6L12 17.6 5.8 21l1.6-6.6-5-4.4L9 9.4Z" ' +
            'fill="var(--i-iridium)"/>' +
            '<path d="M12 12l4.6 2.4 1.6 6.6L12 17.6Z" ' +
            'fill="var(--i-iridium-deep)"/>' +
            '<path d="M12 2.8 15 9.4l6.6.6-5 4.4L12 12Z" ' +
            'fill="var(--i-iridium-light)"/>' +
            '<path d="M12 6.6l1.6 3.6 3.6.3-2.7 2.4.8 3.5L12 14.6Z" ' +
            'fill="var(--i-iridium-deep)"/>' +
            '<path d="M12 4.2l1 2.3-1 .3-1-.3Z" ' +
            'fill="var(--i-shine)"/>',

        rhodium:
            '<path d="M12 3.2 20.8 12 12 20.8 3.2 12Z" ' +
            'fill="var(--i-rhodium)"/>' +
            '<path d="M12 12h8.8L12 20.8Z" ' +
            'fill="var(--i-rhodium-deep)"/>' +
            '<path d="M12 3.2 20.8 12H12Z" ' +
            'fill="var(--i-rhodium-light)"/>' +
            '<path d="M12 7.4 16.6 12 12 16.6 7.4 12Z" ' +
            'fill="var(--i-rhodium-light)"/>' +
            '<path d="M12 9.4 14.6 12H12Z" ' +
            'fill="var(--i-shine)"/>' +
            '<path d="M6 12 9.6 8.4l.8.8L6.8 12.8Z" ' +
            'fill="var(--i-shine)"/>',

        quartz:
            '<path d="M12 2.6 17.4 9v9.6L12 21.4 6.6 18.6V9Z" ' +
            'fill="var(--i-quartz)"/>' +
            '<path d="M12 11.4 17.4 9v9.6L12 21.4Z" ' +
            'fill="var(--i-quartz-deep)"/>' +
            '<path d="M12 2.6 17.4 9l-5.4 2.4L6.6 9Z" ' +
            'fill="var(--i-quartz-light)"/>' +
            '<path d="M12 2.6 14.7 5.8 12 7 9.3 5.8Z" ' +
            'fill="var(--i-quartz-light)"/>' +
            '<path d="M8.4 10.2v8.1l-1.8-.9V9.4Z" ' +
            'fill="var(--i-quartz-light)"/>' +
            '<path d="M9.6 6.4 12 4.2l.5.6-2.2 2Z" ' +
            'fill="var(--i-shine)"/>',

        amethyst:
            '<path d="M6.4 9.4 9 4.8l2.6 4.6v9.8L6.4 16.8Zm6.6 1.6 3.4-4.4 3.6 4.4v6.2l-3.6 2.4-3.4-2.4Z" ' +
            'fill="var(--i-amethyst)"/>' +
            '<path d="M11.6 9.4v9.8l-2.6-1.4V10.8Zm8.4 1.6v6.2l-3.6 2.4v-7Z" ' +
            'fill="var(--i-amethyst-deep)"/>' +
            '<path d="M9 4.8l2.6 4.6-2.6 1.4-2.6-1.4Zm7.4 1.8 3.6 4.4-3.6 1.6-3.4-1.6Z" ' +
            'fill="var(--i-amethyst-light)"/>' +
            '<path d="M7.6 10.6 9 11.4v6.6l-1.4-.8Zm6.6 2 2.2 1v5.6l-2.2-1.5Z" ' +
            'fill="var(--i-amethyst-light)"/>' +
            '<path d="M8 6.6 9 5l.5.9-1 1.6Zm7 1.4 1.4-1.1.6.7-1.4 1Z" ' +
            'fill="var(--i-shine)"/>',

        citrine:
            '<path d="M12 2.8c3.4 3.6 6.6 7 6.6 10.8A6.6 6.6 0 0 1 5.4 13.6C5.4 9.8 8.6 6.4 12 2.8Z" ' +
            'fill="var(--i-citrine)"/>' +
            '<path d="M12 11c2.6 0 6.6 1 6.6 2.6A6.6 6.6 0 0 1 12 20.2Z" ' +
            'fill="var(--i-citrine-deep)"/>' +
            '<path d="M12 2.8C10 5 8.2 7 7 8.8l5 2.2 5-2.2C15.8 7 14 5 12 2.8Z" ' +
            'fill="var(--i-citrine-light)"/>' +
            '<path d="M7 8.8 12 11l-1.4 3.2L6 12.6A9 9 0 0 1 7 8.8Z" ' +
            'fill="var(--i-citrine-light)"/>' +
            '<path d="M10.6 5.6 12 4l.6.8-1.4 1.6Z" ' +
            'fill="var(--i-shine)"/>',

        turquoise:
            '<path d="M12 6.2c5 0 8.6 2.8 8.6 6.4S17 20 12 20s-8.6-3.8-8.6-7.4S7 6.2 12 6.2Z" ' +
            'fill="var(--i-turquoise)"/>' +
            '<path d="M20.6 12.6C20.6 16.2 17 20 12 20v-7.6c3.2 0 6-1 7.8-2.6a5.6 5.6 0 0 1 .8 2.8Z" ' +
            'fill="var(--i-turquoise-deep)"/>' +
            '<path d="M12 6.2c-3.6 0-6.4 1.5-7.8 3.6 1.8 1.6 4.6 2.6 7.8 2.6s6-1 7.8-2.6C18.4 7.7 15.6 6.2 12 6.2Z" ' +
            'fill="var(--i-turquoise-light)"/>' +
            '<path d="M6.4 13.4c1.4.9 2 2.3 1.7 4.2l-1-.7c.2-1.4-.2-2.3-1.2-3Zm10.8-.4c-1.1 1.3-1.3 2.6-.6 4l1-.8c-.5-1.1-.3-2 .5-2.8Z" ' +
            'fill="var(--i-turquoise-deep)"/>' +
            '<path d="M8.4 8a5.4 1.5 0 0 1 5.4-1.4 8 8 0 0 0-6.6 1.9Z" ' +
            'fill="var(--i-shine)"/>',

        garnet:
            '<path d="M12 3.4a8.6 8.6 0 1 1 0 17.2 8.6 8.6 0 0 1 0-17.2Z" ' +
            'fill="var(--i-garnet)"/>' +
            '<path d="M20.6 12A8.6 8.6 0 0 1 12 20.6V12Z" ' +
            'fill="var(--i-garnet-deep)"/>' +
            '<path d="M12 3.4a8.6 8.6 0 0 0-8.6 8.6h17.2A8.6 8.6 0 0 0 12 3.4Z" ' +
            'fill="var(--i-garnet-light)"/>' +
            '<path d="M12 7.2 15.6 12 12 16.8 8.4 12Z" ' +
            'fill="var(--i-garnet-deep)"/>' +
            '<path d="M12 8.9 13.9 12H12Z" ' +
            'fill="var(--i-garnet-light)"/>' +
            '<path d="M6.6 7.4A7.2 7.2 0 0 1 11 5.2l.2 1.1a6 6 0 0 0-3.7 1.9Z" ' +
            'fill="var(--i-shine)"/>',

        topaz:
            '<path d="M7 6h10l4 3.4v5.2L17 18H7l-4-3.4V9.4Z" ' +
            'fill="var(--i-topaz)"/>' +
            '<path d="M12 9.4h9v5.2L17 18h-5Z" ' +
            'fill="var(--i-topaz-deep)"/>' +
            '<path d="M7 6h10l4 3.4H3Z" ' +
            'fill="var(--i-topaz-light)"/>' +
            '<path d="M6.2 9.4h11.6v1.5H6.2Zm0 3h11.6v1.4H6.2Z" ' +
            'fill="var(--i-topaz-light)"/>' +
            '<path d="M8 7h5.4l-.6 1.2H6.8Z" ' +
            'fill="var(--i-shine)"/>',

        peridot:
            '<path d="M12 4c4 0 7 3.6 7 8s-3 8-7 8-7-3.6-7-8 3-8 7-8Z" ' +
            'fill="var(--i-peridot)"/>' +
            '<path d="M19 12c0 4.4-3 8-7 8v-8Z" ' +
            'fill="var(--i-peridot-deep)"/>' +
            '<path d="M12 4c-4 0-7 3.6-7 8h14c0-4.4-3-8-7-8Z" ' +
            'fill="var(--i-peridot-light)"/>' +
            '<path d="M12 7.6c2.2 0 3.8 2 3.8 4.4s-1.6 4.4-3.8 4.4-3.8-2-3.8-4.4S9.8 7.6 12 7.6Z" ' +
            'fill="var(--i-peridot-deep)"/>' +
            '<path d="M12 9.4c1.2 0 2 1.2 2 2.6h-4c0-1.4.8-2.6 2-2.6Z" ' +
            'fill="var(--i-peridot-light)"/>' +
            '<path d="M7.6 7.6A5.6 5.6 0 0 1 11 5.2l.2 1.1a4.6 4.6 0 0 0-2.6 2Z" ' +
            'fill="var(--i-shine)"/>',

        lapis:
            '<path d="M4.4 4.8h15.2v14.4H4.4Z" ' +
            'fill="var(--i-lapis)"/>' +
            '<path d="M12 4.8h7.6v14.4H12Z" ' +
            'fill="var(--i-lapis-deep)"/>' +
            '<path d="M4.4 4.8h15.2v3.1H4.4Z" ' +
            'fill="var(--i-lapis-deep)"/>' +
            '<path d="M7.2 9.8a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8Zm8.4 1a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Zm-6 4.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Zm6.6.4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM6 6a.9.9 0 1 1 0 1.8A.9.9 0 0 1 6 6Zm10.8.4a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4Z" ' +
            'fill="var(--i-lapis-light)"/>' +
            '<path d="M5.2 5.6h4.4v1H5.2Z" ' +
            'fill="var(--i-shine)"/>',

        aquamarine:
            '<path d="M9 3.4h6l2.4 3v11.2l-2.4 3H9l-2.4-3V6.4Z" ' +
            'fill="var(--i-aqua)"/>' +
            '<path d="M12 6.4h5.4v11.2l-2.4 3H12Z" ' +
            'fill="var(--i-aqua-deep)"/>' +
            '<path d="M9 3.4h6l2.4 3H6.6Z" ' +
            'fill="var(--i-aqua-light)"/>' +
            '<path d="M6.6 8.2h10.8v1.4H6.6Zm0 3.2h10.8v1.4H6.6Zm0 3.2h10.8v1.4H6.6Z" ' +
            'fill="var(--i-aqua-light)"/>' +
            '<path d="M9.6 4.2h3.2l-.5 1.2H8.8Z" ' +
            'fill="var(--i-shine)"/>',

        tourmaline:
            '<path d="M5.6 5.2h12.8v13.6H5.6Z" ' +
            'fill="var(--i-tourmaline)"/>' +
            '<path d="M9.8 5.2h4.4v13.6H9.8Z" ' +
            'fill="var(--i-tourmaline-deep)"/>' +
            '<path d="M5.6 5.2h3.2v13.6H5.6Z" ' +
            'fill="var(--i-tourmaline-light)"/>' +
            '<path d="M15.4 5.2h3v13.6h-3Z" ' +
            'fill="var(--i-tourmaline-light)"/>' +
            '<path d="M5.6 5.2h12.8v1.8H5.6Z" ' +
            'fill="var(--i-shine)"/>',

        tanzanite:
            '<path d="M12 3.6 21 19.6H3Z" ' +
            'fill="var(--i-tanzanite)"/>' +
            '<path d="M12 11.6h4.5L21 19.6H12Z" ' +
            'fill="var(--i-tanzanite-deep)"/>' +
            '<path d="M12 3.6 16.5 11.6h-9Z" ' +
            'fill="var(--i-tanzanite-light)"/>' +
            '<path d="M12 8 14 11.6h-4Z" ' +
            'fill="var(--i-tanzanite-light)"/>' +
            '<path d="M7.5 11.6h9l1.6 2.8H5.9Z" ' +
            'fill="var(--i-tanzanite-deep)"/>' +
            '<path d="M11.6 5.2 12 4.4l1 1.8-.6 1Z" ' +
            'fill="var(--i-shine)"/>',

        opal:
            '<path d="M11 3.8c5.2-.6 9.6 2.4 9.8 6.8.2 5-3.2 9-8 9.4-4.6.4-8.4-2.4-8.8-6.6-.4-4.6 2.4-9 7-9.6Z" ' +
            'fill="var(--i-opal)"/>' +
            '<path d="M20.8 10.6c.2 5-3.2 9-8 9.4l-1-15.9c5-.4 8.8 2.3 9 6.5Z" ' +
            'fill="var(--i-opal-deep)"/>' +
            '<path d="M8.2 7.8a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm7.6.6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-4.4 5.6a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Zm5.4.8a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM6.4 13.6a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" ' +
            'fill="var(--i-opal-light)"/>' +
            '<path d="M8.2 8.6a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" ' +
            'fill="var(--i-shine)"/>',

        emerald:
            '<path d="M6 6.6h12l3.4 3v4.8L18 17.4H6l-3.4-3V9.6Z" ' +
            'fill="var(--i-emerald)"/>' +
            '<path d="M12 9.6h9.4v4.8L18 17.4H12Z" ' +
            'fill="var(--i-emerald-deep)"/>' +
            '<path d="M6 6.6h12l3.4 3H2.6Z" ' +
            'fill="var(--i-emerald-light)"/>' +
            '<path d="M2.6 11h18.8v1.3H2.6Zm0 2.7h18.8v1.2H2.6Z" ' +
            'fill="var(--i-emerald-light)"/>' +
            '<path d="M7 7.4h5.4l-.7 1.2H5.9Z" ' +
            'fill="var(--i-shine)"/>',

        sapphire:
            '<path d="M21.4 12c-3.6 3.4-6.6 5.6-9.4 5.6S6.2 15.4 2.6 12c3.6-3.4 6.6-5.6 9.4-5.6s6.2 2.2 9.4 5.6Z" ' +
            'fill="var(--i-sapphire)"/>' +
            '<path d="M12 12h9.4c-3.6 3.4-6.6 5.6-9.4 5.6Z" ' +
            'fill="var(--i-sapphire-deep)"/>' +
            '<path d="M21.4 12c-3.6-3.4-6.6-5.6-9.4-5.6S6.2 8.6 2.6 12Z" ' +
            'fill="var(--i-sapphire-light)"/>' +
            '<path d="M12 8.6 16.4 12 12 15.4 7.6 12Z" ' +
            'fill="var(--i-sapphire-deep)"/>' +
            '<path d="M12 8.6 16.4 12H7.6Z" ' +
            'fill="var(--i-sapphire-light)"/>' +
            '<path d="M6.6 10.6a12 12 0 0 1 4-2.6l.4 1a10 10 0 0 0-3.4 2.2Z" ' +
            'fill="var(--i-shine)"/>',

        ruby:
            '<path d="M12 20.6C6.4 16.8 3.6 13.6 3.6 10.4A4.6 4.6 0 0 1 12 7.8a4.6 4.6 0 0 1 8.4 2.6c0 3.2-2.8 6.4-8.4 10.2Z" ' +
            'fill="var(--i-ruby)"/>' +
            '<path d="M12 7.8a4.6 4.6 0 0 1 8.4 2.6c0 3.2-2.8 6.4-8.4 10.2Z" ' +
            'fill="var(--i-ruby-deep)"/>' +
            '<path d="M8.2 5.8a4.6 4.6 0 0 1 3.8 2c-1.4 1.4-2.6 2.4-4.6 2.6a4.4 4.4 0 0 1-3.8-.2 4.6 4.6 0 0 1 4.6-4.4Z" ' +
            'fill="var(--i-ruby-light)"/>' +
            '<path d="M12 9.6c1.8 0 3 1.2 3 2.6s-1.2 2.6-3 2.6-3-1.2-3-2.6 1.2-2.6 3-2.6Z" ' +
            'fill="var(--i-ruby-deep)"/>' +
            '<path d="M6.6 7.2a3 3 0 0 1 2.6-.5l-.4 1a2.2 2.2 0 0 0-1.6.3Z" ' +
            'fill="var(--i-shine)"/>',

        jadeite:
            '<path d="M12 3.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8Zm0 5.6a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z" ' +
            'fill="var(--i-jadeite)"/>' +
            '<path d="M12 20.4a8.4 8.4 0 0 0 8.4-8.4h-5.6a2.8 2.8 0 0 1-2.8 2.8Z" ' +
            'fill="var(--i-jadeite-deep)"/>' +
            '<path d="M12 3.6a8.4 8.4 0 0 0-8.4 8.4h5.6A2.8 2.8 0 0 1 12 9.2Z" ' +
            'fill="var(--i-jadeite-light)"/>' +
            '<path d="M12 5.2a6.8 6.8 0 0 0-6.8 6.8h1.4A5.4 5.4 0 0 1 12 6.6Z" ' +
            'fill="var(--i-jadeite-light)"/>' +
            '<path d="M6.6 7.6A7 7 0 0 1 10.6 5l.3 1.1a5.8 5.8 0 0 0-3.3 2.2Z" ' +
            'fill="var(--i-shine)"/>',

        alexandrite:
            '<path d="M12 3.2 19.6 8v8L12 20.8 4.4 16V8Z" ' +
            'fill="var(--i-alexandrite)"/>' +
            '<path d="M12 3.2 19.6 8v8L12 20.8Z" ' +
            'fill="var(--i-alexandrite-deep)"/>' +
            '<path d="M12 3.2 19.6 8 12 11.6 4.4 8Z" ' +
            'fill="var(--i-alexandrite-light)"/>' +
            '<path d="M12 11.6v9.2L4.4 16V8Z" ' +
            'fill="var(--i-alexandrite-light)"/>' +
            '<path d="M12 6.4 16 8.4 12 10.4 8 8.4Z" ' +
            'fill="var(--i-alexandrite)"/>' +
            '<path d="M6 8.2 11 5.1l1 .6-5 3.1Z" ' +
            'fill="var(--i-shine)"/>',

        paraiba:
            '<path d="M12 3 18.6 9.6 12 21 5.4 9.6Z" ' +
            'fill="var(--i-paraiba)"/>' +
            '<path d="M12 9.6h6.6L12 21Z" ' +
            'fill="var(--i-paraiba-deep)"/>' +
            '<path d="M12 3 18.6 9.6H5.4Z" ' +
            'fill="var(--i-paraiba-light)"/>' +
            '<path d="M12 3 15.3 9.6H8.7Z" ' +
            'fill="var(--i-paraiba-light)"/>' +
            '<path d="M8.7 9.6h6.6L12 15Z" ' +
            'fill="var(--i-paraiba-deep)"/>' +
            '<path d="M9.6 5.6 12 4.2l.5.9-2.2 1.3Z" ' +
            'fill="var(--i-shine)"/>',

        beryl:
            '<path d="M12 2.8 20.2 10 12 21.2 3.8 10Z" ' +
            'fill="var(--i-beryl)"/>' +
            '<path d="M12 12.6 20.2 10 12 21.2Z" ' +
            'fill="var(--i-beryl-deep)"/>' +
            '<path d="M12 2.8 20.2 10l-8.2 2.6L3.8 10Z" ' +
            'fill="var(--i-beryl-light)"/>' +
            '<path d="M12 2.8 16 10h-8Z" ' +
            'fill="var(--i-beryl-light)"/>' +
            '<path d="M8 10h8l-4 6.6Z" ' +
            'fill="var(--i-beryl-deep)"/>' +
            '<path d="M9.8 5.4 12 4l.4 1-2 1.4Z" ' +
            'fill="var(--i-shine)"/>',

        diamond:
            '<path d="M6.6 4.4h10.8L21.4 9.4 12 20.8 2.6 9.4Z" ' +
            'fill="var(--i-diamond)"/>' +
            '<path d="M12 9.4h9.4L12 20.8Z" ' +
            'fill="var(--i-diamond-deep)"/>' +
            '<path d="M6.6 4.4h10.8L21.4 9.4H2.6Z" ' +
            'fill="var(--i-diamond-light)"/>' +
            '<path d="M8.8 4.4 12 9.4l3.2-5Z" ' +
            'fill="var(--i-diamond-deep)"/>' +
            '<path d="M8.8 9.4h6.4L12 16.8Z" ' +
            'fill="var(--i-diamond-light)"/>' +
            '<path d="M7.4 5.2h3.2L9.2 8H5.4Z" ' +
            'fill="var(--i-shine)"/>' +
            '<path d="M13.4 10.4h3.2L14 15.4l-1-1.6Z" ' +
            'fill="var(--i-shine)"/>',

        crown:
            '<path d="M3 8.6 7.4 12l4.6-5.6L16.6 12 21 8.6l-1.6 8H4.6Z" ' +
            'fill="var(--i-gold)"/>' +
            '<path d="M12 6.4 16.6 12 21 8.6l-1.6 8H12Z" ' +
            'fill="var(--i-gold-deep)"/>' +
            '<path d="M4.2 17h15.6l-.5 2.6H4.7Z" ' +
            'fill="var(--i-gold)"/>' +
            '<path d="M4.2 17h15.6l-.2 1.1H4.4Z" ' +
            'fill="var(--i-gold-light)"/>' +
            '<path d="M12 9.4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-5.6 2.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Zm11.2 0a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" ' +
            'fill="var(--i-gold-light)"/>' +
            '<path d="M5.6 9.8 8 11.6l-.4.9-2.4-1.8Z" ' +
            'fill="var(--i-shine)"/>',

        rubble:
            '<path d="M2.4 19.8 4.8 14.6l4.4 1.2 2.2 4Z" ' +
            'fill="var(--i-rock)"/>' +
            '<path d="M9.2 19.8 11 12.8l4.8-.8 2.4 7.8Z" ' +
            'fill="var(--i-rock-deep)"/>' +
            '<path d="M11 12.8l4.8-.8-.4 3.2-4.2.8Z" ' +
            'fill="var(--i-rock)"/>' +
            '<path d="M16.2 19.8 17.8 15.2l3.8 1.2v3.4Z" ' +
            'fill="var(--i-rock)"/>' +
            '<path d="M5.8 12.4 8.2 8.8l2.8 2.2-1.6 2.8Z" ' +
            'fill="var(--i-rock-light)"/>' +
            '<path d="M4.8 14.6 8 15.5l-.4 1.1-3.4-.9Z" ' +
            'fill="var(--i-rock-light)"/>' +
            '<path d="M8.6 9.6 10 10.7l-.5.9-1.4-1.1Z" ' +
            'fill="var(--i-shine)"/>',

        dynamite:
            '<path d="M6.2 9.4h11.6a2 2 0 0 1 2 2v6.4a2 2 0 0 1-2 2H6.2a2 2 0 0 1-2-2v-6.4a2 2 0 0 1 2-2Z" ' +
            'fill="var(--i-tnt)"/>' +
            '<path d="M12 9.4h5.8a2 2 0 0 1 2 2v6.4a2 2 0 0 1-2 2H12Z" ' +
            'fill="var(--i-tnt-deep)"/>' +
            '<path d="M4.2 13.2h15.6v2.4H4.2Z" ' +
            'fill="var(--i-tnt-light)"/>' +
            '<path d="M9.4 9.4h1.9v10.4H9.4Zm3.4 0h1.9v10.4h-1.9Z" ' +
            'fill="var(--i-tnt-deep)"/>' +
            '<path d="M11.4 4.2c2 .6 3 1.9 3 3.9h-1.8c0-1.3-.6-2.1-1.9-2.5Z" ' +
            'fill="var(--i-rock-deep)"/>' +
            '<path d="M15 2.2a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4Z" ' +
            'fill="var(--i-star)"/>' +
            '<path d="M5.4 10.4h4.6l-.4 1.4H5Z" ' +
            'fill="var(--i-shine)"/>',

        lodestone:
            '<circle cx="12" cy="12" r="8.8" fill="var(--i-star-halo)"/>' +
            '<path d="M12 2.4 14.4 9.2 21.4 11.6 14.4 14 12 20.8 9.6 14 2.6 11.6 9.6 9.2Z" ' +
            'fill="var(--i-star)"/>' +
            '<path d="M12 2.4 14.4 9.2 21.4 11.6 14.4 14 12 20.8Z" ' +
            'fill="var(--i-star-deep)"/>' +
            '<path d="M12 6.6 13.2 10.4 17 11.6 13.2 12.8 12 16.6 10.8 12.8 7 11.6 10.8 10.4Z" ' +
            'fill="var(--i-star-light)"/>' +
            '<path d="M19.6 4 20.2 5.9 22.1 6.5 20.2 7.1 19.6 9 19 7.1 17.1 6.5 19 5.9Z" ' +
            'fill="var(--i-star-light)"/>' +
            '<path d="M4.6 15.1 5.1 16.5 6.5 17 5.1 17.5 4.6 18.9 4.1 17.5 2.7 17 4.1 16.5Z" ' +
            'fill="var(--i-star)"/>' +
            '<circle cx="18.9" cy="17.6" r=".9" fill="var(--i-star-light)"/>' +
            '<circle cx="5.4" cy="6.2" r=".7" fill="var(--i-star)"/>' +
            '<path d="M10.6 8.2 12 4.6l.6 1.8-1.2 2.2Z" ' +
            'fill="var(--i-shine)"/>',

        sparkle:
            '<path d="M12 2.2 14 10 21.8 12 14 14 12 21.8 10 14 2.2 12 10 10Z" ' +
            'fill="var(--i-gold-light)"/>' +
            '<path d="M12 7.4 13 11 16.6 12 13 13 12 16.6 11 13 7.4 12 11 11Z" ' +
            'fill="var(--i-shine)"/>'
    };

    function wrap(body, isArt) {
        return (
            '<svg class="icon' +
            (isArt ? " icon--art" : "") +
            '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
            body +
            "</svg>"
        );
    }

    Game.Icons = {
        has: function (name) {
            return !!(art[name] || line[name]);
        },

        // the piece art, by name — LiveArt reads this to know what to look for
        // in ICONS/, and writes back over it with whatever it finds
        keys: function () {
            return Object.keys(art);
        },

        replace: function (name, markup) {
            if (!art[name] || !markup) return false;
            art[name] = markup;
            return true;
        },

        svg: function (name) {
            if (art[name]) return wrap(art[name], true);
            if (line[name]) return wrap(line[name], false);
            return "";
        },

        hydrate: function (root) {
            var host = root || document;
            var slots = host.querySelectorAll("[data-icon]");
            Array.prototype.forEach.call(slots, function (slot) {
                var name = slot.getAttribute("data-icon");
                if (!name || slot.firstElementChild) return;
                slot.innerHTML = Game.Icons.svg(name);
            });
        }
    };
})();
