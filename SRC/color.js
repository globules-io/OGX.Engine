OGX.Color = {};

OGX.Color.hexToRgb = function (__hex) {
     let reg = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
     __hex = __hex.replace(reg, (m, r, g, b) => {
          return r + r + g + g + b + b;
     });
     let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(__hex);
     return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
};

OGX.Color.rgbToHex = function (__rgb, __g, __b) {
     if (arguments.length > 1) {
          __rgb = __rgb + ', ' + __g + ', ' + __b;
     }
     let r, g, b;
     if (typeof __rgb === 'object') {
          if (!Array.isArray(__rgb)) {
               __rgb = __rgb.r + ' ' + __rgb.g + ' ' + __rgb.b;
          } else {
               __rgb = __rgb.join(',');
          }
     }
     let reg = /(\d+)[ ,]*(\d+)[ ,]*(\d+)/g;
     let match = reg.exec(__rgb);
     if (match) {
          match.shift();
          r = Number(match[0]);
          g = Number(match[1]);
          b = Number(match[2]);
     }
     return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

OGX.Color.rgbToHsl = function (__rgb, __g, __b) {
     if (arguments.length > 1) {
          __rgb = __rgb + ', ' + __g + ', ' + __b;
     }
     let r, g, b;
     if (typeof __rgb === 'object') {
          if (!Array.isArray(__rgb)) {
               __rgb = __rgb.r + ' ' + __rgb.g + ' ' + __rgb.b;
          } else {
               __rgb = __rgb.join(',');
          }
     }
     let reg = /(\d+)[ ,]*(\d+)[ ,]*(\d+)/g;
     let match = reg.exec(__rgb);
     if (match) {
          match.shift();
          r = match[0];
          g = match[1];
          b = match[2];
          (r /= 255), (g /= 255), (b /= 255);
          let max = Math.max(r, g, b),
               min = Math.min(r, g, b);
          let h,
               s,
               l = (max + min) / 2;
          if (max === min) {
               h = s = 0;
          } else {
               let d = max - min;
               s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
               switch (max) {
                    case r:
                         h = (g - b) / d + (g < b ? 6 : 0);
                         break;
                    case g:
                         h = (b - r) / d + 2;
                         break;
                    case b:
                         h = (r - g) / d + 4;
                         break;
               }
               h /= 6;
          }
          return [h, s, l];
     }
     return false;
};

OGX.Color.hslToRgb = function (h, s, l) {
     if (arguments.length === 1) {
          if (typeof h === 'object') {
               if (!Array.isArray(h)) {
                    l = h.l;
                    s = h.s;
                    h = h.h;
               } else {
                    l = h[2];
                    s = h[1];
                    h = h[0];
               }
          } else {
               if (typeof h === 'string') {
                    let reg = /([0-9\.]+)[ ,]*([0-9\.]+)[ ,]*([0-9\.]+)/g;
                    let match = reg.exec(h);
                    if (match) {
                         match.shift();
                         h = Number(match[0]);
                         s = Number(match[1]);
                         l = Number(match[2]);
                    }
               }
          }
     }
     let r, g, b;
     if (s === 0) {
          r = g = b = l;
     } else {          
          let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          let p = 2 * l - q;
          r = OGX.Color.hueToRgb(p, q, h + 1 / 3);
          g = OGX.Color.hueToRgb(p, q, h);
          b = OGX.Color.hueToRgb(p, q, h - 1 / 3);
     }
     return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

OGX.Color.hueToRgb = function(p, q, t) {
     if (t < 0) t += 1;
     if (t > 1) t -= 1;
     if (t < 1 / 6) return p + (q - p) * 6 * t;
     if (t < 1 / 2) return q;
     if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
     return p;
};

OGX.Color.formatHex = function (__hex) {
     __hex.slice(0, 1) === '#' ? (__hex = __hex.slice(1)) : null;
     if (__hex.length > 3) {
          return '#' + __hex;
     }
     __hex.split('').map((__s) => {
          return __s + __s;
     });
     return '#' + __hex;
};
