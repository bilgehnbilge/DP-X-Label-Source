# DP | X Source Label

X'in tweet verisinde hâlâ duran `source` alanını ("Twitter for iPhone", "Twitter Web Client" vb.) tweet zaman damgasının yanında gösteren tarayıcı eklentisi. Chrome (ve Edge/Brave) ile Firefox için.

> **Önemli sınır:** X, `source` alanını Eylül 2026'dan itibaren yeni gönderilerde döndürmüyor. Etiket yalnızca X'in hâlâ verdiği **eski gönderilerde** ve bazı retweet'lerde görünür. Alan eski gönderilerden de kademeli silinmiş görünüyor, bu yüzden aynı sayfada bir tweet etiketli, diğeri etiketsiz olabilir.

## Kurulum

Önce paketleri üretin (`zip` gerekir):

```sh
./scripts/build.sh
```

**Chrome / Edge / Brave:** `dist/dp-x-source-label-chrome.zip` dosyasını bir klasöre çıkarın → `chrome://extensions` → Geliştirici modu → *Paketlenmemiş öğe yükle*. Chrome 111+.

**Firefox 142+:** `about:debugging#/runtime/this-firefox` → *Geçici Eklenti Yükle* → `dist/dp-x-source-label-firefox.xpi`. Geçici kurulum Firefox kapanınca silinir; kalıcı kurulum için eklentinin addons.mozilla.org'dan imzalanması (unlisted) ya da Developer Edition/Nightly gerekir.

## Nasıl çalışır

- `src/injected.js` sayfanın kendi `fetch`/XHR cevaplarını pasif olarak dinler. X'e ek istek atmaz.
- Cevap JSON'unda `rest_id` + `source` taşıyan tweet nesnelerini bulur.
- `src/content.js` bu eşlemeyi saklar ve zaman damgasının yanına etiket koyar.
- Eklenti hiçbir veri toplamaz ya da göndermez; ayarlar tarayıcının `storage.sync` alanında tutulur.

## Bilinen sınırlar

- X'in dahili (belgelenmemiş) cevap yapısına dayanır; X yapıyı değiştirirse çalışmayı bırakabilir.
- Linkteki `s=` parametresi gönderinin cihazını **göstermez**; linkin kopyalandığı yeri gösterir. Bu eklenti `s=` değerini kullanmaz.
- X'in geliştirici/otomasyon kurallarına uyumu sizin sorumluluğunuzdadır.

## Test

```sh
node test/extract.test.js
```

---

bilgehnbilge tarafından oluşturuldu
