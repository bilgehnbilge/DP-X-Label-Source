# DP | X Source Label

X'in tweet verisinde hâlâ duran `source` alanını ("Twitter for iPhone", "Twitter Web Client" vb.) tweet zaman damgasının yanında gösteren tarayıcı eklentisi. Chrome (ve Edge/Brave) ile Firefox için.

> **Önemli sınır:** X, `source` alanını Eylül 2026'dan itibaren yeni gönderilerde döndürmüyor. Etiket yalnızca X'in hâlâ verdiği **eski gönderilerde** ve bazı retweet'lerde görünür. Alan eski gönderilerden de kademeli silinmiş görünüyor, bu yüzden aynı sayfada bir tweet etiketli, diğeri etiketsiz olabilir.

## Kurulum

Hazır paketler [Releases](https://github.com/bilgehnbilge/DP-X-Label-Source/releases/latest) sayfasında. İhtiyacınız olan dosyayı indirin:

**Firefox 142+** → `dp-x-source-label-firefox.xpi`
1. `about:debugging#/runtime/this-firefox` adresini açın.
2. *Geçici Eklenti Yükle* düğmesine basın ve indirdiğiniz `.xpi` dosyasını seçin.

Dosyaya çift tıklamayın ya da Firefox penceresine sürüklemeyin: eklenti imzasız olduğu için Firefox bu yoldan kurmayı reddeder. Geçici kurulum Firefox kapanınca silinir. Kalıcı kurulum için eklentinin addons.mozilla.org'dan imzalanması (unlisted) ya da Firefox Developer Edition/Nightly gerekir.

**Chrome 111+ / Edge / Brave** → `dp-x-source-label-chrome.zip`
1. Zip'i bir klasöre çıkarın (`manifest.json` doğrudan o klasörün içinde olmalı).
2. `chrome://extensions` adresini açın ve *Geliştirici modu*'nu açın.
3. *Paketlenmemiş öğe yükle* ile o klasörü seçin.

Kurulumdan sonra x.com'da, 2019 gibi eski bir tweet'i açın. Zaman damgasının yanında "· Twitter Web Client" gibi bir etiket görmelisiniz. Yeni tweet'lerde etiket çıkmaz (yukarıdaki not).

## Geliştirme

Paketleri kaynak koddan üretmek için (`zip` gerekir):

```sh
./scripts/build.sh   # dist/ altına .zip (Chrome) ve .xpi (Firefox) üretir
```

Testler (Node.js gerekir):

```sh
node test/extract.test.js
```

Test, JSON cevabından `source` alanını çıkaran mantığı sınar. Etiketin sayfada doğru yere oturduğu tarayıcıda elle kontrol edilir.

## Nasıl çalışır

- `src/injected.js` sayfanın kendi `fetch`/XHR cevaplarını pasif olarak dinler. X'e ek istek atmaz.
- Cevap JSON'unda `rest_id` + `source` taşıyan tweet nesnelerini bulur.
- `src/content.js` bu eşlemeyi saklar ve zaman damgasının yanına etiket koyar.
- Eklenti hiçbir veri toplamaz ya da göndermez; ayarlar tarayıcının `storage.sync` alanında tutulur.

## Bilinen sınırlar

- X'in dahili (belgelenmemiş) cevap yapısına dayanır; X yapıyı değiştirirse çalışmayı bırakabilir.
- Linkteki `s=` parametresi gönderinin cihazını **göstermez**; linkin kopyalandığı yeri gösterir. Bu eklenti `s=` değerini kullanmaz.
- X'in geliştirici/otomasyon kurallarına uyumu sizin sorumluluğunuzdadır.

---

bilgehnbilge tarafından oluşturuldu
