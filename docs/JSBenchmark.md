## JavaScript engine benckmarks

Digitransit-ui UX depends on browser JS engine performance. In here, we keep track of some devices that were tested with http://browserbench.org/JetStream/

## Results

| Device                              | Result |
|-------------------------------------|--------|
| MBP i7 (Chrome)                     | 182    |
| i7-5500U CPU @ 2.40GHz (Chromium)   | 159    |
| iPhone 6s (WKWebView)               | 120    |
| MBP i5 (Chrome)                     | 111    |
| iPad Air 2 (Safari)                 | 60     |
| Xperia Z5C (Chrome)                 | 47     |
| LG G2 (Chrome)                      | 31     |
| 1+1 "2014 Flagship killer" (Chrome) | 31     |
| Honor 5 (Chrome)                    | 30     |
| Lumia 650 (Edge)                    | 15     |
| Lumia 635 (IE)                      | 11     |

## Analysis

It seems that JetStream benchmark 30 is the threshold where application becomes usable. Below 30, it feels laggy. Results 50 or above seem to give good UX.
