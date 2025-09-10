OGX.Format = {
     uppercase: (__str) => String(__str).toUpperCase(),
     lowercase: (__str) => String(__str).toLowerCase(),
     trim: (__str) => String(__str).trim(),
     capitalize: (str) => String(__str).charAt(0).toUpperCase() + __str.slice(1),
     currency: (__val, __symbol = '$') => `${__symbol}${parseFloat(__val).toFixed(2)}`,
     add: (__val, __n) => Number(__val) + Number(__n),
     formatDate: (__date, __format = 'YYYY-MM-DD') => new Date(__date).toISOString().slice(0, 10),
     round: (__val) => Math.round(Number(__val)),
     floor: (__val) => Math.floor(Number(__val)),
     ceil: (__val) => Math.ceil(Number(__val)),
     default: (__val, __fallback) => __val ?? __fallback,
     length: (__val) => (Array.isArray(__val) || typeof __val === 'string' ? __val.length : 0),
     json: (__val) => JSON.stringify(__val),
     slice: (__val, __start, __end) => (typeof __val === 'string' || Array.isArray(__val) ? __val.slice(__start, __end) : __val),
     replace: (__str, __search, __replace) => String(__str).replace(__search, __replace),
     join: (__arr, __delimiter = ',') => (Array.isArray(__arr) ? __arr.join(__delimiter) : __arr),
     split: (__str, __delimiter = ',') => String(__str).split(__delimiter),
     reverse: (__val) => (Array.isArray(__val) ? [...__val].reverse() : String(__val).split('').reverse().join('')),
     includes: (__val, __needle) => (Array.isArray(__val) || typeof __val === 'string' ? __val.includes(__needle) : false),
     startsWith: (__str, __prefix) => String(__str).startsWith(__prefix),
     endsWith: (__str, __suffix) => String(__str).endsWith(__suffix),
     stripHtml: (__str) => String(__str).replace(/<[^>]*>/g, ''),
     pluralize: (__word, __count) => (__count === 1 ? __word : __word + 's'),
     truncate: (__str, __length = 100, __suffix = '...') => {
          __str = String(__str);
          return __str.length > length ? __str.slice(0, __length) + __suffix : __str;
     },
     pad: (__str, __length = 10, __char = ' ') => {
          __str = String(__str);
          return __str.length >= __length ? __str : __str + __char.repeat(__length - __str.length);
     },
     padLeft: (__str, __length = 10, __char = ' ') => {
          __str = String(__str);
          return __str.length >= length ? __str : __char.repeat(__length - __str.length) + __str;
     },
     highlightMatch: (__text, __query) => {
          if (!__query) return __text;
          const regex = new RegExp(__query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          return String(__text).replace(regex, (__match) => `<mark>${__match}</mark>`);
     },
     escapeHtml: (__str) => String(__str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'),
     camelCase: (__str) => {
          return String(__str)
               .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
               .replace(/^(.)/, (c) => c.toLowerCase());
     },
     slugify: (__str) => {
          return String(__str)
               .toLowerCase()
               .trim()
               .replace(/[\s\W-]+/g, '-')
               .replace(/^-+|-+$/g, '');
     },
     formatBytes: (__bytes, __decimals = 2) => {
          if (__bytes === 0) return '0 Bytes';
          const k = 1024;
          const dm = __decimals < 0 ? 0 : __decimals;
          const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return parseFloat((__bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
     },
     deburr: (__str) =>
          String(__str)
               .normalize('NFD')
               .replace(/[\u0300-\u036f]/g, ''),

     localizeDate: (__date, __locale = 'en-US', __options = {}) => {
          try {
               return new Date(date).toLocaleDateString(__locale, __options);
          } catch {
               return __date;
          }
     },
     normalize: (__str) => {
          return String(__str)
               .normalize('NFD')
               .replace(/[\u0300-\u036f]/g, '') // remove accents
               .toLowerCase()
               .trim()
               .replace(/\s+/g, ' '); // collapse multiple spaces
     },
     ordinal: (__n) => {
          __n = Number(__n);
          const suffix = ['th', 'st', 'nd', 'rd'];
          const v = __n % 100;
          return __n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
     },
     mask: (__str, __pattern = '**** **** **** ####') => {
          __str = String(__str).replace(/\D/g, '');
          let i = 0;
          return __pattern.replace(/#/g, () => __str[i++] || '#');
     },
     shortenUrl: (__url) => {
          try {
               const { hostname } = new URL(__url);
               return hostname.replace(/^www\./, '');
          } catch {
               return __url;
          }
     },
};
