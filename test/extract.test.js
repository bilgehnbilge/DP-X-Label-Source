const assert = require("assert");
const path = require("path");
const { parseSource, extractSources } = require(path.join(__dirname, "../src/injected.js"));

// parseSource
assert.strictEqual(
  parseSource('<a href="http://twitter.com" rel="nofollow">Twitter Web Client</a>'),
  "Twitter Web Client"
);
assert.strictEqual(
  parseSource('<a href="http://twitter.com/download/iphone" rel="nofollow">Twitter for iPhone</a>'),
  "Twitter for iPhone"
);
assert.strictEqual(parseSource('<a href="x">Foo &amp; Bar</a>'), "Foo & Bar");
assert.strictEqual(parseSource(""), null);
assert.strictEqual(parseSource(null), null);
assert.strictEqual(parseSource(42), null);

// Gerçek cevabın yapısına benzer fixture: SearchTimeline
const search = {
  data: { search_by_raw_query: { search_timeline: { timeline: { instructions: [{
    entries: [
      { content: { itemContent: { tweet_results: { result: {
        __typename: "Tweet",
        rest_id: "1080168040904437762",
        source: '<a href="http://twitter.com" rel="nofollow">Twitter Web Client</a>',
        legacy: { id_str: "1080168040904437762", full_text: "..." }
      } } } } },
      { content: { itemContent: { tweet_results: { result: {
        __typename: "Tweet",
        rest_id: "1080160174470586368",
        legacy: { id_str: "1080160174470586368", full_text: "kaynak alanı yok" }
      } } } } }
    ]
  }] } } } }
};
let r = extractSources(search);
assert.deepStrictEqual(r, { "1080168040904437762": "Twitter Web Client" });

// Retweet: dış tweet kaynaksız, içteki retweet edilen tweet kaynaklı
const rt = {
  result: {
    rest_id: "2106770571920871655",
    source: '<a href="http://twitter.com/download/iphone" rel="nofollow">Twitter for iPhone</a>',
    legacy: {
      id_str: "2106770571920871655",
      retweeted_status_result: { result: {
        rest_id: "2105000000000000000",
        legacy: { id_str: "2105000000000000000", source: '<a href="x">Twitter for Android</a>' }
      } }
    }
  }
};
r = extractSources(rt);
assert.strictEqual(r["2106770571920871655"], "Twitter for iPhone");
assert.strictEqual(r["2105000000000000000"], "Twitter for Android");

// Boş / saçma girdiler çökmemeli
assert.deepStrictEqual(extractSources(null), {});
assert.deepStrictEqual(extractSources([]), {});
assert.deepStrictEqual(extractSources({ rest_id: "abc", source: "<a>x</a>" }), {});

// Döngüsel referans çökmemeli
const cyc = { rest_id: "123", source: "<a>Web</a>" };
cyc.self = cyc;
assert.deepStrictEqual(extractSources(cyc), { "123": "Web" });

console.log("tüm testler geçti");
